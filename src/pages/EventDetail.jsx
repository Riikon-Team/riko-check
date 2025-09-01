import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import QRCodeComponent from '../components/QRCode'
import ActionMenu from '../components/ActionMenu'
import { eventsAPI } from '../utils/apiUtils'
import { formatDateTimeShort } from '../utils/dateUtils'

function EventDetail() {
  const params = useParams()
  const eventId = params.id || params.eventId
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) {
      toast.error('Không tìm thấy ID sự kiện')
      navigate('/dashboard')
      return
    }
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const eventData = await eventsAPI.getById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error('Error fetching event:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return

    try {
      await eventsAPI.delete(eventId)
      toast.success('Xóa sự kiện thành công!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting event:', error)
      // Error handling is done in apiUtils
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
    <div className="max-w-6xl mx-auto">
      {/* Header với nút back */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2  dark:text-gray-400 hover: dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold  dark:text-gray-100">
            Chi tiết sự kiện
          </h1>
        </div>
        
        {canEdit && (
          <ActionMenu
            actions={[
              {
                label: 'Sửa sự kiện',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                onClick: () => navigate(`/event/${eventId}/edit`)
              },
              {
                label: 'Quản lý điểm danh',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
                onClick: () => navigate(`/attendance-management/${eventId}`)
              },
              {
                label: 'Xóa sự kiện',
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ),
                onClick: handleDeleteEvent,
                danger: true
              }
            ]}
          />
        )}
      </div>

      {/* Event Header */}
      <div className="card mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold  dark:text-gray-100 mb-2">
            {event.name}
          </h1>
          <p className="text-lg  dark:text-gray-400 mb-4">
            {event.description}
          </p>
        </div>

        {/* Event Status */}
        <div className="text-center mb-6">
          {isActive ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Đang diễn ra
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Sắp diễn ra
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              Đã kết thúc
            </span>
          )}
        </div>

        {/* Event Details and QR Code */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-3">Thông tin thời gian</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bắt đầu:</span>
                    <span className="ml-2  dark:text-gray-100">
                      {formatDateTimeShort(startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kết thúc:</span>
                    <span className="ml-2  dark:text-gray-100">
                      {formatDateTimeShort(endTime)}
                    </span>
                  </div>
                  {/* <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời lượng:</span>
                    <span className="ml-2  dark:text-gray-100">
                      {Math.round((endTime - startTime) / (1000 * 60 * 60))} giờ
                    </span>
                  </div> */}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-3">Cài đặt bảo mật</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Chế độ điểm danh:</span>
                    <span className="ml-2  dark:text-gray-100">
                      {event.requires_auth ? 'Yêu cầu đăng nhập' : 'Không cần đăng nhập'}
                    </span>
                  </div>
                  {/* <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Allow List:</span>
                    <span className="ml-2  dark:text-gray-100">
                      {event.ip_allow_list && event.ip_allow_list.length > 0 
                        ? event.ip_allow_list.join(', ') 
                        : 'Tất cả IP'
                      }
                    </span>
                  </div> */}
                  {/* <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nonce TTL:</span>
                    <span className="ml-2  dark:text-gray-100">
                      {event.nonce_ttl} giây
                    </span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Event Types */}
            {event.types && event.types.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-3">Loại sự kiện</h3>
                <div className="flex flex-wrap gap-2">
                  {event.types.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={() => window.location.href = `/attendance/${eventId}`}>Điểm danh</button>


            {/* Creator Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tạo bởi: <span className=" dark:text-gray-100">{event.creator_name}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tạo lúc: <span className=" dark:text-gray-100">
                  {formatDateTimeShort(new Date(event.created_at))}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {canEdit && (
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold  dark:text-gray-100 mb-3">QR Code điểm danh</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <QRCodeComponent 
                    url={event.qr_code || `${window.location.origin}/attendance/${eventId}`}
                    size={200}
                  />
                </div>
                <div className="mb-4">
                  <p className="text-sm  dark:text-gray-400 mb-2">Link để điểm danh:</p>
                  <p className="text-sm font-mono  dark:text-gray-100 break-all bg-white dark:bg-gray-700 p-2 rounded border">
                    {event.qr_code || `${window.location.origin}/attendance/${eventId}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const link = event.qr_code || `${window.location.origin}/attendance/${eventId}`
                    navigator.clipboard.writeText(link)
                    toast.success('Đã sao chép link!')
                  }}
                  className="btn-primary w-full"
                >
                  Sao chép link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetail
