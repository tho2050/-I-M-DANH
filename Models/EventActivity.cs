using System.ComponentModel.DataAnnotations;

namespace GpsAttendance.Models
{
    public class EventActivity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActivityCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(300)]
        public string LocationAddress { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int RadiusMeters { get; set; } = 100;

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        public ICollection<ActivityAttendance> Attendances { get; set; } = new List<ActivityAttendance>();
    }
}
