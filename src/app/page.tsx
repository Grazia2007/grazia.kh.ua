"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  MousePointer2,
  Box,
  LayoutGrid,
  Phone,
  Check,
  Quote,
  Palette,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- КАСТОМНІ ІКОНКИ ДЛЯ СОЦМЕРЕЖ ---
const InstagramIconSVG = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIconSVG = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const TelegramIconSVG = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.233-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const FadeIn = ({ children, delay = 0, className = "", id }: { children: React.ReactNode, delay?: number, className?: string, id?: string }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- ПРЕМІУМ ПАЛІТРА ---
const PREDEFINED_COLORS = [
  { hex: '#F5F5F7', name: 'Soft White' },
  { hex: '#E2DCD0', name: 'Cashmere' },
  { hex: '#D1C7BD', name: 'Mushroom' },
  { hex: '#8F9394', name: 'Dusty Grey' },
  { hex: '#2C2C2C', name: 'Graphite' },
  { hex: '#1E3527', name: 'Emerald' },
  { hex: '#1A2421', name: 'Deep Forest' },
  { hex: '#1F2A38', name: 'Navy Blue' },
];

const WOOD_TEXTURES = [
  { name: 'Шпон: Світлий Дуб', bg: 'linear-gradient(135deg, #D4B895, #b89369)' },
  { name: 'Шпон: Горіх', bg: 'linear-gradient(135deg, #5E4028, #3e2716)' },
  { name: 'Шпон: Чорне дерево', bg: 'linear-gradient(135deg, #211C18, #110e0c)' },
];

// --- CSS ВІЗУАЛІЗАТОР ЗАМІСТЬ 3D ---
// Щоб уникнути помилок React Reconciler в середовищі виконання
const CSSVisualizer = ({ config }: { config: any }) => {
  const getHex = (colorStr: string) => {
    if (colorStr.startsWith('#')) return colorStr;
    if (colorStr.includes('Світлий Дуб')) return '#D4B895';
    if (colorStr.includes('Горіх')) return '#5E4028';
    if (colorStr.includes('Чорне дерево')) return '#211C18';
    if (colorStr.includes('Білий Камінь')) return '#F9F9F9';
    if (colorStr.includes('Чорний Мармур')) return '#1A1A1A';
    if (colorStr.includes('ДСП') && colorStr.includes('Світле')) return '#E5D3B3';
    if (colorStr.includes('HPL') && colorStr.includes('Бетон')) return '#8c8c8c';
    return '#333333';
  };

  const baseColor = getHex(config.colors.base);
  const upperColor = getHex(config.colors.upper || config.colors.base);
  const countertopColor = getHex(config.colors.countertop);
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center"
        style={{ transform: 'rotateX(5deg) rotateY(-15deg)', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full"></div>
        
        {config.type === 'Кухня' || config.type === '' ? (
           <div className="flex flex-col items-center w-full max-w-[280px] translate-z-[50px] gap-8">
             <div className="flex w-full gap-1 h-20 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-colors duration-700 rounded-sm overflow-hidden" style={{ backgroundColor: upperColor }}>
                <div className="flex-1 border-r border-black/10"></div>
                <div className="flex-1 border-r border-black/10"></div>
                <div className="flex-1"></div>
             </div>
             
             <div className="w-full flex flex-col items-center">
               <div className="w-[105%] h-3 shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-t-sm transition-colors duration-700 z-10" style={{ backgroundColor: countertopColor }}></div>
               <div className="flex w-full gap-1 h-28 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-colors duration-700 rounded-b-sm overflow-hidden" style={{ backgroundColor: baseColor }}>
                  <div className="flex-1 border-r border-white/5"></div>
                  <div className="flex-1 border-r border-white/5"></div>
                  <div className="flex-1"></div>
               </div>
             </div>
           </div>
        ) : (
           <div className="w-48 h-64 shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700 rounded-sm overflow-hidden translate-z-[50px]" style={{ backgroundColor: baseColor }}>
              <div className="w-full h-full flex gap-1">
                 <div className="flex-1 border-r border-white/5"></div>
                 <div className="flex-1"></div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

// БАЗА ВІДГУКІВ
const REVIEWS_DATA = [
  {
    author: 'Анна В.',
    text: 'Неймовірна якість! Фасади ідеально матові, як і хотіли. Інтеграція LED-підсвітки у скляну вітрину виглядає магічно ввечері. Дякуємо за бездоганний монтаж.',
    projectThumbnail: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-43.jpg',
    projectName: 'Флагманська матова графітова кухня'
  },
  {
    author: 'Олександр М.',
    text: 'Дуже вдячний за продуману до дрібниць ТВ-зону. Всі дроти сховані, підсвітка виглядає дуже дорого. Всі гості запитують, де ми замовляли меблі. Сервіс на найвищому рівні.',
    projectThumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
    projectName: 'Модульна вітальня та гардероб'
  },
  {
    author: 'Олена С.',
    text: 'Замовляли кухню в заміський будинок. Матеріали преміум, фурнітура Blum працює як годинник. Дизайн ідеально вписався в наш інтер\'єр, дуже радимо GRAZIA.',
    projectThumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600',
    projectName: 'Заміська кухня-їдальня'
  },
  {
    author: 'Віталій К.',
    text: 'Довго шукали підрядника, який зможе реалізувати складний кутовий пенал. GRAZIA впорались на 10/10. Жодних зазорів, все монолітно та надійно.',
    projectThumbnail: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-50.jpg',
    projectName: 'Організація висувних систем Legrabox'
  }
];

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
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-43.jpg' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-40.jpg' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-47.jpg' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-48.jpg' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-51.jpg' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-50.jpg' },
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-45.jpg' }
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
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200' }
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
      { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200' }
    ]
  }
];

let cachedWorldData: any = null;

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


export default function GraziaFurnitureSystem() {
  const [isDark, setIsDark] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false); 
  
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [mapLevel, setMapLevel] = useState<'globe' | 'kharkiv'>('globe');
  const [activePin, setActivePin] = useState<any>(DEFAULT_MAP_LOCATIONS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  const [configStep, setConfigStep] = useState(1);
  const [activeColorZone, setActiveColorZone] = useState('base'); 
  const [configData, setConfigData] = useState({
    type: 'Кухня', 
    furnitureClass: 'Стандарт',
    layout: 'Пряма',
    leftModule: 'none', 
    rightModule: 'none', 
    upperTier: 'Одноярусні',
    colors: {
      base: '#2C2C2C',
      upper: '#F5F5F7',
      topTier: 'Шпон: Світлий Дуб',
      countertop: 'Камінь: Білий Камінь',
      carcass: '#1A1A1A' 
    },
    dimensions: { length: '', width: '', height: '' },
    gift: '',
    phone: '',
    time: 'Найбли   жчим часом'
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const colorTabs = useMemo(() => {
    if (configData.type === 'Кухня') {
      const tabs = [
        { id: 'base', label: 'Нижні фасади' },
        { id: 'upper', label: 'Верхні фасади' }
      ];
      if (configData.upperTier === 'Двоярусні (з антресолями)') {
        tabs.push({ id: 'topTier', label: 'Антресолі' });
      }
      tabs.push({ id: 'carcass', label: 'Корпус' });
      tabs.push({ id: 'countertop', label: 'Стільниця' });
      return tabs;
    } else {
      return [
        { id: 'base', label: 'Основний колір (Фасади)' },
        { id: 'carcass', label: 'Корпус' }
      ];
    }
  }, [configData.type, configData.upperTier]);

  useEffect(() => {
    if (!colorTabs.find(t => t.id === activeColorZone)) {
      setActiveColorZone('base');
    }
  }, [colorTabs, activeColorZone]);

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

  const handlePrevPhoto = useCallback(() => {
    if (selectedProject && lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! === 0 ? selectedProject.photos.length - 1 : prev! - 1));
    }
  }, [selectedProject, lightboxIndex]);

  const handleNextPhoto = useCallback(() => {
    if (selectedProject && lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % selectedProject.photos.length);
    }
  }, [selectedProject, lightboxIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNextPhoto, handlePrevPhoto]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    
    if (distance > 50) handleNextPhoto();
    if (distance < -50) handlePrevPhoto();
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

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
        window.addEventListener('touchmove', handlePointerMove);
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
  }, [mapLevel, isDark, themeLoaded]); 

  // 2. Ініціалізація та стилізація Mapbox
  useEffect(() => {
    if (mapLevel !== 'kharkiv' || !mapContainerRef.current) return;

    let resizeObserver: ResizeObserver | null = null; 

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
          center: [36.2261, 50.0060],
          zoom: 11.5, 
          pitch: 0,   
          bearing: 0, 
          antialias: true
        });

        mapInstanceRef.current = map;

        if (mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.resize();
          });
          resizeObserver.observe(mapContainerRef.current);
        }

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
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLevel, dbProjects, isDark, themeLoaded]);

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

  const handleCalcSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    const detailedMessage = `
🔥 НОВИЙ ЛІД (3D КОНФІГУРАТОР) 🔥
======================
📞 Телефон: ${configData.phone}
⏰ Час: ${configData.time}
🎁 Подарунок: ${configData.gift || 'Не обрано'}

📦 ТИП: ${configData.type}
💎 КЛАС: ${configData.furnitureClass}
📏 ГАБАРИТИ: ${configData.dimensions.length} x ${configData.dimensions.width} x ${configData.dimensions.height} мм

${configData.type === 'Кухня' ? `
📐 ПЛАНУВАННЯ: ${configData.layout}
🏢 ПЕНАЛИ: 
   - Лів: ${configData.leftModule !== 'none' ? configData.leftModule : 'Немає'}
   - Прав: ${configData.rightModule !== 'none' ? configData.rightModule : 'Немає'}
