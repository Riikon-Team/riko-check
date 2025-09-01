// Utility functions để xử lý email OU và MSSV

/**
 * Kiểm tra email có phải email sinh viên OU không
 * Email sinh viên OU có format: MSSVtên@ou.edu.vn
 * Ví dụ: 2251052127trieu@ou.edu.vn
 */
export function isOUStudentEmail(email) {
  if (!email || !email.includes('@ou.edu.vn')) {
    return false
  }

  const username = email.split('@')[0]
  
  // Kiểm tra có MSSV (10 số) ở đầu không
  const mssvMatch = username.match(/^\d{10}/)
  if (!mssvMatch) {
    return false
  }

  // Kiểm tra có tên sau MSSV không
  const namePart = username.substring(10)
  return namePart.length > 0
}

/**
 * Trích xuất tên từ email sinh viên OU
 * Email sinh viên OU có format: MSSVtên@ou.edu.vn
 * Ví dụ: 2251052127trieu@ou.edu.vn -> Trieu
 */
export function extractNameFromOUEmail(email) {
  if (!isOUStudentEmail(email)) {
    return null
  }

  const username = email.split('@')[0]
  const namePart = username.substring(10) 
  return formatVietnameseName(namePart)
}

/**
 * Format tên từ username
 * Ví dụ: "trieu" -> "Trieu"
 */
export function formatVietnameseName(username) {
  return username.charAt(0).toUpperCase() + username.slice(1)
}

/**
 * Trích xuất MSSV từ email sinh viên OU
 * MSSV là 10 số đầu của email sinh viên OU
 */
export function extractMSSVFromOUEmail(email) {
  if (!isOUStudentEmail(email)) {
    return null
  }

  const username = email.split('@')[0]
  
  // MSSV là 10 số đầu
  const mssvMatch = username.match(/^\d{10}/)
  if (mssvMatch) {
    return mssvMatch[0]
  }

  return null
}

/**
 * Kiểm tra email có phải OU không (bao gồm cả sinh viên và không phải sinh viên)
 */
export function isOUEmail(email) {
  return email && email.toLowerCase().includes('@ou.edu.vn')
}

/**
 * Lấy thông tin đầy đủ từ email OU
 */
export function getOUEmailInfo(email) {
  if (!isOUEmail(email)) {
    return {
      isOU: false,
      isStudent: false,
      name: null,
      mssv: null
    }
  }

  const isStudent = isOUStudentEmail(email)

  return {
    isOU: true,
    isStudent: isStudent,
    name: isStudent ? extractNameFromOUEmail(email) : null,
    mssv: isStudent ? extractMSSVFromOUEmail(email) : null
  }
}

/**
 * Format tên cho hiển thị
 */
export function formatDisplayName(email, displayName) {
  const ouInfo = getOUEmailInfo(email)
  
  if (ouInfo.isOU && ouInfo.isStudent && ouInfo.name) {
    return ouInfo.name
  }
  
  return displayName || email.split('@')[0]
}
