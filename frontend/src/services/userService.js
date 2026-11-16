import { copy, db, getSessionUserId, networkDelay } from './mockStore'

// The logged in user, or null for guests.
// communities = the ones they're an active member of, with their role there.
// phase 5: GET /api/me
export async function getCurrentUser() {
  await networkDelay(100)

  const userId = getSessionUserId()
  const user = db.users.find((row) => row.user_id === userId)
  if (!user) {
    return null
  }

  const communities = db.community_memberships
    .filter((row) => row.user_id === userId && row.membership_status === 'ACTIVE')
    .map((membership) => {
      const community = db.communities.find((row) => row.community_id === membership.community_id)
      return { ...community, role: membership.role }
    })

  return copy({
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    communities,
    isAdmin: communities.some((community) => community.role === 'COMMUNITY_ADMIN'),
  })
}
