import { useState } from 'react'
import Button from './Button'
import { cancelHandover, completeHandover, scheduleHandover } from '../services/handoverService'

function formatWhen(isoDate) {
  return new Date(isoDate).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// <input type="datetime-local"> wants "2026-11-20T15:30" in local time
function toDateTimeInput(isoDate) {
  const date = new Date(isoDate)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

// The handover for one approved claim. Both sides see it:
// isFinder = true for the person who found the item (only they can mark it returned).
// onChange runs after any change so the page can reload.
function HandoverPanel({ claim, isFinder, onChange }) {
  const handover = claim.handover
  const isScheduled = handover?.status === 'SCHEDULED'

  const [isEditing, setIsEditing] = useState(!isScheduled)
  const [when, setWhen] = useState(isScheduled ? toDateTimeInput(handover.scheduled_at) : '')
  const [place, setPlace] = useState(isScheduled ? handover.handover_location : '')
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  if (claim.item.status === 'RETURNED') {
    return (
      <div className="handover handover-done">
        <strong>Returned</strong>
        <span>
          Handed over at {handover?.handover_location}
          {handover?.completed_at && ` on ${formatWhen(handover.completed_at)}`}.
        </span>
      </div>
    )
  }

  // runs a service call, shows its error, reloads the page on success
  async function run(action) {
    setError('')
    setIsBusy(true)
    try {
      await action()
      setIsEditing(false)
      onChange()
    } catch (actionError) {
      setError(actionError.message)
    }
    setIsBusy(false)
  }

  function handleSchedule(event) {
    event.preventDefault()
    if (!when || !place.trim()) {
      setError('Choose a time and a place.')
      return
    }
    if (new Date(when) < new Date()) {
      setError('Pick a time in the future.')
      return
    }
    run(() => scheduleHandover(claim.claim_id, { scheduled_at: new Date(when).toISOString(), handover_location: place }))
  }

  function handleReturned() {
    const note = window.prompt('Anything to add? (optional)', 'Handed over in person.')
    if (note === null) {
      return
    }
    run(() => completeHandover(claim.claim_id, note))
  }

  function handleCancel() {
    if (window.confirm('Cancel this handover? You can set a new time after.')) {
      run(() => cancelHandover(claim.claim_id))
    }
  }

  if (isScheduled && !isEditing) {
    return (
      <div className="handover">
        <strong>Handover set</strong>
        <span>
          {formatWhen(handover.scheduled_at)} at {handover.handover_location}
        </span>
        {error && <span className="field-error">{error}</span>}
        <div className="handover-actions">
          {isFinder && (
            <Button size="small" variant="found" onClick={handleReturned} disabled={isBusy}>
              Mark as returned
            </Button>
          )}
          <Button size="small" variant="secondary" onClick={() => setIsEditing(true)} disabled={isBusy}>
            Change
          </Button>
          <Button size="small" variant="ghost" onClick={handleCancel} disabled={isBusy}>
            Cancel handover
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className="handover" onSubmit={handleSchedule} noValidate>
      <strong>{handover?.status === 'CANCELLED' ? 'Handover cancelled, pick a new time' : 'Arrange the handover'}</strong>
      <span className="handover-hint">Meet somewhere public on campus, like the library desk or the security gate.</span>

      <div className="handover-fields">
        <label className="field">
          <span className="field-label">When</span>
          <input className="input" type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Where</span>
          <input
            className="input"
            maxLength={240}
            placeholder="e.g. Library front desk"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
          />
        </label>
      </div>

      {error && <span className="field-error">{error}</span>}

      <div className="handover-actions">
        <Button type="submit" size="small" disabled={isBusy}>
          {isScheduled ? 'Save new time' : 'Set handover'}
        </Button>
        {isScheduled && (
          <Button size="small" variant="ghost" onClick={() => setIsEditing(false)}>
            Keep the old time
          </Button>
        )}
      </div>
    </form>
  )
}

export default HandoverPanel
