using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GpsAttendance.Models
{
    public class ActivityAttendance
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("EventActivity")]
        public int EventActivityId { get; set; }

        [Required]
        [MaxLength(50)]
        public string StudentCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string ClassName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Faculty { get; set; } = string.Empty;

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        public DateTime CheckInTime { get; set; } = DateTime.Now;

        public double StudentLatitude { get; set; }
        public double StudentLongitude { get; set; }
        public double DistanceMeters { get; set; }
        public bool IsValidLocation { get; set; }

        [MaxLength(200)]
        public string DeviceInfo { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Note { get; set; } = string.Empty;

        // Navigation
        public EventActivity? EventActivity { get; set; }
    }
}
