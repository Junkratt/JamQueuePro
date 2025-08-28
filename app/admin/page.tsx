'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    pendingOrganizers: 0,
    recentActions: []
  })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    checkAdminAccess()
  }, [session, status, router])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch(`/api/admin/users?adminEmail=${session?.user?.email}&limit=1`)
      if (response.ok) {
        setIsAdmin(true)
        fetchStats()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/dashboard')
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch basic stats
      const statsResponse = await fetch(`/api/admin/stats?adminEmail=${session?.user?.email}`)
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    }
  }

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (!session || !isAdmin) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🛡️ Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem' }}>Welcome, {session.user?.name}</span>
            <Link href="/dashboard" style={{ color: '#93c5fd', textDecoration: 'none' }}>← Back to App</Link>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalUsers}</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Users</p>
              </div>
              <div style={{ fontSize: '2rem' }}>👥</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.totalVenues}</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Active Venues</p>
              </div>
              <div style={{ fontSize: '2rem' }}>🏪</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingOrganizers}</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pending Organizers</p>
              </div>
              <div style={{ fontSize: '2rem' }}>⏳</div>
            </div>
          </div>
        </div>

        {/* Management Tools */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>👥 User Management</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage user accounts, roles, and permissions</p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  href="/admin/users"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>View All Users</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/users/create"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>Create New User</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/organizers"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>Organizer Approvals</span>
                  <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                    {stats.pendingOrganizers}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>🏪 Venue Management</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage venues and venue organizers</p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  href="/admin/venues"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>View All Venues</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/venues/create"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>Add New Venue</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/venue-organizers"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>Venue-Organizer Links</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>📊 System Tools</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>System monitoring and maintenance</p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  href="/admin/logs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>Admin Activity Logs</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/reports"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: '#374151'
                  }}
                >
                  <span>System Reports</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/settings"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
backgroundColor: '#f3f4f6',
                   borderRadius: '0.375rem',
                   textDecoration: 'none',
                   color: '#374151'
                 }}
               >
                 <span>System Settings</span>
                 <span>→</span>
               </Link>
             </div>
           </div>
         </div>
       </div>

       {/* Recent Activity */}
       <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
         <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
           <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>📋 Recent Admin Activity</h2>
         </div>
         <div style={{ padding: '1.5rem' }}>
           {stats.recentActions.length === 0 ? (
             <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
               No recent admin activity
             </p>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {stats.recentActions.slice(0, 5).map((action: any, index) => (
                 <div key={index} style={{ 
                   display: 'flex', 
                   justifyContent: 'space-between', 
                   alignItems: 'center',
                   padding: '0.75rem',
                   backgroundColor: '#f9fafb',
                   borderRadius: '0.375rem'
                 }}>
                   <div>
                     <span style={{ fontWeight: '500' }}>{action.action}</span>
                     <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                       {action.targetType} #{action.targetId.slice(0, 8)}
                     </span>
                   </div>
                   <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                     {new Date(action.createdAt).toLocaleString()}
                   </span>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     </main>
   </div>
 )
}
