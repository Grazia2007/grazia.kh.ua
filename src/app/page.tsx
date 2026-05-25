"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  MousePointer2,
  Box,
  LayoutGrid,
  Palette,
  Gift,
  Phone,
  Check,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 3D Бібліотеки
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center, Float, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// --- КАСТОМНІ ІКОНКИ ДЛЯ СОЦМЕРЕЖ (щоб не було помилок lucide-react) ---
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

// --- КОМПОНЕНТ ПЛАВНОГО ПОЯВЛЕННЯ ПРИ СКРОЛІ (Кінематографічність) ---
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- СИСТЕМА КОЛЬОРІВ ТА МАТЕРІАЛІВ ДЛЯ 3D ---
const getMaterialProps = (colorStr: string) => {
  const isWood = colorStr.includes('Шпон') || colorStr.includes('Дерево');
  
  let hex = '#dddddd';
  // Фарбовані
  if (colorStr.includes('Білий')) hex = '#F5F5F7';
  if (colorStr.includes('Графіт')) hex = '#2C2C2C';
  if (colorStr.includes('Кашемір')) hex = '#E2DCD0';
  if (colorStr.includes('Смарагд')) hex = '#1E3527';
  // Дерево
  if (colorStr.includes('Світлий Дуб')) hex = '#D4B895';
  if (colorStr.includes('Горіх')) hex = '#5E4028';
  if (colorStr.includes('Чорне дерево')) hex = '#211C18';

  return {
    color: hex,
    roughness: isWood ? 0.9 : 0.15,
    metalness: 0.05,
    clearcoat: isWood ? 0 : 0.3,
    clearcoatRoughness: 0.1,
  };
};

// --- КОМПОНЕНТИ ПАРАМЕТРИЧНИХ МЕБЛІВ ---
const ParametricFurniture = ({ type, layout, colorStr, leftCol, rightCol }: { type: string, layout: string, colorStr: string, leftCol: string, rightCol: string }) => {
  const matProps = getMaterialProps(colorStr);
  const countertopMat = { color: '#ffffff', roughness: 0.1, metalness: 0.1 }; 
  const glassMat = { color: '#050505', roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.95 }; // Темне скло для духовки
  const fridgeMat = { color: '#E5E5E5', roughness: 0.3, metalness: 0.8 }; // Метал для відкритого холодильника

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  // КУХНЯ (СУЧАСНА: Антресолі + Пенали)
  if (type === 'Кухня' || type === '') {
    return (
      <group ref={groupRef} scale={[0.75, 0.75, 0.75]}>
        
        {/* ЦЕНТРАЛЬНА РОБОЧА ЗОНА */}
        <group position={[0, 0, 0]}>
          {/* Нижня база */}
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 0.9, 0.6]} />
            <meshPhysicalMaterial {...matProps} />
          </mesh>
          {/* Стільниця */}
          <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.05, 0.04, 0.65]} />
            <meshStandardMaterial {...countertopMat} />
          </mesh>
          
          {/* СУЧАСНИЙ ВЕРХ: 1 ярус (робочий) */}
          <mesh position={[0, 1.6, -0.125]} castShadow receiveShadow>
            <boxGeometry args={[3, 0.5, 0.35]} />
            <meshPhysicalMaterial {...matProps} />
          </mesh>
          
          {/* СУЧАСНИЙ ВЕРХ: 2 ярус (Антресолі глибокі) */}
          <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 0.6, 0.6]} />
            <meshPhysicalMaterial {...matProps} />
          </mesh>
        </group>

        {/* ЛІВИЙ ПЕНАЛ */}
        {leftCol !== 'none' && (
          <group position={[-1.8, 1.225, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.6, 2.45, 0.6]} />
              <meshPhysicalMaterial {...(leftCol === 'fridge_open' ? fridgeMat : matProps)} />
            </mesh>
            {leftCol === 'oven' && (
              <mesh position={[0, 0.1, 0.31]} castShadow>
                <boxGeometry args={[0.55, 0.8, 0.02]} />
                <meshStandardMaterial {...glassMat} />
              </mesh>
            )}
          </group>
        )}

        {/* ПРАВИЙ ПЕНАЛ */}
        {rightCol !== 'none' && (
          <group position={[1.8, 1.225, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.6, 2.45, 0.6]} />
              <meshPhysicalMaterial {...(rightCol === 'fridge_open' ? fridgeMat : matProps)} />
            </mesh>
            {rightCol === 'oven' && (
              <mesh position={[0, 0.1, 0.31]} castShadow>
                <boxGeometry args={[0.55, 0.8, 0.02]} />
                <meshStandardMaterial {...glassMat} />
              </mesh>
            )}
          </group>
        )}

        {/* Кутова (L) або П-подібна - ліве крило */}
        {(layout.includes('Кутова') || layout.includes('П-подібна')) && (
          <group position={[-1.2, 0, 0.9]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.9, 1.2]} />
              <meshPhysicalMaterial {...matProps} />
            </mesh>
            <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.65, 0.04, 1.25]} />
              <meshStandardMaterial {...countertopMat} />
            </mesh>
          </group>
        )}

        {/* П-подібна - праве крило */}
        {layout.includes('П-подібна') && (
          <group position={[1.2, 0, 0.9]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.9, 1.2]} />
              <meshPhysicalMaterial {...matProps} />
            </mesh>
            <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.65, 0.04, 1.25]} />
              <meshStandardMaterial {...countertopMat} />
            </mesh>
          </group>
        )}

        {/* Острів */}
        {layout.includes('островом') && (
          <group position={[0, 0, 1.8]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.9, 0.8]} />
              <meshPhysicalMaterial {...matProps} />
            </mesh>
            <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.85, 0.04, 0.85]} />
              <meshStandardMaterial {...countertopMat} />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  // ШАФА-КУПЕ / ГАРДЕРОБНА
  if (type.includes('Шафа')) {
    return (
      <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 2.5, 0.7]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        {/* Декоративні профілі (розсувна система) */}
        <mesh position={[-0.6, 1.25, 0.36]} castShadow>
          <boxGeometry args={[0.02, 2.4, 0.02]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.6, 1.25, 0.36]} castShadow>
          <boxGeometry args={[0.02, 2.4, 0.02]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // ТВ-ЗОНА ВІТАЛЬНЯ
  if (type.includes('вітальню')) {
    return (
      <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
        {/* Тумба */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.4, 0.5]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        {/* ТБ Панель */}
        <mesh position={[0, 1.4, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.9, 0.05]} />
          <meshStandardMaterial {...glassMat} />
        </mesh>
        {/* Підвісна шафка */}
        <mesh position={[1.5, 1.5, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 1.2, 0.3]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  // ВАННА
  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.6, 0.5]} />
        <meshPhysicalMaterial {...matProps} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.04, 0.55]} />
        <meshStandardMaterial {...countertopMat} />
      </mesh>
      {/* Дзеркало */}
      <mesh position={[0, 1.7, -0.2]} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.02]} />
        <meshStandardMaterial color="#fff" metalness={1} roughness={0} />
      </mesh>
      {/* Раковина (накладна) */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.15, 32]} />
        <meshStandardMaterial color="#fff" roughness={0.1} />
      </mesh>
    </group>
  );
};

