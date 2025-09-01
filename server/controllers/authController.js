import { db } from '../db.js';

export const authController = {
  async googleAuth(req, res) {
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
  },

  async getUser(req, res) {
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
  }
};
