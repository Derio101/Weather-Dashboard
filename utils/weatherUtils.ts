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

/**
 * Determines the best location name from Google Geocoding API v4beta results
 * Prioritizes specific suburbs, neighborhoods, and local areas over cities
 */
export function getBestLocationNameFromGoogle(results: any[]): { name: string, country: string } | null {
  if (!results || results.length === 0) {
    return null
  }

  // Find the most specific location by looking at address components
  let bestResult = null
  let bestSpecificity = 0

  for (const result of results) {
    // v4beta API uses addressComponents instead of address_components
    const components = result.addressComponents || result.address_components || []
    let specificity = 0
    let locationName = ''
    let country = ''

    // Look for specific location types in order of preference (v4beta compatible)
    const typePreferences = [
      'sublocality_level_1',     // Most specific neighborhoods/suburbs like "Damofalls Park"
      'sublocality_level_2',     // Secondary sublocality
      'sublocality_level_3',     // Tertiary sublocality
      'sublocality',             // General sublocality
      'neighborhood',            // Named neighborhoods
      'colloquial_area',         // Commonly-used alternative names
      'locality',                // Cities/towns
      'administrative_area_level_2', // Counties/districts
      'administrative_area_level_1'  // States/provinces
    ]

    for (const component of components) {
      const types = component.types || []
      
      // Find country - v4beta uses longText/shortText
      if (types.includes('country')) {
        country = component.shortText || component.short_name || 'Unknown'
      }

      // Find the most specific location name
      for (let i = 0; i < typePreferences.length; i++) {
        if (types.includes(typePreferences[i])) {
          const currentSpecificity = typePreferences.length - i
          if (currentSpecificity > specificity) {
            specificity = currentSpecificity
            // v4beta uses longText instead of long_name
            locationName = component.longText || component.long_name || component.shortText || component.short_name
          }
          break
        }
      }
    }

    // Also check formattedAddress for specific area names (v4beta compatible)
    const addressToCheck = result.formattedAddress || result.formatted_address
    if (addressToCheck) {
      const formattedAddress = addressToCheck.toLowerCase()
      const specificAreaIndicators = ['park', 'estate', 'suburb', 'gardens', 'hills', 'damofalls', 'grove', 'heights', 'ridge', 'meadows']
      
      if (specificAreaIndicators.some(indicator => formattedAddress.includes(indicator))) {
        specificity += 15 // Higher boost for addresses with specific area keywords
      }
    }

    // Boost specificity for results with higher granularity (v4beta feature)
    if (result.granularity) {
      switch (result.granularity) {
        case 'ROOFTOP':
          specificity += 5
          break
        case 'RANGE_INTERPOLATED':
          specificity += 3
          break
        case 'GEOMETRIC_CENTER':
          specificity += 2
          break
        case 'APPROXIMATE':
          specificity += 1
          break
      }
    }

    if (specificity > bestSpecificity && locationName && country) {
      bestSpecificity = specificity
      bestResult = {
        name: locationName,
        country: country
      }
    }
  }

  return bestResult
}