🔝 ВЕРХНІ СЕКЦІЇ: ${configData.upperTier}
` : ''}

🎨 КОЛЬОРИ:
- Нижні (Основні): ${configData.colors.base}
${configData.type === 'Кухня' ? `- Верхні: ${configData.colors.upper}` : ''}
${configData.type === 'Кухня' && configData.upperTier.includes('антресол') ? `- Антресолі: ${configData.colors.topTier}` : ''}
- Корпус: ${configData.colors.carcass}
${configData.type === 'Кухня' ? `- Стільниця: ${configData.colors.countertop}` : ''}
    `.trim();

    try {
      await supabase.from('orders').insert({
        store_id: 'furniture',
        customer_name: 'Лід з 3D Конфігуратора',
        total_amount: 0,
        status: 'draft',
        ttn_number: detailedMessage 
      });

      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...configData, 
          length: configData.dimensions.length,
          width: configData.dimensions.width,
          height: configData.dimensions.height,
          color: configData.colors.base,
          message: detailedMessage 
        })
      });

      setFormSubmitted(true);
    } catch (err) {
      console.error("Помилка відправки:", err);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!themeLoaded) return <div className="min-h-screen bg-[#F5F4F1] dark:bg-[#0a0a0a]" />;

  const TOTAL_STEPS = 7;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-main)] selection:text-white overflow-x-hidden transition-colors duration-500 relative">
      <style dangerouslySetInnerHTML={{__html: `html { scroll-behavior: smooth; }`}} />

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
                    <InstagramIconSVG size={16} color="currentColor" /> Перейти в Instagram
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

            {/* ОНОВЛЕНА СІТКА ФОТО (Без тексту) */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif text-[var(--text-main)] mb-8">Фотозвіт проєкту</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProject.photos.map((photo: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxIndex(idx)}
                    className="relative aspect-[4/3] bg-[var(--bg-card)] cursor-zoom-in group overflow-hidden rounded-sm border border-[var(--border-color)] shadow-sm"
                  >
                    <img src={photo.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={`Фото ${idx + 1}`} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[var(--accent-main)] shadow-xl">
                        <Eye size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- ОНОВЛЕНИЙ LIGHTBOX ПОВНОЕКРАННИЙ (ЗАВДАННЯ 1) --- */}
      {lightboxIndex !== null && selectedProject && (
        <div 
          className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center animate-fadeIn"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Counter & Close */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
            <div className="text-white/70 font-mono text-sm tracking-widest bg-black/40 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg select-none">
              <span className="text-white font-bold">{lightboxIndex + 1}</span> <span className="opacity-50 mx-1">/</span> {selectedProject.photos.length}
            </div>
            <button 
              onClick={() => setLightboxIndex(null)} 
              className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-all border border-white/10 backdrop-blur-md shadow-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Main Image */}
          <img 
            src={selectedProject.photos[lightboxIndex].url} 
            className="max-w-[95vw] max-h-[85vh] object-contain rounded-sm shadow-2xl transition-transform duration-500 select-none pointer-events-none" 
            alt="Zoomed view" 
            draggable="false"
          />
          
          {/* Left Arrow */}
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all border border-transparent hover:border-white/20 z-50 backdrop-blur-md shadow-lg hidden sm:flex"
          >
            <ChevronLeft size={36} strokeWidth={1.5} />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all border border-transparent hover:border-white/20 z-50 backdrop-blur-md shadow-lg hidden sm:flex"
          >
            <ChevronRight size={36} strokeWidth={1.5} />
          </button>
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
      <FadeIn className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 max-w-[1600px] mx-auto">
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
      </FadeIn>

      {/* --- БЕКСТЕЙДЖ / ПРОЦЕС СТВОРЕННЯ --- */}
      <FadeIn delay={0.2} className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 lg:pr-12">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-main)] block mb-4">Бекстейдж виробництва</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 text-[var(--text-main)] leading-tight">Безкомпромісна якість у кожній деталі</h2>
            <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed mb-6 font-light">
              Ми не приховуємо процес, адже пишаємося ним. Використовуємо лише оригінальні європейські матеріали: вологостійке австрійське ДСП Egger, італійські емалі преміум-класу та натуральний шпон рідкісних порід дерева.
            </p>
            <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed mb-8 font-light">
              Кожен елемент проходить багаторівневий контроль якості на високоточному обладнанні. Ніяких зазорів, ідеальна геометрія та довговічність, перевірена часом.
            </p>
            <div className="flex gap-8 border-t border-[var(--border-color)] pt-8">
               <div>
                 <div className="text-3xl font-serif text-[var(--text-main)] mb-1">100%</div>
                 <div className="text-[10px] font-mono uppercase text-[var(--text-light)] tracking-widest">Контроль якості</div>
               </div>
               <div>
                 <div className="text-3xl font-serif text-[var(--text-main)] mb-1">E1</div>
                 <div className="text-[10px] font-mono uppercase text-[var(--text-light)] tracking-widest">Екологічність</div>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-4 relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" alt="Преміальні матеріали" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"/>
            </div>
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl translate-y-12">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" alt="Фурнітура та текстури" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"/>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Портфоліо Проєктів */}
      <FadeIn delay={0.2} className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto border-t border-[var(--border-color)]">
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
      </FadeIn>

      {/* --- КАРУСЕЛЬ ВІДГУКІВ --- */}
      <FadeIn delay={0.2} className="py-24 overflow-hidden border-y border-[var(--border-color)] bg-[var(--bg-main)] relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[10px] font-mono text-[var(--accent-main)] uppercase tracking-widest block mb-2">Що кажуть клієнти</span>
            <h2 className="text-3xl md:text-5xl font-serif text-[var(--text-main)]">БЕЗДОГАННА РЕПУТАЦІЯ</h2>
          </div>
          <p className="text-[var(--text-muted)] text-sm max-w-sm md:text-right">
            Понад 18 років ми створюємо інтер'єри, які перевершують очікування. Усі відгуки підкріплені реальними проєктами.
          </p>
        </div>
        
        <div className="relative w-full overflow-hidden flex">
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-[var(--bg-main)] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-[var(--bg-main)] to-transparent z-10 pointer-events-none"></div>
          
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
            className="flex gap-6 px-6 w-max"
          >
             {[...REVIEWS_DATA, ...REVIEWS_DATA, ...REVIEWS_DATA].map((review, idx) => (
               <div key={idx} className="w-[350px] md:w-[420px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col justify-between shrink-0 shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-default group">
                 <div className="flex gap-4 items-center mb-6 pb-6 border-b border-[var(--border-color)]">
                   <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                     <img src={review.projectThumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview"/>
                   </div>
                   <div>
                     <span className="text-[9px] uppercase tracking-widest text-[var(--text-light)] font-mono block mb-1">Реалізований проєкт</span>
                     <h4 className="text-sm font-serif text-[var(--text-main)] line-clamp-2 leading-snug">{review.projectName}</h4>
                   </div>
                 </div>
                 
                 <div className="relative">
                   <Quote className="absolute -top-2 -left-2 text-[var(--border-color)] opacity-50" size={32} />
                   <div className="flex text-[var(--accent-main)] mb-4 relative z-10 pl-6">
                     {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                   </div>
                   <p className="text-[var(--text-main)] text-sm md:text-base leading-relaxed mb-8 font-light italic relative z-10 pl-6">
                     "{review.text}"
                   </p>
                   <div className="flex items-center gap-3 pl-6">
                     <div className="w-10 h-10 rounded-full bg-[var(--border-color)] flex items-center justify-center text-[var(--text-main)] font-serif font-bold text-sm shadow-inner">
                       {review.author.charAt(0)}
                     </div>
                     <div>
                       <span className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-widest block">{review.author}</span>
                       <span className="text-[10px] text-[var(--text-light)] flex items-center gap-1 mt-0.5"><CheckCircle2 size={10} className="text-green-500" /> Перевірений клієнт</span>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
          </motion.div>
        </div>
      </FadeIn>

      {/* --- PREMIUM 3D CONFIGURATOR --- */}
      <FadeIn delay={0.3} className="px-6 md:px-12 py-12 max-w-[1600px] mx-auto" id="calc">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
          
          <div className="lg:w-1/2 relative bg-[#111111] overflow-hidden flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 min-h-[400px]">
            <CSSVisualizer config={configData} />

            <div className="absolute bottom-8 text-center w-full z-20 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-mono uppercase tracking-widest mb-3">
                <Sparkles size={12} className="text-yellow-400" /> GRAZIA ENGINE
              </div>
              <h3 className="text-white font-serif text-xl tracking-wide opacity-80">
                Жива візуалізація
              </h3>
            </div>
            
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20 pointer-events-none">
              {configData.type && <span className="bg-black/50 backdrop-blur border border-white/10 text-white/80 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm">{configData.type}</span>}
              {configData.layout && configData.type === 'Кухня' && <span className="bg-black/50 backdrop-blur border border-white/10 text-white/80 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm">{configData.layout}</span>}
              <span className={`backdrop-blur border border-white/10 text-white/80 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm ${configData.furnitureClass === 'Преміум' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-black/50'}`}>
                {configData.furnitureClass}
              </span>
            </div>
          </div>

          <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col relative bg-[var(--bg-main)]">
            {!formSubmitted && (
              <div className="mb-10">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] mb-3">
                  <span>Крок {configStep} з {TOTAL_STEPS}</span>
                  <span>{Math.round((configStep / TOTAL_STEPS) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[var(--accent-main)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(configStep / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                
                {configStep === 1 && !formSubmitted && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Що будемо створювати?</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Оберіть базову конфігурацію для моделювання.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Кухня', 'Шафа-купе / Гардеробна', 'Меблі у вітальню', 'Меблі для ванної'].map((item) => (
                        <div 
                          key={item}
                          onClick={() => {
                            setConfigData({...configData, type: item});
                            if (item !== 'Кухня' && !['base', 'carcass'].includes(activeColorZone)) setActiveColorZone('base');
                          }}
                          className={`p-6 border rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-4 ${configData.type === item ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 shadow-md' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${configData.type === item ? 'bg-[var(--accent-main)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-main)]'}`}>
                            {item === 'Кухня' ? <LayoutGrid size={20} /> : <Box size={20} />}
                          </div>
                          <span className="font-medium text-[var(--text-main)]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {configStep === 2 && !formSubmitted && (
                  <motion.div key="step1.5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Клас виконання</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Це допоможе нам одразу підібрати правильну фурнітуру та матеріали під ваш бюджет.</p>
                    
                    <div className="space-y-4">
                      {[
                        { id: 'Економ', desc: 'Базові матеріали, надійна стандартна фурнітура (плівка, базовий ДСП).', icon: <Layers size={20}/> },
                        { id: 'Стандарт', desc: 'Оптимальний вибір. Фарбовані фасади, доводчики середнього сегменту (Muller).', icon: <Hammer size={20}/> },
                        { id: 'Преміум', desc: 'Максимальна якість. Фурнітура Blum/Hettich, натуральний шпон, камінь, преміум емалі.', icon: <Sparkles size={20}/> }
                      ].map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setConfigData({...configData, furnitureClass: item.id})}
                          className={`p-5 border rounded-lg cursor-pointer transition-all duration-300 flex items-start gap-4 ${configData.furnitureClass === item.id ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 shadow-md' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50'}`}
                        >
                          <div className={`mt-1 flex-shrink-0 ${configData.furnitureClass === item.id ? 'text-[var(--accent-main)]' : 'text-[var(--text-light)]'}`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="font-bold text-lg text-[var(--text-main)] block mb-1">{item.id}</span>
                            <span className="text-sm text-[var(--text-muted)]">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {configStep === 3 && !formSubmitted && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Конфігурація</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6">Налаштуйте планування та модулі для техніки.</p>
                    
                    {configData.type === 'Кухня' ? (
                      <div className="space-y-6 overflow-y-auto pr-2 pb-4 no-scrollbar">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Основна геометрія</span>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {['Пряма', 'Кутова (Ліворуч)', 'Кутова (Праворуч)', 'П-подібна', 'З островом'].map((item) => (
                              <div 
                                key={item}
                                onClick={() => setConfigData({...configData, layout: item})}
                                className={`p-2 border rounded-lg cursor-pointer transition-all duration-300 text-xs text-center font-medium ${configData.layout === item ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 text-[var(--accent-main)]' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50 text-[var(--text-main)]'}`}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Верхні секції</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['Одноярусні', 'Двоярусні (з антресолями)'].map((tier) => (
                              <div 
                                key={tier}
                                onClick={() => setConfigData({...configData, upperTier: tier})}
                                className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 text-sm flex items-center gap-2 ${configData.upperTier === tier ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 text-[var(--accent-main)]' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50 text-[var(--text-main)]'}`}
                              >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${configData.upperTier === tier ? 'border-[var(--accent-main)]' : 'border-[var(--border-color)]'}`}>
                                  {configData.upperTier === tier && <div className="w-2 h-2 rounded-full bg-[var(--accent-main)]" />}
                                </div>
                                {tier}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Лівий пенал (Колона)</span>
                            <select 
                              value={configData.leftModule}
                              onChange={(e) => setConfigData({...configData, leftModule: e.target.value})}
                              className="w-full bg-[var(--bg-main)] rounded-lg px-3 py-2 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)] text-sm cursor-pointer"
                            >
                              <option value="none">Відсутній</option>
                              <option value="fridge_built">Вбудований Холодильник</option>
                              <option value="fridge_open">Ніша під звичайний Холодильник</option>
                              <option value="oven">Пенал: Духовка + Мікрохвильовка</option>
                              <option value="oven">Пенал: Духовка + Кавоварка</option>
                              <option value="storage">Пенал для зберігання (Полиці)</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Правий пенал (Колона)</span>
                            <select 
                              value={configData.rightModule}
                              onChange={(e) => setConfigData({...configData, rightModule: e.target.value})}
                              className="w-full bg-[var(--bg-main)] rounded-lg px-3 py-2 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)] text-sm cursor-pointer"
                            >
                              <option value="none">Відсутній</option>
                              <option value="fridge_built">Вбудований Холодильник</option>
                              <option value="fridge_open">Ніша під звичайний Холодильник</option>
                              <option value="oven">Пенал: Духовка + Мікрохвильовка</option>
                              <option value="oven">Пенал: Духовка + Кавоварка</option>
                              <option value="storage">Пенал для зберігання (Полиці)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 border border-[var(--border-color)] rounded-lg text-center bg-[var(--bg-card)]">
                        <Box size={40} className="mx-auto text-[var(--text-light)] mb-4" />
                        <p className="text-[var(--text-main)] font-medium">Для цього типу меблів планування розраховується індивідуально.</p>
                        <p className="text-sm text-[var(--text-muted)] mt-2">Ви зможете обговорити всі деталі наповнення з нашим дизайнером.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {configStep === 4 && !formSubmitted && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Студія Дизайну</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6">Оберіть зону та налаштуйте колір або матеріал.</p>
                    
                    <div className="flex gap-2 mb-6 border-b border-[var(--border-color)] pb-2 overflow-x-auto no-scrollbar">
                      {colorTabs.map((tab) => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveColorZone(tab.id)}
                          className={`text-xs font-semibold tracking-widest uppercase px-3 py-2 whitespace-nowrap transition-colors ${activeColorZone === tab.id ? 'text-[var(--accent-main)] border-b-2 border-[var(--accent-main)]' : 'text-[var(--text-light)] hover:text-[var(--text-main)]'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-6 overflow-y-auto pr-2 pb-4 no-scrollbar">
                      {activeColorZone === 'countertop' ? (
                        <>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Вибір матеріалу стільниці</span>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              {['Вологостійке ДСП (Egger)', 'Штучний Камінь (Акрил)', 'HPL Компакт-плита', 'Натуральний Кварц/Мармур'].map(mat => {
                                const isSelected = configData.colors.countertop.includes(mat.split(' ')[0]); 
                                return (
                                  <div key={mat} 
                                       onClick={() => setConfigData(prev => ({...prev, colors: {...prev.colors, countertop: `${mat.split(' ')[0]}: Базовий`}}))}
                                       className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 text-xs font-medium text-center ${isSelected ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 text-[var(--accent-main)]' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50 text-[var(--text-main)]'}`}
                                  >
                                    {mat}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Популярні текстури (Демо)</span>
                            <div className="flex gap-3">
                              {['Білий Камінь', 'Чорний Мармур', 'ДСП: Світле Дерево', 'HPL: Бетон'].map(color => (
                                <div key={color} onClick={() => setConfigData(prev => ({...prev, colors: {...prev.colors, countertop: color}}))} className="flex flex-col items-center gap-2 cursor-pointer group w-16">
                                  <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all ${configData.colors.countertop === color ? 'border-[var(--accent-main)] scale-110' : 'border-transparent group-hover:border-[var(--border-color)]'}`}>
                                    <div className="w-full h-full rounded-full shadow-inner" style={{ 
                                      backgroundColor: color.includes('Білий') ? '#F9F9F9' : color.includes('Чорний') ? '#1A1A1A' : color.includes('Дерево') ? '#E5D3B3' : '#8c8c8c' 
                                    }}></div>
                                  </div>
                                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-main)] text-center">{color.split(':')[1] || color}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3 flex justify-between items-center">
                              <span>Преміум Емаль / RAL</span>
                              <div className="relative cursor-pointer group">
                                <label className="flex items-center gap-1 text-[var(--accent-main)] font-semibold cursor-pointer">
                                  <Palette size={14}/> СВІЙ КОЛІР (HEX)
                                  <input 
                                    type="color" 
                                    value={configData.colors[activeColorZone as keyof typeof configData.colors].startsWith('#') ? configData.colors[activeColorZone as keyof typeof configData.colors] : '#ffffff'}
                                    onChange={(e) => setConfigData(prev => ({...prev, colors: {...prev.colors, [activeColorZone]: e.target.value}}))}
                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                  />
                                </label>
                              </div>
                            </span>
                            <div className="flex flex-wrap gap-4">
                              {PREDEFINED_COLORS.map(color => (
                                <div key={color.hex} onClick={() => setConfigData(prev => ({...prev, colors: {...prev.colors, [activeColorZone]: color.hex}}))} className="flex flex-col items-center gap-2 cursor-pointer group">
                                  <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all ${configData.colors[activeColorZone as keyof typeof configData.colors] === color.hex ? 'border-[var(--accent-main)] scale-110 shadow-lg' : 'border-transparent group-hover:border-[var(--border-color)]'}`}>
                                    <div className="w-full h-full rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color.hex }}></div>
                                  </div>
                                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-main)]">{color.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-[var(--border-color)]">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Натуральний Шпон / ДСП під дерево</span>
                            <div className="flex gap-4">
                              {WOOD_TEXTURES.map(wood => (
                                <div key={wood.name} onClick={() => setConfigData(prev => ({...prev, colors: {...prev.colors, [activeColorZone]: wood.name}}))} className="flex flex-col items-center gap-2 cursor-pointer group w-20">
                                  <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all ${configData.colors[activeColorZone as keyof typeof configData.colors] === wood.name ? 'border-[var(--accent-main)] scale-110 shadow-lg' : 'border-transparent group-hover:border-[var(--border-color)]'}`}>
                                    <div className="w-full h-full rounded-full shadow-inner border border-black/20" style={{ background: wood.bg }}></div>
                                  </div>
                                  <span className="text-[9px] uppercase tracking-wider text-center text-[var(--text-main)] leading-tight">{wood.name.replace('Шпон: ', '')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {configStep === 5 && !formSubmitted && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Габарити виробу</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Вкажіть приблизні розміри для точного прорахунку (в міліметрах).</p>
                    
                    <div className="space-y-6">
                      <div className="relative">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Загальна довжина (L)</label>
                        <div className="flex items-center border-b border-[var(--border-color)] focus-within:border-[var(--accent-main)] transition-colors pb-2">
                          <Ruler size={16} className="text-[var(--text-light)] mr-3" />
                          <input 
                            type="number" 
                            placeholder="Наприклад: 3500" 
                            value={configData.dimensions.length}
                            onChange={(e) => setConfigData({...configData, dimensions: {...configData.dimensions, length: e.target.value}})}
                            className="bg-transparent w-full focus:outline-none text-lg text-[var(--text-main)] placeholder:text-[var(--text-light)]"
                          />
                          <span className="text-[var(--text-light)] text-sm font-mono">мм</span>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Ширина / Глибина (W)</label>
                        <div className="flex items-center border-b border-[var(--border-color)] focus-within:border-[var(--accent-main)] transition-colors pb-2">
                          <Ruler size={16} className="text-[var(--text-light)] mr-3" />
                          <input 
                            type="number" 
                            placeholder="Наприклад: 600" 
                            value={configData.dimensions.width}
                            onChange={(e) => setConfigData({...configData, dimensions: {...configData.dimensions, width: e.target.value}})}
                            className="bg-transparent w-full focus:outline-none text-lg text-[var(--text-main)] placeholder:text-[var(--text-light)]"
                          />
                          <span className="text-[var(--text-light)] text-sm font-mono">мм</span>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Висота приміщення (H)</label>
                        <div className="flex items-center border-b border-[var(--border-color)] focus-within:border-[var(--accent-main)] transition-colors pb-2">
                          <Ruler size={16} className="text-[var(--text-light)] mr-3" />
                          <input 
                            type="number" 
                            placeholder="Наприклад: 2600" 
                            value={configData.dimensions.height}
                            onChange={(e) => setConfigData({...configData, dimensions: {...configData.dimensions, height: e.target.value}})}
                            className="bg-transparent w-full focus:outline-none text-lg text-[var(--text-main)] placeholder:text-[var(--text-light)]"
                          />
                          <span className="text-[var(--text-light)] text-sm font-mono">мм</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {configStep === 6 && !formSubmitted && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Ваш гарантований подарунок</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Оберіть бонус, який ми додамо до вашого замовлення безкоштовно.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'Висувне Карго', icon: <Box size={24}/> },
                        { id: 'LED Підсвітка', icon: <Sun size={24}/> },
                        { id: 'Кам\'яна Мийка', icon: <CheckCircle2 size={24}/> }
                      ].map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setConfigData({...configData, gift: item.id})}
                          className={`p-6 border rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-4 ${configData.gift === item.id ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 shadow-md' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${configData.gift === item.id ? 'bg-[var(--accent-main)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-main)]'}`}>
                            {item.icon}
                          </div>
                          <span className="font-medium text-sm text-[var(--text-main)]">{item.id}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {configStep === 7 && !formSubmitted && (
                  <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Проєкт готовий до прорахунку</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Залиште ваш контакт, і наш дизайнер-технолог Марина зв'яжеться з вами.</p>
                    
                    <div className="space-y-6 bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Ваш телефон</label>
                        <div className="flex items-center bg-[var(--bg-main)] rounded-lg px-4 py-3 border border-[var(--border-color)] focus-within:border-[var(--accent-main)] transition-colors">
                          <Phone size={18} className="text-[var(--text-light)] mr-3" />
                          <input 
                            type="tel" 
                            placeholder="+38 (000) 000-00-00" 
                            value={configData.phone}
                            onChange={(e) => setConfigData({...configData, phone: e.target.value})}
                            className="bg-transparent w-full focus:outline-none text-[var(--text-main)] placeholder:text-[var(--text-light)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-2">Зручний час для дзвінка</label>
                        <select 
                          value={configData.time}
                          onChange={(e) => setConfigData({...configData, time: e.target.value})}
                          className="w-full bg-[var(--bg-main)] rounded-lg px-4 py-3 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)] appearance-none cursor-pointer"
                        >
                          <option>Найближчим часом</option>
                          <option>10:00 - 12:00</option>
                          <option>14:00 - 16:00</option>
                          <option>Після 18:00</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {formSubmitted && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center z-10 relative">
                    <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <Check size={40} />
                    </div>
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-3">Проєкт отримано!</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-10 max-w-md">
                      Ми вже завантажили ваші параметри в базу. Дизайнер-технолог Марина зв'яжеться з вами у вказаний час ({configData.time}). Подарунок ({configData.gift || 'не обрано'}) зафіксовано за вашим номером.
                    </p>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E3527] to-[#0D1A13] p-8 text-left w-full border border-white/10 shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                        <Sparkles size={100} className="text-white" />
                      </div>
                      <span className="bg-yellow-400/20 text-yellow-400 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-sm block w-fit mb-4 relative z-10">
                        Спеціальна пропозиція
                      </span>
                      <h4 className="text-white text-xl font-serif mb-2 relative z-10">Преміальна техніка для вашої кухні</h4>
                      <p className="text-white/70 text-sm mb-6 max-w-sm relative z-10">
                        Облаштуйте ваші нові меблі найкращою технікою від нашого офіційного партнера. При замовленні разом з меблями — доставка та монтаж техніки безкоштовно!
                      </p>
                      <a href="https://tekhnovybir.com.ua" target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-yellow-400 transition-colors">
                        Перейти на Tekhnovybir.com.ua <ArrowRight size={14} />
                      </a>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {!formSubmitted && (
              <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex justify-between items-center relative z-10">
                <button 
                  onClick={() => setConfigStep(Math.max(1, configStep - 1))}
                  className={`flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-opacity ${configStep === 1 ? 'opacity-0 pointer-events-none' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <ChevronLeft size={16} /> Назад
                </button>
                
                {configStep < TOTAL_STEPS ? (
                  <button 
                    onClick={() => {
                      if (configStep === 1 && configData.type !== 'Кухня') {
                        setConfigStep(4); 
                      } else {
                        setConfigStep(configStep + 1);
                      }
                    }}
                    className="bg-[var(--btn-bg)] text-[var(--btn-text)] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:opacity-80 transition-opacity rounded-sm shadow-lg"
                  >
                    Далі <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleCalcSubmit()}
                    disabled={isSubmitting || !configData.phone}
                    className="bg-[var(--accent-main)] text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[var(--accent-hover)] transition-colors rounded-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Відправка...' : 'Отримати прорахунок'} <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="w-full bg-[var(--bg-card)] border-y border-[var(--border-color)] py-16 mt-24">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-10">
             <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)]">Працюємо з найкращими європейськими брендами</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {['BLUM', 'EGGER', 'VIYAR', 'HETTICH', 'MATROLUXE'].map(brand => (
               <div key={brand} className="text-2xl md:text-3xl font-serif text-[var(--text-main)] hover:text-[var(--accent-main)] transition-colors cursor-default">
                 {brand}
               </div>
             ))}
          </div>
        </div>
      </FadeIn>

      <footer className="bg-[var(--btn-bg)] text-[var(--btn-text)] pt-24 pb-16 px-6 md:px-12 mt-auto transition-colors duration-500 overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 relative">
          
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="w-16 h-16 bg-[var(--btn-text)] text-[var(--btn-bg)] flex items-center justify-center font-serif font-bold text-4xl tracking-tighter mb-6 mx-auto lg:mx-0">
              G
            </div>
            <p className="opacity-60 text-sm max-w-sm mx-auto lg:mx-0 mb-8 leading-relaxed">
              Виробництво ексклюзивних корпусних меблів у Харкові. Виїжджаємо на об'єкти, працюємо безпосередньо з клієнтами. Створюємо інтер'єри з 2007 року.
            </p>

            <div className="flex flex-col gap-4 items-center lg:items-start font-mono text-sm opacity-80">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span className="text-[var(--text-light)] uppercase tracking-widest text-[10px]">Керівник</span>
                <a href="tel:+380935346322" className="hover:text-white transition-colors">Микола Миколайович: +38 (093) 53 46 322</a>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span className="text-[var(--text-light)] uppercase tracking-widest text-[10px]">Дизайнер-технолог</span>
                <a href="tel:+380506878243" className="hover:text-white transition-colors">Марина: +38 (050) 68 78 243</a>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full flex justify-center lg:justify-end relative z-10 h-[400px]">
            <div className="relative">
              <div className="absolute top-10 -left-10 text-[10px] font-mono uppercase tracking-widest text-[var(--btn-text)]/40 text-right">
                Живі об'єкти<br/>та бекстейдж<br/>тут 👉
              </div>
              
              <div className="relative w-[280px] h-[450px]" style={{ perspective: '1200px' }}>
                <div 
                  className="absolute inset-0 bg-[#0a0a0a] rounded-[32px] p-2 shadow-[20px_20px_60px_rgba(0,0,0,0.8),-5px_-5px_20px_rgba(255,255,255,0.05)] border-[4px] border-[#1a1a1a]"
                  style={{ transform: 'rotateY(-15deg) rotateX(10deg)', transformStyle: 'preserve-3d' }}
                >
                  <div className="w-full h-full bg-gradient-to-b from-[#1E3527] to-[#0a0a0a] rounded-[22px] flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0a0a0a] rounded-full z-10"></div>
                    
                    <div className="text-white text-center mt-4">
                      <span className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Grazia</span>
                      <span className="block text-lg font-serif">Socials</span>
                    </div>
                    
                    <a href="https://www.instagram.com/grazia.kh.ua/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-[18px] flex items-center justify-center shadow-[0_5px_15px_rgba(225,48,108,0.4)] hover:scale-110 transition-transform duration-300">
                      <InstagramIconSVG size={28} color="white" />
                    </a>
                    
                    <a href="https://www.youtube.com/@graziakhua/videos" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#FF0000] rounded-[18px] flex items-center justify-center shadow-[0_5px_15px_rgba(255,0,0,0.4)] hover:scale-110 transition-transform duration-300">
                      <YoutubeIconSVG size={28} color="white" />
                    </a>

                    <a href="https://t.me/MarinaGrazia" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#2AABEE] rounded-[18px] flex items-center justify-center shadow-[0_5px_15px_rgba(42,171,238,0.4)] hover:scale-110 transition-transform duration-300">
                      <TelegramIconSVG size={28} color="white" />
                    </a>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>

        <div className="max-w-[1600px] mx-auto border-t border-white/10 opacity-40 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest relative z-10">
          <span>© {new Date().getFullYear()} GRAZIA FURNITURE. Всі права захищені.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://tekhnovybir.com.ua" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Партнер: Техновибір</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Політика конфіденційності</a>
          </div>
        </div>
      </footer>

    </div>
  );
}