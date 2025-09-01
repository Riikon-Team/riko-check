import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../firebase/config'
import { 
  signInWithPopup,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import toast from 'react-hot-toast'
import { authAPI } from '../utils/apiUtils'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [isApproved, setIsApproved] = useState(false)
  const [canCreateEvents, setCanCreateEvents] = useState(false)

  const googleProvider = new GoogleAuthProvider()
  googleProvider.addScope('email')
  googleProvider.addScope('profile')
  
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  })

  async function signInWithGoogle() {
    try {
      console.log('Attempting Google sign-in with popup...');
      const result = await signInWithPopup(auth, googleProvider)
      console.log('Popup result:', result);
      
      // Gửi thông tin user lên server
      const token = await result.user.getIdToken()
      localStorage.setItem('token', token)
      
      const userData = {
        id: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      }

      const response = await authAPI.googleSignIn(userData)
      setUserRole(response.role)
      setIsApproved(response.isApproved)
      setCanCreateEvents(response.canCreateEvents)
      toast.success('Đăng nhập thành công!')
      return true
    } catch (error) {
      console.error('Error signing in with Google:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Popup đã bị đóng. Vui lòng thử lại.')
      } else {
        toast.error('Đăng nhập thất bại!')
      }
      return false
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      setCurrentUser(null)
      setUserRole(null)
      setIsApproved(false)
      toast.success('Đăng xuất thành công!')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Đăng xuất thất bại!')
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)

        // Lấy Firebase ID token và lưu vào localStorage
        const token = await user.getIdToken()
        localStorage.setItem('token', token)

        // Gửi thông tin user lên server (nếu cần)
        try {
          const userData = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
          
          const response = await authAPI.googleSignIn(userData)
          setUserRole(response.role)
          setIsApproved(response.isApproved)
          setCanCreateEvents(response.canCreateEvents)
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Không hiển thị toast error ở đây vì có thể user chưa được đăng ký
        }
             } else {
         setCurrentUser(null)
         setUserRole(null)
         setIsApproved(false)
         setCanCreateEvents(false)
         localStorage.removeItem('token')
       }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    isApproved,
    canCreateEvents,
    signInWithGoogle,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
