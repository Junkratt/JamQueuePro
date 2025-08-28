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
      console.log('AdminLog constraint already exists or failed')
    }

    // Create indexes for performance
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status")`
    } catch (e) {
      console.log('User role/status index already exists')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Venue_status_idx" ON "Venue"("status")`
    } catch (e) {
      console.log('Venue status index already exists')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "VenueOrganizer_status_idx" ON "VenueOrganizer"("status")`
    } catch (e) {
      console.log('VenueOrganizer status index already exists')
    }
    
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "AdminLog_adminUserId_idx" ON "AdminLog"("adminUserId")`
    } catch (e) {
      console.log('AdminLog index already exists')
    }

    // Check if default admin user already exists
    const adminExists = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = 'admin@jamqueuepro.com' LIMIT 1
    ` as any[]

    let adminCreated = false
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
      adminCreated = true
    } else {
      // Update existing user to admin if needed
      await prisma.$executeRaw`
        UPDATE "User" 
        SET role = 'admin', status = 'active' 
        WHERE email = 'admin@jamqueuepro.com'`
      console.log('Updated existing admin user')
    }

    return Response.json({ 
      success: true, 
      message: 'Admin system migration completed successfully',
      defaultAdmin: adminCreated ? {
        email: 'admin@jamqueuepro.com',
        password: 'admin123!',
        note: 'Please change this password immediately!'
      } : {
        email: 'admin@jamqueuepro.com',
        note: 'Admin user updated - use your existing password'
      }
    })
  } catch (error) {
    console.error('Admin migration error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed',
      details: 'Please check server logs for more details'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
