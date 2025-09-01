import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function Attendance() {
  const { id: eventId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fingerprint, setFingerprint] = useState('')
  const [showFingerprintModal, setShowFingerprintModal] = useState(false)

  useEffect(() => {
    fetchEvent()
    generateFingerprint()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
        
        const now = new Date()
        const startTime = new Date(eventData.start_at)
        const endTime = new Date(eventData.end_at)
        
        if (now < startTime || now > endTime) {
          toast.error('Sự kiện chưa bắt đầu hoặc đã kết thúc')
          navigate('/')
          return
        }
      } else {
        toast.error('Không tìm thấy sự kiện')
        navigate('/')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Lỗi tải thông tin sự kiện')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const generateFingerprint = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Fingerprint', 2, 2)
    
    const fingerprint = btoa(canvas.toDataURL())
    setFingerprint(fingerprint)
  }

  const handleAttendance = async (requiresAuth = false) => {
    if (!event) return

    setSubmitting(true)
    
    try {
      const attendanceData = {
        eventId: eventId,
        uaHash: fingerprint,
        nonce: Math.random().toString(36).substring(7),
        userId: requiresAuth ? currentUser?.uid : null
      }

      const response = await fetch(`/api/attendance/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Điểm danh thành công!')
        
        if (!requiresAuth) {
          const attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]')
          attendanceHistory.push({
            eventId,
            eventName: event.name,
            timestamp: new Date().toISOString(),
            fingerprint
          })
          localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory))
        }
        
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Điểm danh thất bại!')
      }
    } catch (error) {
      console.error('Error submitting attendance:', error)
      toast.error('Lỗi điểm danh!')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="card mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {event.description}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Thời gian bắt đầu</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(event.start_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Thời gian kết thúc</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(event.end_at).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">Chế độ điểm danh</div>
              <div className="text-lg font-semibold text-primary-600">
                {event.requires_auth ? 'Yêu cầu đăng nhập' : 'Không cần đăng nhập'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Chọn cách điểm danh
          </h2>

          <div className="space-y-4">
            {!event.requires_auth && (
              <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Điểm danh không cần đăng nhập
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Sử dụng vân tay trình duyệt và kiểm tra IP để xác thực
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>• Xác thực bằng vân tay trình duyệt</p>
                      <p>• Kiểm tra IP cho phép</p>
                      <p>• Lưu lịch sử vào localStorage</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAttendance(false)}
                    disabled={submitting}
                    className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Điểm danh ngay'}
                  </button>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Điểm danh với tài khoản Google
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Đăng nhập bằng Google để có lịch sử điểm danh đầy đủ
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>• Xác thực bằng Google (@ou.edu.vn)</p>
                    <p>• Lưu lịch sử vào database</p>
                    <p>• Báo cáo chi tiết</p>
                  </div>
                </div>
                {currentUser ? (
                  <button
                    onClick={() => handleAttendance(true)}
                    disabled={submitting}
                    className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Điểm danh với Google'}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-secondary px-8 py-3 text-lg"
                  >
                    Đăng nhập Google
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Thông tin xác thực
            </h4>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Vân tay trình duyệt: {fingerprint.substring(0, 20)}...</p>
              <p>IP hiện tại: Đang kiểm tra...</p>
              <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}

export default Attendance
