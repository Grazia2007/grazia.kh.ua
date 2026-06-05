"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  X,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  List,
  Image as ImageIcon,
  Star,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- НАЛАШТУВАННЯ БЕЗПЕКИ ---
const MAPBOX_TOKEN = "pk.eyJ1IjoiZ3JhemlhLTIwMDciLCJhIjoiY21wa2RzNWw2MGYwcDJzcjg2Z2l6N3Y1MiJ9.rxyk7nszY-cdSE9D3hrESw";
const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 'https://gpxbzpqnpbbumtiyfstc.supabase.co';
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'sb_publishable_2VUpjTZW1Bf1Bg0Fs0vh6Q_6tIr5eP0';
const BUCKET_NAME = "grazia-media";

// --- ФУНКЦІЯ ОПТИМІЗАЦІЇ ФОТО В WEBP ---
const convertToWebP = (file: File, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Обмежуємо максимальний розмір фото (наприклад, 1920px по ширині) для ще більшої оптимізації
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Помилка конвертації'));
        }, 'image/webp', quality);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

interface Project {
  id: string;
  title: string;
  location_name: string;
  coordinates: string;
  description: string;
  rating: number;
  radius_meters: number;
  media: { url: string, caption: string }[];
  created_at?: string;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState(''); 
  const [realAddress, setRealAddress] = useState(''); 
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('5.0');
  
  // Стани Автокомпліту
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const searchTimeoutRef = useRef<any>(null);

