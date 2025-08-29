import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    // Find the organizer
    const organizer = await prisma.user.findUnique({
      where: { email: email }
    })

    if (!organizer) {
      return Response.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Find upcoming events organized by this user
    const events = await prisma.event.findMany({
      where: { 
        organizerId: organizer.id,
        dateTime: {
          gte: new Date()
        }
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        },
        _count: {
          select: {
            signups: true
          }
        }
      },
      orderBy: {
        dateTime: 'asc'
      }
    })

    return Response.json(events)
  } catch (error) {
    console.error('Organizer events fetch error:', error)
    return Response.json({ error: 'Failed to fetch organizer events' }, { status: 500 })
  }
}
