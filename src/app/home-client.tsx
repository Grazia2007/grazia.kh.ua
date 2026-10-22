"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProjectGallery from '@/components/ProjectGallery';
import SameAsProjectLead from '@/components/SameAsProjectLead';
import { DEFAULT_MAP_LOCATIONS, groupProjectsByCoordinates, WORK_GROUP_ORDER, workGroupOf, projectPath } from './lib/portfolio';
import { 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Ruler, 
  PenTool, 
  Armchair,
  CheckCircle2,
  Globe,
  X,
  Star,
  PlayCircle,
  Eye,
  MousePointer2,
  Quote,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Configurator from '@/components/configurator/Configurator';

// роки досвіду рахуються від заснування (грудень 2007) - цифра оновлюється сама
const YEARS = new Date().getFullYear() - 2007;

// 1 робота, 2-4 роботи, 5+ робіт
const pluralWorks = (n: number) => {
  const d = n % 10, h = n % 100;
  if (d === 1 && h !== 11) return `${n} роботу`;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return `${n} роботи`;
  return `${n} робіт`;
};

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

const ViberIconSVG = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M11.4 0C9.47.03 5.33.34 3.02 2.46 1.3 4.17.7 6.7.63 9.83c-.06 3.13-.14 9 5.5 10.59v2.43s-.04.98.61 1.18c.8.25 1.26-.5 2.02-1.32.42-.45 1-1.11 1.43-1.62 3.9.33 6.9-.42 7.24-.53.79-.26 5.26-.83 5.99-6.77.75-6.13-.37-10-2.38-11.74C20.43 1.47 17.98.1 12.6.01 12.6.01 12.2 0 11.4 0zm.07 1.72c.68-.01 1.03 0 1.03 0 4.55.02 6.72 1.39 7.23 1.85 1.68 1.44 2.54 4.88 1.91 9.94-.6 4.9-4.19 5.21-4.85 5.42-.28.09-2.9.74-6.2.52 0 0-2.46 2.96-3.22 3.73-.12.12-.26.17-.35.14-.13-.03-.17-.19-.16-.41l.02-4.05c-4.77-1.32-4.49-6.3-4.44-8.9.06-2.6.55-4.74 2-6.17 1.96-1.78 5.48-2.05 7.03-2.07zm.64 2.63a.29.29 0 0 0 0 .57c1.58.01 2.88.52 3.93 1.54 1.04 1.01 1.57 2.39 1.59 4.17 0 .16.12.29.28.29.16 0 .29-.13.29-.29-.02-1.9-.6-3.44-1.76-4.58-1.16-1.13-2.61-1.7-4.33-1.7zm-3.84.67a1.1 1.1 0 0 0-.66.22h-.01c-.33.23-.63.52-.9.86-.22.28-.34.56-.37.83-.03.16-.01.32.03.48l.01.01c.24.72.57 1.41.95 2.05.5.9 1.11 1.73 1.83 2.47l.02.03.03.02.02.03.03.02c.74.72 1.58 1.34 2.48 1.84.99.54 1.6.8 1.97.9v.01c.1.03.2.05.31.05.35-.03.68-.17.95-.39.34-.27.62-.58.85-.94.3-.52.13-1.02-.26-1.34-.47-.39-.96-.74-1.47-1.06-.34-.19-.7-.07-.85.12l-.31.39c-.16.2-.46.18-.46.18-2.15-.55-2.73-2.73-2.73-2.73s-.02-.29.18-.45l.39-.31c.19-.15.32-.5.12-.85a11 11 0 0 0-1.06-1.47.9.9 0 0 0-.52-.3zm4.2.8a.29.29 0 0 0 0 .58c1.8.13 2.82 1.06 2.91 2.9a.29.29 0 0 0 .58-.03c-.1-2.1-1.37-3.3-3.45-3.45h-.04zm.35 1.24a.29.29 0 0 0-.03.58c.83.05 1.21.43 1.25 1.26a.29.29 0 0 0 .58-.03c-.06-1.1-.66-1.76-1.8-1.81z"/>
  </svg>
);

const WhatsappIconSVG = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z"/>
  </svg>
);

// tilt телефону Socials: JS лише пише --rx/--ry у rAF, transform належить тільки CSS-правилу .socials-phone
const useSocialsTilt = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    const phone = phoneRef.current;
    if (!stage || !phone) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!mq.matches) return;
    let raf = 0;
    let tx = 0, ty = 0;
    const flush = () => {
      raf = 0;
      phone.style.setProperty('--rx', `${ty}deg`);
      phone.style.setProperty('--ry', `${tx}deg`);
    };
    const onMove = (e: PointerEvent) => {
      // над іконкою кут фіксується - ціль не тікає з-під курсора
      if ((e.target as Element).closest?.('a')) return;
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 12;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(flush); };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return { stageRef, phoneRef };
};

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

let cachedWorldData: any = null;

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

