import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { useAsync } from '../hooks/useAsync'
import { getClaimForm, submitClaim } from '../services/claimService'
import { formatDate } from '../utils/formatDate'
import { LIMITS } from '../utils/validateReport'
import '../styles/pages/claim.css'

// /items/:id/claim. Answer the finder's private question to prove the item is yours.
function ClaimPage() {
  const { id } = useParams()
  const { data: form, error, isLoading } = useAsync(() => getClaimForm(id), [id])

  const [answer, setAnswer] = useState('')
  const [answerError, setAnswerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  if (isLoading && !form) {
    return (
      <div className="container">
        <p className="loading-text">Loading…</p>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="container claim-page">
        <EmptyState title="We couldn't find this item" text="It may have been removed, or the link is wrong.">
          <Button to="/explore">Explore items</Button>
        </EmptyState>
      </div>
    )
  }

  const { item, problem, question_text } = form

  async function handleSubmit(event) {
    event.preventDefault()

    if (!answer.trim()) {
      setAnswerError('Type your answer.')
      return
    }

    setAnswerError('')
    setIsSubmitting(true)
    try {
      await submitClaim(item.item_id, answer)
      setIsDone(true)
    } catch (claimError) {
      setAnswerError(claimError.message)
    }
    setIsSubmitting(false)
  }

  if (isDone) {
    return (
      <div className="container claim-page">
        <div className="card claim-card claim-done">
          <span className="claim-done-tick" aria-hidden="true">
            ✓
          </span>
          <h1>Claim sent</h1>
          <p>
            Your answer matched. {item.reporter_name} will look at your claim and let you know. You'll see their decision
            in My claims.
          </p>
          <div className="claim-actions">
            <Button to="/dashboard/claims">Go to my claims</Button>
            <Button to={`/items/${item.item_id}`} variant="ghost">
              Back to the item
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container claim-page">
      <Link to={`/items/${item.item_id}`} className="claim-back">
        ← Back to the item
      </Link>

      <div className="card claim-card">
        <div className="claim-item">
          <Badge status={item.report_type} />
          <h1>Claim: {item.title}</h1>
          <p>
            Found on {formatDate(item.event_date)} at {item.location_label} by {item.reporter_name}
          </p>
        </div>

        {problem ? (
          <div className="claim-blocked">
            <p className="alert alert-error">{problem.message}</p>
            {problem.code === 'already-claimed' && <Button to="/dashboard/claims">See my claims</Button>}
            {problem.code === 'own-item' && <Button to="/dashboard/found-reports">My found reports</Button>}
          </div>
        ) : (
          <form className="claim-form" onSubmit={handleSubmit} noValidate>
            <div className="claim-question">
              <span className="claim-question-label">The finder's question</span>
              <p>{question_text}</p>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="answer">
                Your answer
              </label>
              <input
                id="answer"
                className="input"
                maxLength={LIMITS.answer}
                autoComplete="off"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                aria-invalid={answerError ? true : undefined}
                aria-describedby={answerError ? 'answer-error' : undefined}
              />
              <span className="field-hint">Capitals and extra spaces don't matter.</span>
              {answerError && (
                <span className="field-error" id="answer-error" role="alert">
                  {answerError}
                </span>
              )}
            </div>

            <p className="claim-small-print">
              Findr checks your answer straight away. Only a matching answer creates a claim, and the finder never sees
              what you typed.
            </p>

            <div className="claim-actions">
              <Button type="submit" size="large" disabled={isSubmitting}>
                {isSubmitting ? 'Checking…' : 'Send claim'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ClaimPage
