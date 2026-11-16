import { addNotification, copy, createId, db, networkDelay, requireUserId, saveDb } from './mockStore'

// Meeting up to give the item back. Only an APPROVED claim gets a handover
// (one per claim, like the UNIQUE claim_id in the schema).

function findApprovedClaim(claimId) {
  const claim = db.claims.find((row) => row.claim_id === claimId)
  if (!claim || claim.status !== 'APPROVED') {
    throw new Error('Only an approved claim can have a handover.')
  }
  const item = db.items.find((row) => row.item_id === claim.item_id)
  return { claim, item }
}

// the person on the other side, so they get told about changes
function otherPerson(userId, claim, item) {
  return userId === item.reporter_id ? claim.claimant_id : item.reporter_id
}

function formatWhen(isoDate) {
  return new Date(isoDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

// The finder or the owner can set (or change) when and where to meet.
// scheduled_at is an ISO date, handover_location is free text.
// phase 5: PUT /api/claims/:id/handover
export async function scheduleHandover(claimId, { scheduled_at, handover_location }) {
  await networkDelay(300)

  const userId = requireUserId()
  const { claim, item } = findApprovedClaim(claimId)
  if (userId !== item.reporter_id && userId !== claim.claimant_id) {
    throw new Error('Only the finder and the owner can arrange this handover.')
  }
  if (item.status === 'RETURNED') {
    throw new Error('This item was already returned.')
  }
  if (!scheduled_at || !handover_location?.trim()) {
    throw new Error('Choose a time and a place.')
  }

  let handover = db.handovers.find((row) => row.claim_id === claimId)
  if (!handover) {
    handover = { handover_id: createId('handover'), claim_id: claimId, completed_at: null, confirmation_note: null }
    db.handovers.push(handover)
  }
  handover.scheduled_at = scheduled_at
  handover.handover_location = handover_location.trim()
  handover.status = 'SCHEDULED'

  addNotification({
    userId: otherPerson(userId, claim, item),
    itemId: item.item_id,
    claimId,
    type: 'HANDOVER_SCHEDULED',
    message: `Handover for the ${item.title} set for ${formatWhen(scheduled_at)} at ${handover.handover_location}.`,
  })
  saveDb()

  return copy(handover)
}

// The finder confirms they handed it over. The item becomes RETURNED and stops taking claims.
// phase 5: POST /api/claims/:id/handover/complete
export async function completeHandover(claimId, note = '') {
  await networkDelay(300)

  const userId = requireUserId()
  const { claim, item } = findApprovedClaim(claimId)
  if (userId !== item.reporter_id) {
    throw new Error('Only the finder can mark the item as returned.')
  }

  const handover = db.handovers.find((row) => row.claim_id === claimId)
  if (!handover || handover.status !== 'SCHEDULED') {
    throw new Error('Set up the handover first.')
  }

  const now = new Date().toISOString()
  handover.status = 'COMPLETED'
  handover.completed_at = now
  handover.confirmation_note = note.trim() || null
  item.status = 'RETURNED'
  item.updated_at = now

  addNotification({
    userId: claim.claimant_id,
    itemId: item.item_id,
    claimId,
    type: 'HANDOVER_COMPLETED',
    message: `Handover complete. The ${item.title} is marked returned.`,
  })
  saveDb()

  return copy(handover)
}

// Either side can call it off. The claim stays approved so they can set a new time.
// phase 5: POST /api/claims/:id/handover/cancel
export async function cancelHandover(claimId) {
  await networkDelay(300)

  const userId = requireUserId()
  const { claim, item } = findApprovedClaim(claimId)
  if (userId !== item.reporter_id && userId !== claim.claimant_id) {
    throw new Error('Only the finder and the owner can change this handover.')
  }

  const handover = db.handovers.find((row) => row.claim_id === claimId)
  if (!handover || handover.status !== 'SCHEDULED') {
    throw new Error('There is no handover to cancel.')
  }

  handover.status = 'CANCELLED'
  addNotification({
    userId: otherPerson(userId, claim, item),
    itemId: item.item_id,
    claimId,
    type: 'HANDOVER_CANCELLED',
    message: `The handover for the ${item.title} was cancelled. Pick a new time from your dashboard.`,
  })
  saveDb()
}
