'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    userEvents: 0,
    venues: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status !== 'loading' && !session) {
      router.push('/auth/signin')
    }
  }, [session, status, router, mounted])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name?.split(' ')[0] || 'Musician'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your jam sessions, discover venues, and connect with the music community.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🎵</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">🎤</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Signups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.userEvents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🏪</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Local Venues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.venues}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Musician Tools */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎸</span>
                Musician Tools
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/events"
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <span className="text-blue-600">🎵</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Browse Jam Sessions</h3>
                      <p className="text-sm text-gray-500">Find and sign up for local jam nights</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
                </Link>

                <Link 
                  href="/venues/search"
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <span className="text-green-600">📍</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Find Local Venues</h3>
                      <p className="text-sm text-gray-500">Discover venues near you</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
                </Link>

                <Link 
                  href="/profile"
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <span className="text-purple-600">👤</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Update Profile</h3>
                      <p className="text-sm text-gray-500">Manage your musician profile</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-purple-600 transition-colors">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Venue Owner Tools */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏪</span>
                Venue Owner Tools
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/venues/register"
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <span className="text-orange-600">🏪</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Register Your Venue</h3>
                      <p className="text-sm text-gray-500">Add your venue to the platform</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-orange-600 transition-colors">→</span>
                </Link>

                <Link 
                  href="/events/create"
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <span className="text-indigo-600">➕</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Create Jam Session</h3>
                      <p className="text-sm text-gray-500">Schedule events at your venue</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">→</span>
                </Link>

                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">📊</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Event Analytics</h3>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🎵</span>
              </div>
              <p className="text-gray-500 mb-2">No recent activity yet</p>
              <p className="text-sm text-gray-400">
                Once you start signing up for jam sessions, your activity will appear here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
