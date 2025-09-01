import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEvent } from '../contexts/EventContext'
import ActionMenu from '../components/ActionMenu'

function Home() {
  const { currentUser } = useAuth()
  const { events, fetchEvents } = useEvent()
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    fetchEvents({ publicOnly: true })
  }, [fetchEvents])

  useEffect(() => {
    if (events.length > 0) {
      // Lấy 6 sự kiện gần nhất
      const sortedEvents = [...events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setRecentEvents(sortedEvents.slice(0, 6))
    }
  }, [events])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold  dark:text-gray-100 mb-6">
              RikoCheck
            </h1>
            <p className="text-xl md:text-2xl  dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Hệ thống quản lý điểm danh thông minh, giúp tổ chức sự kiện một cách hiệu quả và chính xác
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Vào Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Bắt đầu ngay
                </Link>
              )}
              <Link
                to="/event/create"
                className="btn-secondary text-lg px-8 py-4"
              >
                Tạo sự kiện
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold  dark:text-gray-100 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg  dark:text-gray-400">
              Những gì RikoCheck mang lại cho bạn
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold  dark:text-gray-100 mb-2">
                Điểm danh thông minh
              </h3>
              <p className=" dark:text-gray-400">
                Sử dụng QR code và xác thực IP để điểm danh chính xác, tránh gian lận
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold  dark:text-gray-100 mb-2">
                Quản lý dễ dàng
              </h3>
              <p className=" dark:text-gray-400">
                Giao diện trực quan, báo cáo chi tiết và xuất dữ liệu Excel một cách đơn giản
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold  dark:text-gray-100 mb-2">
                Bảo mật cao
              </h3>
              <p className=" dark:text-gray-400">
                Xác thực Google, kiểm soát IP và mã hóa dữ liệu để đảm bảo an toàn thông tin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold  dark:text-gray-100 mb-4">
              Sự kiện gần đây
            </h2>
            <p className="text-lg  dark:text-gray-400">
              Khám phá các sự kiện đang diễn ra
            </p>
          </div>
          
          {recentEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((event) => {
                const now = new Date()
                const startTime = new Date(event.start_at)
                const endTime = new Date(event.end_at)
                const isActive = now >= startTime && now <= endTime
                const isUpcoming = now < startTime
                
                return (
                  <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow relative">
                    <div className="absolute top-4 right-4">
                      <ActionMenu
                        actions={[
                          {
                            label: 'Xem chi tiết',
                            icon: (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ),
                            onClick: () => window.location.href = `/event/${event.id}`
                          },
                          {
                            label: 'Điểm danh',
                            icon: (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ),
                            onClick: () => window.location.href = `/attendance/${event.id}`
                          }
                        ]}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold  dark:text-gray-100 mb-2 pr-16">
                        {event.name}
                      </h3>
                      <p className=" dark:text-gray-400 text-sm">
                        {event.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Bắt đầu:</span> {startTime.toLocaleDateString('vi-VN')} {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Kết thúc:</span> {endTime.toLocaleDateString('vi-VN')} {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        isUpcoming ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {isActive ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                      </span>
                      
                      <button className="btn-primary" onClick={() => window.location.href = `/attendance/${event.id}`}>Điểm danh</button> 
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium  dark:text-gray-100 mb-2">Chưa có sự kiện nào</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Hãy tạo sự kiện đầu tiên để bắt đầu sử dụng RikoCheck
              </p>
              {currentUser && (
                <Link
                  to="/event/create"
                  className="btn-primary"
                >
                  Tạo sự kiện đầu tiên
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
