'use client';
// Параметричні модулі: корпус з ДСП заданої товщини, цоколь, фасади із зазором, ручки.
// Усі розміри в мм у локальній системі модуля (X - ширина, Y - висота, Z - до фасаду).
import { memo, useEffect, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { K, type Unit, type Slab, type Fixture, type LedMode } from './layout';
import { WardrobeUnit, Movable, GlassDoor } from './wardrobe';
import { LivingUnit } from './living';
import { BathUnit } from './bath';
import type { HandleType } from './materials';

export type MatKey = 'carcass' | 'base' | 'upper' | 'topTier' | 'countertop' | 'handle' | 'plinth' | 'steel' | 'glass' | 'mirror' | 'ceramic' | 'granite' | 'mirrorPattern' | 'photo' | 'lacomat' | 'glassClear';
export type Mats = Record<MatKey, THREE.Material>;

// одна геометрія на всю сцену, розмір задає scale
const BOX = new THREE.BoxGeometry(1, 1, 1);

export function Box({ x, y, z, w, h, d, m }: { x: number; y: number; z: number; w: number; h: number; d: number; m: THREE.Material }) {
  if (w <= 0 || h <= 0 || d <= 0) return null;
  return <mesh geometry={BOX} material={m} position={[x + w / 2, y + h / 2, z + d / 2]} scale={[w, h, d]} castShadow receiveShadow />;
}

export type Edge = 'top' | 'bottom' | 'left' | 'right';
type Rail = { orient: 'h' } | { orient: 'v'; side: 'left' | 'right'; at: 'top' | 'bottom' | 'mid' };
export interface Rect { x: number; y: number; w: number; h: number; profile: Edge; rail: Rail }

const PROFILE = 25; // ширина профіль-ручки
const RAIL = 160; // довжина рейлінга на дверях

// фасад + ручка обраного типу
export function Facade({ r, z, m, mats, handle }: { r: Rect; z: number; m: THREE.Material; mats: Mats; handle: HandleType }) {
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
  if (handle === 'long' && r.rail.orient === 'v' && h >= 700) {
    // довга ручка-профіль ~1200 мм, центр на висоті ~1050 мм від низу модуля
    const len = Math.min(1200, h - 200);
    const hx = r.rail.side === 'left' ? x + 45 : x + w - 59;
    const hy = Math.min(Math.max(y + 100, 1050 - len / 2), y + h - len - 100);
    extra = <Box x={hx} y={hy} z={z + t} w={14} h={len} d={22} m={mats.handle} />;
  }
  if (handle === 'rail' || (handle === 'long' && !(r.rail.orient === 'v' && h >= 700))) {
    const hz = z + t + 18;
    if (r.rail.orient === 'h') {
      const len = Math.max(60, Math.min(w - 120, 320));
      // на антресолях і верхніх (відкриваються вгору) - ручка знизу, а не під стелею
      extra = <Box x={x + (w - len) / 2} y={r.profile === 'bottom' ? y + 38 : y + h - 50} z={hz} w={len} h={12} d={12} m={mats.handle} />;
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

// плавно висуває вміст (карго) - кадри рендеряться лише під час руху
export function Slide({ open, by, children }: { open: boolean; by: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => { invalidate(); }, [open, invalidate]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = open ? by : 0;
    const diff = target - g.position.z;
    if (Math.abs(diff) < 0.5) { g.position.z = target; return; }
    g.position.z += diff * Math.min(1, dt * 5);
    invalidate();
  });
  return <group ref={ref}>{children}</group>;
}

// м'яке світіння LED-стрічки: градієнт згенерований один раз
let glowTex: THREE.CanvasTexture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const cv = document.createElement('canvas');
  cv.width = 4; cv.height = 256;
  const g = cv.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, 'rgba(255,226,170,0.85)');
  gr.addColorStop(0.35, 'rgba(255,220,160,0.35)');
  gr.addColorStop(1, 'rgba(255,215,150,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 4, 256);
  glowTex = new THREE.CanvasTexture(cv);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

function Led({ w, d, drop }: { w: number; d: number; drop: number }) {
  const tex = glowTexture();
  return (
    <>
      {/* стрічка під шафою */}
      <mesh position={[w / 2, -3, d - 50]} scale={[w - 40, 6, 14]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#fff1d0" toneMapped={false} />
      </mesh>
      {/* світло на фартусі */}
      <mesh position={[w / 2, -drop / 2, 14]}>
        <planeGeometry args={[w, drop]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* і на стільниці */}
      {/* глибина 300 мм: світіння сусідніх рядів у куті не перетинається */}
      <mesh position={[w / 2, -drop + 1, 14 + 150]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[w, 300]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.6} />
      </mesh>
    </>
  );
}

function CabinetImpl({ u, mats, handle, t, cargo, led, open, ledMode, hideDoors, doorsKey, openSlot, dryer }: { u: Unit; mats: Mats; handle: HandleType; t: number; cargo?: boolean; led?: number; dryer?: boolean; open?: boolean; ledMode?: LedMode | null; hideDoors?: boolean; doorsKey?: string; openSlot?: number }) {
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => { invalidate(); }, [open, hideDoors, invalidate]);
  if (u.kind === 'bath') return <BathUnit u={u} mats={mats} handle={handle} t={t} open={!!open} hide={!!hideDoors} doorsKey={doorsKey ?? ''} led={!!ledMode} />;
  if (u.kind === 'living') return <LivingUnit u={u} mats={mats} handle={handle} t={t} open={!!open} hide={!!hideDoors} doorsKey={doorsKey ?? ''} led={!!ledMode} />;
  if (u.kind === 'wardrobe') return <WardrobeUnit u={u} mats={mats} handle={handle} t={t} open={!!open} ledMode={ledMode ?? null} hide={!!hideDoors} doorsKey={doorsKey ?? ''} openSlot={openSlot ?? 0} />;
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

  if (u.kind === 'tall' && u.tall) {
    const hs = u.handleSide ?? 'left';
    const v = (y: number, h: number): Rect => ({ x: 0, y, w: u.w, h, profile: hs, rail: { orient: 'v', side: hs, at: 'mid' } });
    const flip = (y: number, h: number, e: Edge): Rect => ({ x: 0, y, w: u.w, h, profile: e, rail: { orient: 'h' } });
    if (u.tall === 'fridge_built') rects.push(v(y0, 1770), { ...v(y0 + 1770, u.h - y0 - 1770), rail: { orient: 'v', side: hs, at: 'bottom' } });
    if (u.tall === 'storage') rects.push(v(y0, hc * 0.55), { ...v(y0 + hc * 0.55, hc * 0.45), rail: { orient: 'v', side: hs, at: 'bottom' } });
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
    else if (u.kind === 'top' && u.hinged) rects.push(...doorRow(0, u.w, y0, hc, u.doors, 'bottom', 'bottom'));
    else if (u.kind === 'top' || u.kind === 'hanging') {
      const e: Edge = u.kind === 'top' ? 'bottom' : 'top';
      for (const r of doorRow(0, u.w, y0, hc, u.doors, e, 'mid')) rects.push({ ...r, rail: { orient: 'h' } });
    } else rects.push(...doorRow(0, u.w, y0, hc, u.doors, 'side', 'mid'));
  }

  const doorMat = u.mirror ? mats.mirror : fm;
  // верхні шафи з Gola не мають каналу - відкриваються push-to-open
  const h2: HandleType = handle === 'gola' && (u.kind === 'upper' || u.kind === 'top' || u.kind === 'mirror') ? 'none' : handle;
  // фасади рухаються: шухляди виїжджають, дверцята на петлях, відкидні - вгору або вниз
  const fronts = rects.map((r, i) => {
    const face = u.glass
      ? <><GlassDoor x={r.x} y={r.y} w={r.w} h={r.h} z={fz} mats={mats} />{h2 === 'rail' && <Box x={r.x + (r.w - 160) / 2} y={r.y + 30} z={fz + 38} w={160} h={12} d={12} m={mats.handle} />}</>
      : <Facade r={r} z={fz} m={doorMat} mats={mats} handle={u.mirror ? 'none' : h2} />;
    if (hideDoors) return null;
    if (cargo !== undefined) return <group key={`f${i}`}>{face}</group>;
    const k = `f${i}-${doorsKey ?? ''}`;
    if (r.rail.orient === 'h' && u.drawers) {
      return (
        <Slide key={k} open={!!open} by={Math.min(420, u.d - 60)}>
          {face}
          <Box x={r.x + t + 10} y={r.y + 25} z={40} w={r.w - 2 * t - 20} h={Math.min(140, r.h - 50)} d={u.d - 60} m={mats.carcass} />
        </Slide>
      );
    }
    if (r.rail.orient === 'h' || (u.kind === 'top' && !u.hinged)) {
      const up = r.profile === 'bottom' || u.kind === 'top';
      return <Movable key={k} kind="lift" pivotY={up ? r.y + r.h : r.y} pivotZ={fz} amount={up ? -1.2 : 1.35} open={!!open}>{face}</Movable>;
    }
    const side = r.rail.orient === 'v' ? r.rail.side : 'right';
    return <Movable key={k} kind="hinge" pivotX={side === 'right' ? r.x : r.x + r.w} pivotZ={fz} amount={(side === 'right' ? -1 : 1) * 1.6} open={!!open}>{face}</Movable>;
  });
  if (cargo !== undefined) {
    // карго: фасад виїжджає разом із кошиками (3 рівні + стійки)
    const bw = u.w - 2 * t - 30, bd = u.d - 80, bx = t + 15, bz = 40;
    // два рівні кошиків з високими бортами, як у типового карго 150-200 мм
    const baskets = [0.1, 0.56].flatMap((k, i) => {
      const by = y0 + hc * k;
      return [
        <Box key={`cb${i}`} x={bx} y={by} z={bz} w={bw} h={6} d={bd} m={mats.steel} />,
        <Box key={`cl${i}`} x={bx} y={by} z={bz} w={4} h={120} d={bd} m={mats.steel} />,
        <Box key={`cr${i}`} x={bx + bw - 4} y={by} z={bz} w={4} h={120} d={bd} m={mats.steel} />,
        <Box key={`cf${i}`} x={bx} y={by} z={bz + bd - 6} w={bw} h={120} d={6} m={mats.steel} />,
        <Box key={`ck${i}`} x={bx} y={by} z={bz} w={bw} h={120} d={6} m={mats.steel} />,
      ];
    });
    items.push(
      <Slide key="cargo" open={cargo} by={Math.min(450, u.d - 60)}>
        {fronts}
        {baskets}
        <Box x={bx} y={y0 + t} z={bz + bd / 2 - 8} w={bw} h={hc - 2 * t - 40} d={16} m={mats.steel} />
      </Slide>,
    );
  } else items.push(...fronts);
  if (led) items.push(<Led key="led" w={u.w} d={u.d} drop={led} />);
  // скляні антресолі: скляна полиця і власне світло всередині
  if (u.glass) {
    items.push(<Box key="gsh" x={t} y={y0 + hc / 2} z={8} w={u.w - 2 * t} h={8} d={u.d - 30} m={mats.glassClear} />);
    items.push(<mesh key="gls" position={[u.w / 2, u.h - t - 4, u.d - 50]} scale={[u.w - 2 * t - 40, 6, 10]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#fff1d0" toneMapped={false} /></mesh>);
    items.push(<mesh key="glg" position={[u.w / 2, y0 + hc / 2, 6]}><planeGeometry args={[u.w - 2 * t, hc - 2 * t]} /><meshBasicMaterial map={glowTexture()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.7} /></mesh>);
  }
  // сушка Inoxa: решітка для тарілок і піддон над нею, нержавійка
  if (u.dryer && dryer) {
    const iw = u.w - 2 * t - 20, ix = t + 10;
    const rackY = y0 + hc * 0.45, trayY = y0 + 40;
    items.push(<Box key="dt" x={ix} y={trayY} z={30} w={iw} h={15} d={u.d - 60} m={mats.mirror} />);
    for (let x = ix + 10; x < ix + iw - 10; x += 22) items.push(<Box key={`dr${x}`} x={x} y={trayY + 15} z={40} w={4} h={4} d={u.d - 80} m={mats.mirror} />);
    for (const z of [50, u.d - 70]) items.push(<Box key={`dl${z}`} x={ix} y={rackY} z={z} w={iw} h={8} d={8} m={mats.mirror} />);
    for (let x = ix + 20; x < ix + iw - 20; x += 28) {
      items.push(<Box key={`dw${x}`} x={x} y={rackY} z={60} w={4} h={170} d={4} m={mats.mirror} />);
      items.push(<Box key={`dv${x}`} x={x} y={rackY} z={u.d - 80} w={4} h={110} d={4} m={mats.mirror} />);
    }
  }
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

export function FixtureMesh({ f, mats, granite }: { f: Fixture; mats: Mats; granite?: boolean }) {
  const m = f.kind === 'hob' || f.kind === 'tv' ? mats.glass : f.kind === 'basin' ? mats.ceramic : mats.steel;
  if (f.kind === 'sink' && granite) {
    // гранітна мийка: борт + чаша (темніша, трохи нижче борту)
    return (
      <group position={[f.frame.x, f.y, f.frame.z]} rotation={[0, f.frame.rotY, 0]}>
        <Box x={f.x0} y={0} z={f.z0} w={f.w} h={10} d={f.d} m={mats.granite} />
        <Box x={f.x0 + 40} y={0} z={f.z0 + 40} w={f.w - 80} h={11} d={f.d - 80} m={mats.glass} />
        <Box x={f.x0 + f.w / 2 - 20} y={0} z={f.z0 - 40} w={40} h={260} d={40} m={mats.granite} />
      </group>
    );
  }
  return (
    <group position={[f.frame.x, f.y, f.frame.z]} rotation={[0, f.frame.rotY, 0]}>
      <Box x={f.x0} y={0} z={f.z0} w={f.w} h={f.h} d={f.d} m={m} />
      {/* змішувач */}
      {f.kind === 'sink' && <Box x={f.x0 + f.w / 2 - 20} y={0} z={f.z0 - 40} w={40} h={260} d={40} m={mats.steel} />}
    </group>
  );
}
