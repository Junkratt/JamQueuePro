import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // For now, let's use a simple approach - get user by email from headers or cookies
    // This is a temporary solution until we properly set up NextAuth sessions
    
    // Try to get user info from the request somehow
    // Since NextAuth sessions aren't working properly, we'll need another approach
    
    return Response.json({ 
      error: 'Session authentication not yet implemented',
      message: 'Please try the temporary user lookup'
    }, { status: 401 })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Temporary approach: update user by email
    if (!data.email) {
      return Response.json({ error: 'Email required for update' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { email: data.email },
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
