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
  Phone,
  Hammer,
  Globe,
  X,
  Star,
  PlayCircle
} from 'lucide-react';

// Безпечна ініціалізація системних змінних середовища для зв'язку з базою даних
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

// Деталізовані дані по Харкову та Області (Включаючи Полтаву та Вовчанськ)
const KHARKIV_DETAILED_PINS = [
  { 
    id: 'naukova', 
    name: 'м. Наукова', 
    top: '42%', left: '48%', 
    project: 'Кухня-Студія Loft, 2023', 
    radius: 'Радіус робіт: 300м', 
    type: 'city',
    description: 'Комплексне меблювання сучасної квартири у новобудові біля метро Наукова. Використано преміальні матеріали: італійський шпон та австрійська фурнітура Blum.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200', caption: 'Ідеальне поєднання матового графіту та теплого дерева. Фасади не залишають відбитків.' },
      { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200', caption: 'Робоча зона з підсвіткою. Стільниця зі штучного каменю, стійка до подряпин та температури.' }
    ]
  },
  { 
    id: 'saltovka', 
    name: 'Салтівка (522 м/р)', 
    top: '35%', left: '60%', 
    project: 'Модульна вітальня та гардероб', 
    radius: 'Радіус робіт: 500м', 
    type: 'city',
    description: 'Оптимізація простору для великої родини. Створили приховані системи зберігання та інтегрували ТВ-зону в єдиний монолітний ансамбль.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', caption: 'ТВ-зона з прихованою проводкою. Нічого зайвого, тільки чисті лінії.' },
      { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200', caption: 'Гардеробна система. Кожна полиця розрахована до міліметра під потреби клієнта.' }
    ]
  },
  { 
    id: 'gagarina', 
    name: 'пр. Гагаріна (13 лікарня)', 
    top: '55%', left: '52%', 
    project: 'Світла неокласика', 
    radius: 'Радіус робіт: 400м', 
    type: 'city',
    description: 'Вишукана кухня з фрезерованими фасадами. Класичний стиль у сучасній обробці з використанням довговічної емалі.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200', caption: 'Фрезеровані фасади ручної роботи. Глибокий білий колір, який не жовтіє з часом.' }
    ]
  },
  { 
    id: 'zhukova', 
    name: 'Маршала Жукова (21 лікарня)', 
    top: '60%', left: '62%', 
    project: 'Дитяча та Кабінет', 
    radius: 'Радіус робіт: 300м', 
    type: 'city',
    description: 'Екологічні меблі для дитячої кімнати з гіпоалергенних матеріалів та ергономічний кабінет для роботи вдома.',
    rating: 4.9,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200', caption: 'Робочий кабінет з масиву дуба. Інвестиція в продуктивність та статус.' }
    ]
  },
  { 
    id: 'poltava', 
    name: 'Полтава', 
    top: '40%', left: '20%', 
    project: 'Резиденція преміум-класу', 
    radius: 'Радіус робіт: 2 км', 
    type: 'region',
    description: 'Масштабний виїзний проєкт у Полтаві. Повне меблювання будинку: від розкішної кухні до облаштування винного льоху.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200', caption: 'Велика кухня для заміського будинку. Центр сімейного тяжіння.' }
    ]
  },
  { 
    id: 'volchansk', 
    name: 'Вовчанськ', 
    top: '15%', left: '75%', 
    project: 'Заміський комплекс', 
    radius: 'Радіус робіт: 1.5 км', 
    type: 'region',
    description: 'Еко-проєкт із використанням масиву дерева та шпону. Природні текстури, які гармонійно вписуються в ландшафт.',
    rating: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1600607687644-b04fd5910f59?auto=format&fit=crop&q=80&w=1200', caption: 'Природні текстури та масив дерева. Інтер\'єр, що дихає.' }
    ]
  },
];

