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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '4rem 1rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Connect Musicians, Venues & Jam Sessions
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '2rem',
            maxWidth: '800px',
            margin: '0 auto 2rem'
          }}>
            The ultimate platform for organizing open mic nights, jam sessions, and connecting with local music venues.
          </p>
          
          <div style={{ marginBottom: '3rem' }}>
            <Link
              href="/auth/signin"
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                marginRight: '1rem',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              style={{
                display: 'inline-block',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" style={{ 
          backgroundColor: 'white', 
          padding: '4rem 1rem',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '3rem',
              color: '#1f2937'
            }}>
              Features
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#2563eb',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🎵
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  For Musicians
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Discover local jam sessions, connect with other musicians, and showcase your talent.
                </p>
              </div>

              <div style={{
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#10b981',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🏪
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  For Venues
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Attract talented performers and build a thriving music community.
                </p>
              </div>

              <div style={{
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  📋
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  For Organizers
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Streamline event management with automated queues and coordination.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div style={{ backgroundColor: '#f9fafb', padding: '3rem 1rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Platform Status
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: dbStatus.success ? '#10b981' : '#ef4444',
                      marginRight: '0.5rem'
                    }}></div>
                    <span style={{ fontWeight: '500' }}>Database</span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{dbStatus.message}</p>
                </div>
                
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {dbStatus.userCount}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Active Musicians</p>
                </div>
                
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {dbStatus.venueCount}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Partner Venues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
