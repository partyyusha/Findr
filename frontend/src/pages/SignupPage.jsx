import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import PasswordInput from '../components/PasswordInput'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { listCommunities } from '../services/referenceService'
import { COMMUNITY_TYPE_LABELS } from '../utils/labels'
import { safeRedirect } from '../utils/redirect'
import '../styles/pages/auth.css'

const EMPTY_FORM = { full_name: '', email: '', password: '', confirm_password: '', community_id: '' }

function validateSignup(form) {
  const errors = {}

  if (form.full_name.trim().length < 2) {
    errors.full_name = 'Enter your name.'
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email, like name@college.edu.'
  }
  if (form.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }
  if (form.confirm_password !== form.password) {
    errors.confirm_password = "The passwords don't match."
  }
  if (!form.community_id) {
    errors.community_id = 'Choose your college, hostel or colony.'
  }

  return errors
}

function SignupPage() {
  const { user, signUp } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const communities = useAsync(listCommunities, []).data || []

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = safeRedirect(searchParams)

  if (user && !isSubmitting) {
    return <Navigate to={redirectTo} replace />
  }

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }))
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const foundErrors = validateSignup(form)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(form)
      navigate(redirectTo, { replace: true })
    } catch (signupError) {
      setSubmitError(signupError.message)
      setIsSubmitting(false)
    }
  }

  // aria props for a field that has an error
  function errorProps(name) {
    return errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {}
  }

  function fieldError(name) {
    return (
      errors[name] && (
        <span className="field-error" id={`${name}-error`}>
          {errors[name]}
        </span>
      )
    )
  }

  return (
    <div className="container auth-page auth-page-single">
      <div className="card auth-card">
        <h1>Create your account</h1>
        <p className="auth-intro">Anyone can browse Findr. You need an account to report items and make claims.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div className="alert alert-error" role="alert">
              {submitError}
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="full_name">
              Your name
            </label>
            <input
              id="full_name"
              className="input"
              autoComplete="name"
              value={form.full_name}
              onChange={(event) => updateField('full_name', event.target.value)}
              {...errorProps('full_name')}
            />
            {fieldError('full_name')}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              {...errorProps('email')}
            />
            {fieldError('email')}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="community_id">
              Your community
            </label>
            <select
              id="community_id"
              className="input"
              value={form.community_id}
              onChange={(event) => updateField('community_id', event.target.value)}
              {...errorProps('community_id')}
            >
              <option value="">Choose one</option>
              {communities.map((community) => (
                <option key={community.community_id} value={community.community_id}>
                  {community.name} ({COMMUNITY_TYPE_LABELS[community.community_type]})
                </option>
              ))}
            </select>
            <span className="field-hint">You can report and claim items inside this community.</span>
            {fieldError('community_id')}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              {...errorProps('password')}
            />
            <span className="field-hint">At least 8 characters.</span>
            {fieldError('password')}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirm_password">
              Type the password again
            </label>
            <PasswordInput
              id="confirm_password"
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={(event) => updateField('confirm_password', event.target.value)}
              {...errorProps('confirm_password')}
            />
            {fieldError('confirm_password')}
          </div>

          <Button type="submit" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Creating your account…' : 'Create account'}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
