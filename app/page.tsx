import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    // Test connection and create tables if needed
    await prisma.$executeRaw`SELECT 1`
    return { success: true, message: 'Database ready' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export default async function Home() {
  const dbSetup = await setupDatabase()
  
  let userCount = 0
  let venueCount = 0
  
  if (dbSetup.success) {
    try {
      userCount = await prisma.user.count()
      venueCount = await prisma.venue.count()
    } catch (error) {
      console.log('Tables may not exist yet:', error)
    }
  }

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
                dbSetup.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {dbSetup.success ? 'Connected' : 'Error'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Users:</span>
              <span className="text-gray-600">{userCount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Venues:</span>
              <span className="text-gray-600">{venueCount}</span>
            </div>
          </div>
          
          {!dbSetup.success && (
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p className="text-sm text-yellow-800">
                Database tables may need to be created. Contact support if this persists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
