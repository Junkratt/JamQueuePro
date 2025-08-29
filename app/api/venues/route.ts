import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple activity logging function
async function logActivity(data: any) {
  try {
    const crypto = require('crypto')
    const activityId = crypto.randomUUID()
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ActivityLog" (
        id TEXT PRIMARY KEY,
        "userId" TEXT,
        "userEmail" TEXT,
        action TEXT NOT NULL,
        category TEXT NOT NULL,
        details TEXT,
        metadata TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`

    await prisma.$executeRaw`
      INSERT INTO "ActivityLog" (id, "userId", "userEmail", action, category, details, metadata, "createdAt")
      VALUES (
        ${activityId}, 
        ${data.userId || null}, 
        ${data.userEmail || null}, 
        ${data.action}, 
        ${data.category}, 
        ${JSON.stringify(data.details || {})}, 
        ${JSON.stringify(data.metadata || {})}, 
        NOW()
      )`
  } catch (error) {
    // Silently fail
  }
}

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

    // First, try to add the new columns if they don't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Venue" 
        ADD COLUMN IF NOT EXISTS "venuePhoto" TEXT,
        ADD COLUMN IF NOT EXISTS "instrumentsProvided" TEXT[],
        ADD COLUMN IF NOT EXISTS "hasPASystem" BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS "jamNightDetails" TEXT,
        ADD COLUMN IF NOT EXISTS "organizerId" TEXT`
    } catch (error) {
      console.log('Venue columns may already exist or migration failed:', error)
    }

    // Create venue using raw SQL to handle dynamic fields
    const venueId = require('crypto').randomUUID()
    
    await prisma.$executeRaw`
      INSERT INTO "Venue" (
        id, name, address, city, state, "zipCode", email, phone, website, 
        description, capacity, amenities, "venuePhoto", "instrumentsProvided", 
        "hasPASystem", "jamNightDetails", "organizerId", "createdAt"
      ) VALUES (
        ${venueId},
        ${data.name},
        ${data.address},
        ${data.city},
        ${data.state},
        ${data.zipCode},
        ${data.email},
        ${data.phone || null},
        ${data.website || null},
        ${data.description || null},
        ${data.capacity || null},
        ${JSON.stringify(data.amenities || [])},
        ${data.venuePhoto || null},
        ${JSON.stringify(data.instrumentsProvided || [])},
        ${data.hasPASystem || false},
        ${data.jamNightDetails || null},
        ${data.organizerId || data.ownerId},
        NOW()
      )`

    // Get the created venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    })

    // Log venue creation
    await logActivity({
      userId: owner.id,
      userEmail: data.ownerId,
      action: 'VENUE_REGISTERED',
      category: 'VENUES',
      details: {
        venueId: venueId,
        venueName: data.name,
        city: data.city,
        state: data.state,
        hasPASystem: data.hasPASystem || false,
        instrumentCount: (data.instrumentsProvided || []).length,
        amenityCount: (data.amenities || []).length
      },
      metadata: { path: '/api/venues', method: 'POST' }
    })

    return Response.json({ id: venueId, ...venue }, { status: 201 })
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
