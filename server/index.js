import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import admin from "firebase-admin";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getClientIp, ipInRanges } from "./utils.js";
import dotenv from "dotenv";
import { authMiddleware, adminMiddleware } from "./middleware.js";
import { db } from "./db.js";
// import { console } from "inspector";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

let firebaseConfig = {};
try {
  const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json'); 
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  firebaseConfig = serviceAccount;
  console.log('Firebase config loaded successfully.');  
} catch (error) {
  console.error('Error loading Firebase service account key:', error.message);
  console.error('Ensure serviceAccountKey.json exists in the correct path and is valid JSON.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'",
        "https://apis.google.com", 
        "https://*.firebaseapp.com", 
        "https://www.gstatic.com",
        "https://accounts.google.com",
        "https://www.google.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], 
      imgSrc: ["'self'", "data:", "https:", "blob:"],    
      connectSrc: [
        "'self'", 
        "https://*.googleapis.com", 
        "https://*.firebaseio.com", 
        "https://*.google.com", 
        "https://*.firebaseapp.com", 
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://accounts.google.com",
        "https://www.googleapis.com"
      ], 
      frameSrc: [
        "'self'", 
        "https://*.google.com", 
        "https://*.firebaseapp.com",
        "https://accounts.google.com",
        "https://www.google.com"
      ],  
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"]
    },
  },
}));

app.set('trust proxy', 1);
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
});
app.use('/api/', limiter);

app.use(express.static(path.join(__dirname, '../dist')));

app.use('/api/auth', authRoutes());
app.use('/api/events', eventRoutes());
app.use('/api/attendance', attendanceRoutes());
app.use('/api/admin', adminRoutes());

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use(express.static(path.join(__dirname, '../dist')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Đã xảy ra lỗi nội bộ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

function authRoutes() {
  const router = express.Router();
  
  router.post('/google', async (req, res) => {
    try {
      const { id, email, displayName, photoURL } = req.body;
      
      const userResult = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        res.json({
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          photoURL: user.photo_url,
          role: user.role,
          isApproved: user.is_approved
        });
      } else {
        const newUserResult = await db.query(
          'INSERT INTO users (id, email, display_name, photo_url, role, is_approved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [id, email, displayName, photoURL, 'user', false]
        );
        
        const newUser = newUserResult.rows[0];
        res.json({
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.display_name,
          photoURL: newUser.photo_url,
          role: newUser.role,
          isApproved: newUser.is_approved
        });
      }
    } catch (error) {
      console.error('Error in Google auth:', error);
      res.status(500).json({ message: 'Lỗi xác thực' });
    }
  });
  
  router.get('/user/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT id, email, display_name, photo_url, role, is_approved FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        res.json({
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          photoURL: user.photo_url,
          role: user.role,
          isApproved: user.is_approved
        });
      } else {
        res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Lỗi lấy thông tin người dùng' });
    }
  });
  
  return router;
}

function eventRoutes() {
  const router = express.Router();
  
  router.get('/', async (req, res) => {
    try {
      const result = await db.query(
        'SELECT e.*, u.display_name as creator_name FROM events e JOIN users u ON e.creator_id = u.id ORDER BY e.created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện' });
    }
  });
  
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT e.*, u.display_name as creator_name FROM events e JOIN users u ON e.creator_id = u.id WHERE e.id = $1',
        [id]
      );
      
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
    } catch (error) {
      console.error('Error getting event:', error);
      res.status(500).json({ message: 'Lỗi lấy thông tin sự kiện' });
    }
  });
  
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { name, description, types, requiresAuth, ipAllowList, startAt, endAt, nonceTtl } = req.body;
      const creatorId = req.user.uid;
      
      const result = await db.query(
        'INSERT INTO events (creator_id, name, description, types, requires_auth, ip_allow_list, start_at, end_at, nonce_ttl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [creatorId, name, description, types, requiresAuth, ipAllowList, startAt, endAt, nonceTtl || 300]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Lỗi tạo sự kiện' });
    }
  });
  
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, types, requiresAuth, ipAllowList, startAt, endAt, nonceTtl } = req.body;
      const userId = req.user.uid;
      
      const eventResult = await db.query(
        'SELECT creator_id FROM events WHERE id = $1',
        [id]
      );
      
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
      
      const event = eventResult.rows[0];
      if (event.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền chỉnh sửa sự kiện này' });
      }
      
      const result = await db.query(
        'UPDATE events SET name = $1, description = $2, types = $3, requires_auth = $4, ip_allow_list = $5, start_at = $6, end_at = $7, nonce_ttl = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
        [name, description, types, requiresAuth, ipAllowList, startAt, endAt, nonceTtl || 300, id]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Lỗi cập nhật sự kiện' });
    }
  });
  
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      
      const eventResult = await db.query(
        'SELECT creator_id FROM events WHERE id = $1',
        [id]
      );
      
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
      
      const event = eventResult.rows[0];
      if (event.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xóa sự kiện này' });
      }
      
      await db.query('DELETE FROM events WHERE id = $1', [id]);
      res.json({ message: 'Xóa sự kiện thành công' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Lỗi xóa sự kiện' });
    }
  });
  
  return router;
}

