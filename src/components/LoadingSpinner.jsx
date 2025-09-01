import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

function LoadingSpinner({ size = 'md', className = '' }) {
  const { isDark } = useTheme()
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
    </div>
  )
}

export default LoadingSpinner
