import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Moon
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: number;
  className?: string;
}

export function WeatherIcon({ code, isDay = 1, className = "" }: WeatherIconProps) {
  // WMO Weather interpretation codes (WW)
  
  // Clear
  if (code === 0) {
    return isDay ? <Sun className={className} /> : <Moon className={className} />;
  }
  // Mainly clear, partly cloudy
  if (code === 1 || code === 2) {
    return isDay ? <CloudSun className={className} /> : <Cloud className={className} />;
  }
  // Overcast
  if (code === 3) {
    return <Cloud className={className} />;
  }
  // Fog
  if (code === 45 || code === 48) {
    return <CloudFog className={className} />;
  }
  // Drizzle
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
    return <CloudDrizzle className={className} />;
  }
  // Rain
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) {
    return <CloudRain className={className} />;
  }
  // Snow
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
    return <CloudSnow className={className} />;
  }
  // Showers (Rain)
  if (code === 80 || code === 81 || code === 82) {
    return <CloudRain className={className} />;
  }
  // Thunderstorm
  if (code === 95 || code === 96 || code === 99) {
    return <CloudLightning className={className} />;
  }

  // Default
  return <Cloud className={className} />;
}
