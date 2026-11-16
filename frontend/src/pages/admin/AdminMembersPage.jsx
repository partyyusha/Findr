import { useState } from 'react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { listMembers, setMemberStatus } from '../../services/adminService'
import { formatDate } from '../../utils/formatDate'

function AdminMembersPage() {
  const { user } = useAuth()
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const { data, error, isLoading } = useAsync(listMembers, [reloadCount])

  async function changeStatus(member, status) {
    const verb = status === 'SUSPENDED' ? 'Suspend' : 'Bring back'
    if (!window.confirm(`${verb} ${member.full_name} in ${member.community_name}?`)) {
      return
    }
    try {
      await setMemberStatus(member.membership_id, status)
      setMessage({ type: 'success', text: `${member.full_name} is now ${status === 'SUSPENDED' ? 'suspended' : 'active'}.` })
      setReloadCount((count) => count + 1)
    } catch (statusError) {
      setMessage({ type: 'error', text: statusError.message })
    }
  }

  const wanted = search.trim().toLowerCase()
  const members = (data || []).filter(
    (member) => !wanted || member.full_name.toLowerCase().includes(wanted) || member.email.toLowerCase().includes(wanted),
  )

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Members</h1>
          <p>A suspended member can still log in, but can't report or claim in that community.</p>
        </div>
      </header>

      <input
        className="input admin-search"
        type="search"
        placeholder="Search by name or email"
        aria-label="Search members"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

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
              <th>Member</th>
              <th>Community</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Reports</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const canChange = member.user_id !== user.user_id && member.role !== 'COMMUNITY_ADMIN'
              return (
                <tr key={member.membership_id}>
                  <td>
                    <strong>{member.full_name}</strong>
                    <span className="admin-table-sub">{member.email}</span>
                  </td>
                  <td>{member.community_name}</td>
                  <td>
                    <Badge status={member.role} />
                  </td>
                  <td>
                    <Badge status={member.membership_status} />
                  </td>
                  <td>{formatDate(member.joined_at)}</td>
                  <td>{member.reports}</td>
                  <td>
                    {canChange &&
                      (member.membership_status === 'SUSPENDED' ? (
                        <Button size="small" variant="secondary" onClick={() => changeStatus(member, 'ACTIVE')}>
                          Bring back
                        </Button>
                      ) : (
                        <Button size="small" variant="ghost" onClick={() => changeStatus(member, 'SUSPENDED')}>
                          Suspend
                        </Button>
                      ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminMembersPage
