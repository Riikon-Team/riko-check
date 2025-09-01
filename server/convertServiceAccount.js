import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function convertServiceAccountToBase64() {
  try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    const base64String = Buffer.from(serviceAccountContent, 'utf8').toString('base64');
    
    console.log('Base64 string:');
    console.log(base64String);
    
    return base64String;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

convertServiceAccountToBase64();