import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Starting admin system migration...')

    // First, check if VenueOrganizer table exists, if not create it
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "VenueOrganizer" (
          id TEXT PRIMARY KEY,
          "venueId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          role TEXT DEFAULT 'organizer',
          approved BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP DEFAULT NOW()
        )`
      console.log('VenueOrganizer table created/verified')
    } catch (e) {
      console.log('VenueOrganizer table already exists or creation failed')
    }

    // Add foreign key constraints to VenueOrganizer if they don't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "VenueOrganizer" 
        ADD CONSTRAINT IF NOT EXISTS "VenueOrganizer_venueId_fkey" 
        FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE`
    } catch (e) {
      console.log('VenueOrganizer venueId constraint already exists')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "VenueOrganizer" 
        ADD CONSTRAINT IF NOT EXISTS "VenueOrganizer_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE`
    } catch (e) {
      console.log('VenueOrganizer userId constraint already exists')
    }

    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "VenueOrganizer_venueId_userId_key" 
        ON "VenueOrganizer"("venueId", "userId")`
    } catch (e) {
      console.log('VenueOrganizer unique index already exists')
    }

    // Add admin columns to User table
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'performer',
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "phone" TEXT,
      ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "phoneVerificationCode" TEXT,
      ADD COLUMN IF NOT EXISTS "verificationExpiresAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT,
      ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
      ADD COLUMN IF NOT EXISTS "updatedBy" TEXT`

    console.log('User admin columns added')

    // Add admin columns to Venue table  
    await prisma.$executeRaw`
      ALTER TABLE "Venue" 
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT,
      ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
      ADD COLUMN IF NOT EXISTS "updatedBy" TEXT`

    console.log('Venue admin columns added')

    // Add admin columns to VenueOrganizer table (now that it exists)
    await prisma.$executeRaw`
      ALTER TABLE "VenueOrganizer"
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
      ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT`

    console.log('VenueOrganizer admin columns added')

    // Create AdminLog table for audit trail
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AdminLog" (
        id TEXT PRIMARY KEY,
        "adminUserId" TEXT NOT NULL,
        action TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId" TEXT NOT NULL,
        details TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`

    console.log('AdminLog table created')

    // Add foreign key constraint for AdminLog
    try {
      await prisma.$executeRaw`
        ALTER TABLE "AdminLog" 
        ADD CONSTRAINT IF NOT EXISTS "AdminLog_adminUserId_fkey" 
        FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE`
    } catch (e) {
      console.log('AdminLog constraint already exists')
    }

    // Create indexes for performance
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status")`
      console.log('User indexes created')
    } catch (e) {
      console.log('User indexes already exist')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Venue_status_idx" ON "Venue"("status")`
      console.log('Venue indexes created')
    } catch (e) {
      console.log('Venue indexes already exist')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "VenueOrganizer_status_idx" ON "VenueOrganizer"("status")`
      console.log('VenueOrganizer indexes created')
    } catch (e) {
      console.log('VenueOrganizer indexes already exist')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "AdminLog_adminUserId_idx" ON "AdminLog"("adminUserId")`
      console.log('AdminLog indexes created')
    } catch (e) {
      console.log('AdminLog indexes already exist')
    }

    // Check if default admin user already exists
    const adminExists = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = 'admin@jamqueuepro.com' LIMIT 1
    ` as any[]

    let adminInfo
    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs')
      const crypto = require('crypto')
      const adminId = crypto.randomUUID()
      const hashedPassword = await bcrypt.hash('admin123!', 12)
      
      await prisma.$executeRaw`
        INSERT INTO "User" (
          id, email, name, "password", role, status, "emailVerified", "createdAt", "updatedAt"
        ) VALUES (
          ${adminId}, 
          'admin@jamqueuepro.com', 
          'System Administrator',
          ${hashedPassword},
          'admin',
          'active',
          NOW(),
          NOW(),
          NOW()
        )`
      
      console.log('Default admin user created')
      adminInfo = {
        email: 'admin@jamqueuepro.com',
        password: 'admin123!',
        note: 'Default admin created - please change password immediately!'
      }
    } else {
      // Update existing user to admin if needed
      await prisma.$executeRaw`
        UPDATE "User" 
        SET role = 'admin', status = 'active' 
        WHERE email = 'admin@jamqueuepro.com'`
      console.log('Updated existing admin user')
      adminInfo = {
        email: 'admin@jamqueuepro.com',
        note: 'Admin role updated - use your existing password'
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Admin system migration completed successfully',
      defaultAdmin: adminInfo,
      tablesCreated: [
        'VenueOrganizer (with constraints)',
        'AdminLog',
        'Added admin columns to User table',
        'Added admin columns to Venue table',
        'Added admin columns to VenueOrganizer table',
        'Created all necessary indexes'
      ]
    })
  } catch (error) {
    console.error('Admin migration error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed',
      details: 'Check server logs for details'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
