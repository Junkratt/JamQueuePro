import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        _count: {
          select: {
            events: true
          }
        }
      }
    })

    if (!venue) {
      return Response.json({ error: 'Venue not found' }, { status: 404 })
    }

    return Response.json(venue)
  } catch (error) {
    console.error('Venue fetch error:', error)
    return Response.json({ error: 'Failed to fetch venue' }, { status: 500 })
  }
}
