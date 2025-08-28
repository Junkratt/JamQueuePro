import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { logActivity, extractRequestMetadata } from '../../lib/activity'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.organizerEmail) {
      return Response.json({ error: 'Organizer email required' }, { status: 400 })
    }

    // Find the organizer
    const organizer = await prisma.user.findUnique({
      where: { email: data.organizerEmail }
    })

    if (!organizer) {
      return Response.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        dateTime: new Date(data.dateTime),
        duration: data.duration || 240,
        type: data.type,
        maxCapacity: data.maxCapacity || null,
        signupDeadline: data.signupDeadline ? new Date(data.signupDeadline) : null,
        houseband: data.houseband || false,
        housebandSongs: data.housebandSongs || [],
        venueId: data.venueId,
        organizerId: organizer.id
      }
    })

    // Log event creation
    await logActivity({
      userId: organizer.id,
      userEmail: data.organizerEmail,
      action: 'EVENT_CREATED',
      category: 'EVENTS',
      details: {
        eventId: event.id,
        title: data.title,
        type: data.type,
        venueId: data.venueId,
        duration: data.duration || 240,
        houseband: data.houseband || false,
        housebandSongCount: (data.housebandSongs || []).length,
        maxCapacity: data.maxCapacity || null
      },
      metadata: extractRequestMetadata(request)
    })

    return Response.json(event, { status: 201 })
  } catch (error) {
    console.error('Event creation error:', error)
    return Response.json({ 
      error: 'Failed to create event', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      include: {
        venue: {
          select: {
            name: true,
            city: true,
            state: true
          }
        },
        organizer: {
          select: {
            name: true,
            email: true
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

    // Log events view (without specific user info since this might be public)
    await logActivity({
      action: 'EVENTS_LIST_VIEWED',
      category: 'EVENTS',
      details: { eventCount: events.length },
      metadata: extractRequestMetadata(request)
    })

    return Response.json(events)
  } catch (error) {
    console.error('Events fetch error:', error)
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
