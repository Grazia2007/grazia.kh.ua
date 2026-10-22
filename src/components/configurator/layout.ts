// Параметрична розкладка меблів у міліметрах. Чисті функції без three.js:
// використовуються і в 3D-сцені, і на сервері для специфікації ліда.
import { FACADE_ALL, CARCASS_ALL, COUNTERTOPS, HANDLES, BACKSPLASH_ALL, GLASS } from './materials';

export const FURNITURE_TYPES = ['Кухня', 'Шафа-купе / Гардеробна', 'Меблі у вітальню', 'Меблі для ванної'] as const;
export type FurnitureType = (typeof FURNITURE_TYPES)[number];

export const CLASSES = ['Економ', 'Стандарт', 'Преміум'] as const;
export type FurnitureClass = (typeof CLASSES)[number];

export const KITCHEN_LAYOUTS = ['Пряма', 'Кутова (Ліворуч)', 'Кутова (Праворуч)', 'П-подібна', 'З островом'] as const;
export type KitchenLayout = (typeof KITCHEN_LAYOUTS)[number];

export const UPPER_TIERS = ['Одноярусні', 'Двоярусні (з антресолями)'] as const;
export type UpperTier = (typeof UPPER_TIERS)[number];

export const TALL_MODULES = {
  none: 'Відсутній',
  fridge_built: 'Вбудований холодильник',
  fridge_open: 'Ніша під окремий холодильник',
  oven: 'Пенал: духовка + мікрохвильовка/кавоварка',
  storage: 'Пенал для зберігання (полиці)',
} as const;
export type TallModule = keyof typeof TALL_MODULES;

export const WARDROBE_DOORS = ['Купе', 'Розпашні'] as const;
export type WardrobeDoors = (typeof WARDROBE_DOORS)[number];

export const GIFTS = ['Висувне Карго', 'LED Підсвітка', "Кам'яна Мийка"] as const;
export const CALL_TIMES = ['Найближчим часом', '10:00 - 12:00', '14:00 - 16:00', 'Після 18:00'] as const;
export const COUNTER_THICKNESS = [28, 38] as const;
export const COUNTER_OVERHANG = [20, 30, 50] as const;

export type FacadeZone = 'base' | 'upper' | 'topTier';

export interface Config {
  type: FurnitureType;
  furnitureClass: FurnitureClass;
  // a - основна стіна / ширина виробу, b - ліва (або єдина бічна) стіна, c - права стіна П-подібної
  dims: { a: number; b: number; c: number; height: number; depth: number };
  layout: KitchenLayout;
  upperTier: UpperTier;
  leftModule: TallModule;
  rightModule: TallModule;
  wardrobeDoors: WardrobeDoors;
  mezzanine: boolean;
  sidePenals: boolean;
  bathPenal: boolean;
  materials: { base: string; upper: string; topTier: string; carcass: string; countertop: string; handle: string };
  counterThickness: number;
  backsplash: string; // код матеріалу, 'same' (як стільниця) або 'none'
  counterOverhang: number;
  gift: string;
  phone: string;
  time: string;
}

export interface DimField { key: keyof Config['dims']; label: string; min: number; max: number }

// які розміри питаємо для кожного типу і в яких межах (мм)
export function dimFields(c: Pick<Config, 'type' | 'layout'>): DimField[] {
  if (c.type === 'Кухня') {
    const f: DimField[] = [{ key: 'a', label: 'Основна стіна', min: 1200, max: 6000 }];
    if (c.layout === 'Кутова (Ліворуч)' || c.layout === 'П-подібна') f.push({ key: 'b', label: 'Ліва стіна', min: 1200, max: 5000 });
    if (c.layout === 'Кутова (Праворуч)') f.push({ key: 'b', label: 'Права стіна', min: 1200, max: 5000 });
    if (c.layout === 'П-подібна') f.push({ key: 'c', label: 'Права стіна', min: 1200, max: 5000 });
    f.push({ key: 'height', label: 'Висота стелі', min: 2200, max: 3500 });
    return f;
  }
  if (c.type === 'Шафа-купе / Гардеробна') return [
    { key: 'a', label: 'Ширина', min: 800, max: 5000 },
    { key: 'height', label: 'Висота', min: 2000, max: 3000 },
    { key: 'depth', label: 'Глибина', min: 400, max: 700 },
  ];
  if (c.type === 'Меблі у вітальню') return [
    { key: 'a', label: 'Ширина стіни', min: 1500, max: 5000 },
    { key: 'height', label: 'Висота стелі', min: 2200, max: 3500 },
  ];
  return [{ key: 'a', label: 'Ширина тумби', min: 500, max: 1400 }];
}

