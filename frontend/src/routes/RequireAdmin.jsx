import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../hooks/useAuth'

// Only community admins get in. Guests go to /login first.
function RequireAdmin() {
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
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!user.isAdmin) {
    return (
      <div className="container admin-denied">
        <EmptyState title="Admins only" text="This part of Findr is for community admins.">
          <Button to="/dashboard">Back to my dashboard</Button>
        </EmptyState>
      </div>
    )
  }

  return <Outlet />
}

export default RequireAdmin
