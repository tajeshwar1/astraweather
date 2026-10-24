/**
 * AstraWeather Main Application Controller
 * Integrates Open-Meteo API & Three.js 3D Weather Simulation
 */

import {
  fetchWeatherData,
  searchLocations,
  reverseGeocode,
  getWeatherInfo,
  formatLocalTime,
  getWindDirection,
  getUvCategory,
  fetchAirQualityData,
  getAqiCategory,
  getEaqiCategory,
  POLLUTANTS_INFO,
  getPollutantStatus
} from './weatherApi.js';
import { WeatherScene } from './threeScene.js';
import { getIcon, ICONS } from './icons.js';
import { soundEngine } from './soundEngine.js';

// --- State Management ---
const state = {
  currentCity: {
    name: 'Tokyo',
    country: 'Japan',
    admin1: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917
  },
  weatherData: null,
  aqiData: null,
  currentTab: 'weather', // 'weather' | 'aqi'
  unit: 'celsius', // 'celsius' | 'fahrenheit'
  searchDebounceTimer: null,
  activeSearchQuery: '',
};

// --- DOM Element References ---
const elements = {
  canvasContainer: document.getElementById('weather-canvas-container'),
  brandIcon: document.getElementById('brand-weather-icon'),
  searchIcon: document.getElementById('search-icon-placeholder'),
  geoIcon: document.getElementById('geo-icon-placeholder'),

  // View Tabs
  tabWeather: document.getElementById('tab-weather'),
  tabAqi: document.getElementById('tab-aqi'),
  tabWeatherIcon: document.getElementById('tab-weather-icon'),
  tabAqiIcon: document.getElementById('tab-aqi-icon'),
  tabAqiBadge: document.getElementById('tab-aqi-badge'),
  panelWeather: document.getElementById('panel-weather'),
  panelAqi: document.getElementById('panel-aqi'),

  // Hero AQI Quick Shortcut on Weather View
  heroAqiShortcut: document.getElementById('hero-aqi-shortcut'),
  heroAqiVal: document.getElementById('hero-aqi-hl-val'),
  heroAqiTag: document.getElementById('hero-aqi-tag'),

  // Search
  searchInput: document.getElementById('city-search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  searchResults: document.getElementById('search-results'),
  geoBtn: document.getElementById('geo-btn'),

  // Header Controls
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIconBox: document.getElementById('sound-icon-box'),
  soundText: document.getElementById('sound-text'),
  unitToggleBtn: document.getElementById('unit-toggle-btn'),

  // Popular Cities
  cityChips: document.querySelectorAll('.city-chip'),

  // Status Banner
  statusBanner: document.getElementById('status-banner'),

  // Weather Hero Card
  heroCityName: document.getElementById('hero-city-name'),
  heroCountryTag: document.getElementById('hero-country-tag'),
  heroLocalTime: document.getElementById('hero-local-time'),
  heroLocalDate: document.getElementById('hero-local-date'),
  heroWeatherBadge: document.getElementById('hero-weather-badge'),
  heroConditionIcon: document.getElementById('hero-condition-icon'),
  heroConditionText: document.getElementById('hero-condition-text'),
  heroTempVal: document.getElementById('hero-temp-val'),
  heroFeelsLike: document.getElementById('hero-feels-like'),
  heroHighTemp: document.getElementById('hero-high-temp'),
  heroLowTemp: document.getElementById('hero-low-temp'),
  heroPrecipVal: document.getElementById('hero-precip-val'),
  heroWindVal: document.getElementById('hero-wind-val'),
  heroHumidityVal: document.getElementById('hero-humidity-val'),
  heroUvVal: document.getElementById('hero-uv-val'),

  // Forecast Tracks
  hourlyScrollTrack: document.getElementById('hourly-scroll-track'),
  dailyForecastList: document.getElementById('daily-forecast-list'),

  // Secondary Metrics
  windIconBox: document.getElementById('wind-icon-box'),
  uvIconBox: document.getElementById('uv-icon-box'),
  humidityIconBox: document.getElementById('humidity-icon-box'),
  sunIconBox: document.getElementById('sun-icon-box'),
  pressureIconBox: document.getElementById('pressure-icon-box'),

  metricWindSpeed: document.getElementById('metric-wind-speed'),
  metricWindUnit: document.getElementById('metric-wind-unit'),
  metricWindDirText: document.getElementById('metric-wind-dir-text'),
  compassNeedle: document.getElementById('compass-needle'),
  metricWindFooter: document.getElementById('metric-wind-footer'),

  metricUvVal: document.getElementById('metric-uv-val'),
  metricUvPill: document.getElementById('metric-uv-pill'),
  metricUvBar: document.getElementById('metric-uv-bar'),
  metricUvAdvice: document.getElementById('metric-uv-advice'),

  metricHumidityVal: document.getElementById('metric-humidity-val'),
  metricHumidityBar: document.getElementById('metric-humidity-bar'),
  metricHumidityFooter: document.getElementById('metric-humidity-footer'),

  metricSunriseVal: document.getElementById('metric-sunrise-val'),
  metricSunsetVal: document.getElementById('metric-sunset-val'),
  sunArcDot: document.getElementById('sun-arc-dot'),
  sunArcProgress: document.getElementById('sun-arc-progress'),
  metricSunFooter: document.getElementById('metric-sun-footer'),

  metricPressureVal: document.getElementById('metric-pressure-val'),
  metricCloudsVal: document.getElementById('metric-clouds-val'),
  metricPressureFooter: document.getElementById('metric-pressure-footer'),

  // AQI Panel Elements
  aqiHeroBadge: document.getElementById('aqi-hero-badge'),
  aqiConditionIcon: document.getElementById('aqi-condition-icon'),
  aqiConditionText: document.getElementById('aqi-condition-text'),
  aqiHeadingCity: document.getElementById('aqi-heading-city'),
  aqiHeroStatusWord: document.getElementById('aqi-hero-status-word'),
  aqiCityName: document.getElementById('aqi-city-name'),
  aqiCountryTag: document.getElementById('aqi-country-tag'),
  aqiLocalTime: document.getElementById('aqi-local-time'),
  aqiLocalDate: document.getElementById('aqi-local-date'),

  aqiGaugeProgress: document.getElementById('aqi-gauge-progress'),
  aqiGaugeVal: document.getElementById('aqi-gauge-val'),
  aqiGaugePill: document.getElementById('aqi-gauge-pill'),
  aqiEpaVal: document.getElementById('aqi-epa-val'),
  aqiEaqiVal: document.getElementById('aqi-eaqi-val'),
  aqiDomIcon: document.getElementById('aqi-dom-icon'),
  aqiDominantPollutant: document.getElementById('aqi-dominant-pollutant'),
  aqiNarrativeText: document.getElementById('aqi-narrative-text'),

  // Health Advisory
  advisoryCardExercise: document.getElementById('advisory-card-exercise'),
  advIconExercise: document.getElementById('adv-icon-exercise'),
  advTextExercise: document.getElementById('adv-text-exercise'),

  advisoryCardMask: document.getElementById('advisory-card-mask'),
  advIconMask: document.getElementById('adv-icon-mask'),
  advTextMask: document.getElementById('adv-text-mask'),

  advisoryCardVentilation: document.getElementById('advisory-card-ventilation'),
  advIconVentilation: document.getElementById('adv-icon-ventilation'),
  advTextVentilation: document.getElementById('adv-text-ventilation'),

  advisoryCardPurifier: document.getElementById('advisory-card-purifier'),
  advIconPurifier: document.getElementById('adv-icon-purifier'),
  advTextPurifier: document.getElementById('adv-text-purifier'),

  // Hourly AQI Track
  hourlyAqiScrollTrack: document.getElementById('hourly-aqi-scroll-track'),

  // Pollutants Breakdown
  pollutantsIconBox: document.getElementById('pollutants-icon-box'),
  pollutantsContainer: document.getElementById('pollutants-container'),
  pollutantsFooter: document.getElementById('pollutants-footer'),

  // Scale Reference
  scaleIconBox: document.getElementById('scale-icon-box'),
  aqiScaleTiers: document.getElementById('aqi-scale-tiers'),
};

// Initialize Three.js Scene
let threeScene = null;

// --- Application Bootstrapping ---
function initApp() {
  // Clear any leftover hash and enforce strict left: 0 horizontal alignment
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo({ left: 0 });
  window.addEventListener('scroll', () => {
    if (window.scrollX !== 0) window.scrollTo({ left: 0 });
  });

  // 1. Inject SVG Icons into UI placeholders
  elements.brandIcon.innerHTML = getIcon('clear-day');
  elements.searchIcon.innerHTML = getIcon('search');
  elements.geoIcon.innerHTML = getIcon('location');

  elements.windIconBox.innerHTML = getIcon('wind');
  elements.uvIconBox.innerHTML = getIcon('uv');
  elements.humidityIconBox.innerHTML = getIcon('droplet');
  elements.sunIconBox.innerHTML = getIcon('sunrise');
  elements.pressureIconBox.innerHTML = getIcon('pressure');

  // Tabs & AQI Icons
  if (elements.tabWeatherIcon) elements.tabWeatherIcon.innerHTML = getIcon('clear-day');
  if (elements.tabAqiIcon) elements.tabAqiIcon.innerHTML = getIcon('leaf');
  if (elements.aqiConditionIcon) elements.aqiConditionIcon.innerHTML = getIcon('leaf');
  if (elements.advIconExercise) elements.advIconExercise.innerHTML = getIcon('activity');
  if (elements.advIconMask) elements.advIconMask.innerHTML = getIcon('mask');
  if (elements.advIconVentilation) elements.advIconVentilation.innerHTML = getIcon('window');
  if (elements.advIconPurifier) elements.advIconPurifier.innerHTML = getIcon('purifier');
  if (elements.aqiDomIcon) elements.aqiDomIcon.innerHTML = getIcon('particles');
  if (elements.pollutantsIconBox) elements.pollutantsIconBox.innerHTML = getIcon('particles');
  if (elements.scaleIconBox) elements.scaleIconBox.innerHTML = getIcon('shield-check');

  // Ambient Weather Audio Toggle Initial State
  updateSoundButton();

  // 2. Initialize Three.js 3D Weather Environment
  try {
    threeScene = new WeatherScene(elements.canvasContainer);
    // Wire synchronized lightning strike (visual screen flash + physical rolling thunder)
    threeScene.onLightningStrike = (strikeInfo = {}) => {
      triggerLightningFlashEffect(strikeInfo);
      const soundDelay = strikeInfo.delay !== undefined ? strikeInfo.delay : (0.35 + Math.random() * 0.35);
      soundEngine.triggerThunder(soundDelay, strikeInfo);
    };
  } catch (err) {
    console.error('Failed to initialize Three.js scene:', err);
  }

  // Request gyroscope permission on first user gesture for mobile 3D parallax
  const handleGyroGesture = () => {
    if (threeScene && threeScene.requestGyroscopePermission) {
      threeScene.requestGyroscopePermission();
    }
  };
  window.addEventListener('click', handleGyroGesture, { once: true });
  window.addEventListener('touchstart', handleGyroGesture, { once: true });

  // 3. Attach Event Listeners
  setupEventListeners();

  // 4. Initial Weather & AQI Load
  loadWeatherForCity(state.currentCity);
}

// --- Select and load a city location ---
function selectLocation(loc) {
  const city = {
    name: loc.name,
    country: loc.country || '',
    admin1: loc.admin1 || '',
    latitude: parseFloat(loc.latitude),
    longitude: parseFloat(loc.longitude)
  };
  elements.searchInput.value = '';
  elements.clearSearchBtn.classList.add('hidden');
  elements.searchResults.classList.add('hidden');
  loadWeatherForCity(city);
}

// --- Event Handlers Setup ---
function setupEventListeners() {
  // Search input live autocomplete with race condition guard
  elements.searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    elements.clearSearchBtn.classList.toggle('hidden', val.length === 0);

    clearTimeout(state.searchDebounceTimer);
    if (val.length < 2) {
      elements.searchResults.classList.add('hidden');
      return;
    }

    state.activeSearchQuery = val;
    state.searchDebounceTimer = setTimeout(async () => {
      const locations = await searchLocations(val);
      // Ensure results match latest search text
      if (state.activeSearchQuery === val) {
        renderSearchResults(locations);
      }
    }, 280);
  });

  // Search input keyboard accessibility (ArrowDown, ArrowUp, Enter, Escape)
  elements.searchInput.addEventListener('keydown', (e) => {
    const isHidden = elements.searchResults.classList.contains('hidden');
    const items = elements.searchResults.querySelectorAll('.search-result-item');

    if (e.key === 'ArrowDown') {
      if (isHidden || items.length === 0) return;
      e.preventDefault();
      let currentIndex = -1;
      items.forEach((item, idx) => {
        if (item.classList.contains('highlighted')) currentIndex = idx;
      });
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items.forEach(it => it.classList.remove('highlighted'));
      items[nextIndex].classList.add('highlighted');
      items[nextIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      if (isHidden || items.length === 0) return;
      e.preventDefault();
      let currentIndex = -1;
      items.forEach((item, idx) => {
        if (item.classList.contains('highlighted')) currentIndex = idx;
      });
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items.forEach(it => it.classList.remove('highlighted'));
      items[prevIndex].classList.add('highlighted');
      items[prevIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const highlighted = elements.searchResults.querySelector('.search-result-item.highlighted');
      if (highlighted && highlighted.dataset.lat) {
        highlighted.click();
      } else if (items.length > 0 && !isHidden && items[0].dataset.lat) {
        items[0].click();
      } else {
        const val = elements.searchInput.value.trim();
        if (val.length >= 2) {
          clearTimeout(state.searchDebounceTimer);
          searchLocations(val).then((locs) => {
            if (locs && locs.length > 0) {
              selectLocation(locs[0]);
            }
          });
        }
      }
    } else if (e.key === 'Escape') {
      elements.searchResults.classList.add('hidden');
    }
  });

  // Ambient Weather Sound Toggle
  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener('click', () => {
      const isEnabled = soundEngine.toggleAmbient();
      updateSoundButton();
      // If user enabled sound during rain or thunderstorm, trigger a visual lightning strike & thunder promptly
      if (isEnabled && threeScene && (state.currentClimate === 'rainy' || state.currentClimate === 'thunderstorm')) {
        setTimeout(() => {
          if (threeScene) threeScene.triggerLightning();
        }, 1100);
      }
    });
  }

  // Interactive Lightning Strike trigger on Weather Card Icon during rain or thunderstorm
  if (elements.heroConditionIcon) {
    elements.heroConditionIcon.style.cursor = 'pointer';
    elements.heroConditionIcon.title = 'Click to trigger lightning & thunder strike';
    elements.heroConditionIcon.addEventListener('click', () => {
      if (threeScene) {
        threeScene.triggerLightning();
      }
    });
  }

  // Clear search input
  elements.clearSearchBtn.addEventListener('click', () => {
    soundEngine.playClick('click');
    elements.searchInput.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.searchResults.classList.add('hidden');
    elements.searchInput.focus();
  });

  // Hide search dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!elements.searchInput.contains(e.target) && !elements.searchResults.contains(e.target)) {
      elements.searchResults.classList.add('hidden');
    }
  });

  // Geolocation Button
  elements.geoBtn.addEventListener('click', () => {
    soundEngine.playClick('click');
    detectUserLocation();
  });

  // Unit Toggle (°C / °F)
  elements.unitToggleBtn.addEventListener('click', () => {
    soundEngine.playClick('toggle');
    state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    updateUnitButtons();
    loadWeatherForCity(state.currentCity);
  });

  // Quick City Chips
  elements.cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      soundEngine.playClick('chip');
      const city = {
        name: chip.dataset.name,
        country: chip.dataset.country,
        latitude: parseFloat(chip.dataset.lat),
        longitude: parseFloat(chip.dataset.lon)
      };
      loadWeatherForCity(city);
    });
  });

  // Desktop Mouse Wheel Horizontal Scroll on Hourly Timeline
  if (elements.hourlyScrollTrack) {
    elements.hourlyScrollTrack.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        elements.hourlyScrollTrack.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // Desktop Mouse Wheel Horizontal Scroll on AQI Hourly Timeline
  if (elements.hourlyAqiScrollTrack) {
    elements.hourlyAqiScrollTrack.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        elements.hourlyAqiScrollTrack.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // View Tab Switching
  if (elements.tabWeather) {
    elements.tabWeather.addEventListener('click', () => {
      soundEngine.playClick('tab');
      switchTab('weather');
    });
  }
  if (elements.tabAqi) {
    elements.tabAqi.addEventListener('click', () => {
      soundEngine.playClick('tab');
      switchTab('aqi');
    });
  }
  if (elements.heroAqiShortcut) {
    elements.heroAqiShortcut.addEventListener('click', () => {
      soundEngine.playClick('tab');
      switchTab('aqi');
    });
  }

  // Accessible Keyboard Navigation for View Tabs
  const tabButtons = [elements.tabWeather, elements.tabAqi].filter(Boolean);
  tabButtons.forEach((tabBtn, idx, arr) => {
    tabBtn.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        target = arr[(idx + 1) % arr.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        target = arr[(idx - 1 + arr.length) % arr.length];
      } else if (e.key === 'Home') {
        target = arr[0];
      } else if (e.key === 'End') {
        target = arr[arr.length - 1];
      }
      if (target) {
        e.preventDefault();
        target.focus();
        target.click();
      }
    });
  });
}

