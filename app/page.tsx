import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { SessionData, sessionOptions } from '@/lib/session'
import { Logo } from '@/app/components/Logo'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const signedIn = !!session.email

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between p-6 md:px-8">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="/browse" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Browse
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-[#ec3750] text-white text-sm font-semibold rounded-lg hover:bg-[#d42f45] transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <a
              href="/api/auth/login"
              className="inline-flex items-center px-4 py-2 bg-[#ec3750] text-white text-sm font-semibold rounded-lg hover:bg-[#d42f45] transition-colors"
            >
              Sign in
            </a>
          )}
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center px-8 py-24">
        <div className="max-w-lg w-full space-y-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Take Two</h1>
          <p className="text-lg text-gray-500">
            View and share your Hack Club hardware projects
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              Sign in failed. Please try again.
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/browse"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Profiles
            </Link>
            {signedIn ? (
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-[#ec3750] text-white font-semibold rounded-lg hover:bg-[#d42f45] transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <a
                href="/api/auth/login"
                className="px-6 py-3 bg-[#ec3750] text-white font-semibold rounded-lg hover:bg-[#d42f45] transition-colors"
              >
                Sign in with Hack Club
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
