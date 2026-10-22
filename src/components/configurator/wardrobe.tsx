'use client';
// Шафа: корпус, двері купе (усередині корпусу) або розпашні, наповнення, LED і відчинення дверей кліком.
// Розміри в мм у локальній системі модуля (X - ширина, Y - висота, Z - до фасаду).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { K, SHEET_MAX, type Unit, type LedMode } from './layout';
import type { HandleType } from './materials';
import { Box, Facade, glowTexture, type Mats, type Rect } from './modules';

// ---------- двері, що відчиняються ----------

// hinge: обертання навколо осі pivotX (кут у радіанах); slide: зсув по X
function Movable({ kind, pivotX = 0, pivotZ = 0, amount, open, children }: { kind: 'hinge' | 'slide'; pivotX?: number; pivotZ?: number; amount: number; open: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const [local, setLocal] = useState(false);
  const isOpen = open !== local; // загальний перемикач + власний клік
  useEffect(() => { invalidate(); }, [isOpen, invalidate]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = isOpen ? amount : 0;
    const cur = kind === 'hinge' ? g.rotation.y : g.position.x - pivotX;
    const diff = target - cur;
    const done = Math.abs(diff) < (kind === 'hinge' ? 0.002 : 0.5);
    const next = done ? target : cur + diff * Math.min(1, dt * 5);
    if (kind === 'hinge') g.rotation.y = next; else g.position.x = pivotX + next;
    if (!done) invalidate();
  });
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return; // це було перетягування камери, а не клік
    e.stopPropagation();
    setLocal((v) => !v);
  };
  return (
    <group
      ref={ref}
      position={[pivotX, 0, pivotZ]}
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}
    >
      <group position={[-pivotX, 0, -pivotZ]}>{children}</group>
    </group>
  );
}

// ---------- двері купе ----------

type Panel = { y: number; h: number; m: THREE.Material; x?: number; w?: number };

// панелі однієї двері купе залежно від стилю; i - номер двері, n - кількість
function kupePanels(style: NonNullable<Unit['wardrobe']>['style'], i: number, n: number, x: number, w: number, y0: number, h: number, mats: Mats, mirror: THREE.Material): Panel[] {
  const ldsp = mats.base;
  const isCenter = n <= 2 ? i === n - 1 : i > 0 && i < n - 1;
  if (style === 'ldsp') return [{ y: y0, h, m: ldsp }];
  if (style === 'mirror-all') return [{ y: y0, h, m: mirror }];
  if (style === 'mirror-center') return [{ y: y0, h, m: isCenter ? mirror : ldsp }];
  if (style === 'wood-mirror-wood') return [{ y: y0, h: 200, m: ldsp }, { y: y0 + 200, h: h - 400, m: mirror }, { y: y0 + h - 200, h: 200, m: ldsp }];
  // мозаїка: 3 колонки x ~7 рядів, чергування матеріалів
  const rows = Math.max(4, Math.round(h / 330)), cols = 3;
  const seq = [mirror, ldsp, mats.lacomat];
  const out: Panel[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    out.push({ y: y0 + (h / rows) * r, h: h / rows, x: x + (w / cols) * c, w: w / cols, m: seq[(r + c + i) % 3] });
  }
  return out;
}

// розбиває панелі, вищі за лист (2780 мм), горизонтальним профілем
function splitTall(panels: Panel[]): Panel[] {
  return panels.flatMap((p) => (p.h > SHEET_MAX ? [{ ...p, h: SHEET_MAX }, { ...p, y: p.y + SHEET_MAX, h: p.h - SHEET_MAX }] : [p]));
}

