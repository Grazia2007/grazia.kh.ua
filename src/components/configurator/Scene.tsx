'use client';
// 3D-сцена конструктора. Вантажиться лише через next/dynamic (ssr:false), тому three.js
// не потрапляє в початковий бандл головної.
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { buildScene, carcassThickness, K, type Config, type SceneModel } from './layout';
import { type Interior, facadeOf, carcassOf, countertopOf, handleOf, backsplashOf, type Material } from './materials';
import { Cabinet, SlabMesh, FixtureMesh, type Mats } from './modules';

export interface SceneApi {
  // знімки фронт і 3/4, JPEG 1600x1000
  capture: () => Promise<Blob[]>;
}

const BG = '#e9e6e1';

// ---- інтер'єр: процедурні текстури (без файлів і мереж. запитів), генеруються один раз на пресет ----

const WALL: Record<Interior, string> = { studio: '#efece7', parquet: '#ebe4d9', tile: '#e6e4e0', concrete: '#cdc7bd' };

// сід-рандом, щоб текстура не мінялась між рендерами
const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function floorTexture(kind: Interior): { tex: THREE.CanvasTexture; meters: number } | null {
  if (kind === 'studio') return null;
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!;
  const r = rnd(7);
  let meters = 2;
  if (kind === 'parquet') {
    // дубова дошка 200 мм, довжина 1-1.6 м, зсув рядів
    const rows = 10, rh = S / rows;
    for (let i = 0; i < rows; i++) {
      let x = -r() * S * 0.6;
      while (x < S) {
        const len = S * (0.5 + r() * 0.3);
        const l = 58 + r() * 12;
        g.fillStyle = `hsl(${30 + r() * 6}, ${38 + r() * 10}%, ${l}%)`;
        g.fillRect(x, i * rh, len, rh);
        g.strokeStyle = 'rgba(90,60,30,0.10)';
        g.lineWidth = 1;
        for (let k = 0; k < 7; k++) { const y = i * rh + r() * rh; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * 0.3, y + (r() - 0.5) * 8, x + len * 0.6, y + (r() - 0.5) * 8, x + len, y); g.stroke(); }
        g.fillStyle = 'rgba(60,40,20,0.45)';
        g.fillRect(x, i * rh, 2, rh);
        x += len;
      }
      g.fillStyle = 'rgba(60,40,20,0.35)';
      g.fillRect(0, i * rh, S, 2);
    }
  } else if (kind === 'tile') {
    // керамограніт 600x600, світлий, шов 2 мм
    meters = 1.2;
    const n = 2, ts = S / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = 86 + r() * 3;
      g.fillStyle = `hsl(40, 6%, ${l}%)`;
      g.fillRect(i * ts, j * ts, ts, ts);
      for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(120,115,105,${r() * 0.06})`; g.fillRect(i * ts + r() * ts, j * ts + r() * ts, 2 + r() * 6, 2 + r() * 6); }
    }
    g.fillStyle = '#b9b4ab';
    for (let i = 0; i <= n; i++) { g.fillRect(i * ts - 2, 0, 4, S); g.fillRect(0, i * ts - 2, S, 4); }
  } else {
    // мікроцемент: м'які плями
    meters = 3;
    g.fillStyle = '#a9a39a';
    g.fillRect(0, 0, S, S);
    for (let k = 0; k < 260; k++) {
      const x = r() * S, y = r() * S, rad = 40 + r() * 160;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const c = r() > 0.5 ? '255,250,240' : '60,55,50';
      gr.addColorStop(0, `rgba(${c},${0.05 + r() * 0.05})`);
      gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return { tex, meters };
}

function Room({ interior, cx, cz, span, walls }: { interior: Interior; cx: number; cz: number; span: number; walls: SceneModel['walls'] }) {
  const size = span * 4 + 6;
  const floor = useMemo(() => {
    const f = floorTexture(interior);
    if (f) f.tex.repeat.set(size / f.meters, size / f.meters);
    return f;
  }, [interior, size]);
  useEffect(() => () => floor?.tex.dispose(), [floor]);
  const roughness = interior === 'tile' ? 0.35 : interior === 'concrete' ? 0.7 : 0.85;
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial key={interior} color={floor ? '#ffffff' : '#dcd7cf'} map={floor?.tex ?? null} roughness={roughness} />
      </mesh>
      <mesh position={[cx, span * 1.5, -0.002]} receiveShadow>
        <planeGeometry args={[size, span * 3 + 4]} />
        <meshStandardMaterial color={WALL[interior]} roughness={0.95} />
      </mesh>
      {/* бічні стіни кутових/П-подібних кухонь; видно лише зсередини (FrontSide), тож не заважають крутити камеру */}
      {walls.left !== undefined && (
        <mesh position={[-0.002, span * 1.5, (walls.left / 1000 + 0.6) / 2]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[walls.left / 1000 + 0.6, span * 3 + 4]} />
          {/* легке самосвітіння: бічна стіна часто в тіні від ключового світла */}
          <meshStandardMaterial color={WALL[interior]} roughness={0.95} emissive={WALL[interior]} emissiveIntensity={0.35} />
        </mesh>
      )}
      {walls.right && (
        <mesh position={[walls.right.x / 1000 + 0.002, span * 1.5, (walls.right.len / 1000 + 0.6) / 2]} rotation-y={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[walls.right.len / 1000 + 0.6, span * 3 + 4]} />
          {/* легке самосвітіння: бічна стіна часто в тіні від ключового світла */}
          <meshStandardMaterial color={WALL[interior]} roughness={0.95} emissive={WALL[interior]} emissiveIntensity={0.35} />
        </mesh>
      )}
    </>
  );
}
const FOV = 38;
const SHOT_W = 1600;
const SHOT_H = 1000;

type View = 'front' | 'angle';
type Controls = { target: THREE.Vector3; update: () => void; addEventListener?: (t: 'start', f: () => void) => void; removeEventListener?: (t: 'start', f: () => void) => void };

// куди підлетіти камері: точка, на яку дивимось, і позиція камери (метри)
export interface Focus { key: string; target: [number, number, number]; pos: [number, number, number] }

// локальна точка модуля (мм) -> світові координати (м)
const toWorld = (f: { x: number; z: number; rotY: number }, lx: number, y: number, lz: number) => {
  const c = Math.cos(f.rotY), s = Math.sin(f.rotY);
  return new THREE.Vector3((f.x + lx * c + lz * s) / 1000, y / 1000, (f.z - lx * s + lz * c) / 1000);
};

// показ подарунка: карго - збоку спереду, мийка - зверху спереду, LED - фронтально на всю кухню
export function giftFocus(config: Config, model: SceneModel): Focus | null {
  if (config.type !== 'Кухня' || !config.gift) return null;
  if (config.gift === 'Висувне Карго') {
    const u = model.units.find((x) => x.cargo);
    if (!u) return null;
    const t = toWorld(u.frame, u.w / 2, u.plinth + (u.h - u.plinth) * 0.45, u.d + 400);
    const n = new THREE.Vector3(Math.sin(u.frame.rotY), 0, Math.cos(u.frame.rotY));
    const side = new THREE.Vector3(Math.cos(u.frame.rotY), 0, -Math.sin(u.frame.rotY));
    const p = t.clone().addScaledVector(n, 2.3).addScaledVector(side, -0.9).add(new THREE.Vector3(0, 0.9, 0));
    return { key: `cargo:${u.id}`, target: t.toArray() as Focus['target'], pos: p.toArray() as Focus['pos'] };
  }
  if (config.gift === "Кам'яна Мийка") {
    const f = model.fixtures.find((x) => x.kind === 'sink');
    if (!f) return null;
    const t = toWorld(f.frame, f.x0 + f.w / 2, f.y, f.z0 + f.d / 2);
    const n = new THREE.Vector3(Math.sin(f.frame.rotY), 0, Math.cos(f.frame.rotY));
    const p = t.clone().addScaledVector(n, 1.5).add(new THREE.Vector3(0, 1.1, 0));
    return { key: `sink:${f.id}`, target: t.toArray() as Focus['target'], pos: p.toArray() as Focus['pos'] };
  }
  const b = model.bounds;
  const t = new THREE.Vector3((b.minX + b.maxX) / 2000, 1.15, b.minZ / 1000 + 0.25);
  const dist = Math.max((b.maxX - b.minX) / 1000 * 1.15, 2.2) + 1;
  const p = t.clone().addScaledVector(new THREE.Vector3(0.15, 0.12, 1).normalize(), dist);
  return { key: 'led', target: t.toArray() as Focus['target'], pos: p.toArray() as Focus['pos'] };
}

const makeMat = (m: Material) =>
  m.clearcoat
    ? new THREE.MeshPhysicalMaterial({ color: m.color, roughness: m.roughness, metalness: m.metalness, clearcoat: m.clearcoat, clearcoatRoughness: 0.12 })
    : new THREE.MeshStandardMaterial({ color: m.color, roughness: m.roughness, metalness: m.metalness });

// ставить камеру так, щоб модель вмістилась у кадр із заданим співвідношенням сторін
function frameCamera(cam: THREE.PerspectiveCamera, ctrl: Controls | null, b: SceneModel['bounds'], view: View, aspect: number) {
  const s = 0.001;
  const w = (b.maxX - b.minX) * s, d = (b.maxZ - b.minZ) * s, h = b.maxY * s;
  const center = new THREE.Vector3((b.minX + b.maxX) / 2 * s, h * 0.45, (b.minZ + b.maxZ) / 2 * s);
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const dir = view === 'front' ? new THREE.Vector3(0, 0.12, 1) : new THREE.Vector3(0.75, 0.42, 1);
  dir.normalize();
  // ширина в кадрі для ракурсу 3/4 враховує і глибину
  const visW = view === 'front' ? w : w * 0.8 + d * 0.6;
  const dist = Math.max((h * 0.8) / tan, (visW * 0.7) / (tan * aspect)) + d / 2;
  cam.position.copy(center).addScaledVector(dir, Math.max(dist, 1.2));
  cam.near = 0.05;
  cam.far = 60;
  cam.updateProjectionMatrix();
  if (ctrl) { ctrl.target.copy(center); ctrl.update(); } else cam.lookAt(center);
}

function Rig({ model, apiRef, focus }: { model: SceneModel; apiRef: MutableRefObject<SceneApi | null>; focus: Focus | null }) {
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  const controls = useThree((s) => s.controls) as unknown as Controls | null;
  const b = model.bounds;
  const key = `${Math.round(b.minX)}:${Math.round(b.maxX)}:${Math.round(b.minZ)}:${Math.round(b.maxZ)}:${Math.round(b.maxY)}`;

  // перекадровуємо лише при зміні габаритів, щоб не збивати ракурс користувача при зміні кольорів
  useEffect(() => {
    const { camera, size } = get();
    goal.current = null;
    frameCamera(camera as THREE.PerspectiveCamera, controls, b, 'angle', size.width / Math.max(1, size.height));
    invalidate();
    // b входить у key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, controls, get, invalidate]);

  useEffect(() => {
    apiRef.current = {
      capture: async () => {
        const { gl, scene, camera, size } = get();
        const cam = camera as THREE.PerspectiveCamera;
        const ctrl = get().controls as unknown as Controls | null;
        const prev = { pos: cam.position.clone(), target: ctrl?.target.clone(), pr: gl.getPixelRatio(), aspect: cam.aspect };
        const out: Blob[] = [];
        try {
          gl.setPixelRatio(1);
          gl.setSize(SHOT_W, SHOT_H, false);
          cam.aspect = SHOT_W / SHOT_H;
          for (const view of ['front', 'angle'] as View[]) {
            frameCamera(cam, ctrl, b, view, cam.aspect);
            gl.render(scene, cam);
            const blob = await new Promise<Blob | null>((res) => gl.domElement.toBlob(res, 'image/jpeg', 0.85));
            if (blob) out.push(blob);
          }
        } finally {
          gl.setPixelRatio(prev.pr);
          gl.setSize(size.width, size.height, false);
          cam.aspect = prev.aspect;
          cam.position.copy(prev.pos);
          cam.updateProjectionMatrix();
          if (ctrl && prev.target) { ctrl.target.copy(prev.target); ctrl.update(); }
          invalidate();
        }
        return out;
      },
    };
    return () => { apiRef.current = null; };
  }, [apiRef, b, get, invalidate]);

  // плавний переліт до подарунка; будь-яке перетягування камери користувачем його скасовує
  const focusKey = focus?.key;
  useEffect(() => {
    if (!focus) return;
    goal.current = { pos: new THREE.Vector3(...focus.pos), target: new THREE.Vector3(...focus.target) };
    invalidate();
    // focus оновлюється разом із key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, invalidate]);
  useEffect(() => {
    if (!controls?.addEventListener) return;
    const cancel = () => { goal.current = null; };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener?.('start', cancel);
  }, [controls]);
  useFrame(({ camera }, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    const k = 1 - Math.exp(-dt * 3);
    camera.position.lerp(g.pos, k);
    controls.target.lerp(g.target, k);
    controls.update();
    if (camera.position.distanceTo(g.pos) < 0.005) goal.current = null;
    else invalidate();
  });

  return null;
}

function Furniture({ config, model }: { config: Config; model: SceneModel }) {
  const { base, upper, topTier, carcass, countertop, handle } = config.materials;
  const mats = useMemo<Mats>(() => ({
    base: makeMat(facadeOf(base)),
    upper: makeMat(facadeOf(upper)),
    topTier: makeMat(facadeOf(topTier)),
    carcass: makeMat(carcassOf(carcass)),
    countertop: makeMat(countertopOf(countertop)),
    handle: makeMat(handleOf(handle)),
    plinth: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.8 }),
    steel: new THREE.MeshStandardMaterial({ color: '#c8cacc', roughness: 0.25, metalness: 0.9 }),
    glass: new THREE.MeshStandardMaterial({ color: '#0d0d0f', roughness: 0.08, metalness: 0.3 }),
    mirror: new THREE.MeshStandardMaterial({ color: '#dfe6ea', roughness: 0.03, metalness: 1 }),
    ceramic: new THREE.MeshStandardMaterial({ color: '#fbfbfa', roughness: 0.15 }),
    granite: new THREE.MeshStandardMaterial({ color: '#2b2a28', roughness: 0.55 }),
  }), [base, upper, topTier, carcass, countertop, handle]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  const splashMat = useMemo(() => makeMat(backsplashOf(config.backsplash, countertop)), [config.backsplash, countertop]);
  useEffect(() => () => splashMat.dispose(), [splashMat]);

  const hType = handleOf(handle).type;
  // візуалізація подарунка: карго висувається, LED світить, мийка - гранітна
  const kitchen = config.type === 'Кухня';
  const cargoId = kitchen ? model.units.find((u) => u.cargo)?.id : undefined;
  const cargoOpen = config.gift === 'Висувне Карго';
  const led = kitchen && config.gift === 'LED Підсвітка';
  const granite = config.gift === "Кам'яна Мийка";
  const ledDrop = K.upperY - K.baseH - config.counterThickness;
  const t = carcassThickness(config);
  return (
    <group scale={0.001}>
      {model.units.map((u) => <Cabinet key={u.id} u={u} mats={mats} handle={hType} t={t} cargo={u.id === cargoId ? cargoOpen : undefined} led={led && u.kind === 'upper' ? ledDrop : undefined} />)}
      {model.slabs.map((s) => <SlabMesh key={s.id} s={s} m={s.kind === 'backsplash' ? splashMat : mats.countertop} />)}
      {model.fixtures.map((f) => <FixtureMesh key={f.id} f={f} mats={mats} granite={granite} />)}
    </group>
  );
}

export default function Scene({ config, apiRef, interior = 'studio' }: { config: Config; apiRef: MutableRefObject<SceneApi | null>; interior?: Interior }) {
  const model = useMemo(() => buildScene(config), [config]);
  const focus = useMemo(() => giftFocus(config, model), [config, model]);
  // на телефонах: менша щільність пікселів і без тіней
  const mobile = useMemo(() => window.matchMedia('(max-width: 768px), (pointer: coarse)').matches, []);
  const b = model.bounds;
  const cx = (b.minX + b.maxX) / 2000, cz = (b.minZ + b.maxZ) / 2000;
  const span = Math.max(b.maxX - b.minX, b.maxZ - b.minZ, b.maxY) / 1000;

  return (
    <Canvas
      frameloop="demand"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      shadows={!mobile}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ fov: FOV, position: [4, 2.5, 5] }}
      aria-label="3D-модель меблів"
    >
      <color attach="background" args={[BG]} />
      <hemisphereLight args={['#ffffff', '#d6cfc4', 0.7]} />
      <directionalLight
        position={[cx - span * 0.6, span * 1.4 + 2, cz + span + 2]}
        intensity={1.6}
        castShadow={!mobile}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-camera-near={0.5}
        shadow-camera-far={span * 4 + 10}
      >
        <object3D attach="target" position={[cx, 0, cz]} />
      </directionalLight>
      {/* студійні софтбокси замість HDR-файлу: рендеряться один раз, без мережевих запитів */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-5, 2, 3]} rotation-y={Math.PI / 2.5} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[5, 2, 3]} rotation-y={-Math.PI / 2.5} scale={[4, 3, 1]} />
      </Environment>

      <Furniture config={config} model={model} />

      {/* підлога і задня стіна приймають тіні */}
      <Room interior={interior} cx={cx} cz={cz} span={span} walls={model.walls} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        minAzimuthAngle={-Math.PI / 2.2}
        maxAzimuthAngle={Math.PI / 2.2}
        minDistance={1}
        maxDistance={span * 4 + 4}
      />
      <Rig model={model} apiRef={apiRef} focus={focus} />
    </Canvas>
  );
}
