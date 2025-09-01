import { db } from '../db.js';

export const eventController = {
  async getAllEvents(req, res) {
    try {
      const { publicOnly = false } = req.query;
      
      let query = 'SELECT e.*, u.display_name as creator_name FROM events e JOIN users u ON e.creator_id = u.id';
      let params = [];
      
      if (publicOnly === 'true') {
        query += ' WHERE e.is_public = true';
      }
      
      query += ' ORDER BY e.created_at DESC';
      
      const result = await db.query(query, params);
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
      // Check if user can_create_events is true
      const userResult = await db.query(
        'SELECT can_create_events FROM users WHERE id = $1',
        [req.user.uid]
      );
      if (userResult.rows.length === 0 || userResult.rows[0].can_create_events === false) {
        return res.status(403).json({ message: 'Người dùng không có quyền tạo sự kiện' });
      }
      
      const { name, description, types, requiresAuth, ipAllowList, allowedEmailDomains, startAt, endAt, nonceTtl, customFields, isPublic } = req.body;
      const creatorId = req.user.uid;
      
      // Đảm bảo ipAllowList là mảng
      const ipList = Array.isArray(ipAllowList) ? ipAllowList : (ipAllowList ? [ipAllowList] : []);
      
      const result = await db.query(
        'INSERT INTO events (creator_id, name, description, types, requires_auth, ip_allow_list, allowed_email_domains, start_at, end_at, nonce_ttl, custom_fields, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12) RETURNING *',
        [creatorId, name, description, types, requiresAuth, ipList, allowedEmailDomains || [], startAt, endAt, nonceTtl || 300, JSON.stringify(customFields || []), isPublic || false]
      );
      
      // Tạo QR code sau khi có event ID
      const qrCode = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/attendance/${result.rows[0].id}`;
      
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
      const { name, description, types, requiresAuth, ipAllowList, allowedEmailDomains, startAt, endAt, nonceTtl, customFields, isPublic } = req.body;
      const userId = req.user.uid;
      
      const eventResult = await db.query(
        'SELECT creator_id FROM events WHERE id = $1',
        [id]
      );
      
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
      
      const event = eventResult.rows[0];
      // Kiểm tra quyền: chỉ creator hoặc admin mới được phép
      if (event.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền chỉnh sửa sự kiện này' });
      }
      
      // Đảm bảo ipAllowList là mảng
      const ipList = Array.isArray(ipAllowList) ? ipAllowList : (ipAllowList ? [ipAllowList] : []);
      
      const result = await db.query(
        'UPDATE events SET name = $1, description = $2, types = $3, requires_auth = $4, ip_allow_list = $5, allowed_email_domains = $6, start_at = $7, end_at = $8, nonce_ttl = $9, custom_fields = $10::jsonb, is_public = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *',
        [name, description, types, requiresAuth, ipList, allowedEmailDomains || [], startAt, endAt, nonceTtl || 300, JSON.stringify(customFields || []), isPublic || false, id]
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
      // Kiểm tra quyền: chỉ creator hoặc admin mới được phép
      if (event.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xóa sự kiện này' });
      }
      
      // Xóa attendances trước (do foreign key constraint)
      await db.query('DELETE FROM attendances WHERE event_id = $1', [id]);
      
      // Sau đó xóa event
      await db.query('DELETE FROM events WHERE id = $1', [id]);
      
      res.json({ message: 'Xóa sự kiện thành công' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Lỗi xóa sự kiện' });
    }
  }
};
