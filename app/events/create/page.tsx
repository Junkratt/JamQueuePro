'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CreateEvent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [venues, setVenues] = useState([])
  const [event, setEvent] = useState({
    title: '',
    description: '',
    venueId: '',
    dateTime: '',
    duration: 240,
    type: 'open_mic',
    maxCapacity: '',
    signupDeadline: '',
    houseband: false,
    housebandSongs: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchVenues()
  }, [session, status, router])

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues')
      if (response.ok) {
        const venueData = await response.json()
        setVenues(venueData)
      }
    } catch (error) {
      console.error('Failed to load venues:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const eventData = {
        ...event,
        maxCapacity: event.maxCapacity ? parseInt(event.maxCapacity) : null,
        organizerEmail: session?.user?.email
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Event created successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setMessage(`Failed to create event: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Create Event</h1>
            
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Create Jam Session</h2>
            <p className="text-gray-600">
              Event creation system is being built. This page will allow you to:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Set event details (title, date, time)</li>
              <li>• Choose venue location</li>
              <li>• Set performer limits and signup deadlines</li>
              <li>• Configure house band support</li>
            </ul>
            
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
