# 🎫 TicketGo - Backend API

TicketGo là hệ thống backend cho nền tảng đặt vé và quản lý sự kiện trực tuyến. Dự án được thiết kế theo kiến trúc monolithic hiện đại, tập trung vào khả năng mở rộng, bảo mật và hiệu năng.

Dự án này là một phần của hệ sinh thái TicketGo, cung cấp các RESTful API cho cả trang Frontend (Khách hàng) và Dashboard (Quản trị viên).

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Core**: Node.js, Express.js
- **Database & ORM**: MySQL, Prisma ORM
- **Authentication**: Passport.js (Local Strategy), Express Session lưu trữ trên Database (Prisma Session Store).
- **Validation**: Zod (Kiểm tra chặt chẽ payload từ request)
- **Thanh toán (Payment Gateway)**: Tích hợp ZaloPay, MoMo
- **Lưu trữ ảnh (Storage)**: Cloudinary, Multer
- **Gửi Email**: Nodemailer (Gửi email xác nhận đặt vé, OTP)
- **Tác vụ định kỳ (Cron Jobs)**: Node-cron (Tự động cập nhật trạng thái sự kiện, vé)
- **DevOps**: Docker, Docker Compose

## 🛠️ Các Tính Năng Nổi Bật

- **Xác thực & Phân quyền**: Đăng nhập/Đăng ký, bảo mật session, phân quyền Role (Admin, User, Organizer).
- **Quản lý Sự kiện & Vé**: CRUD sự kiện, quản lý hạng vé, tồn kho (inventory).
- **Thanh toán ZaloPay**: Tạo URL thanh toán, xử lý IPN/Callback từ ZaloPay và cập nhật trạng thái đơn hàng an toàn.
- **Email Notifications**: Gửi vé QR Code và thông báo hóa đơn qua email tự động sau khi thanh toán thành công.
- **Xử lý Ảnh**: Upload và quản lý ảnh sự kiện, avatar người dùng qua Cloudinary.
- **Cron Jobs**: Tự động quét và cập nhật trạng thái các sự kiện đã quá hạn hoặc thay đổi trạng thái vé.

---

## 💻 Hướng Dẫn Cài Đặt Và Chạy Cục Bộ (Local)

### 1. Yêu cầu hệ thống (Prerequisites)
- Node.js (v18 trở lên)
- MySQL (v5.7 hoặc v8) hoặc Docker
- Trình quản lý package: `npm`

### 2. Cài đặt các thư viện (Install Dependencies)
```bash
cd backend_ticketgo
npm install
```

### 3. Cấu hình biến môi trường (Environment Variables)
Tạo file `.env` ở thư mục gốc của project (ngang hàng `package.json`). Tham khảo file `.env.example` (nếu có) hoặc điền các thông tin sau:

```env
NODE_ENV=development
PORT=9092
DATABASE_URL="mysql://root:password@localhost:3306/ticket"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ZaloPay (Nếu có)
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
ZALOPAY_ENDPOINT=your_endpoint
```

### 4. Khởi tạo Database (Prisma)
Chạy các lệnh sau để tạo các bảng trong CSDL và seed dữ liệu mẫu (nếu có):
```bash
npx prisma generate
npx prisma db push
# Hoặc: npx prisma migrate dev
npx prisma seed
```

> **Lưu ý CSDL cũ:** Nếu bạn muốn sử dụng Database Dump đã có sẵn: 
> [Tải file Dump20260503.sql tại đây](./Dump20260503.sql) (Cập nhật: 03/05/2026 20:12) và import vào MySQL của bạn.

### 5. Khởi chạy Server
Dành cho môi trường phát triển (Development):
```bash
npm run dev
# Hoặc
npm run server
```

Server sẽ chạy mặc định tại: `http://localhost:9092`

---

## 🐳 Hướng Dẫn Chạy Bằng Docker (Recommended)

Dự án đã được cấu hình sẵn `Dockerfile` và `docker-compose.yaml` để chạy dễ dàng mà không cần cài đặt MySQL hay Node.js trên máy cá nhân.

1. Đảm bảo bạn đang đứng ở thư mục gốc của project (nơi chứa thư mục `docker`).
2. Khởi chạy container:
```bash
cd ../docker/backend
docker-compose up -d --build
```
3. Docker sẽ tự động thiết lập MySQL (chạy ở cổng `3307` localhost để tránh xung đột) và khởi chạy Backend Server ở cổng `9092`.
4. Xem logs của server:
```bash
docker logs -f ticketgo-backend
```
