import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { eventsAPI, attendanceAPI } from '../utils/apiUtils'
import { getOUEmailInfo } from '../utils/emailUtils'
import { formatDateTimeShort } from '../utils/dateUtils'
import ActionMenu from '../components/ActionMenu'
import ExportExcel from '../components/ExportExcel'

function AttendanceManagement() {
  const { eventId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterValid, setFilterValid] = useState(true)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [actionType, setActionType] = useState('')
  const [actionNotes, setActionNotes] = useState('')
  
  // Bulk operations state
  const [selectedAttendances, setSelectedAttendances] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [showBulkActionModal, setShowBulkActionModal] = useState(false)
  const [bulkActionType, setBulkActionType] = useState('')
  const [bulkActionNotes, setBulkActionNotes] = useState('')

  useEffect(() => {
    fetchEvent()
    fetchAttendances()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const eventData = await eventsAPI.getById(eventId)
      if (eventData) {
        setEvent(eventData)
      } else {
        toast.error('Không thể tải thông tin sự kiện. Vui lòng đăng nhập lại.')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      if (error.message === 'Unauthorized') {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        navigate('/dashboard')
      } else {
        toast.error('Có lỗi xảy ra khi tải thông tin sự kiện')
        navigate('/dashboard')
      }
    }
  }

  const fetchAttendances = async () => {
    try {
      setLoading(true)
      const data = await attendanceAPI.getByEvent(eventId)
      setAttendances(data || [])
    } catch (error) {
      console.error('Error fetching attendances:', error)
      toast.error('Không thể tải danh sách điểm danh')
      setAttendances([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (attendance, type) => {
    setSelectedAttendance(attendance)
    setActionType(type)
    setActionNotes('')
    setShowActionModal(true)
  }

  const confirmAction = async () => {
    if (!selectedAttendance) return

    try {
      if (actionType === 'delete') {
        await attendanceAPI.delete(selectedAttendance.id)
        toast.success('Xóa điểm danh thành công!')
      } else {
        await attendanceAPI.approve(selectedAttendance.id, {
          status: actionType,
          notes: actionNotes
        })
        toast.success(`Đã ${actionType === 'approved' ? 'phê duyệt' : 'từ chối'} điểm danh!`)
      }
      
      fetchAttendances()
      setShowActionModal(false)
    } catch (error) {
      console.error('Error performing action:', error)
      toast.error('Có lỗi xảy ra khi thực hiện hành động')
    }
  }

  // Bulk operations functions
  const handleSelectAll = (checked) => {
    setSelectAll(checked)
    if (checked) {
      const allIds = new Set(filteredAttendances.map(a => a.id))
      setSelectedAttendances(allIds)
    } else {
      setSelectedAttendances(new Set())
    }
  }

  const handleSelectAttendance = (attendanceId, checked) => {
    const newSelected = new Set(selectedAttendances)
    if (checked) {
      newSelected.add(attendanceId)
    } else {
      newSelected.delete(attendanceId)
    }
    setSelectedAttendances(newSelected)
    
    // Update select all state
    if (newSelected.size === filteredAttendances.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }

  const openBulkActionModal = (actionType) => {
    if (selectedAttendances.size === 0) {
      toast.error('Vui lòng chọn ít nhất một điểm danh')
      return
    }
    setBulkActionType(actionType)
    setBulkActionNotes('')
    setShowBulkActionModal(true)
  }

  const confirmBulkAction = async () => {
    if (selectedAttendances.size === 0) return

    try {
      const selectedIds = Array.from(selectedAttendances)
      
      if (bulkActionType === 'delete') {
        // Delete multiple attendances
        await Promise.all(selectedIds.map(id => attendanceAPI.delete(id)))
        toast.success(`Đã xóa ${selectedIds.length} điểm danh thành công!`)
      } else {
        // Approve/reject multiple attendances
        await Promise.all(selectedIds.map(id => 
          attendanceAPI.approve(id, {
            status: bulkActionType,
            notes: bulkActionNotes
          })
        ))
        toast.success(`Đã ${bulkActionType === 'approved' ? 'phê duyệt' : 'từ chối'} ${selectedIds.length} điểm danh!`)
      }
      
      // Reset selection and refresh
      setSelectedAttendances(new Set())
      setSelectAll(false)
      setShowBulkActionModal(false)
      fetchAttendances()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Có lỗi xảy ra khi thực hiện hành động hàng loạt')
    }
  }

  const filteredAttendances = filterValid 
    ? attendances.filter(a => a.is_valid)
    : attendances

  const validCount = attendances.filter(a => a.is_valid).length
  const invalidCount = attendances.filter(a => !a.is_valid).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
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
          <div>
            <h1 className="text-2xl font-bold  dark:text-gray-100">
              Quản lý điểm danh
            </h1>
            <p className="text-sm  dark:text-gray-400">
              {event?.name}
            </p>
          </div>
        </div>
        
                 <div className="flex items-center space-x-3">
           <select
             value={filterValid ? 'valid' : 'all'}
             onChange={(e) => setFilterValid(e.target.value === 'valid')}
             className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800  dark:text-gray-100 text-sm"
           >
             <option value="valid">Chỉ hiển thị hợp lệ</option>
             <option value="all">Hiển thị tất cả</option>
           </select>
           
           {/* Bulk Actions */}
           {selectedAttendances.size > 0 && (
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-600 dark:text-gray-400">
                 Đã chọn: {selectedAttendances.size}
               </span>
               <button
                 onClick={() => openBulkActionModal('approved')}
                 className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
               >
                 Duyệt hàng loạt
               </button>
               <button
                 onClick={() => openBulkActionModal('rejected')}
                 className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
               >
                 Từ chối hàng loạt
               </button>
               <button
                 onClick={() => openBulkActionModal('delete')}
                 className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
               >
                 Xóa hàng loạt
               </button>
             </div>
           )}
           
           <ExportExcel event={event} attendances={attendances} />
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm  dark:text-gray-400">Tổng điểm danh</p>
              <p className="text-xl font-semibold  dark:text-gray-100">{attendances.length}</p>
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
              <p className="text-sm  dark:text-gray-400">Hợp lệ</p>
              <p className="text-xl font-semibold  dark:text-gray-100">{validCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm  dark:text-gray-400">Không hợp lệ</p>
              <p className="text-xl font-semibold  dark:text-gray-100">{invalidCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
               <div className="card">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-semibold  dark:text-gray-100">
               Danh sách điểm danh ({filteredAttendances.length})
             </h2>
             
             {/* Select All Checkbox */}
             <div className="flex items-center space-x-3">
               <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                 <input
                   type="checkbox"
                   checked={selectAll}
                   onChange={(e) => handleSelectAll(e.target.checked)}
                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                 />
                 <span>Chọn tất cả</span>
               </label>
               
               {selectedAttendances.size > 0 && (
                 <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                   {selectedAttendances.size} điểm danh đã chọn
                 </span>
               )}
             </div>
           </div>
        
        {filteredAttendances.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium  dark:text-gray-100 mb-2">Chưa có điểm danh nào</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có ai điểm danh cho sự kiện này
            </p>
          </div>
        ) : (
          <div className="">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     <input
                       type="checkbox"
                       checked={selectAll}
                       onChange={(e) => handleSelectAll(e.target.checked)}
                       className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                     />
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Người tham gia
                   </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Domain email
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
                                 {filteredAttendances.map((attendance) => {
                   const ouInfo = getOUEmailInfo(attendance.email || attendance.user_email)
                   const isSelected = selectedAttendances.has(attendance.id)
                   return (
                     <tr key={attendance.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                       isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                     }`}>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <input
                           type="checkbox"
                           checked={isSelected}
                           onChange={(e) => handleSelectAttendance(attendance.id, e.target.checked)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium  dark:text-gray-100">
                            {attendance.display_name || attendance.user_display_name || 'Không có tên'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {attendance.email || attendance.user_email || 'Không có email'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            MSSV: {ouInfo.isStudent && ouInfo.mssv ? ouInfo.mssv : 'Không có MSSV'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm  dark:text-gray-100">
                          Client: {attendance.ip || 'Không có IP'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Public: {attendance.public_ip || 'Không có IP Public'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm  dark:text-gray-100">
                        {formatDateTimeShort(attendance.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendance.email || attendance.user_email || 'Không có email'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendance.is_valid ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Đã bị từ chối
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionMenu
                          actions={[
                            ...(attendance.status === 'pending' ? [
                              {
                                label: 'Duyệt',
                                icon: (
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ),
                                onClick: () => handleAction(attendance, 'approved')
                              },
                              {
                                label: 'Từ chối',
                                icon: (
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ),
                                onClick: () => handleAction(attendance, 'rejected')
                              }
                            ] : []),
                            {
                              label: 'Xóa',
                              icon: (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              ),
                              onClick: () => handleAction(attendance, 'delete'),
                              danger: true
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

             {/* Bulk Action Modal */}
       {showBulkActionModal && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
             <div className="mt-3">
               <h3 className="text-lg font-medium  dark:text-gray-100 mb-4">
                 {bulkActionType === 'delete' ? 'Xóa hàng loạt' : 
                  bulkActionType === 'approved' ? 'Phê duyệt hàng loạt' : 'Từ chối hàng loạt'}
                 <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                   ({selectedAttendances.size} điểm danh)
                 </span>
               </h3>
               
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Ghi chú (tùy chọn)
                 </label>
                 <textarea
                   value={bulkActionNotes}
                   onChange={(e) => setBulkActionNotes(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700  dark:text-gray-100"
                   rows="3"
                   placeholder="Nhập ghi chú..."
                 />
               </div>

               <div className="flex justify-end space-x-3">
                 <button
                   onClick={() => setShowBulkActionModal(false)}
                   className="btn-secondary"
                 >
                   Hủy
                 </button>
                 <button
                   onClick={confirmBulkAction}
                   className={`${
                     bulkActionType === 'delete' ? 'btn-danger' : 'btn-primary'
                   }`}
                 >
                   {bulkActionType === 'delete' ? 'Xóa' : 
                    bulkActionType === 'approved' ? 'Phê duyệt' : 'Từ chối'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Action Modal */}
       {showActionModal && selectedAttendance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium  dark:text-gray-100 mb-4">
                {actionType === 'delete' ? 'Xóa điểm danh' : 
                 actionType === 'approved' ? 'Phê duyệt điểm danh' : 'Từ chối điểm danh'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700  dark:text-gray-100"
                  rows="3"
                  placeholder="Nhập ghi chú..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmAction}
                  className={`${
                    actionType === 'delete' ? 'btn-danger' : 'btn-primary'
                  }`}
                >
                  {actionType === 'delete' ? 'Xóa' : 
                   actionType === 'approved' ? 'Phê duyệt' : 'Từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceManagement
