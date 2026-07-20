const { test, expect } = require('@playwright/test');
const { dangNhapDV064, raSoatHet } = require('./helper');

test.describe('Bước 1 · Rà soát', () => {

  test('chọn "Cần sửa" thì form mở và nạp sẵn giá trị hiện tại', async ({ page }) => {
    await dangNhapDV064(page);
    const card = page.locator('#cb-DV064-CT1');
    const edit = page.locator('[data-edit="DV064-CT1"]');

    await expect(edit).toBeHidden();
    await card.locator('.b-sai').click();
    await expect(edit).toBeVisible();

    // các ô nạp sẵn giá trị hiện tại của cán bộ
    await expect(card.locator('input[data-field="hoTen_Moi"]')).toHaveValue('Nguyễn Văn An');
    await expect(card.locator('input[data-field="tenTaiKhoan_Moi"]')).toHaveValue('nguyen.van.an');
    await expect(card.locator('input[data-field="soDienThoai_Moi"]')).toHaveValue('0912345670');
    await expect(card.locator('input[data-field="emailCongVu_Moi"]')).toHaveValue('nguyen.van.an@hanoi.gov.vn');
  });

  test('đổi giá trị thì hiện giá trị cũ GẠCH NGANG', async ({ page }) => {
    await dangNhapDV064(page);
    const card = page.locator('#cb-DV064-CT1');
    await card.locator('.b-sai').click();

    const cu = card.locator('.gia-tri-cu[data-cu-line="soDienThoai_Moi"]');
    await expect(cu).toBeHidden();                       // chưa đổi thì chưa hiện

    await card.locator('input[data-field="soDienThoai_Moi"]').fill('0912000000');
    await expect(cu).toBeVisible();
    await expect(cu.locator('s')).toHaveText('0912345670');  // giá trị cũ trong thẻ <s>
  });

  test('ba kiểu email sai cho ra BA thông báo khác nhau', async ({ page }) => {
    await dangNhapDV064(page);
    const card = page.locator('#cb-DV064-CT1');
    await card.locator('.b-sai').click();
    const email = card.locator('input[data-field="emailCongVu_Moi"]');
    const loi = card.locator('.loi-o[data-loi="emailCongVu_Moi"]');

    await email.fill('nguyễn.van.an@hanoi.gov.vn');       // có dấu tiếng Việt
    await expect(loi).toHaveText('Email không được có dấu tiếng Việt.');

    await email.fill('Nguyen.Van.An@hanoi.gov.vn');       // có chữ hoa
    await expect(loi).toHaveText('Email phải viết thường toàn bộ.');

    await email.fill('nguyen.van.an@gmail.com');          // sai tên miền
    await expect(loi).toHaveText('Email phải có dạng ten@hanoi.gov.vn.');

    await email.fill('nguyen.van.an@hanoi.gov.vn');       // hợp lệ → hết lỗi
    await expect(loi).toBeHidden();
  });

  test('nút "Tiếp tục" khoá tới khi rà soát HẾT mọi người', async ({ page }) => {
    await dangNhapDV064(page);
    const tiep = page.locator('#btn-tieptuc');
    await expect(tiep).toBeDisabled();
    await raSoatHet(page);            // xử lý hết (hàng sạch → Đúng, hàng cảnh báo → sửa)
    await expect(tiep).toBeEnabled();
  });

  test('còn lỗi validate thì "Tiếp tục" khoá lại dù đã rà soát hết', async ({ page }) => {
    await dangNhapDV064(page);
    await raSoatHet(page);
    const tiep = page.locator('#btn-tieptuc');
    await expect(tiep).toBeEnabled();

    // Sửa 1 người (hàng sạch), nhập email sai → khoá lại
    const card = page.locator('#cb-DV064-CT1');
    await card.locator('.b-sai').click();
    await card.locator('input[data-field="emailCongVu_Moi"]').fill('sai@gmail.com');
    await expect(tiep).toBeDisabled();
    // sửa lại đúng → mở
    await card.locator('input[data-field="emailCongVu_Moi"]').fill('nguyen.van.an@hanoi.gov.vn');
    await expect(tiep).toBeEnabled();
  });

  test('hàng CÓ cảnh báo: KHÔNG cho chọn Đúng, bắt buộc sửa mới qua', async ({ page }) => {
    await dangNhapDV064(page);
    const card = page.locator('#cb-DV064-PCT1');           // có cảnh báo "Email có dấu tiếng Việt"
    await expect(card.locator('.canh-bao')).toBeVisible();
    await expect(card.locator('.b-dung')).toBeDisabled();  // nút Đúng bị khoá
    await expect(card.locator('.seg-note')).toContainText('bắt buộc');

    await card.locator('.b-sai').click();                  // buộc Cần sửa
    const email = card.locator('input[data-field="emailCongVu_Moi"]');
    await expect(email).toHaveAttribute('data-batbuoc', '1');
    // mở form: email đang có dấu → hiện lỗi ngay
    await expect(card.locator('.loi-o[data-loi="emailCongVu_Moi"]')).toBeVisible();
    // sửa về hợp lệ, khác gốc → hết lỗi, hàng được đánh dấu đã xử lý
    await email.fill('tranthibinh_moi@hanoi.gov.vn');
    await expect(card.locator('.loi-o[data-loi="emailCongVu_Moi"]')).toBeHidden();
    await expect(card).toHaveClass(/da-xuly/);
  });

  test('hàng cảnh báo: đánh dấu KHÔNG CÒN công tác cũng được chấp nhận', async ({ page }) => {
    await dangNhapDV064(page);
    const card = page.locator('#cb-DV064-CV1');            // có cảnh báo email sai tên miền
    await card.locator('.b-sai').click();
    await card.locator('input[data-chk="xoa"]').check();   // không còn công tác
    await expect(card).toHaveClass(/da-xuly/);             // xem như đã xử lý cảnh báo
  });

});
