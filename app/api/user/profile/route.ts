import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // For now, we'll fetch the user by a different method since session lookup is complex
    // This is a temporary debug approach
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1
    })

    if (users.length === 0) {
      return Response.json({ error: 'No users found' }, { status: 404 })
    }

    return Response.json(users[0])
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Profile update request data:', data)

    if (!data.email) {
      return Response.json({ error: 'Email required for update' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!existingUser) {
      console.error('User not found with email:', data.email)
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Updating user:', existingUser.id)

    const updatedUser = await prisma.user.update({
      where: { email: data.email },
      data: {
        name: data.name,
        nickname: data.nickname,
        location: data.location,
        instruments: data.instruments || [],
        musicPrefs: data.musicPrefs || [],
        experience: data.experience,
        bio: data.bio,
      }
    })

    console.log('Profile updated successfully:', updatedUser)
    return Response.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return Response.json({ 
      error: 'Failed to update profile', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