// --- View Tab Switcher (Weather vs Air Quality) ---
function switchTab(tabId) {
  state.currentTab = tabId;
  const isWeather = tabId === 'weather';

  if (elements.tabWeather) {
    elements.tabWeather.classList.toggle('active', isWeather);
    elements.tabWeather.setAttribute('aria-selected', isWeather ? 'true' : 'false');
    elements.tabWeather.setAttribute('tabindex', isWeather ? '0' : '-1');
  }

  if (elements.tabAqi) {
    elements.tabAqi.classList.toggle('active', !isWeather);
    elements.tabAqi.setAttribute('aria-selected', !isWeather ? 'true' : 'false');
    elements.tabAqi.setAttribute('tabindex', !isWeather ? '0' : '-1');
  }

  if (elements.panelWeather) {
    elements.panelWeather.classList.toggle('hidden', !isWeather);
  }
  if (elements.panelAqi) {
    elements.panelAqi.classList.toggle('hidden', isWeather);
  }

  // If switched to AQI view and data is available, ensure rendered
  if (!isWeather && state.aqiData) {
    renderAirQualityDashboard(state.aqiData, state.currentCity);
  }

  window.scrollTo({ left: 0 });
}

// --- Render Autocomplete Suggestions ---
function renderSearchResults(locations) {
  if (!locations || locations.length === 0) {
    elements.searchResults.innerHTML = '<li class="search-result-item" role="option"><span class="search-result-name">No locations found</span></li>';
    elements.searchResults.classList.remove('hidden');
    return;
  }

  elements.searchResults.innerHTML = locations.map((loc, idx) => {
    const admin = [loc.admin1, loc.country].filter(Boolean).join(', ');
    return `
      <li class="search-result-item ${idx === 0 ? 'highlighted' : ''}" role="option" data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-name="${loc.name}" data-country="${loc.country || ''}" data-admin="${loc.admin1 || ''}">
        <span class="search-result-name">${loc.name}</span>
        <span class="search-result-admin">${admin}</span>
      </li>
    `;
  }).join('');

  elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      soundEngine.playClick('chip');
      if (!item.dataset.lat) return;
      selectLocation({
        name: item.dataset.name,
        country: item.dataset.country,
        admin1: item.dataset.admin,
        latitude: item.dataset.lat,
        longitude: item.dataset.lon
      });
    });
  });

  elements.searchResults.classList.remove('hidden');
}

