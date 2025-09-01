import React from 'react'

function Badge({ children, variant = 'primary', className = '' }) {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    gray: 'badge-gray'
  }
  
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
