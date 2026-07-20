const { test, expect } = require('@playwright/test');

async function vaoQuanTri(page) {
  await page.goto('/admin.html');
  await page.fill('#adm-mk', 'admin123');
  await page.click('#adm-vao');
  await expect(page.locator('#man-adm')).toBeVisible();
  await expect(page.locator('#adm-tbody tr')).toHaveCount(3);
}

test.describe('Bước 4 · Quản trị', () => {

  test('sai mật khẩu → báo lỗi; đúng → vào bảng 126 đơn vị', async ({ page }) => {
    await page.goto('/admin.html');
    await page.fill('#adm-mk', 'sai-mat-khau');
    await page.click('#adm-vao');
    await expect(page.locator('#adm-err')).toContainText('không đúng');
    await page.fill('#adm-mk', 'admin123');
    await page.click('#adm-vao');
    await expect(page.locator('#man-adm')).toBeVisible();
    await expect(page.locator('#adm-stats')).toContainText('Tổng đơn vị');
  });

  test('lọc theo trạng thái', async ({ page }) => {
    await vaoQuanTri(page);
    await page.click('.chip[data-loc="DA_GUI"]');
    await expect(page.locator('#adm-tbody tr')).toHaveCount(1);
    await expect(page.locator('#adm-tbody')).toContainText('Hoàn Kiếm');
    await page.click('.chip[data-loc="CHUA_RA_SOAT"]');
    await expect(page.locator('#adm-tbody')).toContainText('Cửa Nam');
  });

  test('xem chi tiết cũ → mới', async ({ page }) => {
    await vaoQuanTri(page);
    await page.click('[data-xem="DV064"]');
    await expect(page.locator('#modal')).toBeVisible();
    await expect(page.locator('#md-ten')).toContainText('DV064');
    await expect(page.locator('.ss-tbl')).toBeVisible();     // bảng so sánh
    await page.click('#md-close');
    await expect(page.locator('#modal')).toBeHidden();
  });

  test('hợp nhất kết quả cuối + dò trùng chéo 126 đơn vị', async ({ page }) => {
    await vaoQuanTri(page);
    page.on('dialog', function (d) { d.accept(); });
    await page.click('#adm-hopnhat');
    await expect(page.locator('#modal')).toBeVisible();
    await expect(page.locator('#md-ten')).toContainText('dò trùng chéo');
    await expect(page.locator('#md-body')).toContainText('KetQuaCuoi');
    // demo cố tình có trùng chéo email + SĐT giữa hai đơn vị
    await expect(page.locator('.ss-tbl')).toContainText('nguyen.van.an@hanoi.gov.vn');
  });

  test('mở khoá đơn vị đã gửi', async ({ page }) => {
    await vaoQuanTri(page);
    page.on('dialog', function (d) { d.accept(); });         // chấp nhận confirm()
    await page.click('.chip[data-loc="DA_GUI"]');
    await page.click('[data-mokhoa="DV112"]');
    // sau mở khoá, DV112 rời trạng thái "Đã gửi" → bộ lọc còn 0
    await expect(page.locator('#adm-tbody')).toContainText('Không có đơn vị phù hợp');
  });

});
