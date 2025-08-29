import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    // For now, let's find venues using raw SQL since the Prisma model might not be updated
    const venues = await prisma.$queryRaw`
      SELECT v.*, COUNT(e.id) as event_count
      FROM "Venue" v
      LEFT JOIN "Event" e ON v.id = e."venueId"
      WHERE v."organizerId" = ${email} OR v."ownerId" = ${email}
      GROUP BY v.id
      ORDER BY v.name ASC
    ` as any[]

    return Response.json(venues)
  } catch (error) {
    console.error('Organizer venues fetch error:', error)
    // If the organizerId column doesn't exist yet, return empty array
    return Response.json([])
  }
}
