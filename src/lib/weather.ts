import { WeatherData, LocationResult } from '../types';

export async function searchLocation(query: string): Promise<LocationResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch location data');
  const data = await res.json();
  return data.results || [];
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  const data = await res.json();
  return {
    current: data.current,
    daily: data.daily
  };
}

export async function getIntelligence(location: string, weatherData: WeatherData, userContext?: string): Promise<string> {
  const res = await fetch('/api/intelligence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ location, weatherData, userContext })
  });
  
  if (!res.ok) {
    throw new Error('Failed to get intelligence');
  }
  
  const data = await res.json();
  return data.text;
}
