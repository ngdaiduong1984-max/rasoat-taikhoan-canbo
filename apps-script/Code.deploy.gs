/**
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  H\u1ec6 TH\u1ed0NG R\u00c0 SO\u00c1T T\u00c0I KHO\u1ea2N C\u00c1N B\u1ed8
 *  V\u0103n ph\u00f2ng \u0110o\u00e0n \u0110BQH v\u00e0 H\u0110ND th\u00e0nh ph\u1ed1 H\u00e0 N\u1ed9i
 *  Backend Google Apps Script \u2014 CSDL Google Sheets, \u1ea3nh Google Drive.
 *
 *  B\u01af\u1edaC 1 (t\u1ec7p n\u00e0y): lu\u1ed3ng \u0111\u0103ng nh\u1eadp + r\u00e0 so\u00e1t (dangNhap, layDuLieu, luuNhap).
 *  taiChuKy / guiChinhThuc l\u00e0 khung, ho\u00e0n thi\u1ec7n \u1edf B\u01b0\u1edbc 2.
 *
 *  \u2500\u2500 TRI\u1ec2N KHAI (l\u00e0m 1 l\u1ea7n) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 *   1) T\u1ea1o Google Trang t\u00ednh, t\u1ea1o \u0111\u1ee7 c\u00e1c trang tab: DanhSach, DonVi, ChuKy,
 *      NhatKy, CauHinh, KetQuaCuoi (t\u00ean c\u1ed9t \u0111\u00fang nh\u01b0 t\u00e0i li\u1ec7u \u2014 TRA C\u1ed8T THEO T\u00caN).
 *      \u0110\u0103ng nh\u1eadp 3 \u00f4: DonVi ph\u1ea3i c\u00f3 c\u1ed9t TenDangNhap (t\u00e0i kho\u1ea3n CNTT) + MatKhau (S\u0110T CNTT).
 *   2) \u0110i\u1ec1n ID Trang t\u00ednh v\u00e0o SHEET_ID b\u00ean d\u01b0\u1edbi (ho\u1eb7c \u0111\u1ec3 tr\u1ed1ng n\u1ebfu g\u1eafn trong Sheet).
 *   3) \u0110\u1eb7t m\u1eadt kh\u1ea9u qu\u1ea3n tr\u1ecb: \u2699 C\u00e0i \u0111\u1eb7t d\u1ef1 \u00e1n \u2192 Thu\u1ed9c t\u00ednh t\u1eadp l\u1ec7nh (Script
 *      properties) \u2192 th\u00eam ADMIN_PASSWORD = <m\u1eadt kh\u1ea9u c\u1ee7a b\u1ea1n>. KH\u00d4NG \u0111\u1ec3 trong
 *      CauHinh v\u00ec c\u00e1n b\u1ed9 xem \u0111\u01b0\u1ee3c Sheets.
 *   4) Tri\u1ec3n khai \u2192 B\u1ea3n tri\u1ec3n khai m\u1edbi \u2192 \u1ee8ng d\u1ee5ng web: Th\u1ef1c thi = T\u00f4i (Me),
 *      Ai truy c\u1eadp = B\u1ea5t k\u1ef3 ai (Anyone). Copy URL .../exec \u2192 d\u00e1n v\u00e0o GAS_URL trong
 *      js/api.js v\u00e0 \u0111\u1eb7t DEMO = false.
 *   \u2500\u2500 L\u01afU \u00dd: l\u01b0u code KH\u00d4NG b\u1eb1ng tri\u1ec3n khai. M\u1ed7i l\u1ea7n s\u1eeda .gs ph\u1ea3i t\u1ea1o "Phi\u00ean b\u1ea3n
 *      m\u1edbi" th\u00ec /exec m\u1edbi ch\u1ea1y code m\u1edbi. Bump VER m\u1ed7i l\u1ea7n s\u1eeda \u0111\u1ec3 ki\u1ec3m tra.
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 */

var VER = 'rasoat-v1';
var SHEET_ID = '';   // \u0111i\u1ec1n ID Trang t\u00ednh n\u1ebfu tri\u1ec3n khai \u0111\u1ed9c l\u1eadp; \u0111\u1ec3 tr\u1ed1ng n\u1ebfu g\u1eafn trong Sheet
function ss_() { return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }

var TAB = { DS: 'DanhSach', DV: 'DonVi', CK: 'ChuKy', NK: 'NhatKy', CH: 'CauHinh', KQ: 'KetQuaCuoi' };
var PHIEN_GIAY = 2 * 60 * 60;   // phi\u00ean s\u1ed1ng 2 gi\u1edd (CacheService)
var KQ_HEADERS = ['ID', 'MaDonVi', 'TenDonVi', 'Lop', 'HoTen', 'TenTaiKhoan', 'SoDienThoai',
                  'EmailCongVu', 'PhuTrachCNTT', 'KetLuan', 'GhiChuDonVi', 'CanhBaoTrungCheo', 'ThoiGianHopNhat'];

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u0110I\u1ec2M V\u00c0O HTTP \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

// GET kh\u00f4ng tham s\u1ed1 \u2192 126 \u0111\u01a1n v\u1ecb cho \u00f4 t\u00ecm ki\u1ebfm (KH\u00d4NG k\u00e8m m\u1eadt kh\u1ea9u).
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
  } catch (err) { return json_({ ok: false, loi: 'L\u1ed7i m\u00e1y ch\u1ee7: ' + err }); }
}

// POST: nh\u1eadn JSON (Content-Type text/plain \u0111\u1ec3 tr\u00e1nh preflight CORS m\u00e0 GAS kh\u00f4ng x\u1eed l\u00fd \u0111\u01b0\u1ee3c).
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
      default:             return json_({ ok: false, loi: 'H\u00e0nh \u0111\u1ed9ng kh\u00f4ng h\u1ee3p l\u1ec7.' });
    }
  } catch (err) { return json_({ ok: false, loi: 'L\u1ed7i m\u00e1y ch\u1ee7: ' + err }); }
}

// CORS preflight (ph\u00f2ng khi tr\u00ecnh duy\u1ec7t v\u1eabn b\u1eafn OPTIONS).
function doOptions(e) { return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT); }

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 TI\u1ec6N \u00cdCH D\u1eee LI\u1ec6U \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* \u0110\u1ecdc C\u1ea2 trang m\u1ed9t l\u1ea7n r\u1ed3i x\u1eed l\u00fd trong b\u1ed9 nh\u1edb. TRA C\u1ed8T THEO T\u00caN (kh\u00f4ng theo ch\u1ec9 s\u1ed1).
   Tr\u1ea3 {headers, rows, i:{TenCot:chiSo}} \u2014 rows KH\u00d4NG g\u1ed3m h\u00e0ng ti\u00eau \u0111\u1ec1. */
function docBang_(ten) {
  var sh = ss_().getSheetByName(ten);
  if (!sh) throw 'Kh\u00f4ng t\u00ecm th\u1ea5y trang "' + ten + '".';
  var vals = sh.getDataRange().getValues();
  var headers = vals.length ? vals[0].map(function (h) { return String(h).trim(); }) : [];
  var i = {};
  headers.forEach(function (h, idx) { i[h] = idx; });
  return { sh: sh, headers: headers, rows: vals.slice(1), i: i };
}

/* \u0110\u1ecdc CauHinh th\u00e0nh object {ThamSo: GiaTri}. */
function docCauHinh_() {
  try {
    var t = docBang_(TAB.CH), o = {};
    t.rows.forEach(function (r) { if (r[t.i.ThamSo]) o[r[t.i.ThamSo]] = r[t.i.GiaTri]; });
    return o;
  } catch (e) { return {}; }
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 PHI\u00caN + KHO\u00c1 SAI \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

function taoPhien_(maDonVi) {
  var token = 'tk-' + maDonVi + '-' + Utilities.getUuid();
  CacheService.getScriptCache().put('phien_' + token, maDonVi, PHIEN_GIAY);
  return token;
}
function layPhien_(token) {
  if (!token) return null;
  return CacheService.getScriptCache().get('phien_' + token);
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 NH\u1eacT K\u00dd \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

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
  } catch (e) { /* kh\u00f4ng \u0111\u1ec3 l\u1ed7i ghi log ch\u1eb7n nghi\u1ec7p v\u1ee5 */ }
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u0110\u0102NG NH\u1eacP \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

function xuLyDangNhap_(p) {
  var ma = (p.maDonVi || '').trim();
  var tk = String(p.tenDangNhap || '').trim();
  var mk = String(p.matKhau || '').trim();
  if (!ma || !tk || !mk) return { ok: false, loi: 'Thi\u1ebfu \u0111\u01a1n v\u1ecb, t\u00ean \u0111\u0103ng nh\u1eadp ho\u1eb7c s\u1ed1 \u0111i\u1ec7n tho\u1ea1i.' };

  var cfg = docCauHinh_();
  var soToiDa = parseInt(cfg.SO_LAN_SAI_TOI_DA, 10) || 5;
  var phutKhoa = parseInt(cfg.PHUT_KHOA, 10) || 15;
  var cache = CacheService.getScriptCache();

  // \u0110ang b\u1ecb kho\u00e1?
  if (cache.get('khoa_' + ma)) return { ok: false, loi: '\u0110\u01a1n v\u1ecb \u0111ang t\u1ea1m b\u1ecb kho\u00e1 do nh\u1eadp sai nhi\u1ec1u l\u1ea7n. Vui l\u00f2ng th\u1eed l\u1ea1i sau ' + phutKhoa + ' ph\u00fat.' };

  var dv = docBang_(TAB.DV);
  var hang = null;
  for (var r = 0; r < dv.rows.length; r++) { if (String(dv.rows[r][dv.i.MaDonVi]).trim() === ma) { hang = dv.rows[r]; break; } }
  if (!hang) return { ok: false, loi: 'Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n v\u1ecb.' };

  var tkDung = String(hang[dv.i.TenDangNhap] || '').trim().toLowerCase();
  var mkDung = String(hang[dv.i.MatKhau] || '').replace(/^'/, '').trim();
  if (!tkDung || !mkDung) return { ok: false, loi: '\u0110\u01a1n v\u1ecb ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5p t\u00e0i kho\u1ea3n \u0111\u0103ng nh\u1eadp. Vui l\u00f2ng li\u00ean h\u1ec7 qu\u1ea3n tr\u1ecb.' };

  if (tk.toLowerCase() !== tkDung || mk !== mkDung) {
    // \u0110\u1ebfm s\u1ed1 l\u1ea7n sai; ghi nh\u1eadt k\u00fd; kho\u00e1 khi v\u01b0\u1ee3t ng\u01b0\u1ee1ng (kh\u00f4ng l\u1ed9 sai TK hay sai S\u0110T)
    var key = 'sai_' + ma;
    var soSai = (parseInt(cache.get(key), 10) || 0) + 1;
    cache.put(key, String(soSai), phutKhoa * 60);
    ghiNhatKy_(ma, tk || '\u0110\u01a1n v\u1ecb', '\u0110\u0102NG NH\u1eacP SAI', 'L\u1ea7n ' + soSai, '', '', diaChiIP_(p));
    if (soSai >= soToiDa) {
      cache.put('khoa_' + ma, '1', phutKhoa * 60);
      cache.remove(key);
      return { ok: false, loi: 'Nh\u1eadp sai qu\u00e1 ' + soToiDa + ' l\u1ea7n. \u0110\u01a1n v\u1ecb b\u1ecb kho\u00e1 trong ' + phutKhoa + ' ph\u00fat.' };
    }
    return { ok: false, loi: 'T\u00ean \u0111\u0103ng nh\u1eadp ho\u1eb7c s\u1ed1 \u0111i\u1ec7n tho\u1ea1i kh\u00f4ng \u0111\u00fang. C\u00f2n ' + (soToiDa - soSai) + ' l\u1ea7n th\u1eed.' };
  }

  // \u0110\u00fang \u2192 xo\u00e1 b\u1ed9 \u0111\u1ebfm, t\u1ea1o phi\u00ean
  cache.remove('sai_' + ma);
  var token = taoPhien_(ma);
  return { ok: true, data: { token: token, donVi: { maDonVi: ma, tenDonVi: hang[dv.i.TenDonVi], trangThai: hang[dv.i.TrangThai] || 'CHUA_RA_SOAT' } } };
}

function diaChiIP_(p) { return (p && p._ip) || ''; }  // GAS kh\u00f4ng l\u1ea5y \u0111\u01b0\u1ee3c IP th\u1eadt; \u0111\u1ec3 tr\u1ed1ng

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 L\u1ea4Y D\u1eee LI\u1ec6U \u0110\u01a0N V\u1eca \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

function xuLyLayDuLieu_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.' };

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

  // T\u00ecnh tr\u1ea1ng ch\u1eef k\u00fd
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

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 L\u01afU NH\u00c1P \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Ghi c\u1ed9t *_Moi + TrangThai + ThoiGianCapNhat theo ID. TUY\u1ec6T \u0110\u1ed0I kh\u00f4ng ghi \u0111\u00e8
   c\u1ed9t g\u1ed1c. B\u1ecdc LockService. Ki\u1ec3m tra MO_FORM v\u00e0 tr\u1ea1ng th\u00e1i DA_GUI \u1edf BACKEND.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function xuLyLuuNhap_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.' };

  var cfg = docCauHinh_();
  if (String(cfg.MO_FORM || 'CO').toUpperCase() !== 'CO') return { ok: false, loi: 'H\u1ec7 th\u1ed1ng \u0111\u00e3 \u0111\u00f3ng, kh\u00f4ng th\u1ec3 l\u01b0u.' };
  var dvHang = timDonVi_(ma);
  if (dvHang && dvHang.trangThai === 'DA_GUI') return { ok: false, loi: '\u0110\u01a1n v\u1ecb \u0111\u00e3 g\u1eedi ch\u00ednh th\u1ee9c, d\u1eef li\u1ec7u \u0111\u00e3 kho\u00e1.' };

  var danhSach = p.danhSach || [];
  if (!danhSach.length) return { ok: true, data: { soDong: 0 } };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);   // 126 \u0111\u01a1n v\u1ecb c\u00f3 th\u1ec3 v\u00e0o c\u00f9ng l\u00fac sau khi ph\u00e1t c\u00f4ng v\u0103n
  try {
    var ds = docBang_(TAB.DS);
    var sh = ds.sh, i = ds.i, W = ds.headers.length;
    // B\u1ea3n \u0111\u1ed3 ID -> s\u1ed1 h\u00e0ng th\u1ef1c (ch\u1ec9 trong ph\u1ea1m vi \u0111\u01a1n v\u1ecb n\u00e0y \u0111\u1ec3 ch\u1ed1ng s\u1eeda ch\u00e9o)
    var mapHang = {};
    for (var r = 0; r < ds.rows.length; r++) {
      if (String(ds.rows[r][i.MaDonVi]).trim() === ma) mapHang[String(ds.rows[r][i.ID])] = r + 2; // +2: b\u1ecf ti\u00eau \u0111\u1ec1, 1-based
    }
    var n = 0;
    danhSach.forEach(function (rec) {
      var soHang = mapHang[String(rec.id)];
      if (!soHang) return;   // kh\u00f4ng thu\u1ed9c \u0111\u01a1n v\u1ecb n\u00e0y \u2192 b\u1ecf qua (ch\u1ed1ng s\u1eeda ch\u00e9o)
      var hangCu = ds.rows[soHang - 2];
      var out = hangCu.slice();   // gi\u1eef nguy\u00ean to\u00e0n b\u1ed9 h\u00e0ng, ch\u1ec9 \u0111\u1ed5i c\u00e1c c\u1ed9t \u0111\u01b0\u1ee3c ph\u00e9p
      out[i.TrangThai] = rec.trangThai || 'CHUA_RA_SOAT';
      out[i.HoTen_Moi] = rec.hoTen_Moi || '';
      out[i.Lop_Moi] = rec.lop_Moi || '';
      out[i.TenTaiKhoan_Moi] = rec.tenTaiKhoan_Moi || '';
      out[i.SoDienThoai_Moi] = rec.soDienThoai_Moi ? ("'" + rec.soDienThoai_Moi) : '';   // nh\u00e1y \u0111\u01a1n gi\u1eef s\u1ed1 0 \u0111\u1ea7u
      out[i.EmailCongVu_Moi] = rec.emailCongVu_Moi || '';
      out[i.PhuTrachCNTT_Moi] = rec.phuTrachCNTT_Moi || '';
      out[i.GhiChuDonVi] = rec.ghiChuDonVi || '';
      out[i.ThoiGianCapNhat] = new Date();
      var rng = sh.getRange(soHang, 1, 1, W);
      rng.setNumberFormat('@');           // \u00e9p V\u0103n b\u1ea3n tr\u01b0\u1edbc khi ghi (ch\u1ed1ng Sheets \u0111\u1ed5i ki\u1ec3u)
      SpreadsheetApp.flush();
      rng.setValues([out]);
      n++;
    });
    // \u0110\u00e1nh d\u1ea5u \u0111\u01a1n v\u1ecb \u0111ang r\u00e0 so\u00e1t
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

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u1ea2NH CH\u1eee K\u00dd (B\u01af\u1edaC 2) \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Nh\u1eadn base64 PNG \u0111\u00e3 x\u1eed l\u00fd \u1edf client, l\u01b0u v\u00e0o Google Drive, ghi b\u1ea3ng ChuKy.
   \u1ea2nh g\u1ed1c KH\u00d4NG \u0111\u01b0\u1ee3c g\u1eedi l\u00ean \u2014 client \u0111\u00e3 t\u00e1ch n\u1ec1n/c\u1eaft vi\u1ec1n/thu nh\u1ecf.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function xuLyTaiChuKy_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.' };
  if (!p.anhBase64) return { ok: false, loi: 'Thi\u1ebfu d\u1eef li\u1ec7u \u1ea3nh ch\u1eef k\u00fd.' };

  var cfg = docCauHinh_();
  if (String(cfg.MO_FORM || 'CO').toUpperCase() !== 'CO') return { ok: false, loi: 'H\u1ec7 th\u1ed1ng \u0111\u00e3 \u0111\u00f3ng, kh\u00f4ng th\u1ec3 t\u1ea3i \u1ea3nh.' };
  var dvHang = timDonVi_(ma);
  if (dvHang && dvHang.trangThai === 'DA_GUI') return { ok: false, loi: '\u0110\u01a1n v\u1ecb \u0111\u00e3 g\u1eedi ch\u00ednh th\u1ee9c, d\u1eef li\u1ec7u \u0111\u00e3 kho\u00e1.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var tenDV = dvHang ? dvHang.tenDonVi : ma;
    var tenFile = 'CK_' + ma + '_' + tenTep_(tenDV) + '_' + tenTep_(p.hoTenChuTich || '') + '_' +
      Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd') + '.png';

    // Gi\u1ea3i m\u00e3 base64 \u2192 l\u01b0u Drive
    var bytes = Utilities.base64Decode(p.anhBase64);
    var blob = Utilities.newBlob(bytes, 'image/png', tenFile);
    var thuMuc = cfg.THU_MUC_DRIVE_ID ? DriveApp.getFolderById(cfg.THU_MUC_DRIVE_ID) : DriveApp.getRootFolder();
    var file = thuMuc.createFile(blob);
    var dungLuongKB = Math.round(file.getSize() / 1024);

    // Ghi b\u1ea3ng ChuKy \u2014 m\u1ed7i \u0111\u01a1n v\u1ecb 1 \u1ea3nh (thay \u1ea3nh c\u0169 n\u1ebfu t\u1ea3i l\u1ea1i)
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

    ghiNhatKy_(ma, '\u0110\u01a1n v\u1ecb', 'T\u1ea2I CH\u1eee K\u00dd', tenFile, '', dungLuongKB + ' KB', diaChiIP_(p));
    return { ok: true, data: { tenFile: tenFile, dungLuongKB: dungLuongKB } };
  } catch (err) {
    return { ok: false, loi: 'L\u01b0u \u1ea3nh th\u1ea5t b\u1ea1i: ' + err };
  } finally {
    lock.releaseLock();
  }
}

/* Chu\u1ea9n ho\u00e1 1 \u0111o\u1ea1n cho t\u00ean t\u1ec7p: b\u1ecf d\u1ea5u, gi\u1eef ch\u1eef-s\u1ed1, gh\u00e9p PascalCase. */
function tenTep_(s) {
  var kd = String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
  return kd.split(/[^A-Za-z0-9]+/).filter(String)
    .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 G\u1eecI CH\u00cdNH TH\u1ee8C (B\u01af\u1edaC 3) \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Ki\u1ec3m \u1edf BACKEND: MO_FORM, ch\u01b0a DA_GUI, \u0111\u00e3 r\u00e0 so\u00e1t H\u1ebeT, \u0111\u00e3 c\u00f3 ch\u1eef k\u00fd (n\u1ebfu c\u00f3 CT).
   Sinh m\u00e3 bi\u00ean nh\u1eadn XN-<Ma>-<yyyyMMdd-HHmm>, kho\u00e1 \u0111\u01a1n v\u1ecb.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function xuLyGuiChinhThuc_(p) {
  var ma = layPhien_(p.token);
  if (!ma) return { ok: false, loi: 'Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.' };
  var nguoi = (p.nguoiXacNhan || '').trim(), chucVu = (p.chucVu || '').trim();
  if (!nguoi || !chucVu) return { ok: false, loi: 'Vui l\u00f2ng nh\u1eadp h\u1ecd t\u00ean v\u00e0 ch\u1ee9c v\u1ee5 ng\u01b0\u1eddi x\u00e1c nh\u1eadn.' };

  var cfg = docCauHinh_();
  if (String(cfg.MO_FORM || 'CO').toUpperCase() !== 'CO') return { ok: false, loi: 'H\u1ec7 th\u1ed1ng \u0111\u00e3 \u0111\u00f3ng, kh\u00f4ng th\u1ec3 g\u1eedi.' };
  var dvHang = timDonVi_(ma);
  if (dvHang && dvHang.trangThai === 'DA_GUI') return { ok: false, loi: '\u0110\u01a1n v\u1ecb \u0111\u00e3 g\u1eedi ch\u00ednh th\u1ee9c tr\u01b0\u1edbc \u0111\u00f3.' };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // \u0110\u1ecdc danh s\u00e1ch c\u00e1n b\u1ed9 c\u1ee7a \u0111\u01a1n v\u1ecb \u2192 ki\u1ec3m r\u00e0 so\u00e1t h\u1ebft + th\u1ed1ng k\u00ea
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
    if (tong === 0) return { ok: false, loi: '\u0110\u01a1n v\u1ecb ch\u01b0a c\u00f3 d\u1eef li\u1ec7u c\u00e1n b\u1ed9.' };
    if (chuaRS) return { ok: false, loi: 'Ch\u01b0a r\u00e0 so\u00e1t h\u1ebft c\u00e1n b\u1ed9, kh\u00f4ng th\u1ec3 g\u1eedi.' };

    // Ki\u1ec3m \u1ea3nh ch\u1eef k\u00fd n\u1ebfu c\u00f2n Ch\u1ee7 t\u1ecbch H\u0110ND \u0111ang c\u00f4ng t\u00e1c
    if (coCTActive) {
      var ck = docBang_(TAB.CK);
      var coCK = ck.rows.some(function (r2) { return String(r2[ck.i.MaDonVi]).trim() === ma && r2[ck.i.FileID]; });
      if (!coCK) return { ok: false, loi: 'Ch\u01b0a t\u1ea3i \u1ea3nh ch\u1eef k\u00fd Ch\u1ee7 t\u1ecbch H\u0110ND.' };
    }

    var maBienNhan = 'XN-' + ma + '-' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmm');

    // C\u1eadp nh\u1eadt \u0111\u01a1n v\u1ecb: kho\u00e1 + ghi bi\u00ean nh\u1eadn
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

    ghiNhatKy_(ma, nguoi, 'G\u1eecI CH\u00cdNH TH\u1ee8C', maBienNhan, '', chucVu, diaChiIP_(p));
    return { ok: true, data: { maBienNhan: maBienNhan, thongKe: tk } };
  } catch (err) {
    return { ok: false, loi: 'G\u1eedi th\u1ea5t b\u1ea1i: ' + err };
  } finally {
    lock.releaseLock();
  }
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 QU\u1ea2N TR\u1eca (B\u01af\u1edaC 4) \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   M\u1eadt kh\u1ea9u qu\u1ea3n tr\u1ecb l\u01b0u \u1edf PropertiesService (ADMIN_PASSWORD) \u2014 KH\u00d4NG \u0111\u1ec3 trong
   CauHinh v\u00ec c\u00e1n b\u1ed9 xem \u0111\u01b0\u1ee3c Sheets. Phi\u00ean qu\u1ea3n tr\u1ecb gi\u1eef trong CacheService.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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
  if (!mk) return { ok: false, loi: 'Ch\u01b0a \u0111\u1eb7t m\u1eadt kh\u1ea9u qu\u1ea3n tr\u1ecb (ADMIN_PASSWORD) trong Thu\u1ed9c t\u00ednh t\u1eadp l\u1ec7nh.' };
  if (String(p.matKhau || '') !== mk) return { ok: false, loi: 'M\u1eadt kh\u1ea9u qu\u1ea3n tr\u1ecb kh\u00f4ng \u0111\u00fang.' };
  return { ok: true, data: { token: taoAdminPhien_() } };
}

function xuLyAdminTongQuan_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phi\u00ean qu\u1ea3n tr\u1ecb \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.' };
  var dv = docBang_(TAB.DV);
  // t\u1eadp MaDonVi \u0111\u00e3 c\u00f3 \u1ea3nh ch\u1eef k\u00fd
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
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phi\u00ean qu\u1ea3n tr\u1ecb \u0111\u00e3 h\u1ebft h\u1ea1n.' };
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
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phi\u00ean qu\u1ea3n tr\u1ecb \u0111\u00e3 h\u1ebft h\u1ea1n.' };
  var ma = (p.maDonVi || '').trim();
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var dv = docBang_(TAB.DV);
    for (var r = 0; r < dv.rows.length; r++) {
      if (String(dv.rows[r][dv.i.MaDonVi]).trim() === ma) {
        if ((dv.rows[r][dv.i.TrangThai] || '') !== 'DA_GUI') return { ok: false, loi: '\u0110\u01a1n v\u1ecb ch\u01b0a g\u1eedi n\u00ean kh\u00f4ng c\u1ea7n m\u1edf kho\u00e1.' };
        dv.sh.getRange(r + 2, dv.i.TrangThai + 1).setValue('DANG_RA_SOAT');
        ghiNhatKy_(ma, 'Qu\u1ea3n tr\u1ecb', 'M\u1ede KHO\u00c1', ma, 'DA_GUI', 'DANG_RA_SOAT', diaChiIP_(p));
        return { ok: true, data: { maDonVi: ma, trangThai: 'DANG_RA_SOAT' } };
      }
    }
    return { ok: false, loi: 'Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n v\u1ecb.' };
  } finally { lock.releaseLock(); }
}

