import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (err) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  const register = useCallback(async (email, password, name, role, company, phone) => {
    setError(null)
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
        name,
        role,
        company,
        phone
      })

      const { token: newToken, user: newUser } = response.data

      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))

      setToken(newToken)
      setUser(newUser)

      return newUser
    } catch (err) {
      const message = err.response?.data?.message || 'ユーザー登録に失敗しました'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      })

      const { token: newToken, user: newUser } = response.data

      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))

      setToken(newToken)
      setUser(newUser)

      return newUser
    } catch (err) {
      const message = err.response?.data?.message || 'ログインに失敗しました'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Also export context for potential direct use
export default AuthContext
