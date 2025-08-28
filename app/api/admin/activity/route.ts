import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult.error || !authResult.admin) {
    return Response.json({ error: authResult.error || 'Admin required' }, { status: authResult.status || 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build where clause
    let whereClause = `WHERE al."createdAt" >= NOW() - INTERVAL '${days} days'`
    const params: any[] = []
    let paramIndex = 1

    if (category) {
      whereClause += ` AND al.category = $${paramIndex++}`
      params.push(category)
    }

    if (search) {
      whereClause += ` AND (al.action ILIKE $${paramIndex++} OR u.name ILIKE $${paramIndex++} OR u.email ILIKE $${paramIndex++})`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // Get activities with user info
    const activities = await prisma.$queryRawUnsafe(`
      SELECT 
        al.id,
        al."userId",
        al."userEmail",
        al.action,
        al.category,
        al.details,
        al.metadata,
        al."createdAt",
        u.name as "userName",
        u.email as "userEmailFromUser"
      FROM "ActivityLog" al
      LEFT JOIN "User" u ON al."userId" = u.id
      ${whereClause}
      ORDER BY al."createdAt" DESC
      LIMIT $${paramIndex++}
    `, ...params, limit)

    // Get summary stats
    const totalStats = await prisma.$queryRawUnsafe(`
      SELECT 
        CAST(COUNT(*) AS INTEGER) as "totalActivities",
        CAST(COUNT(DISTINCT al."userId") AS INTEGER) as "uniqueUsers"
      FROM "ActivityLog" al
      LEFT JOIN "User" u ON al."userId" = u.id
      ${whereClause}
    `, ...params.slice(0, params.length - 1)) as any[]

    // Get category breakdown
    const categoryStats = await prisma.$queryRawUnsafe(`
      SELECT 
        al.category,
        CAST(COUNT(*) AS INTEGER) as count,
        CAST(COUNT(DISTINCT al."userId") AS INTEGER) as "uniqueUsers"
      FROM "ActivityLog" al
      LEFT JOIN "User" u ON al."userId" = u.id
      ${whereClause}
      GROUP BY al.category
      ORDER BY count DESC
    `, ...params.slice(0, params.length - 1)) as any[]

    // Parse JSON details safely
    const parsedActivities = (activities as any[]).map(activity => {
      let details = {}
      try {
        details = activity.details ? JSON.parse(activity.details) : {}
      } catch (e) {
        details = {}
      }

      return {
        ...activity,
        details,
        userName: activity.userName || null,
        userEmail: activity.userEmailFromUser || activity.userEmail
      }
    })

    return Response.json({
      activities: parsedActivities,
      stats: {
        totalActivities: totalStats[0]?.totalActivities || 0,
        uniqueUsers: totalStats[0]?.uniqueUsers || 0,
        categoryCounts: categoryStats || []
      }
    })
  } catch (error) {
    console.error('Activity analytics error:', error)
    
    // Return empty data if ActivityLog table doesn't exist yet
    if (error instanceof Error && error.message.includes('does not exist')) {
      return Response.json({
        activities: [],
        stats: {
          totalActivities: 0,
          uniqueUsers: 0,
          categoryCounts: []
        }
      })
    }

    return Response.json({ error: 'Failed to fetch activity analytics' }, { status: 500 })
  }
}
