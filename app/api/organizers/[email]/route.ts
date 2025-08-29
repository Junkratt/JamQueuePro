import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email)

    const organizer = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        location: true,
        bio: true,
        profileImage: true,
        instruments: true,
        musicPrefs: true,
        experience: true
      }
    })

    if (!organizer) {
      return Response.json({ error: 'Organizer not found' }, { status: 404 })
    }

    return Response.json(organizer)
  } catch (error) {
    console.error('Organizer fetch error:', error)
    return Response.json({ error: 'Failed to fetch organizer' }, { status: 500 })
  }
}
