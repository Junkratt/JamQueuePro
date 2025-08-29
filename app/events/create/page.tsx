'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'

export default function CreateEvent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [venues, setVenues] = useState([])
  const [event, setEvent] = useState({
    title: '',
    description: '',
    dateTime: '',
    duration: '240',
    type: 'open_jam',
    maxCapacity: '',
    signupDeadline: '',
    houseband: false,
    housebandSongs: [] as string[],
    venueId: '',
    organizerEmail: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    checkUserRole()
    fetchVenues()
  }, [session, status, router])

  const checkUserRole = async () => {
    try {
      // Check if user has admin role
      const adminResponse = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}&limit=1`)
      if (adminResponse.ok) {
        setUserRole('admin')
        setEvent(prev => ({ ...prev, organizerEmail: session?.user?.email || '' }))
        setIsLoading(false)
        return
      }

      // Check if user has created venues before (organizer)
      const venuesResponse = await fetch('/api/venues')
      if (venuesResponse.ok) {
        const venues = await venuesResponse.json()
        const userVenues = venues.filter((venue: any) => 
          venue.organizerId === session?.user?.email || 
          venue.ownerId === session?.user?.email
        )
        
        if (userVenues.length > 0) {
          setUserRole('organizer')
          setEvent(prev => ({ ...prev, organizerEmail: session?.user?.email || '' }))
        } else {
          setUserRole('performer')
        }
      } else {
        setUserRole('performer')
      }
    } catch (error) {
      console.error('Failed to check user role:', error)
      setUserRole('performer')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues')
      if (response.ok) {
        const venuesData = await response.json()
        setVenues(venuesData)
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (userRole === 'performer') {
      setMessage('Only venue owners and organizers can create events. Please contact support if you believe this is an error.')
      return
    }

    try {
      const eventData = {
        ...event,
        duration: parseInt(event.duration),
        maxCapacity: event.maxCapacity ? parseInt(event.maxCapacity) : null,
        signupDeadline: event.signupDeadline ? new Date(event.signupDeadline).toISOString() : null,
        dateTime: new Date(event.dateTime).toISOString()
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
          router.push(`/events/${data.id}`)
        }, 2000)
      } else {
        setMessage(`Failed to create event: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵</div>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Block access for performers
  if (userRole === 'performer') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
              Access Restricted
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              Event creation is currently limited to venue owners and event organizers. 
              This ensures events are created by authorized personnel who can manage them properly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push('/events')}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Create Jam Session
          </h1>
          <p style={{ color: '#6b7280' }}>
            Schedule a new jam session for musicians to enjoy
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  placeholder="Thursday Night Open Jam"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Venue *
                </label>
                <select
                  required
                  value={event.venueId}
                  onChange={(e) => setEvent({ ...event, venueId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a venue...</option>
                  {venues.map((venue: any) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}, {venue.state}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={event.dateTime}
                    onChange={(e) => setEvent({ ...event, dateTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={event.duration}
                    onChange={(e) => setEvent({ ...event, duration: e.target.value })}
                    placeholder="240"
                    min="60"
                    max="480"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div style={{
              padding: '1rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
              color: message.includes('success') ? '#065f46' : '#991b1b'
            }}>
              {message}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Create Event
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
