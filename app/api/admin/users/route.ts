import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '../../../lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/users - List all users with filtering
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (role) {
      whereClause += ` AND role = $${paramIndex++}`
      params.push(role)
    }
    
    if (status) {
      whereClause += ` AND status = $${paramIndex++}`
      params.push(status)
    }
    
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++})`
      params.push(`%${search}%`, `%${search}%`)
    }

    const users = await prisma.$queryRawUnsafe(`
      SELECT 
        id, email, name, nickname, role, status, phone, "phoneVerified",
        "emailVerified", "lastLogin", "createdAt", "suspendedAt", "suspendedReason"
      FROM "User" 
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, ...params, limit, offset)

    const totalCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "User" ${whereClause}
    `, ...params) as any[]

    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / limit)
      }
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { email, name, role, phone } = await request.json()

    if (!email || !name || !role) {
      return Response.json({ error: 'Email, name, and role are required' }, { status: 400 })
    }

    const crypto = require('crypto')
    const bcrypt = require('bcryptjs')
    const userId = crypto.randomUUID()
    const tempPassword = crypto.randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    await prisma.$executeRaw`
      INSERT INTO "User" (
        id, email, name, "password", role, phone, status, "createdBy", "createdAt", "updatedAt"
      ) VALUES (
        ${userId}, ${email.toLowerCase()}, ${name}, ${hashedPassword}, ${role}, 
        ${phone || null}, 'active', ${authResult.admin.id}, NOW(), NOW()
      )
    `

    await logAdminAction(
      authResult.admin.id, 
      'CREATE_USER', 
      'User', 
      userId, 
      { email, name, role, phone }
    )

    return Response.json({
      message: 'User created successfully',
      userId,
      tempPassword,
      note: 'Please share the temporary password securely with the user'
    }, { status: 201 })
  } catch (error) {
    console.error('Admin create user error:', error)
    if (error.code === '23505') { // Unique constraint violation
      return Response.json({ error: 'Email already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
