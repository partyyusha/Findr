import { db } from './mockStore'

// The business rules shared by the services, in one place.
// The backend repeats these in phase 4 and the database triggers back them up.

export function isActiveMember(userId, communityId) {
  return db.community_memberships.some(
    (row) => row.user_id === userId && row.community_id === communityId && row.membership_status === 'ACTIVE',
  )
}

export function isCommunityAdmin(userId, communityId) {
  return db.community_memberships.some(
    (row) =>
      row.user_id === userId &&
      row.community_id === communityId &&
      row.role === 'COMMUNITY_ADMIN' &&
      row.membership_status === 'ACTIVE',
  )
}

// PENDING and APPROVED claims count as "active" (same as the unique index in the schema)
export function findActiveClaim(itemId, userId) {
  return db.claims.find(
    (claim) => claim.item_id === itemId && claim.claimant_id === userId && ['PENDING', 'APPROVED'].includes(claim.status),
  )
}

const NOT_TAKING_CLAIMS = {
  CLAIM_APPROVED: 'The finder already approved a claim on this item.',
  RETURNED: 'This item is already back with its owner.',
  CLOSED: 'The finder closed this report.',
}

// Why this user can't claim this item, or null if they can.
// code is for the page to pick what to show, message is for people.
export function whyCantClaim(item, userId) {
  if (item.report_type !== 'FOUND') {
    return { code: 'lost-report', message: 'Only found items can be claimed.' }
  }
  if (NOT_TAKING_CLAIMS[item.status]) {
    return { code: 'not-open', message: NOT_TAKING_CLAIMS[item.status] }
  }
  if (!userId) {
    return { code: 'logged-out', message: 'Log in to claim this item.' }
  }
  if (item.reporter_id === userId) {
    return { code: 'own-item', message: "You reported this item, so you can't claim it." }
  }
  if (!isActiveMember(userId, item.community_id)) {
    return { code: 'not-member', message: 'Only members of this community can claim its items.' }
  }
  if (findActiveClaim(item.item_id, userId)) {
    return { code: 'already-claimed', message: 'You already have a claim on this item.' }
  }
  return null
}
