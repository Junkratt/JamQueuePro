import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.ownerId) {
      return Response.json({ error: 'Owner email required' }, { status: 400 })
    }

    // Find the user who will own this venue
    const owner = await prisma.user.findUnique({
      where: { email: data.ownerId }
    })

    if (!owner) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Create the venue - remove ownerId for now until schema is updated
    const venue = await prisma.venue.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        description: data.description || null,
        capacity: data.capacity || null,
        amenities: data.amenities || []
        // ownerId: owner.id  // Remove this line temporarily
      }
    })

    return Response.json(venue, { status: 201 })
  } catch (error) {
    console.error('Venue creation error:', error)
    return Response.json({ 
      error: 'Failed to create venue', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json(venues)
  } catch (error) {
    console.error('Venues fetch error:', error)
    return Response.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}
