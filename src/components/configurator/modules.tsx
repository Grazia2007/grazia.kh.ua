'use client';
// Параметричні модулі: корпус з ДСП заданої товщини, цоколь, фасади із зазором, ручки.
// Усі розміри в мм у локальній системі модуля (X - ширина, Y - висота, Z - до фасаду).
import { memo, type ReactNode } from 'react';
import * as THREE from 'three';
import { K, type Unit, type Slab, type Fixture } from './layout';
import type { HandleType } from './materials';

export type MatKey = 'carcass' | 'base' | 'upper' | 'topTier' | 'countertop' | 'handle' | 'plinth' | 'steel' | 'glass' | 'mirror' | 'ceramic';
export type Mats = Record<MatKey, THREE.Material>;

// одна геометрія на всю сцену, розмір задає scale
const BOX = new THREE.BoxGeometry(1, 1, 1);

function Box({ x, y, z, w, h, d, m }: { x: number; y: number; z: number; w: number; h: number; d: number; m: THREE.Material }) {
  if (w <= 0 || h <= 0 || d <= 0) return null;
  return <mesh geometry={BOX} material={m} position={[x + w / 2, y + h / 2, z + d / 2]} scale={[w, h, d]} castShadow receiveShadow />;
}

type Edge = 'top' | 'bottom' | 'left' | 'right';
type Rail = { orient: 'h' } | { orient: 'v'; side: 'left' | 'right'; at: 'top' | 'bottom' | 'mid' };
interface Rect { x: number; y: number; w: number; h: number; profile: Edge; rail: Rail }

const PROFILE = 25; // ширина профіль-ручки
const RAIL = 160; // довжина рейлінга на дверях

// фасад + ручка обраного типу
function Facade({ r, z, m, mats, handle }: { r: Rect; z: number; m: THREE.Material; mats: Mats; handle: HandleType }) {
  const g = K.gap / 2;
  let x = r.x + g, y = r.y + g, w = r.w - K.gap, h = r.h - K.gap;
  const t = K.facadeT;
  let extra: ReactNode = null;
  if (handle === 'profile') {
    // профіль на краю фасаду: фасад коротшає, на краю - металева смуга, трохи втоплена
    const hz = z - 6;
    const e = r.profile;
    if (e === 'top') { h -= PROFILE; extra = <Box x={x} y={y + h} z={hz} w={w} h={PROFILE} d={t} m={mats.handle} />; }
    if (e === 'bottom') { extra = <Box x={x} y={y} z={hz} w={w} h={PROFILE} d={t} m={mats.handle} />; y += PROFILE; h -= PROFILE; }
    if (e === 'right') { w -= PROFILE; extra = <Box x={x + w} y={y} z={hz} w={PROFILE} h={h} d={t} m={mats.handle} />; }
    if (e === 'left') { extra = <Box x={x} y={y} z={hz} w={PROFILE} h={h} d={t} m={mats.handle} />; x += PROFILE; w -= PROFILE; }
  }
  if (handle === 'gola') {
    // Gola: фасад коротший на 35 мм, у корпусі - втоплений канал на всю ширину/висоту
    const G = 35, depth = 45, cz = z - depth;
    const e = r.profile;
    if (e === 'top') { h -= G; extra = <Box x={r.x} y={y + h + K.gap / 2} z={cz} w={r.w} h={G} d={depth} m={mats.handle} />; }
    if (e === 'bottom') { extra = <Box x={r.x} y={r.y} z={cz} w={r.w} h={G} d={depth} m={mats.handle} />; y += G; h -= G; }
    if (e === 'right') { w -= G; extra = <Box x={x + w + K.gap / 2} y={r.y} z={cz} w={G} h={r.h} d={depth} m={mats.handle} />; }
    if (e === 'left') { extra = <Box x={r.x} y={r.y} z={cz} w={G} h={r.h} d={depth} m={mats.handle} />; x += G; w -= G; }
  }
  if (handle === 'rail') {
    const hz = z + t + 18;
    if (r.rail.orient === 'h') {
      const len = Math.max(60, Math.min(w - 120, 320));
      extra = <Box x={x + (w - len) / 2} y={y + h - 50} z={hz} w={len} h={12} d={12} m={mats.handle} />;
    } else {
      const len = Math.min(RAIL, h - 80);
      const hx = r.rail.side === 'left' ? x + 40 : x + w - 52;
      const hy = r.rail.at === 'top' ? y + h - 50 - len : r.rail.at === 'bottom' ? y + 50 : y + Math.min(h - len - 50, Math.max(50, 1000 - r.y));
      extra = <Box x={hx} y={hy} z={hz} w={12} h={len} d={12} m={mats.handle} />;
    }
  }
  return (
    <>
      <Box x={x} y={y} z={z} w={w} h={h} d={t} m={m} />
      {extra}
    </>
  );
}

