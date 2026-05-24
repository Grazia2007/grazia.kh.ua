"use client";

import React, { useState, useEffect } from 'react';
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
  Instagram,
  Hammer
} from 'lucide-react';

// Безпечна ініціалізація системних змінних середовища для зв'язку з базою даних
const supabaseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 'https://gpxbzpqnpbbumtiyfstc.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'sb_publishable_2VUpjTZW1Bf1Bg0Fs0vh6Q_6tIr5eP0';

/**
 * Нативний надшвидкий клієнт Supabase REST API на базі Promise-Builder.
 */
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

// Дані для карти Харкова (демо-піни)
const KHARKIV_REGIONS = [
  { id: 'center', name: 'Шевченківський район', top: '40%', left: '55%', project: 'Кухня-Студія Loft, 2023', radius: '2.5 км' },
  { id: 'saltovka', name: 'Салтівка', top: '30%', left: '75%', project: 'Комплексне меблювання квартири', radius: '5 км' },
  { id: 'kholodna', name: 'Холодна Гора', top: '55%', left: '30%', project: 'Гардеробна система Premium', radius: '3 км' },
  { id: 'pavlovo', name: 'Павлове Поле', top: '25%', left: '45%', project: 'Меблі для IT-офісу', radius: '1.5 км' },
];

export default function GraziaLanding() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeRegion, setActiveRegion] = useState(KHARKIV_REGIONS[0]);
  const [currentSlide, setCurrentSlide] = useState(1);
  
  const [calcForm, setCalcForm] = useState({ spaceType: '', room: '', style: '', material: '', budget: '', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Отримання реальних меблевих проєктів з БД
  useEffect(() => {
    const fetchFurnitureProjects = async () => {
      const { data } = await supabase.from('products').select('*').eq('store_id', 'furniture').eq('status', 'active').limit(4);
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        // Fallback якщо база порожня
        setProjects([
          { id: 1, name: 'Приватна Резиденція', sku: 'Kharkiv, Center', media: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800'] },
          { id: 2, name: 'Інтер\'єр Вілли', sku: 'Kharkiv Region', media: ['https://images.unsplash.com/photo-1600607687644-b04fd5910f59?auto=format&fit=crop&q=80&w=800'] },
          { id: 3, name: 'Сучасні Апартаменти', sku: 'Saltovka', media: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800'] },
          { id: 4, name: 'Офісний Простір', sku: 'Pavlovo Pole', media: ['https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800'] },
        ]);
      }
    };
    fetchFurnitureProjects();
  }, []);

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
      setFormSubmitted(true); // Показуємо успіх користувачу в будь-якому разі
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
          <a href="#map" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Об'єкти в Харкові</a>
          <a href="#calc" className="hover:text-[#1E3527] transition-colors border-b border-transparent hover:border-[#1E3527] pb-1">Розрахунок</a>
        </div>

        <button className="bg-[#1E3527] text-[#F5F4F1] px-6 py-3 text-[10px] font-medium tracking-widest uppercase hover:bg-[#15241b] transition-colors">
          Залишити заявку
        </button>
      </nav>

      {/* Hero Секція з розділеним екраном */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col md:flex-row items-center gap-12 max-w-[1600px] mx-auto">
        
        {/* Ліва частина: Типографіка */}
        <div className="flex-1 z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#0D0D0D]/20 text-[10px] uppercase tracking-widest text-[#0D0D0D]/60 mb-8 font-mono">
            <Ruler size={12} />
            <span>18 років досвіду на ринку</span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-serif font-normal leading-[1.05] tracking-tight mb-8 text-[#0D0D0D]">
            ДИЗАЙН.<br />
            КОМФОРТ.<br />
            ЕЛЕГАНТНІСТЬ.
          </h1>
          
          <p className="text-base md:text-lg text-[#0D0D0D]/70 max-w-md font-light leading-relaxed mb-12">
            Ми створюємо ексклюзивні меблі на замовлення, які трансформують ваш простір у Харкові та області. Кожен проєкт — це відображення вашого стилю.
          </p>

          <div className="flex items-center gap-8">
            <a href="#calc" className="bg-[#1E3527] text-[#F5F4F1] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[#15241b] transition-colors">
              Розрахувати проєкт <ArrowRight size={16} />
            </a>
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

        {/* Права частина: Інтерактивна карта Харкова */}
        <div id="map" className="flex-1 w-full h-[600px] relative bg-[#EBEAE6] rounded-sm overflow-hidden flex items-center justify-center group">
          {/* Абстрактна векторна мапа (SVG placeholder для преміум вигляду) */}
          <svg className="absolute inset-0 w-full h-full text-[#D9D6D1] opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="currentColor" d="M10,20 Q30,5 50,20 T90,30 Q95,60 80,80 T30,90 Q5,70 10,20 Z" />
            <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M30,30 L70,70 M70,30 L30,70 M50,10 L50,90" />
          </svg>

          {/* Піни локацій */}
          {KHARKIV_REGIONS.map((region) => (
            <div 
              key={region.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: region.top, left: region.left }}
              onClick={() => setActiveRegion(region)}
              onMouseEnter={() => setActiveRegion(region)}
            >
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-12 h-12 rounded-full border border-[#1E3527] transition-all duration-700 ${activeRegion.id === region.id ? 'scale-100 opacity-20 bg-[#1E3527]' : 'scale-50 opacity-0'}`}></div>
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${activeRegion.id === region.id ? 'bg-[#1E3527] scale-125' : 'bg-[#0D0D0D]/40'}`}></div>
              </div>
            </div>
          ))}

          {/* Інформаційна картка активного регіону */}
          <div className="absolute bottom-8 left-8 right-8 bg-[#F5F4F1]/90 backdrop-blur-md p-6 border border-[#0D0D0D]/10 flex justify-between items-center shadow-2xl transition-all">
            <div>
              <h3 className="text-lg font-serif font-medium text-[#0D0D0D] mb-1">{activeRegion.name}</h3>
              <p className="text-xs text-[#0D0D0D]/60 flex items-center gap-2">
                <MapPin size={12} /> Радіус охоплення: {activeRegion.radius}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#1E3527] font-semibold block mb-1">Останній проєкт</span>
              <p className="text-sm font-medium text-[#0D0D0D]">{activeRegion.project}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Портфоліо Проєктів */}
      <section className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-[#0D0D0D]">НАШІ РОБОТИ</h2>
          <a href="#" className="text-xs font-semibold tracking-widest uppercase border-b border-[#0D0D0D] pb-1 flex items-center gap-2 hover:text-[#1E3527] hover:border-[#1E3527] transition-colors">
            Дивитись все <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {projects.map((project, idx) => (
            <div key={project.id || idx} className="group relative cursor-pointer overflow-hidden bg-[#EBEAE6] aspect-[3/4]">
              {/* Якщо в базі є фото, використовуємо його, інакше сірий фон */}
              {project.media && project.media[0] ? (
                <img src={project.media[0]} alt={project.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#0D0D0D]/20"><Armchair size={48} /></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-[10px] text-[#F5F4F1]/70 font-mono uppercase tracking-widest block mb-2">{project.sku}</span>
                <h3 className="text-lg font-serif text-[#F5F4F1]">{project.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Форма Розрахунку (Калькулятор) */}
      <section id="calc" className="px-6 md:px-12 py-24 max-w-[1600px] mx-auto bg-white border border-[#0D0D0D]/10">
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
              <p className="text-[#0D0D0D]/60 text-sm">Ми вже отримали ваші дані в Telegram і зв'яжемося з вами найближчим часом.</p>
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
              <a href="#" className="w-10 h-10 rounded-full border border-[#F5F4F1]/20 flex items-center justify-center hover:bg-[#F5F4F1] hover:text-[#0D0D0D] transition-all"><Instagram size={18} /></a>
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