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

// Hàm lấy danh sách hoạt động (tự động lọc bỏ các sự kiện mẫu cũ nếu còn tồn tại trong bộ nhớ)
function getActivities() {
    const local = localStorage.getItem("gps_attendance_activities");
    if (local) {
        try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
                // Tự động xóa bỏ 3 sự kiện mẫu cũ nếu còn dính trong LocalStorage của máy
                const filtered = parsed.filter(a => a && a.code !== "SVTN2026" && a.code !== "WORKSHOP-AI" && a.code !== "TINHOC-ABC");
                if (filtered.length !== parsed.length) {
                    localStorage.setItem("gps_attendance_activities", JSON.stringify(filtered));
                    return filtered;
                }
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
    const cleanList = (list || []).filter(a => a && a.code !== "SVTN2026" && a.code !== "WORKSHOP-AI" && a.code !== "TINHOC-ABC");
    localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanList));
    
    if (CONFIG.googleScriptUrl) {
        // Gửi dữ liệu qua GET query param kèm timestamp chống cache trên trình duyệt di động
        const encodedData = encodeURIComponent(JSON.stringify(cleanList));
        fetch(CONFIG.googleScriptUrl + '?action=saveActivities&data=' + encodedData + '&_t=' + Date.now())
            .then(res => res.json())
            .then(data => console.log("Đã đồng bộ sự kiện lên Google Sheets:", data))
            .catch(e => console.error("Lỗi đồng bộ lên cloud:", e));
    }
}

// Đồng bộ danh sách hoạt động từ Google Sheets về LocalStorage (chạy ngầm, chống cache di động)
function syncActivitiesFromCloud(callback) {
    if (!CONFIG.googleScriptUrl) return;
    fetch(CONFIG.googleScriptUrl + "?action=getActivities&_t=" + Date.now())
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                const cleanData = data.filter(a => a && a.code !== "SVTN2026" && a.code !== "WORKSHOP-AI" && a.code !== "TINHOC-ABC");
                localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanData));
                if (callback) callback(cleanData);
            }
        })
        .catch(err => console.error("Lỗi đồng bộ danh sách sự kiện từ cloud:", err));
}
