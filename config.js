// CẤU HÌNH HỆ THỐNG ĐIỂM DANH GPS
const CONFIG = {
    // Mật khẩu trang quản trị (Admin Panel)
    adminPassword: "admin123",

    // Link Google Sheets kết quả (để Admin click xem trực tiếp)
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/12IFrgjYT7qGWXe9lXtcE-oRrmz-BU9ga-m9nYacTlCA/edit",

    // Link Web App Google Apps Script để ghi và đọc dữ liệu điểm danh
    googleScriptUrl: "https://script.google.com/macros/s/AKfycbxzYoL4hhUYiBaQfZFI7o3oPIU8OWx7ZYrc3v-hgu_EXDu-QKpaWfOQCk8nxqmaqK6i/exec",

    // 2. DANH SÁCH CÁC SỰ KIỆN / HOẠT ĐỘNG MẶC ĐỊNH (Để trống để ưu tiên lấy trực tiếp từ Google Sheets)
    activities: []
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
    return CONFIG.activities;
}

// Hàm lưu danh sách hoạt động mới vào localStorage và đồng bộ lên Google Sheet cloud
function saveActivities(list) {
    localStorage.setItem("gps_attendance_activities", JSON.stringify(list));
    if (CONFIG.googleScriptUrl) {
        // Gửi dữ liệu qua GET query param để tương thích 100% trên trình duyệt di động (tránh lỗi 302 redirect của trình duyệt mobile)
        const encodedData = encodeURIComponent(JSON.stringify(list));
        fetch(CONFIG.googleScriptUrl + '?action=saveActivities&data=' + encodedData)
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
            if (Array.isArray(data)) {
                localStorage.setItem("gps_attendance_activities", JSON.stringify(data));
                if (callback) callback(data);
            }
        })
        .catch(err => console.error("Lỗi đồng bộ danh sách sự kiện từ cloud:", err));
}
