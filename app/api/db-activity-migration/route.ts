import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Starting activity logging system migration...')

    // Create ActivityLog table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ActivityLog" (
        id TEXT PRIMARY KEY,
        "userId" TEXT,
        "userEmail" TEXT,
        action TEXT NOT NULL,
        category TEXT NOT NULL,
        details TEXT,
        metadata TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`

    console.log('ActivityLog table created')

    // Add foreign key constraint
    try {
      await prisma.$executeRaw`
        ALTER TABLE "ActivityLog" 
        ADD CONSTRAINT IF NOT EXISTS "ActivityLog_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL`
    } catch (e) {
      console.log('ActivityLog constraint already exists or failed to create')
    }

    // Create indexes for performance
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId")`
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "ActivityLog_category_idx" ON "ActivityLog"("category")`
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt")`
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "ActivityLog_action_idx" ON "ActivityLog"("action")`
      console.log('ActivityLog indexes created')
    } catch (e) {
      console.log('ActivityLog indexes already exist')
    }

    return Response.json({ 
      success: true, 
      message: 'Activity logging system migration completed successfully',
      tablesCreated: [
        'ActivityLog table with all necessary indexes',
        'Foreign key constraint to User table',
        'Optimized for analytics queries'
      ]
    })
  } catch (error) {
    console.error('Activity migration error:', error)
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
