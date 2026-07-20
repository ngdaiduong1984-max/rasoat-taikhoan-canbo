/* ============================================================================
   rasoat.js — BƯỚC 1: RÀ SOÁT
   Mỗi cán bộ là một thẻ. Đúng/Sai. Chọn Sai → mở form sửa nạp sẵn giá trị cũ.
   CHI TIẾT QUAN TRỌNG NHẤT: khi đổi giá trị, hiện giá trị cũ GẠCH NGANG ngay dưới
   ô nhập — mục đích của hệ thống là theo dõi cái gì đã đổi.
   Tự động lưu nháp: gộp thay đổi trong 1,5 giây rồi mới gọi API (KHÔNG localStorage).
   Nút "Tiếp tục" khoá tới khi rà soát hết mọi người.
   ========================================================================== */
window.RaSoat = (function () {
  var LOP_TEN = {
    CT: 'Chủ tịch HĐND', PCT: 'Phó Chủ tịch HĐND', BAN: 'Ban HĐND',
    CV: 'Chuyên viên', PCVP: 'Lãnh đạo/CV Văn phòng'
  };
  var $list, $donvi, $tiepTuc, $trangThaiLuu, $bar, $barTxt;
  var luuDebounced;

  /* ── QUY TẮC: hàng có CanhBaoHeThong thì BẮT BUỘC sửa, không cho chọn "Đúng".
     Suy ra trường bắt buộc sửa từ nội dung cảnh báo. ── */
  var CANHBAO_FIELD = [
    { key: 'email', re: /email/i,        goc: 'emailCongVu', moi: 'emailCongVu_Moi', validate: 'emailCongVu' },
    { key: 'sdt',   re: /điện thoại/i,   goc: 'soDienThoai', moi: 'soDienThoai_Moi', validate: 'soDienThoai' },
    { key: 'tk',    re: /tài khoản/i,    goc: 'tenTaiKhoan', moi: 'tenTaiKhoan_Moi', validate: 'tenTaiKhoan' }
  ];
  function coCanhBao(c) { return !!(c.canhBaoHeThong && c.canhBaoHeThong.trim()); }
  function truongCanSua(c) {
    var w = c.canhBaoHeThong || '';
    return CANHBAO_FIELD.filter(function (f) { return f.re.test(w); });
  }
  function truongDaSua(c, f) {
    var moi = c[f.moi]; moi = (moi === undefined || moi === null) ? '' : moi;
    if (String(moi) === String(c[f.goc] || '')) return false;      // phải ĐỔI khác giá trị gốc bị cảnh báo
    return window.Validate[f.validate](moi).ok;                     // và phải HỢP LỆ
  }
  function daXuLyCanhBao(c) {
    if (!coCanhBao(c)) return true;
    if (c.trangThai === 'XOA') return true;                        // không còn công tác → chấp nhận
    if (c.trangThai !== 'SUA') return false;                       // buộc phải "Cần sửa"
    return truongCanSua(c).every(function (f) { return truongDaSua(c, f); });
  }

  function batDau() {
    window.UI.showBuoc('rasoat');
    window.UI.setStep(1);
    $list = document.getElementById('rasoat-list');
    $donvi = document.getElementById('rasoat-donvi');
    $tiepTuc = document.getElementById('btn-tieptuc');
    $trangThaiLuu = document.getElementById('rasoat-luu');
    $bar = document.getElementById('rasoat-bar');
    $barTxt = document.getElementById('rasoat-bar-txt');
    luuDebounced = window.Util.debounce(luuNhap, 1500);

    $list.innerHTML = '<div class="placeholder">Đang tải danh sách cán bộ…</div>';
    window.API.layDuLieu(window.APP.token).then(function (kq) {
      if (!kq.ok) { window.UI.toast(kq.loi || 'Không tải được dữ liệu.', 'err'); return; }
      window.APP.donVi = kq.data.donVi;
      window.APP.chuKy = kq.data.chuKy;
      // Chuẩn hoá trạng thái từng cán bộ (khôi phục nháp đã lưu nếu có)
      window.APP.danhSach = kq.data.danhSach.map(function (c) {
        c.trangThai = c.trangThai || 'CHUA_RA_SOAT';
        c.khongConCongTac = (c.trangThai === 'XOA');
        return c;
      });
      // Đơn vị đã gửi chính thức → khoá, hiển thị biên nhận ngay.
      if (window.APP.donVi.trangThai === 'DA_GUI') { window.APP.daGui = true; window.Gui.batDau(); return; }
      renderDonVi();
      renderList();
      wire();
      // Khôi phục nhắc "bắt buộc sửa" cho các hàng cảnh báo đang mở dở
      window.APP.danhSach.forEach(function (c) { if (c.trangThai === 'SUA') kichHoatCanhBao(c); });
      capNhatTienDo();
    });
  }

  function renderDonVi() {
    var dv = window.APP.donVi;
    $donvi.innerHTML =
      '<div><div class="dv-ten">' + window.Util.escapeHtml(dv.tenDonVi) + '</div>' +
      '<div class="dv-ma">Mã đơn vị: ' + window.Util.escapeHtml(dv.maDonVi) +
      ' · ' + window.APP.danhSach.length + ' cán bộ</div></div>' +
      '<div class="grow"></div>' +
      '<button class="btn ghost" id="btn-thoat">Thoát</button>';
    $donvi.querySelector('#btn-thoat').addEventListener('click', thoat);
  }

  /* ---- Dựng danh sách thẻ ---- */
  function renderList() {
    $list.innerHTML = window.APP.danhSach.map(theHTML).join('');
  }

  function theHTML(c) {
    var stClass = c.trangThai === 'DUNG' ? 'st-dung' : c.trangThai === 'SUA' ? 'st-sua' : c.trangThai === 'XOA' ? 'st-xoa' : '';
    var lopLbl = LOP_TEN[c.lop] || c.lop;
    var lopClass = c.lop === 'CT' ? 'cb-lop lop-ct' : 'cb-lop';
    var canhBao = (c.canhBaoHeThong || '').split(' | ').filter(function (x) { return x.trim(); });
    var cbHTML = canhBao.length
      ? '<div class="canh-bao">' + canhBao.map(function (w) { return '<div class="cb-item">' + window.Util.escapeHtml(w) + '</div>'; }).join('') + '</div>'
      : '';
    var warn = coCanhBao(c);   // hàng có cảnh báo → khoá nút "Đúng"
    return '' +
      '<div class="can-bo ' + stClass + '" id="cb-' + c.id + '" data-id="' + c.id + '">' +
      '<div class="cb-head">' +
        '<div class="cb-top"><div class="cb-info">' +
          '<div class="cb-ten">' + window.Util.escapeHtml(c.hoTen) + '<span class="' + lopClass + '">' + window.Util.escapeHtml(lopLbl) + '</span></div>' +
          '<div class="cb-meta">' +
            '<div><span class="k">Tài khoản:</span><span class="v">' + window.Util.escapeHtml(c.tenTaiKhoan || '—') + '</span></div>' +
            '<div><span class="k">Email:</span><span class="v">' + window.Util.escapeHtml(c.emailCongVu || '—') + '</span></div>' +
            '<div><span class="k">Điện thoại:</span><span class="v">' + window.Util.escapeHtml(c.soDienThoai || '—') + '</span></div>' +
            (c.phuTrachCNTT === 'x' ? '<div><span class="k">Phụ trách CNTT:</span><span class="v">Có</span></div>' : '') +
          '</div>' + cbHTML +
        '</div></div>' +
        '<div class="seg-ds">' +
          '<button class="b-dung' + (c.trangThai === 'DUNG' ? ' on' : '') + (warn ? ' khoa' : '') + '" data-hd="dung"' + (warn ? ' disabled title="Thông tin có cảnh báo, bắt buộc phải sửa"' : '') + '><span class="ic">✓</span> Đúng</button>' +
          '<button class="b-sai' + (c.trangThai === 'SUA' || c.trangThai === 'XOA' ? ' on' : '') + '" data-hd="sai"><span class="ic">✎</span> Cần sửa</button>' +
        '</div>' +
        (warn ? '<div class="seg-note">Thông tin đang có cảnh báo — <b>bắt buộc chọn “Cần sửa”</b> và sửa lại cho đúng, không thể bỏ qua.</div>' : '') +
      '</div>' +
      editHTML(c) +
      '</div>';
  }

  /* Một ô sửa: nhãn + input + dòng lỗi + dòng "giá trị cũ gạch ngang" */
  function oSua(c, field, moiField, cuVal, label, opts) {
    opts = opts || {};
    var val = (c[moiField] !== undefined && c[moiField] !== null && c[moiField] !== '') ? c[moiField] : cuVal;
    var attrs = 'data-id="' + c.id + '" data-field="' + moiField + '" data-cu="' + window.Util.escapeHtml(cuVal) + '"' + (opts.validate ? ' data-validate="' + opts.validate + '"' : '') + (opts.batBuoc ? ' data-batbuoc="1"' : '');
    var input = opts.select
      ? '<select ' + attrs + '>' + Object.keys(LOP_TEN).map(function (k) {
          return '<option value="' + k + '"' + (val === k ? ' selected' : '') + '>' + LOP_TEN[k] + '</option>';
        }).join('') + '</select>'
      : '<input type="text" ' + attrs + (opts.numeric ? ' inputmode="numeric"' : '') + ' value="' + window.Util.escapeHtml(val) + '">';
    // Dòng giá trị cũ: hiện sẵn nếu bản nháp đã khác gốc
    var cuLabel = opts.select ? (LOP_TEN[cuVal] || cuVal) : cuVal;
    var khac = String(val) !== String(cuVal) && String(cuVal) !== '';
    return '<div class="field' + (opts.wide ? ' wide' : '') + (opts.batBuoc ? ' batbuoc' : '') + '">' +
      '<label>' + label + (opts.batBuoc ? ' <span class="nhan-batbuoc">• cần sửa</span>' : '') + '</label>' + input +
      '<div class="loi-o" data-loi="' + moiField + '"></div>' +
      (opts.batBuoc ? '<div class="can-sua" data-cansua="' + moiField + '">Bắt buộc sửa lại giá trị đang có cảnh báo cho đúng.</div>' : '') +
      '<div class="gia-tri-cu' + (khac ? ' show' : '') + '" data-cu-line="' + moiField + '"><span class="nhan">Giá trị cũ:</span> <s>' + window.Util.escapeHtml(cuLabel) + '</s></div>' +
      '</div>';
  }

  function editHTML(c) {
    var open = (c.trangThai === 'SUA' || c.trangThai === 'XOA');
    var xoa = (c.trangThai === 'XOA');
    var req = {};   // trường bắt buộc sửa (theo cảnh báo)
    truongCanSua(c).forEach(function (f) { req[f.key] = true; });
    return '<div class="cb-edit' + (open ? ' show' : '') + '" data-edit="' + c.id + '">' +
      '<div class="edit-grid">' +
        oSua(c, 'hoTen', 'hoTen_Moi', c.hoTen, 'Họ và tên') +
        oSua(c, 'lop', 'lop_Moi', c.lop, 'Chức danh', { select: true }) +
        oSua(c, 'tenTaiKhoan', 'tenTaiKhoan_Moi', c.tenTaiKhoan, 'Tên tài khoản', { validate: 'tenTaiKhoan', batBuoc: req.tk }) +
        oSua(c, 'soDienThoai', 'soDienThoai_Moi', c.soDienThoai, 'Số điện thoại', { validate: 'soDienThoai', numeric: true, batBuoc: req.sdt }) +
        oSua(c, 'emailCongVu', 'emailCongVu_Moi', c.emailCongVu, 'Email công vụ', { validate: 'emailCongVu', wide: true, batBuoc: req.email }) +
      '</div>' +
      '<label class="chk-row" style="margin-top:12px"><input type="checkbox" data-chk="cntt" data-id="' + c.id + '"' + (c.phuTrachCNTT_Moi === 'x' || (c.phuTrachCNTT === 'x' && c.trangThai !== 'CHUA_RA_SOAT') ? ' checked' : '') + '><span class="lbl">Là cán bộ phụ trách CNTT của đơn vị</span></label>' +
      '<label class="chk-row' + (xoa ? ' xoa-on' : '') + '" data-xoa-row="' + c.id + '"><input type="checkbox" data-chk="xoa" data-id="' + c.id + '"' + (xoa ? ' checked' : '') + '><span class="lbl">Cán bộ này KHÔNG CÒN công tác tại đơn vị</span></label>' +
      '<div class="field wide" style="margin-top:12px"><label>Ghi chú của đơn vị</label>' +
        '<textarea data-id="' + c.id + '" data-field="ghiChuDonVi" rows="2" placeholder="Nêu rõ lý do sửa / thông tin bổ sung (nếu có)">' + window.Util.escapeHtml(c.ghiChuDonVi || '') + '</textarea></div>' +
      '</div>';
  }

  /* ---- Gắn sự kiện (uỷ quyền trên container) ---- */
  function wire() {
    $list.addEventListener('click', onClick);
    $list.addEventListener('input', onInput);
    $list.addEventListener('change', onChange);
    $tiepTuc.addEventListener('click', tiepTuc);
  }

  function timCB(id) { return window.APP.danhSach.find(function (c) { return c.id === id; }); }

  function onClick(e) {
    var btn = e.target.closest('.seg-ds button');
    if (!btn) return;
    var card = btn.closest('.can-bo');
    var c = timCB(card.getAttribute('data-id'));
    var hd = btn.getAttribute('data-hd');
    var editEl = $list.querySelector('[data-edit="' + c.id + '"]');
    if (hd === 'dung') {
      if (btn.disabled || coCanhBao(c)) {   // hàng có cảnh báo: không cho "Đúng"
        window.UI.toast('Thông tin đang có cảnh báo, bắt buộc chọn “Cần sửa” và sửa lại.', 'err');
        return;
      }
      c.trangThai = 'DUNG';
      c.khongConCongTac = false;
      editEl.classList.remove('show');
    } else {
      // "Cần sửa" → mở form, nạp sẵn *_Moi = giá trị hiện tại nếu chưa có
      if (c.trangThai !== 'SUA' && c.trangThai !== 'XOA') {
        c.trangThai = 'SUA';
        khoiTaoMoi(c);
        renderEdit(c);   // dựng lại phần sửa với giá trị nạp sẵn
      }
      editEl = $list.querySelector('[data-edit="' + c.id + '"]');
      editEl.classList.add('show');
      kichHoatCanhBao(c);   // hiện ngay lỗi/nhắc sửa ở các trường bắt buộc
    }
    capNhatThe(c);
    capNhatTienDo();
    danhDauThayDoi();
  }

  /* Khi mở form của hàng có cảnh báo: validate sẵn + hiện nhắc "bắt buộc sửa". */
  function kichHoatCanhBao(c) {
    if (!coCanhBao(c)) return;
    var card = document.getElementById('cb-' + c.id);
    truongCanSua(c).forEach(function (f) {
      var inp = card.querySelector('input[data-field="' + f.moi + '"]');
      if (inp) validateO(inp, f.moi);
    });
    capNhatCanSua(card, c);
  }

  /* Ẩn/hiện dòng "bắt buộc sửa" cho từng trường theo trạng thái đã sửa xong chưa. */
  function capNhatCanSua(card, c) {
    var xong = daXuLyCanhBao(c);   // XOA hoặc đã sửa xong → không nhắc nữa
    truongCanSua(c).forEach(function (f) {
      var el = card.querySelector('[data-cansua="' + f.moi + '"]');
      if (!el) return;
      if (xong) { el.classList.remove('show'); return; }
      var loiEl = card.querySelector('.loi-o[data-loi="' + f.moi + '"]');
      var coLoi = loiEl && loiEl.classList.contains('show');
      // hiện nhắc khi CHƯA sửa xong và KHÔNG có lỗi định dạng đang hiện (tránh trùng thông báo)
      el.classList.toggle('show', !truongDaSua(c, f) && !coLoi);
    });
  }

  /* Nạp sẵn cột *_Moi từ giá trị gốc khi lần đầu chọn "Cần sửa". */
  function khoiTaoMoi(c) {
    if (!c.hoTen_Moi) c.hoTen_Moi = c.hoTen;
    if (!c.lop_Moi) c.lop_Moi = c.lop;
    if (!c.tenTaiKhoan_Moi) c.tenTaiKhoan_Moi = c.tenTaiKhoan;
    if (!c.soDienThoai_Moi) c.soDienThoai_Moi = c.soDienThoai;
    if (!c.emailCongVu_Moi) c.emailCongVu_Moi = c.emailCongVu;
    if (!c.phuTrachCNTT_Moi) c.phuTrachCNTT_Moi = c.phuTrachCNTT;
  }

  function renderEdit(c) {
    var old = $list.querySelector('[data-edit="' + c.id + '"]');
    var tmp = document.createElement('div');
    tmp.innerHTML = editHTML(c);
    old.replaceWith(tmp.firstChild);
  }

  function onInput(e) {
    var t = e.target;
    var field = t.getAttribute('data-field');
    if (!field) return;
    var c = timCB(t.getAttribute('data-id'));
    if (!c) return;
    if (t.getAttribute('inputmode') === 'numeric') t.value = t.value.replace(/\D/g, '').slice(0, 10);
    c[field] = t.value;
    if (field !== 'ghiChuDonVi') {
      capNhatGiaCu(t, field);
      validateO(t, field);
      if (coCanhBao(c)) { capNhatCanSua(t.closest('.can-bo'), c); capNhatThe(c); }
    }
    danhDauThayDoi();
  }

  function onChange(e) {
    var t = e.target;
    var loai = t.getAttribute('data-chk');
    if (loai) {
      var c = timCB(t.getAttribute('data-id'));
      if (loai === 'cntt') { c.phuTrachCNTT_Moi = t.checked ? 'x' : ''; }
      else if (loai === 'xoa') {
        c.khongConCongTac = t.checked;
        c.trangThai = t.checked ? 'XOA' : 'SUA';
        var row = $list.querySelector('[data-xoa-row="' + c.id + '"]');
        if (row) row.classList.toggle('xoa-on', t.checked);
        var theCard = t.closest('.can-bo');
        if (t.checked) {   // XOA → xoá hiển thị lỗi ở các ô sửa (không còn ý nghĩa)
          Array.prototype.forEach.call(theCard.querySelectorAll('.loi-o.show'), function (el) { el.classList.remove('show'); });
          Array.prototype.forEach.call(theCard.querySelectorAll('.field.invalid'), function (el) { el.classList.remove('invalid'); });
        } else {           // bỏ XOA → khôi phục kiểm tra + nhắc sửa
          kichHoatCanhBao(c);
        }
        capNhatThe(c);
        capNhatCanSua(theCard, c);
        capNhatTienDo();
      }
      danhDauThayDoi();
      return;
    }
    // select Chức danh
    if (t.tagName === 'SELECT' && t.getAttribute('data-field')) {
      var c2 = timCB(t.getAttribute('data-id'));
      c2[t.getAttribute('data-field')] = t.value;
      capNhatGiaCu(t, t.getAttribute('data-field'));
      danhDauThayDoi();
    }
  }

  /* Hiện/ẩn dòng "giá trị cũ gạch ngang" theo so sánh với data-cu */
  function capNhatGiaCu(input, field) {
    var cu = input.getAttribute('data-cu') || '';
    var line = $list.querySelector('[data-cu-line="' + field + '"][data-cu-line]');
    // định vị đúng dòng trong cùng thẻ
    var card = input.closest('.can-bo');
    line = card.querySelector('.gia-tri-cu[data-cu-line="' + field + '"]');
    if (!line) return;
    var khac = String(input.value) !== String(cu) && String(cu) !== '';
    line.classList.toggle('show', khac);
  }

  /* Validate ngay khi gõ — thông báo tiếng Việt dưới ô */
  function validateO(input, field) {
    var vname = input.getAttribute('data-validate');
    if (!vname || !window.Validate[vname]) return true;
    var card = input.closest('.can-bo');
    var loiEl = card.querySelector('.loi-o[data-loi="' + field + '"]');
    var fieldEl = input.closest('.field');
    var kq = window.Validate[vname](input.value);
    if (kq.ok) { loiEl.classList.remove('show'); loiEl.textContent = ''; fieldEl.classList.remove('invalid'); return true; }
    loiEl.textContent = kq.loi; loiEl.classList.add('show'); fieldEl.classList.add('invalid'); return false;
  }

  function capNhatThe(c) {
    var card = document.getElementById('cb-' + c.id);
    card.classList.remove('st-dung', 'st-sua', 'st-xoa');
    if (c.trangThai === 'DUNG') card.classList.add('st-dung');
    else if (c.trangThai === 'SUA') card.classList.add('st-sua');
    else if (c.trangThai === 'XOA') card.classList.add('st-xoa');
    card.querySelector('.b-dung').classList.toggle('on', c.trangThai === 'DUNG');
    card.querySelector('.b-sai').classList.toggle('on', c.trangThai === 'SUA' || c.trangThai === 'XOA');
    // hàng có cảnh báo đã xử lý xong → đánh dấu xanh
    card.classList.toggle('da-xuly', coCanhBao(c) && daXuLyCanhBao(c));
  }

  function daRaSoat(c) { return c.trangThai && c.trangThai !== 'CHUA_RA_SOAT'; }

  function capNhatTienDo() {
    var tong = window.APP.danhSach.length;
    var xong = window.APP.danhSach.filter(daRaSoat).length;
    var conCanhBao = window.APP.danhSach.filter(function (c) { return !daXuLyCanhBao(c); }).length;
    $bar.style.width = (tong ? Math.round(xong / tong * 100) : 0) + '%';
    $barTxt.textContent = 'Đã rà soát ' + xong + '/' + tong + ' cán bộ' +
      (conCanhBao ? ' · còn ' + conCanhBao + ' mục cảnh báo phải sửa' : '');
    var hetLoi = !coLoiValidate();
    $tiepTuc.disabled = !(xong === tong && tong > 0 && hetLoi && conCanhBao === 0);
  }

  function coLoiValidate() {
    // Bỏ qua lỗi ở hàng XOA (không còn công tác) — các ô sửa không còn ý nghĩa
    var cards = $list.querySelectorAll('.can-bo');
    for (var i = 0; i < cards.length; i++) {
      var c = timCB(cards[i].getAttribute('data-id'));
      if (c && c.trangThai === 'XOA') continue;
      if (cards[i].querySelector('.loi-o.show')) return true;
    }
    return false;
  }

  /* ---- Tự động lưu nháp ---- */
  function danhDauThayDoi() {
    $trangThaiLuu.textContent = 'Đang soạn…';
    $trangThaiLuu.classList.remove('ok');
    luuDebounced();
    capNhatTienDo();
  }

  function luuNhap() {
    var rows = window.APP.danhSach.filter(daRaSoat).map(function (c) {
      return {
        id: c.id, trangThai: c.trangThai,
        hoTen_Moi: c.trangThai === 'DUNG' ? '' : (c.hoTen_Moi || ''),
        lop_Moi: c.trangThai === 'DUNG' ? '' : (c.lop_Moi || ''),
        tenTaiKhoan_Moi: c.trangThai === 'DUNG' ? '' : (c.tenTaiKhoan_Moi || ''),
        soDienThoai_Moi: c.trangThai === 'DUNG' ? '' : (c.soDienThoai_Moi || ''),
        emailCongVu_Moi: c.trangThai === 'DUNG' ? '' : (c.emailCongVu_Moi || ''),
        phuTrachCNTT_Moi: c.trangThai === 'DUNG' ? '' : (c.phuTrachCNTT_Moi || ''),
        ghiChuDonVi: c.ghiChuDonVi || ''
      };
    });
    $trangThaiLuu.textContent = 'Đang lưu…';
    window.API.luuNhap(window.APP.token, rows).then(function (kq) {
      if (kq.ok) {
        var gio = new Date();
        var hh = ('0' + gio.getHours()).slice(-2), mm = ('0' + gio.getMinutes()).slice(-2);
        $trangThaiLuu.textContent = '✓ Đã lưu nháp lúc ' + hh + ':' + mm;
        $trangThaiLuu.classList.add('ok');
      } else {
        $trangThaiLuu.textContent = 'Lưu nháp thất bại';
        window.UI.toast(kq.loi || 'Không lưu được nháp.', 'err');
      }
    });
  }

  /* ---- Tiếp tục sang bước 2 ---- */
  function tiepTuc() {
    if ($tiepTuc.disabled) return;
    luuNhap();
    window.ChuKy.batDau();
  }

  function thoat() {
    if (!confirm('Thoát khỏi phiên rà soát? Các thay đổi đã được lưu nháp tự động.')) return;
    window.APP.token = null; window.APP.danhSach = [];
    window.UI.showBuoc('dangnhap');
    window.UI.setStep(0);
  }

  return { batDau: batDau };
})();
