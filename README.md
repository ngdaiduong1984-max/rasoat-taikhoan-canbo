# Hệ thống rà soát tài khoản cán bộ

Web rà soát, cập nhật thông tin tài khoản cán bộ các **xã, phường** trực thuộc
**Văn phòng Đoàn ĐBQH và HĐND thành phố Hà Nội**.

Trọng tâm không phải thu thập mới, mà **buộc từng đơn vị nhìn thấy và tự xử lý lỗi**
trong dữ liệu tài khoản của chính họ (email sai tên miền, email có dấu tiếng Việt,
email/điện thoại trùng chéo giữa các đơn vị…).

## Kiến trúc (không build step)

- **Frontend:** HTML/CSS/JS thuần — không framework, không bundler. Deploy **GitHub Pages**.
- **Backend:** **Google Apps Script** (`/exec`).
- **CSDL:** **Google Sheets**. **Ảnh chữ ký:** **Google Drive**.
- **Repo public:** chỉ chứa **mã nguồn** — tuyệt đối không commit tệp có họ tên/email/điện thoại.

## Cấu trúc

```
index.html            Trang rà soát (đăng nhập → rà soát → chữ ký → gửi)
admin.html            Trang quản trị (Bước 4)
css/style.css         Bộ khung giao diện (đỏ quốc gia + vàng đồng)
js/api.js             Lớp API + cờ DEMO + dữ liệu mẫu + validate + tiện ích
js/dangnhap.js        Màn hình đăng nhập (tìm đơn vị không dấu + SĐT)
js/rasoat.js          Bước 1 · rà soát (thẻ cán bộ, sửa, lưu nháp tự động)
js/chuky.js           Bước 2 · ảnh chữ ký (khung — Bước 2)
apps-script/Code.gs   Backend Apps Script
assets/quoc-huy.svg   Quốc huy
tests/                Playwright chạy trên bản DEMO (Bước 3)
```

## Chạy thử nhanh (bản DEMO — không cần backend)

`js/api.js` có cờ `window.DEMO = true`: dùng dữ liệu mẫu ngay trong trình duyệt.

```bash
python3 -m http.server 8765
# mở http://localhost:8765/
```

Đăng nhập demo (Đơn vị + Tên đăng nhập + SĐT):

| Đơn vị (gõ không dấu) | Tên đăng nhập | SĐT (mật khẩu) |
|---|---|---|
| `cua nam` → Phường Cửa Nam | `hoang.van.em` | `0912345678` |
| `ba vi` → Xã Ba Vì | `bui.thi.lan` | `0987654321` |

Dữ liệu mẫu cố tình cài đủ 4 loại lỗi để kiểm thử giao diện: email sai tên miền,
email có dấu, email trùng chéo, số điện thoại trùng chéo.

## Chuyển sang chạy thật + Deploy

Xem **[TRIENKHAI.md](TRIENKHAI.md)** — hướng dẫn từng bước: tạo Google Sheets (nhập
`DuLieuRaSoat_KHONG-COMMIT.xlsx`), tạo thư mục Drive, cài Apps Script, nhúng `GAS_URL`
+ đặt `DEMO=false`, đưa lên GitHub và bật Pages.

- **Deploy:** GitHub Actions (`.github/workflows/deploy.yml`) tự đẩy trang lên **GitHub
  Pages** mỗi khi push `main` (chỉ đóng gói `index.html, admin.html, css, js, assets`).
- **Backend:** đặt `window.DEMO = false` và `window.GAS_URL = '<url /exec>'` ở đầu `js/api.js`.

> Chi tiết tên cột, mô hình dữ liệu và các cạm bẫy kỹ thuật xem phần đầu `Code.gs`.

## Tiến độ

- [x] **Bước 1** — khung thư mục + đăng nhập + rà soát + cờ DEMO.
- [x] **Bước 2** — ảnh chữ ký (canvas: tách nền/cắt viền/≤800px) + màn gửi + mã biên nhận.
- [x] **Bước 3** — bộ test Playwright (19 test) chạy trên bản DEMO. Xem `tests/README.md`.
- [x] **Bước 4** — trang quản trị (`admin.html`): bảng 126 đơn vị lọc trạng thái, chi tiết cũ→mới, mở khoá, đôn đốc email chia lô, xem chữ ký. Demo mật khẩu quản trị: `admin123`.
- [x] **Bước 5** — hợp nhất `KetQuaCuoi` (SUA→mới, DUNG→gốc, XOA→loại) + dò trùng email/tài khoản/SĐT **toàn bộ 126 đơn vị** (nút "Hợp nhất & dò trùng" trong quản trị).
- [x] **Bước 6** — GitHub Actions deploy Pages (`.github/workflows/deploy.yml`). Kết nối Google: xem [TRIENKHAI.md](TRIENKHAI.md).
