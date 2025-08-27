import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!query || query.length < 2) {
      return Response.json([])
    }

    // Search iTunes API
    const itunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}&country=US`
    )

    if (!itunesResponse.ok) {
      throw new Error('iTunes search failed')
    }

    const data = await itunesResponse.json()
    
    // Transform iTunes data to our format
    const songs = data.results.map((track: any) => ({
      title: track.trackName,
      artist: track.artistName,
      genre: track.primaryGenreName?.toLowerCase() || null,
      album: track.collectionName,
      year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
      preview_url: track.previewUrl
    }))

    // Remove duplicates by title + artist
    const uniqueSongs = songs.filter((song: any, index: number, self: any[]) => 
      index === self.findIndex(s => 
        s.title.toLowerCase() === song.title.toLowerCase() && 
        s.artist.toLowerCase() === song.artist.toLowerCase()
      )
    )

    return Response.json(uniqueSongs.slice(0, limit))
  } catch (error) {
    console.error('Song search error:', error)
    return Response.json({ error: 'Failed to search songs' }, { status: 500 })
  }
}
