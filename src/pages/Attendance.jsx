import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI, attendanceAPI } from '../utils/apiUtils'
import toast from 'react-hot-toast'
import { formatDateTimeShort } from '../utils/dateUtils'
import { createSecureFingerprint } from '../utils/fingerprint'

function Attendance() {
  const { eventId } = useParams()
  const { currentUser, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [customData, setCustomData] = useState({})
  const [publicIp, setPublicIp] = useState('')
  const [fingerprint, setFingerprint] = useState('')
  const [fingerprintHash, setFingerprintHash] = useState('')

  useEffect(() => {
    fetchEvent()
    fetchPublicIP()
    generateFingerprint()
  }, [eventId])

  const generateFingerprint = () => {
    try {
      const secretKey = import.meta.env.VITE_SECRET_KEY || 'default_secret_key'
      const secureFingerprint = createSecureFingerprint(secretKey)
      setFingerprint(secureFingerprint.fingerprint)
      setFingerprintHash(secureFingerprint.hash)
    } catch (error) {
      console.error('Error generating fingerprint:', error)
      toast.error('Không thể tạo fingerprint bảo mật')
    }
  }

  const fetchEvent = async () => {
    try {
      const eventData = await eventsAPI.getById(eventId)
      if (eventData) {
        setEvent(eventData)
        
        if (eventData.requires_auth && !currentUser) {
          toast.error('Sự kiện này yêu cầu đăng nhập Google')
          return
        }
      } else {
        toast.error('Không thể tải thông tin sự kiện. Vui lòng đăng nhập lại.')
        navigate('/')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      if (error.message === 'Unauthorized') {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        navigate('/')
      } else {
        toast.error('Không thể tải thông tin sự kiện')
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setPublicIp(data.ip)
    } catch (error) {
      console.error('Error fetching public IP:', error)
      setPublicIp('Không thể xác định IP')
    }
  }

  const handleCustomDataChange = (fieldName, value) => {
    setCustomData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const validateCustomFields = () => {
    if (!event?.custom_fields || !Array.isArray(event.custom_fields)) return true
    
    for (const field of event.custom_fields) {
      const fieldLabel = field.label || field.title || 'trường bắt buộc'
      const fieldTitle = field.title || field.label || 'trường bắt buộc'
      
      if (field.required && (!customData[fieldLabel] || String(customData[fieldLabel]).trim() === '')) {
        toast.error(`Vui lòng nhập ${fieldTitle}`)
        return false
      }
    }
    return true
  }

  const handleAttendance = async () => {
    if (event?.requires_auth && !currentUser) {
      toast.error('Vui lòng đăng nhập Google trước')
      return
    }

    if (!validateCustomFields()) return

    try {
      setSubmitting(true)
      
      const attendanceData = {
        email: currentUser?.email || null,
        displayName: currentUser?.displayName || null,
        publicIp: publicIp,
        userAgent: navigator.userAgent,
        customData: customData,
        fingerprint: fingerprint,
        fingerprintHash: fingerprintHash
      }

      const response = await attendanceAPI.submit(eventId, attendanceData)
      if (response.isValid) {
        toast.success(response.message || 'Điểm danh thành công!')
        navigate(`/event/${eventId}`)
      } else {
        toast.error(response.message)
      }
      setCustomData({})
      
    } catch (error) {
      console.error('Error submitting attendance:', error)
      toast.error('Có lỗi xảy ra khi điểm danh')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  const now = new Date()
  const startTime = new Date(event.start_at)
  const endTime = new Date(event.end_at)
  const isActive = now >= startTime && now <= endTime
  const isUpcoming = now < startTime
  const isEnded = now > endTime

  if (isEnded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold  dark:text-gray-100 mb-2">Sự kiện đã kết thúc</h2>
          <p className=" dark:text-gray-400 mb-4">
            Sự kiện "{event.name}" đã kết thúc vào {formatDateTimeShort(endTime)}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  if (isUpcoming) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold  dark:text-gray-100 mb-2">Sự kiện chưa bắt đầu</h2>
          <p className=" dark:text-gray-400 mb-4">
            Sự kiện "{event.name}" sẽ bắt đầu vào {formatDateTimeShort(startTime)}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold  dark:text-gray-100 mb-2">
            {event.name}
          </h1>
          <p className=" dark:text-gray-400">
            {event.description}
          </p>
        </div>

        {/* Event Info Table - Không viền */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Thời gian bắt đầu:</span>
              <span className="text-sm font-medium  dark:text-gray-100">
                {formatDateTimeShort(startTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Thời gian kết thúc:</span>
              <span className="text-sm font-medium  dark:text-gray-100">
                {formatDateTimeShort(endTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Loại điểm danh:</span>
              <span className="text-sm font-medium  dark:text-gray-100">
                {event.requires_auth ? 'Yêu cầu đăng nhập' : 'Không cần đăng nhập'}
              </span>
            </div>
            {event.types && event.types.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Loại sự kiện:</span>
                <div className="flex gap-1">
                  {event.types.map((type, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event?.allowed_email_domains && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Email cho phép:</span>
                <div className="flex gap-1">
                  {event.allowed_email_domains.map((domain, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )} 
          </div>
        </div>

        {/* Login/Attendance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          {event.requires_auth && !currentUser ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold  dark:text-gray-100 mb-2">
                Đăng nhập để điểm danh
              </h3>
              <p className="text-sm  dark:text-gray-400 mb-4">
                Sự kiện này yêu cầu đăng nhập Google để điểm danh
              </p>
              <button
                onClick={signInWithGoogle}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold  dark:text-gray-100 mb-2">
                {event.requires_auth && currentUser ? `Chào mừng ${currentUser.displayName}!` : 'Sẵn sàng điểm danh'}
              </h3>
              <p className="text-sm  dark:text-gray-400 mb-4">
                {event.requires_auth && currentUser ? 'Bạn đã đăng nhập thành công' : 'Vui lòng điền thông tin bên dưới'}
              </p>
              
              {/* Custom Fields */}
              {event.custom_fields && Array.isArray(event.custom_fields) && event.custom_fields.length > 0 && (
                <div className="mb-4 text-left">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Thông tin bổ sung
                  </h4>
                  <div className="space-y-3">
                    {event.custom_fields.map((field, index) => {
                      const fieldTitle = field.title || field.label || `Field ${index + 1}`
                      const fieldLabel = field.label || field.title || `field_${index}`
                      const fieldType = field.type || 'text'
                      const fieldRequired = field.required || false
                      
                      return (
                        <div key={fieldLabel}>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {fieldTitle}
                            {fieldRequired && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type={fieldType}
                            value={customData[fieldLabel] || ''}
                            onChange={(e) => handleCustomDataChange(fieldLabel, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              fieldRequired && (!customData[fieldLabel] || customData[fieldLabel].trim() === '')
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700  dark:text-gray-100`}
                            placeholder={`Nhập ${fieldTitle.toLowerCase()}`}
                            required={fieldRequired}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleAttendance}
                disabled={submitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang điểm danh...</span>
                  </div>
                ) : (
                  'Điểm danh ngay'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tooltip Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="space-y-1 text-xs">
                <li>• Điểm danh sẽ được ghi nhận với IP hiện tại của bạn. Nên dùng dùng mạng nội bộ để điểm danh, tránh dùng 4G hay VPN</li>
                <li>• Thông tin sẽ được lưu để người tổ chức kiểm tra</li>
                <li>• Bạn có thể xem lịch sử điểm danh sau khi đăng nhập</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Attendance