  const [existingMedia, setExistingMedia] = useState<{url: string, caption: string}[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- НОВІ СТАНІ ДЛЯ DRAG & DROP ТА ГОЛОВНОГО ФОТО ---
  const [isDragging, setIsDragging] = useState(false);
  const [coverType, setCoverType] = useState<'existing' | 'new' | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '') {
      setStatusMessage({ type: 'error', text: 'Будь ласка, введіть ключ доступу' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    // Візуально пускаємо в інтерфейс. Справжню перевірку зробить сервер при першій же мутації!
    setIsAuthenticated(true);
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_projects?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!res.ok) throw new Error('Не вдалося завантажити проєкти');
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProjects();
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ви впевнені, що хочете назавжди видалити цей проєкт?')) return;
    try {
      setStatusMessage({ type: 'info', text: 'Видалення...' });
      const res = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${passwordInput}` } // Передаємо пароль для перевірки!
      });
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false); // Викидаємо на екран логіну
          throw new Error('Невірний або застарілий ключ доступу!');
        }
        const errData = await res.json();
        throw new Error(errData.error || 'Помилка при видаленні з БД');
      }
      setStatusMessage({ type: 'success', text: 'Проєкт видалено!' });
      fetchProjects(); 
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setLocationName(project.location_name);
    setRealAddress(''); 
    setSelectedCoordinates(null);
    setDescription(project.description || '');
    setRating(project.rating?.toString() || '5.0');
    setExistingMedia(project.media || []);
    setSelectedFiles([]);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setLocationName('');
    setRealAddress('');
    setSelectedCoordinates(null);
    setDescription('');
    setRating('5.0');
    setExistingMedia([]);
    setSelectedFiles([]);
    setView('list');
  };

  // --- ОБРОБКА АДРЕСИ З AUTOCOMPLETE (З КРАСИВИМ ФОРМАТУВАННЯМ) ---
  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRealAddress(val);
    setSelectedCoordinates(null); 

    // Наївне автозаповнення з красивим форматуванням
    let publicVal = val.replace(/(,\s*)?\d+[а-яА-Яa-zA-Z-]*\s*$/, '').trim();
    if (!editingId || (editingId && val.length > 0)) {
       if (publicVal) {
         // Капіталізуємо кожне слово
         publicVal = publicVal.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
         
         // Якщо юзер не написав тип вулиці, додаємо "вул."
         if (!/(вул|пр|пл|пров|ш\.|бульвар|проспект|площа|провулок)/i.test(publicVal)) {
           publicVal = 'вул. ' + publicVal;
         }
         setLocationName(`м. Харків, ${publicVal}`);
       } else {
         setLocationName('');
       }
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const kharkivCenter = "36.2304,50.0058"; // Пріоритет на центр Харкова, але шукає ВСЮДИ
        // ВИПРАВЛЕНО: Видалено неіснуючий тип "street" з параметрів API Mapbox
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${MAPBOX_TOKEN}&proximity=${kharkivCenter}&language=uk&country=ua&types=address,poi,neighborhood,place,locality`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.features) {
          setAddressSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Mapbox search error:", err);
      }
    }, 400);
  };

  // --- PREMIUM СЕМАНТИЧНЕ РОЗМИТТЯ (Semantic Fuzzing) ---
  const handleSuggestionClick = async (feature: any) => {
    setRealAddress(feature.place_name); 
    setShowSuggestions(false);
    setStatusMessage({ type: 'info', text: 'Обчислення центру вулиці...' });

    // Витягуємо чисту назву вулиці (без номера)
    let streetName = feature.text; 
    
    // Капіталізуємо офіційну назву вулиці на всяк випадок
    streetName = streetName.split(' ').map((w: string) => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');

    let city = "";
    
    // Шукаємо місто або населений пункт в контексті Mapbox
    const placeContext = feature.context?.find((c: any) => c.id.startsWith('place') || c.id.startsWith('locality') || c.id.startsWith('district'));
    
    if (placeContext) {
      city = placeContext.text;
    } else if (feature.place_type.includes('place') || feature.place_type.includes('locality') || feature.place_type.includes('district')) {
      city = feature.text; // Якщо сам результат і є містом
    }

    const publicZone = city ? `м. ${city}, ${streetName}` : streetName;
    setLocationName(publicZone); // АВТОЗАПОВНЕННЯ ПУБЛІЧНОЇ ЗОНИ (ІДЕАЛЬНЕ ФОРМАТУВАННЯ)

    // Якщо це точна адреса будинку, ми робимо хитрий хід (Зміщення):
    if (feature.place_type.includes('address')) {
       try {
         // ВИПРАВЛЕНО: Видалено неіснуючий тип "street"
         const streetUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(publicZone)}.json?access_token=${MAPBOX_TOKEN}&language=uk&types=address,neighborhood`;
         const res = await fetch(streetUrl);
         const data = await res.json();
         if (data.features && data.features.length > 0) {
           setSelectedCoordinates(data.features[0].center); // Зберігаємо центр вулиці!
           setStatusMessage(null);
           return;
         }
       } catch (e) {
         console.error("Fuzzing fallback error", e);
       }
    }

    // Якщо це і так вулиця або місто
    setSelectedCoordinates(feature.center);
    setStatusMessage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewFile = (indexToRemove: number) => setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  const removeExistingFile = (indexToRemove: number) => setExistingMedia(prev => prev.filter((_, idx) => idx !== indexToRemove));

  // --- ЛОГІКА DRAG & DROP ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  // --- ЛОГІКА "ЗРОБИТИ ГОЛОВНОЮ" ---
  const makeMainExisting = (idx: number) => {
    setCoverType('existing');
    setExistingMedia(prev => {
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.unshift(item); // Переміщуємо на початок
      return arr;
    });
  };

  const makeMainNew = (idx: number) => {
    setCoverType('new');
    setSelectedFiles(prev => {
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.unshift(item); // Переміщуємо на початок
      return arr;
    });
  };

const uploadPhotos = async () => {
    const newUploadedUrls: { url: string, caption: string }[] = [];
    for (const file of selectedFiles) {
      
      let fileToUpload: File | Blob = file;
      let fileExt = file.name.split('.').pop();
      let mimeType = file.type;

      // Якщо це зображення (не відео чи щось інше), конвертуємо у WebP
      if (file.type.startsWith('image/')) {
        try {
          setStatusMessage({ type: 'info', text: `Оптимізація ${file.name}...` });
          fileToUpload = await convertToWebP(file, 0.8); // 80% якості - ідеальний баланс
          fileExt = 'webp';
          mimeType = 'image/webp';
        } catch (e) {
          console.warn("Не вдалося конвертувати, завантажуємо оригінал", e);
        }
      }

      const fileName = `portfolio_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`;

      setStatusMessage({ type: 'info', text: `Завантаження оптимізованого фото...` });

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY, 'Content-Type': mimeType },
        body: fileToUpload
      });
      if (!res.ok) throw new Error(`Помилка завантаження файлу ${file.name}`);
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
      newUploadedUrls.push({ url: publicUrl, caption: '' });
    }
    return newUploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locationName) {
      setStatusMessage({ type: 'error', text: 'Заповніть назву та публічну зону.' });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCoordinates: string | undefined;
      
      // Якщо введена нова адреса
      if (realAddress) {
        setStatusMessage({ type: 'info', text: 'Обчислення безпечних координат...' });
        
        if (selectedCoordinates) {
          // Якщо юзер вибрав з випадаючого списку
          finalCoordinates = `(${selectedCoordinates[0]}, ${selectedCoordinates[1]})`;
        } else {
          // FALLBACK: Якщо юзер проігнорував список і просто ввів текст вручну
          const kharkivCenter = "36.2304,50.0058";
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(realAddress)}.json?access_token=${MAPBOX_TOKEN}&proximity=${kharkivCenter}&language=uk`);
          const data = await res.json();
          if (!data.features || data.features.length === 0) {
            throw new Error("Не вдалося знайти цю адресу на карті. Спробуйте змінити запит.");
          }
          
          const feature = data.features[0];
          // Робимо семантичне розмиття для фолбеку
          if (feature.place_type.includes('address')) {
             const streetName = feature.text;
             const publicZone = `${streetName}`;
             // ВИПРАВЛЕНО: Видалено неіснуючий тип "street"
             const streetUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(publicZone)}.json?access_token=${MAPBOX_TOKEN}&language=uk&types=address,neighborhood`;
             const sRes = await fetch(streetUrl);
             const sData = await sRes.json();
             if (sData.features && sData.features.length > 0) {
                finalCoordinates = `(${sData.features[0].center[0]}, ${sData.features[0].center[1]})`;
                if (!locationName || locationName === realAddress) setLocationName(publicZone);
             } else {
                finalCoordinates = `(${feature.center[0]}, ${feature.center[1]})`;
             }
          } else {
             finalCoordinates = `(${feature.center[0]}, ${feature.center[1]})`;
          }
        }
      }

      setStatusMessage({ type: 'info', text: selectedFiles.length > 0 ? `Завантаження ${selectedFiles.length} нових фотографій...` : 'Оновлення даних...' });
      
      const newlyUploadedMedia = await uploadPhotos();
      let finalMediaArray = [...existingMedia, ...newlyUploadedMedia];
      
      // Якщо користувач обрав НОВЕ фото як абсолютно головне
      if (coverType === 'new' && newlyUploadedMedia.length > 0) {
        finalMediaArray = [newlyUploadedMedia[0], ...existingMedia, ...newlyUploadedMedia.slice(1)];
      }

      setStatusMessage({ type: 'info', text: editingId ? 'Оновлення проєкту в БД...' : 'Збереження проєкту в БД...' });

      const projectData: any = {
        title: title,
        location_name: locationName,
        description: description,
        rating: parseFloat(rating),
        radius_meters: 300,
        media: finalMediaArray
      };

      if (finalCoordinates) {
        projectData.coordinates = finalCoordinates;
      }

    const method = editingId ? 'PATCH' : 'POST';
      const endpoint = editingId 
        ? `/api/projects?id=${editingId}`
        : `/api/projects`;

      const dbRes = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${passwordInput}`, // Пароль замість публічного ключа
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const resultData = await dbRes.json();
      if (!dbRes.ok) {
        if (dbRes.status === 401) {
          setIsAuthenticated(false); // Викидаємо на екран логіну
        }
        throw new Error(resultData.error || "Сталася помилка на сервері.");
      }

      setStatusMessage({ type: 'success', text: editingId ? 'Проєкт успішно оновлено!' : 'Проєкт успішно опубліковано!' });
      
      setTimeout(() => {
        setStatusMessage(null);
        resetForm();
        fetchProjects();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Сталася помилка при збереженні.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <div className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4B895] to-transparent opacity-50"></div>
          
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4B895]">
            <Lock size={24} />
          </div>
          
          <h1 className="text-2xl font-serif text-white text-center mb-2">GRAZIA ADMIN</h1>
          <p className="text-white/40 text-center text-sm mb-8">Закрита зона управління портфоліо</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Введіть ключ доступу..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4B895] transition-colors"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#D4B895] text-black font-semibold uppercase tracking-widest text-xs py-3 rounded-lg hover:bg-white transition-colors"
            >
              Увійти
            </button>
          </form>

          {statusMessage && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} /> {statusMessage.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6 md:p-12 pb-24" onClick={() => setShowSuggestions(false)}>
      <div className="max-w-5xl mx-auto">
        
        <header className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] font-mono text-[#D4B895] uppercase tracking-widest block mb-2">Odmen-Menu</span>
            <h1 className="text-3xl font-serif">
              {view === 'list' ? 'Управління портфоліо' : (editingId ? 'Редагування об\'єкта' : 'Додавання об\'єкта')}
            </h1>
          </div>
          <div className="flex gap-4">
            {view === 'form' && (
              <button type="button" onClick={resetForm} className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg">
                <ArrowLeft size={14} /> Назад
              </button>
            )}
            <button 
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest px-2 py-2"
            >
              Вийти
            </button>
          </div>
        </header>

        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 rounded-lg flex items-center gap-3 border ${
              statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
              statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {statusMessage.type === 'error' && <AlertCircle size={18} />}
            {statusMessage.type === 'success' && <CheckCircle2 size={18} />}
            {statusMessage.type === 'info' && <Loader2 size={18} className="animate-spin" />}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </motion.div>
        )}

        {view === 'list' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-white/80 flex items-center gap-2">
                <List size={18} /> Ваші об'єкти ({projects.length})
              </h2>
              <button 
                type="button"
                onClick={() => setView('form')}
                className="bg-[#D4B895] text-black px-5 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
              >
                <Plus size={14} /> Новий об'єкт
              </button>
            </div>

            {isLoadingProjects ? (
              <div className="flex items-center justify-center p-12 text-white/40">
                <Loader2 size={32} className="animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center p-12 bg-white/5 border border-white/10 rounded-2xl">
                <ImageIcon size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60">У вас ще немає доданих проєктів.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="bg-[#111] border border-white/5 hover:border-white/20 transition-colors rounded-xl overflow-hidden shadow-lg flex flex-col">
                    {/* ОНОВЛЕНО: Тепер картинка картки є СТРОГО КВАДРАТНОЮ для першокласного UX */}
                    <div className="aspect-square w-full bg-neutral-900 relative overflow-hidden">
                      {project.media && project.media.length > 0 ? (
                        <img src={project.media[0].url} alt={project.title} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={32}/></div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] flex items-center gap-1">
                        <Star size={10} className="text-[#D4B895]" fill="currentColor" /> {project.rating}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-lg leading-tight mb-1 truncate">{project.title}</h3>
                        <p className="text-[10px] text-white/50 font-mono flex items-center gap-1 mb-4 truncate">
                          <MapPin size={10} /> {project.location_name}
                        </p>
                      </div>
                      <div className="flex gap-2 border-t border-white/10 pt-4 mt-2">
                        <button type="button" onClick={() => handleEdit(project)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded transition-colors flex justify-center items-center gap-2">
                          <Edit3 size={14} /> Редагувати
                        </button>
                        <button type="button" onClick={() => handleDelete(project.id)} className="px-3 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded transition-colors flex justify-center items-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] p-8 rounded-2xl border border-white/5 shadow-xl animate-fadeIn">
            
            <div className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">1. Загальна інформація</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Назва проєкту *</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Напр. Флагманська матова графітова кухня" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#D4B895] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Рейтинг (від клієнта)</label>
                  <select 
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#D4B895] outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="5.0">5.0 (Ідеально)</option>
                    <option value="4.9">4.9 (Чудово)</option>
                    <option value="4.8">4.8 (Дуже добре)</option>
                    <option value="4.5">4.5 (Добре)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Детальний опис проєкту</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Опишіть матеріали, особливості, фурнітуру..." 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#D4B895] outline-none transition-colors resize-y"
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/10">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#D4B895] flex items-center gap-2 pb-2">
                <MapPin size={14} /> 2. Захищена локація (Fuzzing)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* РЕАЛЬНА АДРЕСА З AUTOCOMPLETE + UI ФІКС ДЛЯ РЕДАГУВАННЯ */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <label className="block text-xs uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1">
                    Реальна адреса (НЕ ЗБЕРІГАЄТЬСЯ) {editingId ? '' : '*'}
                  </label>
                  <div className="relative">
                    {editingId && !realAddress ? (
                      <Lock className="absolute left-3 top-3.5 text-white/30" size={16} />
                    ) : (
                      <Search className="absolute left-3 top-3.5 text-white/30" size={16} />
                    )}
                    
                    <input 
                      type="text" 
                      value={realAddress}
                      onChange={handleAddressInput}
                      onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                      placeholder={editingId ? "🔒 Приховано сервером. Введіть текст для зміни..." : "Напр. Чайковського 136 (без 'м. Харків')"}
                      className={`w-full border rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-colors ${editingId && !realAddress ? 'bg-white/5 border-white/10 text-white/50 focus:border-[#D4B895]' : 'bg-red-500/5 border-red-500/30 focus:border-red-500 text-white'}`}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <motion.ul 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                      >
                        {addressSuggestions.map(suggestion => (
                          <li 
                            key={suggestion.id} 
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 hover:bg-[#D4B895]/20 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                          >
                            <span className="text-white text-sm block">{suggestion.text}</span>
                            <span className="text-white/40 text-xs block truncate mt-0.5">{suggestion.place_name}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <p className="text-[10px] text-white/40 mt-2 font-mono leading-relaxed">
                    {editingId 
                      ? "База даних не зберігає точні адреси клієнтів. Залиште поле пустим, щоб зберегти стару локацію на карті." 
                      : "Оберіть адресу зі списку, і система автоматично розмиє її координати по центру вулиці."}
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Публічна зона (Видима всім) *</label>
                  <input 
                    type="text" 
                    required
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    placeholder="Напр. м. Харків, вул. Чайковського" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#D4B895] outline-none transition-colors"
                  />
                  <p className="text-[10px] text-white/40 mt-2 font-mono leading-relaxed">
                    Це поле генерується автоматично, але ви можете відредагувати його вручну.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/10">
              <h2 className="text-xs font-mono uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">3. Фотографії (Галерея)</h2>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                  isDragging ? 'border-[#D4B895] bg-[#D4B895]/10 scale-[1.02]' : 'border-white/10 hover:border-[#D4B895] bg-white/5'
                }`}
              >
                <UploadCloud size={36} className={`${isDragging ? 'text-[#D4B895]' : 'text-white/40 group-hover:text-[#D4B895]'} mb-4 transition-colors`} />
                <p className={`text-base mb-2 font-medium ${isDragging ? 'text-[#D4B895]' : 'text-white/70'}`}>
                  {isDragging ? 'Відпустіть фотографії тут...' : 'Натисніть або перетягніть файли сюди'}
                </p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">JPG, PNG, WEBP (можна декілька)</p>
                <input
                  type="file" 
                  multiple 
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {(existingMedia.length > 0 || selectedFiles.length > 0) && (
                <div className="mt-4">
                  <h3 className="text-[10px] font-mono text-white/50 mb-3 uppercase tracking-widest">Вибрані медіа-файли:</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    
                    <AnimatePresence>
                      {existingMedia.map((media, idx) => {
                        const isMain = idx === 0 && coverType !== 'new';
                        return (
                          <motion.div 
                            key={`existing-${idx}`}
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className={`relative aspect-square rounded-lg overflow-hidden border group ${isMain ? 'border-[#D4B895] shadow-[0_0_15px_rgba(212,184,149,0.4)]' : 'border-[#D4B895]/30'}`}
                          >
                            <div className="absolute top-1 left-1 bg-black/70 px-2 py-0.5 rounded text-[9px] text-[#D4B895] z-10">Вже в базі</div>
                            {isMain && <div className="absolute top-1 right-1 bg-[#D4B895] text-black px-2 py-0.5 rounded text-[9px] font-bold z-10 flex items-center gap-1"><Star size={10} fill="currentColor"/> ГОЛОВНА</div>}
                            
                            <img src={media.url} alt="saved" className="w-full h-full object-cover" />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                              {!isMain && (
                                <button type="button" onClick={() => makeMainExisting(idx)} className="bg-[#D4B895] text-black p-2 rounded-full hover:scale-110 transition-transform shadow-lg" title="Зробити головною">
                                  <Star size={16} fill="currentColor" />
                                </button>
                              )}
                              <button type="button" onClick={() => removeExistingFile(idx)} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg" title="Видалити">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}

                      {selectedFiles.map((file, idx) => {
                        const isMain = idx === 0 && coverType === 'new';
                        return (
                          <motion.div 
                            key={`new-${file.name}-${idx}`}
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className={`relative aspect-square rounded-lg overflow-hidden border group ${isMain ? 'border-[#D4B895] opacity-100 shadow-[0_0_15px_rgba(212,184,149,0.4)]' : 'border-white/20 opacity-80'}`}
                          >
                            <div className="absolute top-1 left-1 bg-blue-500/70 px-2 py-0.5 rounded text-[9px] text-white z-10">Нове</div>
                            {isMain && <div className="absolute top-1 right-1 bg-[#D4B895] text-black px-2 py-0.5 rounded text-[9px] font-bold z-10 flex items-center gap-1"><Star size={10} fill="currentColor"/> ГОЛОВНА</div>}
                            
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                              {!isMain && (
                                <button type="button" onClick={() => makeMainNew(idx)} className="bg-[#D4B895] text-black p-2 rounded-full hover:scale-110 transition-transform shadow-lg" title="Зробити головною">
                                  <Star size={16} fill="currentColor" />
                                </button>
                              )}
                              <button type="button" onClick={() => removeNewFile(idx)} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg" title="Видалити">
                                <X size={16} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#D4B895] text-black px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,184,149,0.3)]"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> {editingId ? 'Оновлення...' : 'Обробка...'}</>
                ) : (
                  editingId ? <><CheckCircle2 size={16} /> Зберегти зміни</> : <><Plus size={16} /> Опублікувати об'єкт</>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}