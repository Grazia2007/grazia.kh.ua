"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Ruler, 
  PenTool, 
  Armchair,
  CheckCircle2,
  Hammer,
  Globe,
  X,
  Star,
  PlayCircle,
  Sparkles,
  Eye,
  Sun,
  Moon,
  MousePointer2
} from 'lucide-react';

// Глобальний кеш для географічних даних
let cachedWorldData: any = null;

// Ініціалізація підключення до Supabase
const supabaseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 'https://gpxbzpqnpbbumtiyfstc.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'sb_publishable_2VUpjTZW1Bf1Bg0Fs0vh6Q_6tIr5eP0';

const createCustomSupabaseClient = (url: string, key: string) => {
  return {
    from: (table: string) => {
      const builder = {
        filters: {} as Record<string, string>,
        selectColumns: '*',
        limitVal: undefined as number | undefined,
        select(columns: string = '*') { this.selectColumns = columns; return this; },
        eq(col: string, val: any) { this.filters[col] = `eq.${val}`; return this; },
        limit(limitVal: number) { this.limitVal = limitVal; return this; },
        then(onfulfilled?: (value: any) => any) {
          const queryParams = new URLSearchParams({ select: this.selectColumns, ...this.filters });
          if (this.limitVal !== undefined) queryParams.append('limit', String(this.limitVal));
          return fetch(`${url}/rest/v1/${table}?${queryParams.toString()}`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP помилка: ${res.status}`);
            return res.json();
          }).then(data => onfulfilled ? onfulfilled({ data, error: null }) : { data, error: null })
            .catch(error => onfulfilled ? onfulfilled({ data: null, error: error?.message || error }) : { data: null, error: error?.message || error });
        },
        async insert(row: any) {
          try {
            const res = await fetch(`${url}/rest/v1/${table}`, {
              method: 'POST',
              headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
              body: JSON.stringify(row)
            });
            if (!res.ok) throw new Error(`HTTP помилка: ${res.status}`);
            const data = await res.json();
            return { data, error: null };
          } catch (error: any) {
            return { data: null, error: error?.message || error };
          }
        }
      };
      return builder;
    }
  };
};

const supabase = createCustomSupabaseClient(supabaseUrl, supabaseAnonKey) as any;

const DEFAULT_MAP_LOCATIONS = [
  { 
    id: 'naukova', 
    name: 'м. Наукова (Харків, Центр)', 
    coordinates: [36.2263, 50.0152],
    project: 'Флагманська матова графітова кухня з інтегрованою LED-вітриною', 
    radius: 'Безпечний радіус: 300м', 
    type: 'city',
    description: 'Еталон інженерної думки та преміального мінімалізму. У цьому проєкті ми реалізували монолітний фасад без видимих ручок, інтегрували німецьку побутову техніку Teka та створили унікальну систему вертикального LED-освітлення скляної вітрини з торцевим підсвічуванням полиць.',
    rating: 5,
    photos: [
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-43.jpg', caption: 'Монолітний матовий графіт. Фасади оброблені спеціальним захисним нано-покриттям, яке повністю запобігає появі відбитків пальців та дрібних подряпин.' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-40.jpg', caption: 'Геометрія простору. Світлові лінії на стелі ідеально повторюють контур робочої зони кухні, підкреслюючи архітектурну точність проєкту.' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-47.jpg', caption: 'Скляна вітрина преміум-класу. LED-стрічка прихованого монтажу інтегрована безпосередньо у вертикальний алюмінієвий профіль, створюючи магічне м\'яке світіння полиць.' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-48.jpg', caption: 'Прихована зона сушіння посуду. Ми інтегрували італійську дворівневу сушку з нержавіючої сталі у верхню шафу з плавним підйомним механізмом Aventos від Blum.' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-51.jpg', caption: 'Вбудований двокамерний холодильник. Спеціальні посилені петлі витримують вагу важкого меблевого фасаду, забезпечуючи ідеальні зазори.' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-50.jpg', caption: 'Організація висувних систем Legrabox. Повний висув та плавний дотяг. Ящики витримують навантаження до 40 кг без просідання напрямних.' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-45.jpg', caption: 'Ергономіка мийної зони. Вбудована посудомийна машина Teka та духова шафа розташовані на зручній для спини висоті, перетворюючи приготування на задоволення.' }
    ]
  },
  { 
    id: 'saltovka', 
    name: 'Салтівка (522 м/р)', 
    coordinates: [36.3253, 50.0242],
    project: 'Модульна вітальня та гардероб', 
    radius: 'Безпечний радіус: 300м', 
    type: 'city',
    description: 'Оптимізація простору для великої родини. Створили приховані системи зберігання та інтегрували ТВ-зону в єдиний монолитиний ансамбль у стилі Soft-Minimalism.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', caption: 'ТВ-зона з прихованою проводкою та підвісними консолями. Ніякого візуального шуму.' }
    ]
  },
  { 
    id: 'bezludovka', 
    name: 'Безлюдівка (Харківська область)', 
    coordinates: [36.2735, 49.8711],
    project: 'Заміська кухня-їдальня', 
    radius: 'Безпечний радіус: 300м', 
    type: 'region',
    description: 'Проєкт масштабної кухні для великого заміського будинку у Харківській області. Тільки вологостійкі преміальні матеріали.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200', caption: 'Простір та світло. Велика обідня зона, поєднана з процесом готування.' }
    ]
  }
];

export default function GraziaFurnitureSystem() {
  // Тема
  const [isDark, setIsDark] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false); // Для уникнення hydration mismatch
  
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [mapLevel, setMapLevel] = useState<'globe' | 'kharkiv'>('globe');
  const [activePin, setActivePin] = useState<any>(DEFAULT_MAP_LOCATIONS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{url: string, caption: string} | null>(null);
  const [calcForm, setCalcForm] = useState({ spaceType: '', room: '', style: '', material: '', budget: '', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // 0. Ініціалізація теми
  useEffect(() => {
    const savedTheme = localStorage.getItem('grazia-theme');
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
    setThemeLoaded(true);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('grazia-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('grazia-theme', 'light');
      }
      return next;
    });
  };

  // Завантаження портфоліо
  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data, error } = await supabase.from('portfolio_projects').select('*');
      if (data && data.length > 0) {
        const formattedData = data.map((item: any) => {
          let coords = [36.2263, 50.0152];
          if (item.coordinates) {
            if (typeof item.coordinates === 'string') {
              const cleaned = item.coordinates.replace('(', '').replace(')', '').replace(',', ' ').trim().split(/\s+/);
              coords = [parseFloat(cleaned[0]), parseFloat(cleaned[1])];
            } else if (typeof item.coordinates === 'object') {
              coords = [
                item.coordinates.x !== undefined ? item.coordinates.x : item.coordinates.lon,
                item.coordinates.y !== undefined ? item.coordinates.y : item.coordinates.lat
              ];
            }
          }
          return {
            id: item.id,
            name: item.location_name,
            coordinates: coords,
            project: item.title,
            radius: `Безпечний радіус: ${item.radius_meters || 300}м`,
            type: item.coordinates ? 'city' : 'region',
            description: item.description,
            rating: parseFloat(item.rating) || 5.0,
            photos: item.media || []
          };
        });
        setDbProjects(formattedData);
        setActivePin(formattedData[0]);
      } else {
        setDbProjects(DEFAULT_MAP_LOCATIONS);
        setActivePin(DEFAULT_MAP_LOCATIONS[0]);
      }
    };
    fetchPortfolio();
  }, []);

  // 1. D3.js 3D-Глобус (Тепер з підтримкою темної теми!)
  useEffect(() => {
    if (mapLevel !== 'globe' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isDestroyed = false; 
    let cleanupEventsFn: (() => void) | null = null; 

    const loadScripts = async () => {
      if (isDestroyed) return;
      if (!(window as any).d3) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://d3js.org/d3.v7.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      if (isDestroyed) return;
      if (!(window as any).topojson) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/topojson-client@3';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      
      if (isDestroyed) return;
      cleanupEventsFn = await initSolidGlobe();
    };

    const initSolidGlobe = async () => {
      try {
        const d3 = (window as any).d3;
        const topojson = (window as any).topojson;

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = width * 0.42;

        const projection = d3.geoOrthographic()
          .translate([cx, cy])
          .scale(baseRadius)
          .clipAngle(90);

        const path = d3.geoPath(projection, ctx);
        
        let worldData;
        if (cachedWorldData) {
          worldData = cachedWorldData;
        } else {
          worldData = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-50m.json').then(r => r.json());
          cachedWorldData = worldData;
        }

        const countriesData = topojson.feature(worldData, worldData.objects.countries).features;
        const land = topojson.feature(worldData, worldData.objects.land);
        
        const ukraineFeature = countriesData.find((c: any) => c.properties?.name === 'Ukraine' || c.id === '804');

        const kharkivMarker = { lon: 36.23, lat: 50.00 }; 
        
        let rotation = [-20, -40, 0]; 
        let isDragging = false;
        let dragStartPos = { x: 0, y: 0 };
        let lastPos = { x: 0, y: 0 };
        const autoRotateSpeed = 0.25;

        let isZoomingIn = false;
        let zoomProgress = 0;
        let startRotation = [0, 0, 0];
        let targetRotation = [0, 0, 0];
        let hasTriggeredMap = false;

        const triggerCinematicZoom = () => {
          if (isZoomingIn) return;
          isZoomingIn = true;
          startRotation = [...rotation];
          
          targetRotation = [-kharkivMarker.lon, -kharkivMarker.lat, 0];
          
          let currentR0 = startRotation[0] % 360;
          let diff = targetRotation[0] - currentR0;
          if (diff > 180) targetRotation[0] -= 360;
          else if (diff < -180) targetRotation[0] += 360;
          
          targetRotation[0] = startRotation[0] + (targetRotation[0] - currentR0);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
          if (isZoomingIn) return; 
          isDragging = true;
          const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
          dragStartPos = { x: clientX, y: clientY };
          lastPos = { x: clientX, y: clientY };
          canvas.style.cursor = 'grabbing';
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
          if (!isDragging || isZoomingIn) return;
          e.preventDefault(); 
          const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
          const dx = clientX - lastPos.x;
          const dy = clientY - lastPos.y;

          rotation[0] += dx * 0.5; 
          rotation[1] -= dy * 0.5; 
          rotation[1] = Math.max(-80, Math.min(80, rotation[1])); 

          lastPos = { x: clientX, y: clientY };
        };

        const handlePointerUp = (e: MouseEvent | TouchEvent) => {
          if (!isDragging || isZoomingIn) return;
          isDragging = false;
          canvas.style.cursor = 'grab';
          
          const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
          const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

          const dist = Math.hypot(clientX - dragStartPos.x, clientY - dragStartPos.y);
          if (dist < 5) {
            triggerCinematicZoom();
          }
        };

        (window as any).startCinematicZoom = triggerCinematicZoom;

        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
        window.addEventListener('touchmove', handlePointerMove, { passive: false });
        window.addEventListener('touchend', handlePointerUp);

        const render = () => {
          if (isDestroyed || !canvasRef.current) return;
          
          if (isZoomingIn) {
            zoomProgress += 0.015; 
            if (zoomProgress >= 1) zoomProgress = 1;

            const ease = 1 - Math.pow(1 - zoomProgress, 3);

            rotation[0] = startRotation[0] + (targetRotation[0] - startRotation[0]) * ease;
            rotation[1] = startRotation[1] + (targetRotation[1] - startRotation[1]) * ease;

            projection.scale(baseRadius + (baseRadius * 2.5) * ease);

            if (zoomProgress > 0.45 && !hasTriggeredMap) {
              hasTriggeredMap = true;
              triggerMapFocus();
            }

          } else if (!isDragging) {
            rotation[0] += autoRotateSpeed; 
          }

          projection.rotate([rotation[0], rotation[1], rotation[2]]);
          
          ctx.clearRect(0, 0, width, height);

          const oceanBase1 = isDark ? '#1a1a1a' : '#FFFFFF';
          const oceanBase2 = isDark ? '#121212' : '#EBEAE6';
          const oceanBase3 = isDark ? '#050505' : '#C2C0B8';
          const landColor = isDark ? '#25332a' : '#414D46';
          const pulseOuter = isDark ? 'rgba(45, 80, 58, 0.45)' : 'rgba(30, 53, 39, 0.45)';
          const pulseInner = isDark ? '#2d503a' : '#1E3527';

          const currentRadius = projection.scale();
          const glow = ctx.createRadialGradient(cx, cy, currentRadius * 0.8, cx, cy, currentRadius * 1.1);
          glow.addColorStop(0, isDark ? 'rgba(45, 80, 58, 0.15)' : 'rgba(30, 53, 39, 0.08)');
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, cy, currentRadius * 1.1, 0, Math.PI * 2);
          ctx.fill();

          const baseGradient = ctx.createRadialGradient(cx - currentRadius * 0.35, cy - currentRadius * 0.35, 0, cx, cy, currentRadius);
          baseGradient.addColorStop(0, oceanBase1);
          baseGradient.addColorStop(0.4, oceanBase2);
          baseGradient.addColorStop(1, oceanBase3);
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = baseGradient;
          ctx.fill();

          ctx.beginPath();
          path(land);
          ctx.fillStyle = landColor; 
          ctx.fill();

          if (ukraineFeature) {
            const pulseAlpha = 0.3 + Math.abs(Math.sin(Date.now() * 0.002)) * 0.7; 
            
            ctx.beginPath();
            path(ukraineFeature);
            
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)';
            ctx.fill();

            ctx.shadowColor = 'white';
            ctx.shadowBlur = 10 * pulseAlpha;
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
            ctx.stroke();
            
            ctx.shadowBlur = 0; 
          }

          const shadowGradient = ctx.createRadialGradient(cx, cy, currentRadius * 0.7, cx, cy, currentRadius);
          shadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
          shadowGradient.addColorStop(1, isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.18)');
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = shadowGradient;
          ctx.fill();

          const center = projection.invert([cx, cy]);
          if (center) {
            const dist = d3.geoDistance(center, [kharkivMarker.lon, kharkivMarker.lat]);
            if (dist < Math.PI / 2) {
              const [x, y] = projection([kharkivMarker.lon, kharkivMarker.lat]);
              const pulse = 4 + Math.sin(Date.now() * 0.005) * 3;
              
              ctx.beginPath();
              ctx.arc(x, y, pulse + 7, 0, 2 * Math.PI);
              ctx.fillStyle = pulseOuter; 
              ctx.fill();

              ctx.beginPath();
              ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
              ctx.fillStyle = pulseInner;
              ctx.fill();
            }
          }

          animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        return () => {
          canvas.removeEventListener('mousedown', handlePointerDown);
          window.removeEventListener('mousemove', handlePointerMove);
          window.removeEventListener('mouseup', handlePointerUp);
          canvas.removeEventListener('touchstart', handlePointerDown);
          window.removeEventListener('touchmove', handlePointerMove);
          window.removeEventListener('touchend', handlePointerUp);
          delete (window as any).startCinematicZoom;
        };

      } catch (error) {
        console.error("Помилка глобуса:", error);
        return () => {};
      }
    };

    loadScripts();

    return () => {
      isDestroyed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (cleanupEventsFn) cleanupEventsFn();
    };
  }, [mapLevel, isDark, themeLoaded]); // ДОДАНО themeLoaded щоб глобус стартував після завантаження теми

  // 2. Ініціалізація та стилізація Mapbox
  useEffect(() => {
    if (mapLevel !== 'kharkiv' || !mapContainerRef.current) return;

    const initMapbox = async () => {
      if (!document.getElementById('mapbox-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-css';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      if (!(window as any).mapboxgl) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = 'pk.eyJ1IjoiZ3JhemlhLTIwMDciLCJhIjoiY21wa2RzNWw2MGYwcDJzcjg2Z2l6N3Y1MiJ9.rxyk7nszY-cdSE9D3hrESw'; 

      try {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11', 
          center: [36.24, 49.98],
          zoom: 11,
          pitch: 50,
          bearing: -15,
          antialias: true
        });

        mapInstanceRef.current = map;

        map.on('style.load', () => {
          const layers = map.getStyle().layers;
          const labelLayerId = layers.find((layer: any) => layer.type === 'symbol' && layer.layout['text-field'])?.id;

          map.addLayer(
            {
              'id': 'add-3d-buildings',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 13,
              'paint': {
                'fill-extrusion-color': isDark ? '#222' : '#E1DFD9',
                'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 15.05, ['get', 'height']],
                'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 15.05, ['get', 'min_height']],
                'fill-extrusion-opacity': 0.85
              }
            },
            labelLayerId
          );
        });

        const targets = dbProjects.length > 0 ? dbProjects : DEFAULT_MAP_LOCATIONS;
        targets.forEach((pin) => {
          const el = document.createElement('div');
          el.className = 'custom-mapbox-marker group cursor-pointer relative flex flex-col items-center';
          el.innerHTML = `
            <div class="absolute rounded-full border-2 transition-all duration-700 scale-100 opacity-20" style="border-color: var(--accent-main); background-color: var(--accent-main); width: 90px; height: 90px; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
            <div class="w-4 h-4 rounded-full border-2 z-10 hover:scale-125 transition-transform duration-300 shadow-lg" style="border-color: var(--bg-main); background-color: var(--accent-main);"></div>
            <div class="absolute -top-10 text-[10px] font-mono px-3 py-1.5 rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none" style="background-color: var(--btn-bg); color: var(--btn-text);">
              ${pin.name}
            </div>
          `;

          el.addEventListener('click', () => {
            setActivePin(pin);
            setSelectedProject(pin);
            map.flyTo({
              center: pin.coordinates,
              zoom: 14.5,
              pitch: 60,
              duration: 2500,
              essential: true
            });
          });

          new mapboxgl.Marker({ element: el })
            .setLngLat(pin.coordinates)
            .addTo(map);
        });

      } catch (err) {
        console.warn("Помилка ініціалізації Mapbox:", err);
      }
    };

    initMapbox();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLevel, dbProjects, isDark, themeLoaded]); // Також додали themeLoaded сюди про всяк випадок

  const triggerMapFocus = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMapLevel('kharkiv');
      setIsTransitioning(false);
    }, 1000); 
  };

  const returnToGlobe = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMapLevel('globe');
      setIsTransitioning(false);
    }, 600);
  };

  const handleCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('orders').insert({
        store_id: 'furniture',
        customer_name: 'Лід з лендінгу (Калькулятор)',
        total_amount: 0,
        status: 'draft',
        ttn_number: `Меблі: ${calcForm.spaceType} / ${calcForm.room} / ${calcForm.material}`
      });

      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calcForm)
      });

      setFormSubmitted(true);
    } catch (err) {
      console.error("Помилка відправки:", err);
      setFormSubmitted(true);
    }
  };

  const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  );

  if (!themeLoaded) return <div className="min-h-screen bg-[#F5F4F1] dark:bg-[#0a0a0a]" />;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-main)] selection:text-white overflow-x-hidden transition-colors duration-500">
      
      {/* --- КІНЕМАТОГРАФІЧНА ГАЛЕРЕЯ (MODAL) --- */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] overflow-y-auto animate-fadeIn">
          
          <div className="sticky top-0 bg-[var(--modal-bg)] backdrop-blur-md px-6 py-5 border-b border-[var(--border-color)] flex justify-between items-center z-50">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-main)] block font-bold">GRAZIA PORTFOLIO</span>
              <h2 className="text-xl font-serif text-[var(--text-main)]">{selectedProject.name}</h2>
            </div>
            <button onClick={() => setSelectedProject(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--btn-bg)] text-[var(--btn-text)] hover:scale-105 transition-transform duration-300">
              <X size={20} />
            </button>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="flex flex-col lg:flex-row gap-16 mb-20 items-start">
              
              <div className="flex-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-main)] font-semibold block mb-4">Деталі виконання</span>
                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-[var(--text-main)]">{selectedProject.project}</h1>
                <p className="text-[var(--text-muted)] leading-relaxed text-base mb-8 font-light">{selectedProject.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-[var(--border-color)]">
                  <div className="flex items-center gap-1.5 text-[var(--accent-main)]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    <span className="text-sm font-bold ml-2 text-[var(--text-main)]">{selectedProject.rating} / 5.0</span>
                  </div>
                  <div className="text-xs text-[var(--text-light)] font-mono flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--accent-main)]" /> {selectedProject.radius} (Захист приватності клієнта)
                  </div>
                </div>

                <div className="flex gap-4">
                  <a href={selectedProject.youtube_url || '#'} target="_blank" className="bg-[var(--btn-bg)] text-[var(--btn-text)] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 rounded-sm">
                    <PlayCircle size={16} /> Відеоогляд об'єкта
                  </a>
                  <a href={selectedProject.instagram_url || '#'} target="_blank" className="border border-[var(--border-color)] text-[var(--text-main)] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] transition-colors duration-300 rounded-sm">
                    <InstagramIcon /> Перейти в Instagram
                  </a>
                </div>
              </div>
              
              <div className="flex-1 relative w-full aspect-[4/3] bg-[var(--bg-card)] rounded-sm overflow-hidden shadow-2xl border border-[var(--border-color)]">
                <img src={selectedProject.photos[0]?.url} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white z-10 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span className="text-xs font-mono uppercase tracking-widest">Основний ракурс</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-serif text-[var(--text-main)] mb-8">Детальний фотозвіт конструктора</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProject.photos.map((photo: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxPhoto(photo)}
                    className="relative aspect-[3/4] bg-[var(--bg-card)] cursor-zoom-in group overflow-hidden rounded-sm border border-[var(--border-color)] shadow-sm"
                  >
                    <img src={photo.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Деталь меблів" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[var(--accent-main)] shadow-xl">
                        <Eye size={20} />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                      <div className="bg-[var(--modal-bg)] backdrop-blur p-4 border-l-4 border-[var(--accent-main)] shadow-lg">
                        <p className="text-[11px] font-medium text-[var(--text-main)] leading-relaxed line-clamp-2">
                          {photo.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- LIGHTBOX ПОВНОЕКРАННИЙ З ПРОДАЮЧИМ ТЕКСТОМ --- */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
          
          <img src={lightboxPhoto.url} className="max-w-full max-h-[72vh] object-contain rounded-sm shadow-2xl border border-white/5" alt="Zoomed view" />
          
          <div className="mt-8 max-w-2xl text-center px-4">
            <p className="text-white text-lg md:text-xl font-light leading-relaxed border-t border-white/20 pt-6">
              {lightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* Навігація */}
      <nav className="absolute top-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center bg-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-[var(--btn-bg)] text-[var(--btn-text)] flex items-center justify-center font-serif font-bold text-2xl tracking-tighter">
            G
          </div>
          <div>
            <span className="text-sm font-serif font-medium tracking-[0.25em] uppercase block text-[var(--text-main)]">GRAZIA</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[11px] font-semibold tracking-widest uppercase pointer-events-auto bg-[var(--nav-bg)] backdrop-blur px-6 py-3 rounded-full border border-[var(--border-color)] shadow-sm">
          <a href="#" className="hover:text-[var(--accent-main)] transition-colors border-b border-transparent hover:border-[var(--accent-main)] pb-1">Колекції</a>
          <a href="#interactive-zone" className="hover:text-[var(--accent-main)] transition-colors border-b border-transparent hover:border-[var(--accent-main)] pb-1">Карта 18 років досвіду</a>
          <a href="#calc" className="hover:text-[var(--accent-main)] transition-colors border-b border-transparent hover:border-[var(--accent-main)] pb-1">Розрахунок</a>
        </div>

        <div className="flex items-center pointer-events-auto">
          {/* Анімований перемикач теми */}
          <div 
            onClick={toggleTheme}
            className={`theme-toggle-wrapper ${isDark ? 'dark' : ''}`}
            title={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
          >
            <div className="theme-toggle-stars"></div>
            <div className="theme-toggle-clouds"></div>
            <div className="theme-toggle-mountains"></div>
            <div className="theme-toggle-slider"></div>
          </div>

          <button className="bg-[var(--accent-main)] text-white px-6 py-3 text-[10px] font-medium tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors shadow-sm">
            Зв'язатись
          </button>
        </div>
      </nav>

      {/* Hero Секція з 3D Глобусом та Картою */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 max-w-[1600px] mx-auto">
        
        <div className="flex-1 z-10 w-full pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-color)] text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-8 font-mono">
            <Ruler size={12} />
            <span>Меблеве портфоліо: Харків та Харківська область</span>
          </div>
          
          <h1 className="text-5xl md:text-[5.2rem] font-serif font-normal leading-[1.05] tracking-tight mb-8 text-[var(--text-main)]">
            ГЕОГРАФІЯ<br />
            НАШОЇ ПРАЦІ<br />
            ЗА 18 РОКІВ.
          </h1>
          
          <p className="text-base md:text-lg text-[var(--text-muted)] max-w-md font-light leading-relaxed mb-12">
            Справжня історія надійності. Оберіть глобальний перегляд або детальну реальну мапу, щоб побачити радіуси встановлення наших ексклюзивних меблів.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {mapLevel === 'globe' ? (
              <button 
                onClick={() => (window as any).startCinematicZoom ? (window as any).startCinematicZoom() : triggerMapFocus()}
                className={`bg-[var(--accent-main)] text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[var(--accent-hover)] transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : ''}`}
              >
                Відкрити карту робіт <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={returnToGlobe}
                className="bg-transparent border border-[var(--text-main)] text-[var(--text-main)] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] transition-all"
              >
                <Globe size={15} /> Повернутись до Глобуса
              </button>
            )}
          </div>
        </div>

        {/* Права інтерактивна зона */}
        <div id="interactive-zone" className="flex-1 w-full h-[600px] relative bg-[var(--bg-card)] rounded-sm overflow-hidden flex items-center justify-center group shadow-xl border border-[var(--border-color)]">
          
          {mapLevel === 'globe' ? (
            <div className={`w-full h-full flex flex-col items-center justify-center p-6 relative transition-all duration-[1500ms] ${isTransitioning ? 'scale-[3] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
              
              <canvas 
                ref={canvasRef} 
                width={550} 
                height={550} 
                className="w-full max-w-[500px] aspect-square cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-500" 
                title="Покрутіть глобус або клікніть, щоб відкрити карту об'єктів"
              />
              
              <div className="absolute top-6 left-6 bg-[var(--modal-bg)] backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--border-color)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] shadow-sm">
                Локалізація: Україна
              </div>

              <div className="absolute bottom-6 bg-[var(--modal-bg)] backdrop-blur-md border border-[var(--border-color)] px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] animate-pulse opacity-80 group-hover:opacity-100 transition-opacity">
                <MousePointer2 size={12} /> Натисніть на глобус, щоб відкрити карту
              </div>
              
            </div>
          ) : (
            <div className={`w-full h-full relative transition-all duration-1000 ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
              
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ outline: 'none' }} />

              <div className="absolute top-6 left-6 bg-[var(--modal-bg)] backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-color)] text-[10px] font-mono uppercase tracking-widest z-30 shadow-sm pointer-events-none text-[var(--text-main)]">
                Детальна Карта Робіт
              </div>

              <div className="absolute bottom-6 left-6 right-6 bg-[var(--modal-bg)] backdrop-blur-md p-5 border border-[var(--border-color)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl cursor-pointer hover:bg-[var(--bg-card)] transition-all duration-300 z-30" onClick={() => setSelectedProject(activePin)}>
                <div>
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 text-[var(--bg-main)] inline-block mb-2 ${activePin.type === 'city' ? 'bg-[var(--text-main)]' : 'bg-[var(--accent-main)]'}`}>
                    {activePin.type === 'city' ? 'Місто Харків' : 'Область / Україна'}
                  </span>
                  <h3 className="text-lg font-serif font-medium text-[var(--text-main)]">{activePin.project}</h3>
                  <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin size={12} /> Зона робіт: {activePin.name} (Клікніть на пін для польоту)
                  </p>
                </div>
                <div className="md:text-right border-t md:border-t-0 border-[var(--border-color)] pt-3 md:pt-0 w-full md:w-auto">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--text-light)] font-semibold mb-2 font-mono flex items-center md:justify-end gap-1">
                    Рейтинг <Star size={10} className="text-[var(--accent-main)]" fill="currentColor"/> 
                  </div>
                  <button className="text-xs font-semibold text-[var(--accent-main)] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider">
                    Відкрити галерею <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Портфоліо Проєктів */}
      <section className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto border-t border-[var(--border-color)]">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-mono text-[var(--accent-main)] uppercase tracking-widest block mb-2">Натисніть для перегляду</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--text-main)]">ОСТАННІ ШЕДЕВРИ</h2>
          </div>
          <a href="#" className="text-xs font-semibold tracking-widest uppercase border-b border-[var(--text-main)] pb-1 flex items-center gap-2 text-[var(--text-main)] hover:text-[var(--accent-main)] hover:border-[var(--accent-main)] transition-colors">
            Дивитись всі 120+ робіт <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dbProjects.slice(0, 4).map((project, idx) => (
            <div key={project.id || idx} onClick={() => setSelectedProject(project)} className="group relative cursor-pointer overflow-hidden bg-[var(--bg-card)] aspect-[3/4] shadow-sm rounded-sm">
              {project.photos && project.photos[0] ? (
                <img src={project.photos[0].url} alt={project.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--text-light)]"><Armchair size={48} /></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                <span className="text-[10px] text-white/70 font-mono uppercase tracking-widest block mb-2">{project.name}</span>
                <h3 className="text-lg font-serif text-white">{project.project}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form розрахунку */}
      <section id="calc" className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto bg-[var(--bg-main)] border border-[var(--border-color)] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 md:gap-24">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--text-main)] mb-6 leading-tight">ЗАМОВИТИ ПРОРАХУНОК<br/>МЕБЛІВ</h2>
            <p className="text-sm text-[var(--text-muted)] mb-10 leading-relaxed">
              Опишіть ваш проєкт, і ми підготуємо індивідуальну пропозицію. Наш конструктор зв'яжеться з вами для уточнення деталей та погодження виїзду на замір по Харкову.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center flex-shrink-0 text-[var(--accent-main)]">
                  <PenTool size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-1 text-[var(--text-main)]">Безкоштовний проєкт</h4>
                  <p className="text-xs text-[var(--text-muted)]">Створюємо 3D-візуалізацію вашої майбутньої кухні чи шафи.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center flex-shrink-0 text-[var(--accent-main)]">
                  <Hammer size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-1 text-[var(--text-main)]">Власне виробництво</h4>
                  <p className="text-xs text-[var(--text-muted)]">Повний контроль якості на кожному етапі у нашому цеху.</p>
                </div>
              </div>
            </div>
          </div>

          {formSubmitted ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-[var(--border-color)] bg-[var(--bg-card)]">
              <CheckCircle2 size={48} className="text-[var(--accent-main)] mb-6" />
              <h3 className="text-2xl font-serif mb-2 text-[var(--text-main)]">Запит успішно надіслано!</h3>
              <p className="text-[var(--text-muted)] text-sm">Ми вже отримали ваші дані в базі Supabase і готові до прорахунку.</p>
            </div>
          ) : (
            <form onSubmit={handleCalcSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex flex-col">
                <select required value={calcForm.spaceType} onChange={e => setCalcForm({...calcForm, spaceType: e.target.value})}
                  className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled className="bg-[var(--bg-main)] text-[var(--text-main)]">Тип приміщення</option>
                  <option value="flat" className="bg-[var(--bg-main)] text-[var(--text-main)]">Квартира (Новобудова)</option>
                  <option value="flat_old" className="bg-[var(--bg-main)] text-[var(--text-main)]">Квартира (Вторинний ринок)</option>
                  <option value="house" className="bg-[var(--bg-main)] text-[var(--text-main)]">Приватний будинок</option>
                  <option value="commercial" className="bg-[var(--bg-main)] text-[var(--text-main)]">Комерційне приміщення</option>
                </select>
              </div>

              <div className="flex flex-col">
                <select required value={calcForm.room} onChange={e => setCalcForm({...calcForm, room: e.target.value})}
                  className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled className="bg-[var(--bg-main)] text-[var(--text-main)]">Що потрібно виготовити?</option>
                  <option value="kitchen" className="bg-[var(--bg-main)] text-[var(--text-main)]">Кухня</option>
                  <option value="wardrobe" className="bg-[var(--bg-main)] text-[var(--text-main)]">Шафа-купе / Гардеробна</option>
                  <option value="living" className="bg-[var(--bg-main)] text-[var(--text-main)]">Меблі у вітальню (Тумби, ТВ-зони)</option>
                  <option value="bathroom" className="bg-[var(--bg-main)] text-[var(--text-main)]">Меблі для ванної</option>
                  <option value="complex" className="bg-[var(--bg-main)] text-[var(--text-main)]">Комплексне меблювання</option>
                </select>
              </div>

              <div className="flex flex-col">
                <select required value={calcForm.style} onChange={e => setCalcForm({...calcForm, style: e.target.value})}
                  className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled className="bg-[var(--bg-main)] text-[var(--text-main)]">Стилістика</option>
                  <option value="minimalism" className="bg-[var(--bg-main)] text-[var(--text-main)]">Мінімалізм (Гладкі фасади)</option>
                  <option value="classic" className="bg-[var(--bg-main)] text-[var(--text-main)]">Неокласика (Фрезерування)</option>
                  <option value="loft" className="bg-[var(--bg-main)] text-[var(--text-main)]">Лофт (Дерево + Метал)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <select required value={calcForm.material} onChange={e => setCalcForm({...calcForm, material: e.target.value})}
                  className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled className="bg-[var(--bg-main)] text-[var(--text-main)]">Переважні матеріали</option>
                  <option value="mdf_paint" className="bg-[var(--bg-main)] text-[var(--text-main)]">МДФ Фарбований</option>
                  <option value="mdf_film" className="bg-[var(--bg-main)] text-[var(--text-main)]">МДФ Плівка / Пластик</option>
                  <option value="wood" className="bg-[var(--bg-main)] text-[var(--text-main)]">Шпон / Масив дерева</option>
                  <option value="dsp" className="bg-[var(--bg-main)] text-[var(--text-main)]">ДСП (Бюджетний варіант)</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col mt-4">
                <textarea rows={3} value={calcForm.notes} onChange={e => setCalcForm({...calcForm, notes: e.target.value})}
                  placeholder="Додаткові побажання (приблизні розміри, наявність техніки, особливості...)"
                  className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors resize-none placeholder:text-[var(--text-light)]"
                />
              </div>

              <div className="md:col-span-2 mt-8 flex items-center justify-between">
                <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest max-w-[200px]">
                  Менеджер зв'яжеться з вами протягом 2 годин
                </p>
                <button type="submit" className="bg-[var(--accent-main)] text-white px-10 py-5 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[var(--accent-hover)] transition-colors">
                  Надіслати запит <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Футер адаптується до теми, але зберігає контрастність */}
      <footer className="bg-[var(--btn-bg)] text-[var(--btn-text)] py-16 px-6 md:px-12 mt-20 transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <div className="w-12 h-12 bg-[var(--btn-text)] text-[var(--btn-bg)] flex items-center justify-center font-serif font-bold text-3xl tracking-tighter mb-4">
              G
            </div>
            <p className="opacity-60 text-sm max-w-xs">Виробництво ексклюзивних корпусних меблів у Харкові. Створюємо інтер'єри з 2007 року.</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
            <a href="tel:+380501234567" className="text-xl font-serif hover:text-[var(--accent-main)] transition-colors">+38 (050) 123-45-67</a>
            <p className="text-sm opacity-60 flex items-center gap-2"><MapPin size={16} /> м. Харків, просп. Науки (Виробництво)</p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-current opacity-60 flex items-center justify-center hover:opacity-100 hover:bg-[var(--btn-text)] hover:text-[var(--btn-bg)] transition-all">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto border-t border-[var(--border-color)] opacity-40 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest">
          <span>© {new Date().getFullYear()} GRAZIA FURNITURE. Всі права захищені.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://tekhnovybir.com.ua" target="_blank" className="hover:opacity-100 transition-opacity">Партнер: Техновибір</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Політика конфіденційності</a>
          </div>
        </div>
      </footer>

      {/* --- ПЛАВАЮЧА КНОПКА TELEGRAM --- */}
      {/* Замініть 'твій_юзернейм' на ваш реальний юзернейм в Telegram (наприклад, @grazia_ua) */}
      <a
        href="https://t.me/твій_юзернейм"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-14 h-14 bg-[#2AABEE] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(42,171,238,0.3)] hover:scale-110 hover:shadow-[0_0_25px_rgba(42,171,238,0.5)] transition-all duration-300 group"
        title="Написати в Telegram"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.539.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.285-.346-.09l-6.4 4.024-2.76-.86c-.6-.185-.615-.6.125-.89l10.736-4.135c.5-.186.953.114.81.93z" />
        </svg>
        
        {/* Інтерактивна підказка, що виїжджає при наведенні курсору */}
        <span className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-[var(--modal-bg)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2 rounded-xl text-xs font-medium opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-xl">
          Живий чат з конструктором
        </span>
      </a>

    </div>
  );
}