import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/Badge'
import { useAsync } from '../../hooks/useAsync'
import { listCommunityClaims } from '../../services/adminService'
import { formatDate } from '../../utils/formatDate'

// 2+ rejected claims is worth a look (someone trying their luck)
const SUSPICIOUS_REJECTIONS = 2

function AdminClaimsPage() {
  const [onlySuspicious, setOnlySuspicious] = useState(false)
  const { data, error, isLoading } = useAsync(listCommunityClaims, [])

  const isSuspicious = (claim) => claim.rejected_before >= SUSPICIOUS_REJECTIONS
  const claims = (data || []).filter((claim) => !onlySuspicious || isSuspicious(claim))

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Claims</h1>
          <p>Every claim in your communities. The finder decides, you keep an eye out for misuse.</p>
        </div>
        <label className="admin-toggle">
          <input type="checkbox" checked={onlySuspicious} onChange={(event) => setOnlySuspicious(event.target.checked)} />
          Only people with {SUSPICIOUS_REJECTIONS}+ rejected claims
        </label>
      </header>

      {isLoading && !data && <p className="loading-text">Loading…</p>}
      {error && <div className="alert alert-error">{error.message}</div>}
      {data && claims.length === 0 && <p className="dashboard-muted">No claims to show.</p>}

      {claims.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Claimed by</th>
                <th>Finder</th>
                <th>Claimed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.claim_id} className={isSuspicious(claim) ? 'is-flagged' : ''}>
                  <td>
                    <Link to={`/items/${claim.item_id}`}>{claim.item_title}</Link>
                  </td>
                  <td>
                    {claim.claimant_name}
                    {isSuspicious(claim) && (
                      <span className="admin-table-sub admin-flag">{claim.rejected_before} rejected claims</span>
                    )}
                  </td>
                  <td>{claim.finder_name}</td>
                  <td>{formatDate(claim.created_at)}</td>
                  <td>
                    <Badge status={claim.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default AdminClaimsPage
