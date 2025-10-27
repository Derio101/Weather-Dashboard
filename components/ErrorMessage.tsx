import { WeatherError } from '@/types/weather'

interface ErrorMessageProps {
  error: WeatherError
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-6">
      <div className="flex items-center">
        <span className="text-2xl mr-3">⚠️</span>
        <div>
          <h3 className="text-white font-semibold">Something went wrong</h3>
          <p className="text-white/80">{error.message}</p>
        </div>
      </div>
    </div>
  )
}