export const DEFAULT_DIMS: Record<FurnitureType, Config['dims']> = {
  'Кухня': { a: 3000, b: 2000, c: 2000, height: 2700, depth: 600 },
  'Шафа-купе / Гардеробна': { a: 2400, b: 0, c: 0, height: 2600, depth: 600 },
  'Меблі у вітальню': { a: 3000, b: 0, c: 0, height: 2700, depth: 420 },
  'Меблі для ванної': { a: 800, b: 0, c: 0, height: 2600, depth: 460 },
};

export const DEFAULT_CONFIG: Config = {
  type: 'Кухня',
  furnitureClass: 'Стандарт',
  dims: DEFAULT_DIMS['Кухня'],
  layout: 'Пряма',
  upperTier: 'Одноярусні',
  leftModule: 'none',
  rightModule: 'none',
  wardrobeDoors: 'Купе',
  mezzanine: true,
  sidePenals: true,
  bathPenal: false,
  materials: { base: 'GR-F05', upper: 'GR-F01', topTier: 'GR-V01', carcass: 'GR-C01', countertop: 'GR-T01', handle: 'GR-H04' },
  counterThickness: 38,
  counterOverhang: 30,
  backsplash: 'same',
  gift: '',
  phone: '',
  time: CALL_TIMES[0],
};

const oneOf = <T extends string>(list: readonly T[], v: unknown, d: T): T => (list.includes(v as T) ? (v as T) : d);
const clamp = (v: unknown, min: number, max: number, d: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(max, Math.max(min, n)) : d;
};
const code = (list: { code: string }[], v: unknown, d: string) => (list.some((m) => m.code === v) ? String(v) : d);

// приводить будь-які вхідні дані (з форми чи з мережі) до валідного Config
export function normalizeConfig(raw: unknown): Config {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_CONFIG;
  const type = oneOf(FURNITURE_TYPES, r.type, d.type);
  const layout = oneOf(KITCHEN_LAYOUTS, r.layout, d.layout);
  const rd = (r.dims && typeof r.dims === 'object' ? r.dims : {}) as Record<string, unknown>;
  const base = DEFAULT_DIMS[type];
  const dims = { ...base };
  for (const f of dimFields({ type, layout })) dims[f.key] = clamp(rd[f.key], f.min, f.max, base[f.key]);
  const m = (r.materials && typeof r.materials === 'object' ? r.materials : {}) as Record<string, unknown>;
  return {
    type,
    furnitureClass: oneOf(CLASSES, r.furnitureClass, d.furnitureClass),
    dims,
    layout,
    upperTier: oneOf(UPPER_TIERS, r.upperTier, d.upperTier),
    leftModule: oneOf(Object.keys(TALL_MODULES) as TallModule[], r.leftModule, 'none'),
    rightModule: oneOf(Object.keys(TALL_MODULES) as TallModule[], r.rightModule, 'none'),
    wardrobeDoors: oneOf(WARDROBE_DOORS, r.wardrobeDoors, d.wardrobeDoors),
    mezzanine: r.mezzanine === true,
    sidePenals: r.sidePenals === true,
    bathPenal: r.bathPenal === true,
    materials: {
      base: code(FACADE_ALL, m.base, d.materials.base),
      upper: code(FACADE_ALL, m.upper, d.materials.upper),
      topTier: code(FACADE_ALL, m.topTier, d.materials.topTier),
      carcass: code(CARCASS_ALL, m.carcass, d.materials.carcass),
      countertop: code(COUNTERTOPS, m.countertop, d.materials.countertop),
      handle: code(HANDLES, m.handle, d.materials.handle),
    },
    counterThickness: COUNTER_THICKNESS.includes(Number(r.counterThickness) as 28) ? Number(r.counterThickness) : d.counterThickness,
    backsplash: r.backsplash === 'none' || r.backsplash === 'same' ? r.backsplash : code(BACKSPLASH_ALL, r.backsplash, 'same'),
    counterOverhang: COUNTER_OVERHANG.includes(Number(r.counterOverhang) as 20) ? Number(r.counterOverhang) : d.counterOverhang,
    gift: oneOf(GIFTS, r.gift, '' as (typeof GIFTS)[number]),
    phone: String(r.phone ?? '').replace(/[^\d+()\-\s]/g, '').slice(0, 25),
    time: oneOf(CALL_TIMES, r.time, d.time),
  };
}

