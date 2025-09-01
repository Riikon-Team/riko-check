import React, { useState } from 'react';

function CustomFields({ value = {}, onChange, disabled = false }) {
  const [newField, setNewField] = useState({ key: '', label: '', type: 'text', required: false });

  const addField = () => {
    if (newField.key.trim() && newField.label.trim()) {
      const updatedFields = {
        ...value,
        [newField.key]: {
          label: newField.label,
          type: newField.type,
          required: newField.required
        }
      };
      onChange(updatedFields);
      setNewField({ key: '', label: '', type: 'text', required: false });
    }
  };

  const removeField = (key) => {
    const { [key]: removed, ...rest } = value;
    onChange(rest);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addField();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Trường tùy chỉnh (câu hỏi, thông tin bổ sung)
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          value={newField.key}
          onChange={(e) => setNewField({ ...newField, key: e.target.value })}
          onKeyPress={handleKeyPress}
          placeholder="Tên trường (ví dụ: mssv)"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
        <input
          type="text"
          value={newField.label}
          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          onKeyPress={handleKeyPress}
          placeholder="Nhãn hiển thị (ví dụ: MSSV)"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
        <select
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        >
          <option value="text">Văn bản</option>
          <option value="textarea">Đoạn văn</option>
          <option value="number">Số</option>
          <option value="email">Email</option>
          <option value="select">Lựa chọn</option>
        </select>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newField.required}
            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={disabled}
          />
          <label className="text-sm text-gray-700">Bắt buộc</label>
        </div>
      </div>

      <button
        type="button"
        onClick={addField}
        disabled={disabled || !newField.key.trim() || !newField.label.trim()}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Thêm trường
      </button>

      {Object.keys(value).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Trường đã thêm:</p>
          <div className="space-y-2">
            {Object.entries(value).map(([key, field]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
              >
                <div className="flex-1">
                  <span className="font-medium text-sm">{field.label}</span>
                  <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                  {field.required && (
                    <span className="text-xs text-red-600 ml-2">*</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeField(key)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        * Các trường này sẽ được hiển thị khi người dùng điểm danh
      </p>
    </div>
  );
}

export default CustomFields;
