import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { EventProvider } from './contexts/EventContext'
import { ThemeProvider } from './contexts/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EventCreate from './pages/EventCreate'
import EventEdit from './pages/EventEdit'
import EventDetail from './pages/EventDetail'
import Attendance from './pages/Attendance'
import AttendanceManagement from './pages/AttendanceManagement'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Footer from './components/Footer'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/event/:id" element={<EventDetail />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/attendance/:eventId" element={<Attendance />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/event/create" element={
                  <PrivateRoute>
                    <EventCreate />
                  </PrivateRoute>
                } />
                <Route path="/event/:id/edit" element={
                  <PrivateRoute>
                    <EventEdit />
                  </PrivateRoute>
                } />
                <Route path="/attendance-management/:eventId" element={
                  <PrivateRoute>
                    <AttendanceManagement />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
