import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Starting admin system migration...')

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

    // Add admin columns to VenueOrganizer table
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
        details JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE
      )`

    console.log('AdminLog table created')

    // Create indexes for performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status")`
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Venue_status_idx" ON "Venue"("status")`
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "VenueOrganizer_status_idx" ON "VenueOrganizer"("status")`
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AdminLog_adminUserId_idx" ON "AdminLog"("adminUserId")`

    // Create a default admin user (you should change this!)
    const adminExists = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE role = 'admin' LIMIT 1
    ` as any[]

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
      
      console.log('Default admin user created: admin@jamqueuepro.com / admin123!')
    }

    return Response.json({ 
      success: true, 
      message: 'Admin system migration completed successfully',
      defaultAdmin: adminExists.length === 0 ? {
        email: 'admin@jamqueuepro.com',
        password: 'admin123!',
        note: 'Please change this password immediately!'
      } : null
    })
  } catch (error) {
    console.error('Admin migration error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
