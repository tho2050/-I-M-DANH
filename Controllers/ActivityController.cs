using GpsAttendance.Data;
using GpsAttendance.Models;
using GpsAttendance.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GpsAttendance.Controllers
{
    public class ActivityController : Controller
    {
        private readonly AppDbContext _context;

        public ActivityController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /Activity
        public async Task<IActionResult> Index()
        {
            var activities = await _context.EventActivities
                .Where(e => e.IsActive)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new ActivityListItemViewModel
                {
                    Id = e.Id,
                    ActivityCode = e.ActivityCode,
                    Title = e.Title,
                    Description = e.Description,
                    LocationAddress = e.LocationAddress,
                    Latitude = e.Latitude,
                    Longitude = e.Longitude,
                    RadiusMeters = e.RadiusMeters,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsActive = e.IsActive,
                    AttendancesCount = e.Attendances.Count(a => a.IsValidLocation)
                })
                .ToListAsync();

            return View(activities);
        }

        // GET: /Activity/Scan
        public IActionResult Scan()
        {
            return View();
        }

        // GET: /Activity/CheckIn/{code}
        [HttpGet("Activity/CheckIn/{code}")]
        public async Task<IActionResult> CheckIn(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return RedirectToAction("Index");

            var activity = await _context.EventActivities
                .FirstOrDefaultAsync(e => e.ActivityCode.ToLower() == code.Trim().ToLower());

            if (activity == null)
            {
                ViewBag.ErrorMessage = $"Không tìm thấy hoạt động có mã '{code}'.";
                return View("NotFound");
            }

            if (!activity.IsActive)
            {
                ViewBag.ErrorMessage = $"Hoạt động '{activity.Title}' hiện đang TẠM KHÓA điểm danh.";
                return View("NotFound");
            }

            return View(activity);
        }

        // POST: /Activity/ValidateGps
        [HttpPost]
        [Route("Activity/ValidateGps")]
        public async Task<IActionResult> ValidateGps([FromBody] ValidateGpsRequestDto req)
        {
            if (req == null || req.ActivityId <= 0)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

            var activity = await _context.EventActivities.FindAsync(req.ActivityId);
            if (activity == null)
                return NotFound(new { success = false, message = "Không tìm thấy hoạt động." });

            double distance = GpsHelper.CalculateDistanceMeters(
                req.Latitude, req.Longitude,
                activity.Latitude, activity.Longitude
            );

            bool isValid = distance <= activity.RadiusMeters;

            return Ok(new ValidateGpsResultDto
            {
                IsValid = isValid,
                Message = isValid
                    ? $"✅ Định vị HỢP LỆ! Cách địa điểm {distance:F1}m (Bán kính {activity.RadiusMeters}m)."
                    : $"❌ KHÔNG HỢP LỆ: Cách {distance:F1}m (Vượt quá {activity.RadiusMeters}m tại '{activity.LocationAddress}').",
                DistanceMeters = Math.Round(distance, 1),
                MaxRadiusMeters = activity.RadiusMeters,
                TargetLatitude = activity.Latitude,
                TargetLongitude = activity.Longitude,
                LocationAddress = activity.LocationAddress,
                ActivityTitle = activity.Title
            });
        }

        // POST: /Activity/SubmitCheckIn
        [HttpPost]
        [Route("Activity/SubmitCheckIn")]
        public async Task<IActionResult> SubmitCheckIn([FromBody] SubmitActivityCheckInDto req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.StudentCode) || string.IsNullOrWhiteSpace(req.FullName))
                return BadRequest(new { success = false, message = "Vui lòng điền đầy đủ MSSV và Họ tên." });

            var activity = await _context.EventActivities.FindAsync(req.ActivityId);
            if (activity == null || !activity.IsActive)
                return BadRequest(new { success = false, message = "Hoạt động không tồn tại hoặc đã kết thúc." });

            var existingRecord = await _context.ActivityAttendances
                .FirstOrDefaultAsync(a => a.EventActivityId == req.ActivityId &&
                                          a.StudentCode.ToLower() == req.StudentCode.Trim().ToLower() &&
                                          a.IsValidLocation);

            if (existingRecord != null)
            {
                return Ok(new
                {
                    success = false,
                    isDuplicate = true,
                    message = $"Sinh viên {existingRecord.FullName} ({existingRecord.StudentCode}) ĐÃ ĐIỂM DANH lúc {existingRecord.CheckInTime:HH:mm:ss dd/MM/yyyy}."
                });
            }

            double distance = GpsHelper.CalculateDistanceMeters(
                req.Latitude, req.Longitude,
                activity.Latitude, activity.Longitude
            );

            if (distance > activity.RadiusMeters)
            {
                return Ok(new
                {
                    success = false,
                    message = $"Vị trí GPS không hợp lệ (Cách {distance:F1}m, vượt quá {activity.RadiusMeters}m)."
                });
            }

            var attendance = new ActivityAttendance
            {
                EventActivityId = activity.Id,
                StudentCode = req.StudentCode.Trim().ToUpper(),
                FullName = req.FullName.Trim(),
                ClassName = req.ClassName?.Trim() ?? string.Empty,
                Faculty = req.Faculty?.Trim() ?? string.Empty,
                PhoneNumber = req.PhoneNumber?.Trim() ?? string.Empty,
                Email = req.Email?.Trim() ?? string.Empty,
                CheckInTime = DateTime.Now,
                StudentLatitude = req.Latitude,
                StudentLongitude = req.Longitude,
                DistanceMeters = Math.Round(distance, 1),
                IsValidLocation = true,
                DeviceInfo = req.DeviceInfo ?? "Mobile Web Browser",
                Note = $"Điểm danh hợp lệ: Cách tâm {distance:F1}m tại {activity.LocationAddress}"
            };

            _context.ActivityAttendances.Add(attendance);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"🎉 {attendance.FullName} ({attendance.StudentCode}) điểm danh THÀNH CÔNG '{activity.Title}'!",
                checkInTime = attendance.CheckInTime.ToString("HH:mm:ss dd/MM/yyyy"),
                distanceMeters = attendance.DistanceMeters,
                locationAddress = activity.LocationAddress
            });
        }
    }
}
