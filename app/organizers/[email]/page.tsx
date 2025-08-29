'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

export default function OrganizerProfile() {
 const { data: session, status } = useSession()
 const router = useRouter()
 const params = useParams()
 const [organizer, setOrganizer] = useState<any>(null)
 const [venues, setVenues] = useState([])
 const [upcomingEvents, setUpcomingEvents] = useState([])
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
   if (params.email) {
     fetchOrganizer()
     fetchOrganizerVenues()
     fetchOrganizerEvents()
   }
 }, [params.email])

 const fetchOrganizer = async () => {
   try {
     const response = await fetch(`/api/organizers/${params.email}`)
     if (response.ok) {
       const organizerData = await response.json()
       setOrganizer(organizerData)
     } else {
       router.push('/venues/search')
     }
   } catch (error) {
     console.error('Failed to load organizer:', error)
     router.push('/venues/search')
   } finally {
     setIsLoading(false)
   }
 }

 const fetchOrganizerVenues = async () => {
   try {
     const response = await fetch(`/api/organizers/${params.email}/venues`)
     if (response.ok) {
       const venuesData = await response.json()
       setVenues(venuesData)
     }
   } catch (error) {
     console.error('Failed to load organizer venues:', error)
   }
 }

 const fetchOrganizerEvents = async () => {
   try {
     const response = await fetch(`/api/organizers/${params.email}/events`)
     if (response.ok) {
       const eventsData = await response.json()
       setUpcomingEvents(eventsData)
     }
   } catch (error) {
     console.error('Failed to load organizer events:', error)
   }
 }

 if (isLoading) {
   return (
     <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
       <Navigation />
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
         <div style={{ textAlign: 'center' }}>
           <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎤</div>
           <div>Loading organizer profile...</div>
         </div>
       </div>
     </div>
   )
 }

 if (!organizer) {
   return (
     <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
       <Navigation />
       <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
         <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Organizer Not Found</h1>
         <Link href="/venues/search" style={{ color: '#2563eb', textDecoration: 'underline' }}>
           Browse Venues
         </Link>
       </div>
     </div>
   )
 }

 return (
   <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
     <Navigation />

     <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
       {/* Header Section */}
       <div style={{ 
         backgroundColor: 'white', 
         borderRadius: '0.5rem', 
         marginBottom: '2rem',
         boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
         padding: '2rem'
       }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', alignItems: 'center' }}>
           {/* Profile Photo */}
           <div style={{ textAlign: 'center' }}>
             {organizer.profileImage ? (
               <img
                 src={organizer.profileImage}
                 alt={organizer.name}
                 style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
               />
             ) : (
               <div style={{
                 width: '120px',
                 height: '120px',
                 borderRadius: '50%',
                 backgroundColor: '#f3f4f6',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '3rem'
               }}>
                 👤
               </div>
             )}
           </div>
           
           {/* Profile Info */}
           <div>
             <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
               {organizer.nickname || organizer.name}
             </h1>
             {organizer.nickname && organizer.name && (
               <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                 ({organizer.name})
               </p>
             )}
             
             <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
               {organizer.location && (
                 <p style={{ marginBottom: '0.25rem' }}>📍 {organizer.location}</p>
               )}
               <p style={{ marginBottom: '0.25rem' }}>📧 {organizer.email}</p>
               {organizer.experience && (
                 <p>📊 {organizer.experience} level</p>
               )}
             </div>

             {organizer.bio && (
               <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
                 {organizer.bio}
               </p>
             )}
           </div>

           {/* Quick Stats */}
           <div style={{ textAlign: 'center' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
               <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{venues.length}</div>
                 <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Venues</div>
               </div>
               <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{upcomingEvents.length}</div>
                 <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Events</div>
               </div>
             </div>
             
             {session?.user?.email !== organizer.email && (
               <button
                 style={{
                   backgroundColor: '#2563eb',
                   color: 'white',
                   padding: '0.75rem 1.5rem',
                   borderRadius: '0.375rem',
                   border: 'none',
                   fontSize: '0.875rem',
                   cursor: 'pointer'
                 }}
                 onClick={() => alert('Follow feature coming soon!')}
               >
                 Follow Organizer
               </button>
             )}
           </div>
         </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         {/* Main Content */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           {/* Venues Section */}
           <div style={{ 
             backgroundColor: 'white', 
             padding: '2rem', 
             borderRadius: '0.5rem',
             boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
           }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
               🏪 Venues Where {organizer.nickname || organizer.name} Hosts Jams
             </h2>
             
             {venues.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
                 <p>No venues registered yet</p>
               </div>
             ) : (
               <div style={{ display: 'grid', gap: '1rem' }}>
                 {venues.map((venue: any) => (
                   <div key={venue.id} style={{
                     padding: '1.5rem',
                     border: '1px solid #e5e7eb',
                     borderRadius: '0.375rem',
                     backgroundColor: '#fafafa'
                   }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                       <div style={{ flex: 1 }}>
                         <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                           <Link href={`/venues/${venue.id}`} style={{ color: '#1f2937', textDecoration: 'none' }}>
                             {venue.name}
                           </Link>
                         </h3>
                         <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                           📍 {venue.address}, {venue.city}, {venue.state}
                         </p>
                         {venue.description && (
                           <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                             {venue.description.substring(0, 150)}...
                           </p>
                         )}
                       </div>
                       <Link
                         href={`/venues/${venue.id}`}
                         style={{
                           backgroundColor: '#2563eb',
                           color: 'white',
                           padding: '0.5rem 1rem',
                           borderRadius: '0.375rem',
                           textDecoration: 'none',
                           fontSize: '0.75rem'
                         }}
                       >
                         View Venue
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Upcoming Events */}
           <div style={{ 
             backgroundColor: 'white', 
             padding: '2rem', 
             borderRadius: '0.5rem',
             boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
           }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
               📅 Upcoming Jam Sessions
             </h2>
             
             {upcomingEvents.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                 <p>No upcoming events scheduled</p>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {upcomingEvents.map((event: any) => (
                   <div key={event.id} style={{
                     padding: '1.5rem',
                     border: '1px solid #e5e7eb',
                     borderRadius: '0.375rem',
                     backgroundColor: '#fafafa'
                   }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                       <div style={{ flex: 1 }}>
                         <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                           <Link href={`/events/${event.id}`} style={{ color: '#1f2937', textDecoration: 'none' }}>
                             {event.title}
                           </Link>
                         </h3>
                         <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                           🏪 {event.venue.name} • 📍 {event.venue.city}, {event.venue.state}
                         </p>
                         <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                           🗓️ {new Date(event.dateTime).toLocaleDateString()} at {new Date(event.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </p>
                         {event.description && (
                           <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                             {event.description.substring(0, 100)}...
                           </p>
                         )}
                       </div>
                       <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                           {event._count?.signups || 0}
                         </div>
                         <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>signups</div>
                         <Link
                           href={`/events/${event.id}`}
                           style={{
                             display: 'inline-block',
                             backgroundColor: '#10b981',
                             color: 'white',
                             padding: '0.5rem 1rem',
                             borderRadius: '0.375rem',
                             textDecoration: 'none',
                             fontSize: '0.75rem'
                           }}
                         >
                           Sign Up
                         </Link>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>

         {/* Sidebar */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           {/* Musical Background */}
           <div style={{ 
             backgroundColor: 'white', 
             padding: '2rem', 
             borderRadius: '0.5rem',
             boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
           }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
               🎸 Musical Background
             </h3>
             
             {organizer.instruments && organizer.instruments.length > 0 && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                   Instruments:
                 </h4>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                   {organizer.instruments.map((instrument: string) => (
                     <span
                       key={instrument}
                       style={{
                         padding: '0.25rem 0.75rem',
                         backgroundColor: '#dbeafe',
                         color: '#1e40af',
                         borderRadius: '9999px',
                         fontSize: '0.875rem'
                       }}
                     >
                       🎸 {instrument}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {organizer.musicPrefs && organizer.musicPrefs.length > 0 && (
               <div>
                 <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                   Favorite Genres:
                 </h4>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                   {organizer.musicPrefs.map((genre: string) => (
                     <span
                       key={genre}
                       style={{
                         padding: '0.25rem 0.75rem',
                         backgroundColor: '#d1fae5',
                         color: '#065f46',
                         borderRadius: '9999px',
                         fontSize: '0.875rem'
                       }}
                     >
                       🎵 {genre}
                     </span>
                   ))}
                 </div>
               </div>
             )}
           </div>

           {/* Quick Actions */}
           <div style={{ 
             backgroundColor: 'white', 
             padding: '2rem', 
             borderRadius: '0.5rem',
             boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
           }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
               Quick Actions
             </h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <Link
                 href="/events"
                 style={{
                   display: 'block',
                   backgroundColor: '#2563eb',
                   color: 'white',
                   padding: '0.75rem',
                   borderRadius: '0.375rem',
                   textDecoration: 'none',
                   fontSize: '0.875rem',
                   fontWeight: '500',
                   textAlign: 'center'
                 }}
               >
                 🎵 View All Events
               </Link>
               
               <Link
                 href="/venues/search"
                 style={{
                   display: 'block',
                   backgroundColor: '#10b981',
                   color: 'white',
                   padding: '0.75rem',
                   borderRadius: '0.375rem',
                   textDecoration: 'none',
                   fontSize: '0.875rem',
                   fontWeight: '500',
                   textAlign: 'center'
                 }}
               >
                 🏪 Browse Venues
               </Link>
               
               <Link
                 href="/profile"
                 style={{
                   display: 'block',
                   backgroundColor: '#f3f4f6',
                   color: '#374151',
                   padding: '0.75rem',
                   borderRadius: '0.375rem',
                   textDecoration: 'none',
                   fontSize: '0.875rem',
                   textAlign: 'center',
                   border: '1px solid #d1d5db'
                 }}
               >
                 👤 My Profile
               </Link>
             </div>
           </div>
         </div>
       </div>
     </main>
   </div>
 )
}
