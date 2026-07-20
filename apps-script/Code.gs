/**
 * ════════════════════════════════════════════════════════════════════════════
 *  HỆ THỐNG RÀ SOÁT TÀI KHOẢN CÁN BỘ
 *  Văn phòng Đoàn ĐBQH và HĐND thành phố Hà Nội
 *  Backend Google Apps Script — CSDL Google Sheets, ảnh Google Drive.
 *
 *  BƯỚC 1 (tệp này): luồng đăng nhập + rà soát (dangNhap, layDuLieu, luuNhap).
 *  taiChuKy / guiChinhThuc là khung, hoàn thiện ở Bước 2.
 *
 *  ── TRIỂN KHAI (làm 1 lần) ─────────────────────────────────────────────────
 *   1) Tạo Google Trang tính, tạo đủ các trang tab: DanhSach, DonVi, ChuKy,
 *      NhatKy, CauHinh, KetQuaCuoi (tên cột đúng như tài liệu — TRA CỘT THEO TÊN).
 *      Đăng nhập 3 ô: DonVi phải có cột TenDangNhap (tài khoản CNTT) + MatKhau (SĐT CNTT).
 *   2) Điền ID Trang tính vào SHEET_ID bên dưới (hoặc để trống nếu gắn trong Sheet).
 *   3) Đặt mật khẩu quản trị: ⚙ Cài đặt dự án → Thuộc tính tập lệnh (Script
 *      properties) → thêm ADMIN_PASSWORD = <mật khẩu của bạn>. KHÔNG để trong
 *      CauHinh vì cán bộ xem được Sheets.
 *   4) Triển khai → Bản triển khai mới → Ứng dụng web: Thực thi = Tôi (Me),
 *      Ai truy cập = Bất kỳ ai (Anyone). Copy URL .../exec → dán vào GAS_URL trong
 *      js/api.js và đặt DEMO = false.
 *   ── LƯU Ý: lưu code KHÔNG bằng triển khai. Mỗi lần sửa .gs phải tạo "Phiên bản
 *      mới" thì /exec mới chạy code mới. Bump VER mỗi lần sửa để kiểm tra.
 * ════════════════════════════════════════════════════════════════════════════
 */

var VER = 'rasoat-v1';
var SHEET_ID = '';   // điền ID Trang tính nếu triển khai độc lập; để trống nếu gắn trong Sheet
function ss_() { return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }

var TAB = { DS: 'DanhSach', DV: 'DonVi', CK: 'ChuKy', NK: 'NhatKy', CH: 'CauHinh', KQ: 'KetQuaCuoi' };
var PHIEN_GIAY = 2 * 60 * 60;   // phiên sống 2 giờ (CacheService)
var KQ_HEADERS = ['ID', 'MaDonVi', 'TenDonVi', 'Lop', 'HoTen', 'TenTaiKhoan', 'SoDienThoai',
                  'EmailCongVu', 'PhuTrachCNTT', 'KetLuan', 'GhiChuDonVi', 'CanhBaoTrungCheo', 'ThoiGianHopNhat'];

/* ═══════════════════════════ ĐIỂM VÀO HTTP ═══════════════════════════════ */

// GET không tham số → 126 đơn vị cho ô tìm kiếm (KHÔNG kèm mật khẩu).
function doGet(e) {
  try {
    var dv = docBang_(TAB.DV);
    var ds = dv.rows.map(function (r) {
      return {
        maDonVi: r[dv.i.MaDonVi], tenDonVi: r[dv.i.TenDonVi],
        tenKhongDau: r[dv.i.TenKhongDau], trangThai: r[dv.i.TrangThai] || 'CHUA_RA_SOAT'
      };
    }).filter(function (x) { return x.maDonVi; });
    return json_({ ok: true, data: { donVi: ds }, ver: VER });
  } catch (err) { return json_({ ok: false, loi: 'Lỗi máy chủ: ' + err }); }
}

// POST: nhận JSON (Content-Type text/plain để tránh preflight CORS mà GAS không xử lý được).
function doPost(e) {
  try {
    var p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (p.hanhDong) {
      case 'dangNhap':     return json_(xuLyDangNhap_(p));
      case 'layDuLieu':    return json_(xuLyLayDuLieu_(p));
      case 'luuNhap':      return json_(xuLyLuuNhap_(p));
      case 'taiChuKy':     return json_(xuLyTaiChuKy_(p));
      case 'guiChinhThuc': return json_(xuLyGuiChinhThuc_(p));
      case 'adminDangNhap':return json_(xuLyAdminDangNhap_(p));
      case 'adminTongQuan':return json_(xuLyAdminTongQuan_(p));
      case 'adminChiTiet': return json_(xuLyAdminChiTiet_(p));
      case 'adminMoKhoa':  return json_(xuLyAdminMoKhoa_(p));
      case 'adminDonDoc':  return json_(xuLyAdminDonDoc_(p));
      case 'adminHopNhat': return json_(xuLyAdminHopNhat_(p));
      default:             return json_({ ok: false, loi: 'Hành động không hợp lệ.' });
    }
  } catch (err) { return json_({ ok: false, loi: 'Lỗi máy chủ: ' + err }); }
}

