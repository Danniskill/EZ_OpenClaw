# EZ-OpenClaw: Windows 11 Fluent GUI Installer & Manager

EZ-OpenClaw là một ứng dụng Desktop GUI (giao diện đồ họa) được xây dựng bằng Electron, React và Tailwind CSS theo phong cách ngôn ngữ thiết kế **Windows 11 Settings UI (Fluent Design)**. Ứng dụng giúp đơn giản hóa và tự động hóa toàn bộ quy trình cài đặt, cấu hình và vận hành OpenClaw (một AI agent daemon framework) cùng Ollama trên hệ điều hành Windows mà không cần sử dụng dòng lệnh (CLI).

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Trình Thuật Sĩ Cài Đặt Tự Động (Setup Wizard)
- **Cấu hình Node.js Portable linh hoạt:** Cho phép tùy chọn sử dụng phiên bản Node.js có sẵn trên hệ thống hoặc tự động tải về, giải nén bản **Node.js v22.22.3 Portable** cô lập bên trong thư mục ứng dụng để giữ sạch môi trường Windows.
- **Tự động tải & cấu hình Ollama:** Tự động cài đặt Ollama Windows Portable, khởi chạy daemon chạy ngầm (`ollama serve`) và thiết lập thư mục lưu trữ Model riêng biệt trong AppData để tránh rác ổ đĩa hệ thống.
- **Thiết lập OpenClaw Core & Task:** Tự động chạy lệnh cài đặt openclaw core, tạo các tệp tin cấu hình (`openclaw.json5`) và tự động đăng ký scheduled task cho Gateway trên Windows.

### 2. Radar Chẩn Đoán Phần Cứng & Gợi Ý AI Model (GPI Tiering)
- **Đọc thông số chi tiết hệ thống:** Sử dụng thư viện `systeminformation` để phân tích CPU, dung lượng RAM, dòng GPU, dung lượng VRAM và kiểu bộ nhớ GPU.
- **Chỉ số Hiệu Năng GPU (GPI - GPU Performance Index):** Áp dụng công thức tính điểm hiệu năng phần cứng động để xếp loại máy tính của người dùng vào 4 nhóm hiệu năng (Tiers 1 - 4).
- **Ma trận tương thích Model thông minh:** Gợi ý các mô hình AI cục bộ tối ưu nhất (như Llama 3.2, Qwen 2.5, Qwen 2.5 Coder, Gemma 3/4) tùy theo cấu hình phần cứng và mục đích sử dụng cụ thể của người dùng (Trò chuyện, Lập trình hoặc Viết lách). Kiểm tra RAM/VRAM thực tế để cảnh báo độ mượt mà khi chạy mô hình (Smooth, Heavy/Slow, Low RAM).

### 3. Điều Khiển & Giám Sát OpenClaw Gateway
- **Bật/Tắt dịch vụ an toàn:** Hỗ trợ khởi động và tắt hoàn toàn tiến trình ngầm của OpenClaw Gateway cùng Ollama Engine thông qua giao diện nút nhấn trực quan.
- **Xác nhận trạng thái qua Cổng Kết Nối:** Kiểm tra trạng thái hoạt động thực tế của Gateway bằng cách gửi HTTP GET request định kỳ tới cổng `18789` (tránh lỗi hiển thị sai lệch khi tiến trình chính chuyển sang chế độ chạy ngầm).
- **Đọc Log Tailing thông minh:** Định kỳ quét tệp tin log gần nhất (`openclaw-*.log` trong thư mục Temp), sử dụng byte-offset để chỉ đọc và đẩy các dữ liệu logs mới lên giao diện (tránh lặp log, tiết kiệm RAM và CPU).
- **Liên kết WhatsApp bằng mã QR Monospace:** Tự động trích xuất chuỗi mã QR từ logs khi phát hiện yêu cầu liên kết tài khoản WhatsApp và vẽ trực tiếp mã QR Monospace ASCII lên giao diện để người dùng quét kết nối nhanh chóng.

### 4. Tự Động Đồng Bộ Giao Diện Theo Hệ Điều Hành Windows
- **Auto Light/Dark Theme Sync:** Sử dụng CSS Media Query `@media (prefers-color-scheme: light)` kết hợp với các biến CSS Tailwind, giao diện ứng dụng sẽ tự động chuyển đổi đồng bộ tức thì theo cài đặt Light/Dark Mode của hệ điều hành Windows mà không cần tải lại trang.
- **Bảo toàn giao diện PowerShell Console:** Dù ở chế độ Light Mode, ô logs PowerShell vẫn giữ nguyên nền đen chữ sáng chuẩn terminal để đảm bảo thẩm mỹ kỹ thuật.

### 5. Tiện Ích Tích Hợp
- **Nhúng Chat Dashboard trực tiếp:** Cho phép nhúng trực tiếp giao diện chat webview (`http://localhost:18789`) ngay trong ứng dụng để người dùng trò chuyện trực tiếp với Trợ lý ảo.
- **Công Cụ Sửa Lỗi Doctor Fix:** Tích hợp nút chạy chẩn đoán nhanh hệ thống ngầm (`npx openclaw doctor --fix`) chỉ với 1 click.
- **Hỗ trợ Song Ngữ:** Dễ dàng chuyển đổi giữa tiếng Anh (EN) và tiếng Việt (VI).

---