// двері в ряд; відчиняються назовні від центру
function doorRow(x0: number, w: number, y: number, h: number, n: number, profile: Edge | 'side', at: 'top' | 'bottom' | 'mid'): Rect[] {
  return Array.from({ length: n }, (_, i) => {
    const side: 'left' | 'right' = n === 1 || i < n / 2 ? 'right' : 'left';
    return { x: x0 + (w / n) * i, y, w: w / n, h, profile: profile === 'side' ? side : profile, rail: { orient: 'v', side, at } };
  });
}

function CabinetImpl({ u, mats, handle, t }: { u: Unit; mats: Mats; handle: HandleType; t: number }) {
  const fm = mats[u.zone];
  const y0 = u.plinth;
  const hc = u.h - y0;
  const fz = u.d + K.facadeOffset;
  const items: ReactNode[] = [];
  const box = (k: string, x: number, y: number, z: number, w: number, h: number, d: number, m: THREE.Material) =>
    items.push(<Box key={k} x={x} y={y} z={z} w={w} h={h} d={d} m={m} />);

  // корпус: боковини, дно, кришка, задня стінка 4 мм; цоколь втоплений на 60 мм
  if (u.plinth) box('pl', t, 0, u.d - 60, u.w - 2 * t, u.plinth, 16, mats.plinth);
  box('sl', 0, y0, 0, t, hc, u.d, mats.carcass);
  box('sr', u.w - t, y0, 0, t, hc, u.d, mats.carcass);
  box('bt', t, y0, 0, u.w - 2 * t, t, u.d, mats.carcass);
  box('tp', t, u.h - t, 0, u.w - 2 * t, t, u.d, mats.carcass);
  box('bk', t, y0 + t, 0, u.w - 2 * t, hc - 2 * t, 4, mats.carcass);

  const rects: Rect[] = [];

  if (u.kind === 'wardrobe' && u.sliding) {
    // купе: двері на двох напрямних з перехлестом 30 мм, рамка з профілю
    const n = u.doors, ov = 30, fw = 20;
    const dw = (u.w + ov * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const x = i * (dw - ov), z = fz + 10 + (i % 2) * 30;
      box(`d${i}`, x + fw, y0 + fw, z, dw - 2 * fw, hc - 2 * fw, 10, fm);
      box(`dl${i}`, x, y0, z - 4, fw, hc, 18, mats.handle);
      box(`dr${i}`, x + dw - fw, y0, z - 4, fw, hc, 18, mats.handle);
      box(`dt${i}`, x + fw, u.h - fw, z - 4, dw - 2 * fw, fw, 18, mats.handle);
      box(`db${i}`, x + fw, y0, z - 4, dw - 2 * fw, fw, 18, mats.handle);
    }
  } else if (u.kind === 'tall' && u.tall) {
    const v = (y: number, h: number): Rect => ({ x: 0, y, w: u.w, h, profile: 'left', rail: { orient: 'v', side: 'left', at: 'mid' } });
    const flip = (y: number, h: number, e: Edge): Rect => ({ x: 0, y, w: u.w, h, profile: e, rail: { orient: 'h' } });
    if (u.tall === 'fridge_built') rects.push(v(y0, 1770), { ...v(y0 + 1770, u.h - y0 - 1770), rail: { orient: 'v', side: 'left', at: 'bottom' } });
    if (u.tall === 'storage') rects.push(v(y0, hc * 0.55), { ...v(y0 + hc * 0.55, hc * 0.45), rail: { orient: 'v', side: 'left', at: 'bottom' } });
    if (u.tall === 'oven') {
      rects.push(flip(y0, 800 - y0, 'top'), flip(1780, u.h - 1780, 'bottom'));
      box('ov', t + 2, 805, fz - 20, u.w - 2 * t - 4, 590, 40, mats.glass);
      box('ovh', t + 40, 1340, fz + 20, u.w - 2 * t - 80, 14, 14, mats.steel);
      box('mw', t + 2, 1405, fz - 20, u.w - 2 * t - 4, 370, 40, mats.glass);
    }
    if (u.tall === 'fridge_open') {
      rects.push(flip(1900, u.h - 1900, 'bottom'));
      box('fr', t + 15, y0 + t, 40, u.w - 2 * t - 30, 1880 - y0 - t, u.d - 20, mats.steel);
    }
  } else if (u.drawers) {
    // шухляди: нижня найвища
    const ks = [0.25, 0.35, 0.4].slice(0, u.drawers);
    const sum = ks.reduce((a, b) => a + b, 0);
    let y = u.h;
    for (const k of ks) { const h = (hc * k) / sum; y -= h; rects.push({ x: 0, y, w: u.w, h, profile: 'top', rail: { orient: 'h' } }); }
  } else if (u.blind) {
    // сліпий кут: глуха панель у фасаді, двері лише на відкритій частині
    const active = u.w - u.blind.w;
    const start = u.blind.side === 'start';
    box('bl', start ? 0 : active, y0 + K.gap / 2, fz, u.blind.w - K.gap / 2, hc - K.gap, K.facadeT, fm);
    rects.push({ x: start ? u.blind.w : 0, y: y0, w: active, h: hc, profile: 'top', rail: { orient: 'v', side: start ? 'right' : 'left', at: 'top' } });
  } else if (u.doors) {
    if (u.kind === 'base') rects.push(...doorRow(0, u.w, y0, hc, u.doors, 'top', 'top'));
    else if (u.kind === 'upper' || u.kind === 'mirror') rects.push(...doorRow(0, u.w, y0, hc, u.doors, 'bottom', 'bottom'));
    else if (u.kind === 'top' || u.kind === 'hanging') {
      const e: Edge = u.kind === 'top' ? 'bottom' : 'top';
      for (const r of doorRow(0, u.w, y0, hc, u.doors, e, 'mid')) rects.push({ ...r, rail: { orient: 'h' } });
    } else rects.push(...doorRow(0, u.w, y0, hc, u.doors, 'side', 'mid'));
  }

  const doorMat = u.mirror ? mats.mirror : fm;
  // верхні шафи з Gola не мають каналу - відкриваються push-to-open
  const h2: HandleType = handle === 'gola' && (u.kind === 'upper' || u.kind === 'top' || u.kind === 'mirror') ? 'none' : handle;
  rects.forEach((r, i) => items.push(<Facade key={`f${i}`} r={r} z={fz} m={doorMat} mats={mats} handle={u.mirror ? 'none' : h2} />));
  // дзеркальна шафа: рамка-полиця знизу в кольорі фасаду
  if (u.mirror) box('mf', 0, y0 - 20, 0, u.w, 20, u.d + K.facadeOffset + K.facadeT, fm);

  return (
    <group position={[u.frame.x, u.y, u.frame.z]} rotation={[0, u.frame.rotY, 0]}>
      {items}
    </group>
  );
}
export const Cabinet = memo(CabinetImpl);

export function SlabMesh({ s, m }: { s: Slab; m: THREE.Material }) {
  return (
    <group position={[s.frame.x, s.y, s.frame.z]} rotation={[0, s.frame.rotY, 0]}>
      <Box x={s.x0} y={0} z={s.z0} w={s.w} h={s.h} d={s.d} m={m} />
    </group>
  );
}

export function FixtureMesh({ f, mats }: { f: Fixture; mats: Mats }) {
  const m = f.kind === 'hob' || f.kind === 'tv' ? mats.glass : f.kind === 'basin' ? mats.ceramic : mats.steel;
  return (
    <group position={[f.frame.x, f.y, f.frame.z]} rotation={[0, f.frame.rotY, 0]}>
      <Box x={f.x0} y={0} z={f.z0} w={f.w} h={f.h} d={f.d} m={m} />
      {/* змішувач */}
      {f.kind === 'sink' && <Box x={f.x0 + f.w / 2 - 20} y={0} z={f.z0 - 40} w={40} h={260} d={40} m={mats.steel} />}
    </group>
  );
}
