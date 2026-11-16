import { copy, db, getSessionUserId, networkDelay, requireUserId, saveDb } from './mockStore'

// Notifications are created by the other services when something happens
// (claim made, approved, rejected, handover set or done). This file reads them.

function mine(userId) {
  return db.notifications.filter((row) => row.user_id === userId)
}

// Where clicking it should take you: finders go to claim verification,
// claimants go to My claims
function linkFor(notification, userId) {
  const item = db.items.find((row) => row.item_id === notification.related_item_id)
  if (!item) {
    return '/dashboard'
  }
  if (!notification.related_claim_id) {
    return `/items/${item.item_id}`
  }
  return item.reporter_id === userId ? `/dashboard/verification?item=${item.item_id}` : '/dashboard/claims'
}

// newest first, each with a `link`
// phase 5: GET /api/me/notifications
export async function listMyNotifications() {
  await networkDelay()

  const userId = requireUserId()
  const notifications = mine(userId)
    .sort((rowA, rowB) => rowB.created_at.localeCompare(rowA.created_at))
    .map((notification) => ({ ...notification, link: linkFor(notification, userId) }))

  return copy(notifications)
}

// for the number on the navbar, 0 for guests
// phase 5: GET /api/me/notifications/unread-count
export async function countUnread() {
  await networkDelay(50)

  const userId = getSessionUserId()
  return userId ? mine(userId).filter((row) => !row.is_read).length : 0
}

// phase 5: POST /api/notifications/:id/read
export async function markAsRead(notificationId) {
  const notification = mine(requireUserId()).find((row) => row.notification_id === notificationId)
  if (notification && !notification.is_read) {
    notification.is_read = true
    saveDb()
  }
}

// phase 5: POST /api/me/notifications/read-all
export async function markAllAsRead() {
  await networkDelay(100)

  for (const notification of mine(requireUserId())) {
    notification.is_read = true
  }
  saveDb()
}
