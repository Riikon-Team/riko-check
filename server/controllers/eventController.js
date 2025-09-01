import { db } from '../db.js';

export const eventController = {
  async getAllEvents(req, res) {
    try {
      const result = await db.query(
        'SELECT e.*, u.display_name as creator_name FROM events e JOIN users u ON e.creator_id = u.id ORDER BY e.created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện' });
    }
  },

  async getEventById(req, res) {
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
  },

  async createEvent(req, res) {
    try {
      const { name, description, types, requiresAuth, ipAllowList, startAt, endAt, nonceTtl, customFields } = req.body;
      const creatorId = req.user.uid;
      
      // Đảm bảo ipAllowList là mảng
      const ipList = Array.isArray(ipAllowList) ? ipAllowList : (ipAllowList ? [ipAllowList] : []);
      
      const result = await db.query(
        'INSERT INTO events (creator_id, name, description, types, requires_auth, ip_allow_list, start_at, end_at, nonce_ttl, custom_fields) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [creatorId, name, description, types, requiresAuth, ipList, startAt, endAt, nonceTtl || 300, customFields || {}]
      );
      
      // Tạo QR code sau khi có event ID
      const qrCode = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/attendance/${result.rows[0].id}`;
      
      // Cập nhật QR code
      await db.query(
        'UPDATE events SET qr_code = $1 WHERE id = $2',
        [qrCode, result.rows[0].id]
      );
      
      // Lấy lại event với QR code
      const finalResult = await db.query(
        'SELECT * FROM events WHERE id = $1',
        [result.rows[0].id]
      );
      
      res.status(201).json(finalResult.rows[0]);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Lỗi tạo sự kiện' });
    }
  },

  async updateEvent(req, res) {
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
      
      // Đảm bảo ipAllowList là mảng
      const ipList = Array.isArray(ipAllowList) ? ipAllowList : (ipAllowList ? [ipAllowList] : []);
      
      const result = await db.query(
        'UPDATE events SET name = $1, description = $2, types = $3, requires_auth = $4, ip_allow_list = $5, start_at = $6, end_at = $7, nonce_ttl = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
        [name, description, types, requiresAuth, ipList, startAt, endAt, nonceTtl || 300, id]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Lỗi cập nhật sự kiện' });
    }
  },

  async deleteEvent(req, res) {
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
  }
};