export default function GraziaFurnitureSystem({ initialProjects }: { initialProjects: any[] }) {
  const { stageRef: socialsStageRef, phoneRef: socialsPhoneRef } = useSocialsTilt();
  const [isDark, setIsDark] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false); 
  
  // --- UI SOUND ENGINE (WEB AUDIO API) ---
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const isSoundEnabledRef = useRef(isSoundEnabled);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
    return () => { audioCtxRef.current?.close().catch(() => {}); audioCtxRef.current = null; };
  }, [isSoundEnabled]);

  const playClick = useCallback(() => {
    if (!isSoundEnabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Елегантний, м'який звук (чистий тон без "лазерного" перепаду)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      
      // Дуже тихий і короткий звук з м'якою атакою
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.002); // М'який старт
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03); // Швидке згасання
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch(e) {}
  }, []);

const playWhoosh = useCallback(() => {
    if (!isSoundEnabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return; // <-- TypeScript тепер знає, що ctx точно не null
      
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1;
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.3);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.6);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }, []);

  // Глобальний слухач для м'яких кліків
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, .cursor-pointer, select, a');
      const isMapMarker = target.closest('.custom-mapbox-marker');
      
      // Ігноруємо кліки по пінах карти, там буде свій звук "вушш"
      if (isClickable && !isMapMarker) {
         playClick();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [playClick]);
  // --- КІНЕЦЬ SOUND ENGINE ---

  const [dbProjects, setDbProjects] = useState<any[]>(initialProjects);
  const [mapLevel, setMapLevel] = useState<'globe' | 'kharkiv'>('globe');
  
  // Ініціалізація першої локації як згрупованої
  const [activePin, setActivePin] = useState<any>(
    () => initialProjects[0] || groupProjectsByCoordinates(DEFAULT_MAP_LOCATIONS)[0]
  );
  
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null); // ✅ ДОДАЛИ ЦЕЙ РЯДОК
  const [workFilter, setWorkFilter] = useState<string>('all');

  // відкрита робота має власну адресу (/proekty/...), щоб нею можна було поділитися; кнопка "назад" її закриває
  const openProject = useCallback((p: any) => {
    setSelectedProject(p);
    try { window.history.pushState({ graziaProject: true }, '', projectPath(p)); } catch {}
  }, []);
  const closeProject = useCallback(() => {
    if (window.history.state?.graziaProject) window.history.back();
    else setSelectedProject(null);
  }, []);
  useEffect(() => {
    const onPop = () => { if (!window.history.state?.graziaProject) setSelectedProject(null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const latestRowRef = useRef<HTMLDivElement>(null);

  // плоский список робіт (новіші першими) і розділи для галереї всіх робіт
  const allWorks = useMemo(() => {
    const flat = dbProjects.flatMap((g: any) => g.projects || [g]);
    return [...flat].sort((a: any, b: any) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  }, [dbProjects]);
  const workSections = useMemo(() => {
    const map = new Map<string, any[]>();
    allWorks.forEach((p: any) => {
      const g = workGroupOf(p);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    });
    return WORK_GROUP_ORDER.filter(g => map.has(g)).map(g => ({ label: g, items: map.get(g)! }));
  }, [allWorks]);
  const scrollLatest = (dir: 1 | -1) => {
    const el = latestRowRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * ((card?.offsetWidth || 300) + 16), behavior: 'smooth' });
  };
  
  // --- ОНОВЛЕНИЙ СТЕЙТ ЛАЙТБОКСУ ---
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // глобус стартує лише коли зона видима і ставиться на паузу поза екраном
  const geoZoneRef = useRef<HTMLDivElement>(null);
  const geoVisibleRef = useRef(false);
  const globeResumeRef = useRef<(() => void) | null>(null);
  const [geoInView, setGeoInView] = useState(false);
  useEffect(() => {
    const el = geoZoneRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      geoVisibleRef.current = e.isIntersecting;
      if (e.isIntersecting) { setGeoInView(true); globeResumeRef.current?.(); }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // --- ПАРАЛАКС ДЛЯ БЕКСТЕЙДЖУ ---
  const backstageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: backstageRef,
    offset: ["start end", "end start"]
  });
  // Симетричний зсув: зберігаємо амплітуду, але розподіляємо буфер масштабу рівномірно (верх/низ), щоб не вилазили краї
  const y1 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Обчислення проєктів та поточного активного об'єкта в групі
  const activeGroupProjects = useMemo(() => {
    return activePin?.projects || [];
  }, [activePin]);

  const currentActiveProject = useMemo(() => {
    return activeGroupProjects[activeProjectIndex] || activeGroupProjects[0] || activePin;
  }, [activeGroupProjects, activeProjectIndex, activePin]);

  useEffect(() => {
    // клас .dark уже виставив інлайн-скрипт у layout - тут лише синхронізуємо стан
    setIsDark(document.documentElement.classList.contains('dark'));
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


  // --- ЛОГІКА НАВІГАЦІЇ ЛАЙТБОКСУ ---
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
    
    // Поріг для свайпу (мінімум 50px)
    if (distance > 50) handleNextPhoto();
    if (distance < -50) handlePrevPhoto();
    
    // Скидання
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // 1. D3.js 3D-Глобус 
  useEffect(() => {
    if (mapLevel !== 'globe' || !geoInView || !canvasRef.current) return;
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

        const rect = canvas.getBoundingClientRect();
        const clientWidth = rect.width || canvas.parentElement?.clientWidth || 800;
        const clientHeight = rect.height || canvas.parentElement?.clientHeight || 600;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        const width = clientWidth * dpr;
        const height = clientHeight * dpr;
        
        canvas.width = width;
        canvas.height = height;

        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.35;

        const projection = d3.geoOrthographic()
          .translate([cx, cy])
          .scale(baseRadius)
          .clipAngle(90);

        const path = d3.geoPath(projection, ctx);
        
        let worldData;
        let ukraineFeature;
        
        if (cachedWorldData && cachedWorldData.ukraine) {
          worldData = cachedWorldData.world;
          ukraineFeature = cachedWorldData.ukraine;
        } else {
          worldData = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(r => r.json());
          try {
            // Отримуємо еталонний GeoJSON України з кордонами 1991 року (включно з Кримом)
            ukraineFeature = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/UKR.geo.json').then(r => r.json());
          } catch (e) {
            // Резервний варіант, якщо репозиторій недоступний
            const countriesData = topojson.feature(worldData, worldData.objects.countries).features;
            ukraineFeature = countriesData.find((c: any) => c.properties?.name === 'Ukraine' || c.id === '804');
          }
          cachedWorldData = { world: worldData, ukraine: ukraineFeature };
        }

        const land = topojson.feature(worldData, worldData.objects.land);
        
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

        let lastFrameAt = 0;
        const render = () => {
          if (!geoVisibleRef.current) { animationFrameId = 0; globeResumeRef.current = () => { globeResumeRef.current = null; if (!isDestroyed) animationFrameId = requestAnimationFrame(render); }; return; }
          if (isDestroyed || !canvasRef.current) return;
          // автообертання достатньо 30 fps - вдвічі менше роботи головного потоку
          const now = performance.now();
          if (!isZoomingIn && !isDragging && now - lastFrameAt < 33) { animationFrameId = requestAnimationFrame(render); return; }
          lastFrameAt = now;

          if (isZoomingIn) {
            zoomProgress += 0.015; 
            if (zoomProgress >= 1) zoomProgress = 1;

            const ease = 1 - Math.pow(1 - zoomProgress, 3);

            rotation[0] = startRotation[0] + (targetRotation[0] - startRotation[0]) * ease;
            rotation[1] = startRotation[1] + (targetRotation[1] - startRotation[1]) * ease;

            projection.scale(baseRadius + (baseRadius * 3.5) * ease);

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
            ctx.shadowBlur = 10 * pulseAlpha * dpr;
            ctx.lineWidth = 1.5 * dpr;
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
              const pulse = (4 + Math.sin(Date.now() * 0.005) * 3) * dpr;
              
              ctx.beginPath();
              ctx.arc(x, y, pulse + (7 * dpr), 0, 2 * Math.PI);
              ctx.fillStyle = pulseOuter; 
              ctx.fill();

              ctx.beginPath();
              ctx.arc(x, y, 3.5 * dpr, 0, 2 * Math.PI);
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

    // d3 і геодані тягнемо, коли браузер вільний - не конкурує з першим рендером
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, o?: { timeout: number }) => number);
    const idleId = ric ? ric(() => loadScripts(), { timeout: 1500 }) : window.setTimeout(loadScripts, 300);

    return () => {
      isDestroyed = true;
      if (ric) (window as any).cancelIdleCallback?.(idleId); else clearTimeout(idleId);
      globeResumeRef.current = null;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (cleanupEventsFn) cleanupEventsFn();
    };
  }, [mapLevel, isDark, themeLoaded, geoInView]); 

  // 2. Ініціалізація та стилізація Mapbox
  useEffect(() => {
    if (mapLevel !== 'kharkiv' || !mapContainerRef.current) return;

    let resizeObserver: ResizeObserver | null = null; 

    const initMapbox = async () => {
      // Чекаємо повного завантаження і JS, і CSS для Mapbox
      await Promise.all([
        new Promise((resolve) => {
          if (document.getElementById('mapbox-css')) return resolve(true);
          const link = document.createElement('link');
          link.id = 'mapbox-css';
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          link.onload = resolve;
          document.head.appendChild(link);
        }),
        new Promise((resolve) => {
          if ((window as any).mapboxgl) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js';
          script.onload = resolve;
          document.head.appendChild(script);
        })
      ]);

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;
      
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

        // ФІКС: Примусово оновлюємо розмір полотна під час та після анімацій
        map.on('load', () => {
          map.resize();
        });
        
        // Постійний ресайз протягом перших 1.5 секунд появи
        const resizeInterval = setInterval(() => { 
          if (mapInstanceRef.current) mapInstanceRef.current.resize(); 
        }, 100);
        setTimeout(() => clearInterval(resizeInterval), 1500);

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

        const targets = dbProjects.length > 0 ? dbProjects : groupProjectsByCoordinates(DEFAULT_MAP_LOCATIONS);
        targets.forEach((pin) => {
          const el = document.createElement('div');
          el.className = 'custom-mapbox-marker group cursor-pointer relative flex flex-col items-center';
          
          // Розрахунок та відображення золотого бейджа для згрупованих проєктів (Variant B)
          const badgeCount = pin.projects ? pin.projects.length : 1;
          const badgeHtml = badgeCount > 1 
            ? `<div class="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[9px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center border border-black shadow-md z-20" style="background-color: #D4AF37; color: #000; width: 18px; height: 18px; line-height: 1;">${badgeCount}</div>` 
            : '';

          el.innerHTML = `
            <div class="absolute rounded-full border-2 transition-all duration-700 scale-100 opacity-20" style="border-color: var(--accent-main); background-color: var(--accent-main); width: 90px; height: 90px; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
            <div class="w-4 h-4 rounded-full border-2 z-10 hover:scale-125 transition-transform duration-300 shadow-lg" style="border-color: var(--bg-main); background-color: var(--accent-main);"></div>
            ${badgeHtml}
            <div class="map-tooltip absolute -top-10 text-[10px] font-mono px-3 py-1.5 rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none" style="background-color: var(--btn-bg); color: var(--btn-text);"></div>
          `;
          const tooltipEl = el.querySelector('.map-tooltip');
          if (tooltipEl) {
            tooltipEl.textContent = `${pin.name} ${badgeCount > 1 ? `(${badgeCount} проєкти)` : ''}`;
          }

          el.addEventListener('click', () => {
            playWhoosh(); // Вушш при польоті камери
            setActivePin(pin);
            setActiveProjectIndex(0); // Скидання індексу при кліку на новий пін
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


  const activePinIndex = dbProjects.findIndex(p => p.id === activePin?.id);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-main)] selection:text-white overflow-x-hidden transition-colors duration-500 relative">
      <style dangerouslySetInnerHTML={{__html: `
        html.lenis, html.lenis body {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }
      `}} />

      {/* --- КІНЕМАТОГРАФІЧНА ГАЛЕРЕЯ (MODAL) --- */}
      {selectedProject && (
        <div className="fixed inset-0 z-[110] bg-[var(--bg-main)] overflow-y-auto animate-fadeIn">
          
          <div className="sticky top-0 bg-[var(--modal-bg)] backdrop-blur-md px-6 py-5 border-b border-[var(--border-color)] flex justify-between items-center z-50">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-main)] block font-bold">GRAZIA PORTFOLIO</span>
              <h2 className="text-xl font-serif text-[var(--text-main)]">{selectedProject.name}</h2>
            </div>
            {isGalleryModalOpen ? (
              <button onClick={closeProject} className="h-12 px-6 flex items-center gap-2 rounded-full bg-[var(--btn-bg)] text-[var(--btn-text)] text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-transform duration-300">
                <ArrowLeft size={16} /> Усі роботи
              </button>
            ) : (
              <button onClick={closeProject} aria-label="Закрити" className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--btn-bg)] text-[var(--btn-text)] hover:scale-105 transition-transform duration-300">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="max-w-[1400px] mx-auto px-6 py-12">
            {/* галерея об'єкта: поверхи/приміщення + сцена з сусідніми фото */}
            <ProjectGallery key={selectedProject.id} project={selectedProject} title={selectedProject.project} />

            <div className="mt-8 pt-12 border-t border-[var(--border-color)] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-12 items-start">

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-main)] font-semibold block mb-4">Деталі виконання</span>
                <p className="text-[var(--text-muted)] leading-relaxed text-base mb-8 font-light">{selectedProject.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-[var(--border-color)]">
                  <div className="flex items-center gap-1.5 text-[var(--accent-main)]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    <span className="text-sm font-bold ml-2 text-[var(--text-main)]">{selectedProject.rating} / 5.0</span>
                  </div>
                  <div className="text-xs text-[var(--text-light)] font-mono flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--accent-main)]" /> {selectedProject.name} <span className="opacity-65">(задля безпеки та конфіденційності замовників точна адреса не вказується)</span>
                  </div>
                </div>

                {(selectedProject.youtube_url || selectedProject.instagram_url) && (
                  <div className="flex flex-wrap gap-4">
                    {selectedProject.youtube_url && (
                      <a href={selectedProject.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-[var(--btn-bg)] text-[var(--btn-text)] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 rounded-sm">
                        <PlayCircle size={16} /> Відеоогляд об'єкта
                      </a>
                    )}
                    {selectedProject.instagram_url && (
                      <a href={selectedProject.instagram_url} target="_blank" rel="noopener noreferrer" className="border border-[var(--border-color)] text-[var(--text-main)] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] transition-colors duration-300 rounded-sm">
                        <InstagramIconSVG size={16} color="currentColor" /> Перейти в Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>

              <SameAsProjectLead
                key={`lead-${selectedProject.id}`}
                projectId={selectedProject.id}
                projectTitle={selectedProject.project}
                projectLocation={selectedProject.name}
                coverUrl={selectedProject.photos?.[0]?.url}
                projectPath={projectPath(selectedProject)}
              />
              
            </div>


          </div>
        </div>
      )}

      {/* --- ГЛОБАЛЬНА ГАЛЕРЕЯ ВСІХ РОБІТ --- */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-[105] bg-[var(--bg-main)] overflow-y-auto animate-fadeIn">
          <div className="sticky top-0 bg-[var(--modal-bg)] backdrop-blur-md px-6 py-5 border-b border-[var(--border-color)] flex justify-between items-center z-50">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-main)] block font-bold">{YEARS} РОКІВ ДОСВІДУ</span>
              <h2 className="text-xl font-serif text-[var(--text-main)]">Усі реалізовані проєкти</h2>
            </div>
            <button onClick={() => setIsGalleryModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--btn-bg)] text-[var(--btn-text)] hover:scale-105 transition-transform duration-300 shadow-sm border border-[var(--border-color)]">
              <X size={20} />
            </button>
          </div>
          <div className="max-w-[1600px] mx-auto px-6 py-12">
            {workSections.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-12 -mx-6 px-6">
                {[{ label: 'Усі роботи', items: allWorks, key: 'all' }, ...workSections.map(s => ({ ...s, key: s.label }))].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setWorkFilter(f.key)}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                      workFilter === f.key
                        ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] border-transparent'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {f.label} <span className="ml-1 font-mono opacity-60">{f.items.length}</span>
                  </button>
                ))}
              </div>
            )}

            {workSections.filter(sec => workFilter === 'all' || sec.label === workFilter).map(sec => (
              <section key={sec.label} className="mb-20 last:mb-0">
                <div className="flex items-end gap-6 mb-8">
                  <h3 className="text-2xl md:text-3xl font-serif text-[var(--text-main)] shrink-0">{sec.label}</h3>
                  <div className="flex-1 h-px bg-[var(--border-color)] mb-3"></div>
                  <span className="font-mono text-xs tracking-widest text-[var(--text-light)] mb-1 shrink-0">{String(sec.items.length).padStart(2, '0')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sec.items.map((project: any, idx: number) => (
                    <Link key={project.id || idx} href={projectPath(project)} scroll={false} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); openProject(project); }} className="group relative block cursor-pointer overflow-hidden bg-[var(--bg-card)] aspect-[4/3] shadow-sm rounded-lg border border-[var(--border-color)]">
                      {project.photos && project.photos[0] ? (
                        <Image src={project.photos[0].url} alt={project.project || project.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--text-light)]"><Armchair size={48} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-full p-5 z-10">
                        <span className="text-[9px] text-white/70 font-mono uppercase tracking-widest block mb-1 truncate"><MapPin size={10} className="inline mr-1"/>{project.name}</span>
                        <h3 className="text-base font-serif text-white leading-tight line-clamp-2">{project.project}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
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
          <a href="#interactive-zone" className="hover:text-[var(--accent-main)] transition-colors border-b border-transparent hover:border-[var(--accent-main)] pb-1">Карта {YEARS} років досвіду</a>
          <a href="#calc" className="hover:text-[var(--accent-main)] transition-colors border-b border-transparent hover:border-[var(--accent-main)] pb-1">Розрахунок</a>
        </div>

        <div className="flex items-center pointer-events-auto gap-3 md:gap-5">
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--modal-bg)] backdrop-blur-md flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--accent-main)] hover:text-white hover:border-[var(--accent-main)] transition-all shadow-sm cursor-pointer"
            title={isSoundEnabled ? "Вимкнути звуки UI" : "Увімкнути звуки UI"}
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            role="switch"
            onClick={toggleTheme}
            suppressHydrationWarning
            aria-checked={isDark}
            aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
            title={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
            className="sky-switch"
          >
            <span className="sky-switch__track">
              <span className="sky-switch__night" aria-hidden />
              <span className="sky-switch__stars" aria-hidden />
              <span className="sky-switch__sun" aria-hidden />
              <span className="sky-switch__moon" aria-hidden />
              <span className="sky-switch__clouds" aria-hidden />
              <span className="sky-switch__knob" aria-hidden />
            </span>
          </button>

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
          
          <h1 className="text-5xl md:text-[4.4rem] font-serif font-normal leading-[1.05] tracking-tight mb-8 text-[var(--text-main)]">
            КУХНІ ТА ШАФИ<br />
            НА ЗАМОВЛЕННЯ<br />
            У ХАРКОВІ.
          </h1>
          
          <p className="text-base md:text-lg text-[var(--text-muted)] max-w-md font-light leading-relaxed mb-12">
            Географія нашої праці за {YEARS} років. Оберіть глобальний перегляд або детальну реальну мапу, щоб побачити радіуси встановлення наших ексклюзивних меблів.
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

        <div id="interactive-zone" ref={geoZoneRef} className="flex-1 w-full min-h-[450px] md:min-h-[600px] shrink-0 relative bg-[var(--bg-card)] rounded-sm overflow-hidden flex items-center justify-center group shadow-xl border border-[var(--border-color)]">
          {mapLevel === 'globe' ? (
            <div className={`absolute inset-0 w-full h-full transition-all duration-[1500ms] ${isTransitioning ? 'scale-[3] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
              <canvas 
                ref={canvasRef} 
                className="w-full h-full object-cover cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-500" 
                title="Покрутіть глобус або клікніть, щоб відкрити карту об'єктів"
              />
              <div className="absolute top-6 left-6 bg-[var(--modal-bg)] backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--border-color)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] shadow-sm pointer-events-none">
                Локалізація: Україна
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--modal-bg)] backdrop-blur-md border border-[var(--border-color)] px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] animate-pulse opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <MousePointer2 size={12} /> Натисніть на глобус, щоб відкрити карту
              </div>
            </div>
          ) : (
            <div className={`absolute inset-0 w-full h-full transition-all duration-1000 ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ outline: 'none' }} />
              <div className="absolute top-6 left-6 bg-[var(--modal-bg)] backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-color)] text-[10px] font-mono uppercase tracking-widest z-30 shadow-sm pointer-events-none text-[var(--text-main)]">
                Детальна Карта Робіт
              </div>
              
              {/* ОНОВЛЕНА КАРТКА З ПРЕДПЕРЕГЛЯДОМ ТА ЗОВНІШНІМИ СТРІЛКАМИ ЗЛІВА/СПРАВА */}
              <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
                <div className="max-w-2xl mx-auto relative flex items-center">
                  
                  {/* Кнопка "Назад" - працює для всіх точок */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeGroupProjects.length > 1) {
                        setActiveProjectIndex((prev) => (prev === 0 ? activeGroupProjects.length - 1 : prev - 1));
                      } else {
                        const nextIdx = activePinIndex === 0 ? dbProjects.length - 1 : activePinIndex - 1;
                        const nextPin = dbProjects[nextIdx];
                        setActivePin(nextPin);
                        setActiveProjectIndex(0);
                        mapInstanceRef.current?.flyTo({ center: nextPin.coordinates, zoom: 14.5, essential: true });
                      }
                    }}
                    className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--modal-bg)] border border-[var(--border-color)] shadow-xl flex items-center justify-center text-[var(--text-main)] hover:scale-110 active:scale-95 transition-all z-40 pointer-events-auto cursor-pointer"
                    title="Попередній проєкт / локація"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Основне тіло картки */}
                  <div 
                    onClick={() => openProject(currentActiveProject)}
                    className="w-full bg-[var(--modal-bg)] backdrop-blur-md p-4 sm:p-5 border border-[var(--border-color)] flex items-center gap-4 sm:gap-5 shadow-2xl rounded-xl transition-all duration-300 hover:bg-[var(--bg-card)] cursor-pointer pointer-events-auto"
                  >
                    {/* Квадратний превью-бокс для фотознімка */}
                    {currentActiveProject.photos && currentActiveProject.photos[0] ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)] bg-[var(--bg-main)] relative shadow-sm">
                        <Image 
                          src={currentActiveProject.photos[0].url} 
                          alt={currentActiveProject.project} 
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/5"></div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-light)]">
                        <Armchair size={24} />
                      </div>
                    )}

                    {/* Текстовий блок */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 text-[var(--bg-main)] inline-block rounded-sm ${currentActiveProject.type === 'city' ? 'bg-[var(--text-main)]' : 'bg-[var(--accent-main)]'}`}>
                          {currentActiveProject.type === 'city' ? 'Місто Харків' : 'Область / Україна'}
                        </span>
                        
                        <span className="text-[10px] text-yellow-500 font-bold font-mono flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-sm">
                          <Star size={11} className="fill-yellow-500 text-yellow-500" /> 
                          {currentActiveProject.rating || 5.0}
                        </span>

                        {activeGroupProjects.length > 1 && (
                          <span className="text-[10px] font-mono font-extrabold bg-[var(--accent-main)]/10 text-[var(--accent-main)] px-2.5 py-0.5 rounded-sm border border-[var(--accent-main)]/20">
                            {activeProjectIndex + 1} / {activeGroupProjects.length}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-serif font-medium text-[var(--text-main)] truncate pr-2">
                        {currentActiveProject.project || currentActiveProject.name}
                      </h3>
                      
                      <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5 font-mono truncate">
                        <MapPin size={11} className="text-[var(--accent-main)]" /> {currentActiveProject.name}
                      </p>
                    </div>

                    {/* Посилання на відкриття галереї */}
                    <div className="hidden sm:flex flex-col items-end shrink-0 pl-2">
                      <span className="text-xs font-bold text-[var(--accent-main)] uppercase tracking-wider bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/20 px-3 py-1.5 rounded-md">
                        Детальніше
                      </span>
                    </div>
                  </div>

                  {/* Кнопка "Вперед" - працює для всіх точок */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeGroupProjects.length > 1) {
                        setActiveProjectIndex((prev) => (prev + 1) % activeGroupProjects.length);
                      } else {
                        const nextIdx = (activePinIndex + 1) % dbProjects.length;
                        const nextPin = dbProjects[nextIdx];
                        setActivePin(nextPin);
                        setActiveProjectIndex(0);
                        mapInstanceRef.current?.flyTo({ center: nextPin.coordinates, zoom: 14.5, essential: true });
                      }
                    }}
                    className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--modal-bg)] border border-[var(--border-color)] shadow-xl flex items-center justify-center text-[var(--text-main)] hover:scale-110 active:scale-95 transition-all z-40 pointer-events-auto cursor-pointer"
                    title="Наступний проєкт / локація"
                  >
                    <ChevronRight size={20} />
                  </button>

                </div>
              </div>
              
            </div>
          )}
        </div>
      </FadeIn>

      {/* --- БЕКСТЕЙДЖ / ПРОЦЕС СТВОРЕННЯ --- */}
      <FadeIn delay={0.2} className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto">
        <div ref={backstageRef} className="flex flex-col lg:flex-row gap-16 items-center">
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
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl relative">
              <motion.img 
                style={{ y: y1 }}
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" 
                alt="Преміальні матеріали" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.3] origin-center hover:scale-[1.35] transition-transform duration-700"
              />
            </div>
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl translate-y-12 relative">
              <motion.img 
                style={{ y: y2 }}
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" 
                alt="Фурнітура та текстури" 
                className="absolute inset-0 w-full h-full object-cover scale-[1.3] origin-center hover:scale-[1.35] transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Портфоліо Проєктів */}
      <FadeIn delay={0.2} id="portfolio" className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto border-t border-[var(--border-color)]">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-mono text-[var(--accent-main)] uppercase tracking-widest block mb-2">Натисніть для перегляду</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--text-main)]">ОСТАННІ ШЕДЕВРИ</h2>
          </div>
          <button onClick={() => setIsGalleryModalOpen(true)} className="text-xs font-semibold tracking-widest uppercase border-b border-[var(--text-main)] pb-1 flex items-center gap-2 text-[var(--text-main)] hover:text-[var(--accent-main)] hover:border-[var(--accent-main)] transition-colors">
            Дивитись {pluralWorks(allWorks.length)} <ArrowRight size={14} />
          </button>
        </div>

        <div className="relative">
          <div ref={latestRowRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allWorks.slice(0, 10).map((displayProject: any, idx: number) => (
              <Link key={displayProject.id || idx} href={projectPath(displayProject)} scroll={false} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); openProject(displayProject); }} className="group relative block shrink-0 snap-start basis-[78%] sm:basis-[45%] md:basis-[calc((100%-48px)/4)] cursor-pointer overflow-hidden bg-[var(--bg-card)] aspect-[3/4] shadow-sm rounded-sm">
                {displayProject.photos && displayProject.photos[0] ? (
                  <Image src={displayProject.photos[0].url} alt={displayProject.project || displayProject.name} fill sizes="(max-width: 640px) 78vw, (max-width: 768px) 45vw, 25vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--text-light)]"><Armchair size={48} /></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                  <span className="text-[10px] text-white/70 font-mono uppercase tracking-widest block mb-2">{displayProject.name}</span>
                  <h3 className="text-lg font-serif text-white">{displayProject.project}</h3>
                </div>
              </Link>
            ))}
          </div>
          {allWorks.length > 4 && (
            <div className="hidden md:flex justify-end gap-3 mt-6">
              <button onClick={() => scrollLatest(-1)} aria-label="Попередні роботи" className="w-12 h-12 rounded-full border border-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollLatest(1)} aria-label="Наступні роботи" className="w-12 h-12 rounded-full border border-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
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
            Понад {YEARS} років ми створюємо інтер'єри, які перевершують очікування. Усі відгуки підкріплені реальними проєктами.
          </p>
        </div>
        
        <div className="relative w-full overflow-hidden flex cursor-drag">
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
                   <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                     <Image src={review.projectThumbnail} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview"/>
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
        <Configurator />
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

      {/* SEO Section */}
      <FadeIn delay={0.2} className="w-full py-16 px-6 border-t border-[var(--border-color)]">
        <div className="max-w-[1600px] mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)]">
            Меблі на замовлення у Харкові
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-[var(--text-main)] mt-4 mb-8">
            GRAZIA — корпусні меблі у Харкові з 2007 року
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-sm text-[var(--text-light)] leading-relaxed">
            <p>
              Виготовляємо корпусні меблі на замовлення у Харкові: кухні, шафи-купе, гардеробні, дитячі кімнати, меблі у вітальню та ванну. Виїжджаємо на об'єкт, знімаємо розміри, виконуємо монтаж під ключ по всьому Харкову.
            </p>
            <p>
              За {YEARS} років виробництва меблів у Харкові реалізовано понад 1500 проєктів. Матеріали: австрійське ДСП Egger, фурнітура Blum та Hettich, італійські емалі. Кожне замовлення — під розмір і дизайн конкретного приміщення.
            </p>
            <p>
              Замовити меблі у Харкові просто: залишіть заявку або зателефонуйте — безкоштовно приїдемо та прорахуємо проєкт. Також обслуговуємо Харківську область.
            </p>
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
                        <div className="absolute top-4 -left-20 text-[10px] font-mono uppercase tracking-widest text-[var(--btn-text)]/40 text-right">
                          Живі об'єкти<br/>та бекстейдж<br/>тут 👉
                        </div>
                        
          <div ref={socialsStageRef} className="relative flex justify-center items-center w-[280px] h-[450px]" style={{ perspective: '1200px' }}>
                {/* шар плавання: тільки translateY (CSS), не перетинається з tilt */}
                <div className="socials-float">
                {/* CSS Айфон: transform належить .socials-phone, JS змінює лише --rx/--ry */}
                <div 
                  ref={socialsPhoneRef}
                  className="socials-phone relative w-[220px] h-[440px] bg-black rounded-[44px] p-2 shadow-[-20px_20px_40px_rgba(0,0,0,0.8),inset_0_0_0_1px_#4a4a4c] border-[3px] border-[#1c1c1e] z-10 pointer-events-auto flex flex-col"
                >
                  {/* Фізичні кнопки (тіні та об'єм збоку) */}
                  <div className="absolute -left-[5px] top-[90px] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l-md shadow-[-1px_0_2px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute -left-[5px] top-[130px] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l-md shadow-[-1px_0_2px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute -left-[5px] top-[180px] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l-md shadow-[-1px_0_2px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute -right-[5px] top-[140px] w-[3px] h-[60px] bg-[#3a3a3c] rounded-r-md shadow-[1px_0_2px_rgba(0,0,0,0.5)]"></div>

                  {/* Внутрішній екран */}
                  <div className="relative w-full h-full bg-gradient-to-b from-[#1E3527] to-[#050505] rounded-[36px] overflow-hidden flex flex-col items-center justify-center gap-5 border border-white/5">
                    
                    {/* Ефект відблиску скла (косий) */}
                    <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-30 transform -skew-y-12 origin-top-left opacity-60"></div>

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[70px] h-[22px] bg-black rounded-full z-40 flex items-center justify-between px-2 shadow-sm border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#111] shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_3px_rgba(255,255,255,0.4)] relative">
                        <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-blue-900/40"></div>
                      </div>
                    </div>
                    
                    <div className="text-white text-center mt-6 pointer-events-none z-20">
                      <span className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Grazia</span>
                      <span className="block text-xl font-serif">Socials</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 z-20 [&>a:last-child]:col-span-2">
                      <a 
                        href="https://www.instagram.com/grazia.kh.ua/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Instagram"
                        className="flex flex-col items-center gap-1.5 pointer-events-auto group"
                      >
                        <span className="w-14 h-14 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-[16px] flex items-center justify-center shadow-[0_5px_15px_rgba(225,48,108,0.4)] group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                          <InstagramIconSVG size={28} color="white" />
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/60">Instagram</span>
                      </a>
                      <a 
                        href="https://www.youtube.com/@graziakhua/videos" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="YouTube"
                        className="flex flex-col items-center gap-1.5 pointer-events-auto group"
                      >
                        <span className="w-14 h-14 bg-[#FF0000] rounded-[16px] flex items-center justify-center shadow-[0_5px_15px_rgba(255,0,0,0.4)] group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                          <YoutubeIconSVG size={28} color="white" />
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/60">YouTube</span>
                      </a>
                      <a 
                        href="https://t.me/MarinaGrazia" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Telegram"
                        className="flex flex-col items-center gap-1.5 pointer-events-auto group"
                      >
                        <span className="w-14 h-14 bg-[#2AABEE] rounded-[16px] flex items-center justify-center shadow-[0_5px_15px_rgba(42,171,238,0.4)] group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                          <TelegramIconSVG size={28} color="white" />
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/60">Telegram</span>
                      </a>
                      <a 
                        href="viber://chat?number=%2B380506878243" 
                        aria-label="Viber"
                        className="flex flex-col items-center gap-1.5 pointer-events-auto group"
                      >
                        <span className="w-14 h-14 bg-[#7360F2] rounded-[16px] flex items-center justify-center shadow-[0_5px_15px_rgba(115,96,242,0.4)] group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                          <ViberIconSVG size={28} color="white" />
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/60">Viber</span>
                      </a>
                      <a 
                        href="https://wa.me/380506878243" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="WhatsApp"
                        className="flex flex-col items-center gap-1.5 pointer-events-auto group"
                      >
                        <span className="w-14 h-14 bg-[#25D366] rounded-[16px] flex items-center justify-center shadow-[0_5px_15px_rgba(37,211,102,0.4)] group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                          <WhatsappIconSVG size={28} color="white" />
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/60">WhatsApp</span>
                      </a>
                    </div>

                    {/* Смужка Home Swipe */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80px] h-1 bg-white/40 rounded-full pointer-events-none z-30"></div>
                  </div>
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