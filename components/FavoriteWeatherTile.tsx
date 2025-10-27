'use client'

import { useState, useEffect } from 'react'
import { FavoriteCity } from '@/types/weather'
import AnimatedWeatherIcon from './AnimatedWeatherIcon'

interface FavoriteWeatherTileProps {
  city: FavoriteCity
  onCityClick: (cityName: string) => void
  onRemoveFavorite: (id: string) => void
  isActive: boolean
}

interface WeatherData {
  main: {
    temp: number
    humidity: number
    feels_like: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
  }>
  wind: {
    speed: number
  }
  visibility?: number
}

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

export default function FavoriteWeatherTile({ 
  city, 
  onCityClick, 
  onRemoveFavorite, 
  isActive 
}: FavoriteWeatherTileProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!API_KEY) return
      
      try {
        setLoading(true)
        setError(false)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${API_KEY}&units=metric`
        )
        
        if (response.ok) {
          const data = await response.json()
          setWeatherData(data)
        } else {
          setError(true)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [city.name])

  const handleCityClick = () => {
    onCityClick(city.name)
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveFavorite(city.id)
  }

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'bg-white/20 border-white/40' 
          : 'bg-white/10 hover:bg-white/15 border-white/20'
      } backdrop-blur-md rounded-2xl p-4 border w-full h-full aspect-square min-w-[160px] min-h-[160px]`}
      onClick={handleCityClick}
      style={{
        borderRadius: '16px', // squircle-like appearance
      }}
    >
      {/* Remove button */}
      <button
        onClick={handleRemoveClick}
        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-all duration-200 opacity-0 group-hover:opacity-100"
        title="Remove from favorites"
      >
        ×
      </button>

      <div className="text-center">
        <h3 className="text-white font-semibold text-xs lg:text-sm mb-1 truncate">
          {city.name}
        </h3>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-2 lg:py-4">
            <div className="animate-spin rounded-full h-4 lg:h-6 w-4 lg:w-6 border-b-2 border-white/50"></div>
            <p className="text-white/50 text-xs mt-1 hidden lg:block">Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center py-2 lg:py-4">
            <div className="text-xl lg:text-2xl">❌</div>
            <p className="text-white/50 text-xs hidden lg:block">Error</p>
          </div>
        )}
        
        {weatherData && !loading && !error && (
          <div>
            <div className="text-2xl lg:text-3xl mb-1 flex justify-center">
              <AnimatedWeatherIcon 
                weatherMain={weatherData.weather[0].main}
                className="w-6 h-6 lg:w-8 lg:h-8 text-white"
              />
            </div>
            <div className="text-sm lg:text-xl font-bold text-white mb-1">
              {Math.round(weatherData.main.temp)}°C
            </div>
            <div className="text-xs text-white/70 mb-1 truncate hidden lg:block">
              {weatherData.weather[0].description}
            </div>
            <div className="text-xs text-white/50">
              💧 {weatherData.main.humidity}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}