// CORS preflight (phòng khi trình duyệt vẫn bắn OPTIONS).
function doOptions(e) { return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT); }

/* ═══════════════════════════ TIỆN ÍCH DỮ LIỆU ════════════════════════════ */

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Đọc CẢ trang một lần rồi xử lý trong bộ nhớ. TRA CỘT THEO TÊN (không theo chỉ số).
   Trả {headers, rows, i:{TenCot:chiSo}} — rows KHÔNG gồm hàng tiêu đề. */
function docBang_(ten) {
  var sh = ss_().getSheetByName(ten);
  if (!sh) throw 'Không tìm thấy trang "' + ten + '".';
  var vals = sh.getDataRange().getValues();
  var headers = vals.length ? vals[0].map(function (h) { return String(h).trim(); }) : [];
  var i = {};
  headers.forEach(function (h, idx) { i[h] = idx; });
  return { sh: sh, headers: headers, rows: vals.slice(1), i: i };
}

/* Đọc CauHinh thành object {ThamSo: GiaTri}. */
function docCauHinh_() {
  try {
    var t = docBang_(TAB.CH), o = {};
    t.rows.forEach(function (r) { if (r[t.i.ThamSo]) o[r[t.i.ThamSo]] = r[t.i.GiaTri]; });
    return o;
  } catch (e) { return {}; }
}

/* ═══════════════════════════ PHIÊN + KHOÁ SAI ════════════════════════════ */

function taoPhien_(maDonVi) {
  var token = 'tk-' + maDonVi + '-' + Utilities.getUuid();
  CacheService.getScriptCache().put('phien_' + token, maDonVi, PHIEN_GIAY);
  return token;
}
function layPhien_(token) {
  if (!token) return null;
  return CacheService.getScriptCache().get('phien_' + token);
}

/* ═══════════════════════════ NHẬT KÝ ═════════════════════════════════════ */

function ghiNhatKy_(maDonVi, nguoi, hanhDong, doiTuong, cu, moi, ip) {
  try {
    var t = docBang_(TAB.NK);
    var row = [];
    row[t.i.ThoiGian] = new Date();
    row[t.i.MaDonVi] = maDonVi || '';
    row[t.i.NguoiThucHien] = nguoi || '';
    row[t.i.HanhDong] = hanhDong || '';
    row[t.i.DoiTuong] = doiTuong || '';
    row[t.i.GiaTriCu] = cu || '';
    row[t.i.GiaTriMoi] = moi || '';
    row[t.i.DiaChiIP] = ip || '';
    for (var k = 0; k < t.headers.length; k++) if (row[k] === undefined) row[k] = '';
    t.sh.appendRow(row);
  } catch (e) { /* không để lỗi ghi log chặn nghiệp vụ */ }
}

/* ═══════════════════════════ ĐĂNG NHẬP ═══════════════════════════════════ */

