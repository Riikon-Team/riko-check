import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { adminAPI } from '../utils/apiUtils'

function PermissionRequestForm() {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    role: '',
    reason: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.role || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    
    try {
      const requestData = {
        userId: currentUser.uid,
        fullName: formData.fullName,
        role: formData.role,
        reason: formData.reason,
        notes: formData.notes
      }

      await adminAPI.requestPermission(requestData)
      toast.success('Đã gửi yêu cầu quyền tạo sự kiện!')
      setFormData({
        fullName: currentUser?.displayName || '',
        role: '',
        reason: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error requesting permission:', error)
      // Error handling is done in apiUtils
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Hướng dẫn</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Vui lòng điền đầy đủ thông tin để admin có thể xem xét yêu cầu của bạn:</p>
              <ul className="mt-2 list-disc list-inside">
                <li><strong>Họ tên:</strong> Tên đầy đủ của bạn</li>
                <li><strong>Vai trò:</strong> Vai trò hiện tại (sinh viên, giảng viên, nhân viên...)</li>
                <li><strong>Lý do:</strong> Lý do bạn cần quyền tạo sự kiện</li>
                <li><strong>Ghi chú:</strong> Thông tin bổ sung (không bắt buộc)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Họ tên đầy đủ *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="input-field"
            placeholder="Nhập họ tên đầy đủ"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Vai trò hiện tại *
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field"
            placeholder="Ví dụ: Sinh viên, Giảng viên, Nhân viên..."
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
          Lý do cần quyền tạo sự kiện *
        </label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows={4}
          className="input-field"
          placeholder="Giải thích lý do bạn cần quyền tạo sự kiện..."
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú bổ sung
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input-field"
          placeholder="Thông tin bổ sung (không bắt buộc)..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Có thể thêm thông tin về các sự kiện bạn dự định tổ chức, kinh nghiệm tổ chức sự kiện...
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </form>
  )
}

export default PermissionRequestForm
