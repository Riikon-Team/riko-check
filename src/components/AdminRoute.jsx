import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default AdminRoute
