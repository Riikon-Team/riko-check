import React, { useState, useRef, useEffect } from 'react'

function ActionMenu({ actions, position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'bottom-full left-0 mb-2'
      case 'top-right':
        return 'bottom-full right-0 mb-2'
      case 'bottom-left':
        return 'top-full left-0 mt-2'
      case 'bottom-right':
      default:
        return 'top-full right-0 mt-2'
    }
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2  dark:text-gray-400 hover: dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-[9999] ${getPositionClasses()} bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-48 py-1`}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center ${
                action.danger 
                  ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300' 
                  : 'text-gray-700 dark:text-gray-300 hover: dark:hover:text-gray-100'
              }`}
            >
              {action.icon && (
                <span className="mr-3 w-4 h-4">
                  {action.icon}
                </span>
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActionMenu
