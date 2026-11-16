import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import * as authService from '../services/authService'
import { getCurrentUser } from '../services/userService'

// Keeps the logged in user in one place so the navbar, the page guards and
// every page see the same thing. user is null for guests.
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const current = await getCurrentUser()
    setUser(current)
    setIsLoading(false)
    return current
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  async function logIn(email, password) {
    await authService.logIn(email, password)
    return refreshUser()
  }

  async function signUp(details) {
    await authService.signUp(details)
    return refreshUser()
  }

  async function logOut() {
    await authService.logOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logIn, signUp, logOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
