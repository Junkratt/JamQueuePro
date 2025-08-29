'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'

export default function VenueRegister() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    checkUserRole()
  }, [session, status, router])

  const checkUserRole = async () => {
    try {
      // Check if user has admin role
      const adminResponse = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}&limit=1`)
      if (adminResponse.ok) {
        setUserRole('admin')
        setVenue(prev => ({ ...prev, organizerId: session?.user?.email || '' }))
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
          setVenue(prev => ({ ...prev, organizerId: session?.user?.email || '' }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    // Check role again before submission
    if (userRole === 'performer') {
      setMessage('Only venue owners and organizers can register venues. Please contact support if you believe this is an error.')
      return
    }

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

  if (status === 'loading' || isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏪</div>
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
              Venue registration is currently limited to venue owners and event organizers. 
              This helps us maintain quality and ensure venues are managed by authorized personnel.
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
                onClick={() => router.push('/venues/search')}
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
                Browse Venues
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Register Your Venue
          </h1>
          <p style={{ color: '#6b7280' }}>
            Add your venue to help musicians find great places to jam
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Basic Information</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
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

              <div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>City *</label>
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
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>State *</label>
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
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>ZIP *</label>
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
              Register Venue
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
