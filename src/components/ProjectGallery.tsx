'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

// галерея об'єкта: зліва поверхи/приміщення, справа сцена з великим фото по центру
// і краями сусідніх. transform має лише доріжка (track), масштаб - лише слайд.

type Photo = { url: string; caption?: string };
type Room = { id: string; floor?: string; name: string; media?: Photo[] };
type Slide = { url: string; label: string };
type Section = { key: string; label: string; floor?: string; slides: Slide[] };
type GalleryProject = { id?: string | number; year?: number | null; photos?: Photo[]; generalPhotos?: Photo[]; rooms?: Room[] };

// 1 розділ, 2-4 розділи, 5+ розділів
const pluralSections = (n: number) => {
  const d = n % 10, h = n % 100;
  if (d === 1 && h !== 11) return `${n} розділ`;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return `${n} розділи`;
  return `${n} розділів`;
};

// скільки сусідів з кожного боку реально рендерять картинку
const RENDER_RADIUS = 3;

const buildSections = (project: GalleryProject): Section[] => {
  const rooms: Room[] = Array.isArray(project?.rooms) ? project.rooms : [];
  const general: Photo[] = Array.isArray(project?.generalPhotos)
    ? project.generalPhotos
    : (rooms.length === 0 && Array.isArray(project?.photos) ? project.photos : []);

  const sections: Section[] = [];
  if (general.length > 0) {
    sections.push({ key: 'general', label: 'Загальний вигляд', slides: general.map(p => ({ url: p.url, label: 'Загальний вигляд' })) });
  }
  rooms.forEach(room => {
    const media = room.media || [];
    if (media.length === 0) return;
    sections.push({
      key: room.id,
      label: room.name,
      floor: room.floor || '',
      slides: media.map(p => ({ url: p.url, label: room.floor ? `${room.floor} · ${room.name}` : room.name }))
    });
  });
  return sections;
};

// групи для бокового списку: поверхи в порядку першої появи
const groupByFloor = (sections: Section[]) => {
  const groups: { floor: string; items: Section[] }[] = [];
  sections.forEach(s => {
    const floor = s.key === 'general' ? '' : (s.floor || '');
    let g = groups.find(x => x.floor === floor);
    if (!g) { g = { floor, items: [] }; groups.push(g); }
    g.items.push(s);
  });
  return groups;
};

