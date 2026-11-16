import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import ItemRow from '../../components/ItemRow'
import { useAsync } from '../../hooks/useAsync'
import { closeItem, listMyReports, listPossibleMatches } from '../../services/itemService'

// Found items that look like this lost one (same community and category)
function PossibleMatches({ itemId }) {
  const matches = useAsync(() => listPossibleMatches(itemId), [itemId]).data || []

  if (matches.length === 0) {
    return <p className="item-row-note">No matching found items yet. We'll keep this report searchable.</p>
  }

  return (
    <div className="item-row-note">
      <strong>Could one of these be it?</strong>
      <ul className="match-list">
        {matches.map((match) => (
          <li key={match.item_id}>
            <Link to={`/items/${match.item_id}`}>{match.title}</Link>
            <span> · found at {match.location_label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MyLostReportsPage() {
  const [reloadCount, setReloadCount] = useState(0)
  const [message, setMessage] = useState(null)
  const { data, error, isLoading } = useAsync(() => listMyReports('LOST'), [reloadCount])

  async function handleClose(item) {
    if (!window.confirm(`Close "${item.title}"? Do this when you've got it back or stopped looking.`)) {
      return
    }
    try {
      await closeItem(item.item_id)
      setMessage({ type: 'success', text: `Closed "${item.title}".` })
      setReloadCount((count) => count + 1)
    } catch (closeError) {
      setMessage({ type: 'error', text: closeError.message })
    }
  }

  const reports = data || []

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>My lost reports</h1>
          <p>Things you're looking for. Close a report once you have it back.</p>
        </div>
        <Button to="/report?type=lost" variant="lost">
          Report a lost item
        </Button>
      </header>

      {message && (
        <div className={`alert alert-${message.type}`} role="status">
          {message.text}
        </div>
      )}

      {isLoading && !data && <p className="loading-text">Loading your reports…</p>}
      {error && <div className="alert alert-error">Couldn't load your reports. Refresh to try again.</div>}

      {data && reports.length === 0 && (
        <EmptyState title="No lost reports" text="If you lose something, report it so people can look out for it.">
          <Button to="/report?type=lost">Report a lost item</Button>
        </EmptyState>
      )}

      <div className="item-list">
        {reports.map((item) => {
          const isOpen = item.status === 'OPEN'
          return (
            <ItemRow key={item.item_id} item={item}>
              {isOpen && <PossibleMatches itemId={item.item_id} />}
              {isOpen && (
                <div className="item-row-actions">
                  <Button to={`/dashboard/reports/${item.item_id}/edit`} variant="secondary" size="small">
                    Edit
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => handleClose(item)}>
                    Close report
                  </Button>
                </div>
              )}
            </ItemRow>
          )
        })}
      </div>
    </>
  )
}

export default MyLostReportsPage
