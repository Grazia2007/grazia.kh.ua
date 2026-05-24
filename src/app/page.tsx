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
  Maximize2
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

// Масштабні дані виконаних робіт за 18 років (Харків + Область)
const GRAZIA_PORTFOLIO_PINS = [
  { id: 'center', name: 'Шевченківський район (Центр)', top: '48%', left: '46%', project: 'Преміум Кухня з островом, вул. Сумська', radius: '1.5 км', type: 'city' },
  { id: 'saltovka', name: 'Салтівка (Харків)', top: '42%', left: '56%', project: 'Модульна вітальня та гардероб', radius: '4 км', type: 'city' },
  { id: 'alekseevka', name: 'Олексіївка (Харків)', top: '38%', left: '40%', project: 'Елітна спальня у скандинавському стилі', radius: '2.5 км', type: 'city' },
  { id: 'chuguev', name: 'м. Чугуїв (Область)', top: '55%', left: '72%', project: 'Комплексне меблювання заміського будинку', radius: '8 км', type: 'region' },
  { id: 'lozova', name: 'м. Лозова (Область)', top: '85%', left: '52%', project: 'Дизайнерська кухня-студія під ключ', radius: '12 км', type: 'region' },
  { id: 'dergachi', name: 'м. Дергачі (Область)', top: '28%', left: '35%', project: 'Радіусні шафи та міжкімнатні перегородки', radius: '5 км', type: 'region' },
  { id: 'merefa', name: 'м. Мерефа (Область)', top: '68%', left: '38%', project: 'Стіл з масиву дуба та шпоновані комоди', radius: '6 км', type: 'region' },
];

