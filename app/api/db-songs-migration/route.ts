import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create Song table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Song" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        genre TEXT,
        key TEXT,
        tempo TEXT,
        difficulty TEXT,
        UNIQUE(title, artist)
      )`

    // Create UserSong table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserSong" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "songId" TEXT NOT NULL,
        proficiency TEXT DEFAULT 'learning',
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
        FOREIGN KEY ("songId") REFERENCES "Song"(id) ON DELETE CASCADE,
        UNIQUE("userId", "songId")
      )`

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Song_genre_idx" ON "Song"("genre")`
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Song_title_artist_key" ON "Song"("title", "artist")`
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "UserSong_userId_songId_key" ON "UserSong"("userId", "songId")`

    return Response.json({ 
      success: true, 
      message: 'Songs tables created successfully'
    })
  } catch (error) {
    console.error('Songs migration error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Allow GET requests too
}
