# 🌤️ Weather Intelligence

A modern, AI-powered meteorological dashboard built with React, Vite, Express, and Google's Gemini API. This application provides real-time weather data, a 7-day forecast, and context-aware, tailored intelligence reports to help you plan your activities.

## ✨ Features

- **Real-Time Data**: Fetches precise atmospheric conditions (temperature, humidity, wind speed, apparent temperature) using the [Open-Meteo API](https://open-meteo.com/).
- **7-Day Outlook**: Clean, scannable forecast including high/low temperatures and precipitation probabilities.
- **AI-Powered Intelligence**: Integrates with Google's **Gemini 3.7 Flash** model to generate actionable insights based on the weather data and your specific plans (e.g., "going for a hike", "wedding planning").
- **Responsive UI**: A beautifully crafted, mobile-first design using Tailwind CSS and Lucide icons.
- **Full-Stack Architecture**: A robust Express backend securely proxies requests to the Gemini API, ensuring your API keys are never exposed to the client.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Motion (Animations)
- **Backend**: Node.js, Express
- **AI Integration**: Google Gen AI SDK (`@google/genai`)
- **Data Source**: Open-Meteo Geocoding & Weather APIs (No API key required)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Weather-Intelligence-App.git
   cd Weather-Intelligence-App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your_actual_api_key_here"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   This will start both the Express backend and the Vite frontend on `http://localhost:3000`.

## 📦 Build for Production

To create a production-ready bundle:

```bash
npm run build
npm start
```
The application will be compiled into the `dist/` directory and served by the Express backend.

## 📂 Project Structure

```text
├── server.ts             # Express backend & Gemini API integration
├── src/
│   ├── App.tsx           # Main React component & UI logic
│   ├── lib/
│   │   └── weather.ts    # Open-Meteo API fetching utilities
│   ├── components/       # Reusable UI components (Weather icons)
│   └── types.ts          # TypeScript interfaces
├── .env.example          # Environment variable template
└── package.json          # Dependencies and scripts
```

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
