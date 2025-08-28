'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Check user role
  useEffect(() => {
    if (session?.user?.email) {
      checkUserRole()
    }
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkUserRole = async () => {
    try {
      // Try to get user role from admin API (this will work if user has admin role)
      const response = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}&limit=1`)
      if (response.ok) {
        setUserRole('admin')
      } else {
        // If not admin, check if they're an organizer by checking their profile
        const profileResponse = await fetch('/api/user/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setUserRole(profileData.role || 'performer')
        } else {
          setUserRole('performer')
        }
      }
    } catch (error) {
      setUserRole('performer')
    }
  }

  const isActivePath = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  if (status === 'loading') {
    return (
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#1f2937' }}>
            Jam Queue Pro
          </Link>
          <div>Loading...</div>
        </div>
      </nav>
    )
  }

  const navLinks = session ? [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/events', label: 'Jam Sessions' },
    { href: '/venues/search', label: 'Find Venues' },
    { href: '/profile', label: 'Profile' },
  ] : []

  const ownerLinks = session ? [
    { href: '/venues/register', label: 'Register Venue' },
    { href: '/events/create', label: 'Create Event' },
  ] : []

  return (
    <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Logo */}
          <Link 
            href="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: '#1f2937',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#2563eb',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>JQ</span>
            </div>
            Jam Queue Pro
          </Link>

          {/* Desktop navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  ...(isActivePath(link.href)
                    ? { backgroundColor: '#dbeafe', color: '#1d4ed8' }
                    : { color: '#6b7280' })
                }}
                onMouseEnter={(e) => {
                  if (!isActivePath(link.href)) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.color = '#1f2937'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath(link.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#6b7280'
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
            
            {session && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.color = '#1f2937'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#6b7280'
                  }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  Venue Owner ▾
                </button>
                
                {isMobileMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.25rem',
                    width: '12rem',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    zIndex: 10
                  }}>
                    <div style={{ padding: '0.5rem' }}>
                      {ownerLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          style={{
                            display: 'block',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.25rem',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '0.875rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {session ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span>{session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}</span>
                  {userRole && (
                    <span style={{
                      backgroundColor: userRole === 'admin' ? '#fef3c7' : userRole === 'organizer' ? '#dbeafe' : '#d1fae5',
                      color: userRole === 'admin' ? '#92400e' : userRole === 'organizer' ? '#1e40af' : '#065f46',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {userRole}
                    </span>
                  )}
                  <span style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>

                {isUserMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.25rem',
                    width: '12rem',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    zIndex: 20
                  }}>
                    <div style={{ padding: '0.5rem' }}>
                      <Link
                        href="/profile"
                        style={{
                          display: 'block',
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>

                      <Link
                        href="/dashboard"
                        style={{
                          display: 'block',
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '0.875rem',
                          borderBottom: userRole === 'admin' ? '1px solid #e5e7eb' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          style={{
                            display: 'block',
                            padding: '0.75rem',
                            borderRadius: '0.25rem',
                            textDecoration: 'none',
                            color: '#92400e',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef3c7'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Portal
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
