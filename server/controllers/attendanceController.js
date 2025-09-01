import { db } from '../db.js';
import { getClientIp, ipInRanges, validateFingerprint } from '../utils.js';
import crypto from 'crypto';

export const attendanceController = {
  async submitAttendance(req, res) {
    try {
      const { eventId } = req.params;
      const { userId, customData, email, displayName, publicIp: bodyPublicIp, fingerprint, fingerprintHash } = req.body;
      const clientIp = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      
      // Lấy public IP từ request body hoặc headers
      const publicIp = bodyPublicIp || req.headers['x-forwarded-for'] || clientIp;
      
      // Kiểm tra fingerprint nếu có
      if (fingerprint && fingerprintHash) {
        const secretKey = process.env.SECRET_KEY || 'default_secret_key';
        const isValidFingerprint = validateFingerprint(fingerprint, fingerprintHash, secretKey);
        
        if (!isValidFingerprint) {
          console.log('Invalid fingerprint detected');
          return res.status(403).json({ 
            message: 'Fingerprint không hợp lệ - Có thể là request giả mạo' 
          });
        }
        
        // Tạo hash từ fingerprint để lưu vào DB
        const fingerprintHashForDB = crypto.createHash('sha256').update(JSON.stringify(fingerprint)).digest('hex');
        
        // Sử dụng fingerprint hash thay vì ua_hash
        const nonce = crypto.randomBytes(16).toString('hex');
        
        const eventResult = await db.query(
          'SELECT * FROM events WHERE id = $1 AND start_at <= CURRENT_TIMESTAMP AND end_at >= CURRENT_TIMESTAMP',
          [eventId]
        );
        
        if (eventResult.rows.length === 0) {
          return res.status(400).json({ message: 'Sự kiện không tồn tại hoặc đã kết thúc' });
        }
        
        const event = eventResult.rows[0];

        console.log('Client IP:', clientIp);
        console.log('Public IP:', publicIp);
        console.log('Event IP Allow List:', event.ip_allow_list);
        console.log('Fingerprint Hash:', fingerprintHashForDB);

        // Kiểm tra và quyết định trạng thái điểm danh
        let isValid = true;
        let status = 'pending';
        let message = 'Điểm danh đã được ghi nhận và đang chờ phê duyệt!';
        let rejectionReason = null;
        
        // Bước 1: Kiểm tra domain email (nếu có cấu hình)
        if (event.allowed_email_domains && event.allowed_email_domains.length > 0 && email) {
          const emailDomain = String(email).split('@')[1]?.toLowerCase();
          const isDomainAllowed = event.allowed_email_domains.map(d => String(d).toLowerCase()).includes(emailDomain);
          
          if (!isDomainAllowed) {
            isValid = false;
            status = 'rejected';
            message = `Email không thuộc domain "${event.allowed_email_domains.join(', ')}" cho phép`;
            rejectionReason = 'EMAIL_DOMAIN';
            console.log('Email domain rejected:', emailDomain);
          }
        }
        
        // Bước 2: Kiểm tra IP (chỉ khi email hợp lệ hoặc không cần kiểm tra email)
        if (isValid && event.ip_allow_list && event.ip_allow_list.length > 0) {
          const isIpAllowed = event.ip_allow_list.includes(publicIp) || ipInRanges(publicIp, event.ip_allow_list);
          
          console.log('IP Check Results:');
          console.log('- Public IP:', publicIp);
          console.log('- Allow List:', event.ip_allow_list);
          console.log('- Direct match:', event.ip_allow_list.includes(publicIp));
          console.log('- Range match:', ipInRanges(publicIp, event.ip_allow_list));
          console.log('- Final result:', isIpAllowed);
          
          if (!isIpAllowed) {
            isValid = false;
            status = 'rejected';
            message = 'Điểm danh không hợp lệ do không nằm trong danh sách IP cho phép';
            rejectionReason = 'IP_NOT_ALLOWED';
            console.log('IP rejected - setting isValid = false, reason:', rejectionReason);
          }
        }
        
        // Bước 3: Quyết định status cuối cùng
        if (isValid) {
          // Tất cả điều kiện đều pass -> approved
          status = 'approved';
          message = 'Điểm danh thành công!';
          console.log('All validations passed - setting status = approved');
        } else {
          // Có ít nhất 1 điều kiện fail -> rejected
          console.log('Validation failed - final status = rejected, reason:', rejectionReason);
        }
        
        // Kiểm tra điểm danh có tồn tại hay không (sử dụng fingerprint hash)
        const existingAttendance = await db.query(
          'SELECT * FROM attendances WHERE event_id = $1 AND (user_id = $2 OR fingerprint_hash = $3)',
          [eventId, userId, fingerprintHashForDB]
        );

        if (existingAttendance.rows.length > 0) {
          const existing = existingAttendance.rows[0];

          let existing_message = 'Bạn đã điểm danh hợp lệ cho sự kiện này';

          if (existing.fingerprint_hash === fingerprintHashForDB) {
            existing_message = 'Thiết bị này đã được điểm danh trước đó. Hãy dùng thiết bị khác để điểm danh';
          }

          // Nếu điểm danh cũ đã hợp lệ (is_valid = true) -> không cho phép ghi đè
          if (existing.is_valid) {
            return res.status(400).json({ 
              message: existing_message,
              existingAttendance: existing
            });
          }
          
          // Nếu điểm danh mới cũng không hợp lệ -> cho phép ghi đè nhưng thông báo
          if (!isValid) {
            console.log('Overwriting invalid attendance with another invalid attempt');
            await db.query('DELETE FROM attendances WHERE id = $1', [existing.id]);
          } 
          // Nếu điểm danh mới hợp lệ -> ghi đè điểm danh cũ không hợp lệ
          else {
            console.log('Overwriting invalid attendance with valid attendance');
            await db.query('DELETE FROM attendances WHERE id = $1', [existing.id]);
          }
        }
        
        const result = await db.query(
          `INSERT INTO attendances (
            event_id, user_id, email, display_name, ip, public_ip, fingerprint_hash, 
            nonce, custom_data, status, is_valid, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            eventId, userId, email, displayName, clientIp, publicIp, fingerprintHashForDB,
            nonce, customData || {}, status, isValid, userAgent
          ]
        );
        
        res.status(201).json({
          message,
          attendance: result.rows[0],
          status,
          isValid
        });
      } else {
        // Fallback cho trường hợp không có fingerprint (tương thích ngược)
        console.log('No fingerprint provided, using fallback method');
        
        // Tạo ua_hash từ userAgent và clientIp (tương thích ngược)
        const userAgent = req.headers['user-agent'] || '';
        const uaHash = crypto.createHash('sha256').update(userAgent + clientIp).digest('hex');
        const nonce = crypto.randomBytes(16).toString('hex');
        
        const eventResult = await db.query(
          'SELECT * FROM events WHERE id = $1 AND start_at <= CURRENT_TIMESTAMP AND end_at >= CURRENT_TIMESTAMP',
          [eventId]
        );
        
        if (eventResult.rows.length === 0) {
          return res.status(400).json({ message: 'Sự kiện không tồn tại hoặc đã kết thúc' });
        }
        
        const event = eventResult.rows[0];

        console.log('Client IP:', clientIp);
        console.log('Public IP:', publicIp);
        console.log('Event IP Allow List:', event.ip_allow_list);
        console.log('UA Hash:', uaHash);

        // Kiểm tra và quyết định trạng thái điểm danh
        let isValid = true;
        let status = 'pending';
        let message = 'Điểm danh đã được ghi nhận và đang chờ phê duyệt!';
        let rejectionReason = null;
        
        // Bước 1: Kiểm tra domain email (nếu có cấu hình)
        if (event.allowed_email_domains && event.allowed_email_domains.length > 0 && email) {
          const emailDomain = String(email).split('@')[1]?.toLowerCase();
          const isDomainAllowed = event.allowed_email_domains.map(d => String(d).toLowerCase()).includes(emailDomain);
          
          if (!isDomainAllowed) {
            isValid = false;
            status = 'rejected';
            message = `Email không thuộc domain "${event.allowed_email_domains.join(', ')}" cho phép`;
            rejectionReason = 'EMAIL_DOMAIN';
            console.log('Email domain rejected:', emailDomain);
          }
        }
        
        // Bước 2: Kiểm tra IP (chỉ khi email hợp lệ hoặc không cần kiểm tra email)
        if (isValid && event.ip_allow_list && event.ip_allow_list.length > 0) {
          const isIpAllowed = event.ip_allow_list.includes(publicIp) || ipInRanges(publicIp, event.ip_allow_list);
          
          console.log('IP Check Results:');
          console.log('- Public IP:', publicIp);
          console.log('- Allow List:', event.ip_allow_list);
          console.log('- Direct match:', event.ip_allow_list.includes(publicIp));
          console.log('- Range match:', ipInRanges(publicIp, event.ip_allow_list));
          console.log('- Final result:', isIpAllowed);
          
          if (!isIpAllowed) {
            isValid = false;
            status = 'rejected';
            message = 'Điểm danh không hợp lệ do không nằm trong danh sách IP cho phép';
            rejectionReason = 'IP_NOT_ALLOWED';
            console.log('IP rejected - setting isValid = false, reason:', rejectionReason);
          }
        }
        
        // Bước 3: Quyết định status cuối cùng
        if (isValid) {
          // Tất cả điều kiện đều pass -> approved
          status = 'approved';
          message = 'Điểm danh thành công!';
          console.log('All validations passed - setting status = approved');
        } else {
          // Có ít nhất 1 điều kiện fail -> rejected
          console.log('Validation failed - final status = rejected, reason:', rejectionReason);
        }
        
        // Kiểm tra điểm danh có tồn tại hay không (sử dụng ua_hash)
        const existingAttendance = await db.query(
          'SELECT * FROM attendances WHERE event_id = $1 AND (user_id = $2 OR ua_hash = $3)',
          [eventId, userId, uaHash]
        );

        if (existingAttendance.rows.length > 0) {
          const existing = existingAttendance.rows[0];

          let existing_message = 'Bạn đã điểm danh hợp lệ cho sự kiện này';

          if (existing.ua_hash === uaHash) {
            existing_message = 'Thiết bị này đã được điểm danh trước đó. Hãy dùng thiết bị khác để điểm danh';
          }

          // Nếu điểm danh cũ đã hợp lệ (is_valid = true) -> không cho phép ghi đè
          if (existing.is_valid) {
            return res.status(400).json({ 
              message: existing_message,
              existingAttendance: existing
            });
          }
          
          // Nếu điểm danh mới cũng không hợp lệ -> cho phép ghi đè nhưng thông báo
          if (!isValid) {
            console.log('Overwriting invalid attendance with another invalid attempt');
            await db.query('DELETE FROM attendances WHERE id = $1', [existing.id]);
          } 
          // Nếu điểm danh mới hợp lệ -> ghi đè điểm danh cũ không hợp lệ
          else {
            console.log('Overwriting invalid attendance with valid attendance');
            await db.query('DELETE FROM attendances WHERE id = $1', [existing.id]);
          }
        }
        
        const result = await db.query(
          `INSERT INTO attendances (
            event_id, user_id, email, display_name, ip, public_ip, ua_hash, 
            nonce, custom_data, status, is_valid, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            eventId, userId, email, displayName, clientIp, publicIp, uaHash,
            nonce, customData || {}, status, isValid, userAgent 
          ]
        );
        
        res.status(201).json({
          message,
          attendance: result.rows[0],
          status,
          isValid
        });
      }
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
        `SELECT a.*, u.display_name as user_display_name, u.email as user_email 
         FROM attendances a 
         LEFT JOIN users u ON a.user_id = u.id 
         WHERE a.event_id = $1 
         ORDER BY a.created_at DESC`,
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
  },

  async deleteAttendance(req, res) {
    try {
      const { attendanceId } = req.params;
      const userId = req.user.uid;
      
      const attendanceResult = await db.query(
        'SELECT a.*, e.creator_id FROM attendances a JOIN events e ON a.event_id = e.id WHERE a.id = $1',
        [attendanceId]
      );
      
      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy điểm danh' });
      }
      
      const attendance = attendanceResult.rows[0];
      if (attendance.creator_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xóa điểm danh này' });
      }
      
      await db.query('DELETE FROM attendances WHERE id = $1', [attendanceId]);
      
      res.json({ message: 'Đã xóa điểm danh' });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({ message: 'Lỗi xóa điểm danh' });
    }
  }
};

