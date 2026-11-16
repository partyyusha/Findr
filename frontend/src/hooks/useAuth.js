import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// const { user, isLoading, logIn, signUp, logOut, refreshUser } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
