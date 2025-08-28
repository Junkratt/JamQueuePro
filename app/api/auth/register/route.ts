import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Simple activity logging function for this file
async function logActivity(data: any) {
  try {
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

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  if (process.env.NODE_ENV !== 'production') {
    // In development, just log the email details
    console.log('=== DEVELOPMENT EMAIL ===')
    console.log('To:', email)
    console.log('Verification URL:', verificationUrl)
    console.log('========================')
    return true
  }

  try {
    // Import Mailgun dynamically to avoid build issues
    const formData = require('form-data')
    const Mailgun = require('mailgun.js')
    
    const mailgun = new Mailgun(formData)
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })

    const messageData = {
      from: process.env.EMAIL_FROM || 'noreply@jarrattvandyke.com',
      to: email,
      subject: 'Verify Your Email - Jam Queue Pro',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">Jam Queue Pro</h1>
          </div>
          
          <h2>Welcome to Jam Queue Pro!</h2>
          <p>Thank you for signing up. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't create an account with Jam Queue Pro, you can safely ignore this email.
          </p>
        </div>
      `
    }

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData)
    console.log('Email sent successfully:', response.id)
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      await logActivity({
        userEmail: email,
        action: 'REGISTRATION_FAILED',
        category: 'AUTH',
        details: { reason: 'Missing required fields' },
        metadata: { path: '/api/auth/register', method: 'POST' }
      })
      
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      await logActivity({
        userEmail: email,
        action: 'REGISTRATION_FAILED',
        category: 'AUTH',
        details: { reason: 'Invalid email format' },
        metadata: { path: '/api/auth/register', method: 'POST' }
      })
      
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      await logActivity({
        userEmail: email,
        action: 'REGISTRATION_FAILED',
        category: 'AUTH',
        details: { reason: 'Password too short' },
        metadata: { path: '/api/auth/register', method: 'POST' }
      })
      
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      if (existingUser.emailVerified) {
        await logActivity({
          userEmail: email,
          action: 'REGISTRATION_FAILED',
          category: 'AUTH',
          details: { reason: 'Email already exists and verified' },
          metadata: { path: '/api/auth/register', method: 'POST' }
        })
        
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      } else {
        // User exists but email not verified - resend verification
        const verificationToken = crypto.randomBytes(32).toString('hex')
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerificationToken: verificationToken,
            password: await bcrypt.hash(password, 12),
            name: name
          }
        })

        const emailSent = await sendVerificationEmail(email, verificationToken)
        
        await logActivity({
          userId: existingUser.id,
          userEmail: email,
          action: 'VERIFICATION_EMAIL_RESENT',
          category: 'AUTH',
          details: { emailSent },
          metadata: { path: '/api/auth/register', method: 'POST' }
        })
        
        return NextResponse.json({
          message: 'Verification email sent. Please check your email to complete registration.',
          emailSent
        })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        emailVerificationToken: verificationToken
      }
    })

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken)

    // Log successful registration
    await logActivity({
      userId: user.id,
      userEmail: email,
      action: 'USER_REGISTERED',
      category: 'AUTH',
      details: { name, emailSent },
      metadata: { path: '/api/auth/register', method: 'POST' }
    })

    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user.id,
      emailSent
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    await logActivity({
      userEmail: 'unknown',
      action: 'REGISTRATION_ERROR',
      category: 'AUTH',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      metadata: { path: '/api/auth/register', method: 'POST' }
    })
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
