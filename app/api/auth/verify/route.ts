import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Verification token is required' },
      { status: 400 }
    )
  }

  try {
    // Find user with this verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified. You can now sign in.' }
      )
    }

    // Verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null
      }
    })

    return NextResponse.json({
      message: 'Email verified successfully! You can now sign in.'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' }
      )
    }

    // Generate new verification token
    const crypto = require('crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken }
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('=== DEVELOPMENT EMAIL RESEND ===')
      console.log('To:', email)
      console.log('Verification URL:', verificationUrl)
      console.log('==============================')
    } else {
      // Send verification email using Mailgun API
      try {
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
              
              <h2>Email Verification</h2>
              <p>Please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
              
              <p>This verification link will expire in 24 hours.</p>
            </div>
          `
        }

        await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData)
      } catch (error) {
        console.error('Failed to send verification email:', error)
      }
    }

    return NextResponse.json({
      message: 'Verification email sent. Please check your email.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
