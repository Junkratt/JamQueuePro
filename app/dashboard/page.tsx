'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchUserRole()
    fetchDashboardData()
  }, [session, status, router])

  const fetchUserRole = async () => {
    try {
      // Check if user has admin role by trying admin endpoint
      const adminResponse = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}&limit=1`)
      if (adminResponse.ok) {
        setUserRole('admin')
        return
      }

      // Check user profile for role information
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        
        // Check if user has created any venues (making them an organizer)
        const venuesResponse = await fetch('/api/venues')
        if (venuesResponse.ok) {
          const venues = await venuesResponse.json()
          const userVenues = venues.filter((venue: any) => 
            venue.organizerId === session?.user?.email || 
            venue.ownerId === session?.user?.email
          )
          
          if (userVenues.length > 0) {
            setUserRole('organizer')
          } else {
            setUserRole('performer')
          }
        } else {
          setUserRole('performer')
        }
      } else {
        setUserRole('performer')
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error)
      setUserRole('performer')
    }
  }

  const fetchDashboardData = async () => {
    try {
      // This is placeholder - in real app would fetch user-specific data
      setRecentActivity([])
      setUpcomingEvents([])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵</div>
            <div>Loading your dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  const QuickActionCard = ({ icon, title, description, href, disabled = false }: any) => (
    <div style={{
      backgroundColor: 'white',
      border: disabled ? '2px dashed #e5e7eb' : '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s'
    }}>
      <Link
        href={disabled ? '#' : href}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          pointerEvents: disabled ? 'none' : 'auto'
        }}
        onClick={(e) => disabled && e.preventDefault()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: disabled ? '#f3f4f6' : '#dbeafe',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: disabled ? '#6b7280' : '#1f2937'
            }}>
              {title}
            </h3>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              lineHeight: '1.4' 
            }}>
              {description}
            </p>
          </div>
          {!disabled && (
            <div style={{ color: '#6b7280', fontSize: '1.25rem' }}>→</div>
          )}
        </div>
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Welcome back, {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}!
          </h1>
          <p style={{ color: '#6b7280' }}>
            Role: <span style={{
              backgroundColor: userRole === 'admin' ? '#fef3c7' : userRole === 'organizer' ? '#dbeafe' : '#d1fae5',
              color: userRole === 'admin' ? '#92400e' : userRole === 'organizer' ? '#1e40af' : '#065f46',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {userRole}
            </span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Performer Actions - Available to Everyone */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
              🎤 Performer Tools
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <QuickActionCard
                icon="🎵"
                title="Browse Jam Sessions"
                description="Find and sign up for jam sessions in your area"
                href="/events"
              />
              <QuickActionCard
                icon="🎸"
                title="My Song Library"
                description="Manage your repertoire and skill levels"
                href="/profile/songs"
              />
              <QuickActionCard
                icon="👤"
                title="Update Profile"
                description="Keep your musical profile current"
                href="/profile"
              />
            </div>
          </div>

          {/* Venue Owner Tools - Only for Organizers and Admins */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
              🏪 Venue Owner Tools
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <QuickActionCard
                icon="🏪"
                title="Register Your Venue"
                description={userRole === 'organizer' || userRole === 'admin' 
                  ? "Add your venue to the platform" 
                  : "Available for venue owners and organizers"}
                href="/venues/register"
                disabled={userRole === 'performer'}
              />
              <QuickActionCard
                icon="✨"
                title="Create Jam Session"
                description={userRole === 'organizer' || userRole === 'admin'
                  ? "Schedule events at your venue"
                  : "Available for venue owners and organizers"}
                href="/events/create"
                disabled={userRole === 'performer'}
              />
              <QuickActionCard
                icon="📊"
                title="Event Analytics"
                description={userRole === 'organizer' || userRole === 'admin'
                  ? "Coming soon - Track your event performance"
                  : "Available for venue owners and organizers"}
                href="#"
                disabled={true}
              />
            </div>
          </div>

          {/* Admin Tools - Only for Admins */}
          {userRole === 'admin' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                ⚙️ Admin Tools
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <QuickActionCard
                  icon="👥"
                  title="User Management"
                  description="Manage user accounts and roles"
                  href="/admin/users"
                />
                <QuickActionCard
                  icon="📈"
                  title="Platform Analytics"
                  description="View platform usage and activity"
                  href="/admin/activity"
                />
                <QuickActionCard
                  icon="🎯"
                  title="Admin Dashboard"
                  description="Platform overview and settings"
                  href="/admin"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Platform Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>🎵</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Find Jam Sessions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>🏪</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Browse Venues</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>🎸</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Build Repertoire</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>👥</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Connect Musicians</div>
            </div>
          </div>
        </div>

        {/* Role Upgrade Call-to-Action for Performers */}
        {userRole === 'performer' && (
          <div style={{ 
            backgroundColor: '#dbeafe', 
            borderRadius: '0.5rem', 
            padding: '2rem', 
            marginTop: '2rem',
            border: '1px solid #93c5fd'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
              🎪 Want to Host Jam Sessions?
            </h3>
            <p style={{ color: '#1e40af', marginBottom: '1rem', lineHeight: '1.5' }}>
              Ready to take your musical journey to the next level? Register your venue and start hosting jam sessions to build the local music community!
            </p>
            <Link
              href="/venues/register"
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              🏪 Become a Venue Organizer
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
