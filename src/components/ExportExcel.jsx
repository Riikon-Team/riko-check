import React, { useState } from 'react'
import { getOUEmailInfo } from '../utils/emailUtils'
import toast from 'react-hot-toast'
import ActionMenu from './ActionMenu'

function ExportExcel({ event, attendances }) {
  const [exporting, setExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const exportToExcel = async (onlyValid = true) => {
    setExporting(true)
    setShowExportModal(false)

    try {
      // Lọc dữ liệu theo yêu cầu
      const filteredAttendances = onlyValid
        ? attendances.filter(a => a.is_valid)
        : attendances

      // Kiểm tra dữ liệu đầu vào
      if (!event || !filteredAttendances || filteredAttendances.length === 0) {
        throw new Error('Không có dữ liệu để xuất')
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = prepareExcelData(event, filteredAttendances)

      // Tạo file Excel
      const workbook = await createExcelFile(excelData)

      // Tải xuống file
      await downloadExcelFile(workbook, event.name, onlyValid)

      toast.success('Xuất Excel thành công!')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      toast.error(`Lỗi xuất Excel: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  const prepareExcelData = (event, attendances) => {
    const headers = ['STT', 'Tên', 'Email', 'MSSV', 'IP Client', 'IP Public', 'User Agent', 'Thời gian điểm danh', 'Trạng thái', 'Hợp lệ']

    // Thêm các trường tùy chỉnh từ event
    if (event.custom_fields && Array.isArray(event.custom_fields) && event.custom_fields.length > 0) {
      event.custom_fields.forEach(field => {
        const fieldLabel = field.title || field.label || 'Custom Field'
        headers.push(fieldLabel)
      })
    }

    const rows = attendances.map((attendance, index) => {
      try {
        const ouInfo = getOUEmailInfo(attendance.email || attendance.user_email)
        const row = [
          index + 1,
          ouInfo.isStudent && ouInfo.name ? ouInfo.name : (attendance.display_name || attendance.user_display_name || 'Không có tên'),
          attendance.email || attendance.user_email || 'Không có email',
          ouInfo.isStudent && ouInfo.mssv ? ouInfo.mssv : 'Không có MSSV',
          attendance.ip || 'Không có IP',
          attendance.public_ip || 'Không có IP Public',
          attendance.user_agent || 'Không có User Agent',
          attendance.created_at ? new Date(attendance.created_at).toLocaleString('vi-VN') : 'Không có thời gian',
          getStatusText(attendance.status),
          attendance.is_valid ? 'Có' : 'Không'
        ]

        // Thêm dữ liệu tùy chỉnh
        if (event.custom_fields && Array.isArray(event.custom_fields) && event.custom_fields.length > 0) {
          event.custom_fields.forEach(field => {
            const fieldLabel = field.label || field.title || 'field'
            const customValue = attendance.custom_data?.[fieldLabel] || ''
            row.push(customValue)
          })
        }

        return row
      } catch (error) {
        console.error('Error processing attendance row:', error, attendance)
        // Trả về row mặc định nếu có lỗi
        return [
          index + 1,
          'Lỗi xử lý dữ liệu',
          attendance.email || attendance.user_email || 'Không có email',
          'Không có MSSV',
          attendance.ip || 'Không có IP',
          attendance.public_ip || 'Không có IP Public',
          attendance.user_agent || 'Không có User Agent',
          'Không có thời gian',
          getStatusText(attendance.status),
          attendance.is_valid ? 'Có' : 'Không'
        ]
      }
    })

    return { headers, rows }
  }

  const createExcelFile = async (data) => {
    try {
      // Sử dụng thư viện xlsx để tạo file Excel
      const XLSX = await import('xlsx')

      const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows])

      // Tùy chỉnh style cho header
      worksheet['!cols'] = data.headers.map(() => ({ width: 15 }))

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh')

      return workbook
    } catch (error) {
      console.error('Error creating Excel file:', error)
      throw new Error('Không thể tạo file Excel')
    }
  }

  const downloadExcelFile = async (workbook, eventName, onlyValid) => {
    try {
      // Sử dụng dynamic import để đảm bảo tương thích với browser
      const XLSX = await import('xlsx')

      // Tạo tên file an toàn
      const safeEventName = eventName.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'Event'
      const suffix = onlyValid ? 'HopLe' : 'TatCa'
      const fileName = `${safeEventName}_DiemDanh_${suffix}_${new Date().toISOString().split('T')[0]}.xlsx`

      // Xuất file sử dụng writeFileAsync để tránh lỗi trong browser
      try {
        XLSX.writeFile(workbook, fileName)
      } catch (writeError) {
        console.warn('writeFile failed, using fallback method:', writeError)
        // Fallback: sử dụng writeFileAsync nếu writeFile không hoạt động
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([wbout], { type: 'application/octet-stream' })

        // Tạo link download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading Excel file:', error)
      throw new Error('Không thể tải xuống file Excel')
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã phê duyệt'
      case 'rejected':
        return 'Đã từ chối'
      case 'pending':
      default:
        return 'Chờ phê duyệt'
    }
  }

  if (!attendances || attendances.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">

      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <ActionMenu
          actions={[
            {
              label: 'Xuất điểm danh hợp lệ',
              icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              onClick: () => exportToExcel(true)
            },
            {
              label: 'Xuất tất cả điểm danh',
              icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              onClick: () => exportToExcel(false)
            }
          ]}
        />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium  dark:text-gray-100 mb-4 text-center">
                Chọn dữ liệu xuất Excel
              </h3>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => exportToExcel(true)}
                  className="w-full btn-primary text-center"
                >
                  Chỉ xuất điểm danh hợp lệ
                </button>
                <button
                  onClick={() => exportToExcel(false)}
                  className="w-full btn-secondary text-center"
                >
                  Xuất tất cả điểm danh
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowExportModal(false)}
                  className=" hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportExcel
