/* ============================================================================
   api.js — LỚP GIAO TIẾP BACKEND + DỮ LIỆU MẪU + VALIDATE + TIỆN ÍCH
   Nạp thuần bằng <script>, không module/bundler. Mọi thứ gắn vào window.
   ========================================================================== */

/* ─────────────────────────────────────────────────────────────────────────
   CỜ DEMO
   Bật (true): dùng dữ liệu mẫu ngay trong trình duyệt, KHÔNG cần Apps Script.
   Tắt (false): gọi thật tới GAS_URL (bake sau khi triển khai Code.gs).
   ───────────────────────────────────────────────────────────────────────── */
window.DEMO = true;

/* URL /exec của Apps Script — chỉ dùng khi DEMO = false. Bake sau (Bước triển khai). */
window.GAS_URL = '';

/* ═══════════════════════════════ TIỆN ÍCH ═══════════════════════════════ */
window.Util = {
  /* Bỏ dấu tiếng Việt + thường hoá → phục vụ so khớp tên đơn vị "gõ không dấu". */
  khongDau: function (s) {
    return (s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().trim();
  },
  /* Gộp nhiều lần gọi trong khoảng chờ (ms) rồi mới chạy — dùng cho lưu nháp. */
  debounce: function (fn, ms) {
    var t;
    return function () {
      var self = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  },
  /* yyyyMMdd cho tên tệp / mã biên nhận. */
  ngayYMD: function (d) {
    d = d || new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
  },
  /* yyyyMMdd-HHmm cho mã biên nhận XN-<Ma>-<...>. */
  maThoiGian: function (d) {
    d = d || new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return this.ngayYMD(d) + '-' + p(d.getHours()) + p(d.getMinutes());
  },
  /* Chuẩn hoá 1 đoạn cho tên tệp: bỏ dấu, chỉ giữ chữ-số, ghép PascalCase. */
  tenTep: function (s) {
    return this.khongDau(s).split(/[^a-z0-9]+/).filter(Boolean)
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
  },
  escapeHtml: function (s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};

/* ═════════════════════════════ VALIDATE ═════════════════════════════════
   Chạy ngay khi người dùng gõ. Trả {ok:true} hoặc {ok:false, loi:'tiếng Việt'}.
   Email: BA thông báo tách riêng có chủ đích — lỗi thật hay gặp là dấu tiếng
   Việt lẫn trong phần tên email, người dùng không tự nhận ra nếu báo chung chung.
   ───────────────────────────────────────────────────────────────────────── */
window.Validate = {
  emailCongVu: function (v) {
    v = (v || '').trim();
    if (!v) return { ok: false, loi: 'Chưa nhập email công vụ.' };
    // 1) Ký tự ngoài ASCII (dấu tiếng Việt) — kiểm tra trước tiên
    if (/[^\x00-\x7F]/.test(v)) return { ok: false, loi: 'Email không được có dấu tiếng Việt.' };
    // 2) Có chữ hoa
    if (/[A-Z]/.test(v)) return { ok: false, loi: 'Email phải viết thường toàn bộ.' };
    // 3) Đúng khuôn @hanoi.gov.vn
    if (!/^[a-z0-9._-]+@hanoi\.gov\.vn$/.test(v)) return { ok: false, loi: 'Email phải có dạng ten@hanoi.gov.vn.' };
    return { ok: true };
  },
  soDienThoai: function (v) {
    v = (v || '').trim();
    if (!v) return { ok: false, loi: 'Chưa nhập số điện thoại.' };
    if (!/^0\d{9}$/.test(v)) return { ok: false, loi: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.' };
    return { ok: true };
  },
  tenTaiKhoan: function (v) {
    v = (v || '').trim();
    if (!v) return { ok: false, loi: 'Chưa nhập tên tài khoản.' };
    if (!/^[a-z0-9._-]+$/.test(v)) return { ok: false, loi: 'Tên tài khoản chỉ gồm chữ thường, số và . _ -' };
    return { ok: true };
  }
};

/* ═══════════════════════ DỮ LIỆU MẪU (chỉ khi DEMO) ══════════════════════
   Cố tình cài sẵn đủ 4 loại lỗi trong dữ liệu thật để kiểm thử giao diện:
   sai tên miền · email có dấu · email trùng chéo · SĐT trùng chéo.
   Mật khẩu đăng nhập = SĐT của cán bộ phụ trách CNTT của đơn vị.
   ───────────────────────────────────────────────────────────────────────── */
window.DemoDB = {
  donVi: [
    { maDonVi: 'DV064', tenDonVi: 'Phường Cửa Nam', tenKhongDau: 'phuong cua nam', tenDangNhap: 'hoang.van.em', matKhau: '0912345678', trangThai: 'CHUA_RA_SOAT' },
    { maDonVi: 'DV001', tenDonVi: 'Xã Ba Vì',       tenKhongDau: 'xa ba vi',        tenDangNhap: 'bui.thi.lan', matKhau: '0987654321', trangThai: 'DANG_RA_SOAT' },
    { maDonVi: 'DV112', tenDonVi: 'Phường Hoàn Kiếm', tenKhongDau: 'phuong hoan kiem', tenDangNhap: 'cntt.hoankiem', matKhau: '0900000000', trangThai: 'DA_GUI' }
  ],
  /* Mỗi cán bộ giữ NGUYÊN tên cột nghiệp vụ; cột *_Moi để trống lúc đầu. */
  danhSach: [
    // ── DV064 · Phường Cửa Nam ──
    { id: 'DV064-CT1',  maDonVi: 'DV064', lop: 'CT',   hoTen: 'Nguyễn Văn An',  tenTaiKhoan: 'nguyen.van.an',  phuTrachCNTT: '', soDienThoai: '0912345670', emailCongVu: 'nguyen.van.an@hanoi.gov.vn', canhBao: '' },
    { id: 'DV064-PCT1', maDonVi: 'DV064', lop: 'PCT',  hoTen: 'Trần Thị Bình',  tenTaiKhoan: 'tran.thi.binh', phuTrachCNTT: '', soDienThoai: '0912345671', emailCongVu: 'tran.thị.binh@hanoi.gov.vn', canhBao: 'Email có dấu tiếng Việt' },
    { id: 'DV064-BAN1', maDonVi: 'DV064', lop: 'BAN',  hoTen: 'Lê Văn Cường',   tenTaiKhoan: 'le.van.cuong',  phuTrachCNTT: '', soDienThoai: '0912345672', emailCongVu: 'Le.Van.Cuong@hanoi.gov.vn', canhBao: 'Email có chữ hoa' },
    { id: 'DV064-CV1',  maDonVi: 'DV064', lop: 'CV',   hoTen: 'Phạm Thị Dung',  tenTaiKhoan: 'pham.thi.dung', phuTrachCNTT: '', soDienThoai: '0912345673', emailCongVu: 'pham.thi.dung@gmail.com', canhBao: 'Email sai tên miền (không phải @hanoi.gov.vn)' },
    { id: 'DV064-PCVP1',maDonVi: 'DV064', lop: 'PCVP', hoTen: 'Hoàng Văn Em',   tenTaiKhoan: 'hoang.van.em',  phuTrachCNTT: 'x', soDienThoai: '0912345678', emailCongVu: 'hoang.van.em@hanoi.gov.vn', canhBao: '' },
    // ── DV001 · Xã Ba Vì ── (có lỗi trùng chéo với DV064)
    { id: 'DV001-CT1',  maDonVi: 'DV001', lop: 'CT',   hoTen: 'Đỗ Thị Hoa',     tenTaiKhoan: 'do.thi.hoa',    phuTrachCNTT: '', soDienThoai: '0912345670', emailCongVu: 'do.thi.hoa@hanoi.gov.vn', canhBao: 'Số điện thoại trùng với đơn vị khác' },
    { id: 'DV001-CV1',  maDonVi: 'DV001', lop: 'CV',   hoTen: 'Vũ Văn Khánh',   tenTaiKhoan: 'vu.van.khanh',  phuTrachCNTT: '', soDienThoai: '0987654320', emailCongVu: 'nguyen.van.an@hanoi.gov.vn', canhBao: 'Email trùng với đơn vị khác' },
    { id: 'DV001-PCVP1',maDonVi: 'DV001', lop: 'PCVP', hoTen: 'Bùi Thị Lan',    tenTaiKhoan: 'bui.thi.lan',   phuTrachCNTT: 'x', soDienThoai: '0987654321', emailCongVu: 'bui.thi.lan@hanoi.gov.vn', canhBao: '' }
  ],
  /* Trạng thái phiên demo giữ trong RAM (KHÔNG localStorage — ràng buộc bảo mật). */
  phien: {},          // token -> maDonVi
  adminPhien: {},     // token quản trị
  soLanSai: {},       // maDonVi -> số lần
  luuTam: {},         // id -> bản chỉnh sửa đã lưu nháp
  chuKyLuu: { DV112: { tenFile: 'CK_DV112_PhuongHoanKiem_LeVanF_20260718.png', dungLuongKB: 8 } },
  bienNhan: { DV112: 'XN-DV112-20260718-0900' }   // demo: 1 đơn vị đã gửi sẵn
};

/* ═══════════════════════════════ LỚP API ═══════════════════════════════════
   Mọi phản hồi thống nhất: {ok:true, data:{...}} hoặc {ok:false, loi:'...'}.
   ───────────────────────────────────────────────────────────────────────── */
window.API = (function () {
  var SO_LAN_SAI_TOI_DA = 5;      // đồng bộ với CauHinh khi chạy thật
  var ADMIN_DEMO = 'admin123';    // mật khẩu quản trị khi DEMO (thật: PropertiesService ADMIN_PASSWORD)

  /* Gọi thật tới Apps Script (khi DEMO=false).
     CORS: Content-Type text/plain để tránh preflight OPTIONS mà GAS không xử lý. */
  function goiThat(payload) {
    return fetch(window.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    }).then(function (r) { return r.text(); })
      .then(function (t) {
        try { return JSON.parse(t); }
        catch (e) { return { ok: false, loi: 'Máy chủ trả về dữ liệu không hợp lệ.' }; }
      })
      .catch(function () { return { ok: false, loi: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.' }; });
  }

  /* Giả lập độ trễ mạng cho mượt UI demo. */
  function tre(data, ms) {
    return new Promise(function (res) { setTimeout(function () { res(data); }, ms || 260); });
  }

  /* ---------- DEMO handlers ---------- */
  function demo(payload) {
    var D = window.DemoDB;
    switch (payload.hanhDong) {
      case 'dangNhap': {
        var dv = D.donVi.find(function (x) { return x.maDonVi === payload.maDonVi; });
        if (!dv) return tre({ ok: false, loi: 'Không tìm thấy đơn vị.' });
        var key = payload.maDonVi;
        if ((D.soLanSai[key] || 0) >= SO_LAN_SAI_TOI_DA) {
          return tre({ ok: false, loi: 'Đơn vị đã nhập sai quá số lần cho phép. Vui lòng thử lại sau ít phút.' });
        }
        if (!dv.tenDangNhap || !dv.matKhau) {
          return tre({ ok: false, loi: 'Đơn vị chưa được cấp tài khoản đăng nhập. Vui lòng liên hệ quản trị.' });
        }
        var dungTK = String(payload.tenDangNhap || '').trim().toLowerCase() === String(dv.tenDangNhap).toLowerCase();
        var dungMK = String(payload.matKhau) === String(dv.matKhau);
        if (!dungTK || !dungMK) {
          D.soLanSai[key] = (D.soLanSai[key] || 0) + 1;
          var conLai = SO_LAN_SAI_TOI_DA - D.soLanSai[key];
          return tre({ ok: false, loi: 'Tên đăng nhập hoặc số điện thoại không đúng.' + (conLai > 0 ? ' Còn ' + conLai + ' lần thử.' : ' Tài khoản tạm khoá.') });
        }
        D.soLanSai[key] = 0;
        var token = 'demo-' + key + '-' + Date.now();
        D.phien[token] = key;
        return tre({ ok: true, data: { token: token, donVi: { maDonVi: dv.maDonVi, tenDonVi: dv.tenDonVi, trangThai: dv.trangThai } } });
      }
      case 'layDuLieu': {
        var ma = D.phien[payload.token];
        if (!ma) return tre({ ok: false, loi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        var ds = D.danhSach.filter(function (c) { return c.maDonVi === ma; }).map(function (c) {
          var luu = D.luuTam[c.id] || {};
          return {
            id: c.id, maDonVi: c.maDonVi, lop: c.lop,
            hoTen: c.hoTen, tenTaiKhoan: c.tenTaiKhoan, phuTrachCNTT: c.phuTrachCNTT,
            soDienThoai: c.soDienThoai, emailCongVu: c.emailCongVu,
            canhBaoHeThong: c.canhBao,
            // bản nháp đã lưu (nếu có) để khôi phục sau khi tải lại
            trangThai: luu.trangThai || 'CHUA_RA_SOAT',
            hoTen_Moi: luu.hoTen_Moi || '', lop_Moi: luu.lop_Moi || '',
            tenTaiKhoan_Moi: luu.tenTaiKhoan_Moi || '', soDienThoai_Moi: luu.soDienThoai_Moi || '',
            emailCongVu_Moi: luu.emailCongVu_Moi || '', phuTrachCNTT_Moi: luu.phuTrachCNTT_Moi || '',
            ghiChuDonVi: luu.ghiChuDonVi || ''
          };
        });
        var ctDs = ds.find(function (c) { return c.lop === 'CT'; });
        var canCK = !!ctDs && ctDs.trangThai !== 'XOA';
        var dv2 = D.donVi.find(function (x) { return x.maDonVi === ma; });
        return tre({ ok: true, data: {
          donVi: { maDonVi: ma, tenDonVi: dv2.tenDonVi, trangThai: dv2.trangThai, maBienNhan: D.bienNhan[ma] || '' },
          danhSach: ds,
          chuKy: { daTai: !!D.chuKyLuu[ma], canChuKy: canCK, tenFile: (D.chuKyLuu[ma] || {}).tenFile || '' }
        } });
      }
      case 'luuNhap': {
        var ma2 = D.phien[payload.token];
        if (!ma2) return tre({ ok: false, loi: 'Phiên đăng nhập đã hết hạn.' });
        var n = 0;
        (payload.danhSach || []).forEach(function (r) {
          D.luuTam[r.id] = r;   // giữ nguyên cột gốc, chỉ lưu bản nháp *_Moi + trạng thái
          n++;
        });
        return tre({ ok: true, data: { soDong: n } });
      }
      case 'taiChuKy': {
        var maCK = D.phien[payload.token];
        if (!maCK) return tre({ ok: false, loi: 'Phiên đăng nhập đã hết hạn.' });
        if (!payload.anhBase64) return tre({ ok: false, loi: 'Thiếu dữ liệu ảnh chữ ký.' });
        var dvCK = D.donVi.find(function (x) { return x.maDonVi === maCK; });
        var kb = Math.round(payload.anhBase64.length * 3 / 4 / 1024);
        var tenFile = 'CK_' + maCK + '_' + window.Util.tenTep(dvCK.tenDonVi) + '_' + window.Util.tenTep(payload.hoTenChuTich || '') + '_' + window.Util.ngayYMD() + '.png';
        D.chuKyLuu[maCK] = { tenFile: tenFile, dungLuongKB: kb };
        return tre({ ok: true, data: { tenFile: tenFile, dungLuongKB: kb } }, 600);
      }
      case 'guiChinhThuc': {
        var maG = D.phien[payload.token];
        if (!maG) return tre({ ok: false, loi: 'Phiên đăng nhập đã hết hạn.' });
        if (!payload.nguoiXacNhan || !payload.chucVu) return tre({ ok: false, loi: 'Vui lòng nhập họ tên và chức vụ người xác nhận.' });
        var dsG = D.danhSach.filter(function (c) { return c.maDonVi === maG; });
        var chuaRS = dsG.some(function (c) { var l = D.luuTam[c.id]; return !l || !l.trangThai || l.trangThai === 'CHUA_RA_SOAT'; });
        if (chuaRS) return tre({ ok: false, loi: 'Chưa rà soát hết cán bộ, không thể gửi.' });
        var ctG = dsG.find(function (c) { return c.lop === 'CT'; });
        var ctXoa = ctG && D.luuTam[ctG.id] && D.luuTam[ctG.id].trangThai === 'XOA';
        if (ctG && !ctXoa && !D.chuKyLuu[maG]) return tre({ ok: false, loi: 'Chưa tải ảnh chữ ký Chủ tịch HĐND.' });
        var tk = { giuNguyen: 0, daSua: 0, khongCon: 0 };
        dsG.forEach(function (c) {
          var t = (D.luuTam[c.id] || {}).trangThai;
          if (t === 'DUNG') tk.giuNguyen++; else if (t === 'SUA') tk.daSua++; else if (t === 'XOA') tk.khongCon++;
        });
        var maBN = 'XN-' + maG + '-' + window.Util.maThoiGian(new Date());
        D.bienNhan[maG] = maBN;
        var dvG = D.donVi.find(function (x) { return x.maDonVi === maG; });
        if (dvG) dvG.trangThai = 'DA_GUI';
        return tre({ ok: true, data: { maBienNhan: maBN, thongKe: tk } }, 600);
      }

      /* ───────── QUẢN TRỊ (demo mật khẩu 'admin123') ───────── */
      case 'adminDangNhap': {
        if (String(payload.matKhau) !== ADMIN_DEMO) return tre({ ok: false, loi: 'Mật khẩu quản trị không đúng.' });
        var at = 'admin-' + Date.now(); D.adminPhien[at] = true;
        return tre({ ok: true, data: { token: at } });
      }
      case 'adminTongQuan': {
        if (!D.adminPhien[payload.token]) return tre({ ok: false, loi: 'Phiên quản trị đã hết hạn.' });
        var ds126 = D.donVi.map(function (d) {
          var ng = D.danhSach.filter(function (c) { return c.maDonVi === d.maDonVi; });
          var soLoi = ng.filter(function (c) { return c.canhBao && c.canhBao.trim(); }).length;
          return { maDonVi: d.maDonVi, tenDonVi: d.tenDonVi, trangThai: d.trangThai,
            soNguoi: ng.length, soLoiBanDau: soLoi, maBienNhan: D.bienNhan[d.maDonVi] || '',
            coChuKy: !!D.chuKyLuu[d.maDonVi] };
        });
        return tre({ ok: true, data: { donVi: ds126 } });
      }
      case 'adminChiTiet': {
        if (!D.adminPhien[payload.token]) return tre({ ok: false, loi: 'Phiên quản trị đã hết hạn.' });
        var maCt = payload.maDonVi;
        var dvCt = D.donVi.find(function (x) { return x.maDonVi === maCt; });
        var dsCt = D.danhSach.filter(function (c) { return c.maDonVi === maCt; }).map(function (c) {
          var luu = D.luuTam[c.id] || {};
          return { id: c.id, lop: c.lop, hoTen: c.hoTen, tenTaiKhoan: c.tenTaiKhoan,
            soDienThoai: c.soDienThoai, emailCongVu: c.emailCongVu, phuTrachCNTT: c.phuTrachCNTT,
            canhBaoHeThong: c.canhBao, trangThai: luu.trangThai || 'CHUA_RA_SOAT',
            hoTen_Moi: luu.hoTen_Moi || '', lop_Moi: luu.lop_Moi || '', tenTaiKhoan_Moi: luu.tenTaiKhoan_Moi || '',
            soDienThoai_Moi: luu.soDienThoai_Moi || '', emailCongVu_Moi: luu.emailCongVu_Moi || '',
            phuTrachCNTT_Moi: luu.phuTrachCNTT_Moi || '', ghiChuDonVi: luu.ghiChuDonVi || '' };
        });
        var ckCt = D.chuKyLuu[maCt];
        return tre({ ok: true, data: {
          donVi: { maDonVi: maCt, tenDonVi: dvCt ? dvCt.tenDonVi : '', trangThai: dvCt ? dvCt.trangThai : '', maBienNhan: D.bienNhan[maCt] || '' },
          danhSach: dsCt,
          chuKy: ckCt ? { daTai: true, tenFile: ckCt.tenFile, dungLuongKB: ckCt.dungLuongKB, linkXem: '' } : { daTai: false }
        } });
      }
      case 'adminMoKhoa': {
        if (!D.adminPhien[payload.token]) return tre({ ok: false, loi: 'Phiên quản trị đã hết hạn.' });
        var dvMk = D.donVi.find(function (x) { return x.maDonVi === payload.maDonVi; });
        if (!dvMk) return tre({ ok: false, loi: 'Không tìm thấy đơn vị.' });
        if (dvMk.trangThai !== 'DA_GUI') return tre({ ok: false, loi: 'Đơn vị chưa gửi nên không cần mở khoá.' });
        dvMk.trangThai = 'DANG_RA_SOAT';
        return tre({ ok: true, data: { maDonVi: dvMk.maDonVi, trangThai: dvMk.trangThai } });
      }
      case 'adminDonDoc': {
        if (!D.adminPhien[payload.token]) return tre({ ok: false, loi: 'Phiên quản trị đã hết hạn.' });
        var dsMa = payload.dsMaDonVi || [];
        return tre({ ok: true, data: { daGui: dsMa.length, thatBai: 0, tongYeuCau: dsMa.length } }, 500);
      }
      case 'adminHopNhat': {
        if (!D.adminPhien[payload.token]) return tre({ ok: false, loi: 'Phiên quản trị đã hết hạn.' });
        var ban = [];
        D.danhSach.forEach(function (c) {
          var luu = D.luuTam[c.id] || {}; var tt = luu.trangThai || 'CHUA_RA_SOAT';
          if (tt === 'XOA') return; var sua = (tt === 'SUA');
          ban.push({
            maDonVi: c.maDonVi, tenDonVi: (D.donVi.find(function (x) { return x.maDonVi === c.maDonVi; }) || {}).tenDonVi || c.maDonVi,
            hoTen: sua && luu.hoTen_Moi ? luu.hoTen_Moi : c.hoTen,
            tenTaiKhoan: sua && luu.tenTaiKhoan_Moi ? luu.tenTaiKhoan_Moi : c.tenTaiKhoan,
            soDienThoai: sua && luu.soDienThoai_Moi ? luu.soDienThoai_Moi : c.soDienThoai,
            emailCongVu: sua && luu.emailCongVu_Moi ? luu.emailCongVu_Moi : c.emailCongVu, tc: []
          });
        });
        var doTC = function (khoa, chuan, nhan) {
          var m = {}; ban.forEach(function (b) { var v = chuan(b[khoa]); if (v) (m[v] = m[v] || []).push(b); });
          var soNhom = 0;
          Object.keys(m).forEach(function (k) {
            if (m[k].length < 2) return; soNhom++;
            var dv = {}; m[k].forEach(function (b) { dv[b.maDonVi] = 1; });
            var pv = Object.keys(dv).length > 1 ? 'giữa các đơn vị' : 'trong đơn vị';
            m[k].forEach(function (b) { b.tc.push(nhan + ' trùng ' + pv); });
          });
          return { soNhom: soNhom, map: m };
        };
        var e = doTC('emailCongVu', function (x) { return String(x || '').trim().toLowerCase(); }, 'Email');
        var t = doTC('tenTaiKhoan', function (x) { return String(x || '').trim().toLowerCase(); }, 'Tên tài khoản');
        var s = doTC('soDienThoai', function (x) { return String(x || '').replace(/\D/g, ''); }, 'Số điện thoại');
        var viDu = [];
        [['Email', e, 'emailCongVu'], ['Tên tài khoản', t, 'tenTaiKhoan'], ['Số điện thoại', s, 'soDienThoai']].forEach(function (pr) {
          Object.keys(pr[1].map).forEach(function (k) {
            var g = pr[1].map[k]; if (g.length < 2) return;
            var dv = {}; g.forEach(function (b) { dv[b.maDonVi] = 1; });
            if (Object.keys(dv).length > 1) viDu.push({ loai: pr[0], giaTri: g[0][pr[2]], donVi: g.map(function (b) { return b.tenDonVi + ' — ' + b.hoTen; }) });
          });
        });
        return tre({ ok: true, data: {
          soBanGhi: ban.length, soDongTrung: ban.filter(function (b) { return b.tc.length; }).length,
          trung: { email: e.soNhom, tenTaiKhoan: t.soNhom, soDienThoai: s.soNhom }, viDu: viDu.slice(0, 40)
        } }, 500);
      }

      default:
        return tre({ ok: false, loi: 'Hành động không hợp lệ.' });
    }
  }

  /* Điểm vào duy nhất: mọi màn hình gọi API.goi({hanhDong:..., ...}). */
  function goi(payload) {
    return window.DEMO ? demo(payload) : goiThat(payload);
  }

  return {
    goi: goi,
    /* Danh mục đơn vị cho ô tìm kiếm.
       - Chạy thật: dùng DANH_MUC_DV (126 đơn vị BAKE cố định) → KHÔNG truy vấn backend.
       - DEMO: dùng các đơn vị mẫu để thử luồng. */
    dsDonVi: function () {
      if (window.DEMO) {
        return tre(window.DemoDB.donVi.map(function (d) {
          return { maDonVi: d.maDonVi, tenDonVi: d.tenDonVi, tenKhongDau: d.tenKhongDau, trangThai: d.trangThai };
        }));
      }
      return tre((window.DANH_MUC_DV || []).slice());   // danh mục cố định, không có trạng thái động
    },
    dangNhap: function (maDonVi, tenDangNhap, matKhau) { return goi({ hanhDong: 'dangNhap', maDonVi: maDonVi, tenDangNhap: tenDangNhap, matKhau: matKhau }); },
    layDuLieu: function (token) { return goi({ hanhDong: 'layDuLieu', token: token }); },
    luuNhap: function (token, danhSach) { return goi({ hanhDong: 'luuNhap', token: token, danhSach: danhSach }); },
    taiChuKy: function (token, anhBase64, hoTenChuTich) { return goi({ hanhDong: 'taiChuKy', token: token, anhBase64: anhBase64, hoTenChuTich: hoTenChuTich }); },
    guiChinhThuc: function (token, nguoiXacNhan, chucVu) { return goi({ hanhDong: 'guiChinhThuc', token: token, nguoiXacNhan: nguoiXacNhan, chucVu: chucVu }); },
    /* ── Quản trị ── */
    adminDangNhap: function (matKhau) { return goi({ hanhDong: 'adminDangNhap', matKhau: matKhau }); },
    adminTongQuan: function (token) { return goi({ hanhDong: 'adminTongQuan', token: token }); },
    adminChiTiet: function (token, maDonVi) { return goi({ hanhDong: 'adminChiTiet', token: token, maDonVi: maDonVi }); },
    adminMoKhoa: function (token, maDonVi) { return goi({ hanhDong: 'adminMoKhoa', token: token, maDonVi: maDonVi }); },
    adminDonDoc: function (token, dsMaDonVi) { return goi({ hanhDong: 'adminDonDoc', token: token, dsMaDonVi: dsMaDonVi }); },
    adminHopNhat: function (token) { return goi({ hanhDong: 'adminHopNhat', token: token }); }
  };
})();

/* ═══════════════════════ TRẠNG THÁI ỨNG DỤNG (RAM) ══════════════════════
   KHÔNG dùng localStorage/sessionStorage cho dữ liệu cán bộ (ràng buộc bảo mật).
   ───────────────────────────────────────────────────────────────────────── */
window.APP = {
  token: null,
  donVi: null,       // {maDonVi, tenDonVi, trangThai, maBienNhan}
  danhSach: [],      // danh sách cán bộ + trạng thái rà soát hiện thời
  chuKy: null,       // {daTai, canChuKy, tenFile}
  anhChuKy: null,    // dataURL ảnh đã xử lý (chưa tải lên), giữ trong RAM
  buoc: 'dangnhap',  // dangnhap | rasoat | chuky | gui
  daGui: false       // đã gửi chính thức → khoá dữ liệu
};
