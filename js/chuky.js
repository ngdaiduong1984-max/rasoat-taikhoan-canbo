/* ============================================================================
   chuky.js — BƯỚC 2 (ảnh chữ ký) + BƯỚC 3 (gửi chính thức + mã biên nhận)
   Cấu trúc dự án không có js/gui.js → module Gui đặt chung tệp này.

   Ảnh chữ ký: chỉ áp dụng cho dòng Lop = CT. Xử lý HOÀN TOÀN phía trình duyệt
   bằng canvas — không gửi ảnh gốc:
     1. Điểm ảnh có độ sáng trung bình > 205 → alpha = 0 (tách nền trắng).
     2. Tính khung bao các điểm còn lại, cắt viền thừa, chừa lề 12px.
     3. Thu nhỏ về chiều ngang tối đa 800px, xuất PNG.
     4. Không có điểm nào tối hơn ngưỡng → báo chụp lại.
   Tên tệp: CK_<MaDonVi>_<TenDonVi không dấu>_<HoTen không dấu>_<yyyyMMdd>.png
   ========================================================================== */

/* ─────────────────────────── HẰNG SỐ XỬ LÝ ẢNH ─────────────────────────── */
var CK_NGUONG_SANG = 205;   // độ sáng trung bình > mức này coi là nền
var CK_LE = 12;             // lề chừa quanh khung bao (px)
var CK_RONG_TOI_DA = 800;   // chiều ngang tối đa của PNG xuất ra
var CK_RONG_XU_LY = 1600;   // hạ kích thước nguồn trước khi quét điểm ảnh (tốc độ)

