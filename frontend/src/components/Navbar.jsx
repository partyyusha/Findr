import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'

// The main links shown in the navbar, in order.
const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Map', path: '/map' },
  { label: 'Report', path: '/report' },
  { label: 'Help', path: '/help' },
]

function Navbar() {
  const { user, logOut } = useAuth()
  // On phones the links hide behind a "Menu" button. This remembers if it is open.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close the phone menu whenever the user moves to another page
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  async function handleLogOut() {
    await logOut()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <Logo />
          Findr
        </Link>

        <nav className={`navbar-links ${isMenuOpen ? 'is-open' : ''}`} aria-label="Main">
          {NAV_LINKS.map((link) => (
            // `end` makes "Home" active only on "/", not on every page
            <NavLink key={link.path} to={link.path} end={link.path === '/'}>
              {link.label}
            </NavLink>
          ))}
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="navbar-user">Hi, {user.full_name.split(' ')[0]}</span>
              <Button variant="ghost" size="small" onClick={handleLogOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="small">
                Log in
              </Button>
              <Button to="/signup" size="small" className="navbar-signup">
                Sign up
              </Button>
            </>
          )}

          <Button
            variant="secondary"
            size="small"
            className="navbar-menu-button"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
