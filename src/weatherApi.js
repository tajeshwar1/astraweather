/**
 * Open-Meteo Weather API Service
 * Free, open-source weather and geocoding integration
 */

// WMO Weather interpretation codes (WW)
export const WMO_CODES = {
  0: { label: 'Clear sky', climate: 'sunny', nightLabel: 'Clear night', icon: 'clear-day', nightIcon: 'clear-night' },
  1: { label: 'Mainly clear', climate: 'sunny', nightLabel: 'Mainly clear', icon: 'partly-cloudy-day', nightIcon: 'partly-cloudy-night' },
  2: { label: 'Partly cloudy', climate: 'cloudy', nightLabel: 'Partly cloudy', icon: 'partly-cloudy-day', nightIcon: 'partly-cloudy-night' },
  3: { label: 'Overcast', climate: 'cloudy', nightLabel: 'Overcast', icon: 'overcast', nightIcon: 'overcast' },
  45: { label: 'Foggy', climate: 'cloudy', nightLabel: 'Foggy', icon: 'fog', nightIcon: 'fog' },
  48: { label: 'Depositing rime fog', climate: 'cloudy', nightLabel: 'Depositing rime fog', icon: 'fog', nightIcon: 'fog' },
  51: { label: 'Light drizzle', climate: 'rainy', nightLabel: 'Light drizzle', icon: 'drizzle', nightIcon: 'drizzle' },
  53: { label: 'Moderate drizzle', climate: 'rainy', nightLabel: 'Moderate drizzle', icon: 'drizzle', nightIcon: 'drizzle' },
  55: { label: 'Dense drizzle', climate: 'rainy', nightLabel: 'Dense drizzle', icon: 'rain', nightIcon: 'rain' },
  56: { label: 'Light freezing drizzle', climate: 'rainy', nightLabel: 'Light freezing drizzle', icon: 'sleet', nightIcon: 'sleet' },
  57: { label: 'Dense freezing drizzle', climate: 'rainy', nightLabel: 'Dense freezing drizzle', icon: 'sleet', nightIcon: 'sleet' },
  61: { label: 'Slight rain', climate: 'rainy', nightLabel: 'Slight rain', icon: 'rain', nightIcon: 'rain' },
  63: { label: 'Moderate rain', climate: 'rainy', nightLabel: 'Moderate rain', icon: 'rain', nightIcon: 'rain' },
  65: { label: 'Heavy rain', climate: 'rainy', nightLabel: 'Heavy rain', icon: 'heavy-rain', nightIcon: 'heavy-rain' },
  66: { label: 'Light freezing rain', climate: 'rainy', nightLabel: 'Light freezing rain', icon: 'sleet', nightIcon: 'sleet' },
  67: { label: 'Heavy freezing rain', climate: 'rainy', nightLabel: 'Heavy freezing rain', icon: 'sleet', nightIcon: 'sleet' },
  71: { label: 'Slight snow', climate: 'snow', nightLabel: 'Slight snow', icon: 'snow', nightIcon: 'snow' },
  73: { label: 'Moderate snow', climate: 'snow', nightLabel: 'Moderate snow', icon: 'snow', nightIcon: 'snow' },
  75: { label: 'Heavy snow', climate: 'snow', nightLabel: 'Heavy snow', icon: 'snow', nightIcon: 'snow' },
  77: { label: 'Snow grains', climate: 'snow', nightLabel: 'Snow grains', icon: 'snow', nightIcon: 'snow' },
  80: { label: 'Slight rain showers', climate: 'rainy', nightLabel: 'Slight rain showers', icon: 'rain', nightIcon: 'rain' },
  81: { label: 'Moderate rain showers', climate: 'rainy', nightLabel: 'Moderate rain showers', icon: 'heavy-rain', nightIcon: 'heavy-rain' },
  82: { label: 'Violent rain showers', climate: 'rainy', nightLabel: 'Violent rain showers', icon: 'heavy-rain', nightIcon: 'heavy-rain' },
  85: { label: 'Slight snow showers', climate: 'snow', nightLabel: 'Slight snow showers', icon: 'snow', nightIcon: 'snow' },
  86: { label: 'Heavy snow showers', climate: 'snow', nightLabel: 'Heavy snow showers', icon: 'snow', nightIcon: 'snow' },
  95: { label: 'Thunderstorm', climate: 'thunderstorm', nightLabel: 'Thunderstorm', icon: 'thunderstorm', nightIcon: 'thunderstorm' },
  96: { label: 'Thunderstorm with slight hail', climate: 'thunderstorm', nightLabel: 'Thunderstorm with hail', icon: 'thunderstorm', nightIcon: 'thunderstorm' },
  99: { label: 'Thunderstorm with heavy hail', climate: 'thunderstorm', nightLabel: 'Thunderstorm with hail', icon: 'thunderstorm', nightIcon: 'thunderstorm' },
};

