import { TemperatureUnit } from '@/types/weather'

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return (celsius * 9/5) + 32
  }
  return celsius
}

export function getWeatherIcon(weatherMain: string): string {
  const iconMap: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '🌫️',
    Haze: '🌫️',
    Dust: '🌫️',
    Fog: '🌫️',
    Sand: '🌫️',
    Ash: '🌫️',
    Squall: '💨',
    Tornado: '🌪️'
  }
  
  return iconMap[weatherMain] || '🌤️'
}

// This function will be used to determine if we should show animated icons
export function getWeatherCondition(weatherMain: string): string {
  return weatherMain
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Determines the best location name from reverse geocoding results
 * Prioritizes more specific and local names over generic city names
 */
export function getBestLocationName(geocodeData: any[]): { name: string, country: string } | null {
  if (!geocodeData || geocodeData.length === 0) {
    return null
  }

  // Define common generic city names that should be deprioritized
  const genericCityNames = ['epworth', 'harare', 'chitungwiza', 'norton', 'ruwa']
  
  // Priority 1: Look for locations with local_names that contain specific area names
  let bestLocation = geocodeData.find((loc: any) => {
    if (loc.local_names && loc.local_names.en) {
      const localName = loc.local_names.en.toLowerCase()
      // Check for specific local area names (can be extended as needed)
      const specificAreaIndicators = ['park', 'estate', 'suburb', 'district', 'ward', 'damofalls']
      return specificAreaIndicators.some(indicator => localName.includes(indicator))
    }
    return false
  })

  // Priority 2: Look for locations with state/admin info that aren't generic city names
  if (!bestLocation) {
    bestLocation = geocodeData.find((loc: any) => {
      return loc.state && 
             loc.name && 
             !genericCityNames.includes(loc.name.toLowerCase())
    })
  }

  // Priority 3: Look for any location that isn't a generic city name
  if (!bestLocation) {
    bestLocation = geocodeData.find((loc: any) => {
      return loc.name && !genericCityNames.includes(loc.name.toLowerCase())
    })
  }

  // Fallback: Use the first result
  if (!bestLocation) {
    bestLocation = geocodeData[0]
  }

  if (!bestLocation) {
    return null
  }

  let locationName = bestLocation.name
  
  // Use local name if available and more specific
  if (bestLocation.local_names && bestLocation.local_names.en) {
    const localName = bestLocation.local_names.en
    // Only use local name if it's different and more specific
    if (localName.toLowerCase() !== bestLocation.name.toLowerCase()) {
      locationName = localName
    }
  }

  return {
    name: locationName,
    country: bestLocation.country
  }
}