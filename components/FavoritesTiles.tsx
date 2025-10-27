'use client'

import { useState, useEffect } from 'react'
import { FavoriteCity } from '@/types/weather'
import { getFavorites, removeFromFavorites } from '@/utils/favoritesUtils'
import FavoriteWeatherTile from './FavoriteWeatherTile'

interface FavoritesTilesProps {
  onCitySelect: (cityName: string) => void
  currentCityName?: string
}

export default function FavoritesTiles({ onCitySelect, currentCityName }: FavoritesTilesProps) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([])

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const handleRemoveFavorite = (id: string) => {
    const updatedFavorites = removeFromFavorites(id)
    setFavorites(updatedFavorites)
  }

  // Listen to favorites updates from other components
  useEffect(() => {
    const handleStorageChange = () => {
      setFavorites(getFavorites())
    }

    window.addEventListener('favorites-updated', handleStorageChange)
    return () => window.removeEventListener('favorites-updated', handleStorageChange)
  }, [])

  // Don't render anything if no favorites
  if (favorites.length === 0) {
    return null
  }

  return (
    <>
      {/* Desktop: Fixed position on the left */}
      <div className="hidden lg:block fixed top-24 left-4 z-10 space-y-3 max-h-screen overflow-y-auto">
        <div className="text-white/70 text-sm font-medium mb-2">
          Favourites ({favorites.length})
        </div>
        {favorites.map(city => (
          <div key={city.id} className="w-40 h-40">
            <FavoriteWeatherTile
              city={city}
              onCityClick={onCitySelect}
              onRemoveFavorite={handleRemoveFavorite}
              isActive={currentCityName?.toLowerCase() === city.name.toLowerCase()}
            />
          </div>
        ))}
      </div>
      
      {/* Mobile/Tablet: Horizontal scroll above the main content */}
      <div className="lg:hidden mb-6">
        <div className="text-white/70 text-sm font-medium mb-3">
          Favourites ({favorites.length})
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {favorites.map(city => (
            <div key={city.id} className="flex-shrink-0 w-40 h-40">
              <FavoriteWeatherTile
                city={city}
                onCityClick={onCitySelect}
                onRemoveFavorite={handleRemoveFavorite}
                isActive={currentCityName?.toLowerCase() === city.name.toLowerCase()}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}