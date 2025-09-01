import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    // Lưu theme vào localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    
    // Áp dụng class vào html element
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const setTheme = (theme) => {
    setIsDark(theme === 'dark')
  }

  // Utility functions for theme-aware styling
  const getThemeClass = (lightClass, darkClass) => {
    return isDark ? darkClass : lightClass
  }

  const getThemeColor = (lightColor, darkColor) => {
    return isDark ? darkColor : lightColor
  }

  const value = {
    isDark,
    toggleTheme,
    setTheme,
    theme: isDark ? 'dark' : 'light',
    getThemeClass,
    getThemeColor
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
