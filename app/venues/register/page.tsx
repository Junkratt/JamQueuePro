'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    amenities: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

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
          router.push('/dashboard')
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

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  const amenityOptions = [
    'Sound System', 'Microphones', 'Drum Kit', 'Bass Amp', 'Guitar Amps', 
    'Keyboard', 'Stage Lighting', 'PA System', 'Mixing Board', 'Parking',
    'Food Service', 'Bar', 'Outdoor Seating', 'Dance Floor'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Register Venue</h1>
            
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Venue Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue.name}
                    onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue.address}
                    onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={venue.city}
                      onChange={(e) => setVenue({ ...venue, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={venue.state}
                      onChange={(e) => setVenue({ ...venue, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={venue.zipCode}
                      onChange={(e) => setVenue({ ...venue, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={venue.email}
                      onChange={(e) => setVenue({ ...venue, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={venue.phone}
                      onChange={(e) => setVenue({ ...venue, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={venue.website}
                      onChange={(e) => setVenue({ ...venue, website: e.target.value })}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (people)
                    </label>
                    <input
                      type="number"
                      value={venue.capacity}
                      onChange={(e) => setVenue({ ...venue, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={venue.description}
                    onChange={(e) => setVenue({ ...venue, description: e.target.value })}
                    placeholder="Describe your venue, atmosphere, and what makes it special for musicians..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Amenities & Equipment</h2>
              
              <div className="mb-4">
                <select
                  onChange={(e) => {
                    addAmenity(e.target.value)
                    e.target.value = ''
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Add an amenity...</option>
                  {amenityOptions.map(amenity => (
                    <option key={amenity} value={amenity}>{amenity}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {venue.amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {message && (
              <div className={`rounded-md p-4 ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Register Venue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
