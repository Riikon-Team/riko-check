import admin from 'firebase-admin';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      
      // Get user role from database
      const { db } = await import('./db.js');
      const userResult = await db.query(
        'SELECT role, is_approved FROM users WHERE id = $1',
        [decodedToken.uid]
      );
      
      if (userResult.rows.length > 0) {
        req.user.role = userResult.rows[0].role;
        req.user.isApproved = userResult.rows[0].is_approved;
      }
      
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ message: 'Lỗi xác thực' });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    return res.status(500).json({ message: 'Lỗi kiểm tra quyền' });
  }
};

export const organizerMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    if (!['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền tạo sự kiện' });
    }
    
    if (req.user.role === 'organizer' && !req.user.isApproved) {
      return res.status(403).json({ message: 'Tài khoản chưa được phê duyệt' });
    }
    
    next();
  } catch (error) {
    console.error('Error in organizer middleware:', error);
    return res.status(500).json({ message: 'Lỗi kiểm tra quyền' });
  }
};


