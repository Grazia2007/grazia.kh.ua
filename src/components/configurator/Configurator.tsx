'use client';
// Покроковий конструктор меблів. Тут живе весь стан; 3D-сцена отримує його пропсами
// і вантажиться окремим чанком лише коли блок наближається до екрана.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, CheckCircle2, Check, Sparkles, Hammer, Layers, Box, Sun, Phone, AlertCircle, Loader2 } from 'lucide-react';
import {
  CALL_TIMES, CLASSES, COUNTER_OVERHANG, COUNTER_THICKNESS, DEFAULT_CONFIG, DEFAULT_DIMS, FURNITURE_TYPES, GIFTS, KITCHEN_LAYOUTS,
  TALL_MODULES, UPPER_TIERS, WARDROBE_DOORS, dimFields, type Config, type TallModule,
} from './layout';
import { BACKSPLASH_ALL, CARCASS_ALL, COUNTERTOPS, FACADE_ALL, FAMILY_LABEL, HANDLES, INTERIORS, type Interior, type Material } from './materials';
import { buildSpec, facadeZones, hasCountertop, hasHandles } from './spec';
import type { SceneApi } from './Scene';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-[#6b665e] text-xs font-mono uppercase tracking-widest gap-2">
      <Loader2 size={14} className="animate-spin" /> Завантаження 3D
    </div>
  );
}

type StepId = 'type' | 'class' | 'dims' | 'config' | 'facades' | 'handles' | 'countertop' | 'gift' | 'contacts';
const STEP_TITLE: Record<StepId, string> = {
  type: 'Що будемо створювати?',
  class: 'Клас виконання',
  dims: 'Розміри',
  config: 'Конфігурація',
  facades: 'Фасади та корпус',
  handles: 'Ручки',
  countertop: 'Стільниця та фартук',
  gift: 'Ваш гарантований подарунок',
  contacts: 'Проєкт готовий до прорахунку',
};

const stepsFor = (c: Config): StepId[] => [
  'type', 'class', 'dims', 'config', 'facades', 'handles',
  ...(hasCountertop(c) ? (['countertop'] as StepId[]) : []),
  'gift', 'contacts',
];

const CLASS_INFO: { id: Config['furnitureClass']; desc: string; icon: ReactNode }[] = [
  { id: 'Економ', desc: 'Базові матеріали, надійна стандартна фурнітура (плівка, базовий ДСП 16 мм).', icon: <Layers size={20} /> },
  { id: 'Стандарт', desc: 'Оптимальний вибір. Фарбовані фасади, доводчики середнього сегменту (Muller), ДСП 18 мм.', icon: <Hammer size={20} /> },
  { id: 'Преміум', desc: 'Максимальна якість. Фурнітура Blum/Hettich, натуральний шпон, камінь, преміум емалі.', icon: <Sparkles size={20} /> },
];
const GIFT_ICONS: Record<string, ReactNode> = { 'Висувне Карго': <Box size={24} />, 'LED Підсвітка': <Sun size={24} />, "Кам'яна Мийка": <CheckCircle2 size={24} /> };

const GIFT_NOTE: Record<string, string> = {
  'Висувне Карго': 'Висувна секція з кошиками',
  'LED Підсвітка': 'Під верхніми шафами',
  "Кам'яна Мийка": 'Гранітна мийка Granado',
};

const label = 'text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] block mb-3';
const choice = (on: boolean) =>
  `border rounded-lg transition-colors duration-200 text-left ${on ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/5 text-[var(--accent-main)]' : 'border-[var(--border-color)] hover:border-[var(--accent-main)]/50 text-[var(--text-main)]'}`;

function Chips<T extends string | number>({ items, value, onChange, render }: { items: readonly T[]; value: T; onChange: (v: T) => void; render?: (v: T) => ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button key={String(it)} type="button" aria-pressed={value === it} onClick={() => onChange(it)} className={`${choice(value === it)} px-3 py-2 text-xs font-medium`}>
          {render ? render(it) : it}
        </button>
      ))}
    </div>
  );
}

