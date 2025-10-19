# Banking API - Tính năng chi tiết

## 📋 Danh sách tính năng đã triển khai

### ✅ Authentication & Authorization

- [x] User registration với email verification
- [x] Email verification với mã 6 chữ số (15 phút)
- [x] Login với JWT token (15 phút)
- [x] Password change với validation
- [x] Role-based access control (RBAC)
  - [x] User: Quản lý tài khoản cá nhân
  - [x] Admin: Quản lý users và transactions
  - [x] Superadmin: Full access + quản lý roles
- [x] Rate limiting cho auth endpoints (5 req/10min)

### ✅ User Management

- [x] Profile management (name, phone)
- [x] Account balance tracking
- [x] Email verification status
- [x] Account status (active/locked)
- [x] Password security (bcrypt 12 rounds)
- [x] Account number generation (10 digits, unique)
- [x] Nickname system (3-20 chars, alphanumeric + underscore)

### ✅ Transaction System

- [x] Deposit money (không giới hạn)
- [x] Withdraw money với limits:
  - [x] Per-transaction limit: 20,000,000 VND
  - [x] Daily limit: 500,000,000 VND (theo VN timezone)
- [x] Transaction history với pagination
- [x] Transaction filtering (type, date range, amount)
- [x] CSV export với CSV injection protection
- [x] Idempotency support với clientRequestId
- [x] MongoDB transactions cho data consistency

### ✅ Transfer System

- [x] Transfer money giữa các tài khoản
- [x] Transfer bằng account number hoặc nickname
- [x] Email verification cho transfer (6 digits, 5 phút)
- [x] Transfer history tích hợp vào transaction history chung
- [x] Recipient information display
- [x] Transfer limits (same as withdrawal limits)
- [x] Self-transfer prevention
- [x] Audit logging cho transfers
- [x] Transaction categorization (TRANSFER_SENT, TRANSFER_RECEIVED)
- [x] Detailed API documentation với mô tả tiếng Việt

### ✅ Admin Panel

- [x] User management (list, update role/status)
- [x] Transaction monitoring
- [x] Resend verification emails
- [x] Self-demotion protection (superadmin)
- [x] Audit logging cho admin actions

### ✅ Security Features

- [x] JWT authentication
- [x] Password strength validation
- [x] Rate limiting
- [x] CORS protection
- [x] Input validation với class-validator
- [x] SQL injection protection (MongoDB)
- [x] XSS protection
- [x] CSRF protection (JWT)
- [x] Audit logging

### ✅ Monitoring & Logging

- [x] Structured logging với Pino
- [x] Health checks (app + database)
- [x] Error tracking và reporting
- [x] Request/response logging
- [x] Audit trail cho sensitive operations

### ✅ API Documentation

- [x] Swagger/OpenAPI documentation
- [x] Interactive API explorer
- [x] Request/response examples
- [x] Authentication integration
- [x] Error code documentation

### ✅ Testing

- [x] Unit tests cho business logic
- [x] Integration tests cho API endpoints
- [x] E2E tests cho complete flows
- [x] Mock external dependencies
- [x] Test coverage reporting

### ✅ DevOps & Deployment

- [x] Docker containerization
- [x] Docker Compose setup
- [x] Multi-stage builds
- [x] Health checks
- [x] Environment configuration
- [x] Database seeding

## 💰 Quy tắc tiền tệ và giới hạn

### Currency Handling

- **Đơn vị**: VND (Vietnamese Dong)
- **Precision**: 2 chữ số thập phân
- **Storage**: MongoDB Decimal128
- **Display**: Số nguyên (không có dấu phẩy)

### Transaction Limits

- **Deposit**: Không giới hạn
- **Withdrawal per transaction**: 20,000,000 VND
- **Withdrawal daily limit**: 500,000,000 VND
- **Timezone**: Asia/Ho_Chi_Minh (VN timezone)

### Business Rules

