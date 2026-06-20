# Hướng Dẫn Dành Cho Lập Trình Viên & AI Agents (AGENTS.md)

Tài liệu này chứa các quy tắc thiết kế hệ thống, kiến trúc mã nguồn và các lưu ý quan trọng khi sửa đổi hoặc mở rộng dự án **EZ-OpenClaw**. Bất kỳ nhà phát triển hoặc AI Agent nào tiếp quản dự án này cần tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 🛠️ Công Nghệ & Kiến Trúc (Tech Stack & Architecture)

- **Frontend:** React 18, Vite, Tailwind CSS v3.
- **Backend:** Electron v31 (sử dụng mô hình bảo mật cô lập Main Process, Preload Script và Renderer Process).
- **Styling & Theme:** Sử dụng các CSS variables tùy biến (`--win11-bg`, `--win11-card`, `--win11-border`) kết hợp với `@media (prefers-color-scheme: light)` để tự động hóa việc đồng bộ hóa giao diện Sáng/Tối trực tiếp từ cấu hình hệ điều hành Windows.

---

## 📌 Các Quy Tắc Phát Triển Quan Trọng (Critical Engineering Rules)

### 1. Giám Sát Trạng Thái OpenClaw Gateway (Port Checking)
- **Quy tắc:** Tuyệt đối **KHÔNG** theo dõi trạng thái Bật/Tắt của OpenClaw Gateway bằng cách theo dõi sự sống/chết của tiến trình con (`child_process` hoặc `PID`). Vì trên một số hệ thống, OpenClaw sẽ chạy dưới dạng Scheduled Task ngầm và tiến trình khởi chạy chính sẽ tự tắt sau khi kích hoạt.
- **Giải pháp:** Sử dụng HTTP GET request gửi tới `http://127.0.0.1:18789`.
  - Nếu kết nối phản hồi thành công (HTTP 200 OK): Xác nhận trạng thái **Running / Online**.
  - Nếu kết nối thất bại hoặc bị từ chối: Xác nhận trạng thái **Stopped / Offline**.

### 2. Trích Xuất & Hiển Thị Logs (Log Tailing via Byte Offset)
- **Quy tắc:** Không được đọc toàn bộ nội dung tệp tin log hoặc stream stdout/stderr trực tiếp liên tục trong thời gian dài vì sẽ gây tràn bộ nhớ (memory leak) và lặp log.
- **Giải pháp:**
  - Định vị file log mới nhất có định dạng `openclaw-*.log` trong thư mục Temp của hệ thống (`AppData/Local/Temp/openclaw`).
  - Đọc logs định kỳ (mỗi 5 giây) bằng phương pháp **Tailing**: Ghi nhớ byte offset (vị trí đọc cuối cùng) và chỉ đọc thêm phần dữ liệu mới được ghi thêm vào tệp tin.

### 3. Quản Lý Mô Hình Cục Bộ (Ollama & AI Models)
- **Môi trường Portable:** Ollama và Node.js Portable được tải về dạng tệp nén, giải nén cục bộ vào thư mục ứng dụng (`AppData/Local/ez-openclaw-runtime/`). Tuyệt đối không gọi hay can thiệp vào các đường dẫn biến môi trường (Environment Paths) toàn cục của hệ thống Windows.
- **Thư mục Models riêng biệt:** Đảm bảo Ollama chạy ngầm bằng lệnh `ollama serve` luôn đi kèm cấu hình biến môi trường `OLLAMA_MODELS` chỉ định về thư mục runtime cục bộ để tránh rác ổ đĩa `C:\Users\<Name>\.ollama`.
- **Cắt tỉa digest logs của Ollama:** Khi Ollama tải mô hình về, logs CLI sẽ trả về các mã sha256 liên tục. Cần lọc và chuyển đổi các log dạng `pulling sha256:...` thành văn bản tiếng Việt/tiếng Anh rút gọn ("Đang tải mô hình" / "Pulling model") trước khi đẩy lên UI để nâng cao trải nghiệm người dùng.

### 4. Quy Tắc Đồng Bộ Giao Diện (Theme Syncing & Overrides)
- **Không sử dụng trạng thái React:** Không định nghĩa state hoặc lưu local storage cho giao diện Sáng/Tối. Việc chuyển đổi theme phải được thực hiện tự động hoàn toàn bằng Media Query `@media (prefers-color-scheme: light)` trong [index.css](file:///e:/EZ_install_openclaw/src/renderer/index.css).
- **Hạn chế dùng bộ chọn con đại diện (*):** Khi viết CSS overrides cho chế độ sáng (Light Mode), không được sử dụng bộ chọn con đại diện với độ ưu tiên cao dạng `.text-white *` hay `.text-gray-100 *`. Điều này sẽ đè màu đen lên các chữ thông báo trạng thái có màu chuyên biệt (như `text-green-500` cho YES/ONLINE, `text-red-500` cho NO/OFFLINE) khiến chúng bị mất màu. Chỉ được tác động trực tiếp vào các class cụ thể.

### 5. Yêu Cầu Đóng Gói Trực Tiếp
- **Quy tắc đóng gói:** Khi đóng gói bản phát hành bằng `electron-builder` thông qua lệnh `npm run dist`, chỉ được tạo ra file cài đặt Windows Installer dạng `.exe` (sử dụng target NSIS). Không đóng gói thành định dạng `.zip` cho các phiên bản phát hành chính thức của trình cài đặt.
