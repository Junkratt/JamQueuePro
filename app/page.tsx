'use client'

import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Connect Musicians,</span>
                    <span className="block text-blue-600">Venues & Jam Sessions</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    The ultimate platform for organizing open mic nights, jam sessions, and connecting with local music venues. Sign up, find events, and showcase your talent.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/auth/signin"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                      >
                        Get Started Free
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="#features"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to organize jam sessions
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                From finding venues to managing performance queues, we've got you covered.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-xl">🎵</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">For Musicians</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Discover local jam sessions, connect with other musicians, and showcase your talent at venues near you.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <span className="text-xl">🏪</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">For Venues</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Attract talented performers, manage events, and build a thriving music community at your location.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                    <span className="text-xl">📋</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">For Organizers</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Streamline event management with automated queues, real-time updates, and seamless coordination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Platform Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      dbStatus.loading 
                        ? 'bg-yellow-400' 
                        : dbStatus.success 
                        ? 'bg-green-400' 
                        : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">Database</span>
                  </div>
                  <p className="text-sm text-gray-500">{dbStatus.message}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{dbStatus.userCount}</p>
                  <p className="text-sm text-gray-500">Active Musicians</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{dbStatus.venueCount}</p>
                  <p className="text-sm text-gray-500">Partner Venues</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to join the jam?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Connect with musicians and venues in your area. Start your musical journey today.
            </p>
            <Link
              href="/auth/signin"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto transition-colors duration-200"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
