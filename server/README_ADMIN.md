# Hướng dẫn cấu hình Admin

## Cấu hình Email Admin

### 1. Chỉnh sửa file `server/config/admin.js`

```javascript
export const adminConfig = {
  // Danh sách email admin (có thể thêm nhiều email)
  adminEmails: [
    'admin@example.com',
    'admin@ou.edu.vn',
    'your-email@ou.edu.vn', // Thêm email của bạn vào đây
  ],
  
  // Domain tổ chức mặc định
  defaultOrganization: 'ou.edu.vn',
  
  // Có tự động cấp quyền admin cho email trong danh sách không
  autoGrantAdmin: true,
  
  // Có kiểm tra domain tổ chức khi đăng nhập không
  checkOrganizationDomain: true
};
```

### 2. Cách thêm Admin mới

1. **Thêm email vào danh sách admin:**
   - Mở file `server/config/admin.js`
   - Thêm email vào mảng `adminEmails`
   - Lưu file

2. **Hoặc cấp quyền thủ công qua database:**
   ```sql
   UPDATE users 
   SET role = 'admin', can_create_events = true, is_approved = true 
   WHERE email = 'your-email@example.com';
   ```

### 3. Cấu hình Domain tổ chức

#### Tự động kiểm tra domain:
- Khi `checkOrganizationDomain: true`, hệ thống sẽ kiểm tra email có cùng domain với `defaultOrganization`
- Chỉ cho phép đăng nhập nếu email thuộc domain được cấu hình

#### Tùy chỉnh domain khi đăng nhập:
- Người dùng có thể nhập domain tùy chỉnh trong trang đăng nhập
- Hệ thống sẽ kiểm tra email có thuộc domain này không

### 4. Các tính năng Admin

#### Tự động cấp quyền:
- Khi `autoGrantAdmin: true`, email trong danh sách admin sẽ tự động được cấp:
  - Role: `admin`
  - `can_create_events: true`
  - `is_approved: true`

#### Quyền Admin:
- Có thể tạo, chỉnh sửa, xóa tất cả sự kiện
- Có thể phê duyệt yêu cầu quyền tạo sự kiện
- Có thể quản lý tất cả người dùng

### 5. Bảo mật

#### Lưu ý quan trọng:
- Chỉ thêm email đáng tin cậy vào danh sách admin
- Thay đổi `defaultOrganization` phù hợp với tổ chức
- Cân nhắc tắt `autoGrantAdmin` trong môi trường production nếu cần kiểm soát chặt chẽ

#### Kiểm tra domain:
- Hệ thống sẽ từ chối đăng nhập nếu email không thuộc domain được cấu hình
- Có thể tắt kiểm tra bằng cách đặt `checkOrganizationDomain: false`

### 6. Troubleshooting

#### Email không được cấp quyền admin:
1. Kiểm tra email có trong danh sách `adminEmails` không
2. Kiểm tra `autoGrantAdmin` có được đặt `true` không
3. Thử đăng nhập lại

#### Không thể đăng nhập do domain:
1. Kiểm tra email có đúng domain không
2. Kiểm tra cấu hình `defaultOrganization`
3. Tạm thời tắt `checkOrganizationDomain` để test

### 7. Ví dụ cấu hình

```javascript
// Cấu hình cho trường Đại học Mở
export const adminConfig = {
  adminEmails: [
    'admin@ou.edu.vn',
    'rector@ou.edu.vn',
    'dean@ou.edu.vn'
  ],
  defaultOrganization: 'ou.edu.vn',
  autoGrantAdmin: true,
  checkOrganizationDomain: true
};

// Cấu hình cho công ty ABC
export const adminConfig = {
  adminEmails: [
    'admin@abc.com',
    'manager@abc.com'
  ],
  defaultOrganization: 'abc.com',
  autoGrantAdmin: true,
  checkOrganizationDomain: true
};
```
