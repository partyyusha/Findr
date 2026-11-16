// display names for db codes (Badge.jsx has its own list with colours)

export const COMMUNITY_TYPE_LABELS = {
  COLLEGE: 'College',
  HOSTEL: 'Hostel',
  RESIDENTIAL_COLONY: 'Residential colony',
  OTHER: 'Community',
}

export const ITEM_STATUS_LABELS = {
  OPEN: 'Open',
  CLAIM_PENDING: 'Claim pending',
  CLAIM_APPROVED: 'Claim approved',
  RETURNED: 'Returned',
  CLOSED: 'Closed',
}

// A claim stays APPROVED after the handover, so show RETURNED once the item is back
export function claimBadgeStatus(claim) {
  return claim.status === 'APPROVED' && claim.item.status === 'RETURNED' ? 'RETURNED' : claim.status
}
