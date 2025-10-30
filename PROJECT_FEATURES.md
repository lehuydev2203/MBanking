# TỔNG QUAN TÍNH NĂNG DỰ ÁN MBANKING

Tài liệu này tổng hợp các tính năng đã được triển khai và các hướng phát triển tiềm năng cho toàn bộ dự án mBanking, dựa trên log hệ thống từ hai phân hệ `bank-api` và `bank-fe`.

---

## Backend (bank-api)

### ✅ Tính năng đã hoàn thiện

#### Quản lý & Xác thực người dùng
- **Đăng ký & Đăng nhập**: Hỗ trợ đăng ký tài khoản mới và đăng nhập bằng JWT.
- **Xác minh Email**: Yêu cầu xác minh email cho tài khoản mới với mã OTP (6 chữ số, hiệu lực 15 phút).
- **Phân quyền (RBAC)**: Ba cấp độ quyền: `user`, `admin`, `superadmin`.
- **Quản lý Profile**: Người dùng có thể xem và cập nhật thông tin cá nhân.
- **Đổi mật khẩu**: Chức năng cho phép người dùng thay đổi mật khẩu.

#### Giao dịch & Tài chính
- **Nạp/Rút tiền**: Thực hiện giao dịch nạp/rút tiền an toàn qua MongoDB transactions.
- **Chuyển khoản (2 bước)**:
    - **Khởi tạo**: Bắt đầu giao dịch bằng cách nhập thông tin người nhận (số tài khoản/nickname), số tiền. Hệ thống sẽ gửi mã OTP qua email để xác thực.
    - **Xác nhận**: Hoàn tất giao dịch bằng mã OTP đã nhận.
- **Đặt Nickname tài khoản**: Người dùng có thể tạo một biệt danh (nickname) duy nhất cho tài khoản của mình để nhận tiền thuận tiện hơn.
- **Kiểm tra số dư**: Xem số dư tài khoản hiện tại.
- **Giới hạn giao dịch**:
    - Tối đa `20,000,000 VND` mỗi lần giao dịch.
    - Tối đa `500,000,000 VND` mỗi ngày.
- **Lịch sử giao dịch**: Xem lại lịch sử các giao dịch đã thực hiện.
- **Xuất CSV**: Xuất lịch sử giao dịch ra file CSV.
- **Idempotency**: Chống lặp lại giao dịch với `clientRequestId`.

#### Chức năng cho Admin
- **Quản lý người dùng**: Admin/Superadmin có thể xem danh sách và quản lý người dùng.
- **Giám sát giao dịch**: Xem tất cả giao dịch trên hệ thống.
- **Audit Log**: Ghi lại các hành động quan trọng trong hệ thống.

#### Kỹ thuật & Bảo mật
- **Docker & Docker Compose**: Cấu hình sẵn sàng cho môi trường development.
- **Swagger API**: Tài liệu API tự động, chi tiết.
- **Bảo mật**: Hashing mật khẩu (bcrypt), Rate limiting, bảo vệ chống CSV Injection.
- **Health Check**: Endpoint để kiểm tra tình trạng hoạt động của ứng dụng.

---

## Frontend (bank-fe)

### ✅ Tính năng đã hoàn thiện

#### Giao diện & Trải nghiệm người dùng (UI/UX)
- **Dark Mode**: Giao diện tối làm chủ đạo (PrimeNG lara-dark-indigo).
- **Thiết kế Responsive**: Tương thích tốt trên mobile, tablet và desktop.
- **Thông báo**: Sử dụng Toast notifications cho các thông báo lỗi, thành công.
- **Trạng thái tải**: Có các chỉ báo loading (spinners, skeletons) rõ ràng.
- **Định dạng tiền tệ**: Pipe tùy chỉnh để hiển thị định dạng VND.

#### Luồng xác thực & Người dùng
- **Trang Đăng ký / Đăng nhập / Xác minh Email**: Hoàn thiện luồng xác thực người dùng.
- **Bảo vệ Route (Guards)**: Phân quyền truy cập các trang dựa trên trạng thái đăng nhập và vai trò (AuthGuard, RoleGuard).
- **Tự động Logout**: Tự động đăng xuất khi JWT hết hạn và có cảnh báo trước 60 giây.
- **Quản lý Profile**: Trang xem, chỉnh sửa thông tin cá nhân và đổi mật khẩu.

#### Chức năng chính
- **Dashboard**: Hiển thị tổng quan số dư, các giao dịch gần đây và lối tắt chức năng.
- **Nạp tiền**: Form nạp tiền với validation và hỗ trợ idempotency.
- **Rút tiền**: Kiểm tra khả năng rút tiền (`can-withdraw`) trước khi thực hiện và có dialog xác nhận.
- **Lịch sử giao dịch**: Bảng giao dịch với tính năng lọc, sắp xếp, phân trang và xuất CSV.

#### Chức năng cho Admin
- **Quản lý người dùng**: Giao diện quản lý người dùng (danh sách, lọc, thay đổi vai trò/trạng thái).
- **Theo dõi sức khỏe hệ thống**: Trang theo dõi tình trạng các dịch vụ backend.

#### Kỹ thuật
- **Angular 20 Standalone**: Sử dụng kiến trúc component độc lập mới nhất.
- **Sinh Types từ Swagger**: Tự động tạo TypeScript types từ API của backend.
- **Interceptors**: Tự động đính kèm token và xử lý lỗi HTTP tập trung.
- **Lazy Loading**: Tối ưu tốc độ tải trang cho các module chức năng.

---

## 🎯 Hướng phát triển & Cải thiện trong tương lai

Dựa trên các đề xuất trong log, các tính năng có thể phát triển thêm bao gồm:

- **Thông báo đẩy (Push Notifications)**: Gửi thông báo real-time đến người dùng.
- **Xác thực sinh trắc học**: Đăng nhập bằng vân tay hoặc nhận diện khuôn mặt trên mobile.
- **Hỗ trợ Offline**: Sử dụng Service Worker để cache dữ liệu và cho phép một số tính năng hoạt động khi không có mạng.
- **Đa ngôn ngữ (i18n)**: Hỗ trợ nhiều ngôn ngữ cho giao diện.
