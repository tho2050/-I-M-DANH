using GpsAttendance.Models;
using Microsoft.EntityFrameworkCore;

namespace GpsAttendance.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<EventActivity> EventActivities { get; set; }
        public DbSet<ActivityAttendance> ActivityAttendances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EventActivity>()
                .HasIndex(e => e.ActivityCode)
                .IsUnique();

            // Seed data mẫu
            modelBuilder.Entity<EventActivity>().HasData(
                new EventActivity
                {
                    Id = 1,
                    ActivityCode = "SVTN2026",
                    Title = "Lễ Tốt Nghiệp Khóa 2026",
                    Description = "Lễ trao bằng tốt nghiệp cho sinh viên khóa 2022-2026. Vui lòng có mặt đúng giờ.",
                    LocationAddress = "Hội trường A1 - Đại học Bách Khoa TP.HCM",
                    Latitude = 10.7725,
                    Longitude = 106.6581,
                    RadiusMeters = 150,
                    StartTime = new DateTime(2026, 8, 27, 7, 0, 0),
                    EndTime = new DateTime(2026, 8, 27, 17, 0, 0),
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 8, 20, 10, 0, 0)
                },
                new EventActivity
                {
                    Id = 2,
                    ActivityCode = "WORKSHOP-AI",
                    Title = "Workshop: Ứng dụng AI trong Giáo dục",
                    Description = "Hội thảo chuyên đề về ứng dụng trí tuệ nhân tạo trong giảng dạy và nghiên cứu.",
                    LocationAddress = "Phòng 301 - Nhà C6, ĐHQG Hà Nội",
                    Latitude = 21.0388,
                    Longitude = 105.7828,
                    RadiusMeters = 100,
                    StartTime = new DateTime(2026, 8, 28, 8, 30, 0),
                    EndTime = new DateTime(2026, 8, 28, 16, 30, 0),
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 8, 21, 14, 0, 0)
                },
                new EventActivity
                {
                    Id = 3,
                    ActivityCode = "TINHOC-ABC",
                    Title = "Thi Tin học Ứng dụng Cơ bản",
                    Description = "Kỳ thi đánh giá năng lực tin học ứng dụng văn phòng cho sinh viên năm 2.",
                    LocationAddress = "Phòng máy tính B2.01 - Đại học Cần Thơ",
                    Latitude = 10.0299,
                    Longitude = 105.7707,
                    RadiusMeters = 80,
                    StartTime = new DateTime(2026, 9, 1, 9, 0, 0),
                    EndTime = new DateTime(2026, 9, 1, 11, 0, 0),
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 8, 22, 9, 0, 0)
                }
            );
        }
    }
}
