import { NavLink, Outlet } from 'react-router-dom'
import '../styles/pages/dashboard.css'
import '../styles/pages/admin.css'

const ADMIN_LINKS = [
  { label: 'Overview', path: '/admin' },
  { label: 'Members', path: '/admin/members' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Claims', path: '/admin/claims' },
]

// Same shape as the dashboard: side menu, page next to it
function AdminLayout() {
  return (
    <div className="container dashboard">
      <nav className="dashboard-nav" aria-label="Admin">
        <span className="dashboard-nav-title">Admin</span>
        {ADMIN_LINKS.map((link) => (
          <NavLink key={link.path} to={link.path} end={link.path === '/admin'}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
