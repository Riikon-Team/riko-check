import { db } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await db.query(schema);
    console.log('Database schema created successfully');
    
    const adminCheck = await db.query(
      'SELECT * FROM users WHERE email = $1',
      ['trieukon1011@gmail.com']
    );
    
    if (adminCheck.rows.length === 0) {
      await db.query(
        'INSERT INTO users (id, email, display_name, role, is_approved) VALUES ($1, $2, $3, $4, $5)',
        ['admin-001', 'trieukon1011@gmail.com', 'System Administrator', 'admin', true]
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
