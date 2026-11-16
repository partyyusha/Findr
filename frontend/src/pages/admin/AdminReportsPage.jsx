import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { useAsync } from '../../hooks/useAsync'
import { listCommunityReports } from '../../services/adminService'
import { closeItem } from '../../services/itemService'
import { formatDate } from '../../utils/formatDate'
import { ITEM_STATUS_LABELS } from '../../utils/labels'

// Moderation: every report in your communities. Close anything fake, abusive or a duplicate.
function AdminReportsPage() {
  const [reloadCount, setReloadCount] = useState(0)
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState(null)
  const { data, error, isLoading } = useAsync(listCommunityReports, [reloadCount])

  async function handleClose(item) {
    if (!window.confirm(`Close "${item.title}" by ${item.reporter_name}? Claims waiting on it will be closed too.`)) {
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

  const reports = (data || []).filter((item) => !status || item.status === status)

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Reports</h1>
          <p>Every lost and found report in your communities. Close the ones that break the rules.</p>
        </div>
        <select className="input admin-filter" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(ITEM_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </header>

      {message && (
        <div className={`alert alert-${message.type}`} role="status">
          {message.text}
        </div>
      )}
      {isLoading && !data && <p className="loading-text">Loading…</p>}
      {error && <div className="alert alert-error">{error.message}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Type</th>
              <th>Status</th>
              <th>By</th>
              <th>Posted</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((item) => (
              <tr key={item.item_id}>
                <td>
                  <Link to={`/items/${item.item_id}`}>{item.title}</Link>
                  <span className="admin-table-sub">{item.community_name}</span>
                </td>
                <td>
                  <Badge status={item.report_type} />
                </td>
                <td>
                  <Badge status={item.status} />
                </td>
                <td>{item.reporter_name}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  {['OPEN', 'CLAIM_PENDING'].includes(item.status) && (
                    <Button size="small" variant="ghost" onClick={() => handleClose(item)}>
                      Close
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminReportsPage
