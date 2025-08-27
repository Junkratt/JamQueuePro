import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')

    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        knownSongs: {
          include: {
            song: true
          },
          orderBy: {
            song: {
              title: 'asc'
            }
          }
        }
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(user.knownSongs)
  } catch (error) {
    console.error('Songs fetch error:', error)
    return Response.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail, title, artist, genre, key, proficiency, album, year } = await request.json()

    if (!userEmail || !title || !artist) {
      return Response.json({ error: 'Email, title, and artist are required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or find song
    let song = await prisma.song.findFirst({
      where: {
        AND: [
          { title: { equals: title.trim(), mode: 'insensitive' } },
          { artist: { equals: artist.trim(), mode: 'insensitive' } }
        ]
      }
    })

    if (!song) {
      song = await prisma.song.create({
        data: {
          id: crypto.randomUUID(),
          title: title.trim(),
          artist: artist.trim(),
          genre: genre || null,
          key: key || null
        }
      })
    }

    // Check if user already knows this song
    const existingUserSong = await prisma.userSong.findFirst({
      where: {
        userId: user.id,
        songId: song.id
      }
    })

    if (existingUserSong) {
      return Response.json({ error: 'Song already in your library' }, { status: 400 })
    }

    // Add song to user's library
    const userSong = await prisma.userSong.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        songId: song.id,
        proficiency: proficiency || 'comfortable'
      },
      include: {
        song: true
      }
    })

    return Response.json(userSong, { status: 201 })
  } catch (error) {
    console.error('Add song error:', error)
    return Response.json({ error: 'Failed to add song' }, { status: 500 })
  }
}
