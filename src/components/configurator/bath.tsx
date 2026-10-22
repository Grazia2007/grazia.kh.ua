'use client';
// Ванна: стільниця, тумба (підвісна / на ніжках), раковина 4 типів, ніша під пральну машину,
// пенал, дзеркало (прямокутне / кругле / арка / дзеркальна шафа) з підсвіткою. Розміри в мм.
import { useEffect, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { K, type Unit } from './layout';
import type { HandleType } from './materials';
import { Box, Facade, Slide, glowTexture, type Mats, type Rect } from './modules';
import { GlassDoor, Movable } from './wardrobe';

const LED = '#fff1d0';

// рифлений фасад: вертикальні ламелі 20 мм з кроком 40 поверх фасаду
function Ribs({ x, y, w, h, z, m }: { x: number; y: number; w: number; h: number; z: number; m: THREE.Material }) {
  const out: ReactNode[] = [];
  for (let rx = x + 20; rx + 20 <= x + w - 10; rx += 40) out.push(<Box key={rx} x={rx} y={y + 6} z={z} w={20} h={h - 12} d={5} m={m} />);
  return <>{out}</>;
}

// дзеркало потрібної форми; glow - підсвітка по контуру
function Mirror({ shape, x, y, w, h, z, mats, glow }: { shape: 'rect' | 'round' | 'arch' | 'crescent'; x: number; y: number; w: number; h: number; z: number; mats: Mats; glow: boolean }) {
  const cx = x + w / 2;
  const halo = (key: string, node: ReactNode) => glow && <group key={key}>{node}</group>;
  const basic = <meshBasicMaterial color={LED} toneMapped={false} />;
  if (shape === 'crescent') {
    // півмісяць: напівовал, пряма сторона ліворуч, дуга з підсвіткою праворуч
    return (
      <>
        {halo('h', <mesh position={[x + w * 0.12 - 10, y + h / 2, z - 2]} scale={[w * 0.8 + 30, h / 2 + 30, 1]}><circleGeometry args={[1, 64, -Math.PI / 2, Math.PI]} />{basic}</mesh>)}
        <mesh position={[x + w * 0.12, y + h / 2, z]} scale={[w * 0.8, h / 2, 1]} material={mats.mirror}><circleGeometry args={[1, 64, -Math.PI / 2, Math.PI]} /></mesh>
      </>
    );
  }
  if (shape === 'round') {
    const r = w / 2, cy = y + r;
    return (
      <>
        {halo('h', <mesh position={[cx, cy, z - 2]}><circleGeometry args={[r + 25, 64]} />{basic}</mesh>)}
        <mesh position={[cx, cy, z]} material={mats.mirror}><circleGeometry args={[r, 64]} /></mesh>
      </>
    );
  }
  if (shape === 'arch') {
    const r = w / 2, body = h - r;
    return (
      <>
        {halo('h1', <mesh position={[cx, y + body / 2, z - 2]}><planeGeometry args={[w + 50, body]} />{basic}</mesh>)}
        {halo('h2', <mesh position={[cx, y + body, z - 2]}><circleGeometry args={[r + 25, 48, 0, Math.PI]} />{basic}</mesh>)}
        <mesh position={[cx, y + body / 2, z]} material={mats.mirror}><planeGeometry args={[w, body]} /></mesh>
        <mesh position={[cx, y + body, z]} material={mats.mirror}><circleGeometry args={[r, 48, 0, Math.PI]} /></mesh>
      </>
    );
  }
  return (
    <>
      {halo('h', <mesh position={[cx, y + h / 2, z - 2]}><planeGeometry args={[w + 50, h + 50]} />{basic}</mesh>)}
      <mesh position={[cx, y + h / 2, z]} material={mats.mirror}><planeGeometry args={[w, h]} /></mesh>
    </>
  );
}

export function BathUnit({ u, mats, handle, t, open, hide, doorsKey, led }: { u: Unit; mats: Mats; handle: HandleType; t: number; open: boolean; hide: boolean; doorsKey: string; led: boolean }) {
  const b = u.bath!;
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => { invalidate(); }, [hide, open, led, invalidate]);
  const hnd: HandleType = handle === 'long' ? 'rail' : handle === 'gola' ? 'profile' : handle;
  const items: ReactNode[] = [];
  const W = u.w, D = u.d;
  const fz = D + K.facadeOffset;
  const cx0 = b.cabX, cw = b.cabW, cy = b.cabY, top = b.topY;
  const fluted = b.style === 'fluted';

  // фасади: шухляда виїжджає, дверцята обертаються
  const front = (key: string, r: Rect, kind: 'drawer' | 'door') => {
    if (hide) return;
    const face = (
      <>
        <Facade r={r} z={fz} m={mats.base} mats={mats} handle={hnd} />
        {fluted && <Ribs x={r.x + 2} y={r.y} w={r.w - 4} h={r.h} z={fz + K.facadeT} m={mats.base} />}
      </>
    );
    if (kind === 'drawer') {
      items.push(
        <Slide key={`${key}-${doorsKey}`} open={open} by={Math.min(360, D - 80)}>
          {face}
          <Box x={r.x + t + 10} y={r.y + 25} z={40} w={r.w - 2 * t - 20} h={Math.min(150, r.h - 50)} d={D - 80} m={mats.carcass} />
        </Slide>,
      );
    } else {
      const right = r.profile === 'right';
      items.push(
        <Movable key={`${key}-${doorsKey}`} kind="hinge" pivotX={right ? r.x : r.x + r.w} pivotZ={fz} amount={(right ? -1 : 1) * 1.6} open={open}>{face}</Movable>,
      );
    }
  };

  // ---------- тумба ----------
  const ch = top - cy; // висота корпусу до стільниці
  items.push(<Box key="cl" x={cx0} y={cy} z={0} w={t} h={ch} d={D} m={mats.carcass} />);
  items.push(<Box key="cr" x={cx0 + cw - t} y={cy} z={0} w={t} h={ch} d={D} m={mats.carcass} />);
  items.push(<Box key="cb" x={cx0 + t} y={cy} z={0} w={cw - 2 * t} h={t} d={D} m={mats.carcass} />);
  items.push(<Box key="ck" x={cx0 + t} y={cy} z={0} w={cw - 2 * t} h={ch} d={4} m={mats.carcass} />);
  if (b.mount === 'legs') {
    for (const lx of [cx0 + 40, cx0 + cw - 70]) for (const lz of [50, D - 80]) items.push(<Box key={`lg${lx}-${lz}`} x={lx} y={0} z={lz} w={30} h={cy} d={30} m={mats.steel} />);
  }
  if (led && b.mount === 'wall') {
    items.push(
      <mesh key="ug" position={[cx0 + cw / 2, cy / 2, 3]}>
        <planeGeometry args={[cw, cy]} />
        <meshBasicMaterial map={glowTexture()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.7} />
      </mesh>,
    );
    items.push(<mesh key="us" position={[cx0 + cw / 2, cy - 3, D - 40]} scale={[cw - 40, 6, 10]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color={LED} toneMapped={false} /></mesh>);
  }
  // фасади: 1 колонка до 700 мм, ширше - дві
  const cols = cw > 900 && b.fronts !== 'drawers' ? 2 : 1;
  const fy = cy + t, fh = top - fy;
  if (b.fronts === 'drawers') {
    front('d1', { x: cx0, y: fy + fh * 0.45, w: cw, h: fh * 0.55, profile: 'top', rail: { orient: 'h' } }, 'drawer');
    front('d2', { x: cx0, y: fy, w: cw, h: fh * 0.45, profile: 'top', rail: { orient: 'h' } }, 'drawer');
  } else {
    const dh = b.fronts === 'mixed' ? fh * 0.68 : fh;
    if (b.fronts === 'mixed') front('dt', { x: cx0, y: fy + dh, w: cw, h: fh - dh, profile: 'top', rail: { orient: 'h' } }, 'drawer');
    const n = cw > 500 ? 2 : 1;
    for (let q = 0; q < n * (cols > 1 ? 1 : 1); q++) {
      const side: 'left' | 'right' = n === 1 || q === 0 ? 'right' : 'left';
      front(`dr${q}`, { x: cx0 + (cw / n) * q, y: fy, w: cw / n, h: dh, profile: side, rail: { orient: 'v', side, at: 'top' } }, 'door');
    }
  }

  // ---------- пральна машина в ніші ----------
  if (b.washer !== 'none') {
    const wx = b.washer === 'left' ? 20 : W - 620;
    items.push(<Box key="wm" x={wx} y={0} z={10} w={600} h={850} d={540} m={mats.ceramic} />);
    items.push(<mesh key="wd" position={[wx + 300, 430, 552]} rotation-x={Math.PI / 2}><cylinderGeometry args={[190, 190, 6, 48]} /><meshStandardMaterial color="#1c1c1e" roughness={0.1} /></mesh>);
    items.push(<Box key="wp" x={wx + 20} y={740} z={551} w={560} h={90} d={4} m={mats.lacomat} />);
  }

  // ---------- стільниця і раковина ----------
  const T = b.topT, sx = b.sinkX, sw = b.sinkW;
  const topM = b.sink === 'integrated' ? mats.ceramic : mats.countertop;
  items.push(<Box key="tp" x={0} y={top} z={0} w={W} h={T} d={D + 20} m={topM} />);
  const sy = top + T;
  const sd = Math.min(400, D - 80), sz = (D + 20 - sd) / 2 + 10;
  if (b.sink === 'overmount') {
    items.push(<Box key="so" x={sx} y={sy} z={sz - 10} w={sw} h={110} d={sd + 20} m={mats.ceramic} />);
    items.push(<Box key="si" x={sx + 40} y={sy + 30} z={sz + 30} w={sw - 80} h={81} d={sd - 60} m={mats.lacomat} />);
  } else if (b.sink === 'undermount') {
    items.push(<Box key="su" x={sx} y={sy - 1} z={sz} w={sw} h={2} d={sd} m={mats.lacomat} />);
  } else if (b.sink === 'vessel') {
    items.push(<mesh key="sv" position={[sx + sw / 2, sy + 70, sz + sd / 2]} material={mats.ceramic}><cylinderGeometry args={[sw / 2, 90, 140, 48]} /></mesh>);
  } else {
    // лита: прямокутна ванна з похилим дном і щілиною зливу
    items.push(<Box key="sl" x={sx - 40} y={sy - 1} z={sz} w={sw + 80} h={2} d={sd} m={mats.lacomat} />);
    items.push(<Box key="sg" x={sx} y={sy} z={sz + sd - 40} w={sw} h={2} d={8} m={mats.steel} />);
  }
  // змішувач
  const fx = sx + sw / 2 - 15;
  items.push(<Box key="mx" x={fx} y={sy} z={30} w={30} h={b.sink === 'vessel' ? 300 : 180} d={30} m={mats.steel} />);
  items.push(<Box key="mxs" x={fx} y={sy + (b.sink === 'vessel' ? 270 : 150)} z={30} w={30} h={25} d={130} m={mats.steel} />);

  // ---------- пенал ----------
  if (b.penal !== 'none') {
    const px = b.penalX, pw = 350, pd = 330;
    const py = b.mount === 'wall' ? cy : 100, ph = 1850 - py;
    const hs: 'left' | 'right' = b.penal === 'left' ? 'right' : 'left'; // ручка - до тумби
    items.push(<Box key="pl" x={px} y={py} z={0} w={t} h={ph} d={pd} m={mats.carcass} />);
    items.push(<Box key="pr" x={px + pw - t} y={py} z={0} w={t} h={ph} d={pd} m={mats.carcass} />);
    items.push(<Box key="pt" x={px} y={py + ph - t} z={0} w={pw} h={t} d={pd} m={mats.carcass} />);
    items.push(<Box key="pb" x={px + t} y={py} z={0} w={pw - 2 * t} h={t} d={pd} m={mats.carcass} />);
    items.push(<Box key="pk" x={px + t} y={py} z={0} w={pw - 2 * t} h={ph} d={4} m={mats.carcass} />);
    for (let y = py + 350; y < py + ph - 100; y += 350) items.push(<Box key={`ps${y}`} x={px + t} y={y} z={4} w={pw - 2 * t} h={t} d={pd - 30} m={mats.carcass} />);
    if (b.mount === 'legs') for (const lx of [px + 30, px + pw - 60]) items.push(<Box key={`pleg${lx}`} x={lx} y={0} z={pd - 70} w={30} h={py} d={30} m={mats.steel} />);
    if (!hide) {
      const r: Rect = { x: px, y: py + t, w: pw, h: ph - 2 * t, profile: hs, rail: { orient: 'v', side: hs, at: 'mid' } };
      const pz = pd + K.facadeOffset;
      items.push(
        <Movable key={`pd-${doorsKey}`} kind="hinge" pivotX={hs === 'right' ? px : px + pw} pivotZ={pz} amount={(hs === 'right' ? -1 : 1) * 1.6} open={open}>
          <Facade r={r} z={pz} m={mats.base} mats={mats} handle={hnd} />
          {fluted && <Ribs x={px + 2} y={py + t} w={pw - 4} h={ph - 2 * t} z={pz + K.facadeT} m={mats.base} />}
        </Movable>,
      );
    }
  }

  // ---------- дзеркало ----------
  const sides = b.mirror !== 'none' && b.mirror !== 'cabinet' && b.mirror !== 'crescent' ? b.mirrorSides : 'none';
  const SW = 150, SD = 140;
  // з бічними шафками дзеркало квадратне по центру, а шафки 150 мм по боках
  const mw = sides !== 'none' ? Math.min(b.mirrorW, 700) : b.mirrorW;
  const mx = b.mirrorX + (b.mirrorW - mw) / 2;
  const my = top + T + 250;
  const glow = b.mirrorLed || led;
  if (sides !== 'none') {
    const sh = b.mirror === 'round' ? mw : 750;
    for (const [q, sx0] of [[0, mx - SW - 20], [1, mx + mw + 20]] as const) {
      items.push(<Box key={`ms${q}l`} x={sx0} y={my} z={0} w={t} h={sh} d={SD} m={mats.carcass} />);
      items.push(<Box key={`ms${q}r`} x={sx0 + SW - t} y={my} z={0} w={t} h={sh} d={SD} m={mats.carcass} />);
      items.push(<Box key={`ms${q}b`} x={sx0} y={my} z={0} w={SW} h={t} d={SD} m={mats.carcass} />);
      items.push(<Box key={`ms${q}t`} x={sx0} y={my + sh - t} z={0} w={SW} h={t} d={SD} m={mats.carcass} />);
      items.push(<Box key={`ms${q}k`} x={sx0} y={my} z={0} w={SW} h={sh} d={4} m={mats.carcass} />);
      for (let y = my + sh / 3; y < my + sh - 50; y += sh / 3) items.push(<Box key={`ms${q}s${Math.round(y)}`} x={sx0 + t} y={y} z={4} w={SW - 2 * t} h={t} d={SD - 20} m={sides === 'glass' ? mats.glassClear : mats.carcass} />);
      if (sides !== 'open' && !hide) {
        const side: 'left' | 'right' = q === 0 ? 'right' : 'left'; // ручка до дзеркала
        const r: Rect = { x: sx0, y: my, w: SW, h: sh, profile: side, rail: { orient: 'v', side, at: 'mid' } };
        items.push(
          <Movable key={`msd${q}-${doorsKey}`} kind="hinge" pivotX={side === 'right' ? sx0 : sx0 + SW} pivotZ={SD + 2} amount={(side === 'right' ? -1 : 1) * 1.6} open={open}>
            {sides === 'glass' ? <GlassDoor x={sx0} y={my} w={SW} h={sh} z={SD + 2} mats={mats} /> : <Facade r={r} z={SD + 2} m={mats.base} mats={mats} handle={hnd === 'rail' ? 'none' : hnd} />}
          </Movable>,
        );
      }
    }
  }
  if (b.mirror === 'cabinet' && mw) {
    const mh = 700, md = 140;
    items.push(<Box key="mcb" x={mx} y={my} z={0} w={mw} h={mh} d={md} m={mats.carcass} />);
    if (glow) items.push(<mesh key="mcl" position={[mx + mw / 2, my - 3, md - 30]} scale={[mw - 40, 6, 10]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color={LED} toneMapped={false} /></mesh>);
    const n = mw >= 700 ? 2 : 1;
    for (let q = 0; q < n && !hide; q++) {
      const side: 'left' | 'right' = n === 1 || q === 0 ? 'right' : 'left';
      const dx = mx + (mw / n) * q, dw = mw / n;
      items.push(
        <Movable key={`mc${q}-${doorsKey}`} kind="hinge" pivotX={side === 'right' ? dx : dx + dw} pivotZ={md + 2} amount={(side === 'right' ? -1 : 1) * 1.6} open={open}>
          <Box x={dx + 2} y={my + 2} z={md + 2} w={dw - 4} h={mh - 4} d={6} m={mats.mirror} />
        </Movable>,
      );
    }
  } else if (mw) {
    const shape = b.mirror as 'rect' | 'round' | 'arch' | 'crescent';
    const mh = shape === 'round' ? mw : shape === 'arch' || shape === 'crescent' ? Math.min(1300, 2050 - my) : 750;
    items.push(<Mirror key="mr" shape={shape} x={mx} y={my} w={mw} h={mh} z={20} mats={mats} glow={glow} />);
  }

  return <group position={[u.frame.x, u.y, u.frame.z]} rotation={[0, u.frame.rotY, 0]}>{items}</group>;
}
