# Hướng dẫn Reset Database

## Cách Reset Database

### 1. Sử dụng script tự động (Khuyến nghị)

```bash
cd server
node reset-database.js
```

Script này sẽ:
- Xóa tất cả bảng hiện tại
- Tạo lại các bảng với schema mới
- Hiển thị thông báo thành công

### 2. Reset thủ công

Nếu muốn reset thủ công, chạy các lệnh SQL sau:

```sql
-- Xóa các bảng cũ
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Chạy lại file schema.sql
-- (Copy nội dung từ file schema.sql và paste vào đây)
```

### 3. Schema hiện tại

#### Bảng Users
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, 
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    can_create_events BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Bảng Events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id VARCHAR(255) NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    types TEXT[] DEFAULT '{}',
    requires_auth BOOLEAN DEFAULT FALSE NOT NULL,
    ip_allow_list TEXT[] DEFAULT '{}',
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    nonce_ttl INTEGER DEFAULT 300,
    custom_fields JSONB DEFAULT '{}',
    qr_code TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Bảng Attendances
```sql
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    user_id VARCHAR(255) REFERENCES users(id),
    ip VARCHAR(45) NOT NULL,
    ua_hash VARCHAR(255) NOT NULL,
    at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nonce VARCHAR(255),
    custom_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by VARCHAR(255) REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Các trường mới đã thêm

#### Users
- `can_create_events`: Quyền tạo sự kiện

#### Events
- `custom_fields`: Trường tùy chỉnh (JSONB)
- `qr_code`: Link QR code điểm danh
- `is_public`: Sự kiện công khai hay riêng tư

#### Attendances
- `custom_data`: Dữ liệu tùy chỉnh từ form điểm danh
- `status`: Trạng thái điểm danh (pending/approved/rejected)
- `approved_by`: Người phê duyệt
- `approved_at`: Thời gian phê duyệt
- `notes`: Ghi chú

### 5. Sau khi reset

1. **Thêm email admin:**
   ```javascript
   // Trong server/config/admin.js
   adminEmails: [
     'your-email@ou.edu.vn', // Thêm email của bạn
     'admin@ou.edu.vn'
   ]
   ```

2. **Khởi động server:**
   ```bash
   npm run dev
   ```

3. **Test đăng nhập:**
   - Đăng nhập với email admin
   - Kiểm tra quyền được cấp tự động

### 6. Lưu ý quan trọng

⚠️ **Cảnh báo:** Reset database sẽ xóa tất cả dữ liệu hiện tại!

- Backup dữ liệu quan trọng trước khi reset
- Chỉ reset khi cần thiết (thay đổi schema lớn)
- Test kỹ sau khi reset

### 7. Troubleshooting

#### Lỗi kết nối database:
```bash
# Kiểm tra file .env
cat .env

# Kiểm tra PostgreSQL đang chạy
pg_isready -h localhost -p 5432
```

#### Lỗi quyền:
```bash
# Cấp quyền cho user database
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

#### Lỗi schema:
```bash
# Xóa và tạo lại database
dropdb your_database
createdb your_database
node reset-database.js
```
