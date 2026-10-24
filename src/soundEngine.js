/**
 * AstraWeather Procedural Web Audio Engine
 * Real-time sound synthesis for tactile UI button feedback & organic atmospheric weather soundscapes.
 * 100% self-contained Web Audio API with zero external media files.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.uiGain = null;
    this.noiseBuffer = null;

    // Load persisted ambient sound preference (default false for polite browser audio policy)
    const stored = localStorage.getItem('astra_ambient_sound') || localStorage.getItem('aether_ambient_sound');
    this.isAmbientEnabled = stored === 'true';

    this.currentClimate = null;
    this.isDay = true;
    this.localHour = null;
    this.cityName = '';

    // Active ambient audio nodes & timers
    this.activeAmbientSources = [];
    this.ambientTimers = [];

    // Register user interaction listener to wake up AudioContext
    this._handleFirstGesture = this._handleFirstGesture.bind(this);
    window.addEventListener('click', this._handleFirstGesture, { once: true });
    window.addEventListener('touchstart', this._handleFirstGesture, { once: true });
    window.addEventListener('keydown', this._handleFirstGesture, { once: true });
  }

  /**
   * Lazily initialize AudioContext on user gesture
   */
  _ensureContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // UI button sound bus
      this.uiGain = this.ctx.createGain();
      this.uiGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.uiGain.connect(this.masterGain);

      // Ambient weather soundscape bus
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isAmbientEnabled ? 0.35 : 0.0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Pre-compute 5 seconds of organic pink noise
      this._generatePinkNoiseBuffer();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  _handleFirstGesture() {
    this._ensureContext();
    if (this.currentClimate && this.isAmbientEnabled) {
      this.setClimate(this.currentClimate, this.isDay, this.localHour, this.cityName);
    }
  }

  /**
   * Generates a 5-second seamless looped pink noise audio buffer
   */
  _generatePinkNoiseBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 5;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const output = this.noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  // =========================================================================
  // UI Button Sounds (Tactile Micro-Haptics)
  // =========================================================================

  /**
   * Play short, satisfying, premium tactile audio feedback for UI buttons
   * @param {'click' | 'tab' | 'chip' | 'toggle'} type 
   */
  playClick(type = 'click') {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'tab') {
      // Liquid glass tab chime: harmonic dual sine (587Hz & 1174Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.frequency.setValueAtTime(1174.66, now); // D6
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.uiGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.08);
      osc2.stop(now + 0.08);
    } else if (type === 'chip') {
      // Soft ambient droplet pop for city chips (780Hz -> 1040Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.uiGain);

      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === 'toggle') {
      // Crisp toggle switch tone (800Hz / 1200Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.setValueAtTime(1240, now + 0.02);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.uiGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Standard tactile micro-click (1600Hz -> 450Hz in 25ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.025);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      osc.connect(gain);
      gain.connect(this.uiGain);

      osc.start(now);
      osc.stop(now + 0.028);
    }
  }

  // =========================================================================
  // Procedural Weather Soundscape Synthesis
  // =========================================================================

  /**
   * Update the ambient weather soundscape based on city climate, day/night & local hour
   * @param {'sunny' | 'rainy' | 'cloudy' | 'night' | 'snow'} climate 
   * @param {boolean} isDay 
   * @param {number | null} localHour 0-23
   * @param {string} cityName
   */
  setClimate(climate, isDay = true, localHour = null, cityName = '') {
    this.currentClimate = climate;
    this.isDay = isDay;
    if (localHour !== null && localHour !== undefined) {
      this.localHour = localHour;
    }
    if (cityName) {
      this.cityName = cityName;
    }

    const ctx = this._ensureContext();
    if (!ctx) return;

    // Clear old ambient sources & intervals
    this._stopAmbientSources();

    if (!this.isAmbientEnabled) {
      return;
    }

    // Smoothly fade in new climate soundscape
    const now = ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setTargetAtTime(0.35, now, 0.8);

    // 1. Base climate atmospheric environment
    if (climate === 'thunderstorm') {
      this._createThunderstormSoundscape();
    } else if (climate === 'rainy') {
      this._createRainSoundscape();
    } else if (climate === 'sunny') {
      this._createSunnySoundscape(isDay);
    } else if (climate === 'night') {
      this._createNightSoundscape();
    } else if (climate === 'snow') {
      this._createSnowSoundscape();
    } else {
      // 'cloudy' / overcast
      this._createCloudySoundscape();
    }

    // 2. Time-of-Day environmental soundscapes:
    // - Early Morning: 5:00 AM - 9:59 AM (Songbirds silenced during rain and severe storms)
    // - Afternoon: 12:00 PM - 5:59 PM (Light city traffic noise & rolling tires)
    const hour = this.localHour !== null ? this.localHour : (isDay ? 14 : 23);
    if (climate !== 'thunderstorm' && climate !== 'rainy') {
      if (hour >= 5 && hour < 10) {
        this._createEarlyMorningSoundscape();
      }
    }
    if (climate !== 'thunderstorm') {
      if (hour >= 12 && hour < 18) {
        this._createAfternoonTrafficSoundscape();
      }
    }
  }

  /**
   * Cleanly stop all active ambient oscillators, buffers & timers
   */
  _stopAmbientSources() {
    this.ambientTimers.forEach(id => clearInterval(id));
    this.ambientTimers = [];

    this.activeAmbientSources.forEach(src => {
      try {
        if (src.stop) src.stop();
        if (src.disconnect) src.disconnect();
      } catch (e) {}
    });
    this.activeAmbientSources = [];
  }

  /**
   * Public method: Synthesizes physical rolling thunder synchronized with visual lightning
   * @param {number} delaySeconds Speed-of-sound physics delay between flash and thunder
   * @param {object} options Strike acoustics options: { intensity, isClose, distance }
   */
  triggerThunder(delaySeconds = 0.4, options = {}) {
    if (!this.isAmbientEnabled) return;
    const ctx = this._ensureContext();
    if (!ctx || ctx.state !== 'running' || !this.noiseBuffer) return;

    this.lastThunderTime = Date.now();
    const t = ctx.currentTime + Math.max(0.04, delaySeconds);
    const intensity = options.intensity !== undefined ? options.intensity : 1.0;
    const isClose = options.isClose !== undefined ? options.isClose : (delaySeconds < 0.45);

    // 1. Initial High-Voltage Acoustic Crack / Snap (Lightning Ionization Pulse)
    if (isClose) {
      const snapNoise = ctx.createBufferSource();
      snapNoise.buffer = this.noiseBuffer;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(850, t);
      snapFilter.Q.setValueAtTime(2.0, t);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.0001, t);
      snapGain.gain.linearRampToValueAtTime(0.32 * intensity, t + 0.008);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

      snapNoise.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ambientGain);

      snapNoise.start(t);
      snapNoise.stop(t + 0.08);
    }

    // 2. Visceral Acoustic Crack Pulse (Fast pitch-dropping oscillator)
    const crackOsc = ctx.createOscillator();
    const crackFilter = ctx.createBiquadFilter();
    const crackGain = ctx.createGain();

    crackFilter.type = 'lowpass';
    crackFilter.frequency.setValueAtTime(isClose ? 160 : 110, t);
    crackFilter.Q.setValueAtTime(2.4, t);

    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(isClose ? 90 : 70, t);
    crackOsc.frequency.exponentialRampToValueAtTime(30, t + (isClose ? 0.18 : 0.25));

    const peakCrackGain = (isClose ? 0.32 : 0.20) * intensity;
    crackGain.gain.setValueAtTime(0.0001, t);
    crackGain.gain.linearRampToValueAtTime(peakCrackGain, t + 0.02);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, t + (isClose ? 0.22 : 0.30));

    crackOsc.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.ambientGain);

    crackOsc.start(t);
    crackOsc.stop(t + 0.35);

    // 3. Multi-Wave Rolling Thunder Rumble (Reverberating across clouds & terrain)
    const thunderNoise = ctx.createBufferSource();
    thunderNoise.buffer = this.noiseBuffer;

    const thunderFilter = ctx.createBiquadFilter();
    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(isClose ? 105 : 85, t);
    thunderFilter.Q.setValueAtTime(3.0, t);

    const thunderGain = ctx.createGain();
    const peakRumble = (isClose ? 0.44 : 0.36) * intensity;
    thunderGain.gain.setValueAtTime(0.001, t);
    // Primary strike wave swell
    thunderGain.gain.linearRampToValueAtTime(peakRumble, t + 0.45);
    thunderGain.gain.linearRampToValueAtTime(peakRumble * 0.65, t + 0.9);
    // Secondary cloud-layer reflection rumble wave
    thunderGain.gain.linearRampToValueAtTime(peakRumble * 0.85, t + 1.4);
    // Long exponential decay reverberation
    thunderGain.gain.exponentialRampToValueAtTime(0.0001, t + (isClose ? 4.8 : 5.4));

    thunderNoise.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(this.ambientGain);

    thunderNoise.start(t);
    thunderNoise.stop(t + 5.5);

    // 4. Sub-Bass Shockwave Resonance (48Hz deep seismic wave)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(48, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 1.2);

    subGain.gain.setValueAtTime(0.0001, t);
    subGain.gain.linearRampToValueAtTime(0.08 * intensity, t + 0.3);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

    subOsc.connect(subGain);
    subGain.connect(this.ambientGain);

    subOsc.start(t);
    subOsc.stop(t + 2.3);
  }

  /**
   * 0. THUNDERSTORM: Intense driving downpour, howling storm winds, barometric sub-drone, and dramatic thunder strikes
   */
  _createThunderstormSoundscape() {
    const ctx = this.ctx;
    if (!this.noiseBuffer) return;

    // 1. Heavy driving rain downpour bed (Pink noise through dual filters with high presence)
    const downpourSource = ctx.createBufferSource();
    downpourSource.buffer = this.noiseBuffer;
    downpourSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1300, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(3400, ctx.currentTime);

    const downpourGain = ctx.createGain();
    downpourGain.gain.setValueAtTime(0.52, ctx.currentTime);

    downpourSource.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(downpourGain);
    downpourGain.connect(this.ambientGain);

    downpourSource.start();
    this.activeAmbientSources.push(downpourSource, downpourGain);

    // 2. Heavy roof & asphalt rain droplet pounding (rapid spatter pings)
    const spatterTimer = setInterval(() => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();

      const freq = 900 + Math.random() * 1400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.04);

      const dropVol = 0.04 + Math.random() * 0.06;
      dropGain.gain.setValueAtTime(dropVol, t);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

      osc.connect(dropGain);
      dropGain.connect(this.ambientGain);

      osc.start(t);
      osc.stop(t + 0.05);
    }, 110);
    this.ambientTimers.push(spatterTimer);

    // 3. Howling storm wind gusts (LFO modulated bandpass filter)
    const stormWindSource = ctx.createBufferSource();
    stormWindSource.buffer = this.noiseBuffer;
    stormWindSource.loop = true;

    const stormWindFilter = ctx.createBiquadFilter();
    stormWindFilter.type = 'bandpass';
    stormWindFilter.frequency.setValueAtTime(420, ctx.currentTime);
    stormWindFilter.Q.setValueAtTime(1.8, ctx.currentTime);

    const windLfo = ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.24, ctx.currentTime);

    const windLfoGain = ctx.createGain();
    windLfoGain.gain.setValueAtTime(220, ctx.currentTime);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(stormWindFilter.frequency);

    const stormWindGain = ctx.createGain();
    stormWindGain.gain.setValueAtTime(0.26, ctx.currentTime);

    stormWindSource.connect(stormWindFilter);
    stormWindFilter.connect(stormWindGain);
    stormWindGain.connect(this.ambientGain);

    stormWindSource.start();
    windLfo.start();
    this.activeAmbientSources.push(stormWindSource, windLfo, stormWindGain);

    // 4. Low-frequency atmospheric pressure rumble drone (54Hz & 88Hz)
    const subOsc1 = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc1.type = 'sine';
    subOsc2.type = 'sine';
    subOsc1.frequency.setValueAtTime(54, ctx.currentTime);
    subOsc2.frequency.setValueAtTime(88, ctx.currentTime);
    subGain.gain.setValueAtTime(0.025, ctx.currentTime);

    subOsc1.connect(subGain);
    subOsc2.connect(subGain);
    subGain.connect(this.ambientGain);

    subOsc1.start();
    subOsc2.start();
    this.activeAmbientSources.push(subOsc1, subOsc2, subGain);

    // 5. Fallback safety timer: in case 3D scene is paused or hidden, guarantee thunder strikes every 7-10s
    const fallbackTimer = setInterval(() => {
      if (!this.lastThunderTime || Date.now() - this.lastThunderTime > 6500) {
        this.triggerThunder(0.18, { intensity: 1.0, isClose: true });
      }
    }, 6000);
    this.ambientTimers.push(fallbackTimer);
  }

  /**
   * 1. RAINY: Continuous rain sound, droplet spatter, storm wind gusts, barometric drone & synchronized thunder strikes
   */
  _createRainSoundscape() {
    const ctx = this.ctx;
    if (!this.noiseBuffer) return;

    // 1. Rain bed: continuous pink noise through dual bandpass & lowpass
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1350, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.15, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(3000, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.44, ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.ambientGain);

    noiseSource.start();
    this.activeAmbientSources.push(noiseSource, rainGain);

    // 2. High-presence raindrops pings hitting surfaces (leaves, glass & pavement)
    const dropletTimer = setInterval(() => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();

      const freq = 1000 + Math.random() * 1400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.48, t + 0.038);

      const dropVol = 0.035 + Math.random() * 0.055;
      dropGain.gain.setValueAtTime(dropVol, t);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.042);

      osc.connect(dropGain);
      dropGain.connect(this.ambientGain);

      osc.start(t);
      osc.stop(t + 0.045);
    }, 150);
    this.ambientTimers.push(dropletTimer);

    // 3. Atmospheric storm wind gusts (LFO modulated bandpass filter)
    const windSource = ctx.createBufferSource();
    windSource.buffer = this.noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(440, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.6, ctx.currentTime);

    const windLfo = ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.20, ctx.currentTime);

    const windLfoGain = ctx.createGain();
    windLfoGain.gain.setValueAtTime(180, ctx.currentTime);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.22, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.ambientGain);

    windSource.start();
    windLfo.start();
    this.activeAmbientSources.push(windSource, windLfo, windGain);

    // 4. Low-frequency atmospheric pressure rumble drone (54Hz & 88Hz)
    const subOsc1 = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc1.type = 'sine';
    subOsc2.type = 'sine';
    subOsc1.frequency.setValueAtTime(54, ctx.currentTime);
    subOsc2.frequency.setValueAtTime(88, ctx.currentTime);
    subGain.gain.setValueAtTime(0.02, ctx.currentTime);

    subOsc1.connect(subGain);
    subOsc2.connect(subGain);
    subGain.connect(this.ambientGain);

    subOsc1.start();
    subOsc2.start();
    this.activeAmbientSources.push(subOsc1, subOsc2, subGain);

    // 5. Fallback safety timer: in case 3D scene is paused or hidden, guarantee thunder every 10-14s
    const fallbackTimer = setInterval(() => {
      if (!this.lastThunderTime || Date.now() - this.lastThunderTime > 9500) {
        this.triggerThunder(0.35, { intensity: 0.8, isClose: false });
      }
    }, 8000);
    this.ambientTimers.push(fallbackTimer);
  }

  /**
   * 2. SUNNY: Warm radiant harmonic drone, gentle sun breeze, occasional sweet birdsong
   */
  _createSunnySoundscape(isDay = true) {
    const ctx = this.ctx;

    // Warm chord drone: A3 (220Hz) and E4 (330Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc2.frequency.setValueAtTime(330, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.045, ctx.currentTime);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(this.ambientGain);

    osc1.start();
    osc2.start();
    this.activeAmbientSources.push(osc1, osc2, droneGain);

    // Soft warm breeze (pink noise through highpass & lowpass)
    if (this.noiseBuffer) {
      const breeze = ctx.createBufferSource();
      breeze.buffer = this.noiseBuffer;
      breeze.loop = true;

      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = 'bandpass';
      breezeFilter.frequency.setValueAtTime(520, ctx.currentTime);
      breezeFilter.Q.setValueAtTime(0.8, ctx.currentTime);

      const breezeGain = ctx.createGain();
      breezeGain.gain.setValueAtTime(0.08, ctx.currentTime);

      breeze.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(this.ambientGain);

      breeze.start();
      this.activeAmbientSources.push(breeze, breezeGain);
    }

    // If day, add pleasant distant birdsong chirps
    if (isDay) {
      const birdTimer = setInterval(() => {
        if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
        const t = ctx.currentTime;

        // 2-3 chirps in quick sequence
        for (let i = 0; i < 3; i++) {
          const chirpTime = t + i * 0.09;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          const baseFreq = 2800 + i * 250;
          osc.frequency.setValueAtTime(baseFreq, chirpTime);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, chirpTime + 0.035);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, chirpTime + 0.07);

          gain.gain.setValueAtTime(0.025, chirpTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.075);

          osc.connect(gain);
          gain.connect(this.ambientGain);

          osc.start(chirpTime);
          osc.stop(chirpTime + 0.08);
        }
      }, 9000);
      this.ambientTimers.push(birdTimer);
    }
  }

  /**
   * 3. NIGHT: Calming nocturnal ambient drone & gentle crickets
   */
  _createNightSoundscape() {
    const ctx = this.ctx;

    // Deep warm nocturnal drone: A2 (110Hz) & E3 (165Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(110, ctx.currentTime);
    osc2.frequency.setValueAtTime(165, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.04, ctx.currentTime);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(this.ambientGain);

    osc1.start();
    osc2.start();
    this.activeAmbientSources.push(osc1, osc2, droneGain);

    // Cricket chirps (gentle rhythmic high bandpass pulses)
    const cricketTimer = setInterval(() => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const pulseTime = t + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4600, pulseTime);
        osc.frequency.setValueAtTime(4850, pulseTime + 0.02);

        gain.gain.setValueAtTime(0.016, pulseTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.045);

        osc.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(pulseTime);
        osc.stop(pulseTime + 0.05);
      }
    }, 2800);
    this.ambientTimers.push(cricketTimer);
  }

  /**
   * 4. CLOUDY: Atmospheric wind gusts with LFO modulated filter
   */
  _createCloudySoundscape() {
    const ctx = this.ctx;
    if (!this.noiseBuffer) return;

    const windSource = ctx.createBufferSource();
    windSource.buffer = this.noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(450, ctx.currentTime);
    windFilter.Q.setValueAtTime(2.2, ctx.currentTime);

    // LFO to slowly sweep filter frequency (creating natural wind gusts)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime); // sweeps +/- 200Hz
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.24, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.ambientGain);

    windSource.start();
    lfo.start();
    this.activeAmbientSources.push(windSource, lfo, windGain);
  }

  /**
   * 5. SNOW: Crisp winter high wind & crystalline ice bell tones
   */
  _createSnowSoundscape() {
    const ctx = this.ctx;
    if (!this.noiseBuffer) return;

    // Highpass cold wind
    const snowSource = ctx.createBufferSource();
    snowSource.buffer = this.noiseBuffer;
    snowSource.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1200, ctx.currentTime);

    const snowGain = ctx.createGain();
    snowGain.gain.setValueAtTime(0.14, ctx.currentTime);

    snowSource.connect(highpass);
    highpass.connect(snowGain);
    snowGain.connect(this.ambientGain);

    snowSource.start();
    this.activeAmbientSources.push(snowSource, snowGain);

    // Gentle crystalline ice bells (1760Hz & 2640Hz)
    const chimeTimer = setInterval(() => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const tones = [1760, 2200, 2640, 3168];
      const tone = tones[Math.floor(Math.random() * tones.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone, t);

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(t);
      osc.stop(t + 1.25);
    }, 4500);
    this.ambientTimers.push(chimeTimer);
  }

  // =========================================================================
  // Time-of-Day Environmental Soundscapes (Early Morning Birds & Afternoon Traffic)
  // =========================================================================

  /**
   * 6. EARLY MORNING (5:00 AM - 9:59 AM): Rich, organic birds chirping dawn chorus
   * Synthesizes authentic songbird trills, sweet two-tone calls, and distant answering warbles
   */
  _createEarlyMorningSoundscape() {
    const ctx = this.ctx;
    if (!ctx) return;

    // Procedural bird call synthesizer
    const playBirdCall = (type = 'trill', pan = 0) => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;

      let dest = this.ambientGain;
      if (ctx.createStereoPanner) {
        try {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, t);
          panner.connect(this.ambientGain);
          dest = panner;
        } catch (e) {}
      }

      if (type === 'trill') {
        // Melodic warbling trill (4 rapid frequency sweeps like a robin / canary)
        const notes = [
          { f1: 2950, f2: 3800, dur: 0.055, gap: 0.02 },
          { f1: 3250, f2: 4150, dur: 0.065, gap: 0.025 },
          { f1: 3050, f2: 3950, dur: 0.06, gap: 0.02 },
          { f1: 2850, f2: 3500, dur: 0.07, gap: 0.0 }
        ];

        let offset = 0;
        notes.forEach(n => {
          const startTime = t + offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.f1, startTime);
          osc.frequency.exponentialRampToValueAtTime(n.f2, startTime + n.dur * 0.5);
          osc.frequency.exponentialRampToValueAtTime(n.f1 * 0.94, startTime + n.dur);

          gain.gain.setValueAtTime(0.048, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + n.dur);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(startTime);
          osc.stop(startTime + n.dur + 0.01);

          offset += n.dur + n.gap;
        });
      } else if (type === 'two-tone') {
        // Clear two-tone morning songbird call ("Sweet-peep!")
        const f1 = 3450 + Math.random() * 250;
        const f2 = 2750 + Math.random() * 200;

        // Note 1: High crisp whistle
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(f1, t);
        osc1.frequency.exponentialRampToValueAtTime(f1 * 1.14, t + 0.065);
        gain1.gain.setValueAtTime(0.042, t);
        gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
        osc1.connect(gain1);
        gain1.connect(dest);
        osc1.start(t);
        osc1.stop(t + 0.08);

        // Note 2: Answering sweet drop (100ms later)
        const t2 = t + 0.10;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(f2, t2);
        osc2.frequency.exponentialRampToValueAtTime(f2 * 0.88, t2 + 0.09);
        gain2.gain.setValueAtTime(0.04, t2);
        gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.10);
        osc2.connect(gain2);
        gain2.connect(dest);
        osc2.start(t2);
        osc2.stop(t2 + 0.11);
      } else {
        // Soft answering songbird in the distance
        const f = 2400 + Math.random() * 350;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3100, t);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 1.22, t + 0.06);
        osc.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.11);

        gain.gain.setValueAtTime(0.024, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.13);
      }
    };

    // Play an immediate welcoming bird song
    const initialBirdTimeout = setTimeout(() => {
      playBirdCall('trill', -0.25);
      setTimeout(() => playBirdCall('two-tone', 0.35), 620);
    }, 350);
    this.ambientTimers.push(initialBirdTimeout);

    // Dynamic recurring chorus cycle (randomized between 2.2s and 4.8s)
    const runChorusCycle = () => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const r = Math.random();
      if (r < 0.44) {
        // Melodic trill
        playBirdCall('trill', (Math.random() - 0.5) * 0.8);
        if (Math.random() > 0.4) {
          // Distant answering bird
          setTimeout(() => playBirdCall('answer', (Math.random() > 0.5 ? 0.6 : -0.6)), 480 + Math.random() * 350);
        }
      } else if (r < 0.78) {
        // Two-tone call
        playBirdCall('two-tone', (Math.random() - 0.5) * 0.7);
      } else {
        // Answering call
        playBirdCall('answer', (Math.random() - 0.5) * 0.85);
      }

      const nextDelay = 2100 + Math.random() * 2800;
      const nextTimer = setTimeout(runChorusCycle, nextDelay);
      this.ambientTimers.push(nextTimer);
    };

    const firstTimer = setTimeout(runChorusCycle, 2200);
    this.ambientTimers.push(firstTimer);
  }

  /**
   * 7. AFTERNOON (12:00 PM - 5:59 PM): Subtle light city traffic noise
   * Synthesizes low continuous road presence, rolling tire pass-by whooshes, and soft distant horns
   */
  _createAfternoonTrafficSoundscape() {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return;

    // 1. Continuous Distant City Road Bed (Low-frequency filtered pink noise & asphalt hum)
    const roadNoise = ctx.createBufferSource();
    roadNoise.buffer = this.noiseBuffer;
    roadNoise.loop = true;

    const roadFilter = ctx.createBiquadFilter();
    roadFilter.type = 'lowpass';
    roadFilter.frequency.setValueAtTime(155, ctx.currentTime);
    roadFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const roadGain = ctx.createGain();
    roadGain.gain.setValueAtTime(0.085, ctx.currentTime);

    // Warm asphalt tire drone (72Hz & 116Hz)
    const humOsc1 = ctx.createOscillator();
    const humOsc2 = ctx.createOscillator();
    const humGain = ctx.createGain();

    humOsc1.type = 'sine';
    humOsc2.type = 'sine';
    humOsc1.frequency.setValueAtTime(72, ctx.currentTime);
    humOsc2.frequency.setValueAtTime(116, ctx.currentTime);

    humGain.gain.setValueAtTime(0.016, ctx.currentTime);

    roadNoise.connect(roadFilter);
    roadFilter.connect(roadGain);
    roadGain.connect(this.ambientGain);

    humOsc1.connect(humGain);
    humOsc2.connect(humGain);
    humGain.connect(this.ambientGain);

    roadNoise.start();
    humOsc1.start();
    humOsc2.start();
    this.activeAmbientSources.push(roadNoise, roadGain, humOsc1, humOsc2, humGain);

    // 2. Procedural Passing Vehicle Whoosh (Rolling tires on road with Doppler sweep)
    const triggerPassingCar = () => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const carSource = ctx.createBufferSource();
      carSource.buffer = this.noiseBuffer;

      const carBandpass = ctx.createBiquadFilter();
      carBandpass.type = 'bandpass';
      carBandpass.Q.setValueAtTime(2.2, t);

      const carGain = ctx.createGain();
      const carDuration = 3.6 + Math.random() * 1.2;
      const peakTime = t + carDuration * 0.44;

      // Doppler frequency shift: 240Hz -> 540Hz -> 180Hz
      carBandpass.frequency.setValueAtTime(240, t);
      carBandpass.frequency.exponentialRampToValueAtTime(540, peakTime);
      carBandpass.frequency.exponentialRampToValueAtTime(180, t + carDuration);

      // Volume envelope: smooth approach swell and fade away
      const maxVol = 0.052 + Math.random() * 0.032;
      carGain.gain.setValueAtTime(0.001, t);
      carGain.gain.linearRampToValueAtTime(maxVol, peakTime);
      carGain.gain.exponentialRampToValueAtTime(0.0001, t + carDuration);

      let carDest = this.ambientGain;
      if (ctx.createStereoPanner) {
        try {
          const carPanner = ctx.createStereoPanner();
          const startPan = Math.random() > 0.5 ? -0.7 : 0.7;
          carPanner.pan.setValueAtTime(startPan, t);
          carPanner.pan.linearRampToValueAtTime(-startPan, t + carDuration);
          carPanner.connect(this.ambientGain);
          carDest = carPanner;
        } catch (e) {}
      }

      carSource.connect(carBandpass);
      carBandpass.connect(carGain);
      carGain.connect(carDest);

      carSource.start(t);
      carSource.stop(t + carDuration + 0.1);
    };

    // First car pass after 1.6 seconds, then recurring every 6.5s - 9s
    const firstCarTimeout = setTimeout(triggerPassingCar, 1600);
    this.ambientTimers.push(firstCarTimeout);

    const carInterval = setInterval(() => {
      triggerPassingCar();
    }, 7200);
    this.ambientTimers.push(carInterval);

    // 3. Occasional Distant Friendly Double-Horn (Echoing off urban architecture)
    const hornInterval = setInterval(() => {
      if (!this.isAmbientEnabled || this.ctx.state !== 'running') return;
      if (Math.random() > 0.65) return; // Trigger periodically
      const t = ctx.currentTime;

      // Harmonic third: 440Hz (A4) & 554Hz (C#5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const hornFilter = ctx.createBiquadFilter();
      const hornGain = ctx.createGain();

      hornFilter.type = 'bandpass';
      hornFilter.frequency.setValueAtTime(490, t);
      hornFilter.Q.setValueAtTime(3.2, t);

      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(440, t);
      osc2.frequency.setValueAtTime(554, t);

      // Distant soft double beep: beep (0.08s) -> pause (0.05s) -> beep (0.09s)
      const hornVol = 0.015;
      hornGain.gain.setValueAtTime(0.0001, t);
      hornGain.gain.linearRampToValueAtTime(hornVol, t + 0.01);
      hornGain.gain.setValueAtTime(hornVol, t + 0.08);
      hornGain.gain.linearRampToValueAtTime(0.0001, t + 0.09);

      hornGain.gain.setValueAtTime(0.0001, t + 0.14);
      hornGain.gain.linearRampToValueAtTime(hornVol * 0.85, t + 0.15);
      hornGain.gain.setValueAtTime(hornVol * 0.85, t + 0.23);
      hornGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);

      osc1.connect(hornFilter);
      osc2.connect(hornFilter);
      hornFilter.connect(hornGain);
      hornGain.connect(this.ambientGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.4);
      osc2.stop(t + 0.4);
    }, 20000);
    this.ambientTimers.push(hornInterval);
  }

  // =========================================================================
  // Ambient Sound Toggle / Mute Control
  // =========================================================================

  /**
   * Toggle ambient weather sound on or off
   * @returns {boolean} current active state
   */
  toggleAmbient() {
    this._ensureContext();
    this.isAmbientEnabled = !this.isAmbientEnabled;
    localStorage.setItem('astra_ambient_sound', this.isAmbientEnabled.toString());

    if (this.ctx && this.ambientGain) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setTargetAtTime(this.isAmbientEnabled ? 0.35 : 0.0, now, 0.25);
    }

    if (this.isAmbientEnabled && this.currentClimate) {
      this.setClimate(this.currentClimate, this.isDay, this.localHour, this.cityName);
    } else {
      this._stopAmbientSources();
    }

    // Play tactile switch sound
    this.playClick('toggle');

    return this.isAmbientEnabled;
  }

  /**
   * Get human-friendly description of active soundscape
   */
  getSoundscapeDescription() {
    if (this.currentClimate === 'thunderstorm') {
      return 'Heavy Thunderstorm & Synchronized Lightning Strikes';
    }
    if (this.currentClimate === 'rainy') {
      return 'Rain & Synchronized Thunderstorm Strikes';
    }

    const hour = this.localHour !== null ? this.localHour : (this.isDay ? 14 : 23);
    const timeLabel = hour >= 5 && hour < 10 ? 'Early Morning Birds Chorus' :
                      hour >= 12 && hour < 18 ? 'Afternoon City Traffic Ambience' :
                      hour >= 21 || hour < 5 ? 'Night Crickets & Breeze' : 'Day Atmosphere';

    const climateNames = {
      rainy: 'Rain & Distant Thunder',
      sunny: 'Radiant Sunshine',
      cloudy: 'Wind Gusts',
      night: 'Night Skies',
      snow: 'Winter Wind & Ice Bells'
    };

    const climateLabel = climateNames[this.currentClimate] || 'Atmosphere';
    return `${climateLabel} · ${timeLabel}`;
  }
}

// Export singleton sound engine instance
export const soundEngine = new SoundEngine();
