import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id

    const organizers = await prisma.venueOrganizer.findMany({
      where: { venueId },
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

    return Response.json(organizers)
  } catch (error) {
    console.error('Organizers fetch error:', error)
    return Response.json({ error: 'Failed to fetch organizers' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id
    const { userEmail, role = 'organizer' } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already exists
    const existing = await prisma.venueOrganizer.findUnique({
      where: {
        venueId_userId: {
          venueId,
          userId: user.id
        }
      }
    })

    if (existing) {
      return Response.json({ error: 'User is already an organizer for this venue' }, { status: 400 })
    }

    // Create organizer relationship
    const organizer = await prisma.venueOrganizer.create({
      data: {
        venueId,
        userId: user.id,
        role,
        approved: false // Requires approval
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

    return Response.json(organizer, { status: 201 })
  } catch (error) {
    console.error('Add organizer error:', error)
    return Response.json({ error: 'Failed to add organizer' }, { status: 500 })
  }
}