function xuLyDangNhap_(p) {
  var ma = (p.maDonVi || '').trim();
  var tk = String(p.tenDangNhap || '').trim();
  var mk = String(p.matKhau || '').trim();
  if (!ma || !tk || !mk) return { ok: false, loi: 'Thiếu đơn vị, tên đăng nhập hoặc số điện thoại.' };

  var cfg = docCauHinh_();
  var soToiDa = parseInt(cfg.SO_LAN_SAI_TOI_DA, 10) || 5;
  var phutKhoa = parseInt(cfg.PHUT_KHOA, 10) || 15;
  var cache = CacheService.getScriptCache();

  // Đang bị khoá?
  if (cache.get('khoa_' + ma)) return { ok: false, loi: 'Đơn vị đang tạm bị khoá do nhập sai nhiều lần. Vui lòng thử lại sau ' + phutKhoa + ' phút.' };

  var dv = docBang_(TAB.DV);
  var hang = null;
  for (var r = 0; r < dv.rows.length; r++) { if (String(dv.rows[r][dv.i.MaDonVi]).trim() === ma) { hang = dv.rows[r]; break; } }
  if (!hang) return { ok: false, loi: 'Không tìm thấy đơn vị.' };

  var tkDung = String(hang[dv.i.TenDangNhap] || '').trim().toLowerCase();
  var mkDung = String(hang[dv.i.MatKhau] || '').replace(/^'/, '').trim();
  if (!tkDung || !mkDung) return { ok: false, loi: 'Đơn vị chưa được cấp tài khoản đăng nhập. Vui lòng liên hệ quản trị.' };

  if (tk.toLowerCase() !== tkDung || mk !== mkDung) {
    // Đếm số lần sai; ghi nhật ký; khoá khi vượt ngưỡng (không lộ sai TK hay sai SĐT)
    var key = 'sai_' + ma;
    var soSai = (parseInt(cache.get(key), 10) || 0) + 1;
    cache.put(key, String(soSai), phutKhoa * 60);
    ghiNhatKy_(ma, tk || 'Đơn vị', 'ĐĂNG NHẬP SAI', 'Lần ' + soSai, '', '', diaChiIP_(p));
    if (soSai >= soToiDa) {
      cache.put('khoa_' + ma, '1', phutKhoa * 60);
      cache.remove(key);
      return { ok: false, loi: 'Nhập sai quá ' + soToiDa + ' lần. Đơn vị bị khoá trong ' + phutKhoa + ' phút.' };
    }
    return { ok: false, loi: 'Tên đăng nhập hoặc số điện thoại không đúng. Còn ' + (soToiDa - soSai) + ' lần thử.' };
  }

  // Đúng → xoá bộ đếm, tạo phiên
  cache.remove('sai_' + ma);
  var token = taoPhien_(ma);
  return { ok: true, data: { token: token, donVi: { maDonVi: ma, tenDonVi: hang[dv.i.TenDonVi], trangThai: hang[dv.i.TrangThai] || 'CHUA_RA_SOAT' } } };
}

function diaChiIP_(p) { return (p && p._ip) || ''; }  // GAS không lấy được IP thật; để trống

/* ═══════════════════════════ LẤY DỮ LIỆU ĐƠN VỊ ══════════════════════════ */

function xuLyLayDuLieu_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };

  var ds = docBang_(TAB.DS);
  var canBo = [];
  var coCT = false;
  for (var r = 0; r < ds.rows.length; r++) {
    var row = ds.rows[r];
    if (String(row[ds.i.MaDonVi]).trim() !== ma) continue;
    if (row[ds.i.Lop] === 'CT') coCT = true;
    canBo.push({
      id: row[ds.i.ID], maDonVi: row[ds.i.MaDonVi], lop: row[ds.i.Lop],
      hoTen: row[ds.i.HoTen], tenTaiKhoan: row[ds.i.TenTaiKhoan],
      phuTrachCNTT: row[ds.i.PhuTrachCNTT], soDienThoai: String(row[ds.i.SoDienThoai]).replace(/^'/, ''),
      emailCongVu: row[ds.i.EmailCongVu], canhBaoHeThong: row[ds.i.CanhBaoHeThong],
      trangThai: row[ds.i.TrangThai] || 'CHUA_RA_SOAT',
      hoTen_Moi: row[ds.i.HoTen_Moi] || '', lop_Moi: row[ds.i.Lop_Moi] || '',
      tenTaiKhoan_Moi: row[ds.i.TenTaiKhoan_Moi] || '', soDienThoai_Moi: String(row[ds.i.SoDienThoai_Moi] || '').replace(/^'/, ''),
      emailCongVu_Moi: row[ds.i.EmailCongVu_Moi] || '', phuTrachCNTT_Moi: row[ds.i.PhuTrachCNTT_Moi] || '',
      ghiChuDonVi: row[ds.i.GhiChuDonVi] || ''
    });
  }

  // Tình trạng chữ ký
  var daTai = false;
  try {
    var ck = docBang_(TAB.CK);
    daTai = ck.rows.some(function (r2) { return String(r2[ck.i.MaDonVi]).trim() === ma && r2[ck.i.FileID]; });
  } catch (e) {}

  var dvHang = timDonVi_(ma);
  return { ok: true, data: {
    donVi: {
      maDonVi: ma, tenDonVi: dvHang ? dvHang.tenDonVi : '',
      trangThai: dvHang ? dvHang.trangThai : 'CHUA_RA_SOAT',
      maBienNhan: dvHang ? dvHang.maBienNhan : ''
    },
    danhSach: canBo, chuKy: { daTai: daTai, canChuKy: coCT }
  } };
}

function timDonVi_(ma) {
  var dv = docBang_(TAB.DV);
  for (var r = 0; r < dv.rows.length; r++) {
    if (String(dv.rows[r][dv.i.MaDonVi]).trim() === ma) {
      return {
        tenDonVi: dv.rows[r][dv.i.TenDonVi],
        trangThai: dv.rows[r][dv.i.TrangThai] || 'CHUA_RA_SOAT',
        maBienNhan: dv.rows[r][dv.i.MaBienNhan] || ''
      };
    }
  }
  return null;
}

/* ═══════════════════════════ LƯU NHÁP ════════════════════════════════════
   Ghi cột *_Moi + TrangThai + ThoiGianCapNhat theo ID. TUYỆT ĐỐI không ghi đè
   cột gốc. Bọc LockService. Kiểm tra MO_FORM và trạng thái DA_GUI ở BACKEND.
   ───────────────────────────────────────────────────────────────────────── */
function xuLyLuuNhap_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };

  var cfg = docCauHinh_();
  if (String(cfg.MO_FORM || 'CO').toUpperCase() !== 'CO') return { ok: false, loi: 'Hệ thống đã đóng, không thể lưu.' };
  var dvHang = timDonVi_(ma);
  if (dvHang && dvHang.trangThai === 'DA_GUI') return { ok: false, loi: 'Đơn vị đã gửi chính thức, dữ liệu đã khoá.' };

  var danhSach = p.danhSach || [];
  if (!danhSach.length) return { ok: true, data: { soDong: 0 } };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);   // 126 đơn vị có thể vào cùng lúc sau khi phát công văn
  try {
    var ds = docBang_(TAB.DS);
    var sh = ds.sh, i = ds.i, W = ds.headers.length;
    // Bản đồ ID -> số hàng thực (chỉ trong phạm vi đơn vị này để chống sửa chéo)
    var mapHang = {};
    for (var r = 0; r < ds.rows.length; r++) {
      if (String(ds.rows[r][i.MaDonVi]).trim() === ma) mapHang[String(ds.rows[r][i.ID])] = r + 2; // +2: bỏ tiêu đề, 1-based
    }
    var n = 0;
    danhSach.forEach(function (rec) {
      var soHang = mapHang[String(rec.id)];
      if (!soHang) return;   // không thuộc đơn vị này → bỏ qua (chống sửa chéo)
      var hangCu = ds.rows[soHang - 2];
      var out = hangCu.slice();   // giữ nguyên toàn bộ hàng, chỉ đổi các cột được phép
      out[i.TrangThai] = rec.trangThai || 'CHUA_RA_SOAT';
      out[i.HoTen_Moi] = rec.hoTen_Moi || '';
      out[i.Lop_Moi] = rec.lop_Moi || '';
      out[i.TenTaiKhoan_Moi] = rec.tenTaiKhoan_Moi || '';
      out[i.SoDienThoai_Moi] = rec.soDienThoai_Moi ? ("'" + rec.soDienThoai_Moi) : '';   // nháy đơn giữ số 0 đầu
      out[i.EmailCongVu_Moi] = rec.emailCongVu_Moi || '';
      out[i.PhuTrachCNTT_Moi] = rec.phuTrachCNTT_Moi || '';
      out[i.GhiChuDonVi] = rec.ghiChuDonVi || '';
      out[i.ThoiGianCapNhat] = new Date();
      var rng = sh.getRange(soHang, 1, 1, W);
      rng.setNumberFormat('@');           // ép Văn bản trước khi ghi (chống Sheets đổi kiểu)
      SpreadsheetApp.flush();
      rng.setValues([out]);
      n++;
    });
    // Đánh dấu đơn vị đang rà soát
    if (dvHang && dvHang.trangThai === 'CHUA_RA_SOAT') datTrangThaiDonVi_(ma, 'DANG_RA_SOAT');
    return { ok: true, data: { soDong: n } };
  } finally {
    lock.releaseLock();
  }
}

