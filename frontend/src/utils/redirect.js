// Where to go after logging in, from ?redirect=...
// Only paths inside Findr, so a link like ?redirect=https://evil.site can't send people away.
export function safeRedirect(searchParams, fallback = '/dashboard') {
  const target = searchParams.get('redirect')
  if (target && target.startsWith('/') && !target.startsWith('//')) {
    return target
  }
  return fallback
}
