// Tiện ích dùng chung cho các test (bản DEMO).
const { expect } = require('@playwright/test');

const DV064 = { ma: 'DV064', ten: 'Phường Cửa Nam', tk: 'hoang.van.em', mk: '0912345678' };

/** Tìm đơn vị bằng cách gõ không dấu rồi chọn trong gợi ý. */
async function chonDonVi(page, timKhongDau, tenDayDu) {
  await page.fill('#o-tim', timKhongDau);
  const item = page.locator('.tim-item', { hasText: tenDayDu });
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator('#o-tim')).toHaveValue(tenDayDu);
}

/** Đăng nhập DV064 (Đơn vị + Tên đăng nhập + SĐT) và chờ màn rà soát. */
async function dangNhapDV064(page) {
  await page.goto('/');
  await chonDonVi(page, 'cua nam', DV064.ten);
  await page.fill('#o-taikhoan', DV064.tk);
  await page.fill('#o-sdt', DV064.mk);
  await page.click('#btn-dangnhap');
  await expect(page.locator('#man-rasoat')).toBeVisible();
  await expect(page.locator('.can-bo').first()).toBeVisible();
}

/** Rà soát hết: hàng sạch → "Đúng"; hàng có cảnh báo → "Cần sửa" và sửa trường
    bắt buộc về giá trị hợp lệ, khác gốc (vì hàng cảnh báo không cho chọn "Đúng"). */
async function raSoatHet(page) {
  const cards = page.locator('.can-bo');
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const warned = (await card.locator('.canh-bao').count()) > 0;
    if (!warned) { await card.locator('.b-dung').click(); continue; }
    await card.locator('.b-sai').click();
    const em = card.locator('input[data-field="emailCongVu_Moi"][data-batbuoc="1"]');
    if (await em.count()) await em.fill(`fix${i}@hanoi.gov.vn`);
    const sd = card.locator('input[data-field="soDienThoai_Moi"][data-batbuoc="1"]');
    if (await sd.count()) await sd.fill('09' + String(80000000 + i).slice(-8));
    const tk = card.locator('input[data-field="tenTaiKhoan_Moi"][data-batbuoc="1"]');
    if (await tk.count()) await tk.fill(`fix.tk${i}`);
  }
  return n;
}

/** Sinh ảnh "chữ ký" (nền trắng + nét đậm) ngay trong trình duyệt → Buffer PNG. */
async function anhChuKyBuffer(page) {
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 800; c.height = 500;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 800, 500);
    g.strokeStyle = '#111418'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(220, 260);
    g.bezierCurveTo(300, 160, 400, 360, 500, 260);
    g.bezierCurveTo(560, 190, 610, 210, 640, 280);
    g.stroke();
    return c.toDataURL('image/png');
  });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

module.exports = { DV064, chonDonVi, dangNhapDV064, raSoatHet, anhChuKyBuffer };