function Swatches({ list, value, onChange }: { list: Material[]; value: string; onChange: (code: string) => void }) {
  // групи (фарбовані, шпон, EGGER однотонні/деревина...) - щоб не гортати 60 зразків
  const families = [...new Set(list.map((m) => m.family).filter(Boolean))] as NonNullable<Material['family']>[];
  const [family, setFamily] = useState(() => list.find((m) => m.code === value)?.family ?? families[0]);
  const shown = families.length > 1 ? list.filter((m) => m.family === family) : list;
  return (
    <div className="space-y-4">
      {families.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {families.map((f) => (
            <button key={f} type="button" aria-pressed={family === f} onClick={() => setFamily(f)} className={`${choice(family === f)} px-3 py-1.5 text-[11px] font-medium`}>{FAMILY_LABEL[f]}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {shown.map((m) => (
          <button key={m.code} type="button" aria-pressed={value === m.code} onClick={() => onChange(m.code)} className={`${choice(value === m.code)} p-2 flex flex-col items-center gap-2`}>
            <span className="w-10 h-10 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: m.color }} />
            <span className="text-[10px] leading-tight text-center text-[var(--text-main)]">{m.name}</span>
            <span className="text-[9px] font-mono text-[var(--text-light)] text-center">{m.code.startsWith('EGGER') ? m.code.replace('EGGER ', '') : `${m.finish} · ${m.code}`}</span>
          </button>
        ))}
      </div>
      {family?.startsWith('egger') && <p className="text-[11px] text-[var(--text-light)]">Відтінок на екрані орієнтовний - точний колір покажемо на зразку.</p>}
    </div>
  );
}

const Toggle = ({ on, onChange, text }: { on: boolean; onChange: (v: boolean) => void; text: string }) => (
  <button type="button" aria-pressed={on} onClick={() => onChange(!on)} className={`${choice(on)} p-3 text-sm flex items-center gap-3 w-full`}>
    <span className={`w-4 h-4 rounded-sm border flex items-center justify-center ${on ? 'border-[var(--accent-main)] bg-[var(--accent-main)] text-white' : 'border-[var(--border-color)]'}`}>{on && <Check size={12} />}</span>
    {text}
  </button>
);

export default function Configurator() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [dimText, setDimText] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(DEFAULT_CONFIG.dims).map(([k, v]) => [k, String(v)])));
  const [stepIdx, setStepIdx] = useState(0);
  const [zone, setZone] = useState<'base' | 'upper' | 'topTier' | 'carcass'>('base');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showDimErrors, setShowDimErrors] = useState(false);
  const [sceneOn, setSceneOn] = useState(false);
  const [interior, setInterior] = useState<Interior>('parquet');
  const panelRef = useRef<HTMLDivElement>(null);
  const sceneApi = useRef<SceneApi | null>(null);

  // 3D монтуємо, коли блок за ~400px від екрана
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSceneOn(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const steps = stepsFor(config);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const fields = dimFields(config);
  const dimErrors = useMemo(() => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const n = Number(dimText[f.key]);
      if (!dimText[f.key] || !Number.isFinite(n) || n < f.min || n > f.max) e[f.key] = `Від ${f.min} до ${f.max} мм`;
    }
    return e;
  }, [fields, dimText]);
  const zones = [...facadeZones(config), { id: 'carcass' as const, label: 'Корпус' }];
  const activeZone = zones.some((z) => z.id === zone) ? zone : 'base';
  const spec = useMemo(() => buildSpec(config), [config]);

  const set = (patch: Partial<Config>) => setConfig((c) => ({ ...c, ...patch }));
  const setMat = (k: keyof Config['materials'], code: string) => setConfig((c) => ({ ...c, materials: { ...c.materials, [k]: code } }));

  const setType = (type: Config['type']) => {
    const dims = DEFAULT_DIMS[type];
    setDimText(Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, String(v)])));
    setConfig((c) => {
      // для купе доступні лише профілі
      const handle = type === 'Шафа-купе / Гардеробна' && c.wardrobeDoors === 'Купе' && !c.materials.handle.match(/GR-H0[34]/) ? 'GR-H03' : c.materials.handle;
      // Gola - лише для кухні
      const h2 = type !== 'Кухня' && /GR-H0[67]/.test(handle) ? 'GR-H04' : handle;
      return { ...c, type, dims, materials: { ...c.materials, handle: h2 } };
    });
  };

  const setDim = (key: keyof Config['dims'], v: string, min: number, max: number) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    setDimText((t) => ({ ...t, [key]: clean }));
    const n = Number(clean);
    // модель оновлюється лише валідними значеннями, щоб не "стрибала" під час набору
    if (n >= min && n <= max) setConfig((c) => ({ ...c, dims: { ...c.dims, [key]: n } }));
  };

  const next = () => {
    if (step === 'dims' && Object.keys(dimErrors).length) { setShowDimErrors(true); return; }
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  };
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const submit = async () => {
    const digits = config.phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) { setPhoneError('Вкажіть номер повністю, наприклад +380 67 123 45 67'); return; }
    setPhoneError('');
    setStatus('sending');
    setError('');
    try {
      let photos: Blob[] = [];
      try { photos = (await sceneApi.current?.capture()) ?? []; } catch (e) { console.error('Знімок макета не вдався:', e); }
      const fd = new FormData();
      fd.append('config', JSON.stringify(config));
      photos.forEach((p, i) => fd.append('photo', p, i === 0 ? 'front.jpg' : 'angle.jpg'));
      const res = await fetch('/api/telegram', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j?.error === 'string' ? j.error : 'Не вдалося надіслати заявку');
      }
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'generate_lead', { form: 'configurator', furniture_type: config.type });
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося надіслати заявку');
      setStatus('error');
    }
  };

  const done = status === 'success';
  const isLast = step === 'contacts';

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
      <div ref={panelRef} className="lg:w-1/2 relative bg-[#e9e6e1] overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border-color)] min-h-[400px] lg:min-h-0 cursor-grab active:cursor-grabbing">
        <div className="absolute inset-0">{sceneOn ? <Scene config={config} apiRef={sceneApi} interior={interior} /> : <SceneLoading />}</div>
        <div className="absolute top-5 left-5 flex flex-wrap gap-2 pointer-events-none">
          {[config.type, config.type === 'Кухня' ? config.layout : null, config.furnitureClass].filter(Boolean).map((t) => (
            <span key={t} className="bg-black/60 text-white/90 text-[9px] px-3 py-1 uppercase tracking-widest rounded-sm">{t}</span>
          ))}
        </div>
        <div className="absolute bottom-3 inset-x-3 flex flex-col items-center gap-2">
          <div className="flex gap-1 bg-black/55 rounded-full p-1" role="group" aria-label="Інтер'єр">
            {(Object.keys(INTERIORS) as Interior[]).map((k) => (
              <button key={k} type="button" aria-pressed={interior === k} onClick={() => setInterior(k)} className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider transition-colors ${interior === k ? 'bg-white text-black' : 'text-white/80 hover:text-white'}`}>{INTERIORS[k]}</button>
            ))}
          </div>
          <p className="text-[11px] text-[#5f5a52] pointer-events-none">Потягніть, щоб покрутити · масштаб: коліщатко або два пальці</p>
        </div>
      </div>

      <div className="lg:w-1/2 p-6 sm:p-8 lg:p-14 flex flex-col bg-[var(--bg-main)]">
        {!done && (
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] mb-3">
              <span>Крок {stepIdx + 1} з {steps.length}</span>
              <span>{STEP_TITLE[step]}</span>
            </div>
            <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent-main)] origin-left transition-transform duration-300" style={{ transform: `scaleX(${(stepIdx + 1) / steps.length})` }} />
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={done ? 'done' : step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }} className="flex flex-col gap-6">
              {done ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6"><Check size={40} /></div>
                  <h3 className="text-3xl font-serif text-[var(--text-main)] mb-3">Проєкт отримано!</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-10 max-w-md">
                    Макет і параметри вже в нас. Дизайнер-технолог Марина зв&apos;яжеться з вами у вказаний час ({config.time}). Подарунок ({config.gift || 'не обрано'}) зафіксовано за вашим номером.
                  </p>
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E3527] to-[#0D1A13] p-8 text-left w-full border border-white/10 shadow-2xl">
                    <span className="bg-yellow-400/20 text-yellow-400 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-sm block w-fit mb-4">Спеціальна пропозиція</span>
                    <h4 className="text-white text-xl font-serif mb-2">Преміальна техніка для вашої кухні</h4>
                    <p className="text-white/70 text-sm mb-6 max-w-sm">Облаштуйте ваші нові меблі найкращою технікою від нашого офіційного партнера.</p>
                    <a href="https://tekhnovybir.com.ua" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-yellow-400 transition-colors">
                      Перейти на Tekhnovybir.com.ua <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-serif text-[var(--text-main)]">{STEP_TITLE[step]}</h3>

                  {step === 'type' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FURNITURE_TYPES.map((t) => (
                        <button key={t} type="button" aria-pressed={config.type === t} onClick={() => setType(t)} className={`${choice(config.type === t)} p-5 text-sm font-medium text-center`}>{t}</button>
                      ))}
                    </div>
                  )}

                  {step === 'class' && (
                    <div className="space-y-3">
                      {CLASSES.map((id) => {
                        const info = CLASS_INFO.find((c) => c.id === id)!;
                        return (
                          <button key={id} type="button" aria-pressed={config.furnitureClass === id} onClick={() => set({ furnitureClass: id })} className={`${choice(config.furnitureClass === id)} p-4 flex items-start gap-4 w-full`}>
                            <span className="mt-1">{info.icon}</span>
                            <span><span className="block font-medium">{id}</span><span className="block text-xs text-[var(--text-muted)] mt-1">{info.desc}</span></span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 'dims' && (
                    <div className="space-y-4">
                      {config.type === 'Кухня' && (
                        <div>
                          <span className={label}>Планування</span>
                          <Chips items={KITCHEN_LAYOUTS} value={config.layout} onChange={(layout) => set({ layout })} />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map((f) => (
                          <label key={f.key} className="block">
                            <span className={label}>{f.label}, мм</span>
                            <input
                              inputMode="numeric"
                              value={dimText[f.key] ?? ''}
                              onChange={(e) => setDim(f.key, e.target.value, f.min, f.max)}
                              onBlur={() => setShowDimErrors(true)}
                              aria-invalid={showDimErrors && !!dimErrors[f.key]}
                              className={`w-full bg-[var(--bg-main)] rounded-lg px-4 py-3 border outline-none text-[var(--text-main)] ${showDimErrors && dimErrors[f.key] ? 'border-red-500' : 'border-[var(--border-color)] focus:border-[var(--accent-main)]'}`}
                            />
                            <span className={`block text-[11px] mt-1 ${showDimErrors && dimErrors[f.key] ? 'text-red-500' : 'text-[var(--text-light)]'}`}>{f.min}–{f.max} мм</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">Приблизні заміри достатні - точні зробить технолог на виїзді.</p>
                    </div>
                  )}

                  {step === 'config' && (
                    <div className="space-y-6">
                      {config.type === 'Кухня' && (
                        <>
                          <div><span className={label}>Верхні секції</span><Chips items={UPPER_TIERS} value={config.upperTier} onChange={(upperTier) => set({ upperTier })} /></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(['leftModule', 'rightModule'] as const).map((k) => (
                              <label key={k} className="block">
                                <span className={label}>{k === 'leftModule' ? 'Лівий пенал (колона)' : 'Правий пенал (колона)'}</span>
                                <select value={config[k]} onChange={(e) => set({ [k]: e.target.value as TallModule })} className="w-full bg-[var(--bg-main)] rounded-lg px-3 py-3 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)] text-sm">
                                  {Object.entries(TALL_MODULES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                                </select>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                      {config.type === 'Шафа-купе / Гардеробна' && (
                        <>
                          <div><span className={label}>Двері</span><Chips items={WARDROBE_DOORS} value={config.wardrobeDoors} onChange={(wardrobeDoors) => setConfig((c) => ({ ...c, wardrobeDoors, materials: { ...c.materials, handle: wardrobeDoors === 'Купе' && !/GR-H0[34]/.test(c.materials.handle) ? 'GR-H03' : c.materials.handle } }))} /></div>
                          <Toggle on={config.mezzanine} onChange={(mezzanine) => set({ mezzanine })} text="Антресоль зверху" />
                        </>
                      )}
                      {config.type === 'Меблі у вітальню' && <Toggle on={config.sidePenals} onChange={(sidePenals) => set({ sidePenals })} text="Пенали з боків" />}
                      {config.type === 'Меблі для ванної' && <Toggle on={config.bathPenal} onChange={(bathPenal) => set({ bathPenal })} text="Пенал поруч із тумбою" />}
                    </div>
                  )}

                  {step === 'facades' && (
                    <div className="space-y-5">
                      <div className="flex gap-2 border-b border-[var(--border-color)] overflow-x-auto no-scrollbar" role="tablist">
                        {zones.map((z) => (
                          <button key={z.id} type="button" role="tab" aria-selected={activeZone === z.id} onClick={() => setZone(z.id)} className={`text-xs font-semibold tracking-widest uppercase px-3 py-2 whitespace-nowrap ${activeZone === z.id ? 'text-[var(--accent-main)] border-b-2 border-[var(--accent-main)]' : 'text-[var(--text-light)] hover:text-[var(--text-main)]'}`}>{z.label}</button>
                        ))}
                      </div>
                      {activeZone === 'carcass'
                        ? <Swatches key="carcass" list={CARCASS_ALL} value={config.materials.carcass} onChange={(c) => setMat('carcass', c)} />
                        : <Swatches key={activeZone} list={FACADE_ALL} value={config.materials[activeZone]} onChange={(c) => setMat(activeZone, c)} />}
                    </div>
                  )}

                  {step === 'handles' && (
                    <div className="space-y-3">
                      {!hasHandles(config) && <p className="text-sm text-[var(--text-muted)]">Двері купе мають рамку з профілю - оберіть його колір.</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HANDLES.filter((h) => (hasHandles(config) || h.type === 'profile') && (h.type !== 'gola' || config.type === 'Кухня')).map((h) => (
                          <button key={h.code} type="button" aria-pressed={config.materials.handle === h.code} onClick={() => setMat('handle', h.code)} className={`${choice(config.materials.handle === h.code)} p-3 flex items-center gap-3`}>
                            <span className="w-8 h-8 rounded-full border border-black/10" style={{ background: h.type === 'none' ? 'transparent' : h.color }} />
                            <span className="text-sm">{h.name}<span className="block text-[9px] font-mono text-[var(--text-light)]">{h.code}</span></span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 'countertop' && (
                    <div className="space-y-6">
                      <Swatches list={COUNTERTOPS} value={config.materials.countertop} onChange={(c) => setMat('countertop', c)} />
                      {config.type === 'Кухня' && (
                        <div className="space-y-3">
                          <span className={label}>Фартук (стіна між нижніми і верхніми шафами)</span>
                          <Chips items={['none', 'same'] as const} value={config.backsplash === 'none' || config.backsplash === 'same' ? config.backsplash : ('' as 'none')} onChange={(backsplash) => set({ backsplash })} render={(v) => (v === 'none' ? 'Без фартуха' : 'Як стільниця')} />
                          <Swatches key="bs" list={BACKSPLASH_ALL} value={config.backsplash} onChange={(backsplash) => set({ backsplash })} />
                        </div>
                      )}
                      {config.type === 'Кухня' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><span className={label}>Товщина</span><Chips items={COUNTER_THICKNESS} value={config.counterThickness as 28} onChange={(counterThickness) => set({ counterThickness })} render={(v) => `${v} мм`} /></div>
                          <div><span className={label}>Виступ над фасадом</span><Chips items={COUNTER_OVERHANG} value={config.counterOverhang as 20} onChange={(counterOverhang) => set({ counterOverhang })} render={(v) => `${v} мм`} /></div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'gift' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {GIFTS.map((g) => (
                        <button key={g} type="button" aria-pressed={config.gift === g} onClick={() => set({ gift: g })} className={`${choice(config.gift === g)} p-5 flex flex-col items-center text-center gap-3`}>
                          {GIFT_ICONS[g]}<span className="text-sm font-medium">{g}</span><span className="text-[11px] text-[var(--text-muted)]">{GIFT_NOTE[g]}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 'contacts' && (
                    <div className="space-y-5">
                      <p className="text-[var(--text-muted)] text-sm">Залиште телефон - дизайнер-технолог Марина отримає макет і зв&apos;яжеться з вами.</p>
                      <label className="block">
                        <span className={label}>Ваш телефон</span>
                        <span className={`flex items-center bg-[var(--bg-main)] rounded-lg px-4 py-3 border ${phoneError ? 'border-red-500' : 'border-[var(--border-color)] focus-within:border-[var(--accent-main)]'}`}>
                          <Phone size={18} className="text-[var(--text-light)] mr-3" />
                          <input type="tel" autoComplete="tel" placeholder="+38 (0__) ___-__-__" value={config.phone} onChange={(e) => set({ phone: e.target.value })} aria-invalid={!!phoneError} className="bg-transparent w-full focus:outline-none text-[var(--text-main)] placeholder:text-[var(--text-light)]" />
                        </span>
                        {phoneError && <span className="block text-[11px] text-red-500 mt-1">{phoneError}</span>}
                      </label>
                      <label className="block">
                        <span className={label}>Зручний час для дзвінка</span>
                        <select value={config.time} onChange={(e) => set({ time: e.target.value })} className="w-full bg-[var(--bg-main)] rounded-lg px-4 py-3 border border-[var(--border-color)] focus:border-[var(--accent-main)] outline-none text-[var(--text-main)]">
                          {CALL_TIMES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </label>
                      <details className="text-xs text-[var(--text-muted)] border border-[var(--border-color)] rounded-lg p-3">
                        <summary className="cursor-pointer text-[var(--text-main)] font-medium">Що отримає дизайнер</summary>
                        <ul className="mt-2 space-y-1">{spec.map((l, i) => <li key={i}>{l}</li>)}<li>+ 2 знімки макета (фронт і 3/4)</li></ul>
                      </details>
                      {status === 'error' && (
                        <p role="alert" className="flex items-start gap-2 text-sm text-red-500"><AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}. Спробуйте ще раз за хвилину.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!done && (
          <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-between items-center">
            <button type="button" onClick={back} className={`flex items-center gap-2 text-xs font-semibold tracking-widest uppercase ${stepIdx === 0 ? 'invisible' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
              <ChevronLeft size={16} /> Назад
            </button>
            {!isLast ? (
              <button type="button" onClick={next} className="bg-[var(--btn-bg)] text-[var(--btn-text)] px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:opacity-80 transition-opacity rounded-sm shadow-lg">
                Далі <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={status === 'sending'} className="bg-[var(--accent-main)] text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase flex items-center gap-3 hover:bg-[var(--accent-hover)] transition-colors rounded-sm shadow-lg disabled:opacity-60 disabled:cursor-wait">
                {status === 'sending' ? <>Надсилаємо <Loader2 size={16} className="animate-spin" /></> : <>Отримати прорахунок <CheckCircle2 size={16} /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
