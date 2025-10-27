'use client'

import { useState, useEffect } from 'react'
import { WeatherData, ForecastData, TemperatureUnit, WeatherError } from '@/types/weather'
import SearchBar from './SearchBar'
import WeatherCard from './WeatherCard'
import Forecast from './Forecast'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import FavoritesTiles from './FavoritesTiles'

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<WeatherError | null>(null)
  const [unit, setUnit] = useState<TemperatureUnit>('celsius')

  const fetchWeatherData = async (city: string) => {
    if (!API_KEY) {
      setError({ message: 'Weather API key not configured' })
      return
    }

    setLoading(true)
    setError(null)

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

          // Fetch weather data using coordinates
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          )
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`Weather API error: ${errorData.message || response.statusText}`)
          }
          
          const weatherData = await response.json()
          
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

  // Load default city on mount
  useEffect(() => {
    fetchWeatherData('London')
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