function Stage({
  slides, index, onIndex, dark, onOpenFull
}: {
  slides: Slide[];
  index: number;
  onIndex: (i: number) => void;
  dark?: boolean;
  onOpenFull?: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);

  if (count === 0) return null;

  // ширина центрального слайда задається через --slide; доріжка зсувається так, щоб активний був по центру
  const trackStyle = {
    transform: `translate3d(calc(50% - (var(--slide) / 2) - ${index} * (var(--slide) + var(--gap))), 0, 0)`
  } as React.CSSProperties;

  return (
    <div
      className={`relative w-full overflow-hidden select-none py-6 [--gap:16px] [--slide:78%] md:[--slide:72%] ${dark ? 'h-full' : ''}`}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
      }}
    >
      <div
        className={`flex gap-[var(--gap)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${dark ? 'h-full items-center' : ''}`}
        style={trackStyle}
      >
        {slides.map((s, i) => {
          const active = i === index;
          const near = Math.abs(i - index) <= RENDER_RADIUS;
          return (
            <div
              key={`${s.url}-${i}`}
              onClick={() => (active ? onOpenFull?.() : onIndex(i))}
              className={`relative shrink-0 w-[var(--slide)] overflow-hidden rounded-sm transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                dark ? 'h-[78vh]' : 'aspect-[4/3] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_18px_30px_-18px_rgba(0,0,0,0.45)]'
              } ${active ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.92] hover:opacity-70'} ${
                active ? (onOpenFull ? 'cursor-zoom-in' : 'cursor-default') : 'cursor-pointer'
              }`}
            >
              {near && (
                <Image
                  src={s.url}
                  alt={s.label}
                  fill
                  sizes={dark ? '90vw' : '(max-width: 768px) 78vw, 55vw'}
                  className={dark ? 'object-contain' : 'object-cover'}
                  priority={active}
                  loading={active ? undefined : 'eager'}
                  draggable={false}
                />
              )}
              {active && !dark && onOpenFull && (
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center">
                  <Maximize2 size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Попереднє фото"
            onClick={prev}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white hidden md:flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft size={26} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Наступне фото"
            onClick={next}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white hidden md:flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight size={26} strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  );
}

export default function ProjectGallery({ project }: { project: GalleryProject }) {
  const sections = useMemo(() => buildSections(project), [project]);
  const allSlides = useMemo(() => sections.flatMap(s => s.slides), [sections]);
  const groups = useMemo(() => groupByFloor(sections), [sections]);

  const [sectionKey, setSectionKey] = useState<string>('all');
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const slides = sectionKey === 'all' ? allSlides : (sections.find(s => s.key === sectionKey)?.slides || []);
  const current = slides[index];

  const selectSection = (key: string) => { setSectionKey(key); setIndex(0); };

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % slides.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + slides.length) % slides.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, slides.length]);

  if (allSlides.length === 0) return null;

  const hasList = sections.length > 1;
  const itemCls = (active: boolean) =>
    `w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
      active
        ? 'bg-[var(--btn-bg)] text-[var(--btn-text)]'
        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
    }`;

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent-main)] font-bold block mb-2">
            {[project?.year, sections.length > 1 ? pluralSections(sections.length) : null].filter(Boolean).join(' · ') || 'Фотозвіт'}
          </span>
          <h3 className="text-3xl md:text-4xl font-serif text-[var(--text-main)]">Фотозвіт об’єкта</h3>
        </div>
        <div className="font-mono text-xs tracking-widest text-[var(--text-light)] shrink-0">
          <span className="text-[var(--text-main)] font-bold">{String(index + 1).padStart(2, '0')}</span>
          <span className="mx-2 opacity-50">/</span>
          {String(slides.length).padStart(2, '0')}
        </div>
      </div>

      <div className={`flex flex-col ${hasList ? 'lg:flex-row' : ''} gap-8`}>
        {hasList && (
          <>
            {/* мобільний: горизонтальні чипи */}
            <div className="lg:hidden -mx-6 px-6 flex gap-2 overflow-x-auto pb-1">
              {[{ key: 'all', label: 'Усі фото' }, ...sections].map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => selectSection(s.key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                    sectionKey === s.key
                      ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] border-transparent'
                      : 'border-[var(--border-color)] text-[var(--text-muted)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* десктоп: компактний список поверхів і приміщень */}
            <aside className="hidden lg:block w-64 shrink-0 lg:sticky lg:top-28 self-start max-h-[70vh] overflow-y-auto pr-2">
              <button type="button" onClick={() => selectSection('all')} className={itemCls(sectionKey === 'all')}>
                <span>Усі фото</span>
                <span className="font-mono text-[10px] opacity-60">{allSlides.length}</span>
              </button>
              {groups.map(g => (
                <div key={g.floor || 'none'} className="mt-5">
                  {g.floor && (
                    <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--accent-main)] font-bold">
                      {g.floor}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {g.items.map(s => (
                      <button key={s.key} type="button" onClick={() => selectSection(s.key)} className={itemCls(sectionKey === s.key)}>
                        <span className="truncate">{s.label}</span>
                        <span className="font-mono text-[10px] opacity-60">{s.slides.length}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          </>
        )}

        <div className="flex-1 min-w-0">
          <Stage slides={slides} index={index} onIndex={setIndex} onOpenFull={() => setFullscreen(true)} />
          {current && sectionKey === 'all' && sections.length > 1 && (
            <p className="mt-5 text-center text-xs font-mono uppercase tracking-[0.25em] text-[var(--text-light)]">{current.label}</p>
          )}
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-5 text-white/80">
            <div className="font-mono text-xs tracking-[0.25em] uppercase truncate pr-6">
              <span className="text-white font-bold">{index + 1}</span>
              <span className="mx-2 opacity-50">/</span>
              {slides.length}
              {current && <span className="ml-4 opacity-60">{current.label}</span>}
            </div>
            <button
              type="button"
              aria-label="Закрити"
              onClick={() => setFullscreen(false)}
              className="w-12 h-12 shrink-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex items-center pb-8">
            <Stage slides={slides} index={index} onIndex={setIndex} dark />
          </div>
        </div>
      )}
    </div>
  );
}
