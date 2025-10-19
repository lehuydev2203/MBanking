# Banking Frontend - Angular 20

Ứng dụng frontend cho hệ thống ngân hàng được xây dựng với Angular 20, PrimeNG và dark theme.

## 🚀 Tính năng

- **Dark Mode**: Giao diện tối với PrimeNG lara-dark-indigo theme
- **Authentication**: Đăng ký, đăng nhập, xác thực email
- **Wallet**: Nạp tiền, rút tiền với kiểm tra khả năng rút
- **Transactions**: Xem lịch sử giao dịch, lọc, xuất CSV
- **Profile**: Quản lý thông tin cá nhân, đổi mật khẩu
- **Admin Panel**: Quản lý người dùng, giao dịch, theo dõi hệ thống
- **Responsive**: Tương thích mobile và desktop
- **Accessibility**: Hỗ trợ a11y với ARIA labels và keyboard navigation

## 🛠️ Công nghệ

- **Angular 20** - Framework chính
- **PrimeNG 18** - UI Components
- **PrimeIcons** - Icon library
- **PrimeFlex** - CSS utility classes
- **TypeScript** - Strict mode
- **RxJS** - Reactive programming
- **JWT Decode** - Token management
- **Day.js** - Date manipulation
- **UUID** - Unique ID generation
- **OpenAPI TypeScript** - API types generation

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── services/           # API services
│   │   ├── interceptors/       # HTTP interceptors
│   │   └── guards/            # Route guards
│   ├── shared/                 # Shared components
│   │   ├── components/        # Reusable components
│   │   ├── pipes/            # Custom pipes
│   │   └── styles/           # Theme overrides
│   └── features/              # Feature modules
│       ├── auth/             # Authentication
│       ├── dashboard/        # Dashboard
│       ├── wallet/           # Deposit/Withdraw
│       ├── transactions/     # Transaction history
│       ├── profile/          # User profile
│       ├── admin/            # Admin panel
│       └── layout/           # Main layout
├── environments/              # Environment configs
└── styles.css                # Global styles
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js 18+
- Yarn 1.22+
- Angular CLI 20+

### Cài đặt dependencies

```bash
yarn install
```

### Chạy development server

```bash
yarn start
```

Ứng dụng sẽ chạy tại `http://localhost:2203`

### Build production

```bash
yarn build
```

### Chạy tests

```bash
yarn test
```

### Linting và formatting

```bash
# Lint code
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Type checking
yarn type-check
```

## 🔗 Kết nối Backend

### Cấu hình API

Chỉnh sửa file `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  baseApiUrl: "http://localhost:3000/api", // Backend API URL
  appName: "Banking FE",
  timezone: "Asia/Ho_Chi_Minh",
};
```

### Sinh types từ Swagger

Khi backend đang chạy, sinh types từ OpenAPI spec:

```bash
yarn api:types
```

Lệnh này sẽ tạo file `src/app/core/api-types.ts` từ endpoint `/docs-json` của backend.

## 🎨 Theme và Styling

### Dark Theme

Dự án sử dụng PrimeNG lara-dark-indigo theme với custom overrides:

- **Brand Colors**: Primary (#7C8CF9), Secondary (#22D3EE), Success (#34D399), Danger (#F87171)
- **Surface Colors**: Dark backgrounds với contrast ratio ≥ 4.5:1
- **Components**: Tất cả PrimeNG components được tùy chỉnh cho dark mode

### Custom CSS Variables

```scss
:root {
  --brand-primary: #7c8cf9;
  --brand-secondary: #22d3ee;
  --brand-danger: #f87171;
  --brand-success: #34d399;
  --brand-surface: #0b1220;
}
```

## 🔐 Authentication Flow

1. **Register**: Tạo tài khoản mới
2. **Verify Email**: Xác thực email
3. **Login**: Đăng nhập với JWT token
4. **Auto-logout**: Tự động đăng xuất khi token hết hạn
5. **Guards**: Bảo vệ routes với AuthGuard và RoleGuard

## 💰 Transaction Flow

### Nạp tiền

1. Nhập số tiền (min: 1,000₫, max: 100,000,000₫)
2. Tạo UUID v4 làm clientRequestId (idempotency)
3. Gọi API deposit
4. Cập nhật số dư

### Rút tiền

1. Nhập số tiền
2. Kiểm tra khả năng rút (`can-withdraw`)
3. Hiển thị lý do nếu không được phép
4. Xác nhận với ConfirmDialog
5. Gọi API withdraw
6. Cập nhật số dư

## 👥 Admin Features

- **Users Management**: Xem, lọc, cập nhật vai trò/trạng thái
- **Transactions**: Xem tất cả giao dịch trong hệ thống
- **Health Monitoring**: Theo dõi trạng thái các dịch vụ
- **Role-based Access**: Chỉ admin/superadmin mới truy cập được

## 🧪 Testing

### Unit Tests

```bash
yarn test
```

### E2E Tests

```bash
yarn e2e
```

### Test Coverage

```bash
yarn test --code-coverage
```

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **PrimeFlex**: Sử dụng utility classes cho responsive layout

## ♿ Accessibility

- **ARIA Labels**: Tất cả interactive elements có aria-label
- **Keyboard Navigation**: Hỗ trợ điều hướng bằng bàn phím
- **Focus Management**: Focus ring rõ ràng
- **Screen Reader**: Tương thích với screen readers
- **Color Contrast**: Tỷ lệ tương phản ≥ 4.5:1

## 🔧 Development

### Code Style

- **ESLint**: Code linting với TypeScript rules
- **Prettier**: Code formatting
- **Angular Style Guide**: Tuân thủ Angular best practices

### Git Hooks

```bash
# Pre-commit hook (nếu cần)
yarn lint:fix && yarn format
```

## 📦 Deployment

### Build cho production

```bash
yarn build --configuration production
```

### Environment Variables

Cập nhật `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  baseApiUrl: "https://api.bank.com/api",
  appName: "Banking FE",
  timezone: "Asia/Ho_Chi_Minh",
};
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License.

## 🆘 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**Lưu ý**: Đảm bảo backend đang chạy trước khi chạy frontend để tránh lỗi API calls.
