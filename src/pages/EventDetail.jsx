import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function EventDetail() {
  const { id: eventId } = useParams()
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attendances, setAttendances] = useState([])
  const [showAttendances, setShowAttendances] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
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

  const fetchAttendances = async () => {
    try {
      const response = await fetch(`/api/attendance/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${await currentUser?.getIdToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAttendances(data)
      }
    } catch (error) {
      console.error('Error fetching attendances:', error)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser?.getIdToken()}`
        }
      })

      if (response.ok) {
        toast.success('Xóa sự kiện thành công!')
        navigate('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Xóa sự kiện thất bại!')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Lỗi xóa sự kiện!')
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

  const isCreator = currentUser?.uid === event.creator_id
  const isAdmin = userRole === 'admin'
  const canEdit = isCreator || isAdmin
  const now = new Date()
  const startTime = new Date(event.start_at)
  const endTime = new Date(event.end_at)
  const isActive = now >= startTime && now <= endTime
  const isUpcoming = now < startTime
  const isEnded = now > endTime

  return (
    <div className="max-w-4xl mx-auto">
      {/* Event Header */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.name}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {event.description}
            </p>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              <Link
                to={`/event/${eventId}/edit`}
                className="btn-secondary"
              >
                Sửa
              </Link>
              <button
                onClick={handleDeleteEvent}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        {/* Event Status */}
        <div className="mb-6">
          {isActive ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Đang diễn ra
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Sắp diễn ra
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              Đã kết thúc
            </span>
          )}
        </div>

        {/* Event Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin thời gian</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Bắt đầu:</span>
                <span className="ml-2 text-gray-900">
                  {startTime.toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Kết thúc:</span>
                <span className="ml-2 text-gray-900">
                  {endTime.toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Thời lượng:</span>
                <span className="ml-2 text-gray-900">
                  {Math.round((endTime - startTime) / (1000 * 60 * 60))} giờ
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cài đặt bảo mật</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Chế độ điểm danh:</span>
                <span className="ml-2 text-gray-900">
                  {event.requires_auth ? 'Yêu cầu đăng nhập' : 'Không cần đăng nhập'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">IP Allow List:</span>
                <span className="ml-2 text-gray-900">
                  {event.ip_allow_list && event.ip_allow_list.length > 0 
                    ? event.ip_allow_list.join(', ') 
                    : 'Tất cả IP'
                  }
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Nonce TTL:</span>
                <span className="ml-2 text-gray-900">
                  {event.nonce_ttl} giây
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Types */}
        {event.types && event.types.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Loại sự kiện</h3>
            <div className="flex flex-wrap gap-2">
              {event.types.map((type, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Creator Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Tạo bởi: <span className="text-gray-900">{event.creator_name}</span>
          </div>
          <div className="text-sm text-gray-500">
            Tạo lúc: <span className="text-gray-900">
              {new Date(event.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hành động</h2>
        
        <div className="flex flex-wrap gap-4">
          {isActive && (
            <Link
              to={`/attendance/${eventId}`}
              className="btn-primary"
            >
              Điểm danh ngay
            </Link>
          )}
          
          {canEdit && (
            <button
              onClick={() => {
                setShowAttendances(!showAttendances)
                if (!showAttendances) {
                  fetchAttendances()
                }
              }}
              className="btn-secondary"
            >
              {showAttendances ? 'Ẩn danh sách' : 'Xem danh sách điểm danh'}
            </button>
          )}
          
          <Link
            to="/dashboard"
            className="btn-secondary"
          >
            Quay về Dashboard
          </Link>
        </div>
      </div>

      {/* Attendances List */}
      {showAttendances && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Danh sách điểm danh ({attendances.length})
          </h2>
          
          {attendances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.display_name || 'Khách'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attendance.email || 'Không có email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(attendance.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có ai điểm danh
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EventDetail
