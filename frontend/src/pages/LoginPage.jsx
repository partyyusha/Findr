import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { safeRedirect } from '../utils/redirect'
import '../styles/pages/auth.css'

// Seed accounts, handy while testing. They all use the same password.
const DEMO_ACCOUNTS = [
  { email: 'aarav@northfield.edu', who: 'Aarav, a student with lost reports and claims' },
  { email: 'ananya@northfield.edu', who: 'Ananya, who found a phone and a calculator' },
  { email: 'rohan@northfield.edu', who: 'Rohan, admin of Northfield college' },
]

function LoginPage() {
  const { user, logIn } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = safeRedirect(searchParams)

  // already logged in, nothing to do here
  if (user && !isSubmitting) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await logIn(email, password)
      navigate(redirectTo, { replace: true })
    } catch (loginError) {
      setError(loginError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container auth-page">
      <div className="card auth-card">
        <h1>Log in</h1>
        <p className="auth-intro">Log in to report items, claim what's yours and follow your claims.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="auth-switch">
          New to Findr? <Link to={`/signup?redirect=${encodeURIComponent(redirectTo)}`}>Create an account</Link>
        </p>
      </div>

      <aside className="auth-demo">
        <h2>Trying it out?</h2>
        <p>
          Use one of the demo accounts. The password for all of them is <code>findr123</code>.
        </p>
        <ul>
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button type="button" className="auth-demo-account" onClick={() => setEmail(account.email)}>
                {account.email}
              </button>
              <span>{account.who}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

export default LoginPage
