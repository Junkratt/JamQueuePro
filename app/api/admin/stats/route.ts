import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    // Get user counts by role
    const userStats = await prisma.$queryRaw`
      SELECT 
        CAST(COUNT(*) AS INTEGER) as total_users,
        CAST(COUNT(*) FILTER (WHERE role = 'performer') AS INTEGER) as performers,
        CAST(COUNT(*) FILTER (WHERE role = 'organizer') AS INTEGER) as organizers,
        CAST(COUNT(*) FILTER (WHERE role = 'admin') AS INTEGER) as admins,
        CAST(COUNT(*) FILTER (WHERE status = 'suspended') AS INTEGER) as suspended
      FROM "User"
    ` as any[]

    // Get venue stats
    const venueStats = await prisma.$queryRaw`
      SELECT 
        CAST(COUNT(*) AS INTEGER) as total_venues,
        CAST(COUNT(*) FILTER (WHERE status = 'active') AS INTEGER) as active_venues,
        CAST(COUNT(*) FILTER (WHERE status = 'suspended') AS INTEGER) as suspended_venues
      FROM "Venue"
    ` as any[]

    // Get organizer approval stats
    const organizerStats = await prisma.$queryRaw`
      SELECT 
        CAST(COUNT(*) AS INTEGER) as pending_organizers,
        CAST(COUNT(*) FILTER (WHERE status = 'approved') AS INTEGER) as approved_organizers,
        CAST(COUNT(*) FILTER (WHERE status = 'rejected') AS INTEGER) as rejected_organizers
      FROM "VenueOrganizer"
    ` as any[]

    // Get recent admin actions
    const recentActions = await prisma.$queryRaw`
      SELECT 
        al.action, al."targetType", al."targetId", al."createdAt",
        u.name as admin_name
      FROM "AdminLog" al
      JOIN "User" u ON al."adminUserId" = u.id
      ORDER BY al."createdAt" DESC
      LIMIT 10
    ` as any[]

    return Response.json({
      totalUsers: userStats[0]?.total_users || 0,
      performers: userStats[0]?.performers || 0,
      organizers: userStats[0]?.organizers || 0,
      admins: userStats[0]?.admins || 0,
      suspendedUsers: userStats[0]?.suspended || 0,
      totalVenues: venueStats[0]?.total_venues || 0,
      activeVenues: venueStats[0]?.active_venues || 0,
      suspendedVenues: venueStats[0]?.suspended_venues || 0,
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