function KupeDoor({ i, n, x, w, y0, h, z, style, mats, mirror }: { i: number; n: number; x: number; w: number; y0: number; h: number; z: number; style: NonNullable<Unit['wardrobe']>['style']; mats: Mats; mirror: THREE.Material }) {
  const fw = 22; // ширина вертикального профілю
  const rail = 14; // горизонтальні профілі між панелями
  const panels = splitTall(kupePanels(style, i, n, x + fw, w - 2 * fw, y0 + fw, h - 2 * fw, mats, mirror));
  const items: ReactNode[] = [];
  panels.forEach((p, k) => {
    const px = p.x ?? x + fw, pw = p.w ?? w - 2 * fw;
    items.push(<Box key={`p${k}`} x={px + 1} y={p.y + 1} z={z} w={pw - 2} h={p.h - 2} d={8} m={p.m} />);
    // профіль-розділювач над панеллю (окрім верхньої)
    if (p.y + p.h < y0 + h - fw - 1) items.push(<Box key={`r${k}`} x={px} y={p.y + p.h - rail / 2} z={z - 2} w={pw} h={rail} d={12} m={mats.handle} />);
    if (p.x !== undefined && p.x + pw < x + w - fw - 1) items.push(<Box key={`c${k}`} x={p.x + pw - rail / 2} y={p.y} z={z - 2} w={rail} h={p.h} d={12} m={mats.handle} />);
  });
  return (
    <>
      {items}
      <Box x={x} y={y0} z={z - 4} w={fw} h={h} d={20} m={mats.handle} />
      <Box x={x + w - fw} y={y0} z={z - 4} w={fw} h={h} d={20} m={mats.handle} />
      <Box x={x + fw} y={y0 + h - fw} z={z - 4} w={w - 2 * fw} h={fw} d={20} m={mats.handle} />
      <Box x={x + fw} y={y0} z={z - 4} w={w - 2 * fw} h={fw} d={20} m={mats.handle} />
    </>
  );
}

// ---------- наповнення ----------

interface Section { x: number; w: number; kind: 'shelves' | 'main' | 'ironing' }

