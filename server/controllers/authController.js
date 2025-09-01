import { db } from '../db.js';
import { isAdminEmail, isSameOrganization, adminConfig } from '../config/admin.js';

export const authController = {
  async googleAuth(req, res) {
    try {
      const { id, email, displayName, photoURL, organizationDomain } = req.body;
      
      // Kiểm tra email có phải admin không
      const isAdmin = isAdminEmail(email);
      console.log('Email:', email, 'Is Admin:', isAdmin);
      
      // Kiểm tra domain tổ chức nếu có yêu cầu
      let organizationValid = true;
      if (adminConfig.checkOrganizationDomain && organizationDomain) {
        organizationValid = isSameOrganization(email, organizationDomain);
      }
      
      const userResult = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Cập nhật quyền admin nếu cần
        if (isAdmin && adminConfig.autoGrantAdmin) {
          if (user.role !== 'admin') {
            console.log('Updating user to admin:', id);
            await db.query(
              'UPDATE users SET role = $1, can_create_events = $2, is_approved = $3 WHERE id = $4',
              ['admin', true, true, id]
            );
            user.role = 'admin';
            user.can_create_events = true;
            user.is_approved = true;
          } else {
            console.log('User is already admin:', id);
          }
        }
        
        console.log('Returning user with role:', user.role);
        
        res.json({
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          photoURL: user.photo_url,
          role: user.role,
          isApproved: user.is_approved,
          canCreateEvents: user.can_create_events,
          organizationValid
        });
      } else {
        // Tạo user mới với quyền admin nếu email trong danh sách admin
        const role = isAdmin && adminConfig.autoGrantAdmin ? 'admin' : 'user';
        const canCreateEvents = isAdmin && adminConfig.autoGrantAdmin ? true : false;
        const isApproved = isAdmin && adminConfig.autoGrantAdmin ? true : false;
        
        // Sử dụng ON CONFLICT để tránh lỗi duplicate key
        const newUserResult = await db.query(
          `INSERT INTO users (id, email, display_name, photo_url, role, is_approved, can_create_events) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             display_name = EXCLUDED.display_name, 
             photo_url = EXCLUDED.photo_url,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [id, email, displayName, photoURL, role, isApproved, canCreateEvents]
        );
        
        const newUser = newUserResult.rows[0];
        res.json({
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.display_name,
          photoURL: newUser.photo_url,
          role: newUser.role,
          isApproved: newUser.is_approved,
          canCreateEvents: newUser.can_create_events,
          organizationValid
        });
      }
    } catch (error) {
      console.error('Error in Google auth:', error);
      res.status(500).json({ message: 'Lỗi xác thực' });
    }
  },

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT id, email, display_name, photo_url, role, is_approved, can_create_events FROM users WHERE id = $1',
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
          isApproved: user.is_approved,
          canCreateEvents: user.can_create_events
        });
      } else {
        res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Lỗi lấy thông tin người dùng' });
    }
  }
};
