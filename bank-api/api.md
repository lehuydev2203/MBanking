# Banking API - Danh sách Endpoints

## 🔗 Base URL

```
http://localhost:1403/v1
```

## 🔐 Authentication

Tất cả API (trừ auth và health) cần header:

```
Authorization: Bearer <jwt-token>
```

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

### 1. Đăng ký tài khoản

```http
POST /v1/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "VERIFICATION_SENT"
  }
}
```

### 2. Xác minh email

```http
POST /v1/auth/verify
Content-Type: application/json

{
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "VERIFIED"
  }
}
```

### 3. Gửi lại mã xác minh

```http
POST /v1/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 4. Đăng nhập

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### 5. Đổi mật khẩu

```http
POST /v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 👤 **USER PROFILE & ACCOUNT**

### 6. Lấy thông tin profile

```http
GET /v1/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "accountNumber": "1234567890",
    "nickname": "john_doe",
    "role": "user",
    "status": "active",
    "isEmailVerified": true,
    "balance": 1000000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Cập nhật profile

```http
PATCH /v1/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nguyễn Văn B",
  "phone": "0987654321"
}
```

### 8. Đặt nickname

```http
POST /v1/profile/nickname
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "john_doe"
}
```

### 9. Lấy số dư tài khoản

```http
GET /v1/balance
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "balance": 1000000
  }
}
```

---

## 💰 **TRANSACTIONS (Giao dịch)**

### 10. Kiểm tra có thể rút tiền

```http
GET /v1/transactions/can-withdraw?amount=1000000
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "allowed": true,
    "reasons": [],
    "balance": 1000000,
    "dailyUsed": 0,
    "dailyLimit": 500000000
  }
}
```

### 11. Nạp tiền

```http
POST /v1/transactions/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000000,
  "transName": "Nạp tiền từ ATM",
  "clientRequestId": "unique-id-123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "transName": "Nạp tiền từ ATM",
    "transMoney": 1000000,
    "transType": 1,
    "clientRequestId": "unique-id-123",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 12. Rút tiền

```http
POST /v1/transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500000,
  "transName": "Rút tiền mặt",
  "clientRequestId": "unique-id-456"
}
```

**Giới hạn:**

- Tối đa 20,000,000 VND mỗi giao dịch
- Tối đa 500,000,000 VND mỗi ngày

### 13. Lịch sử giao dịch

```http
GET /v1/transactions?page=1&pageSize=10&type=1&from=2024-01-01&to=2024-12-31
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Số trang (default: 1)
- `pageSize`: Số item mỗi trang (default: 10, max: 100)
- `type`: Loại giao dịch (1=Deposit, 2=Withdraw)
- `from`: Ngày bắt đầu (ISO string)
- `to`: Ngày kết thúc (ISO string)
- `min`: Số tiền tối thiểu
- `max`: Số tiền tối đa

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "transName": "Transfer to Nguyễn Văn A - Thanh toán dịch vụ",
        "transMoney": 100000,
        "transType": 2,
        "transactionCategory": "TRANSFER_SENT",
        "transactionTypeLabel": "Chuyển khoản đi",
        "createdAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "transName": "Transfer from Trần Thị B - Hoàn tiền",
        "transMoney": 50000,
        "transType": 1,
        "transactionCategory": "TRANSFER_RECEIVED",
        "transactionTypeLabel": "Chuyển khoản đến",
        "createdAt": "2024-01-01T09:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "transName": "Nạp tiền từ ATM",
        "transMoney": 1000000,
        "transType": 1,
        "transactionCategory": "DEPOSIT",
        "transactionTypeLabel": "Nạp tiền",
        "createdAt": "2024-01-01T08:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 14. Xuất CSV

```http
GET /v1/transactions/export.csv?type=1&from=2024-01-01&to=2024-12-31
Authorization: Bearer <token>
```

**Response:** CSV file download

---

## 🔄 **TRANSFERS (Chuyển khoản)**

### 15. Khởi tạo chuyển khoản

```http
POST /v1/transfers/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientIdentifier": "1234567890",
  "amount": 100000,
  "transName": "Thanh toán dịch vụ"
}
```

**recipientIdentifier:** Số tài khoản (10 chữ số) hoặc nickname (3-20 ký tự)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "VERIFICATION_CODE_SENT",
    "recipientName": "Nguyễn Văn A",
    "recipientAccountNumber": "1234567890",
    "amount": 100000,
    "expiresAt": "2024-01-01T12:05:00.000Z"
  }
}
```

### 16. Xác nhận chuyển khoản

```http
POST /v1/transfers/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "TRANSFER_COMPLETED",
    "amount": 100000,
    "recipientName": "Nguyễn Văn A",
    "recipientAccountNumber": "1234567890"
  }
}
```

### 17. Lịch sử chuyển khoản (Deprecated)

```http
GET /v1/transfers/history?page=1&pageSize=10
Authorization: Bearer <token>
```

**⚠️ Deprecated:** Sử dụng `GET /v1/transactions` thay thế

### 18. Đặt nickname (Transfer)

```http
POST /v1/transfers/nickname
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "john_doe"
}
```

---

## 👑 **ADMIN PANEL**

### 19. Danh sách users

