import ipaddr from "ipaddr.js";
import crypto from 'crypto';


export function getClientIp(req) {
  return (req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.ip || "").toString();
}

export function ipInRanges(ip, allowedIPs) {
  if (!ip || !allowedIPs || !Array.isArray(allowedIPs)) return false;
  
  // Kiểm tra IP có trong danh sách cho phép không
  return allowedIPs.some(allowedIP => {
    // Nếu là IP đơn lẻ
    if (!allowedIP.includes('/') && !allowedIP.includes('-')) {
      return ip === allowedIP;
    }
    
    // Nếu là IP range (CIDR notation)
    if (allowedIP.includes('/')) {
      try {
        const ipAddr = ipaddr.parse(ip);
        const range = ipaddr.parseCIDR(allowedIP);
        return ipAddr.match(range);
      } catch {
        return false;
      }
    }
    
    // Nếu là IP range (dash notation: 192.168.1.1-192.168.1.10)
    if (allowedIP.includes('-')) {
      try {
        const [startIP, endIP] = allowedIP.split('-');
        const ipAddr = ipaddr.parse(ip);
        const startAddr = ipaddr.parse(startIP);
        const endAddr = ipaddr.parse(endIP);
        
        return ipAddr.kind() === startAddr.kind() && 
               ipAddr.kind() === endAddr.kind() &&
               ipAddr >= startAddr && ipAddr <= endAddr;
      } catch {
        return false;
      }
    }
    
    return false;
  });
}

// Validate fingerprint từ frontend
export function validateFingerprint(fingerprint, hash, secretKey) {
  try {
    // Tạo hash từ fingerprint với secret key
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(fingerprint))
      .digest('hex');
    
    return expectedHash === hash;
  } catch (error) {
    console.error('Error validating fingerprint:', error);
    return false;
  }
}

// Tạo hash từ fingerprint
export function hashFingerprint(fingerprint, secretKey) {
  try {
    return crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(fingerprint))
      .digest('hex');
  } catch (error) {
    console.error('Error hashing fingerprint:', error);
    return null;
  }
}