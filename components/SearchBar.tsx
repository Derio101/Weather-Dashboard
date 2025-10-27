'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (city: string) => void
  onLocationClick: () => void
  loading: boolean
}

export default function SearchBar({ onSearch, onLocationClick, loading }: SearchBarProps) {
  const [city, setCity] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
      setCity('')
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <form onSubmit={handleSubmit} className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        
        <button
          type="button"
          onClick={onLocationClick}
          disabled={loading}
          className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          title="Use current location"
        >
          📍
        </button>
      </form>
    </div>
  )
}