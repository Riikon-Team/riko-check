import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEvent } from '../contexts/EventContext'

function Home() {
  const { events, fetchEvents, loading } = useEvent()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Hệ thống điểm danh online
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Giải pháp điểm danh thông minh với xác thực bằng vân tay và Google, 
          hỗ trợ cả hai chế độ: có đăng nhập và không cần đăng nhập.
        </p>
        <div className="space-x-4">
          <Link
            to="/attendance"
            className="btn-primary text-lg px-8 py-3"
          >
            Điểm danh ngay
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-lg px-8 py-3"
          >
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Tính năng nổi bật
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Điểm danh nhanh chóng</h3>
            <p className="text-gray-600">
              Điểm danh chỉ với một cú nhấp chuột, không cần đăng nhập phức tạp
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Bảo mật cao</h3>
            <p className="text-gray-600">
              Xác thực bằng vân tay và kiểm tra IP, đảm bảo tính chính xác
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Báo cáo chi tiết</h3>
            <p className="text-gray-600">
              Theo dõi và xuất báo cáo điểm danh một cách dễ dàng
            </p>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Sự kiện gần đây
        </h2>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>Bắt đầu: {new Date(event.start_at).toLocaleString('vi-VN')}</p>
                  <p>Kết thúc: {new Date(event.end_at).toLocaleString('vi-VN')}</p>
                </div>
                <Link
                  to={`/event/${event.id}`}
                  className="btn-primary w-full text-center"
                >
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Chưa có sự kiện nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