1. **Email verification**: Bắt buộc trước khi login
2. **Balance check**: Rút tiền không được vượt quá số dư
3. **Daily limits**: Tính theo ngày VN (00:00 - 23:59 VN time)
4. **Idempotency**: clientRequestId trùng sẽ trả về kết quả cũ
5. **Self-demotion**: Superadmin không thể tự hạ role

## 🔄 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {}, // Optional additional details
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## 📊 Error Codes

### Authentication Errors

- `EMAIL_EXISTS`: Email đã tồn tại và đã verified
- `EMAIL_NOT_VERIFIED`: Email chưa được xác minh
- `INVALID_CODE`: Mã xác minh không hợp lệ
- `CODE_EXPIRED`: Mã xác minh đã hết hạn
- `INVALID_CREDENTIALS`: Email/password không đúng
- `UNAUTHORIZED`: Token không hợp lệ hoặc hết hạn
- `FORBIDDEN`: Không có quyền truy cập

### Transaction Errors

- `INSUFFICIENT_FUNDS`: Số dư không đủ
- `LIMIT_PER_TRANSACTION`: Vượt quá giới hạn mỗi giao dịch
- `DAILY_LIMIT_EXCEEDED`: Vượt quá giới hạn hàng ngày
- `IDEMPOTENT_REPLAY`: Giao dịch trùng lặp (clientRequestId)

### Transfer Errors

- `INVALID_CODE`: Mã xác nhận chuyển khoản không hợp lệ
- `CODE_EXPIRED`: Mã xác nhận đã hết hạn
- `RECIPIENT_NOT_FOUND`: Không tìm thấy tài khoản người nhận
- `SELF_TRANSFER`: Không thể chuyển cho chính mình
- `NICKNAME_TAKEN`: Nickname đã được sử dụng

### System Errors

- `BAD_REQUEST`: Request không hợp lệ
- `NOT_FOUND`: Resource không tìm thấy
- `INTERNAL_SERVER_ERROR`: Lỗi hệ thống
- `TOO_MANY_REQUESTS`: Vượt quá rate limit

## 🎯 Performance Considerations

### Database Optimization

- **Indexes**: Email, phone, role, status, transaction dates
- **Aggregation**: Daily withdrawal calculations
- **Transactions**: MongoDB sessions cho consistency

### Caching Strategy

- **JWT tokens**: Stateless (không cần cache)
- **User data**: Có thể cache với Redis (future enhancement)
- **Transaction limits**: Tính toán real-time

### Rate Limiting

- **Auth endpoints**: 5 requests/10 minutes
- **General API**: 100 requests/minute
- **Admin endpoints**: Same as general (có thể tùy chỉnh)

## 🔮 Future Enhancements

### Phase 2 Features

- [ ] Redis caching
- [ ] WebSocket real-time notifications
- [ ] Advanced reporting dashboard
- [ ] Multi-currency support
- [ ] Transaction categories
- [ ] Recurring transactions
- [ ] Payment integrations

### Phase 3 Features

- [ ] Mobile app support
- [ ] Biometric authentication
- [ ] Advanced fraud detection
- [ ] Machine learning insights
- [ ] International transfers
- [ ] Cryptocurrency support

## 📈 Metrics & Analytics

### Key Performance Indicators (KPIs)

- **Transaction volume**: Số lượng giao dịch/ngày
- **Transaction value**: Tổng giá trị giao dịch/ngày
- **User activity**: Active users/ngày
- **Error rates**: Tỷ lệ lỗi API
- **Response times**: Thời gian phản hồi API

### Monitoring Dashboards

- **Application metrics**: CPU, memory, response times
- **Database metrics**: Connection pool, query performance
- **Business metrics**: Transaction trends, user growth
- **Security metrics**: Failed logins, suspicious activities

## 🛡️ Security Best Practices

### Code Security

- Input validation và sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers

### Infrastructure Security

- HTTPS enforcement
- Secure Docker images
- Network segmentation
- Access controls
- Regular security updates

### Data Protection

- Password hashing (bcrypt)
- Sensitive data encryption
- Audit logging
- Data retention policies
- GDPR compliance (future)
