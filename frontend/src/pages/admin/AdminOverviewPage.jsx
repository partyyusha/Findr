import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { getAdminOverview } from '../../services/adminService'
import { COMMUNITY_TYPE_LABELS } from '../../utils/labels'

function AdminOverviewPage() {
  const { data, error, isLoading } = useAsync(getAdminOverview, [])

  if (isLoading && !data) {
    return <p className="loading-text">Loading…</p>
  }
  if (error) {
    return <div className="alert alert-error">{error.message}</div>
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Admin overview</h1>
          <p>The communities you look after.</p>
        </div>
      </header>

      {data.map((community) => (
        <section key={community.community_id} className="card admin-community">
          <div className="admin-community-top">
            <div>
              <h2>{community.name}</h2>
              <p className="dashboard-muted">
                {COMMUNITY_TYPE_LABELS[community.community_type]} · {community.address}
              </p>
            </div>
            <div className="admin-recovery">
              <span className="stat-value">{community.recovery_rate}%</span>
              <span className="stat-label">of found items returned</span>
              <span className="admin-recovery-bar" aria-hidden="true">
                <span style={{ width: `${community.recovery_rate}%` }} />
              </span>
            </div>
          </div>

          <div className="stat-grid">
            <Link to="/admin/members" className="stat-card">
              <span className="stat-value">{community.members}</span>
              <span className="stat-label">Members</span>
            </Link>
            <Link to="/admin/reports" className="stat-card">
              <span className="stat-value">{community.open_reports}</span>
              <span className="stat-label">Open reports</span>
            </Link>
            <div className="stat-card">
              <span className="stat-value">
                {community.lost_reports} / {community.found_reports}
              </span>
              <span className="stat-label">Lost / found reports</span>
            </div>
            <Link to="/admin/claims" className="stat-card">
              <span className="stat-value">{community.pending_claims}</span>
              <span className="stat-label">Claims waiting for a finder</span>
            </Link>
            <div className="stat-card">
              <span className="stat-value">{community.returned}</span>
              <span className="stat-label">Items returned</span>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export default AdminOverviewPage