// --- User Location Detection ---
function detectUserLocation() {
  if (!navigator.geolocation) {
    showStatus('Geolocation is not supported by your browser', true);
    return;
  }

  showStatus('Detecting your location...');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const city = await reverseGeocode(lat, lon);
      hideStatus();
      loadWeatherForCity(city);
    },
    (err) => {
      console.warn('Geolocation failed:', err);
      showStatus('Location access denied. Please search manually.', true);
    },
    { timeout: 8000 }
  );
}

// --- Fetch & Render Weather & Air Quality ---
async function loadWeatherForCity(city) {
  state.currentCity = city;
  showStatus(`Updating atmospheric intelligence for ${city.name}...`);

  try {
    const [weatherData, aqiData] = await Promise.all([
      fetchWeatherData(city.latitude, city.longitude, state.unit),
      fetchAirQualityData(city.latitude, city.longitude).catch(err => {
        console.warn('AQI fetch fallback:', err);
        return null;
      })
    ]);

    state.weatherData = weatherData;
    state.aqiData = aqiData;
    hideStatus();

    // 1. Render Weather Forecast Dashboard
    renderCurrentWeather(weatherData, city);
    renderHourlyForecast(weatherData);
    renderDailyForecast(weatherData);
    renderMetricWidgets(weatherData);

    // 2. Render Air Quality Intelligence Dashboard
    if (aqiData) {
      renderAirQualityDashboard(aqiData, city);
    }

    // 3. Automatically synchronize Three.js 3D animation based on real-time weather
    syncClimateWithWeatherData(weatherData, city);
  } catch (err) {
    console.error('Failed to load climate data:', err);
    showStatus(`Failed to fetch weather: ${err.message}`, true);
  }
}

