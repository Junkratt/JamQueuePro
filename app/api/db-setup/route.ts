import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export async function POST() {
  try {
    // Only initialize Prisma when actually needed
    if (!prisma) {
      prisma = new PrismaClient()
    }
    
    const userCount = await prisma.user.count()
    const venueCount = await prisma.venue.count()
    
    return Response.json({ 
      success: true, 
      message: 'Database tables created successfully',
      counts: { users: userCount, venues: venueCount }
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return Response.json({ 
      success: false, 
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Allow GET requests too
}
