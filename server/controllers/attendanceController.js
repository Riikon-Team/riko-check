import { db } from '../db.js';
import { getClientIp, ipInRanges } from '../utils.js';

export const attendanceController = {
  async submitAttendance(req, res) {
    try {
      const { eventId } = req.params;
      const { userId, uaHash, nonce, customData } = req.body;
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

      // Kiểm tra IP và quyết định status (optional)
      let status = 'approved';
      if (event.ip_allow_list && event.ip_allow_list.length > 0) {
        // Nếu có IP allow list, kiểm tra xem IP hiện tại có trong danh sách không
        const isIpAllowed = event.ip_allow_list.includes(clientIp) || ipInRanges(clientIp, event.ip_allow_list);
        if (!isIpAllowed) {
          status = 'pending';
        }
      }
      // Nếu không có IP allow list hoặc IP được cho phép -> status = 'approved'
      
      const existingAttendance = await db.query(
        'SELECT * FROM attendances WHERE event_id = $1 AND (user_id = $2 OR ua_hash = $3)',
        [eventId, userId, uaHash]
      );
      
      if (existingAttendance.rows.length > 0) {
        return res.status(400).json({ message: 'Bạn đã điểm danh cho sự kiện này' });
      }
      
      const result = await db.query(
        'INSERT INTO attendances (event_id, user_id, ip, ua_hash, nonce, custom_data, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [eventId, userId, clientIp, uaHash, nonce, customData || {}, status]
      );
      
      const message = status === 'approved' ? 'Điểm danh thành công!' : 'Điểm danh đã được ghi nhận và đang chờ phê duyệt!';
      
      res.status(201).json({
        message,
        attendance: result.rows[0],
        status
      });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      res.status(500).json({ message: 'Lỗi điểm danh' });
    }
  },

  async getAttendance(req, res) {
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
  },

  async approveAttendance(req, res) {
    try {
      const { attendanceId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.uid;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      
      const attendanceResult = await db.query(
        'SELECT a.*, e.creator_id FROM attendances a JOIN events e ON a.event_id = e.id WHERE a.id = $1',
        [attendanceId]
      );
      
      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy điểm danh' });
      }
      
      const attendance = attendanceResult.rows[0];
      if (attendance.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền phê duyệt điểm danh này' });
      }
      
      const result = await db.query(
        'UPDATE attendances SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, notes = $3 WHERE id = $4 RETURNING *',
        [status, userId, notes, attendanceId]
      );
      
      res.json({
        message: `Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} điểm danh`,
        attendance: result.rows[0]
      });
    } catch (error) {
      console.error('Error approving attendance:', error);
      res.status(500).json({ message: 'Lỗi phê duyệt điểm danh' });
    }
  }
};