// --- Automatically drive Three.js 3D scene from Open-Meteo weather data ---
function syncClimateWithWeatherData(data, city) {
  if (!data || !threeScene) return;

  const current = data.current;
  const isDay = current.is_day === 1;
  const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
  const climate = weatherInfo.climate; // 'sunny' | 'rainy' | 'cloudy' | 'night' | 'snow' | 'thunderstorm'
  state.currentClimate = climate;

  // 1. Automatically update Three.js 3D environment
  threeScene.setClimate(climate, isDay);

  // 2. Automatically update dynamic sky gradient theme
  document.body.className = `climate-${climate}`;

  // 3. Update active quick city chip highlight
  elements.cityChips.forEach(chip => {
    const isCurrent = chip.dataset.name.toLowerCase() === city.name.toLowerCase();
    chip.classList.toggle('active', isCurrent);
  });

  // 4. Update brand weather icon
  if (climate === 'sunny') {
    elements.brandIcon.innerHTML = getIcon(isDay ? 'clear-day' : 'clear-night');
  } else if (climate === 'rainy') {
    elements.brandIcon.innerHTML = getIcon('rain');
  } else if (climate === 'cloudy') {
    elements.brandIcon.innerHTML = getIcon('overcast');
  } else if (climate === 'night') {
    elements.brandIcon.innerHTML = getIcon('clear-night');
  } else if (climate === 'snow') {
    elements.brandIcon.innerHTML = getIcon('snow');
  } else if (climate === 'thunderstorm') {
    elements.brandIcon.innerHTML = getIcon('thunderstorm');
  }

  // 5. Automatically synchronize procedural ambient weather soundscape with local time
  let localHour = 12;
  if (current.time && typeof current.time === 'string' && current.time.includes('T')) {
    localHour = parseInt(current.time.split('T')[1].split(':')[0], 10);
  } else if (current.time) {
    localHour = new Date(current.time).getHours();
  }

  soundEngine.setClimate(climate, isDay, localHour, city.name);
  updateSoundButton();
}

