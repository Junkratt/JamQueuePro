'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EventDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [event, setEvent] = useState<any>(null)
  const [signups, setSignups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [message, setMessage] = useState('')
  const [userSignup, setUserSignup] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchEvent()
    fetchSignups()
  }, [session, status, router, params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
      }
    } catch (error) {
      console.error('Failed to load event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSignups = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/signups`)
      if (response.ok) {
        const signupData = await response.json()
        setSignups(signupData)
        
        // Check if current user already signed up
        const currentUserSignup = signupData.find((signup: any) => 
          signup.user?.email === session?.user?.email
        )
        setUserSignup(currentUserSignup)
      }
    } catch (error) {
      console.error('Failed to load signups:', error)
    }
  }

  const handleSignup = async () => {
    setIsSigningUp(true)
    setMessage('')

    try {
      const response = await fetch(`/api/events/${params.id}/signups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: session?.user?.email,
          instruments: ['Guitar'], // Default for now
          notes: ''
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Successfully signed up for the jam session!')
        fetchSignups() // Refresh the signup list
      } else {
        setMessage(`Failed to sign up: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleCancelSignup = async () => {
    if (!userSignup) return

    try {
      const response = await fetch(`/api/events/${params.id}/signups/${userSignup.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('Signup cancelled successfully.')
        setUserSignup(null)
        fetchSignups()
      } else {
        setMessage('Failed to cancel signup.')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || !event) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Event Details</h1>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/events')}
                className="text-gray-600 hover:text-gray-900"
              >
                All Events
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <div className="space-y-2 mb-6">
                  <p className="text-lg text-gray-600">
                    <strong>Venue:</strong> {event.venue?.name}
                  </p>
                  <p className="text-gray-600">
                    {event.venue?.address}, {event.venue?.city}, {event.venue?.state}
                  </p>
                  <p className="text-lg text-blue-600">
                    <strong>{new Date(event.dateTime).toLocaleDateString()}</strong> at{' '}
                    <strong>{new Date(event.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                  </p>
                </div>
                
                {event.description && (
                  <p className="text-gray-700 mb-6">{event.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{event.duration} minutes</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Sign Up</h2>
                
                {userSignup ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <p className="text-green-800 mb-2">You're signed up!</p>
                    <p className="text-sm text-green-700">Queue position: #{userSignup.queuePosition}</p>
                    <button
                      onClick={handleCancelSignup}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Cancel Signup
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignup}
                    disabled={isSigningUp}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 mb-4"
                  >
                    {isSigningUp ? 'Signing up...' : 'Sign Up to Perform'}
                  </button>
                )}

                {message && (
                  <div className={`rounded-md p-4 mb-4 ${
                    message.includes('success') || message.includes('Successfully')
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">Performance Queue</h2>
            
            {signups.length === 0 ? (
              <p className="text-gray-600">No one has signed up yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {signups.map((signup: any, index: number) => (
                  <div key={signup.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{signup.user?.name || 'Anonymous'}</p>
                        {signup.instruments?.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {signup.instruments.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Signed up {new Date(signup.signupTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
