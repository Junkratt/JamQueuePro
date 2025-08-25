'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

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
          <h2 className="text-2xl font-bold mb-6">Welcome to your Dashboard</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Dashboard features coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
