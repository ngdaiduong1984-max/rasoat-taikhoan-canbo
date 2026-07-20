const { test, expect } = require('@playwright/test');
const { chonDonVi } = require('./helper');

test.describe('Đăng nhập', () => {

  test('tìm đơn vị gõ KHÔNG DẤU thì ra đúng đơn vị', async ({ page }) => {
    await page.goto('/');
    await page.fill('#o-tim', 'cua nam');            // gõ không dấu
    const list = page.locator('#tim-list');
    await expect(list).toBeVisible();
    await expect(list).toContainText('Phường Cửa Nam');
    // gõ mã cũng ra; và gõ sai thì báo không tìm thấy
    await page.fill('#o-tim', 'ba vi');
    await expect(page.locator('.tim-item', { hasText: 'Xã Ba Vì' })).toBeVisible();
    await page.fill('#o-tim', 'khongtontai');
    await expect(page.locator('#tim-list')).toContainText('Không tìm thấy');
  });

  test('chọn đơn vị từ gợi ý thì điền vào ô tìm', async ({ page }) => {
    await page.goto('/');
    await chonDonVi(page, 'cua nam', 'Phường Cửa Nam');
    await expect(page.locator('#tim-list')).toBeHidden();
  });

  test('thiếu tên đăng nhập thì báo lỗi', async ({ page }) => {
    await page.goto('/');
    await chonDonVi(page, 'cua nam', 'Phường Cửa Nam');
    await page.fill('#o-sdt', '0912345678');       // có SĐT nhưng chưa có tên đăng nhập
    await page.click('#btn-dangnhap');
    await expect(page.locator('#login-err')).toContainText('tên đăng nhập');
  });

  test('đúng đơn vị + tên đăng nhập + SĐT thì vào được', async ({ page }) => {
    await page.goto('/');
    await chonDonVi(page, 'cua nam', 'Phường Cửa Nam');
    await page.fill('#o-taikhoan', 'hoang.van.em');
    await page.fill('#o-sdt', '0912345678');
    await page.click('#btn-dangnhap');
    await expect(page.locator('#man-rasoat')).toBeVisible();
  });

  test('sai mật khẩu đủ số lần thì đơn vị bị khoá', async ({ page }) => {
    await page.goto('/');
    await chonDonVi(page, 'cua nam', 'Phường Cửa Nam');
    await page.fill('#o-taikhoan', 'hoang.van.em');   // tên đăng nhập đúng, SĐT sai
    const err = page.locator('#login-err');

    // 4 lần đầu: còn nhắc số lần thử
    for (let i = 1; i <= 4; i++) {
      await page.fill('#o-sdt', '0000000000');
      await page.click('#btn-dangnhap');
      await expect(err).toContainText('lần thử');
    }
    // lần 5: khoá
    await page.fill('#o-sdt', '0000000000');
    await page.click('#btn-dangnhap');
    await expect(err).toContainText('khoá');
    // lần 6: chặn hẳn, không cho thử tiếp
    await page.fill('#o-sdt', '0000000000');
    await page.click('#btn-dangnhap');
    await expect(err).toContainText('quá số lần');
    // vẫn ở màn đăng nhập
    await expect(page.locator('#man-dangnhap')).toBeVisible();
  });

});
