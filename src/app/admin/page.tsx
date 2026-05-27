"use client";

import React, { useState, useRef } from 'react';
import { 
  Lock, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- НАЛАШТУВАННЯ ---
const ADMIN_PASSWORD = "grazia18"; // Секретний пароль для доступу
const MAPBOX_TOKEN = "pk.eyJ1IjoiZ3JhemlhLTIwMDciLCJhIjoiY21wa2RzNWw2MGYwcDJzcjg2Z2l6N3Y1MiJ9.rxyk7nszY-cdSE9D3hrESw";
const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 'https://gpxbzpqnpbbumtiyfstc.supabase.co';
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'sb_publishable_2VUpjTZW1Bf1Bg0Fs0vh6Q_6tIr5eP0';
const BUCKET_NAME = "grazia-media";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Стани форми
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState(''); // Публічна назва
  const [realAddress, setRealAddress] = useState(''); // Приватна адреса
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('5.0');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Стани процесу
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setStatusMessage({ type: 'error', text: 'Невірний пароль' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // --- АВТОМАТИЧНЕ ГЕНЕРУВАННЯ ПУБЛІЧНОЇ АДРЕСИ ---
  const handleRealAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRealAddress(val);
    
    // Відрізаємо номер будинку в кінці (з літерами чи без, напр. "136", "136А", ", 45-Б")
    const publicVal = val.replace(/(,\s*)?\d+[а-яА-Яa-zA-Z-]*\s*$/, '').trim();
    setLocationName(publicVal);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- МАГІЯ ЗМІЩЕННЯ КООРДИНАТ (FUZZING) ---
  const geocodeAndFuzz = async (address: string) => {
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await res.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error("Не вдалося знайти координати за цією адресою. Спробуйте уточнити.");
    }

    const [realLon, realLat] = data.features[0].center;

    // Зміщення на 100-300 метрів
    const getOffset = () => {
      const minOffset = 0.0009;
      const maxOffset = 0.0027;
      const offset = Math.random() * (maxOffset - minOffset) + minOffset;
      const sign = Math.random() > 0.5 ? 1 : -1;
      return offset * sign;
    };

    const fuzzedLon = realLon + getOffset();
    const fuzzedLat = realLat + getOffset();

    return `(${fuzzedLon}, ${fuzzedLat})`; 
  };

  // --- ЗАВАНТАЖЕННЯ ФАЙЛІВ В SUPABASE STORAGE ---
  const uploadPhotos = async () => {
    const uploadedUrls: { url: string, caption: string }[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `portfolio_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': file.type
        },
        body: file
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Помилка завантаження файлу ${file.name}: ${err.message || 'Невідома помилка'}`);
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
      uploadedUrls.push({ url: publicUrl, caption: '' });
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locationName || !realAddress || selectedFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Заповніть всі обов\'язкові поля та додайте хоча б 1 фото.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Геокодування та генерація безпечних координат...' });

    try {
      const safeCoordinates = await geocodeAndFuzz(realAddress);

      setStatusMessage({ type: 'info', text: `Завантаження ${selectedFiles.length} фотографій...` });
      const mediaArray = await uploadPhotos();

      setStatusMessage({ type: 'info', text: 'Збереження проєкту в базу даних...' });

      const projectData = {
        title: title,
        location_name: locationName,
        coordinates: safeCoordinates,
        description: description,
        rating: parseFloat(rating),
        radius_meters: 300,
        media: mediaArray
      };

      const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(projectData)
      });

      if (!dbRes.ok) throw new Error("Помилка при збереженні проєкту в БД (Перевірте RLS політики таблиці).");

      setStatusMessage({ type: 'success', text: 'Проєкт успішно опубліковано!' });
      
      setTitle('');
      setLocationName('');
      setRealAddress('');
      setDescription('');
      setSelectedFiles([]);
      setTimeout(() => setStatusMessage(null), 5000);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6 md:p-12 pb-24">
      <div className="max-w-4xl mx-auto">
        
        <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] font-mono text-[#D4B895] uppercase tracking-widest block mb-2">Odmen-Menu</span>
            <h1 className="text-3xl font-serif">Додавання об'єкта</h1>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
          >
            Вийти
          </button>
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

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] p-8 rounded-2xl border border-white/5 shadow-xl">
          
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
              
              {/* РЕАЛЬНА АДРЕСА ЗЛІВА */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1">
                  Реальна адреса (НЕ ЗБЕРІГАЄТЬСЯ) *
                </label>
                <input 
                  type="text" 
                  required
                  value={realAddress}
                  onChange={handleRealAddressChange}
                  placeholder="Напр. м. Харків, вул. Чайковського 136" 
                  className="w-full bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-3 text-sm focus:border-red-500 outline-none transition-colors"
                />
                <p className="text-[10px] text-white/40 mt-2 font-mono leading-relaxed">
                  Система знайде ці координати і випадково змістить їх на 100-300 метрів.
                </p>
              </div>

              {/* ПУБЛІЧНА АДРЕСА СПРАВА */}
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
                  Це поле генерується автоматично (без номеру будинку), але ви можете відредагувати його вручну.
                </p>
              </div>

            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">3. Фотографії (Галерея)</h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/10 hover:border-[#D4B895] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5 group"
            >
              <UploadCloud size={32} className="text-white/40 group-hover:text-[#D4B895] mb-3 transition-colors" />
              <p className="text-sm text-white/70 mb-1">Натисніть, щоб обрати файли</p>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Можна виділяти декілька фото (JPG, PNG)</p>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                <AnimatePresence>
                  {selectedFiles.map((file, idx) => (
                    <motion.div 
                      key={`${file.name}-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"
                    >
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                <><Loader2 size={16} className="animate-spin" /> Обробка...</>
              ) : (
                <><Plus size={16} /> Опублікувати об'єкт</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}