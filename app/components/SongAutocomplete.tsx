'use client'

import { useState, useEffect, useRef } from 'react'

interface Song {
  title: string
  artist: string
  genre?: string
  album?: string
  year?: number
  artwork?: string
}

interface SongAutocompleteProps {
  onSongSelect: (song: Song) => void
  placeholder?: string
}

export default function SongAutocomplete({ onSongSelect, placeholder = "Search for a song..." }: SongAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const searchSongs = async () => {
      if (query.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&limit=10`)
        if (response.ok) {
          const songs = await response.json()
          setSuggestions(songs)
          setShowSuggestions(true)
          setSelectedIndex(-1)
        } else {
          console.error('Search failed:', response.status)
          setSuggestions([])
        }
      } catch (error) {
        console.error('Failed to search songs:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchSongs, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSongSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSongSelect = (song: Song) => {
    onSongSelect(song)
    setQuery(`${song.title} - ${song.artist}`)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    // Clear the input after a brief moment to show selection
    setTimeout(() => {
      setQuery('')
      inputRef.current?.focus()
    }, 1000)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem',
            paddingRight: '2.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderTop: 'none',
          borderRadius: '0 0 0.375rem 0.375rem',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          zIndex: 50,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {suggestions.length === 0 && !isLoading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎵</div>
              <div>No songs found</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Try different search terms</div>
            </div>
          ) : (
            suggestions.map((song, index) => (
              <div
                key={`${song.title}-${song.artist}-${index}`}
                onClick={() => handleSongSelect(song)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  backgroundColor: selectedIndex === index ? '#dbeafe' : 'white',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Album Artwork */}
                {song.artwork ? (
                  <img
                    src={song.artwork}
                    alt={`${song.title} artwork`}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.25rem',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    🎵
                  </div>
                )}
                
                {/* Song Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {song.title}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {song.artist}
                    {song.genre && ` • ${song.genre}`}
                    {song.year && ` • ${song.year}`}
                  </div>
                  {song.album && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#9ca3af',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {song.album}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                {selectedIndex === index && (
                  <div style={{ color: '#2563eb', fontSize: '1rem' }}>✓</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
