import { copy, db, networkDelay, requireUserId, saveDb } from './mockStore'
import { toItemView } from './itemService'

// Community admins look after the communities where their membership has
// role COMMUNITY_ADMIN. They only ever see data from those communities.

function adminCommunityIds() {
  const userId = requireUserId()
  const ids = db.community_memberships
    .filter((row) => row.user_id === userId && row.role === 'COMMUNITY_ADMIN' && row.membership_status === 'ACTIVE')
    .map((row) => row.community_id)

  if (ids.length === 0) {
    throw new Error('Only community admins can open this page.')
  }
  return ids
}

// Numbers for each community you admin.
// recovery_rate = found items returned to their owner / all found reports
// phase 5: GET /api/admin/overview
export async function getAdminOverview() {
  await networkDelay()

  const communities = adminCommunityIds().map((communityId) => {
    const community = db.communities.find((row) => row.community_id === communityId)
    const items = db.items.filter((item) => item.community_id === communityId)
    const itemIds = items.map((item) => item.item_id)
    const found = items.filter((item) => item.report_type === 'FOUND')
    const returned = found.filter((item) => item.status === 'RETURNED')

    return {
      ...community,
      members: db.community_memberships.filter((row) => row.community_id === communityId).length,
      lost_reports: items.length - found.length,
      found_reports: found.length,
      open_reports: items.filter((item) => ['OPEN', 'CLAIM_PENDING'].includes(item.status)).length,
      pending_claims: db.claims.filter((claim) => itemIds.includes(claim.item_id) && claim.status === 'PENDING').length,
      returned: returned.length,
      recovery_rate: found.length ? Math.round((returned.length / found.length) * 100) : 0,
    }
  })

  return copy(communities)
}

// Everyone in your communities, with how many reports they made there
// phase 5: GET /api/admin/members
export async function listMembers() {
  await networkDelay()

  const communityIds = adminCommunityIds()
  const members = db.community_memberships
    .filter((row) => communityIds.includes(row.community_id))
    .map((membership) => {
      const user = db.users.find((row) => row.user_id === membership.user_id)
      const community = db.communities.find((row) => row.community_id === membership.community_id)
      return {
        ...membership,
        full_name: user.full_name,
        email: user.email,
        community_name: community.name,
        reports: db.items.filter((item) => item.reporter_id === user.user_id && item.community_id === community.community_id).length,
      }
    })
    .sort((rowA, rowB) => rowA.full_name.localeCompare(rowB.full_name))

  return copy(members)
}

// Suspend or bring back a member. A suspended member can't report or claim in that community.
// phase 5: PATCH /api/admin/members/:id
export async function setMemberStatus(membershipId, status) {
  await networkDelay(300)

  const userId = requireUserId()
  const membership = db.community_memberships.find((row) => row.membership_id === membershipId)

  if (!membership || !adminCommunityIds().includes(membership.community_id)) {
    throw new Error('You can only manage members of your own communities.')
  }
  if (membership.user_id === userId) {
    throw new Error("You can't suspend yourself.")
  }
  if (membership.role === 'COMMUNITY_ADMIN') {
    throw new Error("Admins can't suspend other admins.")
  }
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    throw new Error('Unknown status.')
  }

  membership.membership_status = status
  saveDb()
}

// Every report in your communities, newest first. Closing one uses closeItem() from itemService.
// phase 5: GET /api/admin/items
export async function listCommunityReports() {
  await networkDelay()

  const communityIds = adminCommunityIds()
  const reports = db.items
    .filter((item) => communityIds.includes(item.community_id))
    .sort((itemA, itemB) => itemB.created_at.localeCompare(itemA.created_at))
    .map(toItemView)

  return copy(reports)
}

// Every claim in your communities. Admins can only look, the finder decides.
// rejected_before helps spot people who claim lots of things that aren't theirs.
// phase 5: GET /api/admin/claims
export async function listCommunityClaims() {
  await networkDelay()

  const communityIds = adminCommunityIds()
  const claims = db.claims
    .map((claim) => ({ claim, item: db.items.find((row) => row.item_id === claim.item_id) }))
    .filter(({ item }) => communityIds.includes(item.community_id))
    .sort((rowA, rowB) => rowB.claim.created_at.localeCompare(rowA.claim.created_at))
    .map(({ claim, item }) => {
      const claimant = db.users.find((row) => row.user_id === claim.claimant_id)
      const finder = db.users.find((row) => row.user_id === item.reporter_id)
      return {
        ...claim,
        item_title: item.title,
        claimant_name: claimant.full_name,
        finder_name: finder.full_name,
        rejected_before: db.claims.filter((row) => row.claimant_id === claim.claimant_id && row.status === 'REJECTED').length,
      }
    })

  return copy(claims)
}
