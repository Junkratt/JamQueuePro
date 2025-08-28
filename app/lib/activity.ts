import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ActivityLogData {
  userId?: string
  userEmail?: string
  action: string
  category: 'AUTH' | 'PROFILE' | 'SONGS' | 'EVENTS' | 'VENUES' | 'ADMIN' | 'NAVIGATION'
  details?: any
  metadata?: {
    userAgent?: string
    ip?: string
    path?: string
    method?: string
  }
}

export async function logActivity(data: ActivityLogData) {
  try {
    const crypto = require('crypto')
    
    // Get user ID if only email provided
    let userId = data.userId
    if (!userId && data.userEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: data.userEmail },
          select: { id: true }
        })
        userId = user?.id
      } catch (error) {
        console.error('Error finding user for activity log:', error)
      }
    }

    // Check if ActivityLog table exists, create if not
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ActivityLog" (
          id TEXT PRIMARY KEY,
          "userId" TEXT,
          "userEmail" TEXT,
          action TEXT NOT NULL,
          category TEXT NOT NULL,
          details TEXT,
          metadata TEXT,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
        )`
    } catch (e) {
      // Table might already exist
    }

    // Create the activity log entry
    await prisma.$executeRaw`
      INSERT INTO "ActivityLog" (id, "userId", "userEmail", action, category, details, metadata, "createdAt")
      VALUES (
        ${crypto.randomUUID()}, 
        ${userId || null}, 
        ${data.userEmail || null}, 
        ${data.action}, 
        ${data.category}, 
        ${JSON.stringify(data.details || {})}, 
        ${JSON.stringify(data.metadata || {})}, 
        NOW()
      )`
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw error to avoid breaking user flows
  }
}

// Helper function to extract metadata from request
export function extractRequestMetadata(request: Request) {
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    path: new URL(request.url).pathname,
    method: request.method
  }
}
