// CẤU HÌNH HỆ THỐNG ĐIỂM DANH GPS
const CONFIG = {
    // Mật khẩu trang quản trị (Admin Panel)
    adminPassword: "admin123",

    // Link Google Sheets kết quả (để Admin click xem trực tiếp)
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/12IFrgjYT7qGWXe9lXtcE-oRrmz-BU9ga-m9nYacTlCA/edit",

    // Link Web App Google Apps Script để ghi và đọc dữ liệu điểm danh
    googleScriptUrl: "https://script.google.com/macros/s/AKfycbxzYoL4hhUYiBaQfZFI7o3oPIU8OWx7ZYrc3v-hgu_EXDu-QKpaWfOQCk8nxqmaqK6i/exec",

    // 2. DANH SÁCH CÁC SỰ KIỆN / HOẠT ĐỘNG MẶC ĐỊNH
    activities: [
        {
            code: "SVTN2026",
            title: "Lễ Tốt Nghiệp Khóa 2026",
            description: "Lễ trao bằng tốt nghiệp cho sinh viên khóa 2022-2026. Vui lòng có mặt đúng giờ.",
            locationAddress: "Hội trường A1 - Đại học Bách Khoa TP.HCM",
            latitude: 10.7725,
            longitude: 106.6581,
            radiusMeters: 50, // Mặc định 50m theo đề xuất
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
            radiusMeters: 50, // Mặc định 50m
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
            radiusMeters: 50, // Mặc định 50m
            startTime: "09:00 01/09/2026",
            endTime: "11:00 01/09/2026"
        }
    ]
};

// Hàm lấy danh sách hoạt động (ưu tiên localStorage, nếu không có lấy mặc định từ CONFIG)
function getActivities() {
    const local = localStorage.getItem("gps_attendance_activities");
    if (local) {
        try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error("Lỗi parse dữ liệu activities từ localStorage, tiến hành reset", e);
            localStorage.removeItem("gps_attendance_activities");
        }
    }
    // Nếu chưa có trong local hoặc bị lỗi parse, khởi tạo bằng danh sách mặc định
    localStorage.setItem("gps_attendance_activities", JSON.stringify(CONFIG.activities));
    return CONFIG.activities;
}

// Hàm lưu danh sách hoạt động mới vào localStorage và đồng bộ lên Google Sheet cloud
function saveActivities(list) {
    localStorage.setItem("gps_attendance_activities", JSON.stringify(list));
    if (CONFIG.googleScriptUrl) {
        fetch(CONFIG.googleScriptUrl + '?action=saveActivities', {
            method: 'POST',
            body: JSON.stringify(list)
        })
        .then(res => res.json())
        .then(data => console.log("Đã đồng bộ sự kiện lên Google Sheets:", data))
        .catch(e => console.error("Lỗi đồng bộ lên cloud:", e));
    }
}

// Đồng bộ danh sách hoạt động từ Google Sheets về LocalStorage (chạy ngầm)
function syncActivitiesFromCloud(callback) {
    if (!CONFIG.googleScriptUrl) return;
    fetch(CONFIG.googleScriptUrl + "?action=getActivities")
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                localStorage.setItem("gps_attendance_activities", JSON.stringify(data));
                if (callback) callback(data);
            }
        })
        .catch(err => console.error("Lỗi đồng bộ danh sách sự kiện từ cloud:", err));
}
