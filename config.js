// CẤU HÌNH HỆ THỐNG ĐIỂM DANH GPS
const CONFIG = {
    // Mật khẩu trang quản trị (Admin Panel)
    adminPassword: "Nnhn2005@",

    // Link Google Sheets kết quả (để Admin click xem trực tiếp)
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/12IFrgjYT7qGWXe9lXtcE-oRrmz-BU9ga-m9nYacTlCA/edit",

    // Link Web App Google Apps Script để ghi và đọc dữ liệu điểm danh
    googleScriptUrl: "https://script.google.com/macros/s/AKfycbxzYoL4hhUYiBaQfZFI7o3oPIU8OWx7ZYrc3v-hgu_EXDu-QKpaWfOQCk8nxqmaqK6i/exec",

    // 2. DANH SÁCH CÁC SỰ KIỆN / HOẠT ĐỘNG MẶC ĐỊNH (Để trống để ưu tiên lấy trực tiếp từ Google Sheets)
    activities: []
};

// Hàm hỗ trợ lọc trùng lặp và chuẩn hóa dữ liệu sự kiện
function deduplicateActivities(list) {
    if (!Array.isArray(list)) return [];
    const unique = [];
    const seenKeys = new Set();
    const oldSampleCodes = ["SVTN2026", "WORKSHOP-AI", "TINHOC-ABC"];
    const deletedCodes = (JSON.parse(localStorage.getItem("deleted_activity_codes") || "[]")).map(c => String(c).toUpperCase().trim());

    // Duyệt từ bản ghi mới nhất đến cũ nhất
    for (let i = list.length - 1; i >= 0; i--) {
        const item = list[i];
        if (!item || typeof item !== 'object') continue;
        const code = item.code ? String(item.code).trim().toUpperCase() : '';
        const title = item.title ? String(item.title).trim() : '';
        
        // Bỏ qua các sự kiện đã bị người dùng xóa hoặc mã mẫu cũ
        if (code && (oldSampleCodes.includes(code) || deletedCodes.includes(code))) continue;

        let lat = parseFloat(item.latitude !== undefined ? item.latitude : (item.lat !== undefined ? item.lat : 0));
        let lng = parseFloat(item.longitude !== undefined ? item.longitude : (item.lng !== undefined ? item.lng : 0));
        let rawStart = String(item.startTime || item.start || '').trim();
        let rawEnd = String(item.endTime || item.end || '').trim();

        // Tự động phát hiện và sửa lỗi nếu Google Sheets trả về tọa độ nhầm vào cột startTime / endTime (VD: startTime = 13.122267)
        const parsedStart = parseFloat(rawStart);
        const parsedEnd = parseFloat(rawEnd);

        if ((isNaN(lat) || lat === 0) && !isNaN(parsedStart) && parsedStart >= 8 && parsedStart <= 25) {
            lat = parsedStart;
            rawStart = '';
        }
        if ((isNaN(lng) || lng === 0) && !isNaN(parsedEnd) && parsedEnd >= 100 && parsedEnd <= 115) {
            lng = parsedEnd;
            rawEnd = '';
        }

        // Định dạng chuỗi thời gian hiển thị
        let displayTime = 'Đang mở điểm danh';
        if (rawStart && isNaN(parseFloat(rawStart))) {
            displayTime = rawStart + (rawEnd ? ' - ' + rawEnd : '');
        } else if (rawStart && !isNaN(parseFloat(rawStart)) && (parsedStart < 8 || parsedStart > 25)) {
            displayTime = rawStart;
        }

        // Chuẩn hóa thuộc tính để mọi trang (index, checkin, admin) đọc đúng
        const normalizedItem = {
            ...item,
            code: code || title || 'SK-' + (i + 1),
            title: title || code || 'Sự kiện không tên',
            description: item.description || '',
            locationAddress: item.locationAddress || item.address || item.location || 'Địa điểm tổ chức',
            radius: parseInt(item.radiusMeters || item.radius) || 50,
            radiusMeters: parseInt(item.radiusMeters || item.radius) || 50,
            start: displayTime,
            end: rawEnd,
            startTime: displayTime,
            endTime: rawEnd,
            latitude: !isNaN(lat) ? lat : 13.122267,
            longitude: !isNaN(lng) ? lng : 109.303212
        };

        const key = normalizedItem.code.toUpperCase();
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            unique.unshift(normalizedItem);
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
            console.error("Lỗi parse dữ liệu activities từ localStorage", e);
        }
    }
    return deduplicateActivities(CONFIG.activities || []);
}

// Hàm lưu danh sách hoạt động mới vào localStorage và đồng bộ lên Google Sheet cloud
function saveActivities(list) {
    const cleanList = deduplicateActivities(list);
    localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanList));
    
    if (!CONFIG.googleScriptUrl) return;

    // Gửi payload dạng object chứa mảng activities và list để tương thích mọi phiên bản Google Script
    const payload = JSON.stringify({ activities: cleanList, list: cleanList });
    
    // Gửi request POST đến Google Apps Script
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

// Đồng bộ danh sách hoạt động từ Google Sheets về LocalStorage (chạy ngầm, chống ghi đè rỗng)
function syncActivitiesFromCloud(callback) {
    if (!CONFIG.googleScriptUrl || isSyncingActivities) return;
    isSyncingActivities = true;

    fetch(CONFIG.googleScriptUrl + "?action=getActivities&_t=" + Date.now())
        .then(res => res.json())
        .then(data => {
            isSyncingActivities = false;
            let list = null;
            if (Array.isArray(data)) {
                list = data;
            } else if (data && Array.isArray(data.activities)) {
                list = data.activities;
            } else if (data && Array.isArray(data.data)) {
                list = data.data;
            }

            // CHỈ cập nhật localStorage nếu dữ liệu từ Cloud có sự kiện (> 0)
            if (list && list.length > 0) {
                const cleanData = deduplicateActivities(list);
                if (cleanData.length > 0) {
                    localStorage.setItem("gps_attendance_activities", JSON.stringify(cleanData));
                    if (callback) callback(cleanData);
                    return;
                }
            }

            // Nếu Cloud rỗng nhưng máy cục bộ đang có sự kiện: tự động đẩy lên Cloud
            const localData = getActivities();
            if (localData && localData.length > 0) {
                saveActivities(localData);
                if (callback) callback(localData);
            } else if (callback) {
                callback([]);
            }
        })
        .catch(err => {
            isSyncingActivities = false;
            console.error("Lỗi đồng bộ danh sách sự kiện từ cloud:", err);
            if (callback) callback(getActivities());
        });
}
