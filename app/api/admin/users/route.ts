import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('adminEmail')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!adminEmail) {
      return Response.json({ error: 'Admin email required' }, { status: 400 })
    }

    // Verify admin exists (for now, any user can access - in production, check admin role)
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      return Response.json({ error: 'Admin not found' }, { status: 403 })
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        // Don't expose password hashes
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return Response.json(users)

  } catch (error) {
    console.error('Admin users fetch error:', error)
    return Response.json({ 
      error: 'Failed to fetch users', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminEmail, userData } = await request.json()

    if (!adminEmail) {
      return Response.json({ error: 'Admin email required' }, { status: 400 })
    }

    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      return Response.json({ error: 'Admin not found' }, { status: 403 })
    }

    // Create new user (implementation would go here)
    return Response.json({ message: 'User creation not implemented yet' }, { status: 501 })

  } catch (error) {
    console.error('Admin user create error:', error)
    return Response.json({ 
      error: 'Failed to create user', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
