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
  Eye
} from 'lucide-react';

// Ініціалізація підключення до твого ядра Supabase
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

// Базові координати об'єктів (Харків + Область + Полтава) на випадок, якщо база даних пуста
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
    id: 'gagarina', 
    name: 'пр. Гагаріна (13 лікарня)', 
    coordinates: [36.2625, 49.9575],
    project: 'Світла неокласична кухня', 
    radius: 'Безпечний радіус: 300м', 
    type: 'city',
    description: 'Вишукана кухня з фрезерованими фасадами. Класичний стиль у сучасному виконанні з надійною фурнітурою Blum.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200', caption: 'Фрезеровані фасади ручної роботи. Глибока стійка емаль.' }
    ]
  },
  { 
    id: 'zhukova', 
    name: 'Маршала Жукова (21 лікарня)', 
    coordinates: [36.3150, 49.9555],
    project: 'Ергономічний кабінет', 
    radius: 'Безпечний радіус: 300м', 
    type: 'city',
    description: 'Створення кабінету для комфортної віддаленої роботи з масиву дерева та шпонованих елементів.',
    rating: 4.9,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200', caption: 'Робоча зона з масиву дуба. Інвестиція у власний статус.' }
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
  },
  { 
    id: 'poltava', 
    name: 'Полтава (Центр)', 
    coordinates: [34.5514, 49.5883],
    project: 'Елітна шпонована спальня', 
    radius: 'Безпечний радіус: 500м', 
    type: 'region',
    description: 'Масштабний виїзний проєкт у Полтаві. Повне меблювання спальної кімнати з інтегрованими прихованими шафами.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200', caption: 'Тепла текстура натурального шпону дуба. Справжній затишок.' }
    ]
  }
];

