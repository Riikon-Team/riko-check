# RikoCheck - Hệ thống điểm danh online

RikoCheck là một hệ thống điểm danh online hiện đại với khả năng xác thực bằng vân tay trình duyệt và Google Authentication. Hệ thống hỗ trợ cả hai chế độ: có đăng nhập và không cần đăng nhập.

## 🚀 Tính năng chính

### 🔐 Xác thực và phân quyền
- **Google Authentication**: Đăng nhập bằng tài khoản Google (@ou.edu.vn)
- **Phân quyền 3 cấp**: User, Organizer, Admin
- **Phê duyệt tài khoản**: Admin phê duyệt người tổ chức

### 📅 Quản lý sự kiện
- **Tạo sự kiện**: Chọn thời gian, mô tả, chế độ điểm danh
- **IP Allow List**: Giới hạn IP được phép tham gia
- **Chế độ điểm danh**: Có thể chọn yêu cầu đăng nhập hay không

### ✅ Điểm danh thông minh
- **Fingerprint**: Xác thực bằng vân tay trình duyệt
- **IP Checking**: Kiểm tra IP có trong danh sách cho phép
- **Dual Mode**: Hỗ trợ cả đăng nhập và không đăng nhập
- **Local Storage**: Lưu lịch sử cho người dùng không đăng nhập

### 🛡️ Bảo mật
- **Rate Limiting**: Chống spam và tấn công
- **Helmet**: Bảo mật HTTP headers
- **CORS**: Kiểm soát truy cập cross-origin
- **Input Validation**: Xác thực dữ liệu đầu vào

## 🏗️ Kiến trúc hệ thống

```
RikoCheck/
├── server/                 # Backend Express.js
│   ├── index.js           # Server chính
│   ├── db.js              # Kết nối PostgreSQL
│   ├── middleware.js      # Middleware xác thực
│   ├── utils.js           # Utility functions
│   └── schema.sql         # Database schema
├── src/                   # Frontend React
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── pages/            # Các trang
│   └── firebase/         # Firebase config
├── dist/                  # Build output (sau khi build)
└── package.json           # Dependencies
```

## 🛠️ Công nghệ sử dụng

### Backend
- **Express.js**: Web framework
- **PostgreSQL**: Database chính
- **Firebase Admin**: Xác thực Google
- **Helmet**: Bảo mật
- **Rate Limiting**: Chống spam

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Firebase**: Client authentication
- **React Router**: Routing

## 📋 Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 12+
- Firebase project
- Google Cloud Console access

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd RikoCheck
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env` từ `.env.example`:
```bash
# Database
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=rikocheck
DB_PASSWORD=your_db_password
DB_PORT=5432

# Firebase
FIREBASE_CONFIG={"type":"service_account",...}
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Server
PORT=5000
NODE_ENV=development
```

### 4. Setup database
```bash
npm run db:setup
```

### 5. Chạy development
```bash
npm run dev
```

### 6. Build production
```bash
npm run build
npm start
```

## 📊 Database Schema

### Users Table
- `id`: User ID từ Firebase
- `email`: Email người dùng
- `display_name`: Tên hiển thị
- `role`: Vai trò (user/organizer/admin)
- `is_approved`: Trạng thái phê duyệt

### Events Table
- `id`: UUID của sự kiện
- `creator_id`: ID người tạo
- `name`: Tên sự kiện
- `start_at/end_at`: Thời gian bắt đầu/kết thúc
- `requires_auth`: Yêu cầu đăng nhập
- `ip_allow_list`: Danh sách IP được phép

### Attendances Table
- `id`: UUID của bản ghi điểm danh
- `event_id`: ID sự kiện
- `user_id`: ID người dùng (có thể null)
- `ip`: IP của người điểm danh
- `ua_hash`: Hash vân tay trình duyệt

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google` - Google sign in
- `GET /api/auth/user/:id` - Get user info

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### Attendance
- `POST /api/attendance/:eventId` - Submit attendance
- `GET /api/attendance/:eventId` - Get attendance list (protected)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users/:id/approve` - Approve user (admin only)
- `PUT /api/admin/users/:id/role` - Change user role (admin only)
- `GET /api/admin/stats` - Get system stats (admin only)

## 🎯 Quy trình sử dụng

### 1. Đăng ký/Đăng nhập
- Người dùng đăng nhập bằng Google (@ou.edu.vn)
- Admin phê duyệt tài khoản organizer

### 2. Tạo sự kiện
- Organizer tạo sự kiện với thông tin chi tiết
- Chọn chế độ điểm danh (có/không đăng nhập)
- Thiết lập danh sách IP được phép

### 3. Điểm danh
- **Không đăng nhập**: Sử dụng fingerprint + IP
- **Có đăng nhập**: Xác thực Google + lưu database

### 4. Quản lý
- Xem danh sách điểm danh
- Xuất báo cáo
- Quản lý người dùng (admin)

## 🚨 Bảo mật

- **Rate Limiting**: 100 requests/15 phút/IP
- **IP Validation**: Kiểm tra IP trong allow list
- **Fingerprint**: Xác thực trình duyệt duy nhất
- **Role-based Access**: Phân quyền theo vai trò
- **Input Sanitization**: Làm sạch dữ liệu đầu vào

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: [your-email@example.com]
- **Project Link**: [https://github.com/username/RikoCheck]

## 🙏 Cảm ơn

Cảm ơn bạn đã sử dụng RikoCheck! Hệ thống này được thiết kế để đơn giản hóa quá trình điểm danh online với bảo mật cao và trải nghiệm người dùng tốt.
