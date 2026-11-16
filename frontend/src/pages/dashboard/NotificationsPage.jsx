import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { listMyNotifications, markAllAsRead, markAsRead } from '../../services/notificationService'
import { formatDate } from '../../utils/formatDate'

const TYPE_LABELS = {
  CLAIM_SUBMITTED: 'New claim',
  CLAIM_APPROVED: 'Claim approved',
  CLAIM_REJECTED: 'Claim not approved',
  HANDOVER_SCHEDULED: 'Handover set',
  HANDOVER_CANCELLED: 'Handover cancelled',
  HANDOVER_COMPLETED: 'Returned',
}

function NotificationsPage() {
  const navigate = useNavigate()
  const [reloadCount, setReloadCount] = useState(0)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const { data, error, isLoading } = useAsync(listMyNotifications, [reloadCount])

  const notifications = (data || []).filter((row) => !onlyUnread || !row.is_read)
  const unread = (data || []).filter((row) => !row.is_read).length

  async function open(notification) {
    await markAsRead(notification.notification_id)
    navigate(notification.link)
  }

  async function readAll() {
    await markAllAsRead()
    setReloadCount((count) => count + 1)
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Notifications</h1>
          <p>{unread > 0 ? `${unread} unread` : "You're all caught up."}</p>
        </div>
        <div className="dashboard-header-actions">
          <Button variant="secondary" size="small" onClick={() => setOnlyUnread(!onlyUnread)}>
            {onlyUnread ? 'Show all' : 'Only unread'}
          </Button>
          {unread > 0 && (
            <Button variant="ghost" size="small" onClick={readAll}>
              Mark all as read
            </Button>
          )}
        </div>
      </header>

      {isLoading && !data && <p className="loading-text">Loading…</p>}
      {error && <div className="alert alert-error">Couldn't load notifications. Refresh to try again.</div>}

      {data && notifications.length === 0 && (
        <EmptyState
          title={onlyUnread ? 'Nothing unread' : 'No notifications yet'}
          text="You'll hear about claims and handovers here."
        />
      )}

      <ul className="notification-list">
        {notifications.map((notification) => (
          <li key={notification.notification_id}>
            <button
              type="button"
              className={`notification ${notification.is_read ? '' : 'is-unread'}`}
              onClick={() => open(notification)}
            >
              <span className="notification-type">
                {TYPE_LABELS[notification.notification_type] || 'Update'}
                {!notification.is_read && <span className="visually-hidden"> (unread)</span>}
              </span>
              <span className="notification-message">{notification.message}</span>
              <span className="notification-date">{formatDate(notification.created_at)}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default NotificationsPage
