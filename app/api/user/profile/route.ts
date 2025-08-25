import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies manually since getServerSession may not work
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return Response.json({ error: 'No session found' }, { status: 401 })
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    })

    if (!session || !session.user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

    return Response.json(session.user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session from cookies manually
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return Response.json({ error: 'No session found' }, { status: 401 })
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    })

    if (!session || !session.user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

    const data = await request.json()
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        nickname: data.nickname,
        location: data.location,
        instruments: data.instruments,
        musicPrefs: data.musicPrefs,
        experience: data.experience,
        bio: data.bio,
      }
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return Response.json({ 
      error: 'Failed to update profile', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
