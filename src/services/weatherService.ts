import { DestinationWeatherData, CurrentWeather, DailyForecast } from '../types';

// Map WMO codes to human readable conditions in Spanish & English
export const WMO_CODE_MAP: Record<number, { es: string; en: string; icon: string }> = {
  0: { es: 'Despejado', en: 'Clear sky', icon: '☀️' },
  1: { es: 'Mayormente despejado', en: 'Mainly clear', icon: '🌤️' },
  2: { es: 'Parcialmente nublado', en: 'Partly cloudy', icon: '⛅' },
  3: { es: 'Nublado', en: 'Overcast', icon: '☁️' },
  45: { es: 'Niebla austral', en: 'Fog', icon: '🌫️' },
  48: { es: 'Niebla con escarcha', en: 'Depositing rime fog', icon: '🌫️' },
  51: { es: 'Llovizna leve', en: 'Light drizzle', icon: '🌦️' },
  53: { es: 'Llovizna moderada', en: 'Moderate drizzle', icon: '🌧️' },
  55: { es: 'Llovizna densa', en: 'Dense drizzle', icon: '🌧️' },
  61: { es: 'Lluvia leve', en: 'Slight rain', icon: '🌦️' },
  63: { es: 'Lluvia moderada', en: 'Moderate rain', icon: '🌧️' },
  65: { es: 'Lluvia intensa', en: 'Heavy rain', icon: '🌧️' },
  71: { es: 'Nevada ligera', en: 'Slight snow fall', icon: '🌨️' },
  73: { es: 'Nevada moderada', en: 'Moderate snow fall', icon: '❄️' },
  75: { es: 'Nevada intensa', en: 'Heavy snow fall', icon: '❄️' },
  77: { es: 'Granos de nieve / cinarra', en: 'Snow grains', icon: '🌨️' },
  80: { es: 'Chubascos leves', en: 'Slight rain showers', icon: '🌦️' },
  81: { es: 'Chubascos moderados', en: 'Moderate rain showers', icon: '🌧️' },
  82: { es: 'Chubascos violentos', en: 'Violent rain showers', icon: '⛈️' },
  85: { es: 'Chubascos de nieve leves', en: 'Slight snow showers', icon: '🌨️' },
  86: { es: 'Chubascos de nieve intensos', en: 'Heavy snow showers', icon: '❄️' },
  95: { es: 'Tormenta eléctrica', en: 'Thunderstorm', icon: '⛈️' },
  96: { es: 'Tormenta con granizo leve', en: 'Thunderstorm with hail', icon: '⛈️' },
  99: { es: 'Tormenta con granizo severo', en: 'Severe thunderstorm with hail', icon: '⛈️' },
};

export function getWmoInfo(code: number, lang: 'es' | 'en' = 'es'): { label: string; icon: string } {
  const item = WMO_CODE_MAP[code] || { es: 'Condición variable', en: 'Variable conditions', icon: '💨' };
  return {
    label: lang === 'es' ? item.es : item.en,
    icon: item.icon,
  };
}

const CACHE_PREFIX = 'surario_weather_cache_';
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

export async function fetchRealtimeWeather(
  destinationId: string,
  destinationName: string,
  lat: number,
  lng: number,
  lang: 'es' | 'en' = 'es'
): Promise<DestinationWeatherData> {
  const cacheKey = `${CACHE_PREFIX}${destinationId}`;

  // Check localStorage cache
  try {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      const parsed: DestinationWeatherData = JSON.parse(cachedRaw);
      const isFresh = Date.now() - parsed.fetchedAt < CACHE_TTL_MS;
      if (isFresh) {
        return parsed;
      }
    }
  } catch {
    // ignore localStorage errors in restricted environments
  }

  try {
    // Open-Meteo free API - no API key required
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto&forecast_days=4`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error: ${response.status}`);
    }

    const data = await response.json();

    const currentWeatherCode = data.current?.weather_code ?? 0;
    const current: CurrentWeather = {
      temperature: Math.round(data.current?.temperature_2m ?? 12),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? 10),
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 24),
      windGusts: Math.round(data.current?.wind_gusts_10m ?? 42),
      precipitation: Number(data.current?.precipitation ?? 0),
      weatherCode: currentWeatherCode,
      conditionText: getWmoInfo(currentWeatherCode, lang).label,
      time: data.current?.time ?? new Date().toISOString(),
    };

    const daily: DailyForecast[] = [];
    if (data.daily?.time && Array.isArray(data.daily.time)) {
      for (let i = 0; i < Math.min(3, data.daily.time.length); i++) {
        const wCode = data.daily.weather_code?.[i] ?? 0;
        daily.push({
          date: data.daily.time[i],
          maxTemp: Math.round(data.daily.temperature_2m_max?.[i] ?? 14),
          minTemp: Math.round(data.daily.temperature_2m_min?.[i] ?? 4),
          weatherCode: wCode,
          conditionText: getWmoInfo(wCode, lang).label,
          maxWind: Math.round(data.daily.wind_speed_10m_max?.[i] ?? 35),
        });
      }
    }

    const result: DestinationWeatherData = {
      destinationId,
      destinationName,
      fetchedAt: Date.now(),
      current,
      daily,
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // ignore quota errors
    }

    return result;
  } catch (err) {
    console.warn(`Weather fetch fallback for ${destinationName}:`, err);
    // Graceful reliable estimate based on subpolar coordinates
    return getFallbackWeather(destinationId, destinationName, lat, lang);
  }
}

function getFallbackWeather(
  destinationId: string,
  destinationName: string,
  lat: number,
  lang: 'es' | 'en'
): DestinationWeatherData {
  // Southern latitude adjustment: further south means cooler
  const isExtremeSouth = lat < -52;
  const baseTemp = isExtremeSouth ? 8 : 14;
  const baseApparent = isExtremeSouth ? 4 : 11;
  const baseWind = isExtremeSouth ? 38 : 22;

  const current: CurrentWeather = {
    temperature: baseTemp,
    apparentTemperature: baseApparent,
    windSpeed: baseWind,
    windGusts: baseWind + 18,
    precipitation: 0.2,
    weatherCode: 2,
    conditionText: getWmoInfo(2, lang).label,
    time: new Date().toISOString(),
  };

  const today = new Date();
  const daily: DailyForecast[] = [1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      date: d.toISOString().split('T')[0],
      maxTemp: baseTemp + 2,
      minTemp: baseTemp - 5,
      weatherCode: offset % 2 === 0 ? 3 : 1,
      conditionText: getWmoInfo(offset % 2 === 0 ? 3 : 1, lang).label,
      maxWind: baseWind + 10,
    };
  });

  return {
    destinationId,
    destinationName,
    fetchedAt: Date.now(),
    current,
    daily,
  };
}
