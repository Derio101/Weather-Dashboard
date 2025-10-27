'use client'

import { useState, useEffect } from 'react'
import { WeatherData, TemperatureUnit } from '@/types/weather'
import { convertTemperature } from '@/utils/weatherUtils'
import { addToFavorites, removeFromFavorites, isCityFavorited, getFavorites } from '@/utils/favoritesUtils'
import AnimatedWeatherIcon from './AnimatedWeatherIcon'

interface WeatherCardProps {
  weather: WeatherData
  unit: TemperatureUnit
  onUnitToggle: () => void
}

export default function WeatherCard({ weather, unit, onUnitToggle }: WeatherCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const temp = convertTemperature(weather.main.temp, unit)
  const feelsLike = convertTemperature(weather.main.feels_like, unit)
  const unitSymbol = unit === 'celsius' ? '°C' : '°F'

  useEffect(() => {
    setIsFavorited(isCityFavorited(weather.name, weather.sys.country))
  }, [weather.name, weather.sys.country])

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      const favorites = getFavorites()
      const favoriteToRemove = favorites.find(fav => 
        fav.name.toLowerCase() === weather.name.toLowerCase() && 
        fav.country === weather.sys.country
      )
      if (favoriteToRemove) {
        removeFromFavorites(favoriteToRemove.id)
      }
    } else {
      addToFavorites({
        name: weather.name,
        country: weather.sys.country
      })
    }
    setIsFavorited(!isFavorited)
    
    // Dispatch custom event to update favorites section
    window.dispatchEvent(new CustomEvent('favorites-updated'))
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-white/80 capitalize">
            {weather.weather[0].description}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleFavoriteToggle}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-white"
            title={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
          
          <button
            onClick={onUnitToggle}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            Switch to {unit === 'celsius' ? '°F' : '°C'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <div className="text-6xl mb-2 flex justify-center">
            <AnimatedWeatherIcon 
              weatherMain={weather.weather[0].main}
              className="w-16 h-16 text-white"
            />
          </div>
          <div className="text-6xl font-bold text-white mb-2">
            {Math.round(temp)}{unitSymbol}
          </div>
          <p className="text-white/80">
            Feels like {Math.round(feelsLike)}{unitSymbol}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm">Humidity</p>
            <p className="text-2xl font-bold text-white">{weather.main.humidity}%</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm">Wind Speed</p>
            <p className="text-2xl font-bold text-white">{weather.wind.speed} m/s</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm">Pressure</p>
            <p className="text-2xl font-bold text-white">{weather.main.pressure} hPa</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm">Visibility</p>
            <p className="text-2xl font-bold text-white">{(weather.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
      </div>
    </div>
  )
}