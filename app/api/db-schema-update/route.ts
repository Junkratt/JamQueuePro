import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Add missing columns to User table
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "password" TEXT,
      ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "resetPasswordToken" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "nickname" TEXT,
      ADD COLUMN IF NOT EXISTS "location" TEXT,
      ADD COLUMN IF NOT EXISTS "instruments" TEXT[],
      ADD COLUMN IF NOT EXISTS "musicPrefs" TEXT[],
      ADD COLUMN IF NOT EXISTS "facebookId" TEXT,
      ADD COLUMN IF NOT EXISTS "profileImage" TEXT,
      ADD COLUMN IF NOT EXISTS "experience" TEXT,
      ADD COLUMN IF NOT EXISTS "bio" TEXT,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW()`

    // Create indexes
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key" 
      ON "User"("emailVerificationToken")`
      
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_resetPasswordToken_key" 
      ON "User"("resetPasswordToken")`

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

export async function GET() {
  return POST() // Allow GET requests too for easy testing
}
