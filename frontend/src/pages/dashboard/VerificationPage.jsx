import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import HandoverPanel from '../../components/HandoverPanel'
import { useAsync } from '../../hooks/useAsync'
import { approveClaim, listClaimsToReview, rejectClaim } from '../../services/claimService'
import { formatDate } from '../../utils/formatDate'
import { claimBadgeStatus } from '../../utils/labels'

// The finder's side of a claim. Claims only get here after the owner's
// answer matched, so this is the human check: does it feel right?
// ?item=<id> shows the claims for one item only.

function WaitingClaim({ claim, onDecided }) {
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  async function decide(approve) {
    const note = window.prompt(
      approve ? 'Approve this claim? You can add a note for them (optional).' : 'Reject this claim? Tell them why (optional).',
      '',
    )
    if (note === null) {
      return
    }

    setError('')
    setIsBusy(true)
    try {
      await (approve ? approveClaim(claim.claim_id, note) : rejectClaim(claim.claim_id, note))
      onDecided(approve ? `You approved ${claim.claimant_name}'s claim.` : `You rejected ${claim.claimant_name}'s claim.`)
    } catch (decideError) {
      setError(decideError.message)
      setIsBusy(false)
    }
  }

  return (
    <li className="review-claim">
      <div>
        <strong>{claim.claimant_name}</strong>
        <span className="review-claim-meta">
          Claimed on {formatDate(claim.created_at)} · on Findr since {formatDate(claim.claimant_since)}
        </span>
        <span className="review-claim-check">✓ Answered your question correctly</span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <div className="review-claim-actions">
        <Button size="small" variant="found" onClick={() => decide(true)} disabled={isBusy}>
          Approve
        </Button>
        <Button size="small" variant="ghost" onClick={() => decide(false)} disabled={isBusy}>
          Reject
        </Button>
      </div>
    </li>
  )
}

function VerificationPage() {
  const [searchParams] = useSearchParams()
  const onlyItemId = searchParams.get('item')
  const [reloadCount, setReloadCount] = useState(0)
  const [message, setMessage] = useState('')
  const { data, error, isLoading } = useAsync(listClaimsToReview, [reloadCount])

  function reload(text = '') {
    setMessage(text)
    setReloadCount((count) => count + 1)
  }

  const claims = (data || []).filter((claim) => !onlyItemId || claim.item_id === onlyItemId)
  const waiting = claims.filter((claim) => claim.status === 'PENDING')
  const isReturned = (claim) => claimBadgeStatus(claim) === 'RETURNED'
  const approved = claims.filter((claim) => claim.status === 'APPROVED' && !isReturned(claim))
  const history = claims.filter((claim) => ['REJECTED', 'WITHDRAWN'].includes(claim.status) || isReturned(claim))

  // waiting claims grouped by item, so several claims on one bottle sit together
  const waitingByItem = []
  for (const claim of waiting) {
    const group = waitingByItem.find((entry) => entry.item.item_id === claim.item_id)
    if (group) {
      group.claims.push(claim)
    } else {
      waitingByItem.push({ item: claim.item, claims: [claim] })
    }
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Claim verification</h1>
          <p>People who say they own something you found. Their answer already matched your private question.</p>
        </div>
      </header>

      {onlyItemId && (
        <p className="dashboard-muted">
          Showing one item. <Link to="/dashboard/verification">Show all claims</Link>
        </p>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      {isLoading && !data && <p className="loading-text">Loading claims…</p>}
      {error && <div className="alert alert-error">Couldn't load claims. Refresh to try again.</div>}

      {data && claims.length === 0 && (
        <EmptyState title="No claims to review" text="When someone claims an item you found, it shows up here.">
          <Button to="/dashboard/found-reports" variant="secondary">
            My found reports
          </Button>
        </EmptyState>
      )}

      {waitingByItem.length > 0 && (
        <section className="dashboard-section">
          <h2>Waiting for your decision</h2>
          <p className="dashboard-muted review-tip">
            Not sure? Ask them something only the owner would know when you meet. Approving one claim closes the
            others on the same item.
          </p>
          <div className="item-list">
            {waitingByItem.map(({ item, claims: itemClaims }) => (
              <article key={item.item_id} className="card review-item">
                <div className="review-item-top">
                  <Link to={`/items/${item.item_id}`} className="item-row-title">
                    {item.title}
                  </Link>
                  <Badge status={item.status} />
                </div>
                <p className="item-row-meta">
                  Found on {formatDate(item.event_date)} at {item.location_label}
                </p>
                <ul className="review-claims">
                  {itemClaims.map((claim) => (
                    <WaitingClaim key={claim.claim_id} claim={claim} onDecided={reload} />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section className="dashboard-section">
          <h2>Approved, hand it over</h2>
          <div className="item-list">
            {approved.map((claim) => (
              <article key={claim.claim_id} className="card review-item">
                <div className="review-item-top">
                  <Link to={`/items/${claim.item_id}`} className="item-row-title">
                    {claim.item.title}
                  </Link>
                  <Badge status={claimBadgeStatus(claim)} />
                </div>
                <p className="item-row-meta">
                  Owner: {claim.claimant_name} · approved on {formatDate(claim.reviewed_at)}
                </p>
                <HandoverPanel claim={claim} isFinder onChange={() => reload()} />
              </article>
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <details className="dashboard-section review-history">
          <summary>Finished claims ({history.length})</summary>
          <ul className="simple-list">
            {history.map((claim) => (
              <li key={claim.claim_id}>
                <span>
                  {claim.claimant_name} on <Link to={`/items/${claim.item_id}`}>{claim.item.title}</Link>
                  {claim.review_note && <span className="dashboard-muted"> · "{claim.review_note}"</span>}
                </span>
                <Badge status={claimBadgeStatus(claim)} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}

export default VerificationPage
