import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '../../../../../lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = params.id
    const { reason, action } = await request.json() // action: 'suspend' or 'unsuspend'

    if (action === 'suspend') {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET status = 'suspended', "suspendedAt" = NOW(), "suspendedReason" = ${reason || null}
        WHERE id = ${userId}
      `

      await logAdminAction(
        authResult.admin.id,
        'SUSPEND_USER',
        'User',
        userId,
        { reason }
      )

      return Response.json({ message: 'User suspended successfully' })
    } else if (action === 'unsuspend') {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET status = 'active', "suspendedAt" = NULL, "suspendedReason" = NULL
        WHERE id = ${userId}
      `

      await logAdminAction(
        authResult.admin.id,
        'UNSUSPEND_USER',
        'User',
        userId,
        { reason }
      )

      return Response.json({ message: 'User unsuspended successfully' })
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin suspend user error:', error)
    return Response.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}