/* \u0110\u00f4n \u0111\u1ed1c: g\u1eedi email nh\u1eafc c\u00e1c \u0111\u01a1n v\u1ecb \u0111\u01b0\u1ee3c ch\u1ecdn. Chia l\u00f4 + b\u1ecdc try/catch \u0111\u1ec3
   h\u1ebft h\u1ea1n ng\u1ea1ch (100/ng\u00e0y) ho\u1eb7c 1 email l\u1ed7i KH\u00d4NG ch\u1eb7n c\u1ea3 m\u1ebb. */
function xuLyAdminDonDoc_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phi\u00ean qu\u1ea3n tr\u1ecb \u0111\u00e3 h\u1ebft h\u1ea1n.' };
  var dsMa = p.dsMaDonVi || [];
  if (!dsMa.length) return { ok: false, loi: 'Ch\u01b0a ch\u1ecdn \u0111\u01a1n v\u1ecb \u0111\u1ec3 \u0111\u00f4n \u0111\u1ed1c.' };

  // B\u1ea3n \u0111\u1ed3 MaDonVi -> email \u0111\u1ea7u m\u1ed1i CNTT (t\u1eeb DanhSach)
  var ds = docBang_(TAB.DS), emailDauMoi = {};
  for (var r = 0; r < ds.rows.length; r++) {
    if (String(ds.rows[r][ds.i.PhuTrachCNTT]).trim().toLowerCase() === 'x') {
      emailDauMoi[String(ds.rows[r][ds.i.MaDonVi]).trim()] = String(ds.rows[r][ds.i.EmailCongVu] || '').trim();
    }
  }
  var dvTen = {}; var dv = docBang_(TAB.DV);
  dv.rows.forEach(function (row) { dvTen[String(row[dv.i.MaDonVi]).trim()] = row[dv.i.TenDonVi]; });

  var daGui = 0, thatBai = 0, boQua = 0, LO = 50;   // chia l\u00f4 50 m\u1ed7i v\u00f2ng
  for (var i = 0; i < dsMa.length && i < LO; i++) {
    var ma = String(dsMa[i]).trim();
    var email = emailDauMoi[ma];
    if (!email || !/^[^@\s]+@[^@\s]+$/.test(email)) { boQua++; continue; }
    try {
      if (MailApp.getRemainingDailyQuota() <= 0) { boQua++; continue; }
      MailApp.sendEmail(email,
        '\u0110\u00f4n \u0111\u1ed1c r\u00e0 so\u00e1t t\u00e0i kho\u1ea3n c\u00e1n b\u1ed9 \u2014 ' + (dvTen[ma] || ma),
        'K\u00ednh \u0111\u1ec1 ngh\u1ecb \u0111\u01a1n v\u1ecb ' + (dvTen[ma] || ma) + ' ho\u00e0n th\u00e0nh r\u00e0 so\u00e1t, c\u1eadp nh\u1eadt th\u00f4ng tin ' +
        't\u00e0i kho\u1ea3n c\u00e1n b\u1ed9 v\u00e0 g\u1eedi ch\u00ednh th\u1ee9c \u0111\u00fang h\u1ea1n.\n\nTr\u00e2n tr\u1ecdng.');
      daGui++;
    } catch (e) { thatBai++; }
  }
  ghiNhatKy_('', 'Qu\u1ea3n tr\u1ecb', '\u0110\u00d4N \u0110\u1ed0C', dsMa.length + ' \u0111\u01a1n v\u1ecb', '', 'G\u1eedi ' + daGui + ' \u00b7 l\u1ed7i ' + thatBai + ' \u00b7 b\u1ecf qua ' + boQua, diaChiIP_(p));
  return { ok: true, data: { daGui: daGui, thatBai: thatBai, boQua: boQua, tongYeuCau: dsMa.length, conLai: Math.max(0, dsMa.length - LO) } };
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 H\u1ee2P NH\u1ea4T K\u1ebeT QU\u1ea2 CU\u1ed0I + D\u00d2 TR\u00d9NG (B\u01af\u1edaC 5) \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   H\u1ee3p nh\u1ea5t: DUNG \u2192 gi\u1eef g\u1ed1c; SUA \u2192 l\u1ea5y *_Moi; XOA \u2192 lo\u1ea1i b\u1ecf. Xu\u1ea5t ra trang KetQuaCuoi.
   D\u00f2 tr\u00f9ng email / t\u00ean t\u00e0i kho\u1ea3n / S\u0110T TR\u00caN PH\u1ea0M VI C\u1ea2 126 \u0110\u01a0N V\u1eca (r\u00e0 so\u00e1t t\u1eebng
   \u0111\u01a1n v\u1ecb kh\u00f4ng ph\u00e1t hi\u1ec7n m\u00e2u thu\u1eabn ch\u00e9o gi\u1eefa hai x\u00e3).
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function xuLyAdminHopNhat_(p) {
  if (!layAdminPhien_(p.token)) return { ok: false, loi: 'Phi\u00ean qu\u1ea3n tr\u1ecb \u0111\u00e3 h\u1ebft h\u1ea1n.' };
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try { return { ok: true, data: hopNhatVaDoTrung_() }; }
  catch (err) { return { ok: false, loi: 'H\u1ee3p nh\u1ea5t th\u1ea5t b\u1ea1i: ' + err }; }
  finally { lock.releaseLock(); }
}

