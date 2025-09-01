import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseConfig = {};

try {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json'); 
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  firebaseConfig = serviceAccount;
  console.log('Firebase config loaded successfully.');  
} catch (error) {
  console.error('Error loading Firebase service account key:', error.message);
  console.error('Ensure serviceAccountKey.json exists in the correct path and is valid JSON.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

export default admin;
