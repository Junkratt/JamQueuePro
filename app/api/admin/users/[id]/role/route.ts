import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '../../../../../lib/auth'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult.error || !authResult.admin) {
    return Response.json({ error: authResult.error || 'Admin required' }, { status: authResult.status || 401 })
  }

  try {
    const userId = params.id
    const { role, reason } = await request.json()

    if (!role || !['performer', 'organizer', 'admin'].includes(role)) {
      return Response.json({ error: 'Valid role required (performer, organizer, admin)' }, { status: 400 })
    }

    // Get current user info
    const userResult = await prisma.$queryRaw`
      SELECT email, name, role as current_role FROM "User" WHERE id = ${userId}
    ` as any[]

    if (userResult.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult[0]

    // Prevent self-demotion from admin
    if (authResult.admin.id === userId && authResult.admin.role === 'admin' && role !== 'admin') {
      return Response.json({ error: 'Cannot remove admin role from yourself' }, { status: 400 })
    }

    // Update user role
    await prisma.$executeRaw`
      UPDATE "User" 
      SET role = ${role}, "updatedBy" = ${authResult.admin.id}, "updatedAt" = NOW()
      WHERE id = ${userId}
    `

    await logAdminAction(
      authResult.admin.id,
      'CHANGE_ROLE',
      'User',
      userId,
      { 
        userEmail: user.email, 
        oldRole: user.current_role, 
        newRole: role, 
        reason 
      }
    )

    return Response.json({
      message: 'User role updated successfully',
      userEmail: user.email,
      userName: user.name,
      oldRole: user.current_role,
      newRole: role
    })
  } catch (error) {
    console.error('Role assignment error:', error)
    return Response.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
