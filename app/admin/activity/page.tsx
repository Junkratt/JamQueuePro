'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ActivityAnalytics() {
 const { data: session, status } = useSession()
 const router = useRouter()
 const [activities, setActivities] = useState([])
 const [filters, setFilters] = useState({
   category: '',
   dateRange: '7',
   search: ''
 })
 const [isLoading, setIsLoading] = useState(true)
 const [stats, setStats] = useState({
   totalActivities: 0,
   uniqueUsers: 0,
   categoryCounts: []
 })

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
       fetchActivities()
     } else {
       router.push('/dashboard')
     }
   } catch (error) {
     router.push('/dashboard')
   }
 }

 const fetchActivities = async () => {
   setIsLoading(true)
   try {
     const params = new URLSearchParams({
       adminEmail: session?.user?.email || '',
       days: filters.dateRange,
       ...(filters.category && { category: filters.category }),
       ...(filters.search && { search: filters.search })
     })

     const response = await fetch(`/api/admin/activity?${params}`)
     if (response.ok) {
       const data = await response.json()
       setActivities(data.activities || [])
       setStats(data.stats || { totalActivities: 0, uniqueUsers: 0, categoryCounts: [] })
     }
   } catch (error) {
     console.error('Failed to fetch activities:', error)
   } finally {
     setIsLoading(false)
   }
 }

 useEffect(() => {
   if (session) {
     fetchActivities()
   }
 }, [filters, session])

 if (status === 'loading' || isLoading) {
   return (
     <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div style={{ textAlign: 'center' }}>
         <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
         <div>Loading activity data...</div>
       </div>
     </div>
   )
 }

 const categoryEmojis: { [key: string]: string } = {
   'AUTH': '🔐',
   'PROFILE': '👤',
   'SONGS': '🎵',
   'EVENTS': '🎤',
   'VENUES': '🏪',
   'ADMIN': '⚙️',
   'NAVIGATION': '🧭'
 }

 return (
   <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
     {/* Admin Header */}
     <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '1rem' }}>
       <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Link href="/admin" style={{ color: '#93c5fd', textDecoration: 'none' }}>← Admin Dashboard</Link>
           <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📊 Activity Analytics</h1>
         </div>
       </div>
     </div>

     <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
       {/* Stats Overview */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalActivities}</div>
           <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Activities</div>
         </div>
         <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.uniqueUsers}</div>
           <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Active Users</div>
         </div>
         <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
             {Math.round(stats.totalActivities / Math.max(stats.uniqueUsers, 1) * 10) / 10}
           </div>
           <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg per User</div>
         </div>
       </div>

       {/* Filters */}
       <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
           <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
               Time Range
             </label>
             <select
               value={filters.dateRange}
               onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
               style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
             >
               <option value="1">Last 24 hours</option>
               <option value="7">Last 7 days</option>
               <option value="30">Last 30 days</option>
               <option value="90">Last 90 days</option>
             </select>
           </div>
           <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
               Category
             </label>
             <select
               value={filters.category}
               onChange={(e) => setFilters({ ...filters, category: e.target.value })}
               style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
             >
               <option value="">All Categories</option>
               <option value="AUTH">Authentication</option>
               <option value="PROFILE">Profile</option>
               <option value="SONGS">Songs</option>
               <option value="EVENTS">Events</option>
               <option value="VENUES">Venues</option>
               <option value="ADMIN">Admin</option>
               <option value="NAVIGATION">Navigation</option>
             </select>
           </div>
           <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
               Search
             </label>
             <input
               type="text"
               placeholder="Search actions or users..."
               value={filters.search}
               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
               style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
             />
           </div>
         </div>
       </div>

       {/* Category Breakdown */}
       <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
         <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
           <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Activity by Category</h2>
         </div>
         <div style={{ padding: '1.5rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
             {stats.categoryCounts.map((category: any) => (
               <div key={category.category} style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{categoryEmojis[category.category] || '📊'}</div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>{category.count}</div>
                 <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{category.category}</div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Activity Feed */}
       <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
         <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
           <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Activities ({activities.length})</h2>
         </div>
         
         {activities.length === 0 ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
             <p>No activities found for the selected filters</p>
           </div>
         ) : (
           <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
             {activities.map((activity: any, index) => (
               <div key={activity.id} style={{ 
                 padding: '1rem', 
                 borderBottom: index < activities.length - 1 ? '1px solid #e5e7eb' : 'none',
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                   <div style={{ fontSize: '1.5rem' }}>{categoryEmojis[activity.category] || '📊'}</div>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                       {activity.action}
                     </div>
                     <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                       {activity.userName || activity.userEmail || 'Unknown User'} • {activity.category}
                       {activity.details && Object.keys(activity.details).length > 0 && (
                         <span style={{ marginLeft: '0.5rem' }}>
                           • {Object.entries(activity.details).slice(0, 2).map(([key, value]) => 
                             `${key}: ${JSON.stringify(value)}`
                           ).join(', ')}
                         </span>
                       )}
                     </div>
                   </div>
                 </div>
                 <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right', minWidth: '120px' }}>
                   {new Date(activity.createdAt).toLocaleDateString()}
                   <br />
                   {new Date(activity.createdAt).toLocaleTimeString()}
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
     </main>
   </div>
 )
}
