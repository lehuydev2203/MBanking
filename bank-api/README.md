# Banking API - NestJS

Một API banking hoàn chỉnh được xây dựng với NestJS, MongoDB, và các tính năng bảo mật tiên tiến.

## 🚀 Tính năng chính

- **Xác thực & Phân quyền**: JWT authentication với RBAC (user/admin/superadmin)
- **Xác minh Email**: Gửi mã xác minh qua email với thời hạn 15 phút
- **Giao dịch An toàn**: Nạp/rút tiền với giới hạn và kiểm tra số dư
- **Chuyển khoản**: Chuyển tiền giữa các tài khoản với xác thực email
- **Số tài khoản & Nickname**: Mỗi tài khoản có số tài khoản duy nhất và nickname tùy chọn
- **Rate Limiting**: Bảo vệ API khỏi spam và abuse
- **Audit Logging**: Ghi lại tất cả hoạt động quan trọng
- **Swagger Documentation**: API documentation tự động
- **Docker Support**: Chạy dễ dàng với Docker Compose

## 📋 Yêu cầu hệ thống

- Node.js 20+
- Yarn hoặc npm
- Docker & Docker Compose (khuyến nghị)
- MongoDB 7.0+

## 🛠️ Cài đặt và chạy

### 1. Clone repository và cài đặt dependencies

```bash
git clone <repository-url>
cd bank-api
yarn install
```

### 2. Cấu hình môi trường

```bash
# Copy file cấu hình mẫu
cp env.sample .env

# Chỉnh sửa các biến môi trường trong .env
```

### 3. Chạy với Docker (Khuyến nghị)

```bash
# Khởi động tất cả services
yarn docker:up

# Xem logs
yarn docker:logs

# Dừng services
yarn docker:down
```

### 4. Chạy local development

```bash
# Khởi động MongoDB và MailHog
yarn docker:up mongo mailhog

# Chạy API ở chế độ development
yarn start:dev
```

### 5. Seed superadmin

```bash
# Tạo tài khoản superadmin
yarn seed:superadmin
```

## 📚 API Documentation

Sau khi khởi động ứng dụng, truy cập:

- **Swagger UI**: http://localhost:3000/docs
- **Swagger JSON**: http://localhost:3000/docs-json
- **Health Check**: http://localhost:3000/health

## 🔧 Scripts

```bash
# Development
yarn start:dev          # Chạy ở chế độ development với hot reload
yarn start:prod         # Chạy ở chế độ production

# Build
yarn build              # Build ứng dụng
yarn start              # Chạy ứng dụng đã build

# Testing
yarn test               # Chạy unit tests
yarn test:e2e           # Chạy end-to-end tests
yarn test:cov           # Chạy tests với coverage

# Linting
yarn lint               # Kiểm tra code style
yarn lint:fix           # Tự động sửa code style

# Database
yarn seed:superadmin    # Tạo tài khoản superadmin

# Docker
yarn docker:up          # Khởi động tất cả services
yarn docker:down        # Dừng tất cả services
yarn docker:logs        # Xem logs của API service
```

## 🏗️ Kiến trúc

```
src/
├── config/                 # Cấu hình ứng dụng
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication & authorization guards
│   ├── interceptors/      # Response interceptors
│   ├── pipes/             # Validation pipes
│   └── utils/             # Utility functions
├── database/              # Database schemas và connection
├── modules/               # Feature modules
│   ├── auth/              # Authentication & authorization
│   ├── accounts/          # User account management
│   ├── transactions/      # Transaction processing
│   ├── wallet/            # Wallet operations
│   ├── admin/             # Admin operations
│   ├── health/            # Health checks
│   ├── email/             # Email services
│   └── audit/             # Audit logging
└── seed/                  # Database seeders
```

## 🔐 Bảo mật

### Authentication

- JWT tokens với thời hạn 15 phút
- Refresh token mechanism (có thể mở rộng)
- Password hashing với bcrypt (12 rounds)

### Authorization

- Role-based access control (RBAC)
- 3 roles: user, admin, superadmin
- Route-level protection với guards

### Rate Limiting

- 5 requests per 10 minutes cho auth endpoints
- 100 requests per minute cho general API

### Input Validation

- Class-validator cho tất cả DTOs
- Whitelist validation (reject unknown properties)
- Custom validation rules cho business logic

## 💰 Giới hạn giao dịch

- **Nạp tiền**: Không giới hạn số lượng
- **Rút tiền**:
  - Tối đa 20,000,000 VND mỗi giao dịch
  - Tối đa 500,000,000 VND mỗi ngày (theo múi giờ Việt Nam)

## 📊 Monitoring & Logging

- **Structured Logging**: JSON format với Pino
- **Audit Trail**: Ghi lại tất cả hoạt động quan trọng
- **Health Checks**: Database và application status
- **Error Tracking**: Centralized error handling

## 🧪 Testing

### Unit Tests

- Service layer testing
- Business logic validation
- Mock external dependencies

### Integration Tests

- API endpoint testing
- Database integration
- Authentication flow

### E2E Tests

- Complete user journeys
- Cross-module functionality
- Error scenarios

## 🐳 Docker Services

- **API**: NestJS application (port 3000)
- **MongoDB**: Database (port 27017)
- **MailHog**: Email testing (ports 1025, 8025)

## 📝 API Endpoints

### Authentication

- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/verify` - Xác minh email
- `POST /auth/resend-verification` - Gửi lại mã xác minh
- `POST /auth/login` - Đăng nhập
- `POST /auth/change-password` - Đổi mật khẩu

### User Profile

- `GET /profile` - Lấy thông tin profile
- `PATCH /profile` - Cập nhật profile
- `POST /profile/nickname` - Đặt nickname cho tài khoản
- `GET /balance` - Lấy số dư tài khoản

### Transactions

- `GET /wallet/can-withdraw` - Kiểm tra có thể rút tiền
- `POST /transactions/deposit` - Nạp tiền
- `POST /transactions/withdraw` - Rút tiền
- `GET /transactions` - Danh sách giao dịch (bao gồm nạp/rút/chuyển khoản)
- `GET /transactions/export.csv` - Xuất CSV

### Transfers

- `POST /transfers/initiate` - Khởi tạo chuyển khoản (gửi mã xác nhận qua email)
- `POST /transfers/confirm` - Xác nhận chuyển khoản với mã code 6 chữ số
- `POST /transfers/nickname` - Đặt biệt danh tài khoản
- `GET /transfers/history` - Lịch sử chuyển khoản (Deprecated - sử dụng `/transactions`)

### Admin (Admin/Superadmin only)

- `GET /admin/users` - Danh sách users
- `PATCH /admin/users/:id` - Cập nhật user (Superadmin only)
- `POST /admin/users/:id/resend-verification` - Gửi lại mã xác minh
- `GET /admin/transactions` - Tất cả giao dịch

### System

- `GET /health` - Health check

## 🔧 Environment Variables

```bash
# Database
MONGODB_URI=mongodb://mongo:27017/banking

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Application
APP_BASE_URL=http://localhost:4200
APP_PORT=3000
NODE_ENV=development

# Email
EMAIL_HOST=mailhog
EMAIL_PORT=1025
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@banking.local

# Timezone
TZ=Asia/Ho_Chi_Minh

# Superadmin Seed
SEED_SUPERADMIN_EMAIL=superadmin@example.com
SEED_SUPERADMIN_PASSWORD=ChangeMe123!

# Limits
MAX_TRANSACTION_AMOUNT=20000000
DAILY_WITHDRAWAL_LIMIT=500000000
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

Private - All rights reserved

## 🆘 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team development.
