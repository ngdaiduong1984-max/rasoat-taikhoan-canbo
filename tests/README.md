# Kiểm thử (Playwright)

Bộ test end-to-end chạy trên **bản DEMO** (`window.DEMO = true` trong `js/api.js`),
**không cần backend**. Playwright tự dựng máy chủ tĩnh (cổng 8123) phục vụ thư mục dự án.

## Chạy

```bash
npm install                     # cài @playwright/test
npx playwright install chromium # tải trình duyệt (nếu chưa có)
npm test                        # chạy toàn bộ test
```

Lệnh khác: `npm run test:headed` (mở trình duyệt), `npm run test:ui` (giao diện),
`npm run report` (xem báo cáo).

## Phạm vi phủ (đúng yêu cầu)

`tests/dangnhap.spec.js`
- Tìm đơn vị gõ **không dấu** ra đúng đơn vị (và báo khi không tìm thấy).
- Nhập **sai mật khẩu đủ số lần** → đơn vị bị khoá.

`tests/rasoat.spec.js`
- Chọn **Cần sửa** → form mở và **nạp sẵn giá trị hiện tại**.
- Đổi giá trị → hiện **giá trị cũ gạch ngang**.
- **Ba kiểu email sai** → **ba thông báo khác nhau** (có dấu / chữ hoa / sai tên miền).
- Nút **Tiếp tục khoá** khi chưa rà soát hết; khoá lại khi còn lỗi validate.

`tests/chuky-gui.spec.js` (bổ sung — Bước 2)
- Ảnh trắng không nét → báo chụp lại.
- Luồng đầy đủ: xử lý ảnh → tải lên → gửi → **mã biên nhận**.
- Đăng nhập lại đơn vị đã gửi → bị khoá, hiện biên nhận.

> Ảnh chữ ký trong test được sinh ngay trong trình duyệt (canvas), không cần tệp mẫu.
