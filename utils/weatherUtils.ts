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

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}