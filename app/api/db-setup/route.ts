import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "nickname" TEXT,
        "location" TEXT,
        "instruments" TEXT[],
        "musicPrefs" TEXT[],
        "facebookId" TEXT,
        "profileImage" TEXT,
        "experience" TEXT,
        "bio" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`

    // Create Venue table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Venue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "zipCode" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "website" TEXT,
        "description" TEXT,
        "capacity" INTEGER,
        "amenities" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`

    // Test that tables were created
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
