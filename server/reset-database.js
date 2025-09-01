import { db } from './db.js';
import fs from 'fs';
import path from 'path';

async function resetDatabase() {
  try {
    console.log('🔄 Bắt đầu reset database...');

    // Đọc file schema
    const schemaPath = path.join(process.cwd(), 'server/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Xóa tất cả bảng hiện tại
    console.log('🗑️ Xóa các bảng cũ...');
    await db.query('DROP TABLE IF EXISTS attendances CASCADE');
    await db.query('DROP TABLE IF EXISTS events CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');

    // Tạo lại các bảng với schema mới
    console.log('🏗️ Tạo lại các bảng...');
    await db.query(schema);

    console.log('✅ Database đã được reset thành công!');
    console.log('\n📋 Các bảng đã được tạo:');
    console.log('- users (với can_create_events)');
    console.log('- events (với custom_fields, qr_code, is_public)');
    console.log('- attendances (với custom_data, status, approved_by, approved_at, notes)');
    
    console.log('\n🔧 Bước tiếp theo:');
    console.log('1. Thêm email admin vào server/config/admin.js');
    console.log('2. Khởi động server: npm run dev');
    console.log('3. Test đăng nhập với email admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi reset database:', error);
    process.exit(1);
  }
}

resetDatabase();
