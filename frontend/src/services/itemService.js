import { addNotification, copy, createId, db, insertReport, networkDelay, requireUserId, saveDb } from './mockStore'
import { isActiveMember, isCommunityAdmin } from './rules'
import { sha256 } from '../utils/sha256'
import { validateItemDetails } from '../utils/validateReport'

// Item functions. Async so they can become fetch() calls in phase 5
// without changing the pages (API route noted above each one).
//
// Items come back as the items row + category_name, community_name,
// community_type, reporter_name and images[], like a JOIN would return.
// answer_hash is never included.

export function toItemView(item) {
  const category = db.categories.find((row) => row.category_id === item.category_id)
  const community = db.communities.find((row) => row.community_id === item.community_id)
  const reporter = db.users.find((row) => row.user_id === item.reporter_id)
  const images = db.item_images
    .filter((image) => image.item_id === item.item_id)
    .map((image) => ({ image_id: image.image_id, image_url: image.image_url }))

  return {
    ...item,
    category_name: category ? category.category_name : 'Other',
    community_name: community ? community.name : '',
    community_type: community ? community.community_type : 'OTHER',
    reporter_name: reporter ? reporter.full_name : 'A Findr member',
    images,
  }
}

export function hasMapLocation(item) {
  return item.latitude !== null && item.longitude !== null
}

// newest event_date first, then newest report
function newestFirst(itemA, itemB) {
  return itemB.event_date.localeCompare(itemA.event_date) || itemB.created_at.localeCompare(itemA.created_at)
}

function matchesSearch(item, search) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  const text = [item.title, item.description, item.location_label, item.category_name, item.community_name]
    .join(' ')
    .toLowerCase()

  return words.every((word) => text.includes(word))
}

// filters (all optional): search, reportType, categoryId, communityId, status,
// dateFrom, dateTo (YYYY-MM-DD, inclusive), location, hasLocation, sort ('newest' | 'oldest'), limit
// phase 5: GET /api/items?...
export async function listItems(filters = {}) {
  await networkDelay()

  let results = db.items.map(toItemView)

  if (filters.search) {
    results = results.filter((item) => matchesSearch(item, filters.search))
  }
  if (filters.reportType) {
    results = results.filter((item) => item.report_type === filters.reportType)
  }
  if (filters.categoryId) {
    results = results.filter((item) => item.category_id === filters.categoryId)
  }
  if (filters.communityId) {
    results = results.filter((item) => item.community_id === filters.communityId)
  }
  if (filters.status) {
    results = results.filter((item) => item.status === filters.status)
  }
  if (filters.dateFrom) {
    results = results.filter((item) => item.event_date >= filters.dateFrom)
  }
  if (filters.dateTo) {
    results = results.filter((item) => item.event_date <= filters.dateTo)
  }
  if (filters.location) {
    const place = filters.location.toLowerCase().trim()
    results = results.filter((item) => item.location_label.toLowerCase().includes(place))
  }
  if (filters.hasLocation) {
    results = results.filter(hasMapLocation)
  }

  results.sort(newestFirst)
  if (filters.sort === 'oldest') {
    results.reverse()
  }

  if (filters.limit) {
    results = results.slice(0, filters.limit)
  }

  return copy(results)
}

// null if it doesn't exist
// phase 5: GET /api/items/:id
export async function getItem(itemId) {
  await networkDelay()

  const item = db.items.find((row) => row.item_id === itemId)
  return item ? copy(toItemView(item)) : null
}

// Same category, opposite type first (for a lost item the found ones are the likely matches)
// phase 5: GET /api/items/:id/similar
export async function listSimilarItems(itemId, limit = 4) {
  await networkDelay()

  const item = db.items.find((row) => row.item_id === itemId)
  if (!item) {
    return []
  }

  const similar = db.items
    .filter((row) => row.item_id !== item.item_id && row.category_id === item.category_id && row.status !== 'CLOSED')
    .map(toItemView)
    .sort((rowA, rowB) => {
      const aIsOpposite = rowA.report_type !== item.report_type ? 0 : 1
      const bIsOpposite = rowB.report_type !== item.report_type ? 0 : 1
      return aIsOpposite - bIsOpposite || newestFirst(rowA, rowB)
    })

  return copy(similar.slice(0, limit))
}