// ---------- геометрія ----------

// стандартні розміри (мм)
export const K = {
  plinth: 100,
  baseH: 820, // з цоколем, без стільниці
  baseD: 560, // корпус
  upperY: 1420,
  upperH: 700,
  upperD: 320,
  tallH: 2120,
  facadeT: 18,
  gap: 3, // зазор між фасадами
  facadeOffset: 2, // фасад від корпусу
  tierMax: 360,
};

export const carcassThickness = (c: Pick<Config, 'furnitureClass'>) => (c.furnitureClass === 'Економ' ? 16 : 18);

// систма координат: X - уздовж основної стіни, Z - від стіни в кімнату, Y - вгору.
// Frame - точка "ліво-низ-зад" модуля і поворот навколо Y.
export interface Frame { x: number; z: number; rotY: number }

export type UnitKind = 'base' | 'corner' | 'upper' | 'top' | 'tall' | 'wardrobe' | 'hanging' | 'vanity' | 'mirror' | 'penal';

export interface Unit {
  id: string;
  kind: UnitKind;
  frame: Frame;
  y: number;
  w: number;
  h: number;
  d: number;
  plinth: number;
  zone: FacadeZone;
  doors: number;
  drawers: number;
  handleAt: 'top' | 'bottom' | 'side';
  blind?: { side: 'start' | 'end'; w: number };
  tall?: TallModule;
  sliding?: boolean;
  mirror?: boolean;
}

export interface Slab { id: string; kind?: 'backsplash'; frame: Frame; y: number; x0: number; z0: number; w: number; h: number; d: number }
export interface Fixture { id: string; kind: 'hob' | 'sink' | 'tv' | 'basin'; frame: Frame; y: number; x0: number; z0: number; w: number; h: number; d: number }

export interface SceneModel {
  units: Unit[];
  slabs: Slab[];
  fixtures: Fixture[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number; maxY: number };
  notes: string[];
}

type Wall = { kind: 'back' } | { kind: 'left' } | { kind: 'right'; x: number } | { kind: 'island'; x0: number; len: number; z: number };

const place = (wall: Wall, s: number, w: number): Frame => {
  switch (wall.kind) {
    case 'back': return { x: s, z: 0, rotY: 0 };
    case 'left': return { x: 0, z: s + w, rotY: Math.PI / 2 };
    case 'right': return { x: wall.x, z: s, rotY: -Math.PI / 2 };
    case 'island': return { x: wall.x0 + wall.len - s, z: wall.z, rotY: Math.PI };
  }
};

// ділить довжину на модулі близько до target, у межах min..max
export function splitWidths(len: number, target = 600, min = 300, max = 900): number[] {
  if (len < min) return len >= 150 ? [Math.round(len)] : [];
  let n = Math.max(1, Math.round(len / target));
  while (len / n > max) n++;
  while (n > 1 && len / n < min) n--;
  const w = Math.floor(len / n);
  const out = Array.from({ length: n }, () => w);
  out[n - 1] += Math.round(len - w * n);
  return out;
}

const doorsFor = (w: number) => (w > 500 ? 2 : 1);

