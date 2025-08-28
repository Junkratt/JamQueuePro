import { NextRequest } from 'next/server'
import { logActivity, extractRequestMetadata } from '../../../lib/activity'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.action || !data.category) {
      return Response.json({ error: 'Action and category are required' }, { status: 400 })
    }

    await logActivity({
      userId: data.userId,
      userEmail: data.userEmail,
      action: data.action,
      category: data.category,
      details: data.details,
      metadata: {
        ...extractRequestMetadata(request),
        ...data.metadata
      }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Activity logging error:', error)
    // Don't return error to avoid breaking user flows
    return Response.json({ success: false })
  }
}
