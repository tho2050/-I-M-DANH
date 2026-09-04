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

// Hàm hỗ trợ lọc trùng lặp danh sách sự kiện theo Mã sự kiện (code) hoặc Tên sự kiện (title)
function deduplicateActivities(list) {
    if (!Array.isArray(list)) return [];
    const unique = [];
    const seenKeys = new Set();
    const oldSampleCodes = ["SVTN2026", "WORKSHOP-AI", "TINHOC-ABC"];

    // Duyệt từ bản ghi mới nhất đến cũ nhất
    for (let i = list.length - 1; i >= 0; i--) {
        const item = list[i];
        if (!item) continue;
        const code = item.code ? String(item.code).trim().toUpperCase() : '';
        const title = item.title ? String(item.title).trim().toUpperCase() : '';
        
        // Bỏ qua các sự kiện mẫu cũ mặc định
        if (oldSampleCodes.includes(code)) continue;

        // Khóa định danh duy nhất (ưu tiên theo mã code, nếu không có mã thì theo tên title)
        const key = code || title;
        if (!key) continue;

        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            unique.unshift(item);
        }
    }
    return unique;
}

// Hàm lấy danh sách hoạt động (tự động lọc bỏ trùng lặp và các sự kiện mẫu cũ)
function getActivities() {
    const local = localStorage.getItem("gps_attendance_activities");
    if (local) {
        try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
                const cleanData = deduplicateActivities(parsed);
                if (cleanData.length !== parsed.length) {
                    localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanData));
                }
                return cleanData;
            }
        } catch (e) {
            console.error("Lỗi parse dữ liệu activities từ localStorage, tiến hành reset", e);
            localStorage.removeItem("gps_attendance_activities");
        }
    }
    return deduplicateActivities(CONFIG.activities || []);
}

// Hàm lưu danh sách hoạt động mới vào localStorage và đồng bộ lên Google Sheet cloud
function saveActivities(list) {
    const cleanList = deduplicateActivities(list);
    localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanList));
    
    if (!CONFIG.googleScriptUrl) return;

    const payload = JSON.stringify(cleanList);
    
    // Gửi duy nhất 1 request POST đến Google Apps Script
    fetch(CONFIG.googleScriptUrl + '?action=saveActivities', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload
    })
    .then(res => res.json())
    .then(data => console.log("Đã đồng bộ sự kiện lên Google Sheets:", data))
    .catch(err => {
        console.warn("POST saveActivities thất bại, thử dùng GET dự phòng:", err);
        const encodedData = encodeURIComponent(payload);
        fetch(CONFIG.googleScriptUrl + '?action=saveActivities&data=' + encodedData + '&_t=' + Date.now())
            .catch(e => console.error("GET dự phòng cũng thất bại:", e));
    });
}

let isSyncingActivities = false;

// Đồng bộ danh sách hoạt động từ Google Sheets về LocalStorage (chạy ngầm, chống cache di động)
function syncActivitiesFromCloud(callback) {
    if (!CONFIG.googleScriptUrl || isSyncingActivities) return;
    isSyncingActivities = true;

    fetch(CONFIG.googleScriptUrl + "?action=getActivities&_t=" + Date.now())
        .then(res => res.json())
        .then(data => {
            isSyncingActivities = false;
            if (Array.isArray(data)) {
                const cleanData = deduplicateActivities(data);
                localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanData));
                if (callback) callback(cleanData);
            }
        })
        .catch(err => {
            isSyncingActivities = false;
            console.error("Lỗi đồng bộ danh sách sự kiện từ cloud:", err);
        });
}
