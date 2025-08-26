'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'

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
          router.push('/events')
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

  const addSong = (song: string) => {
    if (song && !event.housebandSongs.includes(song)) {
      setEvent({
        ...event,
        housebandSongs: [...event.housebandSongs, song]
      })
    }
  }

  const removeSong = (song: string) => {
    setEvent({
      ...event,
      housebandSongs: event.housebandSongs.filter(s => s !== song)
    })
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    )
  }

  if (!session) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
          Create Jam Session
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Event Details</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Event Title *
              </label>
              <input
                type="text"
                required
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                placeholder="e.g., Open Mic Night, Blues Jam Session"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Event Type *
                </label>
                <select
                  value={event.type}
                  onChange={(e) => setEvent({ ...event, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="open_mic">Open Mic</option>
                  <option value="full_band">Full Band Jam</option>
                  <option value="songwriter">Songwriter Night</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                  onChange={(e) => setEvent({ ...event, duration: parseInt(e.target.value) || 240 })}
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Description
              </label>
              <textarea
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                placeholder="Describe your event, what musicians should expect..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Additional Options</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Max Performers
                </label>
                <input
                  type="number"
                  value={event.maxCapacity}
                  onChange={(e) => setEvent({ ...event, maxCapacity: e.target.value })}
                  placeholder="Leave empty for unlimited"
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
                  Signup Deadline
                </label>
                <input
                  type="datetime-local"
                  value={event.signupDeadline}
                  onChange={(e) => setEvent({ ...event, signupDeadline: e.target.value })}
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={event.houseband}
                  onChange={(e) => setEvent({ ...event, houseband: e.target.checked })}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: '500' }}>House band available to accompany performers</span>
              </label>
            </div>

            {event.houseband && (
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Songs the house band knows
                </label>
                
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Add a song..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSong((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem 0 0 0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addSong(input.value)
                      input.value = ''
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0 0.375rem 0.375rem 0',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {event.housebandSongs.map(song => (
                    <span
                      key={song}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '9999px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {song}
                      <button
                        type="button"
                        onClick={() => removeSong(song)}
                        style={{
                          marginLeft: '0.5rem',
                          background: 'none',
                          border: 'none',
                          color: '#1e40af',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
