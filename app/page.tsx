'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [dbStatus, setDbStatus] = useState({
    success: false,
    userCount: 0,
    venueCount: 0,
    message: 'Connecting...',
    loading: true
  })

  useEffect(() => {
    fetch('/api/db-setup', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbStatus({
            success: true,
            userCount: data.counts?.users || 0,
            venueCount: data.counts?.venues || 0,
            message: 'Connected',
            loading: false
          })
        } else {
          setDbStatus({
            success: false,
            userCount: 0,
            venueCount: 0,
            message: 'Error',
            loading: false
          })
        }
      })
      .catch(() => {
        setDbStatus({
          success: false,
          userCount: 0,
          venueCount: 0,
          message: 'Error',
          loading: false
        })
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Jam Queue Pro
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Jam Queue Pro
            </h1>
            <p className="text-xl text-gray-600">
              Connect musicians, venues, and unforgettable jam sessions
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">For Musicians</h3>
              <p className="text-gray-600">Find local jams, connect with other players, and showcase your skills</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">For Venues</h3>
              <p className="text-gray-600">Manage events, attract performers, and build your music community</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">For Organizers</h3>
              <p className="text-gray-600">Streamline event management and keep the music flowing</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Database:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  dbStatus.loading 
                    ? 'bg-yellow-100 text-yellow-800'
                    : dbStatus.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dbStatus.message}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Users:</span>
                <span className="text-gray-600">{dbStatus.userCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Venues:</span>
                <span className="text-gray-600">{dbStatus.venueCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Ready to get started?</p>
            <Link 
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
