'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'

export default function VenueRegister() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [venue, setVenue] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    capacity: '',
    amenities: [] as string[],
    venuePhoto: '',
    instrumentsProvided: [] as string[],
    hasPASystem: false,
    jamNightDetails: '',
    organizerId: ''
  })
  const [organizers, setOrganizers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchOrganizers()
  }, [session, status, router])

  const fetchOrganizers = async () => {
    try {
      // For now, we'll just use current user as default organizer
      // In the future, this could fetch approved organizers
      setVenue(prev => ({ ...prev, organizerId: session?.user?.email || '' }))
    } catch (error) {
      console.error('Failed to load organizers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const venueData = {
        ...venue,
        capacity: venue.capacity ? parseInt(venue.capacity) : null,
        ownerId: session?.user?.email
      }

      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venueData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Venue registered successfully!')
        setTimeout(() => {
          router.push(`/venues/${data.id}`)
        }, 2000)
      } else {
        setMessage(`Failed to register venue: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !venue.amenities.includes(amenity)) {
      setVenue({
        ...venue,
        amenities: [...venue.amenities, amenity]
      })
    }
  }

  const removeAmenity = (amenity: string) => {
    setVenue({
      ...venue,
      amenities: venue.amenities.filter(a => a !== amenity)
    })
  }

  const addInstrument = (instrument: string) => {
    if (instrument && !venue.instrumentsProvided.includes(instrument)) {
      setVenue({
        ...venue,
        instrumentsProvided: [...venue.instrumentsProvided, instrument]
      })
    }
  }

  const removeInstrument = (instrument: string) => {
    setVenue({
      ...venue,
      instrumentsProvided: venue.instrumentsProvided.filter(i => i !== instrument)
    })
  }

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (!session) return null

  const amenityOptions = [
    'Sound System', 'Microphones', 'Drum Kit', 'Bass Amp', 'Guitar Amps', 
    'Keyboard', 'Stage Lighting', 'PA System', 'Mixing Board', 'Parking',
    'Food Service', 'Bar', 'Outdoor Seating', 'Dance Floor'
  ]

  const instrumentOptions = [
    'Drum Kit', 'Bass Amp', 'Guitar Amps', 'Keyboard/Piano', 'Microphones',
    'Acoustic Guitar', 'Electric Guitar', 'Bass Guitar', 'Cajon', 'Harmonica',
    'Saxophone', 'Trumpet', 'Violin', 'Mandolin'
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
          Register Your Venue
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Basic Venue Information */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Basic Information</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={venue.name}
                onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                placeholder="The Blue Note Cafe"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Venue Photo URL (optional)
              </label>
              <input
                type="url"
                value={venue.venuePhoto}
                onChange={(e) => setVenue({ ...venue, venuePhoto: e.target.value })}
                placeholder="https://example.com/venue-photo.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Add a photo to help performers recognize your venue
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Street Address *
              </label>
              <input
                type="text"
                required
                value={venue.address}
                onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                placeholder="123 Music Street"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={venue.city}
                  onChange={(e) => setVenue({ ...venue, city: e.target.value })}
                  placeholder="Nashville"
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
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={venue.state}
                  onChange={(e) => setVenue({ ...venue, state: e.target.value })}
                  placeholder="TN"
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
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={venue.zipCode}
                  onChange={(e) => setVenue({ ...venue, zipCode: e.target.value })}
                  placeholder="37203"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={venue.email}
                  onChange={(e) => setVenue({ ...venue, email: e.target.value })}
                  placeholder="info@bluenotecafe.com"
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={venue.phone}
                  onChange={(e) => setVenue({ ...venue, phone: e.target.value })}
                  placeholder="(615) 555-0123"
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
                  Website
                </label>
                <input
                  type="url"
                  value={venue.website}
                  onChange={(e) => setVenue({ ...venue, website: e.target.value })}
                  placeholder="https://bluenotecafe.com"
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
                Venue Description
              </label>
              <textarea
                value={venue.description}
                onChange={(e) => setVenue({ ...venue, description: e.target.value })}
                placeholder="Describe your venue's atmosphere, style of music, and what makes it special..."
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

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Capacity (people)
              </label>
              <input
                type="number"
                value={venue.capacity}
                onChange={(e) => setVenue({ ...venue, capacity: e.target.value })}
                placeholder="150"
                style={{
                  width: '200px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Music Equipment */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Music Equipment</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={venue.hasPASystem}
                  onChange={(e) => setVenue({ ...venue, hasPASystem: e.target.checked })}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: '500' }}>PA System Available</span>
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Instruments Provided
              </label>
              <select
                onChange={(e) => {
                  addInstrument(e.target.value)
                  e.target.value = ''
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <option value="">Add an instrument...</option>
                {instrumentOptions.map(instrument => (
                  <option key={instrument} value={instrument}>{instrument}</option>
                ))}
              </select>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {venue.instrumentsProvided.map(instrument => (
                  <span
                    key={instrument}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    🎸 {instrument}
                    <button
                      type="button"
                      onClick={() => removeInstrument(instrument)}
                      style={{
                        marginLeft: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#1e40af',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Additional Amenities
              </label>
              <select
                onChange={(e) => {
                  addAmenity(e.target.value)
                  e.target.value = ''
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <option value="">Add an amenity...</option>
                {amenityOptions.map(amenity => (
                  <option key={amenity} value={amenity}>{amenity}</option>
                ))}
              </select>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {venue.amenities.map(amenity => (
                  <span
                    key={amenity}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    ✓ {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      style={{
                        marginLeft: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#065f46',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Jam Night Details */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Jam Night Information</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Primary Organizer Email
              </label>
              <input
                type="email"
                value={venue.organizerId}
                onChange={(e) => setVenue({ ...venue, organizerId: e.target.value })}
                placeholder={session?.user?.email || ''}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                This organizer will be featured on the venue profile
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                Jam Night Details & Rules
              </label>
              <textarea
                value={venue.jamNightDetails}
                onChange={(e) => setVenue({ ...venue, jamNightDetails: e.target.value })}
                placeholder="Describe your jam night format, rules, sign-up process, time limits, genres welcome, etc..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Help performers know what to expect at your jam nights
              </p>
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
              {isLoading ? 'Registering Venue...' : 'Register Venue'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
