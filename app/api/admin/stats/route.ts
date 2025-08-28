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
    // Get user counts by role - handle case where role column might not exist
    let userStats
    try {
      userStats = await prisma.$queryRaw`
        SELECT 
          CAST(COUNT(*) AS INTEGER) as total_users,
          CAST(COUNT(*) FILTER (WHERE role = 'performer' OR role IS NULL) AS INTEGER) as performers,
          CAST(COUNT(*) FILTER (WHERE role = 'organizer') AS INTEGER) as organizers,
          CAST(COUNT(*) FILTER (WHERE role = 'admin') AS INTEGER) as admins,
          CAST(COUNT(*) FILTER (WHERE status = 'suspended') AS INTEGER) as suspended
        FROM "User"
      ` as any[]
    } catch (roleError) {
      // Fallback if role column doesn't exist
      userStats = await prisma.$queryRaw`
        SELECT 
          CAST(COUNT(*) AS INTEGER) as total_users,
          CAST(COUNT(*) AS INTEGER) as performers,
          CAST(0 AS INTEGER) as organizers,
          CAST(0 AS INTEGER) as admins,
          CAST(0 AS INTEGER) as suspended
        FROM "User"
      ` as any[]
    }

    // Get venue stats
    let venueStats
    try {
      venueStats = await prisma.$queryRaw`
        SELECT 
          CAST(COUNT(*) AS INTEGER) as total_venues,
          CAST(COUNT(*) FILTER (WHERE status = 'active' OR status IS NULL) AS INTEGER) as active_venues,
          CAST(COUNT(*) FILTER (WHERE status = 'suspended') AS INTEGER) as suspended_venues
        FROM "Venue"
      ` as any[]
    } catch (venueError) {
      // Fallback if status column doesn't exist
      venueStats = await prisma.$queryRaw`
        SELECT 
          CAST(COUNT(*) AS INTEGER) as total_venues,
          CAST(COUNT(*) AS INTEGER) as active_venues,
          CAST(0 AS INTEGER) as suspended_venues
        FROM "Venue"
      ` as any[]
    }

    // Get event stats
    const eventStats = await prisma.$queryRaw`
      SELECT CAST(COUNT(*) AS INTEGER) as total_events
      FROM "Event"
    ` as any[]

    // Get organizer approval stats - handle case where table doesn't exist
    let organizerStats
    try {
      organizerStats = await prisma.$queryRaw`
        SELECT 
          CAST(COUNT(*) AS INTEGER) as pending_organizers,
          CAST(COUNT(*) FILTER (WHERE status = 'approved' OR approved = true) AS INTEGER) as approved_organizers,
          CAST(COUNT(*) FILTER (WHERE status = 'rejected') AS INTEGER) as rejected_organizers
        FROM "VenueOrganizer"
      ` as any[]
    } catch (organizerError) {
      organizerStats = [{ pending_organizers: 0, approved_organizers: 0, rejected_organizers: 0 }]
    }

    // Get recent admin actions - handle case where table doesn't exist
    let recentActions
    try {
      recentActions = await prisma.$queryRaw`
        SELECT 
          al.action, al."targetType", al."targetId", al."createdAt",
          u.name as admin_name
        FROM "AdminLog" al
        JOIN "User" u ON al."adminUserId" = u.id
        ORDER BY al."createdAt" DESC
        LIMIT 10
      ` as any[]
    } catch (logError) {
      recentActions = []
    }

    return Response.json({
      totalUsers: userStats[0]?.total_users || 0,
      performers: userStats[0]?.performers || 0,
      organizers: userStats[0]?.organizers || 0,
      admins: userStats[0]?.admins || 0,
      suspendedUsers: userStats[0]?.suspended || 0,
      totalVenues: venueStats[0]?.total_venues || 0,
      activeVenues: venueStats[0]?.active_venues || 0,
      suspendedVenues: venueStats[0]?.suspended_venues || 0,
      totalEvents: eventStats[0]?.total_events || 0,
      pendingOrganizers: organizerStats[0]?.pending_organizers || 0,
      approvedOrganizers: organizerStats[0]?.approved_organizers || 0,
      rejectedOrganizers: organizerStats[0]?.rejected_organizers || 0,
      recentActions
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return Response.json({ error: 'Failed to fetch admin stats' }, { status: 500 })
  }
}
