import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    const signups = await prisma.eventSignup.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            instruments: true
          }
        }
      },
      orderBy: {
        queuePosition: 'asc'
      }
    })

    return Response.json(signups)
  } catch (error) {
    console.error('Signup fetch error:', error)
    return Response.json({ error: 'Failed to fetch signups' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const data = await request.json()

    if (!data.userEmail) {
      return Response.json({ error: 'User email required' }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: data.userEmail }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already signed up
    const existingSignup = await prisma.eventSignup.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id
        }
      }
    })

    if (existingSignup) {
      return Response.json({ error: 'Already signed up for this event' }, { status: 400 })
    }

    // Get the next queue position
    const lastSignup = await prisma.eventSignup.findFirst({
      where: { eventId },
      orderBy: { queuePosition: 'desc' }
    })

    const queuePosition = (lastSignup?.queuePosition || 0) + 1

    // Create the signup
    const signup = await prisma.eventSignup.create({
      data: {
        eventId,
        userId: user.id,
        queuePosition,
        instruments: data.instruments || [],
        needsMembers: data.needsMembers || [],
        notes: data.notes || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return Response.json(signup, { status: 201 })
  } catch (error) {
    console.error('Signup creation error:', error)
    return Response.json({ 
      error: 'Failed to create signup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