window.ChuKy = (function () {
  var ct = null;        // cán bộ Lop=CT
  var ketQuaAnh = null; // {dataURL, w, h} ảnh đã xử lý chờ tải lên

  function tenHienTai(c) {
    if (!c) return '';
    if ((c.trangThai === 'SUA') && c.hoTen_Moi) return c.hoTen_Moi;
    return c.hoTen;
  }

  function batDau() {
    window.UI.showBuoc('chuky');
    window.UI.setStep(2);
    ct = window.APP.danhSach.find(function (c) { return c.lop === 'CT'; });
    ketQuaAnh = null;
    render();
  }

  function render() {
    var canCK = window.APP.chuKy && window.APP.chuKy.canChuKy;
    var el = document.getElementById('chuky-body');

    if (!canCK) {
      el.innerHTML =
        '<div class="note-banner">Đơn vị này không có Chủ tịch HĐND đang công tác nên <b>bỏ qua</b> bước ảnh chữ ký.</div>' +
        navHTML(true);
      wireNav();
      return;
    }

    var daTai = window.APP.chuKy && window.APP.chuKy.daTai;
    el.innerHTML =
      '<div class="note-banner">Chữ ký của <b>Chủ tịch HĐND: ' + window.Util.escapeHtml(tenHienTai(ct)) + '</b>. ' +
        'Ký lên <b>giấy trắng</b>, chụp <b>chính diện, đủ sáng</b>. Hệ thống tự tách nền và cắt viền.</div>' +
      '<div class="ck-drop" id="ck-drop">' +
        '<input type="file" id="ck-file" accept="image/*" capture="environment" hidden>' +
        '<div class="ck-drop-in">' +
          '<div class="ck-ic">📷</div>' +
          '<div class="ck-drop-t">Chạm để chụp hoặc chọn ảnh chữ ký</div>' +
          '<div class="ck-drop-s">Ảnh sẽ được xử lý ngay trên máy bạn, không gửi ảnh gốc.</div>' +
        '</div>' +
      '</div>' +
      '<div class="ck-loi" id="ck-loi"></div>' +
      '<div class="ck-xem" id="ck-xem" style="display:none">' +
        '<div class="ck-xem-h">Ảnh chữ ký sau xử lý (đã tách nền, cắt viền)</div>' +
        '<div class="ck-canvas-wrap"><img id="ck-preview" alt="Xem trước chữ ký"></div>' +
        '<div class="ck-meta" id="ck-meta"></div>' +
        '<div class="ck-xem-btns">' +
          '<button class="btn" id="ck-lai">Chụp/chọn lại</button>' +
          '<button class="btn primary" id="ck-taulen">Xác nhận &amp; tải lên</button>' +
        '</div>' +
      '</div>' +
      '<div class="ck-done" id="ck-done" style="display:' + (daTai ? 'flex' : 'none') + '">' +
        '<span class="ck-done-ic">✓</span><div><b>Đã tải ảnh chữ ký</b>' +
        '<div class="ck-done-f" id="ck-done-f">' + window.Util.escapeHtml((window.APP.chuKy && window.APP.chuKy.tenFile) || '') + '</div></div>' +
      '</div>' +
      navHTML(daTai);

    wireCapture();
    wireNav();
  }

  function navHTML(choTiep) {
    return '<div class="btn-row">' +
      '<button class="btn" id="ck-quaylai">← Quay lại rà soát</button>' +
      '<span class="grow"></span>' +
      '<button class="btn primary lg" id="ck-tiep"' + (choTiep ? '' : ' disabled') + '>Tiếp tục → Gửi</button>' +
    '</div>';
  }

  function wireNav() {
    var q = document.getElementById('ck-quaylai');
    if (q) q.addEventListener('click', function () { window.UI.showBuoc('rasoat'); window.UI.setStep(1); });
    var t = document.getElementById('ck-tiep');
    if (t) t.addEventListener('click', function () { if (!t.disabled) window.Gui.batDau(); });
  }

  function wireCapture() {
    var drop = document.getElementById('ck-drop');
    var file = document.getElementById('ck-file');
    drop.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      if (file.files && file.files[0]) chon(file.files[0]);
      file.value = '';
    });
  }

  function chon(f) {
    baoLoi('');
    var drop = document.getElementById('ck-drop');
    drop.classList.add('dang-xuly');
    drop.querySelector('.ck-drop-t').textContent = 'Đang xử lý ảnh…';
    xuLyAnh(f, function (kq) {
      drop.classList.remove('dang-xuly');
      drop.querySelector('.ck-drop-t').textContent = 'Chạm để chụp hoặc chọn ảnh khác';
      if (kq.loi) { baoLoi(kq.loi); return; }
      if (!kq.coNet) { baoLoi('Không nhận ra nét chữ ký, đề nghị chụp lại trên nền giấy trắng, đủ sáng.'); return; }
      ketQuaAnh = kq;
      document.getElementById('ck-preview').src = kq.dataURL;
      var kb = Math.round(kq.dataURL.length * 3 / 4 / 1024);
      document.getElementById('ck-meta').textContent = 'Kích thước ' + kq.w + '×' + kq.h + ' px · khoảng ' + kb + ' KB';
      document.getElementById('ck-xem').style.display = 'block';
      document.getElementById('ck-done').style.display = 'none';
      document.getElementById('ck-lai').onclick = function () {
        ketQuaAnh = null; document.getElementById('ck-xem').style.display = 'none';
        document.getElementById('ck-file').click();
      };
      document.getElementById('ck-taulen').onclick = taiLen;
    });
  }

  /* ── Xử lý ảnh bằng canvas ── */
  function xuLyAnh(file, cb) {
    var img = new Image();
    img.onload = function () {
      try {
        var scale = Math.min(1, CK_RONG_XU_LY / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var imgData = ctx.getImageData(0, 0, w, h);
        var px = imgData.data;
        var minX = w, minY = h, maxX = -1, maxY = -1;
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var i = (y * w + x) * 4;
            var sang = (px[i] + px[i + 1] + px[i + 2]) / 3;
            if (sang > CK_NGUONG_SANG) { px[i + 3] = 0; }   // nền → trong suốt
            else {                                          // nét → giữ, mở rộng khung bao
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < 0) { cb({ coNet: false }); return; }
        ctx.putImageData(imgData, 0, 0);
        // cắt theo khung bao + lề 12px
        var cx = Math.max(0, minX - CK_LE), cy = Math.max(0, minY - CK_LE);
        var cw = Math.min(w, maxX + CK_LE) - cx, ch = Math.min(h, maxY + CK_LE) - cy;
        // thu nhỏ chiều ngang ≤ 800px
        var os = Math.min(1, CK_RONG_TOI_DA / cw);
        var ow = Math.max(1, Math.round(cw * os)), oh = Math.max(1, Math.round(ch * os));
        var out = document.createElement('canvas'); out.width = ow; out.height = oh;
        out.getContext('2d').drawImage(cv, cx, cy, cw, ch, 0, 0, ow, oh);
        cb({ coNet: true, dataURL: out.toDataURL('image/png'), w: ow, h: oh });
      } catch (e) { cb({ loi: 'Không xử lý được ảnh. Vui lòng thử ảnh khác.' }); }
    };
    img.onerror = function () { cb({ loi: 'Không đọc được tệp ảnh.' }); };
    var reader = new FileReader();
    reader.onload = function (e) { img.src = e.target.result; };
    reader.onerror = function () { cb({ loi: 'Không đọc được tệp ảnh.' }); };
    reader.readAsDataURL(file);
  }

  function taiLen() {
    if (!ketQuaAnh) return;
    var btn = document.getElementById('ck-taulen');
    btn.disabled = true; btn.textContent = 'Đang tải lên…';
    var base64 = ketQuaAnh.dataURL.split(',')[1];   // bỏ tiền tố data:image/png;base64,
    window.API.taiChuKy(window.APP.token, base64, tenHienTai(ct)).then(function (kq) {
      btn.disabled = false; btn.textContent = 'Xác nhận & tải lên';
      if (!kq.ok) { window.UI.toast(kq.loi || 'Tải ảnh thất bại.', 'err'); return; }
      window.APP.chuKy.daTai = true;
      window.APP.chuKy.tenFile = kq.data.tenFile;
      document.getElementById('ck-xem').style.display = 'none';
      var done = document.getElementById('ck-done');
      document.getElementById('ck-done-f').textContent = kq.data.tenFile + ' · ' + kq.data.dungLuongKB + ' KB';
      done.style.display = 'flex';
      var tiep = document.getElementById('ck-tiep'); if (tiep) tiep.disabled = false;
      window.UI.toast('Đã tải ảnh chữ ký', 'ok');
    });
  }

  function baoLoi(msg) {
    var el = document.getElementById('ck-loi');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('show', !!msg);
  }

  return { batDau: batDau };
})();

/* ═══════════════════════════ BƯỚC 3 · GỬI CHÍNH THỨC ════════════════════ */
window.Gui = (function () {

  function demTrangThai() {
    var tk = { giuNguyen: 0, daSua: 0, khongCon: 0 };
    window.APP.danhSach.forEach(function (c) {
      if (c.trangThai === 'DUNG') tk.giuNguyen++;
      else if (c.trangThai === 'SUA') tk.daSua++;
      else if (c.trangThai === 'XOA') tk.khongCon++;
    });
    return tk;
  }

  function batDau() {
    window.UI.showBuoc('gui');
    window.UI.setStep(3);
    // Nếu đơn vị đã gửi từ trước → hiện biên nhận, khoá.
    if (window.APP.donVi && window.APP.donVi.trangThai === 'DA_GUI') {
      thanhCong({ maBienNhan: window.APP.donVi.maBienNhan, thongKe: demTrangThai() }, true);
      return;
    }
    render();
  }

  function render() {
    var tk = demTrangThai();
    var canCK = window.APP.chuKy && window.APP.chuKy.canChuKy;
    var daCK = window.APP.chuKy && window.APP.chuKy.daTai;
    var el = document.getElementById('gui-body');
    el.innerHTML =
      '<div class="tk-grid">' +
        '<div class="tk-o tk-ok"><div class="tk-n">' + tk.giuNguyen + '</div><div class="tk-l">Giữ nguyên</div></div>' +
        '<div class="tk-o tk-sua"><div class="tk-n">' + tk.daSua + '</div><div class="tk-l">Đã sửa</div></div>' +
        '<div class="tk-o tk-xoa"><div class="tk-n">' + tk.khongCon + '</div><div class="tk-l">Không còn công tác</div></div>' +
      '</div>' +
      (canCK
        ? '<div class="gui-ck ' + (daCK ? 'ok' : 'thieu') + '">' + (daCK
            ? '✓ Đã có ảnh chữ ký Chủ tịch HĐND.'
            : '⚠ Chưa có ảnh chữ ký Chủ tịch HĐND. Vui lòng quay lại bước 2 để tải lên.') + '</div>'
        : '') +
      '<div class="field" style="margin-top:14px"><label>Họ và tên người xác nhận <span class="req">*</span></label>' +
        '<input type="text" id="gui-nguoi" placeholder="Người chịu trách nhiệm gửi của đơn vị"></div>' +
      '<div class="field" style="margin-top:12px"><label>Chức vụ <span class="req">*</span></label>' +
        '<input type="text" id="gui-chucvu" placeholder="Ví dụ: Chánh Văn phòng / Chuyên viên"></div>' +
      '<label class="chk-row" style="margin-top:14px" id="gui-camdoan-row"><input type="checkbox" id="gui-camdoan">' +
        '<span class="lbl">Tôi cam đoan các thông tin đã rà soát là đúng và chịu trách nhiệm trước đơn vị.</span></label>' +
      '<div class="gui-loi" id="gui-loi"></div>' +
      '<div class="btn-row">' +
        '<button class="btn" id="gui-quaylai">← Quay lại</button>' +
        '<span class="grow"></span>' +
        '<button class="btn primary lg" id="gui-gui" disabled>Gửi chính thức</button>' +
      '</div>';

    var chk = document.getElementById('gui-camdoan');
    var btn = document.getElementById('gui-gui');
    function capNhat() { btn.disabled = !chk.checked; }
    chk.addEventListener('change', capNhat);
    document.getElementById('gui-quaylai').addEventListener('click', function () { window.ChuKy.batDau(); });
    btn.addEventListener('click', gui);
  }

  function gui() {
    var nguoi = document.getElementById('gui-nguoi').value.trim();
    var chucVu = document.getElementById('gui-chucvu').value.trim();
    var loi = document.getElementById('gui-loi');
    loi.classList.remove('show');
    if (!nguoi || !chucVu) { loi.textContent = 'Vui lòng nhập họ tên và chức vụ người xác nhận.'; loi.classList.add('show'); return; }

    var btn = document.getElementById('gui-gui');
    btn.disabled = true; btn.textContent = 'Đang gửi…';
    window.API.guiChinhThuc(window.APP.token, nguoi, chucVu).then(function (kq) {
      if (!kq.ok) {
        btn.disabled = false; btn.textContent = 'Gửi chính thức';
        loi.textContent = kq.loi || 'Gửi không thành công.'; loi.classList.add('show');
        return;
      }
      window.APP.daGui = true;
      if (window.APP.donVi) { window.APP.donVi.trangThai = 'DA_GUI'; window.APP.donVi.maBienNhan = kq.data.maBienNhan; }
      thanhCong(kq.data, false);
    });
  }

  function thanhCong(data, daGuiTruoc) {
    window.UI.setStep(4);   // 1·2·3 đều xong
    var tk = data.thongKe || demTrangThai();
    var el = document.getElementById('gui-body');
    el.innerHTML =
      '<div class="bn-card">' +
        '<div class="bn-ic">✓</div>' +
        '<h2 class="bn-h">' + (daGuiTruoc ? 'Đơn vị đã gửi rà soát' : 'Đã gửi rà soát thành công') + '</h2>' +
        '<p class="bn-sub">Dữ liệu của đơn vị đã được khoá. Nếu cần chỉnh sửa, vui lòng liên hệ quản trị để mở khoá.</p>' +
        '<div class="bn-ma-lbl">MÃ BIÊN NHẬN</div>' +
        '<div class="bn-ma">' + window.Util.escapeHtml(data.maBienNhan || '—') + '</div>' +
        '<div class="tk-grid" style="margin-top:16px">' +
          '<div class="tk-o tk-ok"><div class="tk-n">' + tk.giuNguyen + '</div><div class="tk-l">Giữ nguyên</div></div>' +
          '<div class="tk-o tk-sua"><div class="tk-n">' + tk.daSua + '</div><div class="tk-l">Đã sửa</div></div>' +
          '<div class="tk-o tk-xoa"><div class="tk-n">' + tk.khongCon + '</div><div class="tk-l">Không còn công tác</div></div>' +
        '</div>' +
        '<div class="bn-btns">' +
          '<button class="btn" onclick="window.print()">In biên nhận</button>' +
          '<button class="btn primary" id="bn-thoat">Thoát</button>' +
        '</div>' +
      '</div>';
    var t = document.getElementById('bn-thoat');
    if (t) t.addEventListener('click', function () {
      window.APP.token = null; window.APP.danhSach = []; window.APP.daGui = false;
      window.UI.showBuoc('dangnhap'); window.UI.setStep(0);
    });
  }

  return { batDau: batDau, thanhCong: thanhCong };
})();
