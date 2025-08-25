import { PrismaClient } from '@prisma/client'

async function getDatabaseStatus() {
  try {
    const prisma = new PrismaClient()
    const userCount = await prisma.user.count()
    const venueCount = await prisma.venue.count()
    await prisma.$disconnect()
    
    return { 
      success: true, 
      userCount, 
      venueCount, 
      message: 'Connected' 
    }
  } catch (error) {
    console.error('Database error:', error)
    return { 
      success: false, 
      userCount: 0, 
      venueCount: 0, 
      message: 'Error' 
    }
  }
}

export default async function Home() {
  const dbStatus = await getDatabaseStatus()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Jam Queue Pro
          </h1>
          <p className="text-xl text-gray-600">
            Connect musicians, venues, and unforgettable jam sessions
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Database:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                dbStatus.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {dbStatus.message}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Users:</span>
              <span className="text-gray-600">{dbStatus.userCount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Venues:</span>
              <span className="text-gray-600">{dbStatus.venueCount}</span>
            </div>
          </div>
          
          {!dbStatus.success && (
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p className="text-sm text-yellow-800">
                Database connection failed. Tables may need to be created.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
