'use client';
// ТВ-зона: тумба (на підлозі або підвісна), колони з боків (стелаж / вітрина / шафа),
// настінні полиці, панель за ТВ. Розміри в мм, локальні координати модуля.
import { useEffect, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { K, type Unit } from './layout';
import type { HandleType } from './materials';
import { Box, Facade, glowTexture, type Mats, type Rect } from './modules';
import { GlassDoor, Movable } from './wardrobe';

const Strip = ({ x, y, z, w }: { x: number; y: number; z: number; w: number }) => (
  <mesh position={[x + w / 2, y - 3, z]} scale={[w, 6, 10]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#fff1d0" toneMapped={false} />
  </mesh>
);
const Glow = ({ x, yTop, w, h, z }: { x: number; yTop: number; w: number; h: number; z: number }) => (
  <mesh position={[x + w / 2, yTop - h / 2, z]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={glowTexture()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.8} />
  </mesh>
);

export function LivingUnit({ u, mats, handle, t, open, hide, doorsKey, led }: { u: Unit; mats: Mats; handle: HandleType; t: number; open: boolean; hide: boolean; doorsKey: string; led: boolean }) {
  const v = u.living!;
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => { invalidate(); }, [hide, open, led, invalidate]);
  const hnd: HandleType = handle === 'long' ? 'rail' : handle;
  const items: ReactNode[] = [];
  const W = u.w, D = u.d, colD = 400;
  const fz = D + K.facadeOffset;
  const l = v.left !== 'none' ? v.colW : 0, r = v.right !== 'none' ? v.colW : 0;

  // двері, що відчиняються (петлі з боку, протилежного ручці)
  const door = (key: string, rect: Rect, z: number, m: THREE.Material, glass = false) => {
    if (hide) return;
    const right = rect.profile === 'right';
    items.push(
      <Movable key={`${key}-${doorsKey}`} kind="hinge" pivotX={right ? rect.x : rect.x + rect.w} pivotZ={z} amount={(right ? -1 : 1) * 1.6} open={open}>
        {glass ? <GlassDoor x={rect.x} y={rect.y} w={rect.w} h={rect.h} z={z} mats={mats} /> : <Facade r={rect} z={z} m={m} mats={mats} handle={hnd} />}
      </Movable>,
    );
  };
  const front = (key: string, rect: Rect) => !hide && items.push(<Facade key={key} r={rect} z={fz} m={mats.base} mats={mats} handle={hnd} />);

  // ---------- тумба ----------
  const y0 = v.tumbaY, th = v.tumbaH, x0 = l, x1 = W - r;
  if (v.mount === 'floor') items.push(<Box key="pl" x={x0 + t} y={0} z={D - 60 - 16} w={x1 - x0 - 2 * t} h={80} d={16} m={mats.plinth} />);
  const by = v.mount === 'floor' ? 80 : y0; // низ корпусу
  const top = y0 + th;
  items.push(<Box key="tb" x={x0} y={by} z={0} w={x1 - x0} h={t} d={D} m={mats.carcass} />);
  items.push(<Box key="tbk" x={x0} y={by} z={0} w={x1 - x0} h={top - by} d={4} m={mats.carcass} />);
  // стільниця тумби - другим кольором, як на фото робіт
  items.push(<Box key="tt" x={x0} y={top} z={0} w={x1 - x0} h={18} d={D + K.facadeOffset + K.facadeT} m={mats.upper} />);
  const center = Math.floor(v.modules.length / 2);
  let mx = x0;
  v.modules.forEach((mw, i) => {
    items.push(<Box key={`ts${i}`} x={mx} y={by} z={0} w={t} h={top - by} d={D} m={mats.carcass} />);
    const fy = by + t, fh = top - fy;
    const isNiche = v.niche && i === center;
    if (isNiche) {
      // відкрита ніша під техніку з полицею
      items.push(<Box key={`ns${i}`} x={mx + t} y={fy + fh / 2} z={4} w={mw - t} h={t} d={D - 20} m={mats.carcass} />);
      if (led) { items.push(<Strip key={`nl${i}`} x={mx + t + 20} y={top} z={D - 40} w={mw - t - 40} />); items.push(<Glow key={`ng${i}`} x={mx + t} yTop={top} w={mw - t} h={fh} z={6} />); }
    } else if (v.fronts === 'drawers') {
      front(`d${i}a`, { x: mx, y: fy, w: mw, h: fh / 2, profile: 'top', rail: { orient: 'h' } });
      front(`d${i}b`, { x: mx, y: fy + fh / 2, w: mw, h: fh / 2, profile: 'top', rail: { orient: 'h' } });
    } else if (v.fronts === 'flip') {
      front(`f${i}`, { x: mx, y: fy, w: mw, h: fh, profile: 'top', rail: { orient: 'h' } });
    } else {
      const n = mw > 550 ? 2 : 1;
      for (let q = 0; q < n; q++) {
        const side: 'left' | 'right' = n === 1 ? 'right' : q === 0 ? 'right' : 'left';
        door(`dd${i}-${q}`, { x: mx + (mw / n) * q, y: fy, w: mw / n, h: fh, profile: side, rail: { orient: 'v', side, at: 'top' } }, fz, mats.base);
      }
    }
    mx += mw;
  });
  items.push(<Box key="tse" x={x1 - t} y={by} z={0} w={t} h={top - by} d={D} m={mats.carcass} />);

  // ---------- колони ----------
  const column = (key: string, kind: typeof v.left, cx: number, side: 'left' | 'right') => {
    if (kind === 'none') return;
    const w = v.colW, h = v.colH, cz = colD + K.facadeOffset;
    const handleSide: 'left' | 'right' = side === 'left' ? 'right' : 'left'; // ручка - до ТВ
    items.push(<Box key={`${key}pl`} x={cx + t} y={0} z={colD - 76} w={w - 2 * t} h={80} d={16} m={mats.plinth} />);
    items.push(<Box key={`${key}l`} x={cx} y={0} z={0} w={t} h={h} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}r`} x={cx + w - t} y={0} z={0} w={t} h={h} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}t`} x={cx} y={h - t} z={0} w={w} h={t} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}b`} x={cx + t} y={80} z={0} w={w - 2 * t} h={t} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}k`} x={cx + t} y={80} z={0} w={w - 2 * t} h={h - 80} d={4} m={mats.carcass} />);
    // низ колони: 3 шухляди до 700 мм (як на фото вітрин)
    const low = kind === 'shelves' ? 0 : 700;
    for (let q = 0; q < 3 && low; q++) {
      const dh = (low - 80 - t) / 3;
      front(`${key}dr${q}`, { x: cx, y: 80 + t + q * dh, w, h: dh, profile: 'top', rail: { orient: 'h' } });
    }
    if (low) items.push(<Box key={`${key}m`} x={cx + t} y={low} z={0} w={w - 2 * t} h={t} d={colD} m={mats.carcass} />);
    const sy0 = (low || 80) + t, sy1 = h - t;
    const shelfM = kind === 'vitrine' ? mats.glassClear : mats.carcass;
    for (let y = sy0 + 330; y < sy1 - 100; y += 330) {
      items.push(<Box key={`${key}s${y}`} x={cx + t} y={y} z={8} w={w - 2 * t} h={kind === 'vitrine' ? 8 : t} d={colD - 30} m={shelfM} />);
      if (led) { items.push(<Strip key={`${key}ls${y}`} x={cx + t + 20} y={y + (kind === 'vitrine' ? 8 : t) + 330 - 4} z={colD - 50} w={w - 2 * t - 40} />); items.push(<Glow key={`${key}g${y}`} x={cx + t} yTop={y + 330} w={w - 2 * t} h={330} z={6} />); }
    }
    if (led && kind !== 'closed') items.push(<Glow key={`${key}gt`} x={cx + t} yTop={sy1} w={w - 2 * t} h={sy1 - sy0} z={6} />);
    const upper: Rect = { x: cx, y: sy0, w, h: sy1 - sy0 + t, profile: handleSide, rail: { orient: 'v', side: handleSide, at: 'bottom' } };
    if (kind === 'vitrine') door(`${key}gd`, upper, cz, mats.base, true);
    if (kind === 'closed') door(`${key}cd`, upper, cz, mats.base);
  };
  column('L', v.left, 0, 'left');
  column('R', v.right, W - v.colW, 'right');

  // ---------- полиці над ТВ і панель ----------
  const span = x1 - x0;
  if (v.panel) {
    const pw = Math.min(span - 100, 2000);
    items.push(<Box key="pn" x={x0 + (span - pw) / 2} y={top + 18} z={0} w={pw} h={Math.min(v.colH, 2100) - top - 18} d={18} m={mats.upper} />);
  }
  for (let q = 0; q < v.shelves; q++) {
    const sw = Math.min(span - 200, 1600);
    const sy = 1750 + q * 330;
    const sx = x0 + (span - sw) / 2;
    items.push(<Box key={`ws${q}`} x={sx} y={sy} z={v.panel ? 18 : 0} w={sw} h={25} d={240} m={mats.upper} />);
    if (led) items.push(<Strip key={`wl${q}`} x={sx + 30} y={sy} z={180} w={sw - 60} />);
  }

  return <group position={[u.frame.x, u.y, u.frame.z]} rotation={[0, u.frame.rotY, 0]}>{items}</group>;
}