function hopNhatVaDoTrung_() {
  var ds = docBang_(TAB.DS), i = ds.i, ban = [];
  ds.rows.forEach(function (r) {
    var tt = r[i.TrangThai] || 'CHUA_RA_SOAT';
    if (tt === 'XOA') return;                         // XOA \u2192 lo\u1ea1i kh\u1ecfi k\u1ebft qu\u1ea3 cu\u1ed1i
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
  doTrungTren_(ban, 'tenTaiKhoan', function (x) { return String(x || '').trim().toLowerCase(); }, 'T\u00ean t\u00e0i kho\u1ea3n');
  doTrungTren_(ban, 'soDienThoai', function (x) { return String(x || '').replace(/\D/g, ''); }, 'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i');

  // Ghi ra KetQuaCuoi (xo\u00e1 c\u0169, ghi m\u1edbi; S\u0110T d\u1ea1ng V\u0103n b\u1ea3n gi\u1eef s\u1ed1 0 \u0111\u1ea7u)
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
    trung: { email: demNhom_(ban, 'Email'), tenTaiKhoan: demNhom_(ban, 'T\u00ean t\u00e0i kho\u1ea3n'), soDienThoai: demNhom_(ban, 'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i') },
    viDu: viDuTrung_(ban)
  };
}

/* G\u1eafn nh\u00e3n tr\u00f9ng v\u00e0o t\u1eebng b\u1ea3n ghi; ph\u00e2n bi\u1ec7t "gi\u1eefa c\u00e1c \u0111\u01a1n v\u1ecb" / "trong \u0111\u01a1n v\u1ecb". */
function doTrungTren_(ban, khoa, chuan, nhan) {
  var m = {};
  ban.forEach(function (b) { var v = chuan(b[khoa]); if (v) (m[v] = m[v] || []).push(b); });
  Object.keys(m).forEach(function (k) {
    var g = m[k]; if (g.length < 2) return;
    var dv = {}; g.forEach(function (b) { dv[b.maDonVi] = 1; });
    var pv = Object.keys(dv).length > 1 ? 'gi\u1eefa c\u00e1c \u0111\u01a1n v\u1ecb' : 'trong \u0111\u01a1n v\u1ecb';
    g.forEach(function (b) { b.tc.push(nhan + ' tr\u00f9ng ' + pv); });
  });
}
function demNhom_(ban, nhan) {
  var s = {}; ban.forEach(function (b) { b.tc.forEach(function (t) { if (t.indexOf(nhan) === 0) s[b[nhanKey_(nhan)]] = 1; }); });
  return Object.keys(s).length;
}
function nhanKey_(nhan) { return nhan === 'Email' ? 'emailCongVu' : nhan === 'T\u00ean t\u00e0i kho\u1ea3n' ? 'tenTaiKhoan' : 'soDienThoai'; }
function viDuTrung_(ban) {
  // gom v\u00e0i nh\u00f3m tr\u00f9ng "gi\u1eefa c\u00e1c \u0111\u01a1n v\u1ecb" \u0111\u1ec3 hi\u1ec3n th\u1ecb cho qu\u1ea3n tr\u1ecb
  var out = [], seen = {};
  ['Email', 'T\u00ean t\u00e0i kho\u1ea3n', 'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i'].forEach(function (nhan) {
    var key = nhanKey_(nhan), m = {};
    ban.forEach(function (b) { if (b.tc.some(function (t) { return t === nhan + ' tr\u00f9ng gi\u1eefa c\u00e1c \u0111\u01a1n v\u1ecb'; })) (m[String(b[key]).toLowerCase()] = m[String(b[key]).toLowerCase()] || []).push(b); });
    Object.keys(m).forEach(function (k) {
      if (out.length >= 40 || seen[nhan + k]) return; seen[nhan + k] = 1;
      out.push({ loai: nhan, giaTri: m[k][0][key], donVi: m[k].map(function (b) { return b.tenDonVi + ' \u2014 ' + b.hoTen; }) });
    });
  });
  return out;
}
