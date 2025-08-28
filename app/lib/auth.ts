import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface User {
  id: string
  email: string
  name: string | null
  role: string
  status: string
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

    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    })

    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      return { error: 'Admin access denied', status: 403 }
    }

    return { admin, error: null }
  } catch (error) {
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

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    })

    if (!user || user.status !== 'active') {
      return { error: 'User not found or inactive', status: 403 }
    }

    if (!allowedRoles.includes(user.role)) {
      return { error: `Access denied. Required roles: ${allowedRoles.join(', ')}`, status: 403 }
    }

    return { user, error: null }
  } catch (error) {
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
    await prisma.$executeRaw`
      INSERT INTO "AdminLog" (id, "adminUserId", action, "targetType", "targetId", details)
      VALUES (${crypto.randomUUID()}, ${adminUserId}, ${action}, ${targetType}, ${targetId}, ${JSON.stringify(details || {})})
    `
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}
