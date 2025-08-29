import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    // Find venues where this user is the organizer
    const venues = await prisma.venue.findMany({
      where: { 
        organizerId: email
      },
      include: {
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return Response.json(venues)
  } catch (error) {
    console.error('Organizer venues fetch error:', error)
    return Response.json({ error: 'Failed to fetch organizer venues' }, { status: 500 })
  }
}
