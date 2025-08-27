'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import SongAutocomplete from '../../components/SongAutocomplete'

interface UserSong {
  id: string
  proficiency: string
  song: {
    id: string
    title: string
    artist: string
    genre?: string
    key?: string
  }
}

export default function SongLibrary() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songs, setSongs] = useState<UserSong[]>([])
  const [newSong, setNewSong] = useState({ title: '', artist: '', genre: '', key: '', proficiency: 'comfortable' })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchUserSongs()
  }, [session, status, router])

  const fetchUserSongs = async () => {
    try {
      const response = await fetch(`/api/user/songs?email=${session?.user?.email}`)
      if (response.ok) {
        const data = await response.json()
        setSongs(data)
      }
    } catch (error) {
      console.error('Failed to fetch songs:', error)
    }
  }

  const handleSongSelect = (selectedSong: { title: string; artist: string; genre?: string }) => {
    setNewSong({
      title: selectedSong.title,
      artist: selectedSong.artist,
      genre: selectedSong.genre || '',
      key: '',
      proficiency: 'comfortable'
    })
    setMessage(`Selected: ${selectedSong.title} by ${selectedSong.artist}`)
  }

  const addSong = async () => {
    if (!newSong.title.trim() || !newSong.artist.trim()) {
      setMessage('Title and artist are required')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: session?.user?.email,
          ...newSong
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSongs([...songs, data])
        setNewSong({ title: '', artist: '', genre: '', key: '', proficiency: 'comfortable' })
        setMessage('Song added successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Failed to add song')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeSong = async (userSongId: string) => {
    try {
      const response = await fetch(`/api/user/songs/${userSongId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSongs(songs.filter(s => s.id !== userSongId))
        setMessage('Song removed successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to remove song')
    }
  }

  const updateProficiency = async (userSongId: string, proficiency: string) => {
    try {
      const response = await fetch(`/api/user/songs/${userSongId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proficiency })
      })

      if (response.ok) {
        const updatedSong = await response.json()
        setSongs(songs.map(s => s.id === userSongId ? updatedSong : s))
      }
    } catch (error) {
      console.error('Failed to update proficiency:', error)
    }
  }

  const filteredSongs = songs.filter(s =>
    s.song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.song.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (!session) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Song Library</h1>
          <button
            onClick={() => router.push('/profile')}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            ← Back to Profile
          </button>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Add New Song</h2>
          
          {!showManualInput ? (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                🎵 Search for a song (recommended)
              </label>
              <div style={{ marginBottom: '1rem' }}>
                <SongAutocomplete onSongSelect={handleSongSelect} placeholder="Start typing a song name or artist..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  🎯 Search millions of songs from iTunes • Get accurate info automatically
                </p>
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  style={{ 
                    fontSize: '0.875rem', 
                    color: '#2563eb', 
                    background: 'none', 
                    border: '1px solid #2563eb',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  📝 Enter manually instead
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: '500' }}>📝 Manual Entry</label>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  style={{ 
                    fontSize: '0.875rem', 
                    color: '#2563eb', 
                    background: 'none', 
                    border: '1px solid #2563eb',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  🎵 ← Back to search
                </button>
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Song Title *"
              value={newSong.title}
              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
            <input
              type="text"
              placeholder="Artist/Band *"
              value={newSong.artist}
              onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
            <select
              value={newSong.genre}
              onChange={(e) => setNewSong({ ...newSong, genre: e.target.value })}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              <option value="">Select Genre</option>
              <option value="rock">Rock</option>
              <option value="blues">Blues</option>
              <option value="country">Country</option>
              <option value="folk">Folk</option>
              <option value="jazz">Jazz</option>
              <option value="pop">Pop</option>
              <option value="alternative">Alternative</option>
              <option value="indie">Indie</option>
              <option value="reggae">Reggae</option>
              <option value="funk">Funk</option>
            </select>
            <input
              type="text"
              placeholder="Key (optional)"
              value={newSong.key}
              onChange={(e) => setNewSong({ ...newSong, key: e.target.value })}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
            <select
              value={newSong.proficiency}
              onChange={(e) => setNewSong({ ...newSong, proficiency: e.target.value })}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              <option value="learning">📚 Learning</option>
              <option value="comfortable">✅ Comfortable</option>
              <option value="expert">🎯 Expert</option>
            </select>
          </div>
          
          <button
            onClick={addSong}
            disabled={isLoading || !newSong.title.trim() || !newSong.artist.trim()}
            style={{
              backgroundColor: (isLoading || !newSong.title.trim() || !newSong.artist.trim()) ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: (isLoading || !newSong.title.trim() || !newSong.artist.trim()) ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {isLoading ? '⏳ Adding...' : '➕ Add Song'}
          </button>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            backgroundColor: message.includes('success') || message.includes('Selected') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') || message.includes('Selected') ? '#065f46' : '#991b1b',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>🎵 My Songs ({filteredSongs.length})</h2>
            <input
              type="text"
              placeholder="🔍 Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', width: '300px' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredSongs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {searchTerm ? 'No songs match your search.' : 'No songs in your library yet.'}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  {!searchTerm && 'Add some songs using the search above to help match with other musicians!'}
                </p>
              </div>
            ) : (
              filteredSongs.map((userSong) => (
                <div key={userSong.id} style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                      🎵 {userSong.song.title}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      👤 {userSong.song.artist}
                      {userSong.song.genre && ` • 🎪 ${userSong.song.genre}`}
                      {userSong.song.key && ` • 🎹 Key: ${userSong.song.key}`}
                    </p>
                  </div>
                  
                  <select
                    value={userSong.proficiency}
                    onChange={(e) => updateProficiency(userSong.id, e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="learning">📚 Learning</option>
                    <option value="comfortable">✅ Comfortable</option>
                    <option value="expert">🎯 Expert</option>
                  </select>
                  
                  <button 
                    style={{ 
                      color: '#dc2626', 
                      background: 'none', 
                      border: '1px solid #dc2626',
                      borderRadius: '0.375rem',
                      cursor: 'pointer', 
                      padding: '0.5rem'
                    }}
                    onClick={() => removeSong(userSong.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
