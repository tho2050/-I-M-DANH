/**
 * ==============================================================================
 * MÃ NGUỒN GOOGLE APPS SCRIPT (SAU KHI CẬP NHẬT TỰ ĐỘNG ĐỌC CẢ 4 KHOA)
 * ==============================================================================
 * Hướng dẫn cài đặt vào Google Sheets:
 * 1. Mở file Google Sheets điểm danh của bạn trên trình duyệt.
 * 2. Trên thanh menu, bấm "Tiện ích mở rộng" (Extensions) -> Chọn "Apps Script".
 * 3. Xóa toàn bộ mã cũ trong file Code.gs và dán toàn bộ đoạn code bên dưới vào.
 * 4. Bấm biểu tượng Lưu (hình đĩa mềm).
 * 5. Bấm nút màu xanh "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Quản lý bản triển khai" (Manage deployments).
 * 6. Bấm biểu tượng cây bút (Chỉnh sửa / Edit) ở góc phải:
 *    - Phiên bản (Version): Chọn "Phiên bản mới" (New version).
 *    - Người có quyền truy cập (Who has access): Chọn "Bất kỳ ai" (Anyone).
 * 7. Bấm "Triển khai" (Deploy) để hoàn tất.
 * ==============================================================================
 */

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'getAttendance';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. LẤY DANH SÁCH SỰ KIỆN (ACTIVITIES)
    if (action === 'getActivities') {
      let actSheet = ss.getSheetByName('Act') || ss.getSheetByName('Activities');
      if (!actSheet) {
        return createJsonResponse({ status: 'success', activities: [], data: [] });
      }
      const data = actSheet.getDataRange().getValues();
      if (data.length <= 1) {
        return createJsonResponse({ status: 'success', activities: [], data: [] });
      }
      const activities = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0] && !row[1]) continue;
        activities.push({
          code: String(row[0] || '').trim(),
          title: String(row[1] || '').trim(),
          description: String(row[2] || '').trim(),
          locationAddress: String(row[3] || '').trim(),
          radius: parseInt(row[4]) || 50,
          radiusMeters: parseInt(row[4]) || 50,
          startTime: String(row[5] || '').trim(),
          endTime: String(row[6] || '').trim(),
          latitude: parseFloat(row[7]) || 13.122267,
          longitude: parseFloat(row[8]) || 109.303212
        });
      }
      return createJsonResponse({ status: 'success', activities: activities, data: activities });
    }

    // 2. LẤY DANH SÁCH TÀI KHOẢN (ACCOUNTS)
    if (action === 'getAccounts') {
      let accSheet = ss.getSheetByName('Accounts');
      if (!accSheet) {
        return createJsonResponse({ status: 'success', accounts: [] });
      }
      const data = accSheet.getDataRange().getValues();
      const accounts = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        accounts.push({
          username: String(row[0] || '').trim(),
          password: String(row[1] || '').trim(),
          role: String(row[2] || 'staff').trim(),
          fullname: String(row[3] || '').trim(),
          phone: String(row[4] || '').trim(),
          email: String(row[5] || '').trim(),
          approved: row[6] === true || String(row[6]).toLowerCase() === 'true' || String(row[6]).toLowerCase() === 'đã duyệt'
        });
      }
      return createJsonResponse({ status: 'success', accounts: accounts });
    }

    // 3. LẤY MÃ BẢO MẬT ADMIN ĐỘNG
    if (action === 'getAdminCode') {
      const code = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET_CODE') || 'nhung2011';
      return createJsonResponse({ status: 'success', code: code });
    }

    // 4. XÓA TÀI KHOẢN
    if (action === 'deleteAccount') {
      const targetUser = String(params.username || '').toLowerCase().trim();
      let accSheet = ss.getSheetByName('Accounts');
      if (accSheet && targetUser) {
        const data = accSheet.getDataRange().getValues();
        for (let i = data.length - 1; i >= 1; i--) {
          if (String(data[i][0]).toLowerCase().trim() === targetUser) {
            accSheet.deleteRow(i + 1);
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'Deleted' });
    }

    // 5. DUYỆT TÀI KHOẢN
    if (action === 'approveAccount') {
      const targetUser = String(params.username || '').toLowerCase().trim();
      let accSheet = ss.getSheetByName('Accounts');
      if (accSheet && targetUser) {
        const data = accSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]).toLowerCase().trim() === targetUser) {
            accSheet.getRange(i + 1, 7).setValue(true);
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'Approved' });
    }

    // 6. LƯU SỰ KIỆN GET FALLBACK
    if (action === 'saveActivities' && params.data) {
      const body = JSON.parse(decodeURIComponent(params.data));
      saveActivitiesToSheet(ss, body.activities || body.list || body);
      return createJsonResponse({ status: 'success' });
    }

    // 7. MẶC ĐỊNH: LẤY TOÀN BỘ DANH SÁCH ĐIỂM DANH TỪ TẤT CẢ CÁC SHEET KHOA
    const allRecords = [];
    const sheets = ss.getSheets();
    const excludeSheetNames = ['act', 'activities', 'accounts', 'config'];

    sheets.forEach(sheet => {
      const sName = sheet.getName().toLowerCase().trim();
      if (excludeSheetNames.includes(sName)) return;

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // Bỏ qua dòng trống
        if (!row[1] && !row[2] && !row[4] && !row[5]) continue;
        
        // Bỏ qua dòng tiêu đề lặp
        const codeVal = String(row[2] || '').trim();
        const mssvVal = String(row[4] || '').trim();
        if (codeVal.toLowerCase() === 'mã sự kiện' || mssvVal.toLowerCase() === 'mssv') continue;

        allRecords.push({
          timestamp: formatTimestamp(row[1]),
          code: String(row[2] || '').trim(),
          title: String(row[3] || '').trim(),
          studentCode: String(row[4] || '').trim(),
          name: String(row[5] || '').trim(),
          className: String(row[6] || '').trim(),
          faculty: String(row[7] || sheet.getName()).trim(),
          phoneNumber: String(row[8] || '').trim(),
          email: String(row[9] || '').trim(),
          distance: String(row[10] || '').trim(),
          device: String(row[11] || '').trim(),
          coords: String(row[12] || '').trim(),
          ip: String(row[13] || '').trim()
        });
      }
    });

    return createJsonResponse(allRecords);

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch(ex) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const action = (e && e.parameter && e.parameter.action) || body.action;

    // 1. LƯU SỰ KIỆN
    if (action === 'saveActivities') {
      saveActivitiesToSheet(ss, body.activities || body.list || body);
      return createJsonResponse({ status: 'success' });
    }

    // 2. GỬI MÃ OTP QUA GMAIL
    if (action === 'sendOtp') {
      const email = body.email;
      const otp = body.otp;
      const user = body.user;
      if (email && otp) {
        MailApp.sendEmail({
          to: email,
          subject: 'Mã OTP Khôi Phục Mật Khẩu Admin: ' + otp,
          body: 'Chào bạn,\n\nMã OTP 6 chữ số để lấy lại mật khẩu Admin (' + user + ') của bạn là: ' + otp + '\n\nTrân trọng!'
        });
      }
      return createJsonResponse({ status: 'success' });
    }

    // 3. ĐỔI MÃ BẢO MẬT ADMIN ĐỘNG
    if (action === 'setAdminCode') {
      const code = (e && e.parameter && e.parameter.code) || body.code;
      if (code) {
        PropertiesService.getScriptProperties().setProperty('ADMIN_SECRET_CODE', String(code));
      }
      return createJsonResponse({ status: 'success' });
    }

    // 4. MẶC ĐỊNH: LƯU ĐIỂM DANH SINH VIÊN VÀO SHEET KHOA TƯƠNG ỨNG
    const faculty = body.faculty || 'Khoa Kỹ thuật Công nghệ';
    const targetSheetName = getFacultySheetName(faculty);
    let sheet = ss.getSheetByName(targetSheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(targetSheetName);
      sheet.appendRow(["STT", "Thời Gian", "Mã Sự Kiện", "Tên Sự Kiện", "MSSV", "Họ và Tên", "Lớp", "Khoa", "Số Điện Thoại", "Gmail", "Khoảng Cách", "Thiết Bị", "Tọa độ sự kiện", "IP Máy"]);
      sheet.getRange("A1:N1").setBackground("#0d6efd").setFontColor("#ffffff").setFontWeight("bold");
    }

    const stt = Math.max(1, sheet.getLastRow());
    const now = new Date();
    const timestampStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    sheet.appendRow([
      stt,
      timestampStr,
      body.code || '',
      body.title || '',
      body.studentCode || '',
      body.name || '',
      body.className || '',
      faculty,
      body.phoneNumber || '',
      body.email || '',
      body.distance || '0.0m',
      body.device || '',
      body.coords || '',
      body.ip || ''
    ]);

    return createJsonResponse({ status: 'success', message: 'Điểm danh thành công!' });

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function getFacultySheetName(faculty) {
  if (!faculty) return 'Khoa Kỹ thuật Công nghệ';
  const f = faculty.toLowerCase();
  if (f.includes('kinh te')) return 'Khoa Kinh tế';
  if (f.includes('xay dung')) return 'Khoa Xây dựng';
  if (f.includes('kien truc')) return 'Khoa Kiến trúc';
  return 'Khoa Kỹ thuật Công nghệ';
}

function saveActivitiesToSheet(ss, activities) {
  if (!Array.isArray(activities)) return;
  let sheet = ss.getSheetByName('Act') || ss.getSheetByName('Activities');
  if (!sheet) {
    sheet = ss.insertSheet('Act');
  }
  sheet.clear();
  sheet.appendRow(["Mã SK", "Tên Sự Kiện", "Mô tả", "Địa chỉ", "Bán kính (m)", "Bắt đầu", "Kết thúc", "Vĩ độ (Lat)", "Kinh độ (Lng)"]);
  sheet.getRange("A1:I1").setBackground("#198754").setFontColor("#ffffff").setFontWeight("bold");
  
  activities.forEach(a => {
    sheet.appendRow([
      a.code || '',
      a.title || '',
      a.description || '',
      a.locationAddress || a.address || '',
      a.radius || a.radiusMeters || 50,
      a.startTime || a.start || '',
      a.endTime || a.end || '',
      a.latitude || '',
      a.longitude || ''
    ]);
  });
}

function formatTimestamp(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
  }
  return String(val);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
