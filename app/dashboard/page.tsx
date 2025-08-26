'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status !== 'loading' && !session) {
      router.push('/auth/signin')
    }
  }, [session, status, router, mounted])

  if (!mounted || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/profile"
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
              <span className="text-gray-700">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Musician Tools</h2>
              <div className="space-y-3">
                <Link 
                  href="/profile"
                  className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 transition-colors"
                >
                  Update Your Profile
                </Link>
                <button className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors">
                  Browse Jam Sessions (Coming Soon)
                </button>
                <button className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors">
                  Find Musicians (Coming Soon)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Venue Owner Tools</h2>
              <div className="space-y-3">
                <Link 
                  href="/venues/register"
                  className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md text-green-700 transition-colors"
                >
                  Register Your Venue
                </Link>
                <Link 
                  href="/events/create"
                  className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md text-purple-700 transition-colors"
                >
                  Create Jam Session
                </Link>
                <button className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors">
                  Manage Events (Coming Soon)
                </button>
                <button className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors">
                  View Analytics (Coming Soon)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity yet. Complete your profile or register a venue to get started!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
