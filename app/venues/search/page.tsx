'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VenueSearch() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [venues, setVenues] = useState([])
  const [searchZip, setSearchZip] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchRadius, setSearchRadius] = useState(25)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchUserProfile()
    fetchAllVenues() // Show all venues initially
  }, [session, status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
        // Pre-populate search with user's ZIP if available
        if (profile.location) {
          const zipMatch = profile.location.match(/\b\d{5}\b/)
          if (zipMatch) {
            setSearchZip(zipMatch[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const fetchAllVenues = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/venues')
      if (response.ok) {
        const venueData = await response.json()
        setVenues(venueData)
      }
    } catch (error) {
      console.error('Failed to load venues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchZip) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/venues/search?zip=${searchZip}&radius=${searchRadius}`)
      if (response.ok) {
        const venueData = await response.json()
        setVenues(venueData)
      }
    } catch (error) {
      console.error('Failed to search venues:', error)
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
            <h1 className="text-xl font-bold text-gray-900">Find Venues</h1>
            
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Search Venues Near You</h2>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={searchZip}
                  onChange={(e) => setSearchZip(e.target.value)}
                  placeholder={userProfile?.location ? "Enter ZIP or use profile location" : "Enter ZIP code"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius (miles)
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100 miles</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!searchZip || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {userProfile?.location && (
              <p className="text-sm text-gray-600 mt-2">
                Your profile location: {userProfile.location}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">
                  {isLoading ? 'Searching...' : 'No venues found in this area.'}
                </p>
              </div>
            ) : (
              venues.map((venue: any) => (
                <div key={venue.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{venue.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 text-sm">{venue.address}</p>
                    <p className="text-gray-600 text-sm">{venue.city}, {venue.state} {venue.zipCode}</p>
                    
                    {venue.phone && (
                      <p className="text-gray-600 text-sm">📞 {venue.phone}</p>
                    )}
                    
                    {venue.website && (
                      <a 
                        href={venue.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>

                  {venue.description && (
                    <p className="text-gray-700 text-sm mb-4">{venue.description}</p>
                  )}

                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 3).map((amenity: string) => (
                          <span key={amenity} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span className="text-xs text-gray-600">+{venue.amenities.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    {venue.capacity && <span>Capacity: {venue.capacity}</span>}
                    {venue._count?.events !== undefined && (
                      <span>{venue._count.events} events</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