function datTrangThaiDonVi_(ma, tt) {
  var dv = docBang_(TAB.DV);
  for (var r = 0; r < dv.rows.length; r++) {
    if (String(dv.rows[r][dv.i.MaDonVi]).trim() === ma) {
      dv.sh.getRange(r + 2, dv.i.TrangThai + 1).setValue(tt);
      return;
    }
  }
}

/* ═══════════════════════════ ẢNH CHỮ KÝ (BƯỚC 2) ═════════════════════════
   Nhận base64 PNG đã xử lý ở client, lưu vào Google Drive, ghi bảng ChuKy.
   Ảnh gốc KHÔNG được gửi lên — client đã tách nền/cắt viền/thu nhỏ.
   ───────────────────────────────────────────────────────────────────────── */
function xuLyTaiChuKy_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  if (!p.anhBase64) return { ok: false, loi: 'Thiếu dữ liệu ảnh chữ ký.' };

  var cfg = docCauHinh_();
  if (String(cfg.MO_FORM || 'CO').toUpperCase() !== 'CO') return { ok: false, loi: 'Hệ thống đã đóng, không thể tải ảnh.' };
  var dvHang = timDonVi_(ma);
  if (dvHang && dvHang.trangThai === 'DA_GUI') return { ok: false, loi: 'Đơn vị đã gửi chính thức, dữ liệu đã khoá.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var tenDV = dvHang ? dvHang.tenDonVi : ma;
    var tenFile = 'CK_' + ma + '_' + tenTep_(tenDV) + '_' + tenTep_(p.hoTenChuTich || '') + '_' +
      Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd') + '.png';

    // Giải mã base64 → lưu Drive
    var bytes = Utilities.base64Decode(p.anhBase64);
    var blob = Utilities.newBlob(bytes, 'image/png', tenFile);
    var thuMuc = cfg.THU_MUC_DRIVE_ID ? DriveApp.getFolderById(cfg.THU_MUC_DRIVE_ID) : DriveApp.getRootFolder();
    var file = thuMuc.createFile(blob);
    var dungLuongKB = Math.round(file.getSize() / 1024);

    // Ghi bảng ChuKy — mỗi đơn vị 1 ảnh (thay ảnh cũ nếu tải lại)
    var ck = docBang_(TAB.CK);
    for (var r = ck.rows.length - 1; r >= 0; r--) {
      if (String(ck.rows[r][ck.i.MaDonVi]).trim() === ma) ck.sh.deleteRow(r + 2);
    }
    var row = [];
    row[ck.i.MaDonVi] = ma;
    row[ck.i.TenDonVi] = tenDV;
    row[ck.i.HoTenChuTich] = p.hoTenChuTich || '';
    row[ck.i.TenFile] = tenFile;
    row[ck.i.FileID] = file.getId();
    row[ck.i.LinkXem] = file.getUrl();
    row[ck.i.DungLuongKB] = dungLuongKB;
    row[ck.i.ThoiGianTai] = new Date();
    row[ck.i.NguoiTai] = ma;
    for (var k = 0; k < ck.headers.length; k++) if (row[k] === undefined) row[k] = '';
    ck.sh.appendRow(row);

    ghiNhatKy_(ma, 'Đơn vị', 'TẢI CHỮ KÝ', tenFile, '', dungLuongKB + ' KB', diaChiIP_(p));
    return { ok: true, data: { tenFile: tenFile, dungLuongKB: dungLuongKB } };
  } catch (err) {
    return { ok: false, loi: 'Lưu ảnh thất bại: ' + err };
  } finally {
    lock.releaseLock();
  }
}

