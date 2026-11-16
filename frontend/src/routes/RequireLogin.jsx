import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Wraps pages that need an account. Guests go to /login and come back here after.
function RequireLogin() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="container">
        <p className="loading-text">Loading…</p>
      </div>
    )
  }

  if (!user) {
    const comeBackTo = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(comeBackTo)}`} replace />
  }

  return <Outlet />
}

export default RequireLogin
