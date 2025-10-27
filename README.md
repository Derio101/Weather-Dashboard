# 🌤️ Weather Dashboard

A modern, responsive weather application built with Next.js 14, TypeScript, and Tailwind CSS. Optimized for Vercel deployment.

## ✨ Features

- **Real-time Weather Data**: Current weather information for any city
- **5-Day Forecast**: Extended weather predictions
- **Geolocation Support**: Get weather for your current location
- **Temperature Units**: Switch between Celsius and Fahrenheit
- **Responsive Design**: Works perfectly on all devices
- **Beautiful UI**: Glass morphism design with smooth animations
- **Error Handling**: Graceful error states and loading indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd weather-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenWeatherMap API key to `.env.local`:
```
NEXT_PUBLIC_WEATHER_API_KEY=your_actual_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to [Vercel](https://vercel.com)
3. Add your `NEXT_PUBLIC_WEATHER_API_KEY` environment variable in Vercel dashboard
4. Deploy!

Vercel will automatically detect Next.js and configure optimal settings.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: OpenWeatherMap API
- **Deployment**: Vercel

## 📱 Core Functionality

- Search weather by city name
- Display current temperature, humidity, wind speed, pressure
- Show 5-day weather forecast
- Geolocation-based weather lookup
- Celsius/Fahrenheit temperature conversion
- Responsive design for mobile and desktop

## 🔧 Project Structure

```
weather-dashboard/
├── app/                 # Next.js App Router
├── components/          # React components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── public/             # Static assets
└── styles/             # Global styles
```

## 📄 License

MIT License - feel free to use this project for learning and development!