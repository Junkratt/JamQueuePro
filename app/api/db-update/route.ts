import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Add ownerId column to Venue table
    await prisma.$executeRaw`
      ALTER TABLE "Venue" ADD COLUMN IF NOT EXISTS "ownerId" TEXT`

    // Add foreign key constraint
    await prisma.$executeRaw`
      ALTER TABLE "Venue" 
      ADD CONSTRAINT IF NOT EXISTS "Venue_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE`

    // Add other missing columns that might be needed
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nickname" TEXT`
      
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT`
      
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "instruments" TEXT[]`
      
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "musicPrefs" TEXT[]`
      
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "experience" TEXT`
      
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT`

    return Response.json({ 
      success: true, 
      message: 'Database schema updated successfully'
    })
  } catch (error) {
    console.error('Schema update error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Schema update failed'
    }, { status: 500 })
  }
}
