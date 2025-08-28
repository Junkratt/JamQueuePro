'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CreateUser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'performer',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`User created successfully!\n\nEmail: ${formData.email}\nTemporary Password: ${data.tempPassword}\n\nPlease share this password securely with the user.`)
        setFormData({ name: '', email: '', role: 'performer', phone: '' })
      } else {
        setMessage(`Failed to create user: ${data.error}`)
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/users" style={{ color: '#93c5fd', textDecoration: 'none' }}>← Back to Users</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create New User</h1>
        </div>
      </div>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                placeholder="Enter full name"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                placeholder="Enter email address"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              >
                <option value="performer">Performer - Can sign up for events and manage profile</option>
                <option value="organizer">Organizer - Can create events (requires phone verification)</option>
                <option value="admin">Admin - Full system access</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Phone Number {formData.role === 'organizer' && '(Required for organizers)'}
              </label>
              <input
                type="tel"
                required={formData.role === 'organizer'}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                placeholder="Enter phone number"
              />
              {formData.role === 'organizer' && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Organizers must verify their phone number before creating events
                </p>
              )}
            </div>

            {message && (
              <div style={{
                padding: '1rem',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem',
                backgroundColor: message.includes('successfully') ? '#d1fae5' : '#fee2e2',
                color: message.includes('successfully') ? '#065f46' : '#991b1b',
                whiteSpace: 'pre-line',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  flex: 1
                }}
              >
                {isLoading ? 'Creating User...' : 'Create User'}
              </button>
              
              <Link
                href="/admin/users"
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textAlign: 'center'
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Role Descriptions */}
        <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Role Descriptions</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '500', color: '#065f46', marginBottom: '0.25rem' }}>Performer</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Can create a profile, add songs to their library, sign up for jam sessions, and connect with other musicians. This is the default role for most users.
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '500', color: '#1e40af', marginBottom: '0.25rem' }}>Organizer</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Can do everything performers can do, plus create and manage jam session events. Must have a verified phone number and be approved by venue owners.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: '500', color: '#92400e', marginBottom: '0.25rem' }}>Admin</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Full system access including user management, venue management, event oversight, and system configuration. Use with caution.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
