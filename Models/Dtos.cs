namespace GpsAttendance.Models
{
    public class ValidateGpsRequestDto
    {
        public int ActivityId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class ValidateGpsResultDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public double DistanceMeters { get; set; }
        public int MaxRadiusMeters { get; set; }
        public double TargetLatitude { get; set; }
        public double TargetLongitude { get; set; }
        public string LocationAddress { get; set; } = string.Empty;
        public string ActivityTitle { get; set; } = string.Empty;
    }

    public class SubmitActivityCheckInDto
    {
        public int ActivityId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? ClassName { get; set; }
        public string? Faculty { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? DeviceInfo { get; set; }
    }

    public class ActivityListItemViewModel
    {
        public int Id { get; set; }
        public string ActivityCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string LocationAddress { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int RadiusMeters { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsActive { get; set; }
        public int AttendancesCount { get; set; }
    }
}
