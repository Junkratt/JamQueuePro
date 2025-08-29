import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Initialize default stats
    const stats = {
      totalUsers: 0,
      totalEvents: 0,
      totalVenues: 0,
      totalSignups: 0,
      recentSignups: 0,
      activeUsers: 0,
      recentActivity: []
    }

    try {
      // Try to get user count
      stats.totalUsers = await prisma.user.count()
    } catch (error) {
      console.log('User table query failed:', error)
    }

    try {
      // Try to get event count
      const eventCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Event"`
      stats.totalEvents = Number((eventCount as any)[0]?.count || 0)
    } catch (error) {
      console.log('Event table query failed - table may not exist:', error)
    }

    try {
      // Try to get venue count
      const venueCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Venue"`
      stats.totalVenues = Number((venueCount as any)[0]?.count || 0)
    } catch (error) {
      console.log('Venue table query failed - table may not exist:', error)
    }

    try {
      // Try to get signup count
      const signupCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "EventSignup"`
      stats.totalSignups = Number((signupCount as any)[0]?.count || 0)
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
        action: activity.action,
        category: activity.category,
        createdAt: activity.createdAt,
        userEmail: activity.userEmail
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
      
      stats.activeUsers = Number((activeUserCount as any)[0]?.count || 0)
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
      recentActivity: [],
      error: 'Some database tables may not be initialized yet'
    })
  }
}