/* Chuẩn hoá 1 đoạn cho tên tệp: bỏ dấu, giữ chữ-số, ghép PascalCase. */
function tenTep_(s) {
  var kd = String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  return kd.split(/[^A-Za-z0-9]+/).filter(String)
    .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
}

/* ═══════════════════════════ GỬI CHÍNH THỨC (BƯỚC 3) ═════════════════════
   Kiểm ở BACKEND: MO_FORM, chưa DA_GUI, đã rà soát HẾT, đã có chữ ký (nếu có CT).
   Sinh mã biên nhận XN-<Ma>-<yyyyMMdd-HHmm>, khoá đơn vị.
   ───────────────────────────────────────────────────────────────────────── */
function xuLyGuiChinhThuc_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  var nguoi = (p.nguoiXacNhan || '').trim(), chucVu = (p.chucVu || '').trim();
  if (!nguoi || !chucVu) return { ok: false, loi: 'Vui lòng nhập họ tên và chức vụ người xác nhận.' };

  var cfg = docCauHinh_();
  if (String(cfg.MO_FORM || 'CO').toUpperCase() !== 'CO') return { ok: false, loi: 'Hệ thống đã đóng, không thể gửi.' };
  var dvHang = timDonVi_(ma);
  if (dvHang && dvHang.trangThai === 'DA_GUI') return { ok: false, loi: 'Đơn vị đã gửi chính thức trước đó.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Đọc danh sách cán bộ của đơn vị → kiểm rà soát hết + thống kê
    var ds = docBang_(TAB.DS);
    var tk = { giuNguyen: 0, daSua: 0, khongCon: 0 }, tong = 0, chuaRS = false, coCTActive = false;
    for (var r = 0; r < ds.rows.length; r++) {
      if (String(ds.rows[r][ds.i.MaDonVi]).trim() !== ma) continue;
      tong++;
      var tt = ds.rows[r][ds.i.TrangThai] || 'CHUA_RA_SOAT';
      if (tt === 'CHUA_RA_SOAT') chuaRS = true;
      else if (tt === 'DUNG') tk.giuNguyen++;
      else if (tt === 'SUA') tk.daSua++;
      else if (tt === 'XOA') tk.khongCon++;
      if (ds.rows[r][ds.i.Lop] === 'CT' && tt !== 'XOA') coCTActive = true;
    }
    if (tong === 0) return { ok: false, loi: 'Đơn vị chưa có dữ liệu cán bộ.' };
    if (chuaRS) return { ok: false, loi: 'Chưa rà soát hết cán bộ, không thể gửi.' };

    // Kiểm ảnh chữ ký nếu còn Chủ tịch HĐND đang công tác
    if (coCTActive) {
      var ck = docBang_(TAB.CK);
      var coCK = ck.rows.some(function (r2) { return String(r2[ck.i.MaDonVi]).trim() === ma && r2[ck.i.FileID]; });
      if (!coCK) return { ok: false, loi: 'Chưa tải ảnh chữ ký Chủ tịch HĐND.' };
    }

    var maBienNhan = 'XN-' + ma + '-' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmm');

    // Cập nhật đơn vị: khoá + ghi biên nhận
    var dv = docBang_(TAB.DV);
    for (var d = 0; d < dv.rows.length; d++) {
      if (String(dv.rows[d][dv.i.MaDonVi]).trim() === ma) {
        var hang = d + 2;
        dv.sh.getRange(hang, dv.i.TrangThai + 1).setValue('DA_GUI');
        dv.sh.getRange(hang, dv.i.ThoiGianGui + 1).setValue(new Date());
        dv.sh.getRange(hang, dv.i.NguoiXacNhan + 1).setValue(nguoi);
        dv.sh.getRange(hang, dv.i.ChucVu + 1).setValue(chucVu);
        dv.sh.getRange(hang, dv.i.MaBienNhan + 1).setValue(maBienNhan);
        break;
      }
    }

    ghiNhatKy_(ma, nguoi, 'GỬI CHÍNH THỨC', maBienNhan, '', chucVu, diaChiIP_(p));
    return { ok: true, data: { maBienNhan: maBienNhan, thongKe: tk } };
  } catch (err) {
    return { ok: false, loi: 'Gửi thất bại: ' + err };
  } finally {
    lock.releaseLock();
  }
}

