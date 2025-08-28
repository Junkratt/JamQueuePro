import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface User {
  id: string
  email: string
  name: string | null
  role?: string
  status?: string
}

interface AuthResult {
  admin?: User
  user?: User
  error: string | null
  status?: number
}

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  try {
    // In a real app, you'd get the session from NextAuth
    // For now, we'll check via email parameter or header
    const adminEmail = request.headers.get('admin-email') || 
                      request.nextUrl.searchParams.get('adminEmail')
    
    if (!adminEmail) {
      return { error: 'Admin authentication required', status: 401 }
    }

    // Use raw query to avoid Prisma schema issues if columns don't exist yet
    try {
      const adminResult = await prisma.$queryRaw`
        SELECT id, email, name, role, status FROM "User" WHERE email = ${adminEmail} LIMIT 1
      ` as any[]

      if (adminResult.length === 0) {
        return { error: 'Admin not found', status: 403 }
      }

      const admin = adminResult[0]
      
      if (!admin.role || admin.role !== 'admin' || (admin.status && admin.status !== 'active')) {
        return { error: 'Admin access denied', status: 403 }
      }

      return { admin, error: null }
    } catch (dbError) {
      // If role/status columns don't exist, check if user exists and is the default admin
      const user = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      if (!user || adminEmail !== 'admin@jamqueuepro.com') {
        return { error: 'Admin access denied - please run admin migration first', status: 403 }
      }

      return { admin: { ...user, role: 'admin', status: 'active' }, error: null }
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return { error: 'Authentication failed', status: 500 }
  }
}

export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  try {
    const userEmail = request.headers.get('user-email') || 
                     request.nextUrl.searchParams.get('userEmail')
    
    if (!userEmail) {
      return { error: 'Authentication required', status: 401 }
    }

    try {
      const userResult = await prisma.$queryRaw`
        SELECT id, email, name, role, status FROM "User" WHERE email = ${userEmail} LIMIT 1
      ` as any[]

      if (userResult.length === 0) {
        return { error: 'User not found', status: 404 }
      }

      const user = userResult[0]

      if (user.status && user.status !== 'active') {
        return { error: 'User account is not active', status: 403 }
      }

      if (!user.role || !allowedRoles.includes(user.role)) {
        return { error: `Access denied. Required roles: ${allowedRoles.join(', ')}`, status: 403 }
      }

      return { user, error: null }
    } catch (dbError) {
      // Fallback if columns don't exist
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      if (!user) {
        return { error: 'User not found', status: 404 }
      }

      // Default to 'performer' role if role system isn't set up yet
      const defaultRole = 'performer'
      if (!allowedRoles.includes(defaultRole)) {
        return { error: `Access denied. Required roles: ${allowedRoles.join(', ')}`, status: 403 }
      }

      return { user: { ...user, role: defaultRole, status: 'active' }, error: null }
    }
  } catch (error) {
    console.error('Role auth error:', error)
    return { error: 'Authentication failed', status: 500 }
  }
}

export async function logAdminAction(
  adminUserId: string, 
  action: string, 
  targetType: string, 
  targetId: string, 
  details?: any
) {
  try {
    const crypto = require('crypto')
    
    // Check if AdminLog table exists
    await prisma.$executeRaw`
      INSERT INTO "AdminLog" (id, "adminUserId", action, "targetType", "targetId", details, "createdAt")
      VALUES (${crypto.randomUUID()}, ${adminUserId}, ${action}, ${targetType}, ${targetId}, ${JSON.stringify(details || {})}, NOW())
    `
  } catch (error) {
    console.error('Failed to log admin action (table may not exist yet):', error)
  }
}
