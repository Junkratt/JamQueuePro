import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            signups: true
          }
        }
      }
    })

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    return Response.json(event)
  } catch (error) {
    console.error('Event fetch error:', error)
    return Response.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}
