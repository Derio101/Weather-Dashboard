export interface WeatherData {
  name: string
  sys: {
    country: string
  }
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  visibility: number
}

export interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    dt_txt: string
  }>
}

export type TemperatureUnit = 'celsius' | 'fahrenheit'

export interface WeatherError {
  message: string
  code?: string
}

export interface FavoriteCity {
  id: string
  name: string
  country: string
  state?: string
  addedAt: Date
}