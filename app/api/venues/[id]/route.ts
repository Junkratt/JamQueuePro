import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id

    // Try to get venue with enhanced fields using raw query
    try {
      const venues = await prisma.$queryRaw`
        SELECT v.*, COUNT(e.id) as event_count
        FROM "Venue" v
        LEFT JOIN "Event" e ON v.id = e."venueId"
        WHERE v.id = ${venueId}
        GROUP BY v.id
      ` as any[]

      if (venues.length === 0) {
        return Response.json({ error: 'Venue not found' }, { status: 404 })
      }

      // Parse JSON fields if they exist
      const venue = venues[0]
      try {
        if (venue.amenities && typeof venue.amenities === 'string') {
          venue.amenities = JSON.parse(venue.amenities)
        }
        if (venue.instrumentsProvided && typeof venue.instrumentsProvided === 'string') {
          venue.instrumentsProvided = JSON.parse(venue.instrumentsProvided)
        }
      } catch (parseError) {
        console.log('JSON parsing error for venue fields:', parseError)
      }

      return Response.json(venue)
    } catch (rawQueryError) {
      // Fallback to regular Prisma query if raw query fails
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
    }
  } catch (error) {
    console.error('Venue fetch error:', error)
    return Response.json({ error: 'Failed to fetch venue' }, { status: 500 })
  }
}
