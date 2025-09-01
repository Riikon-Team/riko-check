import { auth } from '../firebase/config'
import toast from 'react-hot-toast'

// Base API URL
const API_BASE_URL = '/api'

// Utility function để lấy token từ Firebase
const getAuthToken = async () => {
  try {
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken(true) // Force refresh token
    }
    return localStorage.getItem('token')
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

// Utility function để tạo headers với authentication
const createAuthHeaders = async (additionalHeaders = {}) => {
  const token = await getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...additionalHeaders
  }
}

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    requiresAuth = true,
    additionalHeaders = {},
    showToast = true,
    ...restOptions
  } = options

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const headers = requiresAuth 
      ? await createAuthHeaders(additionalHeaders)
      : {
          'Content-Type': 'application/json',
          ...additionalHeaders
        }

    const config = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
      ...restOptions
    }

    const response = await fetch(url, config)

    // Handle different response statuses
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      if (showToast) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      throw new Error('Unauthorized')
    }

    if (response.status === 403) {
      if (showToast) {
        toast.error('Bạn không có quyền thực hiện hành động này.')
      }
      throw new Error('Forbidden')
    }

    if (response.status === 404) {
      if (showToast) {
        toast.error('Không tìm thấy tài nguyên.')
      }
      throw new Error('Not Found')
    }

    if (response.status >= 500) {
      if (showToast) {
        toast.error('Lỗi server. Vui lòng thử lại sau.')
      }
      throw new Error('Server Error')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (showToast) {
        toast.error(errorData.message || 'Có lỗi xảy ra.')
      }
      throw new Error(errorData.message || 'Request failed')
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return await response.text()

  } catch (error) {
    console.error(`API call error (${method} ${endpoint}):`, error)
    throw error
  }
}

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiCall(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiCall(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'DELETE' }),
  patch: (endpoint, body, options = {}) => apiCall(endpoint, { ...options, method: 'PATCH', body })
}

// Specific API functions
export const authAPI = {
  googleSignIn: (userData) => api.post('/auth/google', userData, { requiresAuth: false }),
  getUser: (userId) => api.get(`/auth/user/${userId}`)
}

export const eventsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.publicOnly) {
      queryParams.append('publicOnly', 'true')
    }
    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return api.get(url, { requiresAuth: false })
  },
  getById: (id) => api.get(`/events/${id}`, { requiresAuth: false }),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`)
}

export const attendanceAPI = {
  submit: (eventId, attendanceData) => api.post(`/attendance/${eventId}`, attendanceData, { requiresAuth: false }),
  getByEvent: (eventId) => api.get(`/attendance/${eventId}`),
  approve: (attendanceId, data) => api.put(`/attendance/${attendanceId}/approve`, data),
  delete: (attendanceId) => api.delete(`/attendance/${attendanceId}`)
}

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  approveUser: (userId) => api.post(`/admin/users/${userId}/approve`),
  changeUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getStats: () => api.get('/admin/stats'),
  requestPermission: (requestData) => api.post('/admin/request-permission', requestData),
  // Event management
  getEvents: () => api.get('/admin/events'),
  deleteEvent: (eventId) => api.delete(`/admin/events/${eventId}`),
  getEventStats: (eventId) => api.get(`/admin/events/${eventId}/stats`)
}

// External API calls (không cần authentication)
export const externalAPI = {
  getIP: () => fetch('https://api.ipify.org?format=json').then(res => res.json())
}
