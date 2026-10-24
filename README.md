# ⚡ AstraWeather

> **A real-time 3D atmospheric weather forecast and air quality dashboard with procedural Web Audio soundscapes and physics-based lightning synchronization.**

Crafted by **Tajeshwar Singh**

---

## ✨ Features

### 🌌 1. Three.js Procedural 3D Atmosphere
- **Dynamic Climate Rendering**:
  - **Radiant Sun**: Volumetric corona pulses, rotating light rays, and floating golden motes.
  - **Procedural Clouds**: Soft organic cumulus clouds drifting across the sky.
  - **Rain & Splashes**: Dynamic rain streaks falling with animated ground ripple splashes.
  - **Winter Snow**: Gentle floating snowflakes with realistic wind sway.
  - **Night Sky**: Procedural multi-starfield with twinkling star point particles and glowing lunar crescent.
- **High-Voltage Lightning Bolts**:
  - Procedurally generated jagged main strike bolts and branching fork branches.
  - Multi-stage strobe discharge illuminating clouds and rain streaks with real-time point lighting.
  - Full-screen atmospheric flash overlay with speed-of-light illumination.
- **Interactive 3D Parallax**:
  - Mouse movement parallax on desktop.
  - Hardware **gyroscope / deviceorientation** camera tilt parallax on mobile devices.

---

### 🔊 2. 100% Procedural Web Audio Sound Engine
*Zero external audio files or MP3 downloads — synthesized entirely in real-time via the Web Audio API.*

- **Heavy Rain & Downpour**: Dual-filtered pink noise bed (1,350 Hz bandpass + 3,000 Hz lowpass) capturing driving sheets of rain.
- **Surface Droplet Spatter**: High-density stochastic droplet pings (1,000 Hz – 2,400 Hz) hitting glass, leaves, and pavement.
- **Storm Gale Winds**: 0.20 Hz LFO-modulated resonant bandpass filter creating sweeping atmospheric gusts.
- **Barometric Pressure Drone**: Continuous 54 Hz & 88 Hz sub-bass sine waves capturing deep storm atmospheric pressure.
- **Speed-of-Sound Synchronized Thunder**:
  - Physical delay ($0.15\text{s} - 0.85\text{s}$) calculated from 3D distance between the camera and the lightning bolt coordinates.
  - Close strikes trigger high-voltage ionization snaps (850 Hz bandpass) and acoustic cracks (90 Hz $\rightarrow$ 30 Hz transient).
  - Distant strikes swell into a 5-second resonant sub-bass rolling rumble with secondary cloud-layer reverberation waves.
- **Time-of-Day Environmental Soundscapes**:
  - **Early Morning (5:00 AM – 9:59 AM)**: Dawn songbirds and chirping chorus (silenced during rain and severe storms).
  - **Afternoon (12:00 PM – 5:59 PM)**: Distant city traffic ambience with tire hum and gentle acoustic double-tap horns.
- **Tactile UI Audio Feedback**: Subtle micro-clicks for buttons, tonal chimes for search, and resonant pops for city chips.

---

### 🌤️ 3. Comprehensive Weather & Air Quality (AQI) Dashboard
- **Real-Time Weather Metrics**:
  - Current temperature, apparent ("feels like") temperature, and WMO condition descriptors.
  - Wind speed & direction, UV Index, relative humidity, atmospheric pressure, and sunrise/sunset times.
  - 24-hour hourly scroll track with temperature progression and condition icons.
  - 7-day daily forecast with high/low temperature bars.
- **Air Quality Index (AQI) & Pollutants**:
  - European EAQI standard rating with dynamic color badges (Good, Fair, Moderate, Poor, Very Poor, Hazardous).
  - 6-Pollutant breakdown: $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{O}_3$, $\text{SO}_2$, and $\text{CO}$.
  - Contextual health advisory recommendations for outdoor exercise, sensitive groups, window ventilation, and air purifiers.
  - 24-hour hourly AQI trend forecast track and AQI reference scale guide.

---

### 🎨 4. Design & Interaction
- **Liquid Glassmorphism**: Ultra-sleek frosted backdrop filters, soft gradients, and modern typography (Outfit / Inter).
- **Responsive Layout**: Designed for seamless viewing across mobile, tablet, and ultra-wide desktop screens.
- **Global Search & Geolocation**: Instant autocomplete search across worldwide cities with GPS geolocation support.
- **Instant Unit Toggle**: One-tap toggle between Celsius (°C) and Fahrenheit (°F).
- **Interactive Strike Trigger**: Click the main hero weather condition icon to summon a synchronized lightning bolt and thunderclap on demand.

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or higher recommended).

### 1. Clone the repository
```bash
git clone https://github.com/your-username/astraweather.git
cd astraweather
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

### 4. Build for production
```bash
npm run build
```
The optimized static build will be generated in the `dist/` directory.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Vanilla JavaScript (ES Modules)** | Clean, dependency-free core application logic |
| **Three.js** | 3D procedural weather particle systems, lighting & lightning bolts |
| **Web Audio API** | Real-time procedural soundscape synthesis and audio filters |
| **Vanilla CSS** | Modern liquid glassmorphism, responsive CSS variables, and layout |
| **Open-Meteo API** | Free, open-source weather, geocoding & air quality data (no API key required) |
| **Vite** | Blazing-fast development and production bundling |

---

## 🌐 APIs Used
All data is sourced from free and open APIs with **no API keys or authentication required**:
- [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
- [Open-Meteo Geocoding Search API](https://open-meteo.com/en/docs/geocoding-api)
- [BigDataCloud Reverse Geocoding API](https://www.bigdatacloud.com/)

---

## 🚢 Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com/) and import your repository.
3. Vercel will automatically detect Vite (`npm run build`, output: `dist`). Click **Deploy**.

### Deploy to Netlify
1. Go to [netlify.com](https://www.netlify.com/) and click **Add new site** > **Import an existing project**.
2. Connect your GitHub repository.
3. Build command: `npm run build` | Publish directory: `dist`. Click **Deploy**.

### Deploy to GitHub Pages
1. In `vite.config.js`, add `base: '/<repository-name>/'`.
2. Build the project: `npm run build`.
3. Use `gh-pages` or GitHub Actions to publish the `dist/` folder.

---

## 👤 Author

**Tajeshwar Singh**
- Built with ❤️ and passion for creative web design, procedural audio, and 3D graphics.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
