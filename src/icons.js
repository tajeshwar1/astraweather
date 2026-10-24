/**
 * Crisp SVG Weather & UI Icons
 * Scalable, lightweight vector graphics with modern styling
 */

export const ICONS = {
  'clear-day': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg icon-sun">
      <circle cx="12" cy="12" r="4" fill="#fbbf24" stroke="#f59e0b"/>
      <path d="M12 2v2" stroke="#fbbf24"/>
      <path d="M12 20v2" stroke="#fbbf24"/>
      <path d="m4.93 4.93 1.41 1.41" stroke="#fbbf24"/>
      <path d="m17.66 17.66 1.41 1.41" stroke="#fbbf24"/>
      <path d="M2 12h2" stroke="#fbbf24"/>
      <path d="M20 12h2" stroke="#fbbf24"/>
      <path d="m6.34 17.66-1.41 1.41" stroke="#fbbf24"/>
      <path d="m19.07 4.93-1.41 1.41" stroke="#fbbf24"/>
    </svg>`,

  'clear-night': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg icon-moon">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#93c5fd" stroke="#60a5fa"/>
      <circle cx="19" cy="5" r="1" fill="#fff" stroke="none"/>
      <circle cx="21" cy="9" r="0.7" fill="#fff" stroke="none"/>
    </svg>`,

  'partly-cloudy-day': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <circle cx="10" cy="9" r="3.2" fill="#fbbf24" stroke="#f59e0b"/>
      <path d="M10 2v1.5M10 14.5v1.5M4 9h1.5M15.5 9H17M5.7 4.7l1.1 1.1M13.2 12.2l1.1 1.1M5.7 13.3l1.1-1.1M13.2 5.8l1.1-1.1" stroke="#fbbf24"/>
      <path d="M17.5 19H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" fill="#e2e8f0" stroke="#94a3b8"/>
    </svg>`,

  'partly-cloudy-night': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M10 4a4.5 4.5 0 0 0 6.5 6.5 6 6 0 1 1-6.5-6.5Z" fill="#93c5fd" stroke="#60a5fa"/>
      <path d="M17.5 19H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" fill="#cbd5e1" stroke="#64748b"/>
    </svg>`,

  'overcast': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 19H7a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 2.2 7.5Z" fill="#cbd5e1" stroke="#94a3b8"/>
    </svg>`,

  'fog': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M4 14h16M2 18h20M6 10h12" stroke="#94a3b8"/>
    </svg>`,

  'drizzle': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 15H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" fill="#cbd5e1" stroke="#94a3b8"/>
      <path d="m8 19-1 2M12 19l-1 2M16 19l-1 2" stroke="#60a5fa"/>
    </svg>`,

  'rain': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 14H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" fill="#94a3b8" stroke="#64748b"/>
      <path d="m9 17-2 4M13 17l-2 4M17 17l-2 4" stroke="#38bdf8" stroke-width="2.2"/>
    </svg>`,

  'heavy-rain': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 13H8a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 1.2 7.5Z" fill="#64748b" stroke="#475569"/>
      <path d="m8 16-2 5M12 16l-2 5M16 16l-2 5M20 16l-2 5" stroke="#0ea5e9" stroke-width="2.4"/>
    </svg>`,

  'thunderstorm': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 13H8a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 1.2 7.5Z" fill="#475569" stroke="#334155"/>
      <path d="m13 13-3 5h4l-2 5" fill="#facc15" stroke="#eab308" stroke-linejoin="round"/>
    </svg>`,

  'snow': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 14H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" fill="#cbd5e1" stroke="#94a3b8"/>
      <path d="M8 18h.01M12 18h.01M16 18h.01M10 21h.01M14 21h.01" stroke="#e0f2fe" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

  'sleet': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M17.5 14H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" fill="#94a3b8" stroke="#64748b"/>
      <path d="m9 17-1 3M15 17-1 3" stroke="#38bdf8"/>
      <circle cx="12" cy="19" r="1" fill="#e0f2fe"/>
    </svg>`,

  'wind': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>
    </svg>`,

  'compass': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#38bdf8"/>
    </svg>`,

  'droplet': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8"/>
    </svg>`,

  'uv': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`,

  'sunrise': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v6M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0" stroke="#f59e0b"/>
    </svg>`,

  'sunset': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 10V4M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 6l-4 4-4-4M16 18a4 4 0 0 0-8 0" stroke="#f97316"/>
    </svg>`,

  'pressure': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" stroke="#818cf8"/>
      <path d="m14 10-4 4M12 6v2M6 12h2M16 12h2" stroke="#818cf8"/>
    </svg>`,

  'cloud-cover': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.5 19H9a5 5 0 0 1-.5-9.97 4.5 4.5 0 0 1 8.8 1.47 3.5 3.5 0 0 1 .2 7.5Z" stroke="#94a3b8"/>
    </svg>`,

  'search': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>`,

  'location': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>`,

  'eye': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,

  'eye-off': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>
    </svg>`,

  'leaf': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-icon-svg">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#10b981"/>
    </svg>`,

  'mask': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 11a7 7 0 0 1 16 0v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8"/>
      <path d="M4 12c-2 0-3-1-3-3s1-3 3-3M20 12c2 0 3-1 3-3s-1-3-3-3" stroke="#94a3b8"/>
      <path d="M9 13h6M10 16h4" stroke="#e2e8f0"/>
    </svg>`,

  'activity': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#f59e0b"/>
    </svg>`,

  'purifier': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.8 16.4a6 6 0 0 1-8.6-7l5.4 1.4a2 2 0 0 0 2.4-1.4L11.5 4a6 6 0 0 1 11.1 1.4l-4.5 3.5a2 2 0 0 0-.7 2.7l2.8 5a6 6 0 0 1-9.4 3.8Z" stroke="#818cf8"/>
      <circle cx="12" cy="12" r="2" fill="#818cf8"/>
    </svg>`,

  'window': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#38bdf8"/>
      <line x1="12" y1="3" x2="12" y2="21" stroke="#38bdf8"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke="#38bdf8"/>
    </svg>`,

  'particles': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="6" r="2" fill="#FC7A69" stroke="#FC7A69"/>
      <circle cx="18" cy="8" r="2.5" fill="#f59e0b" stroke="#f59e0b"/>
      <circle cx="12" cy="14" r="3" fill="#818cf8" stroke="#818cf8"/>
      <circle cx="19" cy="18" r="1.5" fill="#38bdf8" stroke="#38bdf8"/>
      <circle cx="6" cy="18" r="2" fill="#10b981" stroke="#10b981"/>
    </svg>`,

  'shield-check': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981"/>
      <path d="m9 12 2 2 4-4" stroke="#10b981"/>
    </svg>`,

  'volume': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(252, 122, 105, 0.25)" stroke="var(--jupiter-coral)"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="var(--jupiter-coral)"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="var(--jupiter-coral)"/>
    </svg>`,

  'volume-x': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(255, 255, 255, 0.08)"/>
      <line x1="23" y1="9" x2="17" y2="15" stroke="#94a3b8"/>
      <line x1="17" y1="9" x2="23" y2="15" stroke="#94a3b8"/>
    </svg>`
};

export function getIcon(name) {
  return ICONS[name] || ICONS['overcast'];
}

