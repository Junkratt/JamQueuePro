import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Create email transporter with Mailgun
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production Mailgun SMTP configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailgun.org',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // false for port 587
      auth: {
        user: process.env.EMAIL_USER, // postmaster@your-domain.mailgun.org
        pass: process.env.EMAIL_PASS  // your mailgun password
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  } else {
    // Development - log emails
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    })
  }
}

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@jamqueuepro.com',
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

  if (process.env.NODE_ENV !== 'production') {
    // In development, just log the email details
    console.log('=== DEVELOPMENT EMAIL ===')
    console.log('To:', email)
    console.log('Verification URL:', verificationUrl)
    console.log('Subject:', mailOptions.subject)
    console.log('========================')
    return true
  }

  try {
    const transporter = createTransporter()
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
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
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
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

    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user.id,
      emailSent
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
