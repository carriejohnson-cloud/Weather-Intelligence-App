import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Wind, Droplets, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';

import { WeatherIcon } from './components/WeatherIcon';
import { searchLocation, getWeather, getIntelligence } from './lib/weather';
import { LocationResult, WeatherData } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [location, setLocation] = useState<LocationResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [intelligence, setIntelligence] = useState<string | null>(null);
  
  const [userContext, setUserContext] = useState('');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isGeneratingIntel, setIsGeneratingIntel] = useState(false);
  
  // click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocation(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = async (loc: LocationResult) => {
    setLocation(loc);
    setSearchQuery('');
    setShowDropdown(false);
    setIsLoadingWeather(true);
    try {
      const data = await getWeather(loc.latitude, loc.longitude);
      setWeatherData(data);
      generateIntelligence(loc, data, userContext);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const generateIntelligence = async (loc: LocationResult, data: WeatherData, context: string) => {
    setIsGeneratingIntel(true);
    setIntelligence(null);
    try {
      const locName = `${loc.name}, ${loc.admin1 || loc.country}`;
      const text = await getIntelligence(locName, data, context);
      setIntelligence(text);
    } catch (e) {
      console.error(e);
      setIntelligence("Failed to generate intelligence. Please try again.");
    } finally {
      setIsGeneratingIntel(false);
    }
  };

  const handleRefreshIntelligence = () => {
    if (location && weatherData) {
      generateIntelligence(location, weatherData, userContext);
    }
  };

  // Initial load
  useEffect(() => {
    handleSelectLocation({
      id: 5128581,
      name: "New York",
      latitude: 40.71427,
      longitude: -74.00597,
      country: "United States",
      admin1: "New York"
    });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Header & Search */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 p-2.5 rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Weather Intelligence</h1>
              <p className="text-neutral-500 text-sm font-medium">AI-powered meteorological insights</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-96" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search location..."
                className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
              />
              <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-neutral-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>
            
            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute z-50 w-full mt-2 bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden"
                >
                  {searchResults.map((res, i) => (
                    <button
                      key={`${res.id}-${i}`}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 transition-colors border-b border-neutral-50 last:border-0"
                      onClick={() => handleSelectLocation(res)}
                    >
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900">{res.name}</span>
                        <span className="text-xs text-neutral-500">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {isLoadingWeather ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
            <p className="text-neutral-500 font-medium">Fetching atmosphere data...</p>
          </div>
        ) : location && weatherData ? (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Left Column: Data */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              {/* Current Weather Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <WeatherIcon code={weatherData.current.weather_code} isDay={weatherData.current.is_day} className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-neutral-500 font-medium mb-8">
                    <MapPin className="w-4 h-4" />
                    <span>{location.name}, {location.admin1 || location.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-12">
                    <WeatherIcon 
                      code={weatherData.current.weather_code} 
                      isDay={weatherData.current.is_day} 
                      className="w-20 h-20 text-neutral-800" 
                    />
                    <div>
                      <div className="text-7xl font-bold tracking-tighter text-neutral-900">
                        {Math.round(weatherData.current.temperature_2m)}°
                      </div>
                      <div className="text-lg text-neutral-500 font-medium mt-1">
                        Feels like {Math.round(weatherData.current.apparent_temperature)}°
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 rounded-2xl p-4 flex items-center gap-3">
                      <Wind className="w-5 h-5 text-neutral-400" />
                      <div>
                        <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Wind</div>
                        <div className="text-sm font-semibold text-neutral-900">{weatherData.current.wind_speed_10m} km/h</div>
                      </div>
                    </div>
                    <div className="bg-neutral-50 rounded-2xl p-4 flex items-center gap-3">
                      <Droplets className="w-5 h-5 text-neutral-400" />
                      <div>
                        <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Humidity</div>
                        <div className="text-sm font-semibold text-neutral-900">{weatherData.current.relative_humidity_2m}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7 Day Forecast */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-6 px-2">7-Day Outlook</h3>
                <div className="flex flex-col gap-1">
                  {weatherData.daily.time.map((timeStr, i) => {
                    const date = new Date(timeStr);
                    // Add timezone offset to fix local date issues when just parsing YYYY-MM-DD
                    const dt = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                    return (
                      <div key={timeStr} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                        <div className="w-24 text-sm font-medium text-neutral-600">
                          {i === 0 ? 'Today' : format(dt, 'EEE, MMM d')}
                        </div>
                        <div className="flex items-center gap-3 w-20">
                          <WeatherIcon code={weatherData.daily.weather_code[i]} className="w-5 h-5 text-neutral-700" />
                          <span className="text-xs font-medium text-blue-500 w-8 text-right">
                            {weatherData.daily.precipitation_probability_max[i]}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-semibold w-24 justify-end">
                          <span className="text-neutral-900">{Math.round(weatherData.daily.temperature_2m_max[i])}°</span>
                          <span className="text-neutral-400">{Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: AI Intelligence */}
            <div className="xl:col-span-7 flex flex-col min-h-[600px] xl:min-h-0">
              <div className="bg-neutral-900 rounded-3xl p-8 shadow-xl text-neutral-100 flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Meteorological Intelligence</h2>
                  </div>

                  <div className="bg-black/20 rounded-2xl p-1 mb-6 flex flex-col sm:flex-row items-center gap-2 backdrop-blur-sm">
                    <input
                      type="text"
                      placeholder="Add context (e.g., 'I am going for a hike', 'Wedding planning')..."
                      className="w-full bg-transparent border-none px-4 py-3 text-sm text-white placeholder-neutral-400 focus:outline-none focus:ring-0"
                      value={userContext}
                      onChange={(e) => setUserContext(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRefreshIntelligence();
                      }}
                    />
                    <button 
                      onClick={handleRefreshIntelligence}
                      disabled={isGeneratingIntel}
                      className="w-full sm:w-auto px-6 py-3 bg-white text-neutral-900 text-sm font-semibold rounded-xl hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      Update
                    </button>
                  </div>

                  <div className="flex-1 bg-black/10 rounded-2xl p-6 backdrop-blur-sm border border-white/5 overflow-y-auto custom-scrollbar">
                    {isGeneratingIntel ? (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4 py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-sm font-medium animate-pulse">Analyzing weather models...</p>
                      </div>
                    ) : intelligence ? (
                      <div className="text-neutral-200 text-sm sm:text-base leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-white [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>li]:mb-1 [&>strong]:text-white">
                        <Markdown>{intelligence}</Markdown>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-neutral-500 py-12 text-center">
                        No intelligence generated yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