/* ═══════════════════════════ QUẢN TRỊ (BƯỚC 4) ═══════════════════════════
   Mật khẩu quản trị lưu ở PropertiesService (ADMIN_PASSWORD) — KHÔNG để trong
   CauHinh vì cán bộ xem được Sheets. Phiên quản trị giữ trong CacheService.
   ───────────────────────────────────────────────────────────────────────── */
function adminMatKhau_() {
  try { return PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || ''; }
  catch (e) { return ''; }
}
function taoAdminPhien_() {
  var t = 'admin-' + Utilities.getUuid();
  CacheService.getScriptCache().put('adminphien_' + t, '1', PHIEN_GIAY);
  return t;
}
function layAdminPhien_(token) {
  return token && CacheService.getScriptCache().get('adminphien_' + token);
}

function xuLyAdminDangNhap_(p) {
  var mk = adminMatKhau_();
  if (!mk) return { ok: false, loi: 'Chưa đặt mật khẩu quản trị (ADMIN_PASSWORD) trong Thuộc tính tập lệnh.' };
  if (String(p.matKhau || '') !== mk) return { ok: false, loi: 'Mật khẩu quản trị không đúng.' };
  return { ok: true, data: { token: taoAdminPhien_() } };
}

function xuLyAdminTongQuan_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.' };
  var dv = docBang_(TAB.DV);
  // tập MaDonVi đã có ảnh chữ ký
  var coCK = {};
  try { var ck = docBang_(TAB.CK); ck.rows.forEach(function (r) { if (r[ck.i.FileID]) coCK[String(r[ck.i.MaDonVi]).trim()] = true; }); } catch (e) {}
  var list = dv.rows.map(function (r) {
    var ma = String(r[dv.i.MaDonVi]).trim();
    return {
      maDonVi: ma, tenDonVi: r[dv.i.TenDonVi], trangThai: r[dv.i.TrangThai] || 'CHUA_RA_SOAT',
      soNguoi: Number(r[dv.i.SoNguoi]) || 0, soLoiBanDau: Number(r[dv.i.SoLoiBanDau]) || 0,
      maBienNhan: r[dv.i.MaBienNhan] || '', nguoiXacNhan: r[dv.i.NguoiXacNhan] || '',
      thoiGianGui: r[dv.i.ThoiGianGui] ? new Date(r[dv.i.ThoiGianGui]).toISOString() : '',
      coChuKy: !!coCK[ma]
    };
  }).filter(function (x) { return x.maDonVi; });
  return { ok: true, data: { donVi: list } };
}

function xuLyAdminChiTiet_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phiên quản trị đã hết hạn.' };
  var ma = (p.maDonVi || '').trim();
  var ds = docBang_(TAB.DS);
  var canBo = [];
  for (var r = 0; r < ds.rows.length; r++) {
    var row = ds.rows[r];
    if (String(row[ds.i.MaDonVi]).trim() !== ma) continue;
    canBo.push({
      id: row[ds.i.ID], lop: row[ds.i.Lop], hoTen: row[ds.i.HoTen],
      tenTaiKhoan: row[ds.i.TenTaiKhoan], soDienThoai: String(row[ds.i.SoDienThoai]).replace(/^'/, ''),
      emailCongVu: row[ds.i.EmailCongVu], phuTrachCNTT: row[ds.i.PhuTrachCNTT],
      canhBaoHeThong: row[ds.i.CanhBaoHeThong], trangThai: row[ds.i.TrangThai] || 'CHUA_RA_SOAT',
      hoTen_Moi: row[ds.i.HoTen_Moi] || '', lop_Moi: row[ds.i.Lop_Moi] || '',
      tenTaiKhoan_Moi: row[ds.i.TenTaiKhoan_Moi] || '', soDienThoai_Moi: String(row[ds.i.SoDienThoai_Moi] || '').replace(/^'/, ''),
      emailCongVu_Moi: row[ds.i.EmailCongVu_Moi] || '', phuTrachCNTT_Moi: row[ds.i.PhuTrachCNTT_Moi] || '',
      ghiChuDonVi: row[ds.i.GhiChuDonVi] || ''
    });
  }
  var dvHang = timDonVi_(ma);
  var chuKy = { daTai: false };
  try {
    var ck = docBang_(TAB.CK);
    for (var k = 0; k < ck.rows.length; k++) {
      if (String(ck.rows[k][ck.i.MaDonVi]).trim() === ma && ck.rows[k][ck.i.FileID]) {
        chuKy = { daTai: true, tenFile: ck.rows[k][ck.i.TenFile], linkXem: ck.rows[k][ck.i.LinkXem], dungLuongKB: ck.rows[k][ck.i.DungLuongKB] };
        break;
      }
    }
  } catch (e) {}
  return { ok: true, data: {
    donVi: { maDonVi: ma, tenDonVi: dvHang ? dvHang.tenDonVi : '', trangThai: dvHang ? dvHang.trangThai : '', maBienNhan: dvHang ? dvHang.maBienNhan : '' },
    danhSach: canBo, chuKy: chuKy
  } };
}

function xuLyAdminMoKhoa_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phiên quản trị đã hết hạn.' };
  var ma = (p.maDonVi || '').trim();
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var dv = docBang_(TAB.DV);
    for (var r = 0; r < dv.rows.length; r++) {
      if (String(dv.rows[r][dv.i.MaDonVi]).trim() === ma) {
        if ((dv.rows[r][dv.i.TrangThai] || '') !== 'DA_GUI') return { ok: false, loi: 'Đơn vị chưa gửi nên không cần mở khoá.' };
        dv.sh.getRange(r + 2, dv.i.TrangThai + 1).setValue('DANG_RA_SOAT');
        ghiNhatKy_(ma, 'Quản trị', 'MỞ KHOÁ', ma, 'DA_GUI', 'DANG_RA_SOAT', diaChiIP_(p));
        return { ok: true, data: { maDonVi: ma, trangThai: 'DANG_RA_SOAT' } };
      }
    }
    return { ok: false, loi: 'Không tìm thấy đơn vị.' };
  } finally { lock.releaseLock(); }
}

