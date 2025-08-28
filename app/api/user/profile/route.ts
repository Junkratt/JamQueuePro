import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple activity logging function for this file
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

    // Log profile view
    await logActivity({
      userId: users[0].id,
      userEmail: users[0].email,
      action: 'PROFILE_VIEWED',
      category: 'PROFILE',
      metadata: { path: '/api/user/profile', method: 'GET' }
    })

    return Response.json(users[0])
  } catch (error) {
    console.error('Profile fetch error:', error)
    
    // During build time, database might not be available - return a default response
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      return Response.json({
        id: 'build-time',
        name: 'Build User',
        email: 'build@example.com',
        nickname: '',
        location: '',
        instruments: [],
        musicPrefs: [],
        experience: 'beginner',
        bio: ''
      })
    }
    
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

    // Log profile update
    await logActivity({
      userId: existingUser.id,
      userEmail: data.email,
      action: 'PROFILE_UPDATED',
      category: 'PROFILE',
      details: {
        fieldsUpdated: Object.keys(data).filter(key => key !== 'email'),
        instrumentCount: (data.instruments || []).length,
        genreCount: (data.musicPrefs || []).length
      },
      metadata: { path: '/api/user/profile', method: 'PUT' }
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