// "  Monstera " and "monstera" should count as the same answer
export function normaliseAnswer(answer) {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Creates a LOST/FOUND report for the current user.
// photos are data urls, question_text + answer only for FOUND.
// Returns { item, photosSaved } (photosSaved is false if they didn't fit in localStorage).
// The form already validates, but the important rules are checked again here like the backend will.
// phase 5: POST /api/items (multipart, photos via multer)
export async function createItem(report) {
  await networkDelay(400)

  const userId = requireUserId()
  const isMember = isActiveMember(userId, report.community_id)

  if (!['LOST', 'FOUND'].includes(report.report_type)) {
    throw new Error('Choose whether you lost or found the item.')
  }
  if (!report.title?.trim() || !report.description?.trim() || !report.location_label?.trim() || !report.event_date) {
    throw new Error('Fill in every required field.')
  }
  if (!db.categories.some((row) => row.category_id === report.category_id)) {
    throw new Error('Choose a category.')
  }
  if (!isMember) {
    throw new Error('You can only report items in a community you belong to.')
  }
  if (report.report_type === 'FOUND' && (!report.question_text?.trim() || !report.answer?.trim())) {
    throw new Error('Found reports need a private question and its answer.')
  }

  const now = new Date().toISOString()
  const hasPin = typeof report.latitude === 'number' && typeof report.longitude === 'number'

  const item = {
    item_id: createId('item'),
    reporter_id: userId,
    community_id: report.community_id,
    category_id: report.category_id,
    report_type: report.report_type,
    title: report.title.trim(),
    description: report.description.trim(),
    event_date: report.event_date,
    location_label: report.location_label.trim(),
    latitude: hasPin ? report.latitude : null,
    longitude: hasPin ? report.longitude : null,
    status: 'OPEN',
    created_at: now,
    updated_at: now,
  }

  const images = (report.photos || []).map((photoUrl) => ({
    image_id: createId('image'),
    item_id: item.item_id,
    image_url: photoUrl,
    uploaded_at: now,
  }))

  // only FOUND reports get a question, and we only keep the hash
  const question =
    report.report_type === 'FOUND'
      ? {
          question_id: createId('question'),
          item_id: item.item_id,
          question_text: report.question_text.trim(),
          answer_hash: sha256(normaliseAnswer(report.answer)),
          is_active: true,
          created_at: now,
        }
      : null

  const photosSaved = insertReport({ item, images, question })

  return { item: copy(toItemView(item)), photosSaved }
}

// ---------- The logged in user's own reports (dashboard) ----------

// reportType: 'LOST' or 'FOUND'. Newest report first.
// FOUND reports also get pending_claims and total_claims.
// phase 5: GET /api/me/items?type=...
export async function listMyReports(reportType) {
  await networkDelay()

  const userId = requireUserId()
  const reports = db.items
    .filter((item) => item.reporter_id === userId && item.report_type === reportType)
    .sort((itemA, itemB) => itemB.created_at.localeCompare(itemA.created_at))
    .map((item) => {
      const claims = db.claims.filter((claim) => claim.item_id === item.item_id)
      return {
        ...toItemView(item),
        pending_claims: claims.filter((claim) => claim.status === 'PENDING').length,
        total_claims: claims.length,
      }
    })

  return copy(reports)
}

// Found items that could be this lost item: same community and category, still open.
// phase 5: GET /api/items/:id/matches
export async function listPossibleMatches(lostItemId, limit = 3) {
  await networkDelay()

  const lost = db.items.find((item) => item.item_id === lostItemId)
  if (!lost) {
    return []
  }

  const matches = db.items
    .filter(
      (item) =>
        item.report_type === 'FOUND' &&
        ['OPEN', 'CLAIM_PENDING'].includes(item.status) &&
        item.community_id === lost.community_id &&
        item.category_id === lost.category_id &&
        item.reporter_id !== lost.reporter_id,
    )
    .map(toItemView)
    .sort(newestFirst)

  return copy(matches.slice(0, limit))
}

// Only items that are still open can be edited
function findEditableItem(itemId, userId) {
  const item = db.items.find((row) => row.item_id === itemId)
  if (!item || item.reporter_id !== userId) {
    throw new Error('You can only change your own reports.')
  }
  if (!['OPEN', 'CLAIM_PENDING'].includes(item.status)) {
    throw new Error('This report is finished, so it can no longer be changed.')
  }
  return item
}

// changes: title, description, category_id, event_date, location_label.
// Lost/found and the community can't change (the schema blocks switching the type too).
// phase 5: PATCH /api/items/:id
export async function updateItem(itemId, changes) {
  await networkDelay(300)

  const item = findEditableItem(itemId, requireUserId())

  const errors = validateItemDetails(changes)
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0])
  }
  if (!db.categories.some((row) => row.category_id === changes.category_id)) {
    throw new Error('Choose a category.')
  }

  item.title = changes.title.trim()
  item.description = changes.description.trim()
  item.category_id = changes.category_id
  item.event_date = changes.event_date
  item.location_label = changes.location_label.trim()
  item.updated_at = new Date().toISOString()
  saveDb()

  return copy(toItemView(item))
}

// The reporter or a community admin can close a report that's still open.
// Waiting claims get rejected so the claimants know.
// phase 5: POST /api/items/:id/close
export async function closeItem(itemId) {
  await networkDelay(300)

  const userId = requireUserId()
  const item = db.items.find((row) => row.item_id === itemId)
  if (!item) {
    throw new Error('This report no longer exists.')
  }
  if (item.reporter_id !== userId && !isCommunityAdmin(userId, item.community_id)) {
    throw new Error('You can only close your own reports.')
  }
  if (!['OPEN', 'CLAIM_PENDING'].includes(item.status)) {
    throw new Error('Only open reports can be closed.')
  }

  const now = new Date().toISOString()
  for (const claim of db.claims) {
    if (claim.item_id === itemId && claim.status === 'PENDING') {
      claim.status = 'REJECTED'
      claim.review_note = 'The report was closed.'
      // the schema only lets the finder review a claim
      claim.reviewed_by = item.reporter_id
      claim.reviewed_at = now
      claim.updated_at = now
      addNotification({
        userId: claim.claimant_id,
        itemId,
        claimId: claim.claim_id,
        type: 'CLAIM_REJECTED',
        message: `The ${item.title} report was closed, so your claim was closed too.`,
      })
    }
  }

  item.status = 'CLOSED'
  item.updated_at = now
  saveDb()

  return copy(toItemView(item))
}