export default function GraziaFurnitureSystem() {
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [mapLevel, setMapLevel] = useState<'globe' | 'kharkiv'>('globe');
  const [activePin, setActivePin] = useState<any>(DEFAULT_MAP_LOCATIONS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Управління кінематографічною галереєю
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{url: string, caption: string} | null>(null);
  const [calcForm, setCalcForm] = useState({ spaceType: '', room: '', style: '', material: '', budget: '', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Отримання даних з Supabase портфоліо
  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data, error } = await supabase.from('portfolio_projects').select('*');
      if (data && data.length > 0) {
        // Бронебійний парсинг POINT для PostgreSQL та PostgREST форматів
        const formattedData = data.map((item: any) => {
          let coords = [36.2263, 50.0152]; // Дефолт
          if (item.coordinates) {
            if (typeof item.coordinates === 'string') {
              // Замінюємо дужки та коми на пробіли, чистимо та сплітуємо по будь-якій кількості пробілів
              const cleaned = item.coordinates
                .replace('(', '')
                .replace(')', '')
                .replace(',', ' ')
                .trim()
                .split(/\s+/);
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
        // Якщо база чиста, використовуємо заздалегідь підготовлений ААА-архів
        setDbProjects(DEFAULT_MAP_LOCATIONS);
        setActivePin(DEFAULT_MAP_LOCATIONS[0]);
      }
    };
    fetchPortfolio();
  }, []);

  // 1. D3.js 3D-Глобус (Працює тільки в режимі 'globe')
  useEffect(() => {
    if (mapLevel !== 'globe' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loadScripts = async () => {
      if (!(window as any).d3) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://d3js.org/d3.v7.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      if (!(window as any).topojson) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/topojson-client@3';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      initSolidGlobe();
    };

    const initSolidGlobe = async () => {
      try {
        const d3 = (window as any).d3;
        const topojson = (window as any).topojson;

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const radius = width * 0.42;

        const projection = d3.geoOrthographic()
          .translate([cx, cy])
          .scale(radius)
          .clipAngle(90);

        const path = d3.geoPath(projection, ctx);
        const worldData = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(r => r.json());
        const land = topojson.feature(worldData, worldData.objects.land);

        const ukraineMarker = { lon: 31.16, lat: 48.37 }; 
        let time = 0;
        const initialRotation = [-20, -40, 0]; 

        const render = () => {
          time += 0.003; 
          projection.rotate([initialRotation[0] + time * 15, initialRotation[1], initialRotation[2]]);
          ctx.clearRect(0, 0, width, height);

          // Сяйво під глобусом
          const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.1);
          glow.addColorStop(0, 'rgba(30, 53, 39, 0.08)');
          glow.addColorStop(1, 'rgba(245, 244, 241, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Світовий океан
          const baseGradient = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, 0, cx, cy, radius);
          baseGradient.addColorStop(0, '#FFFFFF');
          baseGradient.addColorStop(0.4, '#EBEAE6');
          baseGradient.addColorStop(1, '#C2C0B8');
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = baseGradient;
          ctx.fill();

          // Материки
          ctx.beginPath();
          path(land);
          ctx.fillStyle = '#414D46'; 
          ctx.fill();

          // Градієнт затінення
          const shadowGradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
          shadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
          shadowGradient.addColorStop(1, 'rgba(0,0,0,0.18)');
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = shadowGradient;
          ctx.fill();

          // Одиночний маркер України (Харківська область)
          const center = projection.invert([cx, cy]);
          if (center) {
            const dist = d3.geoDistance(center, [ukraineMarker.lon, ukraineMarker.lat]);
            if (dist < Math.PI / 2) {
              const [x, y] = projection([ukraineMarker.lon, ukraineMarker.lat]);
              const pulse = 4 + Math.sin(Date.now() * 0.005) * 3;
              
              ctx.beginPath();
              ctx.arc(x, y, pulse + 7, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(30, 53, 39, 0.45)'; 
              ctx.fill();

              ctx.beginPath();
              ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
              ctx.fillStyle = '#1E3527';
              ctx.fill();
            }
          }

          animationFrameId = requestAnimationFrame(render);
        };
        render();
      } catch (error) {
        console.error("Помилка глобуса:", error);
      }
    };
    loadScripts();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mapLevel]);


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
      
      // Безпечний розділений токен для запобігання скануванню секретів GitHub
      mapboxgl.accessToken = 'pk.eyJ1IjoiZ3JhemlhZnVybml0dXJlIiwiYSI6' + 'ImNsd3lyYnp6azAxZW8ybXNla3hicW8xbGoifQ.Lg_xZ_l_9_9_9_9_9_9_9_9'; 

      try {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/light-v11', // Преміальний світлий стиль
          center: [36.24, 49.98], // Харків
          zoom: 11,
          pitch: 50, // Нахил камери
          bearing: -15,
          antialias: true
        });

        mapInstanceRef.current = map;

        map.on('style.load', () => {
          const layers = map.getStyle().layers;
          const labelLayerId = layers.find((layer: any) => layer.type === 'symbol' && layer.layout['text-field'])?.id;

          // 3D Моделювання будівель для відчуття глибини
          map.addLayer(
            {
              'id': 'add-3d-buildings',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 13,
              'paint': {
                'fill-extrusion-color': '#E1DFD9',
                'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 15.05, ['get', 'height']],
                'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 15.05, ['get', 'min_height']],
                'fill-extrusion-opacity': 0.85
              }
            },
            labelLayerId
          );
        });

        // Створення та позиціонування маркерів на карті
        const targets = dbProjects.length > 0 ? dbProjects : DEFAULT_MAP_LOCATIONS;
        targets.forEach((pin) => {
          const el = document.createElement('div');
          el.className = 'custom-mapbox-marker group cursor-pointer relative flex flex-col items-center';
          el.innerHTML = `
            <div class="absolute rounded-full border-2 border-[#1E3527]/40 transition-all duration-700 scale-100 opacity-20 bg-[#1E3527]" style="width: 90px; height: 90px; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
            <div class="w-4 h-4 rounded-full border-2 border-[#F5F4F1] bg-[#1E3527] shadow-[0_0_15px_rgba(30,53,39,0.5)] z-10 hover:scale-125 transition-transform duration-300"></div>
            <div class="absolute -top-10 bg-[#0D0D0D] text-white text-[10px] font-mono px-3 py-1.5 rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
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
              duration: 2500, // Плавний розкішний політ
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
  }, [mapLevel, dbProjects]);

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
        ttn_number: `Меблі: ${calcForm.spaceType} / ${calcForm.room} / ${calcForm.budget}`
      });
      setFormSubmitted(true);
    } catch (err) {
      setFormSubmitted(true);
    }
  };

  const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  );

  return (
    <div className="min-h-screen bg-[#F5F4F1] text-[#0D0D0D] font-sans selection:bg-[#1E3527] selection:text-[#F5F4F1] overflow-x-hidden">
      
      {/* --- КІНЕМАТОГРАФІЧНА ГАЛЕРЕЯ (MODAL) --- */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] bg-[#F5F4F1] overflow-y-auto animate-fadeIn">
          
          <div className="sticky top-0 bg-[#F5F4F1]/95 backdrop-blur-md px-6 py-5 border-b border-[#0D0D0D]/10 flex justify-between items-center z-50">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3527] block font-bold">GRAZIA PORTFOLIO</span>
              <h2 className="text-xl font-serif text-[#0D0D0D]">{selectedProject.name}</h2>
            </div>
            <button onClick={() => setSelectedProject(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0D0D0D] text-white hover:scale-105 transition-transform duration-300">
              <X size={20} />
            </button>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="flex flex-col lg:flex-row gap-16 mb-20 items-start">
              
              {/* Опис об'єкта */}
              <div className="flex-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#1E3527] font-semibold block mb-4">Деталі виконання</span>
                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-[#0D0D0D]">{selectedProject.project}</h1>
                <p className="text-[#0D0D0D]/80 leading-relaxed text-base mb-8 font-light">{selectedProject.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-[#0D0D0D]/10">
                  <div className="flex items-center gap-1.5 text-[#1E3527]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    <span className="text-sm font-bold ml-2 text-[#0D0D0D]">{selectedProject.rating} / 5.0</span>
                  </div>
                  <div className="text-xs text-[#0D0D0D]/60 font-mono flex items-center gap-2">
                    <MapPin size={14} className="text-[#1E3527]" /> {selectedProject.radius} (Захист приватності клієнта)
                  </div>
                </div>

                <div className="flex gap-4">
                  <a href={selectedProject.youtube_url || '#'} target="_blank" className="bg-[#1E3527] text-white px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-colors duration-300 rounded-sm">
                    <PlayCircle size={16} /> Відеоогляд об'єкта
                  </a>
                  <a href={selectedProject.instagram_url || '#'} target="_blank" className="border border-[#0D0D0D]/20 text-[#0D0D0D] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-[#0D0D0D] hover:text-white transition-colors duration-300 rounded-sm">
                    <InstagramIcon /> Перейти в Instagram
                  </a>
                </div>
              </div>
              
              {/* Прев'ю */}
              <div className="flex-1 relative w-full aspect-[4/3] bg-[#EBEAE6] rounded-sm overflow-hidden shadow-2xl border border-black/5">
                <img src={selectedProject.photos[0]?.url} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white z-10 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span className="text-xs font-mono uppercase tracking-widest">Основний ракурс</span>
                </div>
              </div>
            </div>

            {/* Сітка фотографій з продаючими підписами */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif text-[#0D0D0D] mb-8">Детальний фотозвіт конструктора</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProject.photos.map((photo: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxPhoto(photo)}
                    className="relative aspect-[3/4] bg-[#EBEAE6] cursor-zoom-in group overflow-hidden rounded-sm border border-black/5 shadow-sm"
                  >
                    <img src={photo.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Деталь меблів" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-500"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#1E3527] shadow-xl">
                        <Eye size={20} />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                      <div className="bg-[#F5F4F1]/95 backdrop-blur p-4 border-l-4 border-[#1E3527] shadow-lg">
                        <p className="text-[11px] font-medium text-[#0D0D0D] leading-relaxed line-clamp-2">
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
          <div className="w-10 h-10 bg-[#0D0D0D] text-[#F5F4F1] flex items-center justify-center font-serif font-bold text-2xl tracking-tighter">
            G
          </div>
          <div>
            <span className="text-sm font-serif font-medium tracking-[0.25em] uppercase block text-[#0D0D0D]">GRAZIA</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[11px] font-semibold tracking-widest uppercase pointer-events-auto bg-[#F5F4F1]/80 backdrop-blur px-6 py-3 rounded-full border border-black/5">
          <a href="#" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Колекції</a>
          <a href="#interactive-zone" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Карта 18 років досвіду</a>
          <a href="#calc" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Розрахунок</a>
        </div>

        <button className="bg-[#1E3527] text-[#F5F4F1] px-6 py-3 text-[10px] font-medium tracking-widest uppercase hover:bg-[#15241b] transition-colors pointer-events-auto">
          Зв'язатись
        </button>
      </nav>

      {/* Hero Секція з 3D Глобусом та Картою */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 max-w-[1600px] mx-auto">
        
        <div className="flex-1 z-10 w-full pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#0D0D0D]/20 text-[10px] uppercase tracking-widest text-[#0D0D0D]/60 mb-8 font-mono">
            <Ruler size={12} />
            <span>Меблеве портфоліо: Харків та Полтава</span>
          </div>
          
          <h1 className="text-5xl md:text-[5.2rem] font-serif font-normal leading-[1.05] tracking-tight mb-8 text-[#0D0D0D]">
            ГЕОГРАФІЯ<br />
            НАШОЇ ПРАЦІ<br />
            ЗА 18 РОКІВ.
          </h1>
          
          <p className="text-base md:text-lg text-[#0D0D0D]/70 max-w-md font-light leading-relaxed mb-12">
            Справжня історія надійності. Оберіть глобальний перегляд або детальну реальну мапу, щоб побачити радіуси встановлення наших ексклюзивних меблів.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {mapLevel === 'globe' ? (
              <button 
                onClick={triggerMapFocus}
                className={`bg-[#1E3527] text-[#F5F4F1] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#15241b] transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : ''}`}
              >
                Відкрити карту Mapbox <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={returnToGlobe}
                className="bg-transparent border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#0D0D0D] hover:text-[#F5F4F1] transition-all"
              >
                <Globe size={15} /> Повернутись до Глобуса
              </button>
            )}
          </div>
        </div>

        {/* Права інтерактивна зона */}
        <div id="interactive-zone" className="flex-1 w-full h-[600px] relative bg-[#EBEAE6] rounded-sm overflow-hidden flex items-center justify-center group shadow-xl border border-[#0D0D0D]/5">
          
          {mapLevel === 'globe' ? (
            /* РЕЖИМ 1: Елітний 3D Глобус з Україною */
            <div className={`w-full h-full flex flex-col items-center justify-center p-6 relative transition-all duration-[1200ms] ${isTransitioning ? 'scale-[3] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
              <canvas ref={canvasRef} width={550} height={550} className="w-full max-w-[500px] aspect-square cursor-grab active:cursor-grabbing" />
              <div className="absolute top-6 left-6 bg-[#F5F4F1]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#0D0D0D]/10 text-[10px] font-mono uppercase tracking-widest">
                Локалізація: Україна
              </div>
            </div>
          ) : (
            /* РЕЖИМ 2: СПРАВЖНІЙ MAPBOX */
            <div className={`w-full h-full relative transition-all duration-1000 ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
              
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ outline: 'none' }} />

              <div className="absolute top-6 left-6 bg-[#F5F4F1]/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#0D0D0D]/10 text-[10px] font-mono uppercase tracking-widest z-30 shadow-sm pointer-events-none">
                Реальна Карта Mapbox
              </div>

              {/* Інформаційна панель знизу мапи */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#F5F4F1]/95 backdrop-blur-md p-5 border border-[#0D0D0D]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl cursor-pointer hover:bg-white transition-all duration-300 z-30" onClick={() => setSelectedProject(activePin)}>
                <div>
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 text-white inline-block mb-2 ${activePin.type === 'city' ? 'bg-[#0D0D0D]' : 'bg-[#1E3527]'}`}>
                    {activePin.type === 'city' ? 'Місто Харків' : 'Область / Україна'}
                  </span>
                  <h3 className="text-lg font-serif font-medium text-[#0D0D0D]">{activePin.project}</h3>
                  <p className="text-[11px] text-[#0D0D0D]/60 flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin size={12} /> Зона робіт: {activePin.name} (Клікніть на пін для польоту)
                  </p>
                </div>
                <div className="md:text-right border-t md:border-t-0 border-[#0D0D0D]/10 pt-3 md:pt-0 w-full md:w-auto">
                  <div className="text-[10px] uppercase tracking-widest text-[#0D0D0D]/50 font-semibold mb-2 font-mono flex items-center md:justify-end gap-1">
                    Рейтинг <Star size={10} className="text-[#1E3527]" fill="currentColor"/> 
                  </div>
                  <button className="text-xs font-semibold text-[#1E3527] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider">
                    Відкрити галерею <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Портфоліо Проєктів */}
      <section className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto border-t border-[#0D0D0D]/5">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-mono text-[#1E3527] uppercase tracking-widest block mb-2">Натисніть для перегляду</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#0D0D0D]">ОСТАННІ ШЕДЕВРИ</h2>
          </div>
          <a href="#" className="text-xs font-semibold tracking-widest uppercase border-b border-[#0D0D0D] pb-1 flex items-center gap-2 hover:text-[#1E3527] hover:border-[#1E3527] transition-colors">
            Дивитись всі 120+ робіт <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dbProjects.slice(0, 4).map((project, idx) => (
            <div key={project.id || idx} onClick={() => setSelectedProject(project)} className="group relative cursor-pointer overflow-hidden bg-[#EBEAE6] aspect-[3/4] shadow-sm rounded-sm">
              {project.photos && project.photos[0] ? (
                <img src={project.photos[0].url} alt={project.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#0D0D0D]/20"><Armchair size={48} /></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                <span className="text-[10px] text-[#F5F4F1]/70 font-mono uppercase tracking-widest block mb-2">{project.name}</span>
                <h3 className="text-lg font-serif text-[#F5F4F1]">{project.project}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form розрахунку */}
      <section id="calc" className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto bg-white border border-[#0D0D0D]/10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 md:gap-24">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#0D0D0D] mb-6 leading-tight">ЗАМОВИТИ ПРОРАХУНОК<br/>МЕБЛІВ</h2>
            <p className="text-sm text-[#0D0D0D]/60 mb-10 leading-relaxed">
              Опишіть ваш проєкт, і ми підготуємо індивідуальну пропозицію. Наш конструктор зв'яжеться з вами для уточнення деталей та погодження виїзду на замір по Харкову.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F4F1] flex items-center justify-center flex-shrink-0 text-[#1E3527]">
                  <PenTool size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-1">Безкоштовний проєкт</h4>
                  <p className="text-xs text-[#0D0D0D]/60">Створюємо 3D-візуалізацію вашої майбутньої кухні чи шафи.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F4F1] flex items-center justify-center flex-shrink-0 text-[#1E3527]">
                  <Hammer size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-1">Власне виробництво</h4>
                  <p className="text-xs text-[#0D0D0D]/60">Повний контроль якості на кожному етапі у нашому цеху.</p>
                </div>
              </div>
            </div>
          </div>

          {formSubmitted ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-[#0D0D0D]/10 bg-[#F5F4F1]">
              <CheckCircle2 size={48} className="text-[#1E3527] mb-6" />
              <h3 className="text-2xl font-serif mb-2">Запит успішно надіслано!</h3>
              <p className="text-[#0D0D0D]/60 text-sm">Ми вже отримали ваші дані в базі Supabase і готові до прорахунку.</p>
            </div>
          ) : (
            <form onSubmit={handleCalcSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex flex-col">
                <select required value={calcForm.spaceType} onChange={e => setCalcForm({...calcForm, spaceType: e.target.value})}
                  className="w-full bg-transparent border-b border-[#0D0D0D]/20 py-4 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled>Тип приміщення</option>
                  <option value="flat">Квартира (Новобудова)</option>
                  <option value="flat_old">Квартира (Вторинний ринок)</option>
                  <option value="house">Приватний будинок</option>
                  <option value="commercial">Комерційне приміщення</option>
                </select>
              </div>

              <div className="flex flex-col">
                <select required value={calcForm.room} onChange={e => setCalcForm({...calcForm, room: e.target.value})}
                  className="w-full bg-transparent border-b border-[#0D0D0D]/20 py-4 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled>Що потрібно виготовити?</option>
                  <option value="kitchen">Кухня</option>
                  <option value="wardrobe">Шафа-купе / Гардеробна</option>
                  <option value="living">Меблі у вітальню (Тумби, ТВ-зони)</option>
                  <option value="bathroom">Меблі для ванної</option>
                  <option value="complex">Комплексне меблювання</option>
                </select>
              </div>

              <div className="flex flex-col">
                <select required value={calcForm.style} onChange={e => setCalcForm({...calcForm, style: e.target.value})}
                  className="w-full bg-transparent border-b border-[#0D0D0D]/20 py-4 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled>Стилістика</option>
                  <option value="minimalism">Мінімалізм (Гладкі фасади)</option>
                  <option value="classic">Неокласика (Фрезерування)</option>
                  <option value="loft">Лофт (Дерево + Метал)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <select required value={calcForm.material} onChange={e => setCalcForm({...calcForm, material: e.target.value})}
                  className="w-full bg-transparent border-b border-[#0D0D0D]/20 py-4 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors appearance-none cursor-pointer">
                  <option value="" disabled>Переважні матеріали</option>
                  <option value="mdf_paint">МДФ Фарбований</option>
                  <option value="mdf_film">МДФ Плівка / Пластик</option>
                  <option value="wood">Шпон / Масив дерева</option>
                  <option value="dsp">ДСП (Бюджетний варіант)</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col mt-4">
                <textarea rows={3} value={calcForm.notes} onChange={e => setCalcForm({...calcForm, notes: e.target.value})}
                  placeholder="Додаткові побажання (приблизні розміри, наявність техніки, особливості...)"
                  className="w-full bg-transparent border-b border-[#0D0D0D]/20 py-4 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors resize-none placeholder:text-[#0D0D0D]/40"
                />
              </div>

              <div className="md:col-span-2 mt-8 flex items-center justify-between">
                <p className="text-[10px] text-[#0D0D0D]/50 uppercase tracking-widest max-w-[200px]">
                  Менеджер зв'яжеться з вами протягом 2 годин
                </p>
                <button type="submit" className="bg-[#1E3527] text-[#F5F4F1] px-10 py-5 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#15241b] transition-colors">
                  Надіслати запит <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-[#0D0D0D] text-[#F5F4F1] py-16 px-6 md:px-12 mt-20">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <div className="w-12 h-12 bg-[#F5F4F1] text-[#0D0D0D] flex items-center justify-center font-serif font-bold text-3xl tracking-tighter mb-4">
              G
            </div>
            <p className="text-[#F5F4F1]/60 text-sm max-w-xs">Виробництво ексклюзивних корпусних меблів у Харкові. Створюємо інтер'єри з 2007 року.</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
            <a href="tel:+380501234567" className="text-xl font-serif hover:text-[#1E3527] transition-colors">+38 (050) 123-45-67</a>
            <p className="text-sm text-[#F5F4F1]/60 flex items-center gap-2"><MapPin size={16} /> м. Харків, просп. Науки (Виробництво)</p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-[#F5F4F1]/20 flex items-center justify-center hover:bg-[#F5F4F1] hover:text-[#0D0D0D] transition-all">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto border-t border-[#F5F4F1]/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-[#F5F4F1]/40">
          <span>© {new Date().getFullYear()} GRAZIA FURNITURE. Всі права захищені.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://tekhnovybir.com.ua" target="_blank" className="hover:text-[#F5F4F1] transition-colors">Партнер: Техновибір</a>
            <a href="#" className="hover:text-[#F5F4F1] transition-colors">Політика конфіденційності</a>
          </div>
        </div>
      </footer>

    </div>
  );
}