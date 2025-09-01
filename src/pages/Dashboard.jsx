import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEvent } from '../contexts/EventContext'
import toast from 'react-hot-toast'
import ActionMenu from '../components/ActionMenu'
import { formatDateShort, formatTimeShort } from '../utils/dateUtils'

function Dashboard() {
  const { currentUser, userRole, isApproved, canCreateEvents } = useAuth()
  const { events, fetchEvents, loading } = useEvent()
  const [userEvents, setUserEvents] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (events.length > 0) {
      if (userRole === 'admin') {
        setUserEvents(events)
      } else {
        setUserEvents(events.filter(event => event.creator_id === currentUser?.uid))
      }
    }
  }, [events, userRole, currentUser])

  if (!canCreateEvents && userRole !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Chưa có quyền tạo sự kiện
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Tài khoản của bạn chưa được cấp quyền tạo sự kiện. Vui lòng yêu cầu quyền trong trang Profile.
            </p>
            <Link
              to="/profile"
              className="btn-primary"
            >
              Yêu cầu quyền
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activeEvents = userEvents.filter(event => 
    new Date(event.start_at) <= new Date() && new Date(event.end_at) >= new Date()
  )
  const upcomingEvents = userEvents.filter(event => new Date(event.start_at) > new Date())
  const pastEvents = userEvents.filter(event => new Date(event.end_at) < new Date())

  return (
    <div className="max-w-7xl mx-auto">
      {/* Compact Header - 1 dòng */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold  dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm  dark:text-gray-400">
            Chào mừng {currentUser?.displayName}
          </p>
        </div>
        
        {/* Nút hành động sát trái */}
        <div className="flex space-x-3">
          <Link
            to="/event/create"
            className="btn-primary text-sm px-4 py-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo sự kiện
          </Link>
          
          {userRole === 'admin' && (
            <Link
              to="/admin"
              className="btn-secondary text-sm px-4 py-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row - gọn gàng */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm  dark:text-gray-400">Tổng sự kiện</p>
              <p className="text-xl font-semibold  dark:text-gray-100">{userEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm  dark:text-gray-400">Đang diễn ra</p>
              <p className="text-xl font-semibold  dark:text-gray-100">{activeEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm  dark:text-gray-400">Sắp diễn ra</p>
              <p className="text-xl font-semibold  dark:text-gray-100">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Đang diễn ra ({activeEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Sắp diễn ra ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Đã kết thúc ({pastEvents.length})
          </button>
        </nav>
      </div>

      {/* Tab Content - min-height 100vh */}
      <div className="min-h-[calc(100vh-300px)]">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-4">Tất cả sự kiện</h3>
                <EventsTable events={userEvents} />
              </div>
            )}
            {activeTab === 'active' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-4">Sự kiện đang diễn ra</h3>
                <EventsTable events={activeEvents} />
              </div>
            )}
            {activeTab === 'upcoming' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-4">Sự kiện sắp diễn ra</h3>
                <EventsTable events={upcomingEvents} />
              </div>
            )}
            {activeTab === 'past' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold  dark:text-gray-100 mb-4">Sự kiện đã kết thúc</h3>
                <EventsTable events={pastEvents} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Events Table Component
function EventsTable({ events }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium  dark:text-gray-100 mb-2">Chưa có sự kiện nào</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Bắt đầu tạo sự kiện đầu tiên của bạn
        </p>
        <Link
          to="/event/create"
          className="btn-primary"
        >
          Tạo sự kiện đầu tiên
        </Link>
      </div>
    )
  }

  return (
    <div className="">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Tên sự kiện
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Thời gian
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium  dark:text-gray-100">
                    <Link to={`/event/${event.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">{event.name}</Link>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{event.description}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm  dark:text-gray-100">
                  {formatDateShort(event.start_at)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTimeShort(event.start_at)} - {formatTimeShort(event.end_at)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(event.start_at) > new Date() ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Sắp diễn ra
                  </span>
                ) : new Date(event.end_at) < new Date() ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Đã kết thúc
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Đang diễn ra
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                      label: 'Sửa sự kiện',
                      icon: (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ),
                      onClick: () => window.location.href = `/event/${event.id}/edit`
                    },
                    {
                      label: 'Quản lý điểm danh',
                      icon: (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      ),
                      onClick: () => window.location.href = `/attendance-management/${event.id}`
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard
