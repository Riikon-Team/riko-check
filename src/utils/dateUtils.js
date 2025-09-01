// Utility functions for date formatting with Vietnamese locale

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('vi-VN', { ...defaultOptions, ...options })
}

export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Date(date).toLocaleTimeString('vi-VN', { ...defaultOptions, ...options })
}

export const formatDateTime = (date, options = {}) => {
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Date(date).toLocaleString('vi-VN', { ...defaultOptions, ...options })
}

export const formatDateShort = (date) => {
  return formatDate(date, { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

export const formatTimeShort = (date) => {
  return formatTime(date, { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const formatDateTimeShort = (date) => {
  return formatDateTime(date, {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
