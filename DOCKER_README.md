# Banking App - Docker Deployment Guide

Hướng dẫn triển khai ứng dụng Banking với Docker, bao gồm cả frontend Angular và backend NestJS, với khả năng expose ra ngoài qua Ngrok.

## 🚀 Quick Start

### 1. Chuẩn bị môi trường

```bash
# Clone repository
git clone <your-repo-url>
cd MBanking

# Cài đặt Docker và Docker Compose
# macOS: brew install docker docker-compose
# Ubuntu: sudo apt install docker.io docker-compose
```

### 2. Cấu hình Environment

```bash
# Copy file environment mẫu
cp env.example .env

# Chỉnh sửa file .env với thông tin thực tế
nano .env
```

**Quan trọng**: Cập nhật `NGROK_AUTHTOKEN` trong file `.env` với token thực từ [ngrok.com](https://ngrok.com)

### 3. Triển khai ứng dụng

```bash
# Chạy script deploy tự động
./scripts/deploy.sh
```

Hoặc chạy thủ công:

```bash
# Build và start tất cả services
docker-compose up -d --build

# Kiểm tra trạng thái
docker-compose ps
```

## 📱 Truy cập ứng dụng

Sau khi deploy thành công, bạn có thể truy cập:

- **Frontend**: http://localhost:2203
- **Backend API**: http://localhost:1403
- **API Documentation**: http://localhost:1403/docs
- **MailHog (Email Testing)**: http://localhost:8025
- **Ngrok Dashboard**: http://localhost:4040

### 🌍 Public URL (Ngrok)

Ngrok sẽ tạo một URL công khai để truy cập từ bên ngoài. URL này sẽ hiển thị trong:

- Ngrok Dashboard: http://localhost:4040
- Console output khi chạy `./scripts/deploy.sh`

## 🛠️ Quản lý Services

### Xem logs

```bash
# Xem tất cả logs
./scripts/logs.sh

# Xem logs của service cụ thể
./scripts/logs.sh api -f    # Follow API logs
./scripts/logs.sh fe -t 50  # 50 dòng cuối của frontend logs
./scripts/logs.sh mongo     # MongoDB logs
```

### Dừng services

```bash
# Dừng tất cả services
./scripts/stop.sh

# Hoặc dùng docker-compose
docker-compose down
```

### Restart services

```bash
# Restart tất cả
docker-compose restart

# Restart service cụ thể
docker-compose restart banking-api
```

## 🏗️ Cấu trúc Docker

### Services

1. **banking-mongo**: MongoDB database
2. **banking-mailhog**: Email testing service
3. **banking-api**: NestJS backend API
4. **banking-fe**: Angular frontend với Nginx
5. **banking-ngrok**: Ngrok tunnel service

### Networks

- **banking-network**: Bridge network cho tất cả services

### Volumes

- **mongo_data**: Persistent storage cho MongoDB

## 🔧 Cấu hình nâng cao

### Environment Variables

Các biến môi trường quan trọng trong `.env`:

```bash
# Ngrok
NGROK_AUTHTOKEN=your-ngrok-token

# Database
MONGODB_URI=mongodb://mongo:27017/banking
MONGO_INITDB_ROOT_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# App
APP_PORT=1403
APP_BASE_URL=http://localhost:2203
```

### Ports

- **2203**: Frontend (Nginx)
- **1403**: Backend API
- **27017**: MongoDB
- **8025**: MailHog Web UI
- **1025**: MailHog SMTP
- **4040**: Ngrok Dashboard

## 🐛 Troubleshooting

### Kiểm tra health

```bash
# Kiểm tra tất cả services
docker-compose ps

# Kiểm tra logs lỗi
./scripts/logs.sh all

# Kiểm tra từng service
curl http://localhost:1403/health  # API
curl http://localhost:2203/health  # Frontend
```

### Reset hoàn toàn

```bash
# Dừng và xóa tất cả
docker-compose down -v

# Xóa images
docker-compose down --rmi all

# Build lại từ đầu
./scripts/deploy.sh
```

### Lỗi thường gặp

1. **Port đã được sử dụng**: Thay đổi ports trong `docker-compose.yml`
2. **Ngrok không hoạt động**: Kiểm tra `NGROK_AUTHTOKEN` trong `.env`
3. **Database connection failed**: Đợi MongoDB khởi động hoàn tất
4. **Frontend không load**: Kiểm tra API có chạy không

## 📊 Monitoring

### Health Checks

Tất cả services đều có health checks:

```bash
# Kiểm tra health của containers
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Logs

```bash
# Real-time logs
docker-compose logs -f

# Logs với timestamp
docker-compose logs -f -t
```

## 🔒 Security Notes

- Thay đổi tất cả passwords mặc định trong production
- Sử dụng HTTPS cho production
- Cấu hình firewall phù hợp
- Regular backup database

## 📝 Development

### Local Development

```bash
# Chỉ chạy database và mailhog
docker-compose up -d mongo mailhog

# Chạy API và FE locally
cd bank-api && yarn start:dev
cd bank-fe && yarn start
```

### Hot Reload

Để development với hot reload, sử dụng volumes mapping trong `docker-compose.dev.yml` (tạo riêng nếu cần).

## 🚀 Production Deployment

1. Cập nhật tất cả secrets trong `.env`
2. Sử dụng production images
3. Cấu hình reverse proxy (Nginx/Traefik)
4. Setup SSL certificates
5. Configure monitoring và logging
6. Setup backup strategy

---

**Lưu ý**: Đây là setup cho development/demo. Cho production, cần cấu hình bảo mật và monitoring đầy đủ hơn.
