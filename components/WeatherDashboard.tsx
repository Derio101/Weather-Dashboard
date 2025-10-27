'use client'

import { useState, useEffect } from 'react'
import { WeatherData, ForecastData, TemperatureUnit, WeatherError } from '@/types/weather'
import { getBestLocationName, getBestLocationNameFromGoogle } from '@/utils/weatherUtils'
import SearchBar from './SearchBar'
import WeatherCard from './WeatherCard'
import Forecast from './Forecast'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import FavoritesTiles from './FavoritesTiles'

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<WeatherError | null>(null)
  const [unit, setUnit] = useState<TemperatureUnit>('celsius')
  const [isDefaultLocation, setIsDefaultLocation] = useState(true) // Track if showing default location

  const fetchWeatherData = async (city: string) => {
    if (!API_KEY) {
      setError({ message: 'Weather API key not configured' })
      return
    }

    setLoading(true)
    setError(null)
    setIsDefaultLocation(city === 'Harare') // Track if this is the default location

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      )
      
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      )

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('City not found')
      }

      const weatherData = await weatherResponse.json()
      const forecastData = await forecastResponse.json()

      setWeather(weatherData)
      setForecast(forecastData)
    } catch (err) {
      setError({ 
        message: err instanceof Error ? err.message : 'Failed to fetch weather data' 
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError({ message: 'Geolocation is not supported by this browser' })
      return
    }

    // Check if we're on HTTPS (required for geolocation in production)
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError({ message: 'Location services require a secure connection (HTTPS)' })
      return
    }

    setLoading(true)
    setError(null)
    setIsDefaultLocation(false) // User is actively requesting their location

    // More permissive options for better compatibility
    const options = {
      enableHighAccuracy: false, // Use less accurate but more reliable positioning
      timeout: 15000, // 15 seconds timeout (increased from 10)
      maximumAge: 600000 // 10 minutes cache (increased from 5)
    }

    // Create a timeout promise as fallback
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), options.timeout)
    })

    // Create geolocation promise
    const geolocationPromise = new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })

    // Race between geolocation and timeout
    Promise.race([geolocationPromise, timeoutPromise])
      .then(async (position) => {
        if (position instanceof GeolocationPosition === false) {
          throw new Error('Invalid position data')
        }
        
        const { latitude, longitude, accuracy } = position.coords
        
        // Validate coordinates
        if (!latitude || !longitude || 
            latitude < -90 || latitude > 90 || 
            longitude < -180 || longitude > 180) {
          throw new Error('Invalid coordinates received')
        }

        try {
          if (!API_KEY) {
            setError({ message: 'Weather API key not configured' })
            setLoading(false)
            return
          }

          // First, use Google's v4beta reverse geocoding for more accurate location names
          let bestLocation = null
          
          if (GOOGLE_API_KEY) {
            try {
              // Use Google Geocoding API v4beta for enhanced location detection
              const googleGeocodeResponse = await fetch(
                `https://geocode.googleapis.com/v4beta/geocode/location/${latitude},${longitude}?key=${GOOGLE_API_KEY}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  }
                }
              )
              
              if (googleGeocodeResponse.ok) {
                const googleData = await googleGeocodeResponse.json()
                // v4beta returns results directly, not in a 'results' array like v1
                bestLocation = getBestLocationNameFromGoogle(googleData.results || [googleData])
              } else {
                console.warn('Google v4beta geocoding failed, trying v1 API')
                // Fallback to v1 API
                const fallbackResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                )
                if (fallbackResponse.ok) {
                  const fallbackData = await fallbackResponse.json()
                  bestLocation = getBestLocationNameFromGoogle(fallbackData.results)
                }
              }
            } catch (error) {
              console.warn('Google geocoding failed, falling back to OpenWeatherMap:', error)
            }
          }
          
          // Fallback to OpenWeatherMap reverse geocoding if Google fails
          if (!bestLocation) {
            const geocodeResponse = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${API_KEY}`
            )
            
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json()
              bestLocation = getBestLocationName(geocodeData)
            }
          }

          // Fetch weather data using coordinates
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          )
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`Weather API error: ${errorData.message || response.statusText}`)
          }
          
          const weatherData = await response.json()
          
          // Override the location name if we found a better one from reverse geocoding
          if (bestLocation) {
            weatherData.name = bestLocation.name
            weatherData.sys.country = bestLocation.country
          }
          
          // Fetch forecast data
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          )
          
          if (!forecastResponse.ok) {
            const errorData = await forecastResponse.json().catch(() => ({}))
            console.warn('Forecast fetch failed:', errorData.message || forecastResponse.statusText)
          }
          
          const forecastData = forecastResponse.ok ? await forecastResponse.json() : null
          
          setWeather(weatherData)
          if (forecastData) {
            setForecast(forecastData)
          }
          setLoading(false)
        } catch (err) {
          console.error('Weather fetch error:', err)
          setError({ message: 'Failed to get weather for your location. Please try searching manually.' })
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Geolocation error:', err)
        let errorMessage = 'Unable to get your location'
        
        if (err.message === 'TIMEOUT') {
          errorMessage = 'Location request timed out. Your device might have location services disabled or the GPS signal is weak. Please try again or search manually.'
        } else if (err.code) {
          switch (err.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Location access denied. Please check your browser settings and allow location access for this site.'
              break
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Your location could not be determined. This might be due to poor GPS signal, disabled location services, or network issues. Please try again or search manually.'
              break
            case 3: // TIMEOUT
              errorMessage = 'Location request timed out. Please check your GPS signal and try again, or search manually.'
              break
            default:
              errorMessage = 'Location service failed. Please check your device settings and try again, or search manually.'
              break
          }
        } else {
          errorMessage = 'Location detection failed. Please ensure location services are enabled and try again, or search manually.'
        }
        
        setError({ message: errorMessage })
        setLoading(false)
      })
  }

  // Load default city on mount and attempt to get user's location
  useEffect(() => {
    // Always load default city first for immediate content
    fetchWeatherData('Harare')
    
    // Then silently attempt to get user's location in background
    // Only proceed if geolocation is supported and we're in a secure context
    if (navigator.geolocation && 
        (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      
      // Use a more permissive timeout for background location detection
      const backgroundOptions = {
        enableHighAccuracy: false,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes cache
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Only update location if user hasn't manually searched for something else
          // This prevents overriding user's intentional search
          if (isDefaultLocation) {
            const { latitude, longitude } = position.coords
            
            // Validate coordinates
            if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
              try {
                setLoading(true)
                
                // Use the same location detection logic as getCurrentLocation()
                let bestLocation = null
                
                if (GOOGLE_API_KEY) {
                  try {
                    const googleGeocodeResponse = await fetch(
                      `https://geocode.googleapis.com/v4beta/geocode/location/${latitude},${longitude}?key=${GOOGLE_API_KEY}`,
                      {
                        headers: {
                          'Content-Type': 'application/json',
                        }
                      }
                    )
                    
                    if (googleGeocodeResponse.ok) {
                      const googleData = await googleGeocodeResponse.json()
                      bestLocation = getBestLocationNameFromGoogle(googleData.results || [googleData])
                    } else {
                      // Fallback to v1 API
                      const fallbackResponse = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                      )
                      if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json()
                        bestLocation = getBestLocationNameFromGoogle(fallbackData.results)
                      }
                    }
                  } catch (error) {
                    console.warn('Google geocoding failed in background:', error)
                  }
                }
                
                // Fallback to OpenWeatherMap if Google fails
                if (!bestLocation && API_KEY) {
                  try {
                    const geocodeResponse = await fetch(
                      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${API_KEY}`
                    )
                    
                    if (geocodeResponse.ok) {
                      const geocodeData = await geocodeResponse.json()
                      bestLocation = getBestLocationName(geocodeData)
                    }
                  } catch (error) {
                    console.warn('OpenWeatherMap geocoding failed in background:', error)
                  }
                }

                // Fetch weather data for user's location
                if (API_KEY) {
                  const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                  )
                  
                  if (response.ok) {
                    const weatherData = await response.json()
                    
                    // Override location name if we found a better one
                    if (bestLocation) {
                      weatherData.name = bestLocation.name
                      weatherData.sys.country = bestLocation.country
                    }
                    
                    // Fetch forecast data
                    const forecastResponse = await fetch(
                      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                    )
                    
                    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null
                    
                    setWeather(weatherData)
                    if (forecastData) {
                      setForecast(forecastData)
                    }
                    setIsDefaultLocation(false) // Now showing user's actual location
                  }
                }
                
                setLoading(false)
              } catch (error) {
                console.warn('Background location weather fetch failed:', error)
                setLoading(false)
                // Don't show error to user for background location attempts
              }
            }
          }
        },
        (error) => {
          // Silently fail for background location attempts
          console.log('Background location detection failed (this is normal):', error.message)
        },
        backgroundOptions
      )
    }
  }, [])

  return (
    <div className="relative">
      {/* Favorites tiles positioned on the left side */}
      <FavoritesTiles 
        onCitySelect={fetchWeatherData} 
        currentCityName={weather?.name}
      />
      
      <div className="space-y-6">
        <SearchBar 
          onSearch={fetchWeatherData}
          onLocationClick={getCurrentLocation}
          loading={loading}
        />
        
        {loading && <LoadingSpinner />}
        
        {error && <ErrorMessage error={error} />}
        
        {weather && !loading && (
          <div className="animate-slide-up">
            <WeatherCard 
              weather={weather} 
              unit={unit}
              onUnitToggle={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
            />
          </div>
        )}
        
        {forecast && !loading && (
          <div className="animate-slide-up">
            <Forecast forecast={forecast} unit={unit} />
          </div>
        )}
      </div>
    </div>
  )
}