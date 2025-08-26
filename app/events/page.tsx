'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Events() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchEvents()
  }, [session, status, router])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const eventData = await response.json()
        setEvents(eventData)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Jam Sessions</h1>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <span className="text-gray-700">{session.user?.name}</span>
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
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Upcoming Jam Sessions</h2>
            <p className="text-gray-600">Sign up to perform at local venues</p>
          </div>

          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">No jam sessions scheduled yet.</p>
              <Link
                href="/events/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-block"
              >
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event: any) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600">{event.venue?.name} • {event.venue?.city}, {event.venue?.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {new Date(event.dateTime).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        {new Date(event.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{event.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Signups</p>
                      <p className="font-medium">
                        {event._count?.signups || 0}
                        {event.maxCapacity ? ` / ${event.maxCapacity}` : ''}
                      </p>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-700 mb-4">{event.description}</p>
                  )}

                  {event.houseband && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-green-700 mb-2">House band available</p>
                      {event.housebandSongs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {event.housebandSongs.slice(0, 3).map((song: string) => (
                            <span key={song} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {song}
                            </span>
                          ))}
                          {event.housebandSongs.length > 3 && (
                            <span className="text-xs text-gray-600">
                              +{event.housebandSongs.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Organized by {event.organizer?.name || 'Unknown'}
                    </p>
                    <Link
                      href={`/events/${event.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      View Details & Sign Up
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
