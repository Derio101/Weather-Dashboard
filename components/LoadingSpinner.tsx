export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-white/30 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
      </div>
      <p className="ml-4 text-white/80">Loading weather data...</p>
    </div>
  )
}