/* ============================================================================
   dangnhap.js — MÀN HÌNH ĐĂNG NHẬP
   Ô tìm đơn vị gõ KHÔNG DẤU (so khớp trên tenKhongDau) + ô số điện thoại.
   Mật khẩu là SĐT cán bộ CNTT — khoá tạm khi sai quá số lần (xử lý ở backend).
   ========================================================================== */
window.DangNhap = (function () {
  var dsDonVi = [];        // toàn bộ 126 đơn vị (chỉ tên + mã, không mật khẩu)
  var chon = null;         // đơn vị đang chọn
  var hlIndex = -1;        // vị trí đang tô sáng trong danh sách gợi ý
  var loc = [];            // danh sách đang hiển thị

  var $tim, $list, $tk, $sdt, $btn, $err;

  function init() {
    $tim = document.getElementById('o-tim');
    $list = document.getElementById('tim-list');
    $tk = document.getElementById('o-taikhoan');
    $sdt = document.getElementById('o-sdt');
    $btn = document.getElementById('btn-dangnhap');
    $err = document.getElementById('login-err');

    // Tải danh sách đơn vị cho ô tìm kiếm. Nếu người dùng đã kịp gõ trước khi
    // danh sách về, chạy lại tìm kiếm để hiện gợi ý (tránh kẹt "không tìm thấy").
    window.API.dsDonVi().then(function (ds) {
      dsDonVi = ds || [];
      if ($tim && $tim.value.trim()) onTim();
    });

    $tim.addEventListener('input', onTim);
    $tim.addEventListener('focus', onTim);
    $tim.addEventListener('keydown', onPhim);
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.tim-donvi')) dong();
    });

    $tk.addEventListener('input', anLoi);
    $tk.addEventListener('keydown', function (e) { if (e.key === 'Enter') $sdt.focus(); });

    // Chỉ cho gõ số ở ô điện thoại
    $sdt.addEventListener('input', function () {
      $sdt.value = $sdt.value.replace(/\D/g, '').slice(0, 10);
      anLoi();
    });
    $sdt.addEventListener('keydown', function (e) { if (e.key === 'Enter') dangNhap(); });

    $btn.addEventListener('click', dangNhap);
  }

  /* ---- Tìm đơn vị không dấu ---- */
  function onTim() {
    var q = window.Util.khongDau($tim.value);
    chon = null;                         // gõ lại thì bỏ lựa chọn cũ
    // Hiện ĐỦ danh sách (không cắt bớt) — ô gợi ý tự cuộn khi dài
    if (!q) { loc = dsDonVi.slice(); }
    else { loc = dsDonVi.filter(function (d) { return d.tenKhongDau.indexOf(q) > -1; }); }
    hlIndex = -1;
    render();
  }

  function render() {
    if (!loc.length) {
      $list.innerHTML = '<div class="tim-empty">Không tìm thấy đơn vị phù hợp</div>';
      $list.classList.add('show');
      return;
    }
    var ttMap = { CHUA_RA_SOAT: ['tt-chua', 'Chưa rà soát'], DANG_RA_SOAT: ['tt-dang', 'Đang rà soát'], DA_GUI: ['tt-gui', 'Đã gửi'] };
    $list.innerHTML = '<div class="tim-count">' + loc.length + ' đơn vị · cuộn để xem, gõ để lọc nhanh</div>' + loc.map(function (d, i) {
      var tt = ttMap[d.trangThai];   // danh mục cố định không có trạng thái → ẩn nhãn
      return '<div class="tim-item' + (i === hlIndex ? ' hl' : '') + '" data-i="' + i + '">' +
        '<span><b>' + window.Util.escapeHtml(d.tenDonVi) + '</b> <span class="ma">' + window.Util.escapeHtml(d.maDonVi) + '</span></span>' +
        (tt ? '<span class="tt ' + tt[0] + '">' + tt[1] + '</span>' : '') + '</div>';
    }).join('');
    $list.classList.add('show');
    Array.prototype.forEach.call($list.querySelectorAll('.tim-item'), function (el) {
      el.addEventListener('click', function () { pick(loc[+el.getAttribute('data-i')]); });
    });
  }

  function pick(d) {
    chon = d;
    $tim.value = d.tenDonVi;
    dong();
    anLoi();
    $sdt.focus();
  }

  function dong() { $list.classList.remove('show'); }

  function onPhim(e) {
    if (!$list.classList.contains('show')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); hlIndex = Math.min(hlIndex + 1, loc.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hlIndex = Math.max(hlIndex - 1, 0); render(); }
    else if (e.key === 'Enter') {
      if (hlIndex >= 0 && loc[hlIndex]) { e.preventDefault(); pick(loc[hlIndex]); }
      else if (loc.length === 1) { e.preventDefault(); pick(loc[0]); }
    } else if (e.key === 'Escape') { dong(); }
  }

  /* ---- Đăng nhập ---- */
  function dangNhap() {
    anLoi();
    if (!chon) { baoLoi('Vui lòng chọn đơn vị từ danh sách gợi ý.'); $tim.focus(); return; }
    var tenDangNhap = $tk.value.trim();
    if (!tenDangNhap) { baoLoi('Vui lòng nhập tên đăng nhập của cán bộ phụ trách CNTT.'); $tk.focus(); return; }
    var sdt = $sdt.value.trim();
    var v = window.Validate.soDienThoai(sdt);
    if (!v.ok) { baoLoi(v.loi); $sdt.focus(); return; }

    $btn.disabled = true; $btn.textContent = 'Đang kiểm tra…';
    window.API.dangNhap(chon.maDonVi, tenDangNhap, sdt).then(function (kq) {
      $btn.disabled = false; $btn.textContent = 'Đăng nhập';
      if (!kq.ok) { baoLoi(kq.loi || 'Đăng nhập không thành công.'); return; }
      // Thành công → nạp trạng thái + chuyển sang bước rà soát
      window.APP.token = kq.data.token;
      window.APP.donVi = kq.data.donVi;
      $tk.value = ''; $sdt.value = '';
      window.RaSoat.batDau();
    });
  }

  function baoLoi(msg) { $err.textContent = msg; $err.classList.add('show'); }
  function anLoi() { $err.classList.remove('show'); }

  return { init: init };
})();
