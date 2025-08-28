import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { logActivity, extractRequestMetadata } from '../../lib/activity'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')

    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }

    // Check if tables exist first
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Song" LIMIT 1`
      await prisma.$queryRaw`SELECT 1 FROM "UserSong" LIMIT 1`
    } catch (tableError) {
      // Tables don't exist yet
      return Response.json([])
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user songs using raw query to handle potential relation issues
    const userSongs = await prisma.$queryRaw`
      SELECT 
        us.id,
        us.proficiency,
        s.id as song_id,
        s.title,
        s.artist,
        s.genre,
        s.key
      FROM "UserSong" us
      JOIN "Song" s ON us."songId" = s.id
      WHERE us."userId" = ${user.id}
      ORDER BY s.title ASC
    `

    // Transform to match expected format
    const formattedSongs = (userSongs as any[]).map(row => ({
      id: row.id,
      proficiency: row.proficiency,
      song: {
        id: row.song_id,
        title: row.title,
        artist: row.artist,
        genre: row.genre,
        key: row.key
      }
    }))

    // Log songs library view
    await logActivity({
      userId: user.id,
      userEmail: userEmail,
      action: 'SONGS_LIBRARY_VIEWED',
      category: 'SONGS',
      details: { songCount: formattedSongs.length },
      metadata: extractRequestMetadata(request)
    })

    return Response.json(formattedSongs)
  } catch (error) {
    console.error('Songs fetch error:', error)
    return Response.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail, title, artist, genre, key, proficiency } = await request.json()

    if (!userEmail || !title || !artist) {
      return Response.json({ error: 'Email, title, and artist are required' }, { status: 400 })
    }

    // Check if tables exist first
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Song" LIMIT 1`
      await prisma.$queryRaw`SELECT 1 FROM "UserSong" LIMIT 1`
    } catch (tableError) {
      return Response.json({ 
        error: 'Song tables not initialized. Please contact support.' 
      }, { status: 500 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or find song using raw query
    const existingSongs = await prisma.$queryRaw`
      SELECT id FROM "Song" 
      WHERE lower(title) = lower(${title.trim()}) 
      AND lower(artist) = lower(${artist.trim()})
      LIMIT 1
    ` as any[]

    let songId: string
    let isNewSong = false
    
    if (existingSongs.length > 0) {
      songId = existingSongs[0].id
    } else {
      songId = crypto.randomUUID()
      isNewSong = true
      await prisma.$executeRaw`
        INSERT INTO "Song" (id, title, artist, genre, key)
        VALUES (${songId}, ${title.trim()}, ${artist.trim()}, ${genre || null}, ${key || null})
      `
    }

    // Check if user already knows this song
    const existingUserSongs = await prisma.$queryRaw`
      SELECT id FROM "UserSong" 
      WHERE "userId" = ${user.id} AND "songId" = ${songId}
      LIMIT 1
    ` as any[]

    if (existingUserSongs.length > 0) {
      return Response.json({ error: 'Song already in your library' }, { status: 400 })
    }

    // Add song to user's library
    const userSongId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "UserSong" (id, "userId", "songId", proficiency)
      VALUES (${userSongId}, ${user.id}, ${songId}, ${proficiency || 'comfortable'})
    `

    // Get the created record
    const newUserSong = await prisma.$queryRaw`
      SELECT 
        us.id,
        us.proficiency,
        s.id as song_id,
        s.title,
        s.artist,
        s.genre,
        s.key
      FROM "UserSong" us
      JOIN "Song" s ON us."songId" = s.id
      WHERE us.id = ${userSongId}
    ` as any[]

    const formattedSong = {
      id: newUserSong[0].id,
      proficiency: newUserSong[0].proficiency,
      song: {
        id: newUserSong[0].song_id,
        title: newUserSong[0].title,
        artist: newUserSong[0].artist,
        genre: newUserSong[0].genre,
        key: newUserSong[0].key
      }
    }

    // Log song addition
    await logActivity({
      userId: user.id,
      userEmail: userEmail,
      action: isNewSong ? 'SONG_ADDED_NEW' : 'SONG_ADDED_EXISTING',
      category: 'SONGS',
      details: {
        songTitle: title,
        songArtist: artist,
        genre: genre || null,
        proficiency: proficiency || 'comfortable',
        isNewSong
      },
      metadata: extractRequestMetadata(request)
    })

    return Response.json(formattedSong, { status: 201 })
  } catch (error) {
    console.error('Add song error:', error)
    return Response.json({ error: 'Failed to add song' }, { status: 500 })
  }
}