/**
 * Get weather descriptor object from WMO code & isDay flag
 */
export function getWeatherInfo(code, isDay = 1) {
  const item = WMO_CODES[code] || {
    label: 'Unknown',
    climate: 'cloudy',
    nightLabel: 'Unknown',
    icon: 'overcast',
    nightIcon: 'overcast'
  };

  const isNight = isDay === 0;
  let climate = item.climate;
  if (isNight && (item.climate === 'sunny' || code <= 1)) {
    climate = 'night';
  }

  return {
    code,
    description: isNight ? item.nightLabel : item.label,
    climate: climate,
    icon: isNight ? item.nightIcon : item.icon,
    isDay: Boolean(isDay),
  };
}

// High-performance in-memory caches
const forecastCache = new Map();
const searchCache = new Map();
const FORECAST_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Search locations using Open-Meteo Geocoding API with caching
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  if (searchCache.has(q)) {
    return searchCache.get(q);
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
    const data = await res.json();
    const results = data.results || [];
    searchCache.set(q, results);
    return results;
  } catch (err) {
    console.error('Failed to search locations:', err);
    return [];
  }
}

/**
 * Reverse geocode coordinates using BigDataCloud Client API (high accuracy, full CORS, no auth)
 * with OpenStreetMap Nominatim and coordinate fallback
 */
export async function reverseGeocode(lat, lon) {
  // 1. Try BigDataCloud free reverse geocoding client API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Your Location';
      const country = data.countryName || '';
      const admin1 = data.principalSubdivision || '';
      return { name, country, admin1, latitude: lat, longitude: lon };
    }
  } catch (e) {
    console.warn('BigDataCloud reverse geocode fallback:', e);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(nomUrl, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const name = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || 'Current Location';
      const country = addr.country || '';
      const admin1 = addr.state || addr.region || '';
      return { name, country, admin1, latitude: lat, longitude: lon };
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode fallback:', e);
  }

  return {
    name: 'Your Location',
    country: '',
    admin1: '',
    latitude: lat,
    longitude: lon
  };
}

/**
 * Fetch complete weather forecast from Open-Meteo with caching
 */
export async function fetchWeatherData(lat, lon, unit = 'celsius') {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${unit}`;
  const cached = forecastCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < FORECAST_CACHE_TTL)) {
    return cached.data;
  }

  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const windUnit = unit === 'fahrenheit' ? 'mph' : 'kmh';
  const precipUnit = unit === 'fahrenheit' ? 'inch' : 'mm';

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index'
    ].join(','),
    hourly: [
      'temperature_2m',
      'weather_code',
      'precipitation_probability',
      'relative_humidity_2m',
      'wind_speed_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max'
    ].join(','),
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    precipitation_unit: precipUnit,
    timezone: 'auto'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo forecast failed with status ${res.status}`);
  }
  const data = await res.json();
  forecastCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

/**
 * Format local time given Open-Meteo's localized ISO string.
 * Because Open-Meteo with timezone=auto returns timestamps already computed in that city's local wall clock,
 * we pin the string to UTC so the client browser doesn't shift it a second time.
 */
export function formatLocalTime(isoString, timezone = 'UTC', options = {}) {
  if (!isoString) return '--:--';
  try {
    // If the ISO string does not end in Z or offset, append Z to treat it as UTC reference
    const normalizedIso = isoString.includes('Z') || /[+-]\d{2}:\d{2}$/.test(isoString)
      ? isoString
      : `${isoString}Z`;
    const date = new Date(normalizedIso);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      ...options
    }).format(date);
  } catch (e) {
    // Fallback: extract hours and minutes from string
    if (typeof isoString === 'string' && isoString.includes('T')) {
      return isoString.split('T')[1].slice(0, 5);
    }
    return new Date(isoString).toLocaleTimeString();
  }
}

/**
 * Convert wind degrees to compass cardinal direction
 */
