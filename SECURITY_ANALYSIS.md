# Phân tích Bảo mật và Quyền - RikoCheck

## 🔴 Các lỗ hỏng quyền nghiêm trọng

### 1. **Lỗ hỏng quyền trong Attendance Management**

**Vấn đề:** Trong `attendanceController.approveAttendance()` và `attendanceController.deleteAttendance()`, có lỗi logic kiểm tra quyền:

```javascript
// LỖI: Kiểm tra sai field
if (attendance.creator_id !== userId && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Không có quyền phê duyệt điểm danh này' });
}
```

**Nguy hiểm:** 
- `attendance.creator_id` không tồn tại trong bảng attendances
- Cần kiểm tra `event.creator_id` thay vào đó
- Có thể dẫn đến bypass quyền

**Sửa:**
```javascript
// Sửa thành:
if (attendance.event_creator_id !== userId && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Không có quyền phê duyệt điểm danh này' });
}
```

### 2. **Thiếu middleware bảo vệ cho Event Management**

**Vấn đề:** Route `/events/:id` (GET) không có middleware xác thực:

```javascript
router.get('/:id', eventController.getEventById); // ❌ Không có authMiddleware
```

**Nguy hiểm:** 
- Ai cũng có thể xem chi tiết sự kiện
- Có thể lộ thông tin nhạy cảm như IP allow list, custom fields

**Sửa:**
```javascript
router.get('/:id', authMiddleware, eventController.getEventById); // ✅ Thêm authMiddleware
```

### 3. **Lỗ hỏng quyền trong Event Update/Delete**

**Vấn đề:** Trong `eventController.updateEvent()` và `eventController.deleteEvent()`:

```javascript
if (event.creator_id !== userId && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Không có quyền chỉnh sửa sự kiện này' });
}
```

**Nguy hiểm:** 
- Chỉ kiểm tra `req.user.role !== 'admin'` 
- Không kiểm tra `req.user.role === 'admin'` trước khi so sánh
- Có thể dẫn đến bypass quyền

**Sửa:**
```javascript
if (event.creator_id !== userId && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Không có quyền chỉnh sửa sự kiện này' });
}
```

### 4. **Thiếu kiểm tra quyền trong Admin API**

**Vấn đề:** Admin có thể xóa bất kỳ event nào mà không kiểm tra quyền sở hữu:

```javascript
// Trong adminController.deleteEvent()
await db.query('DELETE FROM events WHERE id = $1', [id]);
```

**Nguy hiểm:**
- Admin có thể xóa event của admin khác
- Không có audit trail

**Sửa:**
```javascript
// Thêm kiểm tra quyền sở hữu hoặc log
const eventResult = await db.query('SELECT creator_id FROM events WHERE id = $1', [id]);
if (eventResult.rows.length === 0) {
  return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
}

// Log hành động xóa
console.log(`Admin ${req.user.uid} deleted event ${id} created by ${eventResult.rows[0].creator_id}`);
```

## 🟡 Các vấn đề bảo mật khác

### 5. **Thiếu Rate Limiting**

**Vấn đề:** Không có rate limiting cho API endpoints
**Nguy hiểm:** DDoS, brute force attacks
**Sửa:** Thêm rate limiting middleware

### 6. **Thiếu Input Validation**

**Vấn đề:** Một số API không validate input đầy đủ
**Nguy hiểm:** SQL injection, XSS
**Sửa:** Thêm validation middleware

### 7. **Thiếu CORS Configuration**

**Vấn đề:** Không có CORS policy rõ ràng
**Nguy hiểm:** CSRF attacks
**Sửa:** Cấu hình CORS đúng cách

## 🟢 Đề xuất sửa ưu tiên cao

### 1. **Sửa lỗi logic trong attendanceController (Ưu tiên cao nhất)**

```javascript
// Trong approveAttendance và deleteAttendance
const attendanceResult = await db.query(
  'SELECT a.*, e.creator_id as event_creator_id FROM attendances a JOIN events e ON a.event_id = e.id WHERE a.id = $1',
  [attendanceId]
);

// Sửa kiểm tra quyền
if (attendance.event_creator_id !== userId && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
}
```

### 2. **Thêm authMiddleware cho event detail route**

```javascript
router.get('/:id', authMiddleware, eventController.getEventById);
```

### 3. **Thêm validation middleware**

```javascript
// Tạo file middleware/validation.js
export const validateEventInput = (req, res, next) => {
  const { name, startAt, endAt } = req.body;
  
  if (!name || !startAt || !endAt) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  
  if (new Date(startAt) >= new Date(endAt)) {
    return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
  }
  
  next();
};
```

### 4. **Thêm rate limiting**

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // giới hạn 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. **Cải thiện logging và audit trail**

```javascript
// Thêm vào tất cả các action quan trọng
console.log(`[AUDIT] User ${req.user.uid} (${req.user.role}) performed action: ${action} on resource: ${resourceId}`);
```

## 📋 Checklist bảo mật

- [ ] Sửa lỗi logic kiểm tra quyền trong attendanceController
- [ ] Thêm authMiddleware cho event detail route
- [ ] Thêm input validation middleware
- [ ] Thêm rate limiting
- [ ] Cấu hình CORS đúng cách
- [ ] Thêm audit logging
- [ ] Kiểm tra SQL injection vulnerabilities
- [ ] Kiểm tra XSS vulnerabilities
- [ ] Thêm security headers
- [ ] Kiểm tra file upload security (nếu có)

## 🚨 Khuyến nghị

1. **Ưu tiên cao:** Sửa các lỗi logic kiểm tra quyền
2. **Ưu tiên trung bình:** Thêm middleware bảo vệ
3. **Ưu tiên thấp:** Cải thiện logging và monitoring

**Lưu ý:** Tất cả các thay đổi cần được test kỹ lưỡng trước khi deploy production.
