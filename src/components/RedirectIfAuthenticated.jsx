import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function RedirectIfAuthenticated({ children }) {
  const { currentUser } = useAuth()

  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RedirectIfAuthenticated
