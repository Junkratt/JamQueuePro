'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

export default function VenueProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [venue, setVenue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchVenue()
    }
  }, [params.id])

  const fetchVenue = async () => {
    try {
      const response = await fetch(`/api/venues/${params.id}`)
      if (response.ok) {
        const venueData = await response.json()
        setVenue(venueData)
      } else {
        router.push('/venues/search')
      }
    } catch (error) {
      console.error('Failed to load venue:', error)
      router.push('/venues/search')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏪</div>
            <div>Loading venue details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Venue Not Found</h1>
          <Link href="/venues/search" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Browse All Venues
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            {venue.name}
          </h1>
          
          <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              📍 {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
            </p>
            {venue.phone && (
              <p style={{ marginBottom: '0.25rem' }}>
                📞 <a href={`tel:${venue.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {venue.phone}
                </a>
              </p>
            )}
            {venue.website && (
              <p style={{ marginBottom: '0.25rem' }}>
                🌐 <a href={venue.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  Visit Website
                </a>
              </p>
            )}
          </div>

          {venue.description && (
            <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
              {venue.description}
            </p>
          )}

          {venue.capacity && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', display: 'inline-block' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{venue.capacity}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Capacity</div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            🎸 Equipment & Amenities
          </h3>
          
          {venue.hasPASystem && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <span style={{ color: '#065f46', fontWeight: '500' }}>🔊 PA System Available</span>
            </div>
          )}

          {venue.instrumentsProvided && venue.instrumentsProvided.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                Instruments Provided:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {venue.instrumentsProvided.map((instrument: string) => (
                  <span key={instrument} style={{ padding: '0.5rem', backgroundColor: '#dbeafe', borderRadius: '0.375rem', color: '#1e40af', fontSize: '0.875rem' }}>
                    🎸 {instrument}
                  </span>
                ))}
              </div>
            </div>
          )}

          {venue.amenities && venue.amenities.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                Additional Amenities:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {venue.amenities.map((amenity: string) => (
                  <span key={amenity} style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', color: '#374151', fontSize: '0.875rem' }}>
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Quick Actions
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href={`/events/create?venueId=${venue.id}`}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              🎵 Create Event Here
            </Link>
            
            {venue.phone && (
              
                href={`tel:${venue.phone}`}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                📞 Call Venue
              </a>
            )}
            
            <Link
              href="/venues/search"
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db'
              }}
            >
              ← Back to Venues
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
