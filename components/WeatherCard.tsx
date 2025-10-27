'use client'

import { WeatherData, TemperatureUnit } from '@/types/weather'
import { convertTemperature, getWeatherIcon } from '@/utils/weatherUtils'

interface WeatherCardProps {
  weather: WeatherData
  unit: TemperatureUnit
  onUnitToggle: () => void
}

export default function WeatherCard({ weather, unit, onUnitToggle }: WeatherCardProps) {
  const temp = convertTemperature(weather.main.temp, unit)
  const feelsLike = convertTemperature(weather.main.feels_like, unit)
  const unitSymbol = unit === 'celsius' ? '°C' : '°F'

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
        
        <button
          onClick={onUnitToggle}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 text-sm"
        >
          Switch to {unit === 'celsius' ? '°F' : '°C'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <div className="text-6xl mb-2">
            {getWeatherIcon(weather.weather[0].main)}
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