```http
GET /v1/admin/users?page=1&pageSize=10&q=john&role=user&status=active
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `page`: Số trang
- `pageSize`: Số item mỗi trang
- `q`: Tìm kiếm theo tên hoặc email
- `role`: Lọc theo role (user, admin, superadmin)
- `status`: Lọc theo status (active, locked)

**Auth:** Admin/Superadmin only

### 20. Cập nhật user

```http
PATCH /v1/admin/users/507f1f77bcf86cd799439011
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "role": "admin",
  "status": "active"
}
```

**Auth:** Superadmin only

### 21. Gửi lại mã xác minh cho user

```http
POST /v1/admin/users/507f1f77bcf86cd799439011/resend-verification
Authorization: Bearer <admin-token>
```

**Auth:** Admin/Superadmin

### 22. Lịch sử giao dịch tất cả users

```http
GET /v1/admin/transactions?page=1&pageSize=10&type=1&accountId=507f1f77bcf86cd799439011
Authorization: Bearer <admin-token>
```

**Query Parameters:** Tương tự `/v1/transactions` + `accountId`

**Auth:** Admin/Superadmin

---

## 🏥 **SYSTEM**

### 23. Health Check

```http
GET /v1/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "up",
    "db": "ok",
    "appVersion": "1.0.0",
    "time": "2024-01-01T00:00:00.000Z"
  }
}
```

### 24. Root endpoint

```http
GET /v1
```

---

## 🔧 **WALLET (Legacy)**

### 25. Kiểm tra rút tiền (Legacy)

```http
GET /v1/wallet/can-withdraw?amount=1000000
Authorization: Bearer <token>
```

**⚠️ Legacy:** Sử dụng `/v1/transactions/can-withdraw` thay thế

---

## 📊 **TRANSACTION CATEGORIES**

Khi gọi `GET /v1/transactions`, mỗi giao dịch sẽ có:

### transactionCategory:

- `"DEPOSIT"` - Nạp tiền
- `"WITHDRAW"` - Rút tiền
- `"TRANSFER_SENT"` - Chuyển khoản đi
- `"TRANSFER_RECEIVED"` - Chuyển khoản đến

### transactionTypeLabel:

- `"Nạp tiền"`
- `"Rút tiền"`
- `"Chuyển khoản đi"`
- `"Chuyển khoản đến"`

---

## 📝 **RESPONSE FORMAT**

### Success Response:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/endpoint"
}
```

### Error Response:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/endpoint"
}
```

---

## 🚨 **ERROR CODES**

### Authentication Errors:

- `EMAIL_EXISTS` - Email đã tồn tại và đã verified
- `EMAIL_NOT_VERIFIED` - Email chưa được xác minh
- `INVALID_CODE` - Mã xác minh không hợp lệ
- `CODE_EXPIRED` - Mã xác minh đã hết hạn
- `INVALID_CREDENTIALS` - Email/password không đúng
- `UNAUTHORIZED` - Token không hợp lệ hoặc hết hạn
- `FORBIDDEN` - Không có quyền truy cập

### Transaction Errors:

- `INSUFFICIENT_FUNDS` - Số dư không đủ
- `LIMIT_PER_TRANSACTION` - Vượt quá giới hạn mỗi giao dịch
- `DAILY_LIMIT_EXCEEDED` - Vượt quá giới hạn hàng ngày
- `IDEMPOTENT_REPLAY` - Giao dịch trùng lặp

### Transfer Errors:

- `INVALID_CODE` - Mã xác nhận chuyển khoản không hợp lệ
- `CODE_EXPIRED` - Mã xác nhận đã hết hạn
- `RECIPIENT_NOT_FOUND` - Không tìm thấy tài khoản người nhận
- `SELF_TRANSFER` - Không thể chuyển cho chính mình
- `NICKNAME_TAKEN` - Nickname đã được sử dụng

### System Errors:

- `BAD_REQUEST` - Request không hợp lệ
- `NOT_FOUND` - Resource không tìm thấy
- `INTERNAL_SERVER_ERROR` - Lỗi hệ thống
- `TOO_MANY_REQUESTS` - Vượt quá rate limit

---

## 🔒 **SECURITY NOTES**

1. **JWT Token:** Hết hạn sau 15 phút
2. **Rate Limiting:**
   - Auth endpoints: 5 requests/10 minutes
   - General API: 100 requests/minute
3. **Password:** Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số
4. **Nickname:** 3-20 ký tự, chỉ chữ cái, số và dấu gạch dưới
5. **Account Number:** 10 chữ số, bắt đầu bằng 1

---

## 📱 **FRONTEND INTEGRATION TIPS**

1. **Token Management:** Lưu token trong localStorage/sessionStorage
2. **Auto Refresh:** Implement token refresh logic
3. **Error Handling:** Hiển thị error message từ `message` field
4. **Loading States:** Show loading khi gọi API
5. **Form Validation:** Validate trước khi gửi request
6. **Real-time Updates:** Polling hoặc WebSocket cho balance updates
7. **CSV Export:** Sử dụng `window.open()` hoặc download link
8. **Transfer Flow:**
   - Initiate → Show recipient info → Wait for email → Confirm
   - Code expires in 5 minutes
9. **Transaction History:** Sử dụng pagination và filters
10. **Admin Panel:** Check user role trước khi hiển thị admin features
