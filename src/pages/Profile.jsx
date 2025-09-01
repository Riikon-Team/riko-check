import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function Profile() {
  const { currentUser, userRole, isApproved } = useAuth()
  const [attendanceHistory, setAttendanceHistory] = useState([])

  useEffect(() => {
    loadAttendanceHistory()
  }, [])

  const loadAttendanceHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('attendanceHistory') || '[]')
      setAttendanceHistory(history)
    } catch (error) {
      console.error('Error loading attendance history:', error)
    }
  }

  const clearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử điểm danh?')) {
      localStorage.removeItem('attendanceHistory')
      setAttendanceHistory([])
      toast.success('Đã xóa lịch sử điểm danh')
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin cá nhân và xem lịch sử hoạt động
        </p>
      </div>

      {/* Profile Info */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h2>
        
        <div className="flex items-start space-x-6">
          {currentUser.photoURL && (
            <img
              className="h-24 w-24 rounded-full"
              src={currentUser.photoURL}
              alt={currentUser.displayName}
            />
          )}
          
          <div className="flex-1">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hiển thị
                </label>
                <div className="text-gray-900 font-medium">
                  {currentUser.displayName || 'Chưa có tên'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="text-gray-900">
                  {currentUser.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  userRole === 'admin' ? 'bg-red-100 text-red-800' :
                  userRole === 'organizer' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userRole === 'admin' ? 'Admin' :
                   userRole === 'organizer' ? 'Organizer' : 'User'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái phê duyệt
                </label>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isApproved ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID người dùng
              </label>
              <div className="text-sm text-gray-500 font-mono">
                {currentUser.uid}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      {userRole === 'organizer' && !isApproved && (
        <div className="card mb-8 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Tài khoản chưa được phê duyệt
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Tài khoản của bạn đang chờ admin phê duyệt để có thể tạo sự kiện. 
                  Vui lòng liên hệ admin để được hỗ trợ.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Lịch sử điểm danh ({attendanceHistory.length})
          </h2>
          {attendanceHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Xóa lịch sử
            </button>
          )}
        </div>
        
        {attendanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sự kiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fingerprint
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.eventName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {record.eventId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {record.fingerprint.substring(0, 20)}...
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử điểm danh</h3>
            <p className="text-gray-500">
              Lịch sử điểm danh sẽ được hiển thị ở đây khi bạn tham gia các sự kiện
            </p>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="mt-8 text-center">
        <div className="text-sm text-gray-600">
          <p>Để thay đổi thông tin cá nhân, vui lòng cập nhật trong tài khoản Google của bạn.</p>
          <p className="mt-2">
            Nếu cần hỗ trợ, vui lòng liên hệ admin hoặc gửi email đến: 
            <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-800 ml-1">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile
