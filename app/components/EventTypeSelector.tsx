'use client'

interface EventTypeSelectorProps {
  eventType: string
  setEventType: (type: string) => void
  houseband: boolean
  setHouseband: (enabled: boolean) => void
  housebandSongs: string[]
  setHousebandSongs: (songs: string[]) => void
}

export default function EventTypeSelector({ 
  eventType, setEventType, houseband, setHouseband, housebandSongs, setHousebandSongs 
}: EventTypeSelectorProps) {
  
  const addSong = (song: string) => {
    if (song && !housebandSongs.includes(song)) {
      setHousebandSongs([...housebandSongs, song])
    }
  }

  const removeSong = (song: string) => {
    setHousebandSongs(housebandSongs.filter(s => s !== song))
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Event Configuration</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Event Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: eventType === 'open_mic' ? '2px solid #2563eb' : '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="eventType"
              value="open_mic"
              checked={eventType === 'open_mic'}
              onChange={(e) => setEventType(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <div>
              <div style={{ fontWeight: '600' }}>Open Mic</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Solo performers, acoustic sets</div>
            </div>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: eventType === 'full_band' ? '2px solid #2563eb' : '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="eventType"
              value="full_band"
              checked={eventType === 'full_band'}
              onChange={(e) => setEventType(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <div>
              <div style={{ fontWeight: '600' }}>Full Band Jam</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Electric instruments, full bands</div>
            </div>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: eventType === 'songwriter' ? '2px solid #2563eb' : '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="eventType"
              value="songwriter"
              checked={eventType === 'songwriter'}
              onChange={(e) => setEventType(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <div>
              <div style={{ fontWeight: '600' }}>Songwriter Night</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Original music focus</div>
            </div>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={houseband}
            onChange={(e) => setHouseband(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <span style={{ fontWeight: '500' }}>House band available to accompany performers</span>
        </label>
      </div>

      {houseband && (
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
            House Band Song List
          </label>
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Add a song the house band knows..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSong((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
              style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem 0 0 0.375rem' }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                addSong(input.value)
                input.value = ''
              }}
              style={{ padding: '0.75rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0 0.375rem 0.375rem 0', cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {housebandSongs.map(song => (
              <span
                key={song}
                style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontSize: '0.875rem' }}
              >
                {song}
                <button
                  type="button"
                  onClick={() => removeSong(song)}
                  style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
