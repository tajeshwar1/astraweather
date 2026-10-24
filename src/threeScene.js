import * as THREE from 'three';

/**
 * Three.js 3D Weather Environment Controller
 * Creates stunning, immersive, interactive 3D climate scenes for:
 * - Sunny (Radiant sun, corona, light motes, drifting puffy cumulus clouds)
 * - Rainy (3,500+ falling rain streaks, ground splash ripples, dark storm clouds, lightning flashes)
 * - Cloudy (Multi-layered 3D volumetric cloud clusters drifting with parallax, mist particles)
 * - Night (Glowing 3D moon, lunar halo, twinkling starfield, midnight clouds)
 * - Snow (Gentle falling snowflakes with wind swaying)
 */

export class WeatherScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.currentClimate = 'sunny';
    this.isDay = true;
    this.targetClimate = 'sunny';
    this.transitionProgress = 1.0;
    this.transitionDuration = 1.2; // seconds

    // Mouse tracking for subtle camera parallax
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetCamX = 0;
    this.targetCamY = 0;

    // Animation variables
    this.clock = new THREE.Clock();
    this.animId = null;

    // Lightning state
    this.lightningTimer = 0;
    this.nextLightningTime = 4 + Math.random() * 5;
    this.isFlashing = false;
    this.flashDuration = 0;
    this.onLightningStrike = null;
    this.hasGyroscope = false;
    this.isThunderstorm = false;

    // Smooth climate transition weights for automatic weather changes
    this.climateWeights = {
      sunny: 1.0,
      rainy: 0.0,
      cloudy: 0.0,
      night: 0.0,
      snow: 0.0
    };
    this.targetWeights = {
      sunny: 1.0,
      rainy: 0.0,
      cloudy: 0.0,
      night: 0.0,
      snow: 0.0
    };

    // Lighting and fog targets
    this.targetAmbientColor = new THREE.Color(0xfff7e6);
    this.targetDirectionalColor = new THREE.Color(0xffeaad);
    this.targetFogColor = new THREE.Color(0x3a7bd5);
    this.targetDirIntensity = 2.6;
    this.targetAmbientIntensity = 1.4;
    this.targetFogDensity = 0.006;

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a2b4c, 0.012);

    const width = (this.container && this.container.clientWidth) || window.innerWidth || 1;
    const height = (this.container && this.container.clientHeight) || window.innerHeight || 1;
    const aspect = width / height;
    const isPortrait = aspect < 1.0;
    this.camera = new THREE.PerspectiveCamera(isPortrait ? 56 : 50, aspect, 0.1, 1000);
    this.camera.position.set(0, isPortrait ? 2.5 : 1.5, isPortrait ? 38 : 32);

    // 2. WebGL Renderer with optimized mobile-friendly DPI cap (1.5 for efficiency)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting Setup
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    this.directionalLight.position.set(15, 25, 20);
    this.scene.add(this.directionalLight);

    this.lightningLight = new THREE.PointLight(0xd4eaff, 0, 100);
    this.lightningLight.position.set(0, 20, -10);
    this.scene.add(this.lightningLight);

    // 4. Climate Groups
    this.sunnyGroup = new THREE.Group();
    this.rainyGroup = new THREE.Group();
    this.cloudyGroup = new THREE.Group();
    this.nightGroup = new THREE.Group();
    this.snowGroup = new THREE.Group();

    this.scene.add(this.sunnyGroup);
    this.scene.add(this.rainyGroup);
    this.scene.add(this.cloudyGroup);
    this.scene.add(this.nightGroup);
    this.scene.add(this.snowGroup);

    // 5. Build individual climate elements
    this.createSunnyElements();
    this.createRainyElements();
    this.createCloudyElements();
    this.createNightElements();
    this.createSnowElements();

    // 6. Event Listeners
    this.isTabVisible = !document.hidden;
    this.handleResize = this.onResize.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleOrientation = this.onDeviceOrientation.bind(this);
    this.handleVisibilityChange = this.onVisibilityChange.bind(this);

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Interactive canvas click to summon a lightning strike during rain or thunderstorm
    if (this.container) {
      this.container.addEventListener('click', () => {
        if ((this.currentClimate === 'rainy' || this.isThunderstorm) && !this.isFlashing) {
          this.triggerLightning();
        }
      });
    }

    // 7. Start Render Loop
    this.animate();
  }

  // --- Helper: Generate Radial Canvas Texture ---
  createGlowTexture(innerColor, outerColor, size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.3, innerColor.replace(/[\d\.]+\)$/, '0.6)'));
    gradient.addColorStop(0.7, outerColor.replace(/[\d\.]+\)$/, '0.2)'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // --- SUNNY CLIMATE ASSETS ---
  createSunnyElements() {
    // 1. Sun Sphere
    const sunGeom = new THREE.SphereGeometry(3.6, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffea7a,
    });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunMesh.position.set(12, 11, -15);
    this.sunnyGroup.add(this.sunMesh);

    // 2. Multi-layer Corona Glow
    const glowTex = this.createGlowTexture('rgba(255, 225, 120, 1.0)', 'rgba(255, 150, 40, 0.4)', 512);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.85
    });
    this.sunCorona = new THREE.Sprite(glowMat);
    this.sunCorona.scale.set(22, 22, 1);
    this.sunMesh.add(this.sunCorona);

    // Outer subtle atmospheric flare
    const outerGlowTex = this.createGlowTexture('rgba(255, 240, 180, 0.6)', 'rgba(255, 170, 70, 0.05)', 512);
    const outerGlowMat = new THREE.SpriteMaterial({
      map: outerGlowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.5
    });
    this.sunOuterGlow = new THREE.Sprite(outerGlowMat);
    this.sunOuterGlow.scale.set(38, 38, 1);
    this.sunMesh.add(this.sunOuterGlow);

    // 3. Volumetric Rotating Sun Rays
    const rayGeom = new THREE.PlaneGeometry(32, 32);
    const rayTex = this.createGlowTexture('rgba(255, 235, 160, 0.35)', 'rgba(255, 180, 50, 0.0)', 512);
    const rayMat = new THREE.MeshBasicMaterial({
      map: rayTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.sunRays = new THREE.Mesh(rayGeom, rayMat);
    this.sunMesh.add(this.sunRays);

    // 4. Golden Light Motes (Floating dust particles in sunlight)
    const moteCount = 450;
    const moteGeom = new THREE.BufferGeometry();
    const motePositions = new Float32Array(moteCount * 3);
    const moteScales = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * 50;
      motePositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      moteScales[i] = 0.5 + Math.random() * 1.5;
    }
    moteGeom.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    moteGeom.setAttribute('scale', new THREE.BufferAttribute(moteScales, 1));

    const moteTex = this.createGlowTexture('rgba(255, 240, 180, 1)', 'rgba(255, 200, 80, 0.1)', 128);
    this.moteMat = new THREE.PointsMaterial({
      map: moteTex,
      size: 1.2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.7,
      depthWrite: false
    });
    this.sunMotes = new THREE.Points(moteGeom, this.moteMat);
    this.sunnyGroup.add(this.sunMotes);

    // 5. Sunny Fair-Weather Soft Cumulus Clouds (distant, catching warm golden light)
    this.sunnyClouds = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const cloud = this.buildProceduralCloud({
        color: 0xffffff,
        subColor: 0xffeedd,
        puffCount: 6,
        radius: 2.2,
        roughness: 0.4
      });
      cloud.position.set(-25 + i * 16, 6 + (i % 2) * 3, -20 - i * 4);
      cloud.userData = { speed: 0.015 + i * 0.006, resetX: -35, maxX: 35 };
      this.sunnyClouds.add(cloud);
    }
    this.sunnyGroup.add(this.sunnyClouds);
  }

  // --- RAINY CLIMATE ASSETS ---
  createRainyElements() {
    // 1. Rain Streaks (LineSegments)
    const rainCount = 3800;
    const rainGeom = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 2 * 3); // 2 vertices per line
    this.rainVelocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * 70;
      const y = Math.random() * 50 - 15;
      const z = (Math.random() - 0.5) * 45;
      const len = 1.4 + Math.random() * 1.2;

      // Start vertex
      rainPositions[i * 6] = x;
      rainPositions[i * 6 + 1] = y;
      rainPositions[i * 6 + 2] = z;

      // End vertex (tilted slightly backwards by wind)
      rainPositions[i * 6 + 3] = x - 0.22;
      rainPositions[i * 6 + 4] = y - len;
      rainPositions[i * 6 + 5] = z;

      this.rainVelocities[i] = 0.75 + Math.random() * 0.5;
    }

    rainGeom.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    this.rainMat = new THREE.LineBasicMaterial({
      color: 0x9dc6e8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.rainLines = new THREE.LineSegments(rainGeom, this.rainMat);
    this.rainyGroup.add(this.rainLines);

    // 2. Ground Rain Splash Rings
    const splashCount = 120;
    this.splashes = [];
    const splashGeom = new THREE.RingGeometry(0.08, 0.35, 16);
    splashGeom.rotateX(-Math.PI / 2);
    const splashMat = new THREE.MeshBasicMaterial({
      color: 0x8dc0e6,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let i = 0; i < splashCount; i++) {
      const splash = new THREE.Mesh(splashGeom, splashMat.clone());
      splash.position.set(
        (Math.random() - 0.5) * 60,
        -12,
        (Math.random() - 0.5) * 40
      );
      splash.userData = {
        active: false,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        scale: 0.2
      };
      this.rainyGroup.add(splash);
      this.splashes.push(splash);
    }

    // 3. Dark, moody storm clouds
    this.stormClouds = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const stormCloud = this.buildProceduralCloud({
        color: 0x2d3748,
        subColor: 0x1a202c,
        puffCount: 8,
        radius: 3.5,
        roughness: 0.8
      });
      stormCloud.position.set(-30 + i * 11, 10 + (i % 3) * 2, -12 - (i % 2) * 6);
      stormCloud.userData = { speed: 0.02 + i * 0.008, resetX: -45, maxX: 45 };
      this.stormClouds.add(stormCloud);
    }
    this.rainyGroup.add(this.stormClouds);

    // 4. Procedural Lightning Bolt Geometry (hidden until strike)
    const lightningGeom = new THREE.BufferGeometry();
    const lightningPositions = new Float32Array(30 * 3);
    lightningGeom.setAttribute('position', new THREE.BufferAttribute(lightningPositions, 3));
    this.lightningMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.lightningBolt = new THREE.Line(lightningGeom, this.lightningMat);
    this.rainyGroup.add(this.lightningBolt);

    // 5. Secondary Forked Branching Bolt Geometry
    const forkGeom = new THREE.BufferGeometry();
    const forkPositions = new Float32Array(15 * 3);
    forkGeom.setAttribute('position', new THREE.BufferAttribute(forkPositions, 3));
    this.forkMat = new THREE.LineBasicMaterial({
      color: 0xcfe8ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.forkBolt = new THREE.Line(forkGeom, this.forkMat);
    this.rainyGroup.add(this.forkBolt);
  }

  // --- CLOUDY CLIMATE ASSETS ---
  createCloudyElements() {
    this.overcastClouds = new THREE.Group();
    
    // Near clouds
    for (let i = 0; i < 4; i++) {
      const cloud = this.buildProceduralCloud({
        color: 0xe6eef6,
        subColor: 0xc8d7e6,
        puffCount: 7,
        radius: 3.0,
        roughness: 0.5
      });
      cloud.position.set(-24 + i * 16, 5 + (i % 2) * 3, -12);
      cloud.userData = { speed: 0.016, resetX: -36, maxX: 36 };
      this.overcastClouds.add(cloud);
    }

    // Midground clouds (denser)
    for (let i = 0; i < 6; i++) {
      const cloud = this.buildProceduralCloud({
        color: 0xc5d4e4,
        subColor: 0xa9bdd0,
        puffCount: 8,
        radius: 3.8,
        roughness: 0.6
      });
      cloud.position.set(-32 + i * 13, 8 + (i % 3) * 2.5, -25);
      cloud.userData = { speed: 0.01, resetX: -42, maxX: 42 };
      this.overcastClouds.add(cloud);
    }

    // Background distant overcast shelf
    for (let i = 0; i < 5; i++) {
      const cloud = this.buildProceduralCloud({
        color: 0x93a9be,
        subColor: 0x7c94a9,
        puffCount: 10,
        radius: 5.0,
        roughness: 0.7
      });
      cloud.position.set(-30 + i * 15, 12 + (i % 2) * 3, -45);
      cloud.userData = { speed: 0.005, resetX: -50, maxX: 50 };
      this.overcastClouds.add(cloud);
    }

    this.cloudyGroup.add(this.overcastClouds);

    // Drifting soft fog mist particles
    const mistCount = 300;
    const mistGeom = new THREE.BufferGeometry();
    const mistPositions = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount; i++) {
      mistPositions[i * 3] = (Math.random() - 0.5) * 60;
      mistPositions[i * 3 + 1] = (Math.random() - 0.5) * 20 + 2;
      mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    mistGeom.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));
    const mistTex = this.createGlowTexture('rgba(215, 230, 245, 0.45)', 'rgba(180, 200, 220, 0)', 128);
    this.mistMat = new THREE.PointsMaterial({
      map: mistTex,
      size: 6.5,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    this.mistPoints = new THREE.Points(mistGeom, this.mistMat);
    this.cloudyGroup.add(this.mistPoints);
  }

  // --- NIGHT CLIMATE ASSETS ---
  createNightElements() {
    // 1. Glowing 3D Moon
    const moonGeom = new THREE.SphereGeometry(3.0, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xf0f4f8,
      emissive: 0x7c9dbd,
      emissiveIntensity: 0.35,
      roughness: 0.7,
      metalness: 0.1
    });
    this.moonMesh = new THREE.Mesh(moonGeom, moonMat);
    this.moonMesh.position.set(13, 12, -18);
    this.nightGroup.add(this.moonMesh);

    // Moon Glow Halo
    const moonHaloTex = this.createGlowTexture('rgba(200, 225, 255, 0.8)', 'rgba(70, 110, 180, 0.15)', 512);
    const moonHaloMat = new THREE.SpriteMaterial({
      map: moonHaloTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.75
    });
    const moonHalo = new THREE.Sprite(moonHaloMat);
    moonHalo.scale.set(18, 18, 1);
    this.moonMesh.add(moonHalo);

    // 2. Starfield
    const starCount = 1800;
    const starGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Distribute in upper hemisphere and depth
      const radius = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9 + 0.1); // upper sky bias

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 20;

      // Color tints: slight ice blue, warm gold, pure white
      const tint = Math.random();
      if (tint > 0.8) {
        starColors[i * 3] = 0.95; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.7; // warm
      } else if (tint > 0.6) {
        starColors[i * 3] = 0.75; starColors[i * 3 + 1] = 0.88; starColors[i * 3 + 2] = 1.0; // blue
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0; // white
      }
    }

    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starTex = this.createGlowTexture('rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)', 64);
    this.starMat = new THREE.PointsMaterial({
      map: starTex,
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    this.starField = new THREE.Points(starGeom, this.starMat);
    this.nightGroup.add(this.starField);

    // 3. Wispy Night Clouds drifting in front of moon
    this.nightClouds = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const cloud = this.buildProceduralCloud({
        color: 0x1e2837,
        subColor: 0x0f1724,
        puffCount: 6,
        radius: 2.8,
        roughness: 0.9
      });
      cloud.position.set(-15 + i * 18, 9 + i * 2, -14);
      cloud.userData = { speed: 0.012, resetX: -32, maxX: 32 };
      this.nightClouds.add(cloud);
    }
    this.nightGroup.add(this.nightClouds);
  }

  // --- SNOW BONUS ASSETS ---
  createSnowElements() {
    const flakeCount = 1800;
    const snowGeom = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(flakeCount * 3);
    this.snowVelocities = new Float32Array(flakeCount * 3);

    for (let i = 0; i < flakeCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 60;
      snowPositions[i * 3 + 1] = Math.random() * 40 - 10;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      this.snowVelocities[i * 3] = (Math.random() - 0.5) * 0.05; // X sway
      this.snowVelocities[i * 3 + 1] = 0.08 + Math.random() * 0.12; // Y fall
      this.snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03; // Z sway
    }

    snowGeom.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    const flakeTex = this.createGlowTexture('rgba(255, 255, 255, 1)', 'rgba(230, 245, 255, 0)', 64);
    this.snowMat = new THREE.PointsMaterial({
      map: flakeTex,
      size: 0.7,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.snowParticles = new THREE.Points(snowGeom, this.snowMat);
    this.snowGroup.add(this.snowParticles);
  }

  // --- Procedural Cloud Generator ---
  buildProceduralCloud({ color = 0xffffff, subColor = 0xddeeff, puffCount = 6, radius = 3.0, roughness = 0.5 }) {
    const group = new THREE.Group();
    const sphereGeom = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: 0.05,
      flatShading: false
    });

    for (let i = 0; i < puffCount; i++) {
      const mesh = new THREE.Mesh(sphereGeom, material);
      const r = radius * (0.6 + Math.random() * 0.5);
      mesh.scale.set(r, r * (0.7 + Math.random() * 0.3), r);
      mesh.position.set(
        (i - puffCount / 2) * (radius * 0.75) + (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.8
      );
      group.add(mesh);
    }
    return group;
  }

  // --- Trigger High-Voltage Procedural Lightning Strike ---
  triggerLightning() {
    this.isFlashing = true;
    this.flashDuration = 0.28; // seconds

    // Pick coordinates for main strike bolt
    const startX = (Math.random() - 0.5) * 36;
    const startY = 24;
    const startZ = -14 - Math.random() * 8;
    const endX = startX + (Math.random() - 0.5) * 16;
    const endY = -8;

    // Generate main jagged bolt points
    const posAttr = this.lightningBolt.geometry.attributes.position;
    const segments = 25;
    let curX = startX;
    let curY = startY;
    let curZ = startZ;
    let forkPoint = null;

    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      curX = THREE.MathUtils.lerp(startX, endX, t) + (Math.random() - 0.5) * 2.8;
      curY = THREE.MathUtils.lerp(startY, endY, t);
      curZ = startZ + (Math.random() - 0.5) * 1.8;

      posAttr.setXYZ(i, curX, curY, curZ);

      // Save branch point at ~40% down the bolt
      if (i === 10) {
        forkPoint = { x: curX, y: curY, z: curZ };
      }
    }
    posAttr.needsUpdate = true;

    // Generate fork branch if available
    if (this.forkBolt && forkPoint) {
      const forkAttr = this.forkBolt.geometry.attributes.position;
      const forkSegments = 12;
      const forkEndX = forkPoint.x + (Math.random() > 0.5 ? 8 : -8) + (Math.random() - 0.5) * 4;
      const forkEndY = forkPoint.y - 10;

      for (let j = 0; j < forkSegments; j++) {
        const ft = j / (forkSegments - 1);
        const fx = THREE.MathUtils.lerp(forkPoint.x, forkEndX, ft) + (Math.random() - 0.5) * 2.0;
        const fy = THREE.MathUtils.lerp(forkPoint.y, forkEndY, ft);
        const fz = forkPoint.z + (Math.random() - 0.5) * 1.2;
        forkAttr.setXYZ(j, fx, fy, fz);
      }
      forkAttr.needsUpdate = true;
      this.forkMat.opacity = 0.9;
    }

    this.lightningMat.opacity = 1.0;
    this.lightningLight.position.set(startX, startY - 6, startZ);
    this.lightningLight.intensity = 14.0;

    // Calculate distance and speed-of-sound physics delay
    const cam = this.camera ? this.camera.position : { x: 0, y: 1.5, z: 32 };
    const strikeDist = Math.hypot(startX - cam.x, startY - cam.y, startZ - cam.z);
    const delay = THREE.MathUtils.clamp((strikeDist - 34) * 0.026 + 0.18, 0.15, 0.85);
    const intensity = THREE.MathUtils.clamp(1.15 - (strikeDist - 34) * 0.015, 0.65, 1.0);
    const isClose = strikeDist < 46;

    // Notify external listeners (UI screen flash overlay & synchronized thunder sound)
    if (this.onLightningStrike) {
      this.onLightningStrike({
        distance: strikeDist,
        delay: delay,
        intensity: intensity,
        isClose: isClose
      });
    }
  }

  // --- Climate Setting & Transitions ---
  setClimate(climate, isDay = true) {
    let resolvedClimate = climate;
    const isThunder = climate === 'thunderstorm';
    if (isThunder) {
      resolvedClimate = 'rainy';
      this.isThunderstorm = true;
    } else {
      this.isThunderstorm = false;
    }

    if (!isDay && (climate === 'sunny' || climate === 'night')) {
      resolvedClimate = 'night';
    }

    if (resolvedClimate === 'rainy') {
      // Prime lightning timer so the first visual strike flashes promptly in 1.8 - 2.5s
      const nextStrike = this.isThunderstorm ? 1.5 + Math.random() * 1.2 : 2.0 + Math.random() * 1.5;
      const targetInterval = this.isThunderstorm ? 4.5 : 6.0;
      this.lightningTimer = Math.max(0, targetInterval - nextStrike);
    }

    if (this.currentClimate === resolvedClimate && this.isDay === isDay && !isThunder) return;
    this.currentClimate = resolvedClimate;
    this.isDay = isDay;

    // Immediately cancel any active lightning flash if transitioning away from rainy / thunderstorm
    if (resolvedClimate !== 'rainy') {
      this.isFlashing = false;
      if (this.lightningLight) this.lightningLight.intensity = 0;
      if (this.lightningMat) this.lightningMat.opacity = 0;
      if (this.forkMat) this.forkMat.opacity = 0;
    }

    // Set target weights (1 for active climate, 0 for others)
    for (const key of ['sunny', 'rainy', 'cloudy', 'night', 'snow']) {
      this.targetWeights[key] = key === resolvedClimate ? 1.0 : 0.0;
    }

    // Set target Lighting & Background Colors
    if (resolvedClimate === 'sunny') {
      this.targetAmbientColor.setHex(0xfff7e6);
      this.targetAmbientIntensity = 1.4;
      this.targetDirectionalColor.setHex(0xffeaad);
      this.targetDirIntensity = 2.6;
      this.directionalLight.position.set(15, 25, 20);
      this.targetFogColor.setHex(0x3a7bd5);
      this.targetFogDensity = 0.006;
    } else if (resolvedClimate === 'rainy') {
      if (this.isThunderstorm) {
        // Deep brooding thunderstorm sky
        this.targetAmbientColor.setHex(0x182230);
        this.targetAmbientIntensity = 0.55;
        this.targetDirectionalColor.setHex(0x384a60);
        this.targetDirIntensity = 0.7;
        this.directionalLight.position.set(5, 20, 10);
        this.targetFogColor.setHex(0x0a1018);
        this.targetFogDensity = 0.022;
      } else {
        this.targetAmbientColor.setHex(isDay ? 0x384a62 : 0x182434);
        this.targetAmbientIntensity = isDay ? 0.85 : 0.5;
        this.targetDirectionalColor.setHex(isDay ? 0x5a708a : 0x32475e);
        this.targetDirIntensity = isDay ? 0.95 : 0.6;
        this.directionalLight.position.set(5, 20, 10);
        this.targetFogColor.setHex(isDay ? 0x182433 : 0x0a121d);
        this.targetFogDensity = 0.016;
      }
    } else if (resolvedClimate === 'cloudy') {
      this.targetAmbientColor.setHex(isDay ? 0xaec2d6 : 0x223042);
      this.targetAmbientIntensity = isDay ? 1.3 : 0.7;
      this.targetDirectionalColor.setHex(isDay ? 0xd4e2ee : 0x4a6078);
      this.targetDirIntensity = isDay ? 1.5 : 0.8;
      this.directionalLight.position.set(10, 20, 15);
      this.targetFogColor.setHex(isDay ? 0x596c80 : 0x141f2d);
      this.targetFogDensity = 0.012;
    } else if (resolvedClimate === 'night') {
      this.targetAmbientColor.setHex(0x1a2844);
      this.targetAmbientIntensity = 0.75;
      this.targetDirectionalColor.setHex(0x7da4d4);
      this.targetDirIntensity = 0.9;
      this.directionalLight.position.set(-15, 25, 15);
      this.targetFogColor.setHex(0x0a1122);
      this.targetFogDensity = 0.009;
    } else if (resolvedClimate === 'snow') {
      this.targetAmbientColor.setHex(0xd0e2f2);
      this.targetAmbientIntensity = 1.5;
      this.targetDirectionalColor.setHex(0xe8f2fc);
      this.targetDirIntensity = 1.8;
      this.targetFogColor.setHex(0x8fa8c0);
      this.targetFogDensity = 0.014;
    }
  }

  // --- Mouse Parallax Handler (Desktop) ---
  onMouseMove(e) {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    this.mouseX = (e.clientX - halfW) / halfW;
    this.mouseY = (e.clientY - halfH) / halfH;
    this.targetCamX = this.mouseX * 3.8;
    this.targetCamY = -this.mouseY * 2.2 + (this.camera.position.z > 35 ? 2.5 : 1.5);
  }

  // --- Mobile Gyroscope / DeviceOrientation Parallax ---
  onDeviceOrientation(e) {
    if (e.gamma === null || e.beta === null) return;
    this.hasGyroscope = true;

    // gamma: Left-to-right tilt in degrees [-90, 90]
    // beta: Front-to-back tilt in degrees [-180, 180]
    // Typical phone upright holding angle is beta ~ 45-60 deg
    const clampedGamma = Math.max(-30, Math.min(30, e.gamma));
    const clampedBeta = Math.max(15, Math.min(85, e.beta));

    const normX = clampedGamma / 22; // -1 to 1
    const normY = (clampedBeta - 50) / 22; // -1 to 1

    this.targetCamX = normX * 4.2;
    this.targetCamY = -normY * 2.6 + (this.camera.position.z > 35 ? 2.5 : 1.5);
  }

  // Request Gyroscope permission for iOS 13+ devices on first user gesture
  requestGyroscopePermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
          }
        })
        .catch(() => {});
    }
  }

  // --- Page Visibility Optimization (Pauses GPU/CPU when tab is hidden) ---
  onVisibilityChange() {
    this.isTabVisible = !document.hidden;
    if (this.isTabVisible) {
      this.clock.getDelta(); // reset delta to prevent large time jumps
      if (!this.animId) {
        this.animate();
      }
    } else {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }
  }

  // --- Debounced Resize Handler ---
  onResize() {
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      const width = (this.container && this.container.clientWidth) || window.innerWidth || 1;
      const height = (this.container && this.container.clientHeight) || window.innerHeight || 1;
      const aspect = width / height;
      const isPortrait = aspect < 1.0;
      this.camera.aspect = aspect;
      this.camera.fov = isPortrait ? 56 : 50;
      this.camera.position.z = isPortrait ? 38 : 32;
      this.camera.position.y = isPortrait ? 2.5 : 1.5;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  // --- Main Animation Loop ---
  animate() {
    if (!this.isTabVisible) return;
    this.animId = requestAnimationFrame(this.animate.bind(this));
    const delta = Math.min(this.clock.getDelta(), 0.1); // clamp delta
    const time = this.clock.getElapsedTime();

    // 1. Smooth Camera Parallax Lerp & Perspective Tilt
    this.camera.position.x += (this.targetCamX - this.camera.position.x) * 0.055;
    this.camera.position.y += (this.targetCamY - this.camera.position.y) * 0.055;

    // Subtle 3D angular perspective tilt
    const baseY = this.camera.position.z > 35 ? 2.5 : 1.5;
    this.camera.rotation.y = -this.camera.position.x * 0.012;
    this.camera.rotation.x = (this.camera.position.y - baseY) * 0.012;
    this.camera.lookAt(0, baseY, 0);

    // Differential Layer Parallax (near objects shift faster than distant objects)
    const camShiftX = this.camera.position.x;
    if (this.sunnyGroup.visible && this.sunnyClouds) {
      this.sunnyClouds.position.x = -camShiftX * 0.22;
    }
    if (this.rainyGroup.visible && this.stormClouds) {
      this.stormClouds.position.x = -camShiftX * 0.28;
    }
    if (this.cloudyGroup.visible && this.overcastClouds) {
      this.overcastClouds.position.x = -camShiftX * 0.25;
    }

    // 2. Smooth Automated Weather Climate Crossfade
    const lerpRate = Math.min(1.0, delta * 2.4);
    for (const key of ['sunny', 'rainy', 'cloudy', 'night', 'snow']) {
      this.climateWeights[key] += (this.targetWeights[key] - this.climateWeights[key]) * lerpRate;
    }

    // Update group visibility & material opacities according to weights
    this.sunnyGroup.visible = this.climateWeights.sunny > 0.01;
    this.rainyGroup.visible = this.climateWeights.rainy > 0.01;
    this.cloudyGroup.visible = this.climateWeights.cloudy > 0.01;
    this.nightGroup.visible = this.climateWeights.night > 0.01;
    this.snowGroup.visible = this.climateWeights.snow > 0.01;

    if (this.sunnyGroup.visible) {
      this.sunCorona.material.opacity = 0.85 * this.climateWeights.sunny;
      this.sunOuterGlow.material.opacity = 0.5 * this.climateWeights.sunny;
      this.sunRays.material.opacity = 0.4 * this.climateWeights.sunny;
      this.moteMat.opacity = 0.7 * this.climateWeights.sunny;
    }
    if (this.rainyGroup.visible) {
      this.rainMat.opacity = 0.65 * this.climateWeights.rainy;
    }
    if (this.cloudyGroup.visible) {
      this.mistMat.opacity = 0.4 * this.climateWeights.cloudy;
    }
    if (this.nightGroup.visible) {
      this.starMat.opacity = 0.9 * this.climateWeights.night;
    }
    if (this.snowGroup.visible) {
      this.snowMat.opacity = 0.85 * this.climateWeights.snow;
    }

    // Smooth lighting & fog transitions
    this.ambientLight.color.lerp(this.targetAmbientColor, lerpRate);
    this.directionalLight.color.lerp(this.targetDirectionalColor, lerpRate);
    this.ambientLight.intensity += (this.targetAmbientIntensity - this.ambientLight.intensity) * lerpRate;
    this.directionalLight.intensity += (this.targetDirIntensity - this.directionalLight.intensity) * lerpRate;
    this.scene.fog.color.lerp(this.targetFogColor, lerpRate);
    this.scene.fog.density += (this.targetFogDensity - this.scene.fog.density) * lerpRate;

    // 3. Update Elements based on active climate
    // --- SUNNY ANIMATIONS ---
    if (this.sunnyGroup.visible) {
      this.sunMesh.rotation.y = time * 0.04;
      this.sunRays.rotation.z = time * 0.08;
      
      // Pulse Corona
      const pulse = 1.0 + Math.sin(time * 2.0) * 0.06;
      this.sunCorona.scale.set(22 * pulse, 22 * pulse, 1);

      // Float Dust Motes
      const motePos = this.sunMotes.geometry.attributes.position.array;
      for (let i = 1; i < motePos.length; i += 3) {
        motePos[i] += Math.sin(time + i) * 0.015 + 0.01;
        if (motePos[i] > 20) motePos[i] = -15;
      }
      this.sunMotes.geometry.attributes.position.needsUpdate = true;

      // Drift Sunny Clouds
      this.sunnyClouds.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > cloud.userData.maxX) {
          cloud.position.x = cloud.userData.resetX;
        }
      });
    }

    // --- RAINY ANIMATIONS ---
    if (this.rainyGroup.visible) {
      // Rain Streaks Falling
      const rainPos = this.rainLines.geometry.attributes.position.array;
      const count = this.rainVelocities.length;

      for (let i = 0; i < count; i++) {
        const vel = this.rainVelocities[i] * (this.isThunderstorm ? 2.2 : 1.5);
        const i1 = i * 6 + 1; // start Y
        const i4 = i * 6 + 4; // end Y

        rainPos[i1] -= vel;
        rainPos[i4] -= vel;

        // Reset drop upon hitting ground
        if (rainPos[i4] < -12) {
          const resetY = 32 + Math.random() * 5;
          const len = rainPos[i1] - rainPos[i4];
          rainPos[i1] = resetY;
          rainPos[i4] = resetY - len;

          // Trigger ground splash ripple
          const splash = this.splashes[i % this.splashes.length];
          if (!splash.userData.active) {
            splash.userData.active = true;
            splash.userData.life = splash.userData.maxLife;
            splash.position.x = rainPos[i * 6];
            splash.position.z = rainPos[i * 6 + 2];
            splash.scale.set(0.2, 0.2, 0.2);
            splash.material.opacity = 0.7;
          }
        }
      }
      this.rainLines.geometry.attributes.position.needsUpdate = true;

      // Update Splashes
      this.splashes.forEach(splash => {
        if (splash.userData.active) {
          splash.userData.life -= 1;
          const progress = 1 - splash.userData.life / splash.userData.maxLife;
          const s = 0.2 + progress * 1.8;
          splash.scale.set(s, s, s);
          splash.material.opacity = (1 - progress) * 0.65;
          if (splash.userData.life <= 0) {
            splash.userData.active = false;
            splash.material.opacity = 0;
          }
        }
      });

      // Drift Storm Clouds
      this.stormClouds.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > cloud.userData.maxX) {
          cloud.position.x = cloud.userData.resetX;
        }
      });

      // Lightning Logic for both Rainy and Thunderstorm climates
      this.lightningTimer += delta;
      const strikeInterval = this.isThunderstorm ? (3.2 + Math.random() * 2.5) : (4.8 + Math.random() * 3.2);
      if (this.lightningTimer > strikeInterval) {
        this.triggerLightning();
        this.lightningTimer = 0;
      }

      if (this.isFlashing) {
        this.flashDuration -= delta;
        if (this.flashDuration <= 0) {
          this.isFlashing = false;
          this.lightningMat.opacity = 0;
          if (this.forkMat) this.forkMat.opacity = 0;
          this.lightningLight.intensity = 0;
        } else {
          // Multi-stage realistic strobe discharge
          const progress = 1 - (this.flashDuration / 0.28);
          let intensity = 0;
          if (progress < 0.2) {
            intensity = 14.0;
          } else if (progress < 0.4) {
            intensity = 3.0;
          } else if (progress < 0.7) {
            intensity = 16.0;
          } else {
            intensity = 4.0 * (1 - (progress - 0.7) / 0.3);
          }
          const flicker = Math.random() > 0.15 ? intensity : intensity * 0.3;
          this.lightningLight.intensity = flicker;
          this.lightningMat.opacity = Math.min(1.0, flicker / 10.0);
          if (this.forkMat) this.forkMat.opacity = Math.min(0.9, flicker / 12.0);
        }
      }
    }

    // --- CLOUDY ANIMATIONS ---
    if (this.cloudyGroup.visible) {
      this.overcastClouds.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        cloud.position.y += Math.sin(time * 0.5 + cloud.position.x * 0.1) * 0.004;
        if (cloud.position.x > cloud.userData.maxX) {
          cloud.position.x = cloud.userData.resetX;
        }
      });

      // Mist Drift
      const mistPos = this.mistPoints.geometry.attributes.position.array;
      for (let i = 0; i < mistPos.length; i += 3) {
        mistPos[i] += 0.03;
        if (mistPos[i] > 35) mistPos[i] = -35;
      }
      this.mistPoints.geometry.attributes.position.needsUpdate = true;
    }

    // --- NIGHT ANIMATIONS ---
    if (this.nightGroup.visible) {
      this.moonMesh.rotation.y = time * 0.02;

      // Twinkle Stars
      this.starMat.opacity = 0.8 + Math.sin(time * 3.0) * 0.15;

      this.nightClouds.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > cloud.userData.maxX) {
          cloud.position.x = cloud.userData.resetX;
        }
      });
    }

    // --- SNOW ANIMATIONS ---
    if (this.snowGroup.visible) {
      const snowPos = this.snowParticles.geometry.attributes.position.array;
      const count = snowPos.length / 3;

      for (let i = 0; i < count; i++) {
        const i0 = i * 3;
        const i1 = i * 3 + 1;
        const i2 = i * 3 + 2;

        snowPos[i0] += Math.sin(time * 1.5 + i) * 0.04;
        snowPos[i1] -= this.snowVelocities[i1];
        snowPos[i2] += Math.cos(time * 1.2 + i) * 0.02;

        if (snowPos[i1] < -12) {
          snowPos[i1] = 25 + Math.random() * 5;
        }
      }
      this.snowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Render Frame
    this.renderer.render(this.scene, this.camera);
  }

  // --- Clean Up ---
  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