// --- КОМПОНЕНТ 3D СМАРТФОНА (ДЛЯ ФУТЕРА) ---
const SmartphoneWidget = () => {
  return (
    <div className="w-[300px] h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8} floatingRange={[-0.1, 0.1]}>
          <group rotation={[0, -0.15, 0]}>
            {/* Корпус телефону */}
            <RoundedBox args={[1.7, 3.4, 0.15]} radius={0.15} smoothness={4} castShadow>
              <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
            </RoundedBox>
            
            {/* Екран (Чорне скло) */}
            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[1.55, 3.25]} />
              <meshBasicMaterial color="#050505" />
            </mesh>

            {/* HTML Інтерфейс екрану з кнопками */}
            <Html transform position={[0, 0, 0.09]} distanceFactor={1.5} center zIndexRange={[100, 0]}>
              <div className="w-[155px] h-[325px] flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#1E3527] to-black rounded-[20px] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border border-white/5">
                <div className="text-white text-center">
                  <span className="block text-[8px] font-mono text-white/50 uppercase tracking-widest mb-1">Grazia</span>
                  <span className="block text-sm font-serif">Socials</span>
                </div>
                
                <a href="https://www.instagram.com/grazia.kh.ua/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-2xl flex items-center justify-center shadow-[0_5px_15px_rgba(225,48,108,0.4)] hover:scale-110 transition-transform duration-300">
                  <InstagramIconSVG size={24} color="white" />
                </a>
                
                <a href="https://www.youtube.com/@graziakhua/videos" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#FF0000] rounded-2xl flex items-center justify-center shadow-[0_5px_15px_rgba(255,0,0,0.4)] hover:scale-110 transition-transform duration-300">
                  <YoutubeIconSVG size={24} color="white" />
                </a>

                {/* Імітація "чубчика" iPhone */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black rounded-full"></div>
                {/* Імітація полоски Home */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full"></div>
              </div>
            </Html>
          </group>
        </Float>
      </Canvas>
    </div>
  );
};


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
  const [themeLoaded, setThemeLoaded] = useState(false); 
  
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [mapLevel, setMapLevel] = useState<'globe' | 'kharkiv'>('globe');
  const [activePin, setActivePin] = useState<any>(DEFAULT_MAP_LOCATIONS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{url: string, caption: string} | null>(null);
  
  // СТЕЙТ ДЛЯ НОВОГО 3D КОНФІГУРАТОРА
  const [configStep, setConfigStep] = useState(1);
  const [configData, setConfigData] = useState({
    type: 'Кухня', // За замовчуванням
    layout: 'Пряма',
    leftModule: 'none', // none, fridge_built, fridge_open, oven
    rightModule: 'none', // none, fridge_built, fridge_open, oven
    style: '',
    color: 'Фарбований МДФ: Білий', // За замовчуванням
    dimensions: { length: '', width: '', height: '' },
    gift: '',
    phone: '',
    time: 'Найближчим часом'
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // 1. D3.js 3D-Глобус 
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
          center: [36.2261, 50.0060], // Точний центр — Держпром
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

  // ФУНКЦІЯ ВІДПРАВКИ НОВОГО 3D КОНФІГУРАТОРА
  const handleCalcSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase.from('orders').insert({
        store_id: 'furniture',
        customer_name: 'Лід з 3D Конфігуратора',
        total_amount: 0,
        status: 'draft',
        ttn_number: `3D: ${configData.type} / ${configData.layout} / Пенали: L(${configData.leftModule}), R(${configData.rightModule}) / Розміри: ${configData.dimensions.length}x${configData.dimensions.width}x${configData.dimensions.height}`
      });

      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
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
                    <InstagramIconSVG size={16} /> Перейти в Instagram
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

      {/* --- PREMIUM 3D CONFIGURATOR --- */}
      <FadeIn delay={0.3} className="px-6 md:px-12 py-12 max-w-[1600px] mx-auto">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
          
          {/* ЛІВА ЧАСТИНА: СПРАВЖНЯ 3D СЦЕНА */}
          <div className="lg:w-1/2 relative bg-[#111111] overflow-hidden flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 min-h-[400px] cursor-grab active:cursor-grabbing">
            {/* Декоративний фон */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
            
            <div className="absolute inset-0 z-10">
              <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                
                {/* Студійне HDR освітлення для красивих відблисків */}
                <Environment preset="city" />
                
                {/* Компонент, який будує меблі */}
                <Suspense fallback={null}>
                  <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Center>
                      <ParametricFurniture 
                        type={configData.type} 
                        layout={configData.layout} 
                        colorStr={configData.color} 
                        leftCol={configData.leftModule}
                        rightCol={configData.rightModule}
                      />
                    </Center>
                  </Float>
                </Suspense>

                {/* М'які тіні на підлозі */}
                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                
                {/* Управління камерою */}
                <OrbitControls 
                  enableZoom={true} 
                  enablePan={false} 
                  minPolarAngle={Math.PI / 4} 
                  maxPolarAngle={Math.PI / 2} 
                  autoRotate 
                  autoRotateSpeed={0.5} 
                />
              </Canvas>
            </div>

            <div className="absolute bottom-8 text-center w-full z-20 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-mono uppercase tracking-widest mb-3">
                <Sparkles size={12} className="text-yellow-400" /> GRAZIA 3D ENGINE
              </div>
              <h3 className="text-white font-serif text-xl tracking-wide opacity-80">
                Інтерактивна візуалізація
              </h3>
              <p className="text-white/40 text-xs mt-1">Покрутіть модель мишкою</p>
            </div>
            
            {/* Індикатори параметрів поверх 3D */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20 pointer-events-none">
              {configData.type && <span className="bg-black/50 backdrop-blur border border-white/10 text-white/80 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm">{configData.type}</span>}
              {configData.color && <span className="bg-black/50 backdrop-blur border border-white/10 text-white/80 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm">{configData.color}</span>}
              {configData.layout && configData.type === 'Кухня' && <span className="bg-black/50 backdrop-blur border border-white/10 text-white/80 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm">{configData.layout}</span>}
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА: ПАНЕЛЬ КЕРУВАННЯ */}
          <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col relative bg-[var(--bg-main)]">
            
            {/* Прогрес бар */}
            {!formSubmitted && (
              <div className="mb-10">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] mb-3">
                  <span>Крок {configStep} з 6</span>
                  <span>{Math.round((configStep / 6) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[var(--accent-main)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(configStep / 6) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                
                {/* КРОК 1: ТИП ВИРОБУ */}
                {configStep === 1 && !formSubmitted && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Що будемо створювати?</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Оберіть базову конфігурацію для 3D моделювання.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Кухня', 'Шафа-купе / Гардеробна', 'Меблі у вітальню', 'Меблі для ванної'].map((item) => (
                        <div 
                          key={item}
                          onClick={() => setConfigData({...configData, type: item})}
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

                {/* КРОК 2: ФОРМ-ФАКТОР */}
                {configStep === 2 && !formSubmitted && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Конфігурація</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6">Налаштуйте планування та модулі для техніки.</p>
                    
                    {configData.type === 'Кухня' ? (
                      <div className="space-y-6">
                        {/* Планування */}
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Основна геометрія</span>
                          <div className="grid grid-cols-2 gap-3">
                            {['Пряма', 'Кутова (L-подібна)', 'П-подібна', 'З островом'].map((item) => (
                              <div 
                                key={item}
                                onClick={() => setConfigData({...configData, layout: item})}
                                className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 text-sm font-medium ${configData.layout === item ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 text-[var(--accent-main)]' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50 text-[var(--text-main)]'}`}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Пенали */}
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Лівий пенал</span>
                            <select 
                              value={configData.leftModule}
                              onChange={(e) => setConfigData({...configData, leftModule: e.target.value})}
                              className="w-full bg-[var(--bg-main)] rounded-lg px-3 py-2 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)] text-sm"
                            >
                              <option value="none">Немає</option>
                              <option value="fridge_built">Вбуд. Холодильник</option>
                              <option value="fridge_open">Ніша під Холодильник</option>
                              <option value="oven">Духовка + НВЧ</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Правий пенал</span>
                            <select 
                              value={configData.rightModule}
                              onChange={(e) => setConfigData({...configData, rightModule: e.target.value})}
                              className="w-full bg-[var(--bg-main)] rounded-lg px-3 py-2 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)] text-sm"
                            >
                              <option value="none">Немає</option>
                              <option value="fridge_built">Вбуд. Холодильник</option>
                              <option value="fridge_open">Ніша під Холодильник</option>
                              <option value="oven">Духовка + НВЧ</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 border border-[var(--border-color)] rounded-lg text-center bg-[var(--bg-card)]">
                        <Box size={40} className="mx-auto text-[var(--text-light)] mb-4" />
                        <p className="text-[var(--text-main)] font-medium">Для цього типу меблів планування стандартне.</p>
                        <p className="text-sm text-[var(--text-muted)] mt-2">Ви зможете обговорити деталі з нашим дизайнером.</p>
                        <button onClick={() => setConfigStep(3)} className="mt-6 text-xs font-bold uppercase tracking-widest text-[var(--accent-main)] border-b border-[var(--accent-main)] pb-1 hover:opacity-70">
                          Перейти до кольору
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* КРОК 3: МАТЕРІАЛ ТА КОЛІР */}
                {configStep === 3 && !formSubmitted && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-2">Дизайн фасадів</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Оберіть основний матеріал. Модель зліва оновиться миттєво.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Преміум Фарбування (Мат / Глянець)</span>
                        <div className="flex gap-3">
                          {['Білий', 'Графіт', 'Кашемір', 'Смарагд'].map(color => (
                            <div key={color} onClick={() => setConfigData({...configData, color: `Фарбований МДФ: ${color}`})} className="flex flex-col items-center gap-2 cursor-pointer group">
                              <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all ${configData.color.includes(color) ? 'border-[var(--accent-main)] scale-110' : 'border-transparent group-hover:border-[var(--border-color)]'}`}>
                                <div className="w-full h-full rounded-full shadow-inner" style={{
                                  backgroundColor: color === 'Білий' ? '#f8f9fa' : color === 'Графіт' ? '#2d3436' : color === 'Кашемір' ? '#dcdde1' : '#013220'
                                }}></div>
                              </div>
                              <span className="text-[9px] uppercase tracking-wider text-[var(--text-main)]">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3">Натуральні текстури (Шпон / Дерево)</span>
                        <div className="flex gap-3">
                          {['Світлий Дуб', 'Горіх', 'Чорне дерево'].map(wood => (
                            <div key={wood} onClick={() => setConfigData({...configData, color: `Шпон: ${wood}`})} className="flex flex-col items-center gap-2 cursor-pointer group">
                              <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all ${configData.color.includes(wood) ? 'border-[var(--accent-main)] scale-110' : 'border-transparent group-hover:border-[var(--border-color)]'}`}>
                                <div className="w-full h-full rounded-full shadow-inner bg-gradient-to-br from-[#8B5A2B] to-[#D2B48C]"></div>
                              </div>
                              <span className="text-[9px] uppercase tracking-wider text-center text-[var(--text-main)]">{wood}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* КРОК 4: РОЗМІРИ */}
                {configStep === 4 && !formSubmitted && (
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

                {/* КРОК 5: ПОДАРУНОК */}
                {configStep === 5 && !formSubmitted && (
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

                {/* КРОК 6: ФІНАЛ (КОНТАКТИ) */}
                {configStep === 6 && !formSubmitted && (
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

                {/* УСПІШНЕ ВІДПРАВЛЕННЯ + UPSELL */}
                {formSubmitted && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center z-10 relative">
                    <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <Check size={40} />
                    </div>
                    <h3 className="text-3xl font-serif text-[var(--text-main)] mb-3">Проєкт отримано!</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-10 max-w-md">
                      Ми вже завантажили ваші параметри в базу. Дизайнер-технолог Марина зв'яжеться з вами у вказаний час ({configData.time}). Подарунок ({configData.gift || 'не обрано'}) зафіксовано за вашим номером.
                    </p>

                    {/* UPSELL BLOCK */}
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

            {/* Навігація між кроками */}
            {!formSubmitted && (
              <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex justify-between items-center relative z-10">
                <button 
                  onClick={() => setConfigStep(Math.max(1, configStep - 1))}
                  className={`flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-opacity ${configStep === 1 ? 'opacity-0 pointer-events-none' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <ChevronLeft size={16} /> Назад
                </button>
                
                {configStep < 6 ? (
                  <button 
                    onClick={() => {
                      // Пропускаємо вибір планування для не-кухонь
                      if (configStep === 1 && configData.type !== 'Кухня') {
                        setConfigStep(3);
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

      {/* --- БЛОК ПАРТНЕРІВ (МАРКІЗА) --- */}
      <FadeIn delay={0.2} className="w-full overflow-hidden bg-[var(--bg-card)] border-y border-[var(--border-color)] py-12 mt-24">
        <div className="max-w-[1600px] mx-auto px-6 mb-6 text-center">
           <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)]">Працюємо з найкращими європейськими брендами</span>
        </div>
        <div className="flex w-[200%]">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex items-center gap-24 whitespace-nowrap pl-12"
          >
            {/* Набір 1 */}
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">BLUM</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">EGGER</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">VIYAR</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">HETTICH</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">FENIX</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">METROLUXE</span>
            
            {/* Набір 2 (дублікат для безшовного циклу) */}
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">BLUM</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">EGGER</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">VIYAR</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">HETTICH</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">FENIX</span>
            <span className="text-3xl font-serif text-[var(--text-muted)] opacity-60">METROLUXE</span>
          </motion.div>
        </div>
      </FadeIn>

      {/* Футер з 3D Смартфоном */}
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
          
          {/* 3D Смартфон Віджет */}
          <div className="flex-1 w-full flex justify-center lg:justify-end relative z-10">
            <div className="relative">
              <div className="absolute top-10 -left-10 text-[10px] font-mono uppercase tracking-widest text-[var(--btn-text)]/40 text-right">
                Живі об'єкти<br/>та бекстейдж<br/>тут 👉
              </div>
              <SmartphoneWidget />
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

      {/* --- ПЛАВАЮЧА КНОПКА TELEGRAM --- */}
      <a
        href="https://t.me/MarinaGrazia"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-14 h-14 bg-[#2AABEE] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(42,171,238,0.3)] hover:scale-110 hover:shadow-[0_0_25px_rgba(42,171,238,0.5)] transition-all duration-300 group"
        title="Написати в Telegram"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.539.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.285-.346-.09l-6.4 4.024-2.76-.86c-.6-.185-.615-.6.125-.89l10.736-4.135c.5-.186.953.114.81.93z" />
        </svg>
        
        <span className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-[var(--modal-bg)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2 rounded-xl text-xs font-medium opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-xl">
          Живий чат з конструктором
        </span>
      </a>

    </div>
  );
}