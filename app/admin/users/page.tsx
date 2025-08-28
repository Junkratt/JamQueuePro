'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  nickname?: string
  role: string
  status: string
  phone?: string
  phoneVerified: boolean
  emailVerified: Date | null
  lastLogin: Date | null
  createdAt: Date
  suspendedAt: Date | null
  suspendedReason?: string
}

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  })
  const [showPasswordReset, setShowPasswordReset] = useState<string | null>(null)
  const [showRoleChange, setShowRoleChange] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchUsers()
  }, [session, status, router, filters, pagination.page])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        adminEmail: session?.user?.email || '',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(prev => ({ ...prev, ...data.pagination }))
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (userId: string, customPassword?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password?adminEmail=${session?.user?.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          temporaryPassword: customPassword || null,
          forceChange: true 
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Password reset successfully!\n\nUser: ${data.userEmail}\nTemporary Password: ${data.temporaryPassword}\n\nPlease share this password securely with the user.`)
        setShowPasswordReset(null)
      } else {
        alert(`Failed to reset password: ${data.error}`)
      }
    } catch (error) {
      alert('Network error')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role?adminEmail=${session?.user?.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, reason })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Role updated successfully!\n\nUser: ${data.userEmail}\nOld Role: ${data.oldRole}\nNew Role: ${data.newRole}`)
        setShowRoleChange(null)
        fetchUsers()
      } else {
        alert(`Failed to update role: ${data.error}`)
      }
    } catch (error) {
      alert('Network error')
    }
  }

  const handleSuspendUser = async (userId: string, action: 'suspend' | 'unsuspend', reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend?adminEmail=${session?.user?.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}?adminEmail=${session?.user?.email}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: '#fef3c7', color: '#92400e' }
      case 'organizer': return { bg: '#dbeafe', color: '#1e40af' }
      case 'performer': return { bg: '#d1fae5', color: '#065f46' }
      default: return { bg: '#f3f4f6', color: '#374151' }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#d1fae5', color: '#065f46' }
      case 'suspended': return { bg: '#fee2e2', color: '#991b1b' }
      case 'pending': return { bg: '#fef3c7', color: '#92400e' }
      default: return { bg: '#f3f4f6', color: '#374151' }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" style={{ color: '#93c5fd', textDecoration: 'none' }}>← Admin Dashboard</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>User Management</h1>
          </div>
          <Link 
            href="/admin/users/create"
            style={{ 
              backgroundColor: '#2563eb', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.375rem', 
              textDecoration: 'none' 
            }}
          >
            Create User
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Filters */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Filter by Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem' 
                }}
              >
                <option value="">All Roles</option>
                <option value="performer">Performers</option>
                <option value="organizer">Organizers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Filter by Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem' 
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              Users ({pagination.total})
            </h2>
          </div>

          {users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <p>No users found matching your criteria</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>User</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Created</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roleColor = getRoleBadgeColor(user.role)
                    const statusColor = getStatusBadgeColor(user.status)
                    
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>{user.name}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{user.email}</div>
                            {user.nickname && (
                              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>"{user.nickname}"</div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              backgroundColor: roleColor.bg,
                              color: roleColor.color,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {user.role}
                            </span>
                            <button
                              onClick={() => setShowRoleChange(user.id)}
                              style={{
                                backgroundColor: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.25rem',
                                padding: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {user.status}
                          </span>
                          {user.suspendedReason && (
                            <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              {user.suspendedReason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {user.phone ? (
                            <div>
                              <div>{user.phone}</div>
                              <div style={{ color: user.phoneVerified ? '#10b981' : '#f59e0b', fontSize: '0.75rem' }}>
                                {user.phoneVerified ? 'Verified' : 'Unverified'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#6b7280' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setShowPasswordReset(user.id)}
                              style={{
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Reset Password
                            </button>
                            
                            {user.status === 'active' ? (
                              <button
                                onClick={() => {
                                  const reason = prompt('Reason for suspension:')
                                  if (reason) handleSuspendUser(user.id, 'suspend', reason)
                                }}
                                style={{
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Suspend
                              </button>
                            ) : user.status === 'suspended' ? (
                              <button
                                onClick={() => handleSuspendUser(user.id, 'unsuspend')}
                                style={{
                                  backgroundColor: '#d1fae5',
                                  color: '#065f46',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Unsuspend
                              </button>
                            ) : null}
                            
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: pagination.page === 1 ? '#f9fafb' : 'white',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                disabled={pagination.page === pagination.pages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: pagination.page === pagination.pages ? '#f9fafb' : 'white',
                  cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Password Reset Modal */}
      {showPasswordReset && (
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
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Reset Password</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Choose to generate a random password or set a custom one:
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                onClick={() => handlePasswordReset(showPasswordReset)}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Generate Random Password
              </button>
              <button
                onClick={() => {
                  const customPassword = prompt('Enter custom password (min 8 characters):')
                  if (customPassword && customPassword.length >= 8) {
                    handlePasswordReset(showPasswordReset, customPassword)
                  } else if (customPassword) {
                    alert('Password must be at least 8 characters long')
                  }
                }}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Set Custom Password
              </button>
            </div>
            <button
              onClick={() => setShowPasswordReset(null)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleChange && (
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
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            minWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Change User Role</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Select the new role for this user:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {['performer', 'organizer', 'admin'].map(role => (
                <button
                  key={role}
                  onClick={() => {
                    const reason = prompt(`Reason for changing role to ${role}:`)
                    if (reason !== null) {
                      handleRoleChange(showRoleChange!, role, reason)
                    }
                  }}
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {role === 'performer' && 'Can sign up for events and manage personal profile'}
                    {role === 'organizer' && 'Can create and manage events at venues (requires phone verification)'}
                    {role === 'admin' && 'Full system access including user and venue management'}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoleChange(null)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
