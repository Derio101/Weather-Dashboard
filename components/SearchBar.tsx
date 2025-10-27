'use client'

import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  onSearch: (city: string) => void
  onLocationClick: () => void
  loading: boolean
}

interface CitySuggestion {
  name: string
  country: string
  state?: string
}

export default function SearchBar({ onSearch, onLocationClick, loading }: SearchBarProps) {
  const [city, setCity] = useState('')
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

  // Popular cities as fallback suggestions
  const popularCities: CitySuggestion[] = [
    { name: 'London', country: 'GB' },
    { name: 'New York', country: 'US', state: 'NY' },
    { name: 'Tokyo', country: 'JP' },
    { name: 'Paris', country: 'FR' },
    { name: 'Sydney', country: 'AU' },
    { name: 'Dubai', country: 'AE' },
    { name: 'Singapore', country: 'SG' },
    { name: 'Toronto', country: 'CA' }
  ]

  const fetchSuggestions = async (query: string) => {
    if (!API_KEY || query.length < 2) {
      setSuggestions(popularCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      ))
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      )
      
      if (response.ok) {
        const data = await response.json()
        const formattedSuggestions: CitySuggestion[] = data.map((item: any) => ({
          name: item.name,
          country: item.country,
          state: item.state
        }))
        setSuggestions(formattedSuggestions)
      } else {
        // Fallback to popular cities if API fails
        setSuggestions(popularCities.filter(city => 
          city.name.toLowerCase().includes(query.toLowerCase())
        ))
      }
    } catch (error) {
      // Fallback to popular cities if request fails
      setSuggestions(popularCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      ))
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (city.trim()) {
        fetchSuggestions(city.trim())
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [city])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
      setCity('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const cityName = suggestion.state 
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`
    
    onSearch(suggestion.name)
    setCity('')
    setShowSuggestions(false)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative">
      <form onSubmit={handleSubmit} className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => city.trim() && setShowSuggestions(true)}
            placeholder="Enter city name..."
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            disabled={loading}
            autoComplete="off"
          />
          
          {/* City suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg border border-white/30 shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {isLoadingSuggestions && (
                <div className="px-4 py-3 text-gray-600 text-center">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Loading suggestions...</span>
                </div>
              )}
              {!isLoadingSuggestions && suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.name}-${suggestion.country}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 group"
                >
                  <div className="font-medium text-gray-800 group-hover:text-blue-600">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {suggestion.state ? `${suggestion.state}, ${suggestion.country}` : suggestion.country}
                  </div>
                </button>
              ))}
            </div>
          )}
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