export function buildScene(c: Config): SceneModel {
  const units: Unit[] = [];
  const slabs: Slab[] = [];
  const fixtures: Fixture[] = [];
  const notes: string[] = [];
  let id = 0;
  const nid = (p: string) => `${p}${++id}`;

  const fill = (wall: Wall, s0: number, s1: number, proto: Omit<Unit, 'id' | 'frame' | 'w' | 'doors' | 'drawers'> & { drawersEvery?: number; target?: number; doors?: number }) => {
    const { drawersEvery, target, doors: fixedDoors, ...rest } = proto;
    let s = s0;
    splitWidths(s1 - s0, target ?? 600).forEach((w, i) => {
      const drawers = drawersEvery && i % drawersEvery === 1 ? 3 : 0;
      units.push({ ...rest, id: nid(proto.kind), frame: place(wall, s, w), w, doors: drawers ? 0 : fixedDoors ?? doorsFor(w), drawers });
      s += w;
    });
  };

  if (c.type === 'Кухня') {
    const { a, b, height } = c.dims;
    const L = c.layout;
    const hasLeft = L === 'Кутова (Ліворуч)' || L === 'П-подібна';
    const hasRight = L === 'Кутова (Праворуч)' || L === 'П-подібна';
    const rightLen = L === 'П-подібна' ? c.dims.c : b;
    const back: Wall = { kind: 'back' };
    const left: Wall = { kind: 'left' };
    const right: Wall = { kind: 'right', x: a };
    const lt = c.leftModule !== 'none' ? 600 : 0;
    const rt = c.rightModule !== 'none' ? 600 : 0;
    const counterD = K.baseD + K.facadeOffset + K.facadeT + c.counterOverhang;
    const cornerD = K.baseD + K.facadeOffset + K.facadeT; // ширина "сліпої" зони кута
    const twoTier = c.upperTier === 'Двоярусні (з антресолями)';
    const tierH = Math.min(K.tierMax, height - K.tallH - 20);
    const tier = twoTier && tierH >= 200;
    if (twoTier && !tier) notes.push(`Антресолі не вміщуються: стеля ${height} мм`);

    const baseProto = { kind: 'base' as const, y: 0, h: K.baseH, d: K.baseD, plinth: K.plinth, zone: 'base' as const, handleAt: 'top' as const, drawersEvery: 3 };
    const upperProto = { kind: 'upper' as const, y: K.upperY, h: K.upperH, d: K.upperD, plinth: 0, zone: 'upper' as const, handleAt: 'bottom' as const };
    // антресолі глибокі, як нижні модулі й пенали; верхні лишаються вузькими (рівень голови)
    const topProto = { kind: 'top' as const, y: K.tallH, h: tierH, d: K.baseD, plinth: 0, zone: 'topTier' as const, handleAt: 'bottom' as const, doors: 1 };
    const addTall = (wall: Wall, s: number, mod: TallModule) => {
      units.push({ id: nid('tall'), kind: 'tall', frame: place(wall, s, 600), y: 0, w: 600, h: K.tallH, d: K.baseD, plinth: K.plinth, zone: 'base', doors: 1, drawers: 0, handleAt: 'side', tall: mod });
      if (tier) units.push({ id: nid('top'), kind: 'top', frame: place(wall, s, 600), y: K.tallH, w: 600, h: tierH, d: K.baseD, plinth: 0, zone: 'topTier', doors: 1, drawers: 0, handleAt: 'bottom' });
    };
    const counter = (wall: Wall, s0: number, s1: number, d = counterD, z0 = 0) => {
      if (s1 - s0 <= 0) return;
      slabs.push({ id: nid('top'), frame: place(wall, s0, s1 - s0), y: K.baseH, x0: 0, z0, w: s1 - s0, h: c.counterThickness, d });
      // фартух - на стіні від стільниці до верхніх шаф; скло 6 мм, решта 12 мм
      if (c.backsplash !== 'none' && wall.kind !== 'island') {
        const y = K.baseH + c.counterThickness;
        const th = GLASS.some((g) => g.code === c.backsplash) ? 6 : 12;
        slabs.push({ id: nid('bs'), kind: 'backsplash', frame: place(wall, s0, s1 - s0), y, x0: 0, z0: 0, w: s1 - s0, h: K.upperY - y, d: th });
      }
    };
    const corner = (wall: Wall, s: number, side: 'start' | 'end') =>
      units.push({ id: nid('corner'), kind: 'corner', frame: place(wall, s, 1000), y: 0, w: 1000, h: K.baseH, d: K.baseD, plinth: K.plinth, zone: 'base', doors: 1, drawers: 0, handleAt: 'top', blind: { side, w: cornerD } });

    // основна стіна
    const aStart = hasLeft ? 0 : lt;
    const aEnd = a - (hasRight ? 0 : rt);
    let bs = aStart, be = aEnd;
    if (hasLeft) { corner(back, 0, 'start'); bs = 1000; }
    if (hasRight) { corner(back, a - 1000, 'end'); be = a - 1000; }
    fill(back, bs, be, baseProto);
    counter(back, aStart, aEnd);
    fill(back, aStart, aEnd, upperProto);
    if (tier) fill(back, aStart, aEnd, topProto);
    if (!hasLeft && lt) addTall(back, 0, c.leftModule);
    if (!hasRight && rt) addTall(back, a - 600, c.rightModule);

    // бічні стіни
    const side = (wall: Wall, len: number, tallW: number, mod: TallModule) => {
      const end = len - tallW;
      fill(wall, cornerD, end, baseProto);
      counter(wall, counterD, end);
      fill(wall, K.upperD, end, upperProto);
      if (tier) fill(wall, cornerD, end, topProto);
      if (tallW) addTall(wall, end, mod);
    };
    if (hasLeft) side(left, b, lt, c.leftModule);
    if (hasRight) side(right, rightLen, rt, c.rightModule);

    // мийка й варильна поверхня - лише як орієнтир на макеті
    const sinkWall = hasLeft ? left : hasRight ? right : back;
    const sinkRange: [number, number] = hasLeft ? [counterD, b - lt] : hasRight ? [counterD, rightLen - rt] : [aStart, aEnd];
    const hobRange: [number, number] = [bs, be];
    if (hobRange[1] - hobRange[0] >= 600) {
      const s = hasLeft || hasRight ? (hobRange[0] + hobRange[1]) / 2 : hobRange[0] + (hobRange[1] - hobRange[0]) * 0.68;
      fixtures.push({ id: nid('hob'), kind: 'hob', frame: place(back, s - 290, 580), y: K.baseH + c.counterThickness, x0: 0, z0: 40, w: 580, h: 6, d: 510 });
    }
    const sinkLen = sinkRange[1] - sinkRange[0];
    if (sinkLen >= (sinkWall === back ? 1600 : 700)) {
      const s = sinkWall === back ? sinkRange[0] + sinkLen * 0.25 : (sinkRange[0] + sinkRange[1]) / 2;
      fixtures.push({ id: nid('sink'), kind: 'sink', frame: place(sinkWall, s - 250, 500), y: K.baseH + c.counterThickness, x0: 0, z0: 60, w: 500, h: 4, d: 420 });
    }

    if (L === 'З островом') {
      const len = Math.min(2400, Math.max(1200, Math.round(a * 0.6 / 100) * 100));
      const island: Wall = { kind: 'island', x0: (a - len) / 2, len, z: counterD + 1000 + K.baseD };
      fill(island, 0, len, { ...baseProto, drawersEvery: 2 });
      counter(island, 0, len, counterD + 300, -300);
    }
  } else if (c.type === 'Шафа-купе / Гардеробна') {
    const { a: W, height: H, depth: D } = c.dims;
    const mezz = c.mezzanine && H >= 2300 ? 450 : 0;
    if (c.mezzanine && !mezz) notes.push(`Антресоль не додано: висота ${H} мм`);
    const back: Wall = { kind: 'back' };
    const sliding = c.wardrobeDoors === 'Купе';
    const doors = sliding ? Math.max(2, Math.round(W / 900)) : Math.max(2, Math.round(W / 450));
    units.push({ id: nid('wardrobe'), kind: 'wardrobe', frame: place(back, 0, W), y: 0, w: W, h: H - mezz, d: D, plinth: 80, zone: 'base', doors, drawers: 0, handleAt: 'side', sliding });
    if (mezz) units.push({ id: nid('top'), kind: 'top', frame: place(back, 0, W), y: H - mezz, w: W, h: mezz, d: D, plinth: 0, zone: 'base', doors: Math.max(2, Math.round(W / 600)), drawers: 0, handleAt: 'bottom' });
  } else if (c.type === 'Меблі у вітальню') {
    const { a: W, height: H } = c.dims;
    const back: Wall = { kind: 'back' };
    const side = c.sidePenals ? 450 : 0;
    const tallH = Math.min(H - 100, 2200);
    if (side) {
      for (const s of [0, W - side]) units.push({ id: nid('penal'), kind: 'penal', frame: place(back, s, side), y: 0, w: side, h: tallH, d: 400, plinth: 80, zone: 'base', doors: 1, drawers: 0, handleAt: 'side' });
    }
    fill(back, side, W - side, { kind: 'hanging', y: 250, h: 450, d: 420, plinth: 0, zone: 'base', handleAt: 'top', target: 800, doors: 1 });
    fixtures.push({ id: nid('tv'), kind: 'tv', frame: place(back, W / 2 - 725, 1450), y: 1000, x0: 0, z0: 30, w: 1450, h: 830, d: 40 });
  } else {
    const W = c.dims.a;
    const back: Wall = { kind: 'back' };
    const vD = c.dims.depth;
    units.push({ id: nid('vanity'), kind: 'vanity', frame: place(back, 0, W), y: 420, w: W, h: 430, d: vD, plinth: 0, zone: 'base', doors: 0, drawers: 2, handleAt: 'top' });
    slabs.push({ id: nid('top'), frame: place(back, 0, W), y: 850, x0: 0, z0: 0, w: W, h: Math.min(c.counterThickness, 28), d: vD + K.facadeOffset + K.facadeT + 10 });
    const bw = Math.min(500, W - 120);
    fixtures.push({ id: nid('basin'), kind: 'basin', frame: place(back, (W - bw) / 2, bw), y: 850 + Math.min(c.counterThickness, 28), x0: 0, z0: 50, w: bw, h: 120, d: 380 });
    units.push({ id: nid('mirror'), kind: 'mirror', frame: place(back, 0, W), y: 1200, w: W, h: 700, d: 140, plinth: 0, zone: 'upper', doors: W >= 700 ? 2 : 1, drawers: 0, handleAt: 'bottom', mirror: true });
    if (c.bathPenal) units.push({ id: nid('penal'), kind: 'penal', frame: place(back, W + 50, 350), y: 250, w: 350, h: 1650, d: 300, plinth: 0, zone: 'base', doors: 1, drawers: 0, handleAt: 'side' });
  }

  // габарити сцени - для камери
  const bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, maxY: 0 };
  const grow = (f: Frame, x0: number, z0: number, w: number, d: number, top: number) => {
    const cos = Math.cos(f.rotY), sin = Math.sin(f.rotY);
    for (const [lx, lz] of [[x0, z0], [x0 + w, z0], [x0, z0 + d], [x0 + w, z0 + d]]) {
      const X = f.x + lx * cos + lz * sin;
      const Z = f.z - lx * sin + lz * cos;
      bounds.minX = Math.min(bounds.minX, X); bounds.maxX = Math.max(bounds.maxX, X);
      bounds.minZ = Math.min(bounds.minZ, Z); bounds.maxZ = Math.max(bounds.maxZ, Z);
    }
    bounds.maxY = Math.max(bounds.maxY, top);
  };
  units.forEach((u) => grow(u.frame, 0, 0, u.w, u.d + K.facadeOffset + K.facadeT, u.y + u.h));
  slabs.forEach((s) => grow(s.frame, s.x0, s.z0, s.w, s.d, s.y + s.h));
  fixtures.forEach((f) => grow(f.frame, f.x0, f.z0, f.w, f.d, f.y + f.h));
  if (!Number.isFinite(bounds.minX)) Object.assign(bounds, { minX: 0, maxX: 1000, minZ: 0, maxZ: 600, maxY: 1000 });

  return { units, slabs, fixtures, bounds, notes };
}
