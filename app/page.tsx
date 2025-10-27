import WeatherDashboard from '@/components/WeatherDashboard'

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto relative">
        <h1 className="text-4xl font-bold text-white text-center mb-8 animate-fade-in">
          Weather Dashboard
        </h1>
        <WeatherDashboard />
      </div>
    </main>
  )
}