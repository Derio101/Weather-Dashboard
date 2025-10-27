import { FavoriteCity } from '@/types/weather'

const FAVORITES_KEY = 'weather-dashboard-favorites'

export const getFavorites = (): FavoriteCity[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    return parsed.map((fav: any) => ({
      ...fav,
      addedAt: new Date(fav.addedAt)
    }))
  } catch (error) {
    console.error('Error loading favorites:', error)
    return []
  }
}

export const saveFavorites = (favorites: FavoriteCity[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.error('Error saving favorites:', error)
  }
}

export const addToFavorites = (city: Omit<FavoriteCity, 'id' | 'addedAt'>): FavoriteCity[] => {
  const favorites = getFavorites()
  
  // Check if city already exists
  const exists = favorites.some(fav => 
    fav.name.toLowerCase() === city.name.toLowerCase() && 
    fav.country === city.country
  )
  
  if (exists) {
    return favorites
  }
  
  const newFavorite: FavoriteCity = {
    ...city,
    id: `${city.name}-${city.country}-${Date.now()}`,
    addedAt: new Date()
  }
  
  const updatedFavorites = [...favorites, newFavorite]
  saveFavorites(updatedFavorites)
  return updatedFavorites
}

export const removeFromFavorites = (id: string): FavoriteCity[] => {
  const favorites = getFavorites()
  const updatedFavorites = favorites.filter(fav => fav.id !== id)
  saveFavorites(updatedFavorites)
  return updatedFavorites
}

export const isCityFavorited = (cityName: string, country: string): boolean => {
  const favorites = getFavorites()
  return favorites.some(fav => 
    fav.name.toLowerCase() === cityName.toLowerCase() && 
    fav.country === country
  )
}

export const clearFavorites = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(FAVORITES_KEY)
}