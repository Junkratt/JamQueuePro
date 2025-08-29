import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
    console.log('Activity logging failed:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminEmail, newPassword } = await request.json()
    const userId = params.id

    console.log('Password reset attempt:', { userId, adminEmail, passwordLength: newPassword?.length })

    if (!adminEmail || !newPassword) {
      return Response.json({ error: 'Admin email and new password required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    // Verify admin permissions
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.log('Admin not found:', adminEmail)
      return Response.json({ error: 'Admin not found' }, { status: 403 })
    }

    // For now, assume any user can reset passwords (in production, check admin role)
    // TODO: Add proper admin role checking

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      console.log('Target user not found:', userId)
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Found target user:', { id: targetUser.id, email: targetUser.email })

    // Hash the new password with the same method used in registration
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
    
    console.log('Generated hash length:', hashedPassword.length)
    console.log('Hash starts with:', hashedPassword.substring(0, 10))

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        // Clear any password reset tokens if they exist
        emailVerificationToken: null
      }
    })

    console.log('Password updated successfully for user:', updatedUser.email)

    // Test the hash immediately to make sure it works
    const testHash = await bcrypt.compare(newPassword, hashedPassword)
    console.log('Hash test result:', testHash)

    // Log the password reset
    await logActivity({
      userId: admin.id,
      userEmail: adminEmail,
      action: 'ADMIN_PASSWORD_RESET',
      category: 'ADMIN',
      details: {
        targetUserId: userId,
        targetUserEmail: targetUser.email,
        resetBy: adminEmail
      },
      metadata: { path: '/api/admin/users/reset-password', method: 'POST' }
    })

    return Response.json({ 
      success: true, 
      message: 'Password reset successfully',
      debug: {
        userId: updatedUser.id,
        email: updatedUser.email,
        hashTest: testHash
      }
    })

  } catch (error) {
    console.error('Password reset error:', error)
    
    return Response.json({ 
      error: 'Failed to reset password', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