export default function GraziaFurnitureSystem() {
  const [projects, setProjects] = useState<any[]>([]);
  
  // Управління мапою
  const [mapLevel, setMapLevel] = useState<'globe' | 'kharkiv'>('globe');
  const [activePin, setActivePin] = useState(KHARKIV_DETAILED_PINS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Управління галереєю (Модальне вікно)
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{url: string, caption: string} | null>(null);

  const [currentSlide, setCurrentSlide] = useState(1);
  const [calcForm, setCalcForm] = useState({ spaceType: '', room: '', style: '', material: '', budget: '', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. D3.js Глобус
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

        // ТІЛЬКИ УКРАЇНА
        const ukraineMarker = { lon: 31.16, lat: 48.37 }; 

        let time = 0;
        const initialRotation = [-20, -40, 0]; 

        const render = () => {
          time += 0.003; 
          projection.rotate([initialRotation[0] + time * 15, initialRotation[1], initialRotation[2]]);

          ctx.clearRect(0, 0, width, height);

          // Океан
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

          // Тінь
          const shadowGradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
          shadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
          shadowGradient.addColorStop(1, 'rgba(0,0,0,0.15)');
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = shadowGradient;
          ctx.fill();

          // Пульсуюча точка України
          const center = projection.invert([cx, cy]);
          if (center) {
            const dist = d3.geoDistance(center, [ukraineMarker.lon, ukraineMarker.lat]);
            if (dist < Math.PI / 2) {
              const [x, y] = projection([ukraineMarker.lon, ukraineMarker.lat]);
              const pulse = 4 + Math.sin(Date.now() * 0.005) * 3;
              
              ctx.beginPath();
              ctx.arc(x, y, pulse + 6, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(30, 53, 39, 0.4)'; // Зелене гало Grazia
              ctx.fill();

              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fillStyle = '#1E3527';
              ctx.fill();
            }
          }

          animationFrameId = requestAnimationFrame(render);
        };

        render();
      } catch (error) {
        console.error("Помилка:", error);
      }
    };

    loadScripts();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mapLevel]);

  // Завантаження проєктів (Для сітки знизу)
  useEffect(() => {
    setProjects(KHARKIV_DETAILED_PINS.slice(0, 4));
  }, []);

  // Анімація "Падіння з космосу" в 2.5D Карту
  const triggerMapFocus = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMapLevel('kharkiv');
      setIsTransitioning(false);
    }, 1000); 
  };

  const handleCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  );

  return (
    <div className="min-h-screen bg-[#F5F4F1] text-[#0D0D0D] font-sans selection:bg-[#1E3527] selection:text-[#F5F4F1] overflow-x-hidden">
      
      {/* --- КІНЕМАТОГРАФІЧНА ГАЛЕРЕЯ (MODAL) --- */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] bg-[#F5F4F1] overflow-y-auto animate-fadeIn">
          
          <div className="sticky top-0 bg-[#F5F4F1]/90 backdrop-blur-md px-6 py-4 border-b border-[#0D0D0D]/10 flex justify-between items-center z-50">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3527] block">{selectedProject.name}</span>
              <h2 className="text-xl font-serif">{selectedProject.project}</h2>
            </div>
            <button onClick={() => setSelectedProject(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0D0D0D] text-white hover:scale-105 transition-transform">
              <X size={20} />
            </button>
          </div>

          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row gap-12 mb-16">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-serif mb-6">{selectedProject.project}</h1>
                <p className="text-[#0D0D0D]/70 leading-relaxed max-w-lg mb-8">{selectedProject.description}</p>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-1 text-[#1E3527]">
                    {[...Array(Math.floor(selectedProject.rating))].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    <span className="text-sm font-bold ml-2">{selectedProject.rating} / 5.0</span>
                  </div>
                  <div className="text-xs text-[#0D0D0D]/50 font-mono flex items-center gap-2">
                    <MapPin size={14} /> {selectedProject.radius} (Захищено)
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="bg-[#1E3527] text-white px-6 py-3 rounded-sm text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-colors">
                    <PlayCircle size={16} /> Відеоогляд
                  </button>
                  <button className="border border-[#0D0D0D]/20 text-[#0D0D0D] px-6 py-3 rounded-sm text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#0D0D0D] hover:text-white transition-colors">
                    <InstagramIcon /> Instagram
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative aspect-video bg-[#EBEAE6] rounded-sm overflow-hidden">
                <img src={selectedProject.photos[0]?.url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProject.photos.map((photo: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setLightboxPhoto(photo)}
                  className="relative aspect-square md:aspect-[4/3] bg-[#EBEAE6] cursor-zoom-in group overflow-hidden rounded-sm"
                >
                  <img src={photo.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Gallery detail" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/95 backdrop-blur px-4 py-3 border-l-4 border-[#1E3527]">
                      <p className="text-xs font-medium text-[#0D0D0D] line-clamp-2">{photo.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX ДЛЯ ФОТО З ПРОДАЮЧИМ ТЕКСТОМ --- */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
          
          <img src={lightboxPhoto.url} className="max-w-full max-h-[75vh] object-contain rounded-md shadow-2xl" alt="Zoomed view" />
          
          <div className="mt-8 max-w-2xl text-center">
            <p className="text-white text-lg md:text-xl font-light leading-relaxed border-t border-white/20 pt-6">
              {lightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}


      {/* Навігація */}
      <nav className="absolute top-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0D0D0D] text-[#F5F4F1] flex items-center justify-center font-serif font-bold text-2xl tracking-tighter">
            G
          </div>
          <div>
            <span className="text-sm font-serif font-medium tracking-[0.25em] uppercase block text-[#0D0D0D]">GRAZIA</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[11px] font-semibold tracking-widest uppercase">
          <a href="#" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Колекції</a>
          <a href="#interactive-zone" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Карта 18 років досвіду</a>
          <a href="#calc" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Розрахунок</a>
        </div>

        <button className="bg-[#1E3527] text-[#F5F4F1] px-6 py-3 text-[10px] font-medium tracking-widest uppercase hover:bg-[#15241b] transition-colors">
          Зв'язатись
        </button>
      </nav>

      {/* Hero Секція з 3D Глобусом та Картою */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 max-w-[1600px] mx-auto">
        
        {/* Ліва частина: Типографіка */}
        <div className="flex-1 z-10 w-full">
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
            Справжня історія надійності. Оберіть глобальний перегляд або детальну 3D-карту нижче, щоб побачити радіуси встановлення наших ексклюзивних меблів.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {mapLevel === 'globe' ? (
              <button 
                onClick={triggerMapFocus}
                className={`bg-[#1E3527] text-[#F5F4F1] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#15241b] transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : ''}`}
              >
                Сфокусуватись на мапі <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={() => setMapLevel('globe')}
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
            /* РЕЖИМ 2: 2.5D ІЗОМЕТРИЧНА АРХІТЕКТУРНА КАРТА (AAA Рівень) */
            <div className="w-full h-full relative animate-fadeIn transition-all duration-1000 bg-[#EBEAE6] flex items-center justify-center [perspective:1200px]">
              
              {/* Полотно карти, нахилене в 3D просторі (як стіл архітектора) */}
              <div 
                className="absolute w-[160%] h-[160%] bg-[#F0EFEB] transition-transform duration-1000 ease-in-out"
                style={{ 
                  transform: 'rotateX(60deg) rotateZ(-30deg) translateY(-10%)',
                  transformStyle: 'preserve-3d',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)'
                }}
              >
                {/* Абстрактна архітектурна сітка та артерії (дороги) на самій карті */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#D9D6D1 1px, transparent 1px), linear-gradient(90deg, #D9D6D1 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.5 }}></div>
                
                <svg className="absolute inset-0 w-full h-full text-[#1E3527] opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path fill="none" stroke="currentColor" strokeWidth="0.2" d="M0,50 Q40,30 50,50 T100,20" />
                  <path fill="none" stroke="currentColor" strokeWidth="0.4" d="M30,0 Q40,50 60,100" />
                  <path fill="none" stroke="currentColor" strokeWidth="0.1" d="M10,80 Q50,70 90,90" />
                </svg>

                {/* Рендеринг пінів, які "виростають" з 3D-карти */}
                {KHARKIV_DETAILED_PINS.map((pin) => (
                  <div 
                    key={pin.id}
                    className="absolute cursor-pointer group/pin z-20"
                    style={{ 
                      top: pin.top, 
                      left: pin.left,
                      transformStyle: 'preserve-3d'
                    }}
                    onClick={() => { setActivePin(pin); setSelectedProject(pin); }}
                    onMouseEnter={() => setActivePin(pin)}
                  >
                    {/* Безпечний Радіус (Лежить плоско на карті) */}
                    <div className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1E3527] transition-all duration-700 ${activePin.id === pin.id ? 'scale-100 opacity-40 bg-[#1E3527]' : 'scale-50 opacity-10 border-dashed'}`}
                         style={{ width: pin.type === 'city' ? '120px' : '200px', height: pin.type === 'city' ? '120px' : '200px' }}></div>
                    
                    {/* Контейнер самого піна, який розвертається ОБЛИЧЧЯМ до користувача (компенсує нахил карти) */}
                    <div 
                      className="absolute transform -translate-x-1/2"
                      style={{ 
                        transform: 'rotateZ(30deg) rotateX(-60deg) translateY(-20px)', // Математика ізометрії: стоїть рівно
                        transformOrigin: 'bottom center'
                      }}
                    >
                      {/* Стрижень піна (Ніжка) */}
                      <div className="w-[1px] h-8 bg-gradient-to-t from-[#1E3527] to-transparent mx-auto opacity-50"></div>
                      
                      {/* Сам Пін */}
                      <div className="relative flex flex-col items-center justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 border-[#F5F4F1] transition-all duration-300 ${activePin.id === pin.id ? 'bg-[#1E3527] scale-150 shadow-2xl' : 'bg-[#0D0D0D]/80'}`}></div>
                        
                        {/* Підказка (Теж стоїть рівно) */}
                        <div className="absolute bottom-8 bg-[#0D0D0D]/90 backdrop-blur text-[#F5F4F1] text-[10px] font-mono px-3 py-1.5 rounded-sm shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10">
                          {pin.name}
                          <div className="text-[8px] text-white/50 mt-0.5">{pin.radius}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute top-6 left-6 bg-[#F5F4F1]/90 backdrop-blur-sm px-4 py-2 rounded-full border border-[#0D0D0D]/10 text-[10px] font-mono uppercase tracking-widest z-30">
                2.5D Архітектурна Мапа
              </div>

              {/* Інформаційна панель знизу мапи */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#F5F4F1]/95 backdrop-blur-md p-5 border border-[#0D0D0D]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl cursor-pointer hover:bg-white transition-colors" onClick={() => setSelectedProject(activePin)}>
                <div>
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 text-white inline-block mb-2 ${activePin.type === 'city' ? 'bg-[#0D0D0D]' : 'bg-[#1E3527]'}`}>
                    {activePin.type === 'city' ? 'Місто Харків' : 'Область / Україна'}
                  </span>
                  <h3 className="text-lg font-serif font-medium text-[#0D0D0D]">{activePin.project}</h3>
                  <p className="text-[11px] text-[#0D0D0D]/60 flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin size={12} /> Зона робіт: {activePin.name}
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

      {/* Портфоліо Проєктів (Сітка) */}
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
          {projects.map((project, idx) => (
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

      {/* Форма Розрахунку */}
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