/* Đôn đốc: gửi email nhắc các đơn vị được chọn. Chia lô + bọc try/catch để
   hết hạn ngạch (100/ngày) hoặc 1 email lỗi KHÔNG chặn cả mẻ. */
function xuLyAdminDonDoc_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phiên quản trị đã hết hạn.' };
  var dsMa = p.dsMaDonVi || [];
  if (!dsMa.length) return { ok: false, loi: 'Chưa chọn đơn vị để đôn đốc.' };

  // Bản đồ MaDonVi -> email đầu mối CNTT (từ DanhSach)
  var ds = docBang_(TAB.DS), emailDauMoi = {};
  for (var r = 0; r < ds.rows.length; r++) {
    if (String(ds.rows[r][ds.i.PhuTrachCNTT]).trim().toLowerCase() === 'x') {
      emailDauMoi[String(ds.rows[r][ds.i.MaDonVi]).trim()] = String(ds.rows[r][ds.i.EmailCongVu] || '').trim();
    }
  }
  var dvTen = {}; var dv = docBang_(TAB.DV);
  dv.rows.forEach(function (row) { dvTen[String(row[dv.i.MaDonVi]).trim()] = row[dv.i.TenDonVi]; });

  var daGui = 0, thatBai = 0, boQua = 0, LO = 50;   // chia lô 50 mỗi vòng
  for (var i = 0; i < dsMa.length && i < LO; i++) {
    var ma = String(dsMa[i]).trim();
    var email = emailDauMoi[ma];
    if (!email || !/^[^@\s]+@[^@\s]+$/.test(email)) { boQua++; continue; }
    try {
      if (MailApp.getRemainingDailyQuota() <= 0) { boQua++; continue; }
      MailApp.sendEmail(email,
        'Đôn đốc rà soát tài khoản cán bộ — ' + (dvTen[ma] || ma),
        'Kính đề nghị đơn vị ' + (dvTen[ma] || ma) + ' hoàn thành rà soát, cập nhật thông tin ' +
        'tài khoản cán bộ và gửi chính thức đúng hạn.\n\nTrân trọng.');
      daGui++;
    } catch (e) { thatBai++; }
  }
  ghiNhatKy_('', 'Quản trị', 'ĐÔN ĐỐC', dsMa.length + ' đơn vị', '', 'Gửi ' + daGui + ' · lỗi ' + thatBai + ' · bỏ qua ' + boQua, diaChiIP_(p));
  return { ok: true, data: { daGui: daGui, thatBai: thatBai, boQua: boQua, tongYeuCau: dsMa.length, conLai: Math.max(0, dsMa.length - LO) } };
}

/* ═══════════════════════ HỢP NHẤT KẾT QUẢ CUỐI + DÒ TRÙNG (BƯỚC 5) ═══════════
   Hợp nhất: DUNG → giữ gốc; SUA → lấy *_Moi; XOA → loại bỏ. Xuất ra trang KetQuaCuoi.
   Dò trùng email / tên tài khoản / SĐT TRÊN PHẠM VI CẢ 126 ĐƠN VỊ (rà soát từng
   đơn vị không phát hiện mâu thuẫn chéo giữa hai xã).
   ───────────────────────────────────────────────────────────────────────── */
function xuLyAdminHopNhat_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phiên quản trị đã hết hạn.' };
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try { return { ok: true, data: hopNhatVaDoTrung_() }; }
  catch (err) { return { ok: false, loi: 'Hợp nhất thất bại: ' + err }; }
  finally { lock.releaseLock(); }
}

