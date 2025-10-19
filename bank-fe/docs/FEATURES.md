# Banking Frontend - Tính năng chi tiết

## 📋 Tổng quan

Dự án Banking Frontend được xây dựng với Angular 20 và PrimeNG, cung cấp giao diện người dùng hoàn chỉnh cho hệ thống ngân hàng với dark theme và responsive design.

## 🔐 Authentication & Authorization

### Đăng ký tài khoản

- **Form validation**: Tên, email, số điện thoại (tùy chọn), mật khẩu (min 8 ký tự)
- **Email verification**: Gửi email xác thực sau khi đăng ký
- **Error handling**: Xử lý lỗi EMAIL_NOT_VERIFIED, USER_ALREADY_EXISTS
- **UX**: Toast notifications, loading states

### Xác thực email

- **Query params**: Đọc code từ URL parameters
- **Resend verification**: Gửi lại email xác thực
- **Error states**: Hiển thị lỗi nếu code không hợp lệ hoặc hết hạn
- **Success flow**: Chuyển hướng đến trang đăng nhập

### Đăng nhập

- **Form validation**: Email format, mật khẩu required
- **JWT handling**: Lưu token vào localStorage
- **Auto-logout**: Tự động đăng xuất khi token hết hạn (cảnh báo 60s trước)
- **Error mapping**: EMAIL_NOT_VERIFIED, INVALID_CREDENTIALS

### Route Guards

- **AuthGuard**: Bảo vệ routes yêu cầu đăng nhập
- **RoleGuard**: Kiểm tra quyền admin/superadmin
- **403 Page**: Trang lỗi khi không có quyền truy cập

## 💰 Wallet Management

### Nạp tiền

- **Amount validation**: Min 1,000₫, Max 100,000,000₫
- **Idempotency**: Sử dụng UUID v4 làm clientRequestId
- **Transaction summary**: Hiển thị tóm tắt trước khi xác nhận
- **Real-time balance**: Cập nhật số dư ngay sau giao dịch
- **Error handling**: Xử lý lỗi INSUFFICIENT_BALANCE, INVALID_AMOUNT

### Rút tiền

- **Pre-check**: Gọi API can-withdraw để kiểm tra khả năng
- **Reasons display**: Hiển thị lý do nếu không được phép rút
- **Confirmation dialog**: Xác nhận trước khi thực hiện
- **Amount limits**: Kiểm tra giới hạn rút tiền
- **Error handling**: Xử lý lỗi WITHDRAWAL_LIMIT_EXCEEDED

## 📊 Dashboard

### Balance Display

- **Real-time**: Hiển thị số dư hiện tại
- **Auto-refresh**: Làm mới số dư định kỳ
- **Loading states**: Skeleton loading khi đang tải
- **Currency formatting**: Sử dụng CurrencyVndPipe

### Recent Transactions

- **Last 5 transactions**: Hiển thị 5 giao dịch gần nhất
- **Transaction types**: Phân biệt deposit/withdraw/transfer
- **Status indicators**: Màu sắc theo trạng thái
- **Quick actions**: Nút chuyển đến trang giao dịch đầy đủ

### Quick Actions

- **Nạp tiền**: Chuyển đến trang deposit
- **Rút tiền**: Chuyển đến trang withdraw
- **Xem giao dịch**: Chuyển đến trang transactions

## 📈 Transaction History

### Filtering & Search

- **Transaction type**: Lọc theo loại giao dịch
- **Date range**: Chọn khoảng thời gian với p-calendar
- **Amount range**: Lọc theo số tiền min/max
- **Status filter**: Lọc theo trạng thái giao dịch
- **Clear filters**: Xóa tất cả bộ lọc

### Data Table

- **Pagination**: Phân trang với lazy loading
- **Sorting**: Sắp xếp theo các cột
- **Empty states**: Hiển thị khi không có dữ liệu
- **Loading states**: Progress spinner khi đang tải

### Export Functionality

- **CSV export**: Xuất dữ liệu ra file CSV
- **Filtered export**: Chỉ xuất dữ liệu đã lọc
- **File naming**: Tên file có timestamp

## 👤 User Profile

### Personal Information

- **View/Edit**: Xem và chỉnh sửa thông tin cá nhân
- **Validation**: Tên bắt buộc, email readonly
- **Real-time updates**: Cập nhật ngay lập tức
- **Error handling**: Xử lý lỗi validation

### Change Password

- **Current password**: Xác thực mật khẩu hiện tại
- **New password**: Mật khẩu mới với strength indicator
- **Confirm password**: Xác nhận mật khẩu mới
- **Validation**: Kiểm tra độ mạnh và khớp nhau

### Account Information

- **Role display**: Hiển thị vai trò người dùng
- **Status**: Trạng thái tài khoản
- **Creation date**: Ngày tạo tài khoản

## 👑 Admin Panel

### User Management

- **User listing**: Danh sách tất cả người dùng
- **Search & Filter**: Tìm kiếm theo tên, email, vai trò, trạng thái
- **Role management**: Thay đổi vai trò người dùng
- **Status management**: Kích hoạt/vô hiệu hóa tài khoản
- **Resend verification**: Gửi lại email xác thực

### Transaction Management

