import { prisma } from '@/lib/prisma'

async function getStats() {
  try {
    const [userCount, venueCount, eventCount] = await Promise.all([
      prisma.user.count(),
      prisma.venue.count(),
      prisma.event.count()
    ])
    return { userCount, venueCount, eventCount }
  } catch (error) {
    console.log('Database not ready yet, using default values')
    return { userCount: 0, venueCount: 0, eventCount: 0 }
  }
}

export default async function Home() {
  const { userCount, venueCount, eventCount } = await getStats()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-2xl font-bold text-white">🎵 Jam Nights</div>
          <div className="space-x-4">
            <button className="text-white/80 hover:text-white transition-colors">Sign In</button>
            <button className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg text-white font-semibold transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-6xl font-bold mb-6">
            Connect. Play. Jam.
          </h1>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
            The ultimate platform for musicians, venues, and organizers to create unforgettable jam sessions and open mic nights
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
              <div className="text-4xl mb-2">🎸</div>
              <div className="text-3xl font-bold text-cyan-300">{userCount}</div>
              <div className="text-lg">Musicians Ready to Jam</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
              <div className="text-4xl mb-2">🏟️</div>
              <div className="text-3xl font-bold text-green-300">{venueCount}</div>
              <div className="text-lg">Partner Venues</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
              <div className="text-4xl mb-2">🎤</div>
              <div className="text-3xl font-bold text-yellow-300">{eventCount}</div>
              <div className="text-lg">Upcoming Events</div>
            </div>
          </div>
          
          <div className="space-x-4">
            <button className="bg-cyan-500 hover:bg-cyan-600 px-8 py-4 rounded-full text-white font-semibold text-lg transition-colors shadow-lg">
              Find Jam Sessions
            </button>
            <button className="border-2 border-white/50 hover:border-white hover:bg-white/10 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all">
              List Your Venue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🎵
            </div>
            <h3 className="text-xl font-semibold mb-2">For Musicians</h3>
            <p className="opacity-80">Find local jam sessions, connect with other musicians, and showcase your skills</p>
          </div>
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🏪
            </div>
            <h3 className="text-xl font-semibold mb-2">For Venues</h3>
            <p className="opacity-80">Attract musicians and audiences, manage events, and build your music community</p>
          </div>
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📋
            </div>
            <h3 className="text-xl font-semibold mb-2">For Organizers</h3>
            <p className="opacity-80">Streamline event management, queue handling, and musician coordination</p>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-white/60">
          <p>&copy; 2025 Jam Nights. Bringing musicians together, one jam at a time.</p>
        </div>
      </footer>
    </div>
  )
}