function attendanceRoutes() {
  const router = express.Router();
  
  router.post('/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { userId, uaHash, nonce } = req.body;
      const clientIp = getClientIp(req);
      
      const eventResult = await db.query(
        'SELECT * FROM events WHERE id = $1 AND start_at <= CURRENT_TIMESTAMP AND end_at >= CURRENT_TIMESTAMP',
        [eventId]
      );
      
      if (eventResult.rows.length === 0) {
        return res.status(400).json({ message: 'Sự kiện không tồn tại hoặc đã kết thúc' });
      }
      
      const event = eventResult.rows[0];

      console.log('Client IP:', clientIp);
      console.log('Event IP Allow List:', event.ip_allow_list);

      if (event.ip_allow_list && event.ip_allow_list.length > 0) {
        if (!(event.ip_allow_list.includes(clientIp) || ipInRanges(clientIp, event.ip_allow_list))) {
          return res.status(403).json({ message: 'IP của bạn không được phép tham gia sự kiện này' });
        }
      }
      
      const existingAttendance = await db.query(
        'SELECT * FROM attendances WHERE event_id = $1 AND (user_id = $2 OR ua_hash = $3)',
        [eventId, userId, uaHash]
      );
      
      if (existingAttendance.rows.length > 0) {
        return res.status(400).json({ message: 'Bạn đã điểm danh cho sự kiện này' });
      }
      
      const result = await db.query(
        'INSERT INTO attendances (event_id, user_id, ip, ua_hash, nonce) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [eventId, userId, clientIp, uaHash, nonce]
      );
      
      res.status(201).json({
        message: 'Điểm danh thành công!',
        attendance: result.rows[0]
      });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      res.status(500).json({ message: 'Lỗi điểm danh' });
    }
  });
  
  router.get('/:eventId', authMiddleware, async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.uid;
      
      const eventResult = await db.query(
        'SELECT creator_id FROM events WHERE id = $1',
        [eventId]
      );
      
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
      
      const event = eventResult.rows[0];
      if (event.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xem danh sách điểm danh' });
      }
      
      const result = await db.query(
        'SELECT a.*, u.display_name, u.email FROM attendances a LEFT JOIN users u ON a.user_id = u.id WHERE a.event_id = $1 ORDER BY a.created_at DESC',
        [eventId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting attendance:', error);
      res.status(500).json({ message: 'Lỗi lấy danh sách điểm danh' });
    }
  });
  
  return router;
}

function adminRoutes() {
  const router = express.Router();
  
  router.use(adminMiddleware);
  
  router.get('/users', async (req, res) => {
    try {
      const result = await db.query(
        'SELECT id, email, display_name, photo_url, role, is_approved, created_at FROM users ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
    }
  });
  
  router.post('/users/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'UPDATE users SET is_approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length > 0) {
        res.json({ message: 'Phê duyệt người dùng thành công', user: result.rows[0] });
      } else {
        res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Lỗi phê duyệt người dùng' });
    }
  });
  
  router.put('/users/:id/role', async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['user', 'organizer', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Vai trò không hợp lệ' });
      }
      
      const result = await db.query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [role, id]
      );
      
      if (result.rows.length > 0) {
        res.json({ message: 'Cập nhật vai trò thành công', user: result.rows[0] });
      } else {
        res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Lỗi cập nhật vai trò' });
    }
  });
  
  router.get('/stats', async (req, res) => {
    try {
      const userCount = await db.query('SELECT COUNT(*) FROM users');
      const eventCount = await db.query('SELECT COUNT(*) FROM events');
      const attendanceCount = await db.query('SELECT COUNT(*) FROM attendances');
      
      res.json({
        totalUsers: parseInt(userCount.rows[0].count),
        totalEvents: parseInt(eventCount.rows[0].count),
        totalAttendances: parseInt(attendanceCount.rows[0].count)
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ message: 'Lỗi lấy thống kê' });
    }
  });
  
  return router;
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});