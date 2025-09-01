import React, { useState } from 'react';

function IPAllowList({ value = [], onChange, disabled = false }) {
  const [newIP, setNewIP] = useState('');

  const addIP = () => {
    if (newIP.trim() && !value.includes(newIP.trim())) {
      onChange([...value, newIP.trim()]);
      setNewIP('');
    }
  };

  const removeIP = (index) => {
    const newList = value.filter((_, i) => i !== index);
    onChange(newList);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIP();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Danh sách IP được phép (để trống nếu không giới hạn)
      </label>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newIP}
          onChange={(e) => setNewIP(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập IP (ví dụ: 192.168.1.1)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={addIP}
          disabled={disabled || !newIP.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Thêm
        </button>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">IP được phép:</p>
          <div className="flex flex-wrap gap-2">
            {value.map((ip, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-md"
              >
                <span className="text-sm">{ip}</span>
                <button
                  type="button"
                  onClick={() => removeIP(index)}
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
        * Nếu không nhập IP nào, tất cả IP đều được phép điểm danh
      </p>
    </div>
  );
}

export default IPAllowList;