// --- Render Main Hero Weather Card ---
function renderCurrentWeather(data, city) {
  const current = data.current;
  const daily = data.daily;
  const timezone = data.timezone;
  const info = getWeatherInfo(current.weather_code, current.is_day);

  // Location & Time
  elements.heroCityName.textContent = city.name;
  elements.heroCountryTag.textContent = city.country || 'Global';
  const heroHeadingCity = document.getElementById('hero-heading-city');
  if (heroHeadingCity) {
    heroHeadingCity.textContent = city.name;
  }

  // Format local time & date accurately
  elements.heroLocalTime.textContent = formatLocalTime(current.time, timezone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  elements.heroLocalDate.textContent = formatLocalTime(current.time, timezone, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Weather Badge & Condition
  elements.heroConditionIcon.innerHTML = getIcon(info.icon);
  elements.heroConditionText.textContent = info.description;

  // Temperature Values
  elements.heroTempVal.textContent = Math.round(current.temperature_2m);
  elements.heroFeelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;

  const high = daily && daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m + 2);
  const low = daily && daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : Math.round(current.temperature_2m - 3);
  elements.heroHighTemp.textContent = `H: ${high}°`;
  elements.heroLowTemp.textContent = `L: ${low}°`;

  // Quick Highlights Strip
  const precipUnit = state.unit === 'fahrenheit' ? 'in' : 'mm';
  const windUnit = state.unit === 'fahrenheit' ? 'mph' : 'km/h';
  elements.heroPrecipVal.textContent = `${(current.precipitation || 0).toFixed(1)} ${precipUnit}`;
  elements.heroWindVal.textContent = `${Math.round(current.wind_speed_10m)} ${windUnit}`;
  elements.heroHumidityVal.textContent = `${current.relative_humidity_2m}%`;
  elements.heroUvVal.textContent = current.uv_index !== undefined ? current.uv_index.toFixed(1) : '--';
}

// --- Render Hourly Forecast ---
function renderHourlyForecast(data) {
  const hourly = data.hourly;
  const timezone = data.timezone;
  if (!hourly || !hourly.time) return;

  const currentTime = data.current.time;
  let currentIndex = hourly.time.findIndex(t => t >= currentTime);
  if (currentIndex === -1) currentIndex = 0;

  // Slice next 24 hours
  const hoursToShow = 24;
  const items = [];

  for (let i = 0; i < hoursToShow; i++) {
    const idx = currentIndex + i;
    if (idx >= hourly.time.length) break;

    const timeStr = hourly.time[idx];
    const temp = Math.round(hourly.temperature_2m[idx]);
    const code = hourly.weather_code[idx];
    const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;

    // Check if day or night using location's true local hour (HH:mm)
    const hourNum = parseInt(timeStr.slice(11, 13), 10);
    const isDay = hourNum >= 6 && hourNum < 19 ? 1 : 0;
    const info = getWeatherInfo(code, isDay);

    const formattedTime = i === 0 ? 'Now' : formatLocalTime(timeStr, timezone, { hour: 'numeric', hour12: true });

    items.push(`
      <div class="hourly-item ${i === 0 ? 'now-item' : ''}">
        <span class="hourly-time">${formattedTime}</span>
        <span class="hourly-icon">${getIcon(info.icon)}</span>
        <span class="hourly-temp">${temp}°</span>
        <span class="hourly-rain">${rainProb > 0 ? `${rainProb}%` : ''}</span>
      </div>
    `);
  }

  elements.hourlyScrollTrack.innerHTML = items.join('');
}

// --- Render 7-Day Forecast ---
function renderDailyForecast(data) {
  const daily = data.daily;
  const timezone = data.timezone;
  if (!daily || !daily.time) return;

  // Find min and max across all days for normalized temperature bar
  let globalMin = Math.min(...daily.temperature_2m_min);
  let globalMax = Math.max(...daily.temperature_2m_max);
  if (globalMax === globalMin) globalMax += 1;

  const rows = daily.time.map((dateStr, idx) => {
    const min = Math.round(daily.temperature_2m_min[idx]);
    const max = Math.round(daily.temperature_2m_max[idx]);
    const code = daily.weather_code[idx];
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0;
    const info = getWeatherInfo(code, 1);

    // Day name (Today or Mon, Tue...)
    const dayName = idx === 0 ? 'Today' : formatLocalTime(dateStr, timezone, { weekday: 'short' });

    // Calculate percentage range for bar (guarantee <= 100% total)
    const leftPct = Math.max(0, Math.min(88, ((min - globalMin) / (globalMax - globalMin)) * 100));
    const rawWidth = ((max - min) / (globalMax - globalMin)) * 100;
    const widthPct = Math.max(10, Math.min(100 - leftPct, rawWidth));

    return `
      <div class="daily-row">
        <span class="daily-day-name">${dayName}</span>
        <span class="daily-icon">${getIcon(info.icon)}</span>
        <span class="daily-condition">${info.description}</span>
        <span class="daily-rain-prob">${rainProb > 10 ? `${rainProb}%` : ''}</span>
        <div class="daily-temp-bar-wrapper">
          <div class="daily-temp-bar-fill" style="left: ${leftPct.toFixed(1)}%; width: ${widthPct.toFixed(1)}%;"></div>
        </div>
        <div class="daily-temp-min-max">
          <span class="daily-min">${min}°</span>
          <span class="daily-max">${max}°</span>
        </div>
      </div>
    `;
  });

  elements.dailyForecastList.innerHTML = rows.join('');
}

// --- Render Secondary Metric Widgets ---
function renderMetricWidgets(data) {
  const current = data.current;
  const daily = data.daily;
  const timezone = data.timezone;
  const windUnit = state.unit === 'fahrenheit' ? 'mph' : 'km/h';

  // 1. Wind & Compass
  elements.metricWindSpeed.textContent = Math.round(current.wind_speed_10m);
  elements.metricWindUnit.textContent = windUnit;
  const windDeg = current.wind_direction_10m ?? 0;
  const cardinal = getWindDirection(windDeg);
  elements.metricWindDirText.textContent = `${cardinal} · ${windDeg}°`;
  // Rotate compass needle smoothly via CSS & SVG attribute
  elements.compassNeedle.style.transform = `rotate(${windDeg}deg)`;
  elements.compassNeedle.setAttribute('transform', `rotate(${windDeg} 80 80)`);

  const maxWind = daily && daily.wind_speed_10m_max ? Math.round(daily.wind_speed_10m_max[0]) : Math.round(current.wind_speed_10m * 1.3);
  elements.metricWindFooter.textContent = `Wind gusts up to ${maxWind} ${windUnit}`;

  // 2. UV Index
  const uvVal = current.uv_index !== undefined ? current.uv_index : 0;
  elements.metricUvVal.textContent = uvVal.toFixed(1);
  const uvInfo = getUvCategory(uvVal);
  elements.metricUvPill.textContent = uvInfo.level;
  elements.metricUvPill.style.color = uvInfo.color;
  elements.metricUvPill.style.background = `${uvInfo.color}22`;
  elements.metricUvPill.style.borderColor = `${uvInfo.color}55`;
  elements.metricUvBar.style.width = `${Math.min(100, (uvVal / 11) * 100)}%`;
  elements.metricUvAdvice.textContent = uvInfo.advice;

  // 3. Humidity & Accurate Dew Point
  const rh = current.relative_humidity_2m;
  elements.metricHumidityVal.textContent = rh;
  elements.metricHumidityBar.style.width = `${rh}%`;

  // Dew point approximation adapted for Celsius and Fahrenheit
  const dewPoint = state.unit === 'fahrenheit'
    ? Math.round(current.temperature_2m - ((100 - rh) * 0.36))
    : Math.round(current.temperature_2m - ((100 - rh) / 5));

  let humidityComfort = 'Comfortable moisture levels';
  if (rh > 75) humidityComfort = 'Very humid and muggy';
  else if (rh < 30) humidityComfort = 'Dry air; stay hydrated';
  elements.metricHumidityFooter.textContent = `Dew point is ${dewPoint}° · ${humidityComfort}`;

  // 4. Sun Cycle & Celestial Arc
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseStr = daily.sunrise[0];
    const sunsetStr = daily.sunset[0];

    elements.metricSunriseVal.textContent = formatLocalTime(sunriseStr, timezone, { hour: '2-digit', minute: '2-digit', hour12: true });
    elements.metricSunsetVal.textContent = formatLocalTime(sunsetStr, timezone, { hour: '2-digit', minute: '2-digit', hour12: true });

    // Calculate sun position progress using UTC-normalized timestamps
    const now = new Date(`${current.time}Z`).getTime();
    const rise = new Date(`${sunriseStr}Z`).getTime();
    const set = new Date(`${sunsetStr}Z`).getTime();

    if (now >= rise && now <= set) {
      const progress = Math.max(0, Math.min(1, (now - rise) / (set - rise))); // 0 to 1
      const angle = Math.PI * (1 - progress); // PI to 0
      const x = 50 + 40 * Math.cos(angle);
      const y = 40 - 30 * Math.sin(angle);

      elements.sunArcDot.setAttribute('cx', x.toFixed(1));
      elements.sunArcDot.setAttribute('cy', y.toFixed(1));
      elements.sunArcDot.setAttribute('fill', 'var(--jupiter-coral)');

      // Update progress path
      elements.sunArcProgress.setAttribute('d', `M 10 40 A 40 30 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`);

      const remainingHours = Math.max(0, ((set - now) / 3600000)).toFixed(1);
      elements.metricSunFooter.textContent = `${remainingHours} hrs of daylight remaining`;
    } else if (now < rise) {
      // Pre-dawn / before sunrise
      elements.sunArcDot.setAttribute('cx', '10');
      elements.sunArcDot.setAttribute('cy', '40');
      elements.sunArcDot.setAttribute('fill', '#94a3b8');
      elements.sunArcProgress.setAttribute('d', 'M 10 40 A 40 30 0 0 1 10 40');
      const hoursToSunrise = Math.max(0, ((rise - now) / 3600000)).toFixed(1);
      elements.metricSunFooter.textContent = `Sunrise in ${hoursToSunrise} hrs`;
    } else {
      // Night time / after sunset
      elements.sunArcDot.setAttribute('cx', '90');
      elements.sunArcDot.setAttribute('cy', '40');
      elements.sunArcDot.setAttribute('fill', '#64748b');
      elements.sunArcProgress.setAttribute('d', 'M 10 40 A 40 30 0 0 1 90 40');
      const hoursSinceSunset = Math.max(0, ((now - set) / 3600000)).toFixed(1);
      elements.metricSunFooter.textContent = `Sunset was ${hoursSinceSunset} hrs ago`;
    }
  }

  // 5. Pressure & Clouds
  elements.metricPressureVal.textContent = Math.round(current.pressure_msl);
  elements.metricCloudsVal.textContent = current.cloud_cover;
  let pressureStatus = 'Normal atmospheric pressure';
  if (current.pressure_msl > 1022) pressureStatus = 'High pressure system · Stable skies';
  else if (current.pressure_msl < 1008) pressureStatus = 'Low pressure system · Weather fronts';
  elements.metricPressureFooter.textContent = pressureStatus;
}