export function getWindDirection(degrees) {
  if (degrees === undefined || degrees === null || isNaN(degrees)) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const deg = (((Number(degrees) % 360) + 360) % 360);
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Get UV safety category and advice
 */
export function getUvCategory(uv) {
  if (uv < 3) return { level: 'Low', color: '#10b981', advice: 'Minimal sun protection needed' };
  if (uv < 6) return { level: 'Moderate', color: '#f59e0b', advice: 'Wear sunglasses & SPF 30+' };
  if (uv < 8) return { level: 'High', color: '#f97316', advice: 'Cover up, seek shade midday' };
  if (uv < 11) return { level: 'Very High', color: '#ef4444', advice: 'Extra protection required' };
  return { level: 'Extreme', color: '#8b5cf6', advice: 'Avoid sun exposure outside' };
}

// In-memory cache for Air Quality API
const aqiCache = new Map();
const AQI_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch Air Quality Intelligence from Open-Meteo Air Quality API
 */
export async function fetchAirQualityData(lat, lon) {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = aqiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < AQI_CACHE_TTL)) {
    return cached.data;
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'european_aqi',
      'us_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'dust',
      'uv_index'
    ].join(','),
    hourly: [
      'pm2_5',
      'pm10',
      'us_aqi',
      'european_aqi',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'ozone',
      'sulphur_dioxide'
    ].join(','),
    timezone: 'auto'
  });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo Air Quality failed with status ${res.status}`);
  }
  const data = await res.json();
  aqiCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

/**
 * Air Quality Health Standards & Classification (US EPA AQI Standard)
 */
export function getAqiCategory(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 50) {
    return {
      index: val,
      tier: 1,
      level: 'Good',
      shortLevel: 'Good',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.16)',
      border: 'rgba(16, 185, 129, 0.4)',
      summary: 'Air quality is satisfactory and poses little or no health risk.',
      exercise: 'Ideal conditions for all outdoor activities and exercise.',
      mask: 'No face mask required.',
      ventilation: 'Great time to open windows and let fresh air in.',
      purifier: 'Air purifiers generally unnecessary indoors.'
    };
  }
  if (val <= 100) {
    return {
      index: val,
      tier: 2,
      level: 'Moderate',
      shortLevel: 'Moderate',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.16)',
      border: 'rgba(245, 158, 11, 0.4)',
      summary: 'Air quality is acceptable. Very sensitive individuals may experience minor symptoms.',
      exercise: 'Safe for most people; unusually sensitive groups should take occasional rests.',
      mask: 'Optional; recommended for individuals with severe respiratory sensitivities.',
      ventilation: 'Ventilation acceptable; keep short during rush-hour traffic.',
      purifier: 'Optional indoors; beneficial for nurseries and sensitive groups.'
    };
  }
  if (val <= 150) {
    return {
      index: val,
      tier: 3,
      level: 'Unhealthy for Sensitive Groups',
      shortLevel: 'Sensitive',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.16)',
      border: 'rgba(249, 115, 22, 0.4)',
      summary: 'Members of sensitive groups may experience health effects. General public less affected.',
      exercise: 'Sensitive groups should reduce strenuous outdoor workouts.',
      mask: 'N95 or particulate mask recommended for sensitive individuals outside.',
      ventilation: 'Close windows during heavy traffic or hazy hours.',
      purifier: 'Recommended to run air purifiers indoors.'
    };
  }
  if (val <= 200) {
    return {
      index: val,
      tier: 4,
      level: 'Unhealthy',
      shortLevel: 'Unhealthy',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.16)',
      border: 'rgba(239, 68, 68, 0.4)',
      summary: 'Everyone may begin to experience health effects; sensitive groups more severely.',
      exercise: 'Avoid outdoor cardio or prolonged exertion outdoors.',
      mask: 'Wear a well-fitting N95/KN95 respirator mask when going outside.',
      ventilation: 'Keep windows and doors firmly closed.',
      purifier: 'Operate HEPA air purifiers continuously indoors.'
    };
  }
  if (val <= 300) {
    return {
      index: val,
      tier: 5,
      level: 'Very Unhealthy',
      shortLevel: 'Very Unhealthy',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.16)',
      border: 'rgba(139, 92, 246, 0.4)',
      summary: 'Health alert: Increased risk of serious respiratory and cardiovascular effects for all.',
      exercise: 'Cancel all outdoor physical activities; stay indoors.',
      mask: 'Certified N95/FFP2 respirator essential outdoors.',
      ventilation: 'Keep all windows closed; use recirculated AC mode.',
      purifier: 'Run high-efficiency air purifiers on high speed.'
    };
  }
  return {
    index: val,
    tier: 6,
    level: 'Hazardous',
    shortLevel: 'Hazardous',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.18)',
    border: 'rgba(236, 72, 153, 0.5)',
    summary: 'Emergency health warning: Entire population is at severe risk.',
    exercise: 'Remain strictly indoors. Avoid all physical exertion.',
    mask: 'Wear sealed respirator (N95/P100) if emergency travel is required.',
    ventilation: 'Seal windows and drafts; avoid bringing outside air indoors.',
    purifier: 'Continuous multi-stage HEPA filtration strongly advised.'
  };
}

/**
 * European Air Quality Index (EAQI) descriptor
 */
export function getEaqiCategory(eaqi) {
  const val = Number(eaqi) || 0;
  if (val <= 20) return { level: 'Good', color: '#10b981' };
  if (val <= 40) return { level: 'Fair', color: '#84cc16' };
  if (val <= 60) return { level: 'Moderate', color: '#f59e0b' };
  if (val <= 80) return { level: 'Poor', color: '#f97316' };
  if (val <= 100) return { level: 'Very Poor', color: '#ef4444' };
  return { level: 'Extremely Poor', color: '#8b5cf6' };
}

/**
 * Key Atmospheric Pollutant Metadata & WHO Guidelines
 */
export const POLLUTANTS_INFO = {
  pm2_5: {
    symbol: 'PM2.5',
    name: 'Fine Particles',
    sub: 'Combustion aerosols (≤ 2.5 µm)',
    unit: 'µg/m³',
    whoStandard: 15,
    thresholds: [12, 35.4, 55.4, 150.4]
  },
  pm10: {
    symbol: 'PM10',
    name: 'Coarse Dust',
    sub: 'Respirable dust & pollen (≤ 10 µm)',
    unit: 'µg/m³',
    whoStandard: 45,
    thresholds: [54, 154, 254, 354]
  },
  nitrogen_dioxide: {
    symbol: 'NO₂',
    name: 'Nitrogen Dioxide',
    sub: 'Traffic emissions & combustion',
    unit: 'µg/m³',
    whoStandard: 25,
    thresholds: [40, 90, 180, 280]
  },
  ozone: {
    symbol: 'O₃',
    name: 'Surface Ozone',
    sub: 'Photochemical smog & sunlight',
    unit: 'µg/m³',
    whoStandard: 100,
    thresholds: [50, 100, 168, 208]
  },
  carbon_monoxide: {
    symbol: 'CO',
    name: 'Carbon Monoxide',
    sub: 'Fossil fuel combustion byproducts',
    unit: 'µg/m³',
    whoStandard: 4000,
    thresholds: [4400, 9400, 12400, 15400]
  },
  sulphur_dioxide: {
    symbol: 'SO₂',
    name: 'Sulphur Dioxide',
    sub: 'Industrial gas & fuel emissions',
    unit: 'µg/m³',
    whoStandard: 40,
    thresholds: [40, 80, 380, 800]
  }
};

/**
 * Evaluate individual pollutant safety against WHO / EPA benchmarks
 */
export function getPollutantStatus(key, rawValue) {
  const meta = POLLUTANTS_INFO[key];
  if (!meta) return { level: 'Normal', color: '#10b981', ratioText: 'Normal' };

  const val = Number(rawValue) || 0;
  const t = meta.thresholds;
  let level = 'Good';
  let color = '#10b981';

  if (val <= t[0]) {
    level = 'Good';
    color = '#10b981';
  } else if (val <= t[1]) {
    level = 'Moderate';
    color = '#f59e0b';
  } else if (val <= t[2]) {
    level = 'Poor';
    color = '#f97316';
  } else {
    level = 'Unhealthy';
    color = '#ef4444';
  }

  const ratio = (val / meta.whoStandard).toFixed(1);
  const ratioText = val > meta.whoStandard
    ? `${ratio}× WHO limit (${meta.whoStandard} ${meta.unit})`
    : `Within WHO limit (${meta.whoStandard} ${meta.unit})`;

  const maxThreshold = t[3] || meta.whoStandard * 3;
  const progressPct = Math.min(100, Math.max(8, (val / maxThreshold) * 100));

  return { level, color, ratioText, progressPct, value: val };
}

