import { WeatherData } from "../src/types";

function getWeatherDescription(code: number): string {
  switch (code) {
    case 0: return "Clear skies";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Overcast";
    case 45: case 48: return "Foggy with reduced visibility";
    case 51: case 53: case 55: return "Light to moderate drizzle";
    case 56: case 57: return "Freezing drizzle";
    case 61: case 63: return "Intermittent rain showers";
    case 65: return "Heavy continuous rainfall";
    case 66: case 67: return "Freezing rain";
    case 71: case 73: return "Light to moderate snowfall";
    case 75: case 77: return "Heavy snowfall or snow grains";
    case 80: case 81: case 82: return "Passing convective rain showers";
    case 85: case 86: return "Snow showers";
    case 95: return "Thunderstorm activity";
    case 96: case 99: return "Severe thunderstorm with potential hail";
    default: return "Variable sky conditions";
  }
}

export function generateMeteorologicalAnalysis(
  location: string,
  weather: WeatherData,
  userContext?: string
): string {
  const { current, daily } = weather;
  const condition = getWeatherDescription(current.weather_code);
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const wind = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;
  
  // Weekly stats
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const precipProbs = daily.precipitation_probability_max;
  const peakTemp = Math.round(Math.max(...maxTemps));
  const lowestTemp = Math.round(Math.min(...minTemps));
  const maxRainChance = Math.max(...precipProbs);
  
  // Wind assessment
  let windText = "gentle breezes";
  if (wind >= 30) windText = "brisk, gusty winds";
  else if (wind >= 15) windText = "moderate sustained airflow";

  // Humidity assessment
  let humidityText = "comfortable relative humidity";
  if (humidity >= 75) humidityText = "elevated moisture and muggy air";
  else if (humidity <= 35) humidityText = "dry, crisp atmospheric density";

  // Dressing advice
  let dressTips: string[] = [];
  if (temp < 5) {
    dressTips.push("**Insulation**: Thermal base layers, heavy fleece or down coat, and windproof outer layer.");
    dressTips.push("**Accessories**: Beanie, insulated gloves, and a warm neck gaiter or scarf.");
  } else if (temp < 15) {
    dressTips.push("**Layering**: Mid-weight jacket, light sweater or flannel, and durable trousers.");
    dressTips.push("**Footwear**: Closed leather sneakers or light boots.");
  } else if (temp < 24) {
    dressTips.push("**Casual Light**: Breathable cotton shirts, linen, or casual long sleeves with light chinos.");
    dressTips.push("**Versatility**: Keep a light cardigan or windbreaker handy for shaded or windy intervals.");
  } else {
    dressTips.push("**Heat Management**: Lightweight, moisture-wicking fabrics, loose-fitting attire.");
    dressTips.push("**Sun Protection**: UV-rated sunglasses, broad-spectrum sunscreen, and a protective cap.");
  }

  if (current.precipitation > 0 || (precipProbs[0] ?? 0) >= 30) {
    dressTips.push("**Precipitation Gear**: Water-resistant jacket or compact umbrella recommended.");
  }

  // Outdoor & Activity Advice
  let activityTips: string[] = [];
  if (current.weather_code >= 95) {
    activityTips.push("**Lightning Hazard**: Postpone open-field sports, ridge hiking, and water activities.");
  } else if (current.precipitation > 0 || (precipProbs[0] ?? 0) >= 50) {
    activityTips.push("**Surface Caution**: Expect slick roads, reduced tire traction, and slippery pavement.");
    activityTips.push("**Outdoor Timing**: Look for dry intermittent windows between passing shower bands.");
  } else if (wind >= 25) {
    activityTips.push("**Wind Factor**: Expect noticeable headwind resistance for cycling or open-air running.");
  } else {
    activityTips.push("**Favorable Conditions**: Excellent window for walking, jogging, and recreational outings.");
  }

  // Context tailoring
  let contextSection = "";
  if (userContext && userContext.trim()) {
    const ctx = userContext.toLowerCase();
    let advice = "";
    if (ctx.includes("run") || ctx.includes("jog") || ctx.includes("marathon") || ctx.includes("workout")) {
      advice = `For your **running/workout**: Current temperature (${temp}°C) and feels-like (${feelsLike}°C) with ${windText}. Aim for early morning or late afternoon when solar radiation is lower. Hydrate sufficiently and wear breathable synthetic technical fabrics to manage moisture.`;
    } else if (ctx.includes("hike") || ctx.includes("trail") || ctx.includes("camp")) {
      advice = `For your **hiking plans**: Ridge lines and exposed elevations will experience amplified wind speeds compared to the recorded ${wind} km/h. Pack a weatherproof emergency shell, pack plenty of electrolytes, and monitor sky darkening for sudden precipitation changes.`;
    } else if (ctx.includes("cycle") || ctx.includes("bike") || ctx.includes("biking")) {
      advice = `For **cycling**: Note winds of ${wind} km/h which may generate crosswind instability on open roads. Check tire pressures for optimal wet/dry grip, and equip active daytime running lights.`;
    } else if (ctx.includes("wedding") || ctx.includes("party") || ctx.includes("event") || ctx.includes("outdoor")) {
      advice = `For your **outdoor event**: Maximum precipitation probability stands at ${precipProbs[0]}% today. Prepare a sheltered or covered backup area if showers develop, and ensure outdoor floral or lighter decorations are secured against ${windText}.`;
    } else if (ctx.includes("commute") || ctx.includes("drive") || ctx.includes("travel")) {
      advice = `For your **commute**: Visibility and road conditions are influenced by ${condition.toLowerCase()}. Allow an extra 10–15 minutes buffer time if passing precipitation or spray increases braking distances.`;
    } else {
      advice = `Regarding **"${userContext.trim()}"**: The prevailing conditions (${condition}, ${temp}°C, humidity at ${humidity}%) are well suited if dressed appropriately. Keep an eye on the ${maxRainChance}% weekly precipitation ceiling when planning ahead.`;
    }
    contextSection = `\n### Tailored Context Analysis\n${advice}\n`;
  }

  return `### Atmospheric Overview for ${location}
Current observations reveal **${condition}** with an ambient temperature of **${temp}°C** (feels like **${feelsLike}°C**). The air mass features ${humidityText} and ${windText} at **${wind} km/h**.

### Weekly Forecast Trend
Over the next 7 days, temperatures are projected to oscillate between daily lows near **${lowestTemp}°C** and afternoon peaks up to **${peakTemp}°C**. Peak precipitation risk tops out at **${maxRainChance}%** across the forecast window.

### Dressing Recommendations
${dressTips.map(tip => `- ${tip}`).join("\n")}

### Outdoor Activities & Operations
${activityTips.map(tip => `- ${tip}`).join("\n")}
${contextSection}`;
}