// --- Render Air Quality Dashboard (AQI Tab) ---
function renderAirQualityDashboard(data, city) {
  if (!data || !data.current) return;
  const current = data.current;
  const timezone = data.timezone;
  const usAqi = Math.round(current.us_aqi ?? 0);
  const eaqi = Math.round(current.european_aqi ?? 0);

  const aqiInfo = getAqiCategory(usAqi);
  const eaqiInfo = getEaqiCategory(eaqi);

  // 1. Location & Local Time
  if (elements.aqiCityName) elements.aqiCityName.textContent = city.name;
  if (elements.aqiCountryTag) elements.aqiCountryTag.textContent = city.country || 'Global';
  if (elements.aqiHeadingCity) elements.aqiHeadingCity.textContent = city.name;
  if (elements.aqiHeroStatusWord) {
    elements.aqiHeroStatusWord.textContent = aqiInfo.level;
    elements.aqiHeroStatusWord.style.color = aqiInfo.color;
  }

  if (elements.aqiLocalTime) {
    elements.aqiLocalTime.textContent = formatLocalTime(current.time, timezone, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  if (elements.aqiLocalDate) {
    elements.aqiLocalDate.textContent = formatLocalTime(current.time, timezone, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // 2. Weather/AQI Badge
  if (elements.aqiConditionText) elements.aqiConditionText.textContent = aqiInfo.level;
  if (elements.aqiHeroBadge) {
    elements.aqiHeroBadge.style.color = aqiInfo.color;
    elements.aqiHeroBadge.style.background = aqiInfo.bg;
    elements.aqiHeroBadge.style.borderColor = aqiInfo.border;
  }

  // 3. Radial Arc Gauge Animation & Numeric Display
  if (elements.aqiGaugeVal) elements.aqiGaugeVal.textContent = usAqi;
  if (elements.aqiGaugePill) {
    elements.aqiGaugePill.textContent = aqiInfo.level;
    elements.aqiGaugePill.style.color = aqiInfo.color;
    elements.aqiGaugePill.style.background = aqiInfo.bg;
    elements.aqiGaugePill.style.borderColor = aqiInfo.border;
  }

  // Total gauge path arc length is approx 264
  // Map AQI 0 -> 300 to stroke-dashoffset 264 -> 0
  if (elements.aqiGaugeProgress) {
    const progressRatio = Math.min(1, Math.max(0, usAqi / 300));
    const offset = 264 * (1 - progressRatio);
    elements.aqiGaugeProgress.style.strokeDashoffset = offset.toFixed(1);
    elements.aqiGaugeProgress.style.stroke = aqiInfo.color;
  }

  // 4. Standards and Narrative
  if (elements.aqiEpaVal) elements.aqiEpaVal.textContent = `${usAqi} / 500`;
  if (elements.aqiEaqiVal) elements.aqiEaqiVal.textContent = `${eaqi} · ${eaqiInfo.level}`;

  // Find dominant pollutant by highest ratio against WHO guidelines
  const candidatePollutants = [
    { key: 'pm2_5', symbol: 'PM2.5', val: current.pm2_5, standard: 15 },
    { key: 'pm10', symbol: 'PM10', val: current.pm10, standard: 45 },
    { key: 'nitrogen_dioxide', symbol: 'NO₂', val: current.nitrogen_dioxide, standard: 25 },
    { key: 'ozone', symbol: 'O₃', val: current.ozone, standard: 100 },
    { key: 'sulphur_dioxide', symbol: 'SO₂', val: current.sulphur_dioxide, standard: 40 }
  ];
  let dominant = candidatePollutants[0];
  let maxRatio = -1;
  candidatePollutants.forEach(p => {
    if (p.val !== undefined && p.val !== null) {
      const ratio = p.val / p.standard;
      if (ratio > maxRatio) {
        maxRatio = ratio;
        dominant = p;
      }
    }
  });

  const domVal = dominant.val !== undefined ? Number(dominant.val).toFixed(1) : '--';
  if (elements.aqiDominantPollutant) {
    elements.aqiDominantPollutant.textContent = `${dominant.symbol} (${domVal} µg/m³)`;
  }
  if (elements.aqiNarrativeText) {
    elements.aqiNarrativeText.textContent = aqiInfo.summary;
  }

  // 5. Health Advisories
  if (elements.advTextExercise) elements.advTextExercise.textContent = aqiInfo.exercise;
  if (elements.advTextMask) elements.advTextMask.textContent = aqiInfo.mask;
  if (elements.advTextVentilation) elements.advTextVentilation.textContent = aqiInfo.ventilation;
  if (elements.advTextPurifier) elements.advTextPurifier.textContent = aqiInfo.purifier;

  // 6. Update Tab Badge & Weather Hero AQI Shortcut
  if (elements.tabAqiBadge) {
    elements.tabAqiBadge.textContent = `AQI ${usAqi}`;
    elements.tabAqiBadge.style.color = aqiInfo.color;
    elements.tabAqiBadge.style.background = aqiInfo.bg;
    elements.tabAqiBadge.style.borderColor = aqiInfo.border;
  }

  if (elements.heroAqiVal) {
    elements.heroAqiVal.textContent = `${usAqi}`;
    elements.heroAqiVal.style.color = aqiInfo.color;
  }
  if (elements.heroAqiTag) {
    elements.heroAqiTag.textContent = `${aqiInfo.shortLevel} →`;
    elements.heroAqiTag.style.color = aqiInfo.color;
  }

  // 7. Render 24-Hour Hourly AQI Timeline
  renderHourlyAqiForecast(data);

  // 8. Render Key Pollutants Grid
  renderPollutantsGrid(data);

  // 9. Highlight Active Tier on Scale Card
  highlightActiveScaleTier(aqiInfo.tier);
}

// --- Render 24-Hour Hourly AQI Forecast ---
function renderHourlyAqiForecast(data) {
  const hourly = data.hourly;
  const timezone = data.timezone;
  if (!hourly || !hourly.time || !elements.hourlyAqiScrollTrack) return;

  const currentTime = data.current.time;
  let currentIndex = hourly.time.findIndex(t => t >= currentTime);
  if (currentIndex === -1) currentIndex = 0;

  const hoursToShow = 24;
  const items = [];

  for (let i = 0; i < hoursToShow; i++) {
    const idx = currentIndex + i;
    if (idx >= hourly.time.length) break;

    const timeStr = hourly.time[idx];
    const aqi = Math.round(hourly.us_aqi ? hourly.us_aqi[idx] : 0);
    const pm25 = hourly.pm2_5 ? Number(hourly.pm2_5[idx]).toFixed(1) : '--';
    const cat = getAqiCategory(aqi);

    const formattedTime = i === 0 ? 'Now' : formatLocalTime(timeStr, timezone, { hour: 'numeric', hour12: true });

    items.push(`
      <div class="hourly-item aqi-hourly-item ${i === 0 ? 'now-item' : ''}">
        <span class="hourly-time">${formattedTime}</span>
        <div class="hourly-aqi-pill" style="background: ${cat.bg}; color: ${cat.color}; border: 1px solid ${cat.border};">
          AQI ${aqi}
        </div>
        <span class="hourly-aqi-label">${cat.shortLevel}</span>
        <span class="hourly-pm25-val">${pm25} µg/m³</span>
      </div>
    `);
  }

  elements.hourlyAqiScrollTrack.innerHTML = items.join('');
}

// --- Render 6 Key Pollutants Breakdown ---
function renderPollutantsGrid(data) {
  if (!elements.pollutantsContainer || !data.current) return;
  const current = data.current;

  const pollutantKeys = ['pm2_5', 'pm10', 'nitrogen_dioxide', 'ozone', 'carbon_monoxide', 'sulphur_dioxide'];

  const html = pollutantKeys.map(key => {
    const meta = POLLUTANTS_INFO[key];
    const rawVal = current[key];
    const displayVal = rawVal !== undefined && rawVal !== null ? Number(rawVal).toFixed(1) : '--';
    const status = getPollutantStatus(key, rawVal);

    return `
      <div class="pollutant-card">
        <div class="pollutant-card-header">
          <div class="pollutant-titles">
            <span class="pollutant-symbol">${meta.symbol}</span>
            <span class="pollutant-name">${meta.name}</span>
          </div>
          <span class="pollutant-pill" style="color: ${status.color}; background: ${status.color}22; border: 1px solid ${status.color}55;">
            ${status.level}
          </span>
        </div>
        <div class="pollutant-val-row">
          <span class="pollutant-number">${displayVal}</span>
          <span class="pollutant-unit">${meta.unit}</span>
        </div>
        <div class="pollutant-bar-track">
          <div class="pollutant-bar-fill" style="width: ${status.progressPct}%; background: ${status.color};"></div>
        </div>
        <div class="pollutant-card-footer">
          <span class="pollutant-sub">${meta.sub}</span>
          <span class="pollutant-ratio">${status.ratioText}</span>
        </div>
      </div>
    `;
  }).join('');

  elements.pollutantsContainer.innerHTML = html;
}

// --- Highlight Active Tier in AQI Scale Guide ---
function highlightActiveScaleTier(activeTier) {
  if (!elements.aqiScaleTiers) return;
  const rows = elements.aqiScaleTiers.querySelectorAll('.scale-tier-row');
  rows.forEach(row => {
    const tier = parseInt(row.dataset.tier, 10);
    const isActive = tier === activeTier;
    row.classList.toggle('active-tier', isActive);
  });
}

// --- Ambient Weather Sound Button State Update ---
function updateSoundButton() {
  if (!elements.soundToggleBtn) return;
  const isEnabled = soundEngine.isAmbientEnabled;
  if (elements.soundIconBox) {
    elements.soundIconBox.innerHTML = getIcon(isEnabled ? 'volume' : 'volume-x');
  }
  if (elements.soundText) {
    elements.soundText.textContent = isEnabled ? 'Sound: ON' : 'Sound: OFF';
  }
  elements.soundToggleBtn.classList.toggle('sound-active', isEnabled);
  elements.soundToggleBtn.setAttribute('aria-pressed', isEnabled.toString());
  const desc = soundEngine.getSoundscapeDescription();
  elements.soundToggleBtn.title = isEnabled ? `Ambient Sound: ON (${desc})` : 'Enable Ambient Weather Sound';
}

// --- Visual Dynamic Screen Lightning Flash Effect ---
function triggerLightningFlashEffect(strikeInfo = {}) {
  const overlay = document.getElementById('lightning-flash-overlay');
  if (!overlay) return;

  const isClose = strikeInfo.isClose !== undefined ? strikeInfo.isClose : true;

  // Strobe 1: instantaneous high-voltage flash
  overlay.classList.add(isClose ? 'flash-strobe-1' : 'flash-strobe-2');
  setTimeout(() => {
    overlay.classList.remove('flash-strobe-1', 'flash-strobe-2');
    // Strobe 2: secondary cloud-to-ground return stroke
    setTimeout(() => {
      overlay.classList.add('flash-strobe-2');
      setTimeout(() => {
        overlay.classList.remove('flash-strobe-2');
        overlay.classList.add('flash-fade');
        setTimeout(() => {
          overlay.classList.remove('flash-fade');
        }, 340);
      }, 70);
    }, 40);
  }, 40);
}

// --- Unit Button State Update ---
function updateUnitButtons() {
  const units = elements.unitToggleBtn.querySelectorAll('.unit-text');
  units.forEach(u => {
    u.classList.toggle('active', u.dataset.unit === state.unit);
  });
}

// --- Status Banner Helper ---
function showStatus(message, isError = false) {
  elements.statusBanner.textContent = message;
  elements.statusBanner.classList.remove('hidden');
  elements.statusBanner.style.background = isError ? 'rgba(239, 68, 68, 0.25)' : 'rgba(252, 122, 105, 0.2)';
  elements.statusBanner.style.borderColor = isError ? 'rgba(239, 68, 68, 0.45)' : 'rgba(252, 122, 105, 0.45)';
}

function hideStatus() {
  elements.statusBanner.classList.add('hidden');
}

// Start App when DOM is loaded
window.addEventListener('DOMContentLoaded', initApp);


