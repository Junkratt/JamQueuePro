import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '../../../../lib/auth'

const prisma = new PrismaClient()

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = params.id
    const updates = await request.json()
    
    const allowedUpdates = ['name', 'nickname', 'email', 'role', 'phone', 'status']
    const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key))
    
    if (updateFields.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    let setClause = updateFields.map((field, index) => `"${field}" = $${index + 2}`).join(', ')
    setClause += `, "updatedBy" = $${updateFields.length + 2}, "updatedAt" = NOW()`
    
    const params_array = [userId, ...updateFields.map(field => updates[field]), authResult.admin.id]

    await prisma.$queryRawUnsafe(`
      UPDATE "User" 
      SET ${setClause}
      WHERE id = $1
    `, ...params_array)

    await logAdminAction(
      authResult.admin.id,
      'UPDATE_USER',
      'User',
      userId,
      updates
    )

    return Response.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Admin update user error:', error)
    return Response.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = params.id

    // Get user info before deletion for logging
    const user = await prisma.$queryRaw`
      SELECT email, name, role FROM "User" WHERE id = ${userId}
    ` as any[]

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${userId}`

    await logAdminAction(
      authResult.admin.id,
      'DELETE_USER',
      'User',
      userId,
      { email: user[0].email, name: user[0].name, role: user[0].role }
    )

    return Response.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return Response.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
