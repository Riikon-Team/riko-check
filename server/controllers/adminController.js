import { db } from '../db.js';

export const adminController = {
  async getAllUsers(req, res) {
    try {
      const result = await db.query(
        'SELECT id, email, display_name, photo_url, role, is_approved, created_at FROM users ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
    }
  },

  async approveUser(req, res) {
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
  },

  async updateUserRole(req, res) {
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
  },

  async getStats(req, res) {
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
  }
};