function Interior({ u, t, mats, front, ledMode }: { u: Unit; t: number; mats: Mats; front: number; ledMode: LedMode | null }) {
  const cfg = u.wardrobe!;
  const y0 = u.plinth + t, y1 = u.h - t;
  const x0 = t, x1 = u.w - t;
  const depth = front - 4; // від задньої стінки до лінії дверей
  const z0 = 4;
  // секції: прасувальна дошка 320 мм (за бажанням) + решта по ~800 мм
  const iron = cfg.ironing ? 320 : 0;
  const rest = x1 - x0 - iron - (iron ? t : 0);
  const n = Math.max(2, Math.round(rest / 800));
  const sw = (rest - (n - 1) * t) / n;
  const secs: Section[] = [];
  for (let k = 0; k < n; k++) {
    const isMain = n === 2 ? k === 0 : k > 0 && k < n - 1;
    secs.push({ x: x0 + k * (sw + t), w: sw, kind: isMain ? 'main' : 'shelves' });
  }
  if (iron) secs.push({ x: x1 - iron, w: iron, kind: 'ironing' });

  const items: ReactNode[] = [];
  const shelvesY: { x: number; w: number; y: number }[] = [];
  const shelf = (k: string, s: Section, y: number) => {
    items.push(<Box key={k} x={s.x} y={y} z={z0} w={s.w} h={t} d={depth - 20} m={mats.carcass} />);
    shelvesY.push({ x: s.x, w: s.w, y });
  };
  const rod = (k: string, s: Section, y: number) =>
    items.push(<Box key={k} x={s.x} y={y} z={z0 + depth / 2 - 10} w={s.w} h={20} d={20} m={mats.steel} />);

  secs.forEach((s, k) => {
    // перегородки між секціями
    if (k > 0) items.push(<Box key={`pt${k}`} x={s.x - t} y={y0} z={z0} w={t} h={y1 - y0} d={depth} m={mats.carcass} />);
    if (s.kind === 'shelves') {
      for (let y = y0 + 380; y < y1 - 120; y += 380) shelf(`sh${k}-${y}`, s, y);
    } else if (s.kind === 'ironing') {
      // складена прасувальна дошка на кронштейні
      items.push(<Box key="ib" x={s.x + 40} y={y0 + 250} z={z0 + depth - 90} w={s.w - 80} h={1250} d={30} m={mats.ceramic} />);
      items.push(<Box key="ik" x={s.x + 30} y={y0 + 200} z={z0 + depth - 110} w={s.w - 60} h={30} d={60} m={mats.steel} />);
      shelf(`ish${k}`, s, y1 - 350);
    } else if (cfg.interior === 'shelves-pantograph') {
      shelf(`top${k}`, s, y1 - 320);
      // пантограф: штанга на важелях, що опускається
      rod(`pg${k}`, s, y1 - 420);
      items.push(<Box key={`pga${k}`} x={s.x + 15} y={y1 - 420} z={z0 + depth / 2 - 10} w={18} h={110} d={18} m={mats.steel} />);
      items.push(<Box key={`pgb${k}`} x={s.x + s.w - 33} y={y1 - 420} z={z0 + depth / 2 - 10} w={18} h={110} d={18} m={mats.steel} />);
      shelf(`mid${k}`, s, 1250);
      rod(`rd${k}`, s, 1180);
    } else if (cfg.interior === 'dresser-center') {
      // комод: 4 шухляди до 800 мм
      const dh = (800 - y0) / 4;
      for (let q = 0; q < 4; q++) {
        items.push(<Box key={`dr${k}-${q}`} x={s.x + 2} y={y0 + q * dh + 2} z={z0 + depth - 24} w={s.w - 4} h={dh - 4} d={18} m={mats.base} />);
        items.push(<Box key={`dh${k}-${q}`} x={s.x + s.w / 2 - 60} y={y0 + q * dh + dh - 40} z={z0 + depth - 6} w={120} h={10} d={10} m={mats.steel} />);
      }
      items.push(<Box key={`dk${k}`} x={s.x} y={y0} z={z0} w={s.w} h={800 - y0} d={depth - 26} m={mats.carcass} />);
      shelf(`dtop${k}`, s, 800);
      rod(`rd${k}`, s, 1750);
      shelf(`top${k}`, s, y1 - 320);
    } else {
      shelf(`top${k}`, s, y1 - 330);
      rod(`rd${k}`, s, y1 - 400);
      shelf(`low${k}`, s, y0 + 300);
    }
  });

  // LED: по висоті - профілі по боках секцій; під полицями - стрічки біля переднього краю
  if (ledMode) {
    const tex = glowTexture();
    const strip = (k: string, x: number, y: number, w: number, h: number, z: number) =>
      items.push(
        <mesh key={k} position={[x + w / 2, y + h / 2, z]} scale={[w, h, 8]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#fff1d0" toneMapped={false} />
        </mesh>,
      );
    const glow = (k: string, x: number, yTop: number, w: number, h: number, op: number) =>
      items.push(
        <mesh key={k} position={[x + w / 2, yTop - h / 2, z0 + 2]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={op} />
        </mesh>,
      );
    if (ledMode === 'vertical') {
      secs.forEach((s, k) => {
        strip(`lv${k}a`, s.x + 4, y0, 8, y1 - y0, z0 + depth - 40);
        strip(`lv${k}b`, s.x + s.w - 12, y0, 8, y1 - y0, z0 + depth - 40);
        glow(`lg${k}`, s.x, y1, s.w, y1 - y0, 0.45);
      });
    } else {
      shelvesY.forEach((sh, k) => {
        strip(`ls${k}`, sh.x + 20, sh.y - 6, sh.w - 40, 6, z0 + depth - 60);
        glow(`lgs${k}`, sh.x, sh.y, sh.w, 380, 0.9);
      });
    }
  }
  return <>{items}</>;
}

// ---------- шафа цілком ----------

export function WardrobeUnit({ u, mats, handle, t, open, ledMode, hide }: { u: Unit; mats: Mats; handle: HandleType; t: number; open: boolean; ledMode: LedMode | null; hide: boolean }) {
  const cfg = u.wardrobe!;
  const y0 = u.plinth;
  const mirror = cfg.mirror === 'pattern' ? mats.mirrorPattern : cfg.mirror === 'photo' ? mats.photo : mats.mirror;
  const sliding = !!u.sliding;
  // купе: двері всередині корпусу, у 100 мм від переднього краю; розпашні - накладні
  const front = sliding ? u.d - 100 : u.d;

  const doors: ReactNode[] = [];
  if (sliding) {
    const n = u.doors, ov = 30;
    const iw = u.w - 2 * t;
    const dw = (iw + ov * (n - 1)) / n;
    const dy = y0 + t, dh = u.h - t - dy;
    for (let i = 0; i < n; i++) {
      const x = t + i * (dw - ov);
      // дві напрямні: парні двері ззаду, непарні спереду
      const z = u.d - 70 + (i % 2) * 35;
      // відчиняється, зсуваючись за сусідні двері (до центру або до краю)
      const dir = i < n / 2 ? 1 : -1;
      doors.push(
        <Movable key={`d${i}`} kind="slide" amount={dir * (dw - ov) * 0.92} open={open}>
          <KupeDoor i={i} n={n} x={x} w={dw} y0={dy} h={dh} z={z} style={cfg.style} mats={mats} mirror={mirror} />
        </Movable>,
      );
    }
    // напрямні зверху і знизу
    doors.push(<Box key="tr" x={t} y={u.h - t - 10} z={u.d - 80} w={iw} h={10} d={80} m={mats.handle} />);
    doors.push(<Box key="br" x={t} y={y0 + t} z={u.d - 80} w={iw} h={6} d={80} m={mats.handle} />);
  } else {
    const n = u.doors;
    const hc = u.h - y0;
    const fz = u.d + K.facadeOffset;
    for (let i = 0; i < n; i++) {
      const side: 'left' | 'right' = n === 1 || i % 2 === 0 ? 'right' : 'left'; // пари дверей відчиняються від центру пари
      const x = (u.w / n) * i, w = u.w / n;
      // висота більша за лист - нижня дверка 2780, над нею окрема
      const parts = hc > SHEET_MAX ? [{ y: y0, h: SHEET_MAX }, { y: y0 + SHEET_MAX, h: hc - SHEET_MAX }] : [{ y: y0, h: hc }];
      parts.forEach((p, k) => {
        const r: Rect = { x, y: p.y, w, h: p.h, profile: side, rail: { orient: 'v', side, at: k === 0 ? 'mid' : 'bottom' } };
        const hingeX = side === 'right' ? x : x + w; // петлі - з протилежного від ручки боку
        doors.push(
          <Movable key={`d${i}-${k}`} kind="hinge" pivotX={hingeX} pivotZ={fz} amount={(side === 'right' ? -1 : 1) * 1.75} open={open}>
            <Facade r={r} z={fz} m={mats.base} mats={mats} handle={handle} />
          </Movable>,
        );
      });
    }
  }

  return (
    <group position={[u.frame.x, u.y, u.frame.z]} rotation={[0, u.frame.rotY, 0]}>
      {/* корпус */}
      <Box x={t} y={0} z={u.d - 60 - 16} w={u.w - 2 * t} h={u.plinth} d={16} m={mats.plinth} />
      <Box x={0} y={0} z={0} w={t} h={u.h} d={u.d} m={mats.carcass} />
      <Box x={u.w - t} y={0} z={0} w={t} h={u.h} d={u.d} m={mats.carcass} />
      <Box x={t} y={y0} z={0} w={u.w - 2 * t} h={t} d={u.d} m={mats.carcass} />
      <Box x={t} y={u.h - t} z={0} w={u.w - 2 * t} h={t} d={u.d} m={mats.carcass} />
      <Box x={t} y={y0 + t} z={0} w={u.w - 2 * t} h={u.h - y0 - 2 * t} d={4} m={mats.carcass} />
      <Interior u={u} t={t} mats={mats} front={front} ledMode={ledMode} />
      {/* "Показати наповнення" - двері знімаються повністю */}
      {!hide && doors}
    </group>
  );
}
