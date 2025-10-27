'use client'

import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  Zap, 
  CloudSnow, 
  Wind, 
  Tornado, 
  CloudFog 
} from 'lucide-react'

interface AnimatedWeatherIconProps {
  weatherMain: string
  className?: string
}

export default function AnimatedWeatherIcon({ weatherMain, className = "" }: AnimatedWeatherIconProps) {
  const getIconWithAnimation = () => {
    switch (weatherMain) {
      case 'Clear':
        return (
          <Sun 
            className={`animate-spin ${className}`}
            style={{ animationDuration: '20s' }}
          />
        )
      
      case 'Clouds':
        return (
          <Cloud 
            className={`animate-float ${className}`}
          />
        )
      
      case 'Rain':
        return (
          <div className="relative">
            <CloudRain 
              className={`animate-bounce ${className}`}
              style={{ animationDuration: '2s' }}
            />
            <div className="absolute top-8 left-2 animate-pulse">
              <div className="flex space-x-1">
                <div className="w-0.5 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                <div className="w-0.5 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
                <div className="w-0.5 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
              </div>
            </div>
          </div>
        )
      
      case 'Drizzle':
        return (
          <div className="relative">
            <CloudDrizzle 
              className={`animate-pulse ${className}`}
              style={{ animationDuration: '3s' }}
            />
            <div className="absolute top-8 left-2 animate-pulse">
              <div className="flex space-x-1">
                <div className="w-0.5 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}></div>
                <div className="w-0.5 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1.5s' }}></div>
              </div>
            </div>
          </div>
        )
      
      case 'Thunderstorm':
        return (
          <div className="relative">
            <Zap 
              className={`animate-flash ${className}`}
            />
            <div className="absolute -top-1 -left-1">
              <Cloud className="text-gray-600 animate-pulse" />
            </div>
          </div>
        )
      
      case 'Snow':
        return (
          <div className="relative">
            <CloudSnow 
              className={`animate-float ${className}`}
            />
            <div className="absolute top-8 left-1 animate-snow">
              <div className="flex flex-col space-y-1">
                <div className="flex space-x-2">
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '2s' }}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '500ms', animationDuration: '2s' }}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '1000ms', animationDuration: '2s' }}></div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '250ms', animationDuration: '2s' }}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '750ms', animationDuration: '2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'Mist':
      case 'Smoke':
      case 'Haze':
      case 'Dust':
      case 'Fog':
      case 'Sand':
      case 'Ash':
        return (
          <CloudFog 
            className={`animate-sway ${className}`}
          />
        )
      
      case 'Squall':
        return (
          <Wind 
            className={`animate-wiggle ${className}`}
          />
        )
      
      case 'Tornado':
        return (
          <Tornado 
            className={`animate-spin ${className}`}
            style={{ animationDuration: '3s' }}
          />
        )
      
      default:
        return (
          <Sun 
            className={`animate-pulse ${className}`}
          />
        )
    }
  }

  return (
    <div className="relative inline-block">
      {getIconWithAnimation()}
    </div>
  )
}