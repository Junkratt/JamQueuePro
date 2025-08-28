import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '../../../../../lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult.error || !authResult.admin) {
    return Response.json({ error: authResult.error || 'Admin required' }, { status: authResult.status || 401 })
  }

  try {
    const userId = params.id
    const { temporaryPassword, forceChange } = await request.json()

    // Get user info
    const userResult = await prisma.$queryRaw`
      SELECT email, name FROM "User" WHERE id = ${userId}
    ` as any[]

    if (userResult.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult[0]

    // Generate password
    const crypto = require('crypto')
    const bcrypt = require('bcryptjs')
    
    const newPassword = temporaryPassword || crypto.randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "password" = ${hashedPassword}, "updatedBy" = ${authResult.admin.id}, "updatedAt" = NOW()
      WHERE id = ${userId}
    `

    await logAdminAction(
      authResult.admin.id,
      'RESET_PASSWORD',
      'User',
      userId,
      { userEmail: user.email, temporaryPassword: !!temporaryPassword, forceChange }
    )

    return Response.json({
      message: 'Password reset successfully',
      temporaryPassword: newPassword,
      userEmail: user.email,
      userName: user.name,
      note: 'Please share this temporary password securely with the user'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return Response.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
