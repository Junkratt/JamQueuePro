import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    console.log('Testing password for:', email)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found:', { 
      id: user.id, 
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      passwordHash: user.password?.substring(0, 20) + '...'
    })

    if (!user.password) {
      return Response.json({ error: 'No password set for user' }, { status: 400 })
    }

    // Test password comparison
    const isValid = await bcrypt.compare(password, user.password)
    
    console.log('Password test result:', isValid)

    // Also test creating a new hash with the same password
    const newHash = await bcrypt.hash(password, 12)
    const newHashTest = await bcrypt.compare(password, newHash)
    
    console.log('New hash test:', newHashTest)

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      },
      passwordTest: {
        isValid,
        newHashTest,
        originalHashPrefix: user.password.substring(0, 20),
        newHashPrefix: newHash.substring(0, 20)
      }
    })

  } catch (error) {
    console.error('Password test error:', error)
    return Response.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
