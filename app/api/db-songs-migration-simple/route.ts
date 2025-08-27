import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Starting Song tables migration...')

    // Create Song table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Song" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        genre TEXT,
        key TEXT,
        tempo TEXT,
        difficulty TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`

    console.log('Song table created')

    // Create UserSong table  
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserSong" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "songId" TEXT NOT NULL,
        proficiency TEXT DEFAULT 'comfortable',
        created_at TIMESTAMP DEFAULT NOW()
      )`

    console.log('UserSong table created')

    // Add constraints separately to avoid conflicts
    try {
      await prisma.$executeRaw`
        ALTER TABLE "UserSong" 
        ADD CONSTRAINT "UserSong_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE`
    } catch (e) {
      console.log('UserSong userId constraint already exists or failed')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "UserSong" 
        ADD CONSTRAINT "UserSong_songId_fkey" 
        FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE`
    } catch (e) {
      console.log('UserSong songId constraint already exists or failed')
    }

    // Add indexes
    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "Song_title_artist_idx" 
        ON "Song"(lower(title), lower(artist))`
    } catch (e) {
      console.log('Song index already exists or failed')
    }

    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "UserSong_userId_songId_idx" 
        ON "UserSong"("userId", "songId")`
    } catch (e) {
      console.log('UserSong index already exists or failed')
    }

    // Test the tables with CAST to avoid BigInt issues
    const songCountResult = await prisma.$queryRaw`SELECT CAST(COUNT(*) AS INTEGER) as count FROM "Song"`
    const userSongCountResult = await prisma.$queryRaw`SELECT CAST(COUNT(*) AS INTEGER) as count FROM "UserSong"`

    const songCount = (songCountResult as any[])[0]?.count || 0
    const userSongCount = (userSongCountResult as any[])[0]?.count || 0

    console.log('Migration completed successfully')

    return Response.json({ 
      success: true, 
      message: 'Song tables created successfully',
      counts: {
        songs: songCount,
        userSongs: userSongCount
      }
    })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
