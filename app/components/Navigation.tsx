'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Jam Queue Pro
          </Link>
          
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <span className="text-gray-600">Loading...</span>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
