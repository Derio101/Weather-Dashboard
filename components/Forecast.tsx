'use client'

import { ForecastData, TemperatureUnit } from '@/types/weather'
import { convertTemperature, formatDate } from '@/utils/weatherUtils'
import AnimatedWeatherIcon from './AnimatedWeatherIcon'

interface ForecastProps {
  forecast: ForecastData
  unit: TemperatureUnit
}

export default function Forecast({ forecast, unit }: ForecastProps) {
  const unitSymbol = unit === 'celsius' ? '°C' : '°F'
  
  // Get one forecast per day (every 8th item since API returns 3-hour intervals)
  const dailyForecast = forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5)

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6">5-Day Forecast</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {dailyForecast.map((day, index) => (
          <div
            key={day.dt}
            className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors duration-200"
          >
            <p className="text-white/80 text-sm mb-2">
              {index === 0 ? 'Today' : formatDate(day.dt)}
            </p>
            
            <div className="text-3xl mb-2 flex justify-center">
              <AnimatedWeatherIcon 
                weatherMain={day.weather[0].main}
                className="w-8 h-8 text-white"
              />
            </div>
            
            <p className="text-xl font-bold text-white mb-1">
              {Math.round(convertTemperature(day.main.temp, unit))}{unitSymbol}
            </p>
            
            <p className="text-white/80 text-xs capitalize mb-2">
              {day.weather[0].description}
            </p>
            
            <p className="text-white/60 text-xs">
              💧 {day.main.humidity}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}