- **All transactions**: Xem tất cả giao dịch trong hệ thống
- **Advanced filtering**: Bộ lọc nâng cao
- **User filtering**: Lọc theo người dùng
- **Export capabilities**: Xuất dữ liệu giao dịch

### System Health

- **Service status**: Trạng thái các dịch vụ (database, redis, external)
- **Auto-refresh**: Cập nhật mỗi 30 giây
- **Uptime tracking**: Theo dõi thời gian hoạt động
- **Version info**: Thông tin phiên bản hệ thống

## 🎨 UI/UX Features

### Dark Theme

- **PrimeNG lara-dark-indigo**: Theme chính
- **Custom overrides**: Tùy chỉnh màu sắc thương hiệu
- **Consistent styling**: Đồng nhất trên tất cả components
- **High contrast**: Tỷ lệ tương phản ≥ 4.5:1

### Responsive Design

- **Mobile-first**: Thiết kế ưu tiên mobile
- **Breakpoints**: sm, md, lg, xl
- **Flexible layouts**: Sử dụng PrimeFlex grid system
- **Touch-friendly**: Kích thước button phù hợp cho touch

### Accessibility

- **ARIA labels**: Tất cả interactive elements
- **Keyboard navigation**: Hỗ trợ điều hướng bằng bàn phím
- **Focus management**: Focus ring rõ ràng
- **Screen reader**: Tương thích với assistive technologies

### Loading States

- **Progress spinners**: Hiển thị khi đang tải dữ liệu
- **Skeleton loading**: Placeholder cho nội dung
- **Button loading**: Disable button khi đang xử lý
- **Empty states**: Thông báo khi không có dữ liệu

## 🔧 Technical Features

### HTTP Interceptors

- **AuthTokenInterceptor**: Tự động gắn Bearer token
- **HttpErrorInterceptor**: Xử lý lỗi và hiển thị toast
- **Error mapping**: Map mã lỗi BE thành thông báo tiếng Việt
- **Auto-logout**: Tự động đăng xuất khi 401

### State Management

- **Reactive services**: Sử dụng BehaviorSubject
- **Real-time updates**: Cập nhật UI khi data thay đổi
- **Memory management**: Unsubscribe khi component destroy
- **Error handling**: Xử lý lỗi gracefully

### Type Safety

- **Strict TypeScript**: Strict mode enabled
- **Interface definitions**: Định nghĩa rõ ràng cho tất cả data
- **API types**: Sinh types từ OpenAPI spec
- **Type guards**: Kiểm tra type safety

### Performance

- **Lazy loading**: Load components khi cần
- **OnPush strategy**: Tối ưu change detection
- **Virtual scrolling**: Cho danh sách lớn (nếu cần)
- **Bundle optimization**: Tree shaking và code splitting

## 🧪 Testing Strategy

### Unit Tests

- **Service testing**: Test các API services
- **Component testing**: Test UI components
- **Guard testing**: Test route guards
- **Pipe testing**: Test custom pipes

### Integration Tests

- **User flows**: Test luồng đăng nhập, giao dịch
- **API integration**: Test kết nối với backend
- **Error scenarios**: Test các trường hợp lỗi

### E2E Tests

- **Complete workflows**: Test toàn bộ user journey
- **Cross-browser**: Test trên nhiều browser
- **Mobile testing**: Test responsive design

## 📱 Mobile Features

### Touch Optimization

- **Button sizes**: Kích thước phù hợp cho touch
- **Swipe gestures**: Hỗ trợ swipe (nếu cần)
- **Touch feedback**: Visual feedback khi touch

### Mobile Navigation

- **Hamburger menu**: Menu collapse trên mobile
- **Bottom navigation**: Navigation bar ở dưới (nếu cần)
- **Touch-friendly**: Khoảng cách phù hợp giữa các elements

## 🔒 Security Features

### Token Management

- **Secure storage**: Lưu token trong localStorage
- **Auto-refresh**: Tự động làm mới token
- **Expiration handling**: Xử lý khi token hết hạn
- **Logout cleanup**: Xóa token khi đăng xuất

### Input Validation

- **Client-side**: Validation trên frontend
- **Server-side**: Validation từ backend
- **XSS protection**: Sanitize user input
- **CSRF protection**: Sử dụng CSRF tokens

## 📊 Analytics & Monitoring

### Error Tracking

- **Console logging**: Log lỗi ra console
- **User feedback**: Thu thập feedback từ user
- **Performance monitoring**: Theo dõi performance

### Usage Analytics

- **Page views**: Theo dõi lượt xem trang
- **User actions**: Theo dõi hành động người dùng
- **Feature usage**: Theo dõi sử dụng tính năng

## 🚀 Future Enhancements

### Planned Features

- **Push notifications**: Thông báo real-time
- **Biometric auth**: Xác thực sinh trắc học
- **Offline support**: Hoạt động offline
- **Multi-language**: Hỗ trợ đa ngôn ngữ

### Performance Improvements

- **Service Worker**: Cache static assets
- **CDN integration**: Sử dụng CDN
- **Image optimization**: Tối ưu hình ảnh
- **Bundle splitting**: Chia nhỏ bundle

---

_Tài liệu này được cập nhật thường xuyên để phản ánh các tính năng mới nhất của ứng dụng._
