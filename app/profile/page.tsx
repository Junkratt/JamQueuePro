'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState({
    name: '',
    nickname: '',
    email: '',
    location: '',
    instruments: [] as string[],
    musicPrefs: [] as string[],
    experience: 'beginner',
    bio: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Load user profile
    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setProfile({
          name: userData.name || '',
          nickname: userData.nickname || '',
          email: userData.email || '',
          location: userData.location || '',
          instruments: userData.instruments || [],
          musicPrefs: userData.musicPrefs || [],
          experience: userData.experience || 'beginner',
          bio: userData.bio || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Profile updated successfully!')
      } else {
        // Show the actual error from the API
        setMessage(`Failed to update profile: ${data.error || 'Unknown error'}`)
        console.error('API Error:', data)
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      console.error('Network error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const addInstrument = (instrument: string) => {
    if (instrument && !profile.instruments.includes(instrument)) {
      setProfile({
        ...profile,
        instruments: [...profile.instruments, instrument]
      })
    }
  }

  const removeInstrument = (instrument: string) => {
    setProfile({
      ...profile,
      instruments: profile.instruments.filter(i => i !== instrument)
    })
  }

  const addMusicPref = (genre: string) => {
    if (genre && !profile.musicPrefs.includes(genre)) {
      setProfile({
        ...profile,
        musicPrefs: [...profile.musicPrefs, genre]
      })
    }
  }

  const removeMusicPref = (genre: string) => {
    setProfile({
      ...profile,
      musicPrefs: profile.musicPrefs.filter(g => g !== genre)
    })
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  const instrumentOptions = [
    'Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Saxophone', 'Trumpet', 
    'Violin', 'Harmonica', 'Mandolin', 'Banjo', 'Ukulele', 'Piano'
  ]

  const genreOptions = [
    'Rock', 'Blues', 'Jazz', 'Country', 'Folk', 'Reggae', 'Funk', 
    'Pop', 'Alternative', 'Indie', 'Classical', 'R&B', 'Soul'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <span className="text-gray-700">
                {session.user?.name}
              </span>
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
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nickname (Stage Name)
                  </label>
                  <input
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Instruments</h2>
              
              <div className="mb-4">
                <select
                  onChange={(e) => {
                    addInstrument(e.target.value)
                    e.target.value = ''
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Add an instrument...</option>
                  {instrumentOptions.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.instruments.map(instrument => (
                  <span
                    key={instrument}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {instrument}
                    <button
                      type="button"
                      onClick={() => removeInstrument(instrument)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Music Preferences</h2>
              
              <div className="mb-4">
                <select
                  onChange={(e) => {
                    addMusicPref(e.target.value)
                    e.target.value = ''
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Add a genre...</option>
                  {genreOptions.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.musicPrefs.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeMusicPref(genre)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Bio</h2>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell other musicians about yourself..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
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
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
