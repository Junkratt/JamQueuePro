'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

function VenueProfile() {
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
    const loadingElement = (
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
    return loadingElement
  }

  if (!venue) {
    const notFoundElement = (
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
    return notFoundElement
  }

  const mainElement = (
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
          </div>
          {venue.description && (
            <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
              {venue.description}
            </p>
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

  return mainElement
}

export default VenueProfile
