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
    
    // Transform iTunes data to our format and clean it up
    const songs = data.results
      .filter((track: any) => track.trackName && track.artistName) // Filter out invalid entries
      .map((track: any) => ({
        title: track.trackName.trim(),
        artist: track.artistName.trim(),
        genre: track.primaryGenreName?.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()) || null,
        album: track.collectionName?.trim() || null,
        year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
        preview_url: track.previewUrl || null,
        artwork: track.artworkUrl100 || null
      }))

    // Remove duplicates by title + artist (case insensitive)
    const uniqueSongs = songs.filter((song: any, index: number, self: any[]) => 
      index === self.findIndex(s => 
        s.title.toLowerCase() === song.title.toLowerCase() && 
        s.artist.toLowerCase() === song.artist.toLowerCase()
      )
    )

    // Sort by relevance (exact matches first, then partial matches)
    const sortedSongs = uniqueSongs.sort((a: any, b: any) => {
      const queryLower = query.toLowerCase()
      const aTitleMatch = a.title.toLowerCase().indexOf(queryLower) === 0 ? 0 : 1
      const bTitleMatch = b.title.toLowerCase().indexOf(queryLower) === 0 ? 0 : 1
      const aArtistMatch = a.artist.toLowerCase().indexOf(queryLower) === 0 ? 0 : 1
      const bArtistMatch = b.artist.toLowerCase().indexOf(queryLower) === 0 ? 0 : 1
      
      // Prioritize: exact title match > exact artist match > partial matches
      return (aTitleMatch + aArtistMatch) - (bTitleMatch + bArtistMatch)
    })

    return Response.json(sortedSongs.slice(0, limit))
  } catch (error) {
    console.error('Song search error:', error)
    
    // Fallback to a basic popular songs list if iTunes fails
    const fallbackSongs = [
      { title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Rock" },
      { title: "Hotel California", artist: "Eagles", genre: "Rock" },
      { title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock" },
      { title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock" },
      { title: "Wonderwall", artist: "Oasis", genre: "Alternative" },
      { title: "Don't Stop Believin'", artist: "Journey", genre: "Rock" },
      { title: "Sweet Caroline", artist: "Neil Diamond", genre: "Pop" },
      { title: "Livin' on a Prayer", artist: "Bon Jovi", genre: "Rock" }
    ].filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    )

    return Response.json(fallbackSongs)
  }
}
