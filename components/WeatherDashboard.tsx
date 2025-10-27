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
    if (!navigator.geolocation) {
      setError({ message: 'Geolocation is not supported by this browser' })
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          )
          const data = await response.json()
          await fetchWeatherData(data.name)
        } catch (err) {
          setError({ message: 'Failed to get weather for your location' })
          setLoading(false)
        }
      },
      (err) => {
        setError({ message: 'Unable to get your location' })
        setLoading(false)
      }
    )
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