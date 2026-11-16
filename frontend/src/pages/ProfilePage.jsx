import { useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { listCommunities } from '../services/referenceService'
import { joinCommunity, resetDemoData, updateProfile } from '../services/userService'
import { formatDate } from '../utils/formatDate'
import { COMMUNITY_TYPE_LABELS } from '../utils/labels'
import '../styles/pages/profile.css'

function ProfileForm({ user, onSaved }) {
  const [fullName, setFullName] = useState(user.full_name)
  const [phone, setPhone] = useState(user.phone || '')
  const [message, setMessage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)
    setIsSaving(true)
    try {
      await updateProfile({ full_name: fullName, phone })
      await onSaved()
      setMessage({ type: 'success', text: 'Saved.' })
    } catch (saveError) {
      setMessage({ type: 'error', text: saveError.message })
    }
    setIsSaving(false)
  }

  return (
    <form className="card profile-card" onSubmit={handleSubmit} noValidate>
      <h2>Your details</h2>

      {message && (
        <div className={`alert alert-${message.type}`} role="status">
          {message.text}
        </div>
      )}

      <div className="field">
        <label className="field-label" htmlFor="full_name">
          Name
        </label>
        <input id="full_name" className="input" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input id="email" className="input" value={user.email} disabled />
        <span className="field-hint">This is your login, so it can't be changed here.</span>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="phone">
          Phone <span className="field-optional">(optional)</span>
        </label>
        <input
          id="phone"
          className="input"
          type="tel"
          placeholder="+91 98100 00000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <span className="field-hint">Not shown on your reports.</span>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}

function CommunitiesCard({ user, onJoined }) {
  const allCommunities = useAsync(listCommunities, []).data || []
  const [choice, setChoice] = useState('')
  const [error, setError] = useState('')

  const myIds = user.communities.map((community) => community.community_id)
  const canJoin = allCommunities.filter((community) => !myIds.includes(community.community_id))

  async function handleJoin(event) {
    event.preventDefault()
    if (!choice) {
      return
    }
    setError('')
    try {
      await joinCommunity(choice)
      setChoice('')
      await onJoined()
    } catch (joinError) {
      setError(joinError.message)
    }
  }

  return (
    <section className="card profile-card">
      <h2>Your communities</h2>
      <p className="profile-muted">You can report and claim items in these.</p>

      <ul className="profile-communities">
        {user.communities.map((community) => (
          <li key={community.community_id}>
            <span>
              <strong>{community.name}</strong>
              <span className="profile-muted"> · {COMMUNITY_TYPE_LABELS[community.community_type]}</span>
            </span>
            <Badge status={community.role} />
          </li>
        ))}
      </ul>

      {canJoin.length > 0 && (
        <form className="profile-join" onSubmit={handleJoin}>
          <select className="input" value={choice} onChange={(event) => setChoice(event.target.value)} aria-label="Community to join">
            <option value="">Join another community</option>
            {canJoin.map((community) => (
              <option key={community.community_id} value={community.community_id}>
                {community.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" disabled={!choice}>
            Join
          </Button>
        </form>
      )}
      {error && <span className="field-error">{error}</span>}
    </section>
  )
}

function ProfilePage() {
  const { user, refreshUser } = useAuth()

  function handleReset() {
    if (window.confirm('Reset all demo data? Every report, claim and account made in this browser will be deleted.')) {
      resetDemoData()
      window.location.href = '/'
    }
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Your profile</h1>
          <p>On Findr since {formatDate(user.created_at)}.</p>
        </div>
      </header>

      <div className="profile-grid">
        <ProfileForm user={user} onSaved={refreshUser} />
        <CommunitiesCard user={user} onJoined={refreshUser} />
      </div>

      <section className="profile-reset">
        <div>
          <strong>Demo data</strong>
          <p className="profile-muted">Start over with the original sample reports, claims and accounts.</p>
        </div>
        <Button variant="ghost" size="small" onClick={handleReset}>
          Reset demo data
        </Button>
      </section>
    </>
  )
}

export default ProfilePage
