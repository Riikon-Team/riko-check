import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvent } from '../contexts/EventContext'
import toast from 'react-hot-toast'

function EventCreate() {
  const navigate = useNavigate()
  const { createEvent } = useEvent()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    types: [],
    requiresAuth: false,
    ipAllowList: '',
    startAt: '',
    endAt: '',
    nonceTtl: 300
  })
  
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.startAt || !formData.endAt) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    setLoading(true)
    
    try {
      const eventData = {
        ...formData,
        ipAllowList: formData.ipAllowList ? formData.ipAllowList.split(',').map(ip => ip.trim()) : [],
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString()
      }

      const newEvent = await createEvent(eventData)
      if (newEvent) {
        toast.success('Tạo sự kiện thành công!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tạo sự kiện mới
        </h1>
        <p className="text-gray-600">
          Tạo sự kiện điểm danh với các tùy chọn bảo mật và cấu hình
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên sự kiện *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Nhập tên sự kiện"
                required
              />
            </div>

            <div>
              <label htmlFor="types" className="block text-sm font-medium text-gray-700 mb-2">
                Loại sự kiện
              </label>
              <input
                type="text"
                id="types"
                name="types"
                value={formData.types.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  types: e.target.value.split(',').map(type => type.trim()).filter(Boolean)
                }))}
                className="input-field"
                placeholder="Họp, Học tập, Sự kiện..."
              />
              <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả sự kiện
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Mô tả chi tiết về sự kiện..."
            />
          </div>
        </div>

        {/* Time Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thời gian</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian bắt đầu *
              </label>
              <input
                type="datetime-local"
                id="startAt"
                name="startAt"
                value={formData.startAt}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian kết thúc *
              </label>
              <input
                type="datetime-local"
                id="endAt"
                name="endAt"
                value={formData.endAt}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt bảo mật</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresAuth"
                name="requiresAuth"
                checked={formData.requiresAuth}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresAuth" className="ml-2 block text-sm text-gray-900">
                Yêu cầu đăng nhập Google để điểm danh
              </label>
            </div>

            <div>
              <label htmlFor="ipAllowList" className="block text-sm font-medium text-gray-700 mb-2">
                Danh sách IP được phép
              </label>
              <input
                type="text"
                id="ipAllowList"
                name="ipAllowList"
                value={formData.ipAllowList}
                onChange={handleChange}
                className="input-field"
                placeholder="192.168.1.1, 10.0.0.0/24"
              />
              <p className="text-xs text-gray-500 mt-1">
                Để trống để cho phép tất cả IP. Hỗ trợ IP đơn và CIDR notation
              </p>
            </div>

            <div>
              <label htmlFor="nonceTtl" className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian sống của nonce (giây)
              </label>
              <input
                type="number"
                id="nonceTtl"
                name="nonceTtl"
                value={formData.nonceTtl}
                onChange={handleChange}
                className="input-field"
                min="60"
                max="3600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Thời gian hợp lệ của token điểm danh (60-3600 giây)
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventCreate
