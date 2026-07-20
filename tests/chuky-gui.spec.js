const { test, expect } = require('@playwright/test');
const { dangNhapDV064, raSoatHet, anhChuKyBuffer } = require('./helper');

test.describe('Bước 2 · Ảnh chữ ký + Gửi', () => {

  test('ảnh trắng không nét → báo chụp lại', async ({ page }) => {
    await dangNhapDV064(page);
    await raSoatHet(page);
    await page.click('#btn-tieptuc');
    await expect(page.locator('#ck-drop')).toBeVisible();

    // ảnh toàn trắng (không có điểm tối hơn ngưỡng)
    const trang = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 300; c.height = 200;
      const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 300, 200);
      return c.toDataURL('image/png');
    });
    await page.setInputFiles('#ck-file', { name: 'trang.png', mimeType: 'image/png', buffer: Buffer.from(trang.split(',')[1], 'base64') });
    await expect(page.locator('#ck-loi')).toContainText('Không nhận ra nét chữ ký');
  });

  test('luồng đầy đủ: xử lý ảnh → tải lên → gửi → mã biên nhận', async ({ page }) => {
    await dangNhapDV064(page);
    await raSoatHet(page);
    await page.click('#btn-tieptuc');

    // nạp ảnh chữ ký → xử lý canvas → hiện xem trước
    await page.setInputFiles('#ck-file', { name: 'chuky.png', mimeType: 'image/png', buffer: await anhChuKyBuffer(page) });
    await expect(page.locator('#ck-xem')).toBeVisible();

    // tải lên → tên tệp đúng khuôn CK_<Ma>_<TenDV>_<HoTen>_<yyyyMMdd>.png
    await page.click('#ck-taulen');
    await expect(page.locator('#ck-done')).toBeVisible();
    await expect(page.locator('#ck-done-f')).toContainText('CK_DV064_PhuongCuaNam_NguyenVanAn_');

    // sang bước gửi
    await page.click('#ck-tiep');
    await expect(page.locator('#man-gui')).toBeVisible();

    // thiếu thông tin → báo lỗi
    await page.check('#gui-camdoan');
    await page.click('#gui-gui');
    await expect(page.locator('#gui-loi')).toContainText('họ tên và chức vụ');

    // nhập đủ → gửi → mã biên nhận XN-<Ma>-<yyyyMMdd-HHmm>
    await page.fill('#gui-nguoi', 'Lê Thị Minh');
    await page.fill('#gui-chucvu', 'Chánh Văn phòng');
    await page.click('#gui-gui');
    await expect(page.locator('.bn-ma')).toContainText('XN-DV064-');
  });

  test('đăng nhập lại đơn vị đã gửi thì bị khoá, hiện biên nhận', async ({ page }) => {
    // gửi trước
    await dangNhapDV064(page);
    await raSoatHet(page);
    await page.click('#btn-tieptuc');
    await page.setInputFiles('#ck-file', { name: 'chuky.png', mimeType: 'image/png', buffer: await anhChuKyBuffer(page) });
    await expect(page.locator('#ck-xem')).toBeVisible();
    await page.click('#ck-taulen');
    await expect(page.locator('#ck-done')).toBeVisible();
    await page.click('#ck-tiep');
    await page.fill('#gui-nguoi', 'Lê Thị Minh');
    await page.fill('#gui-chucvu', 'Chánh Văn phòng');
    await page.check('#gui-camdoan');
    await page.click('#gui-gui');
    await expect(page.locator('.bn-ma')).toContainText('XN-DV064-');

    // đăng nhập lại KHÔNG tải lại trang (giữ trạng thái DEMO trong RAM)
    await page.locator('#bn-thoat').click();
    await expect(page.locator('#man-dangnhap')).toBeVisible();
    const { chonDonVi } = require('./helper');
    await chonDonVi(page, 'cua nam', 'Phường Cửa Nam');
    await page.fill('#o-taikhoan', 'hoang.van.em');
    await page.fill('#o-sdt', '0912345678');
    await page.click('#btn-dangnhap');
    // vào thẳng màn gửi (đã khoá) với biên nhận
    await expect(page.locator('#man-gui')).toBeVisible();
    await expect(page.locator('.bn-ma')).toContainText('XN-DV064-');
  });

});
