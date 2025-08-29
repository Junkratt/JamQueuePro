'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Admin users fetch error:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      setMessage('Please select a user and enter a new password')
      return
    }

    if (!session?.user?.email) {
      setMessage('Admin email not found')
      return
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long')
      return
    }

    try {
      console.log('Resetting password for user:', selectedUser.id)
      console.log('Admin email:', session.user.email)
      console.log('New password length:', newPassword.length)

      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: session.user.email,
          newPassword: newPassword
        })
      })

      const data = await response.json()
      console.log('Reset password response:', data)

      if (response.ok) {
        setMessage(`Password reset successfully for ${selectedUser.email}`)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        setMessage(`Failed to reset password: ${data.error || 'Unknown error'}`)
        console.error('Password reset failed:', data)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setMessage('Network error. Please try again.')
    }
  }

  const handleSuspendUser = async (user: any) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: session?.user?.email,
          suspend: !user.suspended
        })
      })

      if (response.ok) {
        setMessage(`User ${user.suspended ? 'activated' : 'suspended'} successfully`)
        fetchUsers()
      } else {
        const data = await response.json()
        setMessage(`Failed to ${user.suspended ? 'activate' : 'suspend'} user: ${data.error}`)
      }
    } catch (error) {
      console.error('Suspend user error:', error)
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Navigation />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
            <div>Loading users...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            User Management
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage user accounts, reset passwords, and handle suspensions
          </p>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '2rem',
            backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : '#991b1b',
            border: `1px solid ${message.includes('success') ? '#a7f3d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        {selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Reset Password for {selectedUser.name}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Email: {selectedUser.email}
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  New Password (minimum 8 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Password must be at least 8 characters long
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setNewPassword('')
                    setMessage('')
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={newPassword.length < 8}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    backgroundColor: newPassword.length >= 8 ? '#dc2626' : '#9ca3af',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: newPassword.length >= 8 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>All Users ({users.length})</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    User
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Joined
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any, index) => (
                  <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: user.emailVerified ? '#d1fae5' : '#fee2e2',
                          color: user.emailVerified ? '#065f46' : '#991b1b'
                        }}>
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                        {user.suspended && (
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: '#fef3c7',
                            color: '#92400e'
                          }}>
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: '1px solid #dc2626',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                        >
                          Reset Password
                        </button>
                        
                        <button
                          onClick={() => handleSuspendUser(user)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: user.suspended ? '#059669' : '#d97706',
                            backgroundColor: 'transparent',
                            border: `1px solid ${user.suspended ? '#059669' : '#d97706'}`,
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                        >
                          {user.suspended ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
