'use client';
// ТВ-зона: тумба (на підлозі або підвісна) з секціями закритими / відкритими / за склом,
// колони з боків (стелаж / вітрина / шафа, на підлозі або підвісні), ряд шаф над ТВ,
// настінні полиці (над ТВ або збоку), панель за ТВ (гладка або рейки). Розміри в мм.
import { useEffect, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { K, type Unit, type SecKind } from './layout';
import type { HandleType } from './materials';
import { Box, Facade, Slide, glowTexture, type Mats, type Rect } from './modules';
import { GlassDoor, Movable } from './wardrobe';

const Strip = ({ x, y, z, w }: { x: number; y: number; z: number; w: number }) => (
  <mesh position={[x + w / 2, y - 3, z]} scale={[w, 6, 10]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#fff1d0" toneMapped={false} />
  </mesh>
);
const Glow = ({ x, yTop, w, h, z, op = 0.8 }: { x: number; yTop: number; w: number; h: number; z: number; op?: number }) => (
  <mesh position={[x + w / 2, yTop - h / 2, z]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={glowTexture()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={op} />
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

  // ---------- рухомі фасади ----------
  const hinged = (key: string, rect: Rect, z: number, glass = false) => {
    if (hide) return;
    const right = rect.profile === 'right';
    items.push(
      <Movable key={`${key}-${doorsKey}`} kind="hinge" pivotX={right ? rect.x : rect.x + rect.w} pivotZ={z} amount={(right ? -1 : 1) * 1.6} open={open}>
        {glass ? <GlassDoor x={rect.x} y={rect.y} w={rect.w} h={rect.h} z={z} mats={mats} /> : <Facade r={rect} z={z} m={mats.base} mats={mats} handle={hnd} />}
      </Movable>,
    );
  };
  // шухляда: фасад + короб виїжджають уперед
  const drawer = (key: string, rect: Rect, depth: number) => {
    if (hide) return;
    items.push(
      <Slide key={`${key}-${doorsKey}`} open={open} by={Math.min(380, depth - 60)}>
        <Facade r={rect} z={fz} m={mats.base} mats={mats} handle={hnd} />
        <Box x={rect.x + t + 10} y={rect.y + 20} z={40} w={rect.w - 2 * t - 20} h={Math.min(120, rect.h - 40)} d={depth - 60} m={mats.carcass} />
      </Slide>,
    );
  };
  // відкидний фасад: повертається вниз навколо нижнього краю
  const flip = (key: string, rect: Rect, glass = false) => {
    if (hide) return;
    items.push(
      <Movable key={`${key}-${doorsKey}`} kind="lift" pivotY={rect.y} pivotZ={fz} amount={1.35} open={open}>
        {glass ? <GlassDoor x={rect.x} y={rect.y} w={rect.w} h={rect.h} z={fz} mats={mats} /> : <Facade r={{ ...rect, profile: 'top', rail: { orient: 'h' } }} z={fz} m={mats.base} mats={mats} handle={hnd} />}
      </Movable>,
    );
  };

  // ---------- тумба ----------
  const y0 = v.tumbaY, th = v.tumbaH, x0 = l, x1 = W - r;
  if (v.mount === 'floor') items.push(<Box key="pl" x={x0 + t} y={0} z={D - 60 - 16} w={x1 - x0 - 2 * t} h={80} d={16} m={mats.plinth} />);
  const by = v.mount === 'floor' ? 80 : y0;
  const top = y0 + th;
  items.push(<Box key="tb" x={x0} y={by} z={0} w={x1 - x0} h={t} d={D} m={mats.carcass} />);
  items.push(<Box key="tbk" x={x0} y={by} z={0} w={x1 - x0} h={top - by} d={4} m={mats.carcass} />);
  items.push(<Box key="tt" x={x0} y={top} z={0} w={x1 - x0} h={18} d={D + K.facadeOffset + K.facadeT} m={mats.upper} />);
  if (led && v.mount === 'wall') items.push(<Glow key="under" x={x0} yTop={by} w={x1 - x0} h={by} z={3} op={0.6} />);

  const n = v.modules.length;
  // центр: 1 секція при непарній кількості, 2 - при парній
  const isCenter = (i: number) => (n % 2 ? i === (n - 1) / 2 : i === n / 2 - 1 || i === n / 2);
  let mx = x0;
  v.modules.forEach((mw, i) => {
    items.push(<Box key={`ts${i}`} x={mx} y={by} z={0} w={t} h={top - by} d={D} m={mats.carcass} />);
    const fy = by + t, fh = top - fy;
    const kind: SecKind = n === 1 ? v.centerKind : isCenter(i) ? v.centerKind : v.sideKind;
    if (kind !== 'closed') {
      items.push(<Box key={`ns${i}`} x={mx + t} y={fy + fh / 2} z={4} w={mw - t} h={kind === 'glass' ? 8 : t} d={D - 20} m={kind === 'glass' ? mats.glassClear : mats.carcass} />);
      if (led) { items.push(<Strip key={`nl${i}`} x={mx + t + 20} y={top} z={D - 40} w={mw - t - 40} />); items.push(<Glow key={`ng${i}`} x={mx + t} yTop={top} w={mw - t} h={fh} z={6} />); }
      if (kind === 'glass') flip(`g${i}`, { x: mx, y: fy, w: mw, h: fh, profile: 'top', rail: { orient: 'h' } }, true);
    } else if (v.fronts === 'drawers') {
      drawer(`d${i}a`, { x: mx, y: fy, w: mw, h: fh / 2, profile: 'top', rail: { orient: 'h' } }, D);
      drawer(`d${i}b`, { x: mx, y: fy + fh / 2, w: mw, h: fh / 2, profile: 'top', rail: { orient: 'h' } }, D);
    } else if (v.fronts === 'flip') {
      flip(`f${i}`, { x: mx, y: fy, w: mw, h: fh, profile: 'top', rail: { orient: 'h' } });
    } else {
      const k = mw > 550 ? 2 : 1;
      for (let q = 0; q < k; q++) {
        const side: 'left' | 'right' = k === 1 || q === 0 ? 'right' : 'left';
        hinged(`dd${i}-${q}`, { x: mx + (mw / k) * q, y: fy, w: mw / k, h: fh, profile: side, rail: { orient: 'v', side, at: 'top' } }, fz);
      }
    }
    mx += mw;
  });
  items.push(<Box key="tse" x={x1 - t} y={by} z={0} w={t} h={top - by} d={D} m={mats.carcass} />);

  // ---------- колони ----------
  const cb = v.colMount === 'wall' ? (v.mount === 'wall' ? y0 : 300) : 0; // низ колони
  const column = (key: string, kind: typeof v.left, cx: number, side: 'left' | 'right') => {
    if (kind === 'none') return;
    const w = v.colW, h = v.colH, cz = colD + K.facadeOffset;
    const handleSide: 'left' | 'right' = side === 'left' ? 'right' : 'left'; // ручка - до ТВ
    const base = cb ? cb : 80;
    if (!cb) items.push(<Box key={`${key}pl`} x={cx + t} y={0} z={colD - 76} w={w - 2 * t} h={80} d={16} m={mats.plinth} />);
    items.push(<Box key={`${key}l`} x={cx} y={cb} z={0} w={t} h={h - cb} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}r`} x={cx + w - t} y={cb} z={0} w={t} h={h - cb} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}t`} x={cx} y={h - t} z={0} w={w} h={t} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}b`} x={cx + t} y={base} z={0} w={w - 2 * t} h={t} d={colD} m={mats.carcass} />);
    items.push(<Box key={`${key}k`} x={cx + t} y={base} z={0} w={w - 2 * t} h={h - base} d={4} m={mats.carcass} />);
    if (led && cb) items.push(<Glow key={`${key}under`} x={cx} yTop={cb} w={w} h={cb} z={3} op={0.5} />);
    // низ вітрини/шафи: 3 шухляди
    const low = kind === 'shelves' ? 0 : base + 620;
    for (let q = 0; q < 3 && low; q++) {
      const dh = (low - base - t) / 3;
      drawer(`${key}dr${q}`, { x: cx, y: base + t + q * dh, w, h: dh, profile: 'top', rail: { orient: 'h' } }, colD);
    }
    if (low) items.push(<Box key={`${key}m`} x={cx + t} y={low} z={0} w={w - 2 * t} h={t} d={colD} m={mats.carcass} />);
    const sy0 = (low || base) + t, sy1 = h - t;
    const shelfM = kind === 'vitrine' ? mats.glassClear : mats.carcass;
    for (let y = sy0 + 330; y < sy1 - 100; y += 330) {
      items.push(<Box key={`${key}s${y}`} x={cx + t} y={y} z={8} w={w - 2 * t} h={kind === 'vitrine' ? 8 : t} d={colD - 30} m={shelfM} />);
      if (led) {
        // світло під полицею вище (або під кришкою колони) - не виходить за межі корпусу
        const yt = Math.min(y + 330, sy1);
        items.push(<Strip key={`${key}ls${y}`} x={cx + t + 20} y={yt} z={colD - 50} w={w - 2 * t - 40} />);
        items.push(<Glow key={`${key}g${y}`} x={cx + t} yTop={yt} w={w - 2 * t} h={yt - y} z={6} />);
      }
    }
    const upper: Rect = { x: cx, y: sy0, w, h: sy1 - sy0 + t, profile: handleSide, rail: { orient: 'v', side: handleSide, at: 'bottom' } };
    if (kind === 'vitrine') hinged(`${key}gd`, upper, cz, true);
    if (kind === 'closed') hinged(`${key}cd`, upper, cz);
  };
  column('L', v.left, 0, 'left');
  column('R', v.right, W - v.colW, 'right');

  // ---------- ряд шаф над ТВ (з'єднує колони, як "портал") ----------
  const span = x1 - x0;
  const rowH = 420, rowY = v.colH - rowH;
  // ряд шаф над ТВ має сенс лише між колонами
  const topRow = v.topRow && (l > 0 || r > 0);
  if (topRow) {
    items.push(<Box key="rb" x={x0} y={rowY} z={0} w={span} h={t} d={350} m={mats.carcass} />);
    items.push(<Box key="rt" x={x0} y={v.colH - t} z={0} w={span} h={t} d={350} m={mats.carcass} />);
    items.push(<Box key="rk" x={x0} y={rowY} z={0} w={span} h={rowH} d={4} m={mats.carcass} />);
    const rk = Math.max(1, Math.round(span / 600));
    for (let q = 0; q < rk; q++) {
      const rx = x0 + (span / rk) * q;
      if (q) items.push(<Box key={`rp${q}`} x={rx - t / 2} y={rowY} z={0} w={t} h={rowH} d={350} m={mats.carcass} />);
      if (!hide) items.push(
        <Movable key={`ru${q}-${doorsKey}`} kind="lift" pivotY={v.colH} pivotZ={350 + K.facadeOffset} amount={-1.2} open={open}>
          <Facade r={{ x: rx, y: rowY, w: span / rk, h: rowH, profile: 'bottom', rail: { orient: 'h' } }} z={350 + K.facadeOffset} m={mats.base} mats={mats} handle={hnd} />
        </Movable>,
      );
    }
  }

  // ---------- панель за ТВ ----------
  const panTop = topRow ? rowY : Math.min(v.colH, 2100);
  if (v.panel) {
    const pw = l || r ? span : Math.min(span - 100, 2000);
    const px = x0 + (span - pw) / 2;
    const ph = panTop - top - 18;
    if (v.panelKind === 'slats') {
      // рейки 40 мм з кроком 60 на темній підкладці
      items.push(<Box key="pnb" x={px} y={top + 18} z={0} w={pw} h={ph} d={8} m={mats.plinth} />);
      for (let x = px; x + 40 <= px + pw; x += 60) items.push(<Box key={`sl${x}`} x={x} y={top + 18} z={8} w={40} h={ph} d={30} m={mats.upper} />);
    } else items.push(<Box key="pn" x={px} y={top + 18} z={0} w={pw} h={ph} d={18} m={mats.upper} />);
  }

  // ---------- настінні полиці ----------
  if (v.shelves) {
    const tv = v.tvBox;
    const zBase = v.panel ? (v.panelKind === 'slats' ? 38 : 18) : 0;
    const maxY = (topRow ? rowY : v.colH) - 150;
    // з рядом шаф полиці над ТВ неможливі - ставимо збоку, де більше місця
    const gapL = tv.x - x0, gapR = x1 - (tv.x + tv.w);
    const at = v.shelvesAt === 'tv' && topRow ? (gapL >= gapR ? 'left' : 'right') : v.shelvesAt;
    let sx = 0, sw = 0, ys: number[] = [];
    if (at === 'tv') {
      sw = Math.min(span - 200, 1600); sx = x0 + (span - sw) / 2;
      const s0 = Math.max(1750, tv.y + tv.h + 150);
      ys = Array.from({ length: v.shelves }, (_, q) => s0 + q * 300).filter((y) => y <= maxY);
    } else {
      const room = at === 'left' ? gapL : gapR;
      sw = Math.min(900, room - 120);
      if (sw >= 250) {
        // полиця не заходить на ТВ: відступ 60 мм від ТВ і від краю
        sx = at === 'left' ? tv.x - 60 - sw : tv.x + tv.w + 60;
        const s0 = top + 300;
        const step = Math.min(380, (maxY - s0) / Math.max(1, v.shelves - 1 || 1));
        ys = Array.from({ length: v.shelves }, (_, q) => s0 + q * step).filter((y) => y <= maxY);
      }
    }
    ys.forEach((sy, q) => {
      items.push(<Box key={`ws${q}`} x={sx} y={sy} z={zBase} w={sw} h={25} d={240} m={mats.upper} />);
      if (led) { items.push(<Strip key={`wl${q}`} x={sx + 30} y={sy} z={zBase + 180} w={sw - 60} />); items.push(<Glow key={`wg${q}`} x={sx} yTop={sy} w={sw} h={Math.min(300, sy - top - 20)} z={zBase + 3} op={0.6} />); }
    });
  }

  return <group position={[u.frame.x, u.y, u.frame.z]} rotation={[0, u.frame.rotY, 0]}>{items}</group>;
}