function hopNhatVaDoTrung_() {
  var ds = docBang_(TAB.DS), i = ds.i, ban = [];
  ds.rows.forEach(function (r) {
    var tt = r[i.TrangThai] || 'CHUA_RA_SOAT';
    if (tt === 'XOA') return;                         // XOA → loại khỏi kết quả cuối
    var sua = (tt === 'SUA');
    function lay(goc, moi) { var m = r[i[moi]]; return (sua && m !== '' && m != null) ? m : r[i[goc]]; }
    ban.push({
      id: r[i.ID], maDonVi: String(r[i.MaDonVi]).trim(), tenDonVi: r[i.TenDonVi],
      lop: lay('Lop', 'Lop_Moi'), hoTen: lay('HoTen', 'HoTen_Moi'),
      tenTaiKhoan: lay('TenTaiKhoan', 'TenTaiKhoan_Moi'),
      soDienThoai: String(lay('SoDienThoai', 'SoDienThoai_Moi')).replace(/^'/, ''),
      emailCongVu: lay('EmailCongVu', 'EmailCongVu_Moi'),
      phuTrachCNTT: lay('PhuTrachCNTT', 'PhuTrachCNTT_Moi'),
      ketLuan: tt, ghiChu: r[i.GhiChuDonVi] || '', tc: []
    });
  });

  doTrungTren_(ban, 'emailCongVu', function (x) { return String(x || '').trim().toLowerCase(); }, 'Email');
  doTrungTren_(ban, 'tenTaiKhoan', function (x) { return String(x || '').trim().toLowerCase(); }, 'Tên tài khoản');
  doTrungTren_(ban, 'soDienThoai', function (x) { return String(x || '').replace(/\D/g, ''); }, 'Số điện thoại');

  // Ghi ra KetQuaCuoi (xoá cũ, ghi mới; SĐT dạng Văn bản giữ số 0 đầu)
  var sh = ss_().getSheetByName(TAB.KQ) || ss_().insertSheet(TAB.KQ);
  sh.clear();
  sh.getRange(1, 1, 1, KQ_HEADERS.length).setValues([KQ_HEADERS]).setFontWeight('bold');
  var now = new Date();
  var out = ban.map(function (b) {
    return [b.id, b.maDonVi, b.tenDonVi, b.lop, b.hoTen, b.tenTaiKhoan, "'" + b.soDienThoai,
      b.emailCongVu, b.phuTrachCNTT, b.ketLuan, b.ghiChu, b.tc.join(' | '), now];
  });
  if (out.length) {
    var rng = sh.getRange(2, 1, out.length, KQ_HEADERS.length);
    rng.setNumberFormat('@'); SpreadsheetApp.flush(); rng.setValues(out);
  }
  sh.setFrozenRows(1);

  var demTC = ban.filter(function (b) { return b.tc.length; }).length;
  return {
    soBanGhi: ban.length, soDongTrung: demTC,
    trung: { email: demNhom_(ban, 'Email'), tenTaiKhoan: demNhom_(ban, 'Tên tài khoản'), soDienThoai: demNhom_(ban, 'Số điện thoại') },
    viDu: viDuTrung_(ban)
  };
}

/* Gắn nhãn trùng vào từng bản ghi; phân biệt "giữa các đơn vị" / "trong đơn vị". */
function doTrungTren_(ban, khoa, chuan, nhan) {
  var m = {};
  ban.forEach(function (b) { var v = chuan(b[khoa]); if (v) (m[v] = m[v] || []).push(b); });
  Object.keys(m).forEach(function (k) {
    var g = m[k]; if (g.length < 2) return;
    var dv = {}; g.forEach(function (b) { dv[b.maDonVi] = 1; });
    var pv = Object.keys(dv).length > 1 ? 'giữa các đơn vị' : 'trong đơn vị';
    g.forEach(function (b) { b.tc.push(nhan + ' trùng ' + pv); });
  });
}
function demNhom_(ban, nhan) {
  var s = {}; ban.forEach(function (b) { b.tc.forEach(function (t) { if (t.indexOf(nhan) === 0) s[b[nhanKey_(nhan)]] = 1; }); });
  return Object.keys(s).length;
}
function nhanKey_(nhan) { return nhan === 'Email' ? 'emailCongVu' : nhan === 'Tên tài khoản' ? 'tenTaiKhoan' : 'soDienThoai'; }
function viDuTrung_(ban) {
  // gom vài nhóm trùng "giữa các đơn vị" để hiển thị cho quản trị
  var out = [], seen = {};
  ['Email', 'Tên tài khoản', 'Số điện thoại'].forEach(function (nhan) {
    var key = nhanKey_(nhan), m = {};
    ban.forEach(function (b) { if (b.tc.some(function (t) { return t === nhan + ' trùng giữa các đơn vị'; })) (m[String(b[key]).toLowerCase()] = m[String(b[key]).toLowerCase()] || []).push(b); });
    Object.keys(m).forEach(function (k) {
      if (out.length >= 40 || seen[nhan + k]) return; seen[nhan + k] = 1;
      out.push({ loai: nhan, giaTri: m[k][0][key], donVi: m[k].map(function (b) { return b.tenDonVi + ' — ' + b.hoTen; }) });
    });
  });
  return out;
}
