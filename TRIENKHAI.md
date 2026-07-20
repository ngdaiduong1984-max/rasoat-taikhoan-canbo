# Hướng dẫn triển khai & kết nối Google Sheets + Google Drive

Trang web (HTML/CSS/JS) chạy trên **GitHub Pages**; dữ liệu ở **Google Sheets**, ảnh chữ ký
ở **Google Drive**, xử lý qua **Google Apps Script**. Các bước bên Google **phải làm bằng
tài khoản Google của cơ quan** (không tự động hoá được).

Thứ tự: **A → B → C → D → E → F**.

---

## A. Tạo Google Sheets và nhập dữ liệu
1. Vào [sheets.new](https://sheets.new) tạo một Trang tính mới, đặt tên ví dụ
   *"RaSoat TaiKhoan CanBo 2026"*.
2. **Tệp ▸ Nhập ▸ Tải lên** → chọn `DuLieuRaSoat_KHONG-COMMIT.xlsx` (đã tạo sẵn ở thư mục dự án).
   Chọn **"Thay thế bảng tính"** để giữ đủ 6 tab: `DanhSach, DonVi, ChuKy, NhatKy, CauHinh, KetQuaCuoi`.
3. **Điền đăng nhập cho đơn vị còn thiếu** (tab `DonVi`): dòng `HĐND phường Thanh Liệt` —
   điền cột `TenDangNhap` (tài khoản CNTT) và `MatKhau` (SĐT CNTT). (Có ghi chú nhắc sẵn.)

## B. Tạo thư mục Google Drive cho ảnh chữ ký
1. Vào [drive.google.com](https://drive.google.com) → **Mới ▸ Thư mục mới**, ví dụ *"AnhChuKy RaSoat"*.
2. Mở thư mục, sao chép **ID** từ URL: `https://drive.google.com/drive/folders/`**`<ID_Ở_ĐÂY>`**.
3. Về Google Sheets → tab `CauHinh` → dòng `THU_MUC_DRIVE_ID` → dán ID vào cột `GiaTri`.
   (Nếu để trống, ảnh sẽ lưu vào "Trang chủ" Drive của tài khoản.)

## C. Cài Apps Script (backend)
1. Trong Google Sheets: **Tiện ích mở rộng ▸ Apps Script**.
2. Xoá code mẫu, **dán toàn bộ** nội dung `apps-script/Code.gs`
   (đã sao chép sẵn vào clipboard — chỉ cần Cmd+V; hoặc mở tệp và copy).
   Vì mở từ trong Sheet nên để `SHEET_ID = ''` (script tự dùng Sheet chứa nó).
3. **Đặt mật khẩu quản trị:** ⚙ **Cài đặt dự án ▸ Thuộc tính tập lệnh** → Thêm thuộc tính:
   - Tên: `ADMIN_PASSWORD` · Giá trị: *(mật khẩu quản trị của anh)*
   (KHÔNG để trong `CauHinh` vì cán bộ xem được Sheets.)
4. **Triển khai:** **Triển khai ▸ Bản triển khai mới ▸ Ứng dụng web**
   - *Thực thi với tư cách:* **Tôi (Me)**
   - *Ai có quyền truy cập:* **Bất kỳ ai (Anyone)**  ← bắt buộc để cán bộ gửi được
   - Cấp quyền (Authorize) → **Sao chép URL** dạng `https://script.google.com/macros/s/…/exec`.
   > Mỗi lần sửa `Code.gs` phải **Triển khai ▸ Quản lý bản triển khai ▸ Sửa ▸ Phiên bản: Mới**
   > thì `/exec` mới chạy code mới (chỉ Lưu là chưa đủ).

## D. Nhúng URL vào trang web (bước này gửi URL cho tôi làm, hoặc tự sửa)
Trong `js/api.js` đầu tệp:
```js
window.DEMO = false;              // tắt DEMO, dùng backend thật
window.GAS_URL = 'https://script.google.com/macros/s/…/exec';
```
Commit + đẩy lên `main` → GitHub tự deploy.

## E. Đưa lên GitHub + bật Pages
1. Tạo repo **public** (chỉ chứa mã nguồn — `*.xlsx/*.csv/*.docx` đã bị `.gitignore` chặn).
2. Đẩy code lên nhánh `main`.
3. Repo ▸ **Settings ▸ Pages ▸ Source = GitHub Actions** (workflow `.github/workflows/deploy.yml`
   sẽ tự chạy mỗi lần đẩy `main`). Trang sẽ ở `https://<user>.github.io/<repo>/`.

## F. Kiểm thử kết nối (Node, KHÔNG dùng curl — curl làm hỏng redirect 302 của GAS)
```bash
node -e '
const url="https://script.google.com/macros/s/…/exec";
(async()=>{
  const r=await fetch(url,{method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({hanhDong:"dangNhap",maDonVi:"DV001",tenDangNhap:"…",matKhau:"…"}),
    redirect:"follow"});
  console.log(await r.text());
})();'
```
Đăng nhập được (trả `ok:true` + token) là kết nối thành công.

---

## Việc còn lại cần quyết
- **Thanh Liệt**: cung cấp tài khoản + SĐT cán bộ CNTT để điền (bước A.3).
- **Dọn repo public**: xoá bộ template cũ (`app/`, `docs/`, `reference-app/`, `scripts/`,
  `CLAUDE.md`) — chứa email chủ sở hữu và thông tin hạ tầng, không nên để trong repo công khai.
- **Tài khoản GitHub**: hiện `gh` đang đăng nhập `ngdaiduong1984-max`. Xác nhận dùng tài khoản
  này hay tài khoản chính thức của cơ quan.
