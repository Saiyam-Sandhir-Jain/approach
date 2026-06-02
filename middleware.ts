import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  // Protect all routes except login, API auth routes, and static files
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon-192.png|manifest.json).*)',
  ],
}
