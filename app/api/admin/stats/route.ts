import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ActivityItem {
  action: string
  category: string
  createdAt: Date
  userEmail: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('adminEmail')

    if (!adminEmail) {
      return Response.json({ error: 'Admin email required' }, { status: 400 })
    }

    // Verify admin exists
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      return Response.json({ error: 'Admin not found' }, { status: 403 })
    }

    // Initialize stats with proper types
    const stats = {
      totalUsers: 0,
      totalEvents: 0,
      totalVenues: 0,
      totalSignups: 0,
      recentSignups: 0,
      activeUsers: 0,
      recentActivity: [] as ActivityItem[]
    }

    try {
      // Try to get user count
      stats.totalUsers = await prisma.user.count()
    } catch (error) {
      console.log('User table query failed:', error)
    }

    try {
      // Try to get event count
      const eventCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Event"` as any[]
      stats.totalEvents = Number(eventCount[0]?.count || 0)
    } catch (error) {
      console.log('Event table query failed - table may not exist:', error)
    }

    try {
      // Try to get venue count
      const venueCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Venue"` as any[]
      stats.totalVenues = Number(venueCount[0]?.count || 0)
    } catch (error) {
      console.log('Venue table query failed - table may not exist:', error)
    }

    try {
      // Try to get signup count
      const signupCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "EventSignup"` as any[]
      stats.totalSignups = Number(signupCount[0]?.count || 0)
    } catch (error) {
      console.log('EventSignup table query failed - table may not exist:', error)
    }

    try {
      // Try to get recent activity
      const recentActivity = await prisma.$queryRaw`
        SELECT action, category, "createdAt", "userEmail"
        FROM "ActivityLog" 
        ORDER BY "createdAt" DESC 
        LIMIT 10
      ` as any[]
      
      stats.recentActivity = recentActivity.map(activity => ({
        action: activity.action || 'Unknown',
        category: activity.category || 'Unknown',
        createdAt: activity.createdAt || new Date(),
        userEmail: activity.userEmail || 'Unknown'
      }))
    } catch (error) {
      console.log('ActivityLog table query failed - table may not exist:', error)
    }

    // Calculate recent signups (last 7 days) and active users
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      stats.recentSignups = await prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })

      // Active users - users who have logged activity in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const activeUserCount = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "userEmail") as count 
        FROM "ActivityLog" 
        WHERE "createdAt" >= ${thirtyDaysAgo}
      ` as any[]
      
      stats.activeUsers = Number(activeUserCount[0]?.count || 0)
    } catch (error) {
      console.log('Recent activity query failed:', error)
    }

    return Response.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    
    // Return basic stats even if queries fail
    return Response.json({
      totalUsers: 0,
      totalEvents: 0,
      totalVenues: 0,
      totalSignups: 0,
      recentSignups: 0,
      activeUsers: 0,
      recentActivity: [] as ActivityItem[],
      error: 'Some database tables may not be initialized yet'
    })
  }
}