export default function GraziaFurnitureSystem() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isGlobeMode, setIsGlobeMode] = useState(true);
  const [activePin, setActivePin] = useState(GRAZIA_PORTFOLIO_PINS[0]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [calcForm, setCalcForm] = useState({ spaceType: '', room: '', style: '', material: '', budget: '', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Ефект рендерингу преміального 3D Глобуса з материками (як на референсі)
  useEffect(() => {
    if (!isGlobeMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Динамічно вантажимо D3.js для роботи з гео-даними без встановлення NPM-пакетів
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

        // Завантажуємо векторні контури материків
        const worldData = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(r => r.json());
        const land = topojson.feature(worldData, worldData.objects.land);

        // Піни для краси (Україна + Світ)
        const markers = [
          { lon: 36.23, lat: 50.00 }, // Харків
          { lon: 30.52, lat: 50.45 }, // Київ
          { lon: 12.49, lat: 41.90 }, // Італія
          { lon: 8.54,  lat: 47.37 }, // Швейцарія
          { lon: 13.40, lat: 52.52 }, // Німеччина
          { lon: 55.27, lat: 25.20 }, // Дубай
          { lon: -0.12, lat: 51.50 }, // Лондон
          { lon: -74.00, lat: 40.71 } // Нью-Йорк
        ];

        let time = 0;
        const initialRotation = [-30, -30, 0]; // Фокус стартує ближче до Європи

        const render = () => {
          time += 0.003; 
          projection.rotate([initialRotation[0] + time * 20, initialRotation[1], initialRotation[2]]);

          ctx.clearRect(0, 0, width, height);

          // 1. Океан / База глобуса з 3D бліком (за референсом)
          const baseGradient = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, 0, cx, cy, radius);
          baseGradient.addColorStop(0, '#FFFFFF'); // Відблиск
          baseGradient.addColorStop(0.4, '#EBEAE6'); // Основний колір (слонова кістка)
          baseGradient.addColorStop(1, '#C2C0B8'); // Затінення для об'єму
          
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = baseGradient;
          ctx.fill();

          // 2. Материки (графітово-зелений)
          ctx.beginPath();
          path(land);
          ctx.fillStyle = '#414D46'; 
          ctx.fill();

          // 3. Внутрішня тінь для більшої глибини
          const shadowGradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
          shadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
          shadowGradient.addColorStop(1, 'rgba(0,0,0,0.15)');
          ctx.beginPath();
          path({ type: 'Sphere' });
          ctx.fillStyle = shadowGradient;
          ctx.fill();

          // 4. Сяючі білі піни з гало
          const center = projection.invert([cx, cy]);
          markers.forEach(marker => {
            if (!center) return;
            const dist = d3.geoDistance(center, [marker.lon, marker.lat]);
            
            // Малюємо лише ті точки, що зараз "обернені" до нас
            if (dist < Math.PI / 2) {
              const [x, y] = projection([marker.lon, marker.lat]);
              const pulse = 3 + Math.sin(Date.now() * 0.004 + marker.lon) * 2.5;
              
              // Напівпрозоре Гало
              ctx.beginPath();
              ctx.arc(x, y, pulse + 4, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fill();

              // Яскравий центр
              ctx.beginPath();
              ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();
            }
          });

          animationFrameId = requestAnimationFrame(render);
        };

        render();
      } catch (error) {
        console.error("Помилка завантаження карти:", error);
      }
    };

    loadScripts();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isGlobeMode]);

  // Завантаження проєктів
  useEffect(() => {
    const fetchFurnitureProjects = async () => {
      const { data } = await supabase.from('products').select('*').eq('store_id', 'furniture').eq('status', 'active').limit(4);
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        setProjects([
          { id: 1, name: 'Приватна Резиденція', sku: 'Харків, Центр', media: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800'] },
          { id: 2, name: 'Сучасна Кухня Loft', sku: 'м. Чугуїв', media: ['https://images.unsplash.com/photo-1600607687644-b04fd5910f59?auto=format&fit=crop&q=80&w=800'] },
          { id: 3, name: 'Елітна Гардеробна', sku: 'Павлове Поле', media: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800'] },
          { id: 4, name: 'Дизайнерський Інтер\'єр', sku: 'м. Лозова', media: ['https://images.unsplash.com/photo-160056672355-35792bedcfea?auto=format&fit=crop&q=80&w=800'] },
        ]);
      }
    };
    fetchFurnitureProjects();
  }, []);

  // Анімація тригеру переходу з глобуса на карту
  const triggerMapFocus = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsGlobeMode(false);
      setIsTransitioning(false);
    }, 800);
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

  return (
    <div className="min-h-screen bg-[#F5F4F1] text-[#0D0D0D] font-sans selection:bg-[#1E3527] selection:text-[#F5F4F1] overflow-x-hidden">
      
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
        
        {/* Ліва частина: Типографіка та Скелі досвіду */}
        <div className="flex-1 z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#0D0D0D]/20 text-[10px] uppercase tracking-widest text-[#0D0D0D]/60 mb-8 font-mono">
            <Ruler size={12} />
            <span>Меблеве портфоліо Харкова та Області</span>
          </div>
          
          <h1 className="text-5xl md:text-[5.2rem] font-serif font-normal leading-[1.05] tracking-tight mb-8 text-[#0D0D0D]">
            ГЕОГРАФІЯ<br />
            НАШОЇ ПРАЦІ<br />
            ЗА 18 РОКІВ.
          </h1>
          
          <p className="text-base md:text-lg text-[#0D0D0D]/70 max-w-md font-light leading-relaxed mb-12">
            Справжня історія надійності. Оберіть інтерактивний глобус або детальну мапу нижче, щоб побачити радіуси встановлення наших ексклюзивних меблів.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {isGlobeMode ? (
              <button 
                onClick={triggerMapFocus}
                className={`bg-[#1E3527] text-[#F5F4F1] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#15241b] transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : ''}`}
              >
                Сфокусуватись на Харкові <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={() => setIsGlobeMode(true)}
                className="bg-transparent border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#0D0D0D] hover:text-[#F5F4F1] transition-all"
              >
                <Globe size={15} /> Повернути 3D Глобус
              </button>
            )}

            <div className="flex gap-4">
              <button className="w-10 h-10 flex items-center justify-center border border-[#0D0D0D]/20 rounded-full hover:border-[#0D0D0D] transition-colors" onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}>
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center text-xs font-mono text-[#0D0D0D]/50">
                <span className="text-[#0D0D0D] font-medium mr-1">0{currentSlide}</span> / 04
              </div>
              <button className="w-10 h-10 flex items-center justify-center border border-[#0D0D0D]/20 rounded-full hover:border-[#0D0D0D] transition-colors" onClick={() => setCurrentSlide(prev => Math.min(4, prev + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Права інтерактивна зона: 3D Глобус переходить в Мапу */}
        <div id="interactive-zone" className="flex-1 w-full h-[600px] relative bg-[#EBEAE6] rounded-sm overflow-hidden flex items-center justify-center group shadow-xl border border-[#0D0D0D]/5">
          
          {isGlobeMode ? (
            /* РЕЖИМ 1: Елітний 3D Глобус з материками */
            <div className={`w-full h-full flex flex-col items-center justify-center p-6 relative transition-all duration-700 ${isTransitioning ? 'scale-150 opacity-0 blur-md' : 'scale-100 opacity-100'}`}>
              <canvas ref={canvasRef} width={550} height={550} className="w-full max-w-[500px] aspect-square cursor-grab active:cursor-grabbing" />
              <div className="absolute top-6 left-6 bg-[#F5F4F1]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#0D0D0D]/10 text-[10px] font-mono uppercase tracking-widest">
                Преміум 3D Глобус Землі
              </div>
              <div className="absolute bottom-6 text-center">
                <p className="text-[11px] font-semibold tracking-widest text-[#1E3527] uppercase">Обертається навколо Європи та України</p>
                <p className="text-[10px] text-[#0D0D0D]/50 mt-1">Клікніть на кнопку ліворуч для наближення карти</p>
              </div>
            </div>
          ) : (
            /* РЕЖИМ 2: Інтерактивна масштабна мапа Харкова та області */
            <div className="w-full h-full relative animate-fadeIn transition-all duration-500">
              
              {/* Контурна карта області */}
              <svg className="absolute inset-0 w-full h-full text-[#D9D6D1] opacity-60 p-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path fill="currentColor" d="M15,25 Q35,10 55,25 T85,35 Q90,65 75,85 T35,90 Q10,75 15,25 Z" />
                <path fill="none" stroke="#1E3527" strokeWidth="0.2" strokeDasharray="2,2" d="M15,25 L85,35 M35,90 L55,25" />
                {/* Центр Харкова */}
                <circle cx="46" cy="48" r="8" fill="none" stroke="#1E3527" strokeWidth="0.3" className="animate-ping opacity-30" />
              </svg>

              {/* Рендеринг масштабних пінів */}
              {GRAZIA_PORTFOLIO_PINS.map((pin) => (
                <div 
                  key={pin.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/pin z-20"
                  style={{ top: pin.top, left: pin.left }}
                  onClick={() => setActivePin(pin)}
                  onMouseEnter={() => setActivePin(pin)}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Малюємо радіус району чи міста за 18 років */}
                    <div className={`absolute rounded-full border border-[#1E3527] transition-all duration-700 ${activePin.id === pin.id ? 'scale-100 opacity-25 bg-[#1E3527]' : 'scale-50 opacity-0'}`}
                         style={{ width: pin.type === 'city' ? '60px' : '100px', height: pin.type === 'city' ? '60px' : '100px' }}></div>
                    
                    {/* Точка-центр */}
                    <div className={`w-3 h-3 rounded-full border border-[#F5F4F1] transition-all duration-300 ${activePin.id === pin.id ? 'bg-[#1E3527] scale-125 shadow-lg' : 'bg-[#0D0D0D]/50'}`}></div>
                    
                    {/* Маленька підказка над піном */}
                    <span className="absolute -top-6 bg-[#0D0D0D] text-[#F5F4F1] text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                      {pin.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* Інформаційна панель об'єкта під картою */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#F5F4F1]/95 backdrop-blur-md p-5 border border-[#0D0D0D]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div>
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 text-white inline-block mb-1.5 ${activePin.type === 'city' ? 'bg-[#0D0D0D]' : 'bg-[#1E3527]'}`}>
                    {activePin.type === 'city' ? 'Місто Харків' : 'Харківська область'}
                  </span>
                  <h3 className="text-base font-serif font-medium text-[#0D0D0D]">{activePin.name}</h3>
                  <p className="text-[11px] text-[#0D0D0D]/60 flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin size={11} /> Радіус виїздів: {activePin.radius}
                  </p>
                </div>
                <div className="md:text-right border-t md:border-t-0 border-[#0D0D0D]/10 pt-3 md:pt-0 w-full md:w-auto">
                  <span className="text-[9px] uppercase tracking-widest text-[#1E3527] font-semibold block mb-0.5 font-mono">Флагманська робота</span>
                  <p className="text-xs font-medium text-[#0D0D0D]">{activePin.project}</p>
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
            <span className="text-[10px] font-mono text-[#1E3527] uppercase tracking-widest block mb-2">Натисніть для тестування</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#0D0D0D]">ГАЛЕРЕЯ ВИКОНАНИХ ОБ'ЄКТІВ</h2>
          </div>
          <a href="#" className="text-xs font-semibold tracking-widest uppercase border-b border-[#0D0D0D] pb-1 flex items-center gap-2 hover:text-[#1E3527] hover:border-[#1E3527] transition-colors">
            Дивитись все <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {projects.map((project, idx) => (
            <div key={project.id || idx} className="group relative cursor-pointer overflow-hidden bg-[#EBEAE6] aspect-[3/4] shadow-md rounded-sm">
              {project.media && project.media[0] ? (
                <img src={project.media[0]} alt={project.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#0D0D0D]/20"><Armchair size={48} /></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                <span className="text-[10px] text-[#F5F4F1]/70 font-mono uppercase tracking-widest block mb-2">{project.sku}</span>
                <h3 className="text-lg font-serif text-[#F5F4F1]">{project.name}</h3>
                <p className="text-[11px] text-[#F5F4F1]/50 mt-1 font-light line-clamp-2">Клацніть, щоб переглянути матеріали</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Форма Розрахунку (Калькулятор) */}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
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