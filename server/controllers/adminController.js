import { db } from '../db.js';

export const adminController = {
  async getAllUsers(req, res) {
    try {
      const result = await db.query(
        'SELECT id, email, display_name, photo_url, role, can_create_events, created_at FROM users ORDER BY created_at DESC'
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
        'UPDATE users SET can_create_events = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
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

  async getAllEvents(req, res) {
    try {
      const result = await db.query(
        `SELECT e.*, u.display_name as creator_name, u.email as creator_email,
         (SELECT COUNT(*) FROM attendances WHERE event_id = e.id) as attendance_count
         FROM events e 
         JOIN users u ON e.creator_id = u.id 
         ORDER BY e.created_at DESC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện' });
    }
  },

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      
      // Lấy thông tin event trước khi xóa để audit
      const eventResult = await db.query('SELECT creator_id, name FROM events WHERE id = $1', [id]);
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
      
      const event = eventResult.rows[0];
      
      // Log hành động xóa
      console.log(`[AUDIT] Admin ${req.user.uid} deleted event ${id} (${event.name}) created by ${event.creator_id}`);
      
      // Xóa attendances trước (do foreign key constraint)
      await db.query('DELETE FROM attendances WHERE event_id = $1', [id]);
      
      // Sau đó xóa event
      const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length > 0) {
        res.json({ message: 'Xóa sự kiện thành công', event: result.rows[0] });
      } else {
        res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Lỗi xóa sự kiện' });
    }
  },

  async getEventStats(req, res) {
    try {
      const { id } = req.params;
      
      // Thống kê điểm danh theo event
      const attendanceStats = await db.query(
        `SELECT 
          COUNT(*) as total_attendances,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
         FROM attendances WHERE event_id = $1`,
        [id]
      );
      
      // Thống kê theo ngày
      const dailyStats = await db.query(
        `SELECT 
          DATE(at) as date,
          COUNT(*) as count
         FROM attendances 
         WHERE event_id = $1 
         GROUP BY DATE(at) 
         ORDER BY date DESC 
         LIMIT 30`,
        [id]
      );
      
      res.json({
        attendance: attendanceStats.rows[0],
        daily: dailyStats.rows
      });
    } catch (error) {
      console.error('Error getting event stats:', error);
      res.status(500).json({ message: 'Lỗi lấy thống kê sự kiện' });
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
