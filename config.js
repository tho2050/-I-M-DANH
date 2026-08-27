// CẤU HÌNH HỆ THỐNG ĐIỂM DANH GPS
const CONFIG = {
    // 1. LINK GOOGLE FORM CỦA BẠN (Sử dụng link submit ngầm)
    // Bạn sẽ thay thế link này và các Entry ID sau khi tạo Google Form
    googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfD_YOUR_FORM_ID/formResponse",
    
    formFields: {
        activityCode: "entry.111111111", // Thay bằng Entry ID tương ứng
        studentCode: "entry.222222222",
        fullName: "entry.333333333",
        className: "entry.444444444",
        faculty: "entry.555555555",
        phoneNumber: "entry.666666666",
        email: "entry.777777777",
        gpsCoords: "entry.888888888", // Ví dụ: 10.7725, 106.6581
        distance: "entry.999999999",  // Khoảng cách (mét)
        deviceInfo: "entry.101010101"  // Thông tin thiết bị
    },

    // 2. DANH SÁCH CÁC SỰ KIỆN / HOẠT ĐỘNG
    activities: [
        {
            code: "SVTN2026",
            title: "Lễ Tốt Nghiệp Khóa 2026",
            description: "Lễ trao bằng tốt nghiệp cho sinh viên khóa 2022-2026. Vui lòng có mặt đúng giờ.",
            locationAddress: "Hội trường A1 - Đại học Bách Khoa TP.HCM",
            latitude: 10.7725,
            longitude: 106.6581,
            radiusMeters: 150,
            startTime: "07:00 27/08/2026",
            endTime: "17:00 27/08/2026"
        },
        {
            code: "WORKSHOP-AI",
            title: "Workshop: Ứng dụng AI trong Giáo dục",
            description: "Hội thảo chuyên đề về ứng dụng trí tuệ nhân tạo trong giảng dạy và nghiên cứu.",
            locationAddress: "Phòng 301 - Nhà C6, ĐHQG Hà Nội",
            latitude: 21.0388,
            longitude: 105.7828,
            radiusMeters: 100,
            startTime: "08:30 28/08/2026",
            endTime: "16:30 28/08/2026"
        },
        {
            code: "TINHOC-ABC",
            title: "Thi Tin học Ứng dụng Cơ bản",
            description: "Kỳ thi đánh giá năng lực tin học ứng dụng văn phòng cho sinh viên năm 2.",
            locationAddress: "Phòng máy tính B2.01 - Đại học Cần Thơ",
            latitude: 10.0299,
            longitude: 105.7707,
            radiusMeters: 80,
            startTime: "09:00 01/09/2026",
            endTime: "11:00 01/09/2026"
        }
    ]
};
