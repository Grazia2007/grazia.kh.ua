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
// карго й мийка мають сенс лише на кухні; для решти - тільки світло
export const giftsFor = (type: FurnitureType): readonly (typeof GIFTS)[number][] => (type === 'Кухня' ? GIFTS : ['LED Підсвітка']);
export const LED_MODES = { vertical: 'По висоті (профілі по боках секцій)', shelves: 'Під полицями' } as const;
export type LedMode = keyof typeof LED_MODES;

// шафа: двері купе, дзеркала, наповнення
export const KUPE_STYLES = {
  ldsp: 'Усі з ЛДСП / МДФ',
  'mirror-center': 'Центральні - дзеркало, бокові - ЛДСП',
  'mirror-all': 'Усі дзеркальні',
  'wood-mirror-wood': 'Дзеркало по центру, ЛДСП 200 мм зверху і знизу',
  mosaic: 'Мозаїка (дзеркало + ЛДСП + лакомат)',
} as const;
export type KupeStyle = keyof typeof KUPE_STYLES;
export const MIRROR_KINDS = { clean: 'Чисте дзеркало', pattern: 'З візерунком (піскоструй)', photo: 'Фотодрук' } as const;
export type MirrorKind = keyof typeof MIRROR_KINDS;
// наповнення шафи: де комоди, скільки шухляд, що в центрі й по боках
export const DRESSER_AT = { none: 'Без комодів', center: 'По центру', sides: 'По боках', all: 'В усіх секціях' } as const;
export type DresserAt = keyof typeof DRESSER_AT;
export const DRAWER_COUNTS = [2, 3, 4] as const;
export const FILL_KINDS = { rod: 'Штанга', pantograph: 'Пантограф + штанга', shelves: 'Полиці' } as const;
export type FillKind = keyof typeof FILL_KINDS;
// секції шафи (внутрішні координати між перегородками, мм); розпашні двері - по 2 на секцію, вітрина - 1 скляні
export interface WSection { x: number; w: number; kind: 'center' | 'side' | 'bar'; ironing: boolean }
export function wardrobeSections(W: number, t: number, hinged: boolean, bar: boolean, ironing: boolean): WSection[] {
  const barW = hinged && bar ? 450 : 0;
  const inner = W - 2 * t - (barW ? barW + t : 0);
  const n = hinged ? Math.max(1, Math.round(inner / 900)) : Math.max(2, Math.round(inner / 800));
  const sw = (inner - (n - 1) * t) / n;
  const out: WSection[] = [];
  for (let k = 0; k < n; k++) {
    const isCenter = n <= 2 ? k === 0 : k > 0 && k < n - 1;
    out.push({ x: t + k * (sw + t), w: sw, kind: isCenter ? 'center' : 'side', ironing: ironing && k === n - 1 });
  }
  if (barW) out.push({ x: W - t - barW, w: barW, kind: 'bar', ironing: false });
  return out;
}

export interface WardrobeFill { dresserAt: DresserAt; drawers: number; center: FillKind; sides: FillKind }
export const SHEET_MAX = 2780; // лист 2800 мм мінус обробка кромок
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
  mezzDoors: 'lift' | 'hinged'; // антресоль: дверцята вгору або розпашні
  kupeStyle: KupeStyle;
  mirrorKind: MirrorKind;
  fill: WardrobeFill;
  ironing: boolean;
  glassBar: boolean;
  ledMode: LedMode;
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
  mezzanine: false,
  mezzDoors: 'hinged',
  kupeStyle: 'mirror-center',
  mirrorKind: 'clean',
  fill: { dresserAt: 'center', drawers: 3, center: 'pantograph', sides: 'shelves' },
  ironing: false,
  glassBar: false,
  ledMode: 'vertical',
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
    mezzDoors: r.mezzDoors === 'lift' ? 'lift' : 'hinged',
    kupeStyle: oneOf(Object.keys(KUPE_STYLES) as KupeStyle[], r.kupeStyle, d.kupeStyle),
    mirrorKind: oneOf(Object.keys(MIRROR_KINDS) as MirrorKind[], r.mirrorKind, d.mirrorKind),
    fill: (() => {
      const f = (r.fill && typeof r.fill === 'object' ? r.fill : {}) as Record<string, unknown>;
      return {
        dresserAt: oneOf(Object.keys(DRESSER_AT) as DresserAt[], f.dresserAt, d.fill.dresserAt),
        drawers: DRAWER_COUNTS.includes(Number(f.drawers) as 2) ? Number(f.drawers) : d.fill.drawers,
        center: oneOf(Object.keys(FILL_KINDS) as FillKind[], f.center, d.fill.center),
        sides: oneOf(Object.keys(FILL_KINDS) as FillKind[], f.sides, d.fill.sides),
      };
    })(),
    ironing: r.ironing === true,
    glassBar: r.glassBar === true,
    ledMode: oneOf(Object.keys(LED_MODES) as LedMode[], r.ledMode, d.ledMode),
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
    gift: oneOf(giftsFor(oneOf(FURNITURE_TYPES, r.type, d.type)), r.gift, '' as (typeof GIFTS)[number]),
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
  handleSide?: 'left' | 'right'; // для пеналів: ручка з боку робочої зони
  cargo?: boolean; // вузьке висувне карго
  wardrobe?: { style: KupeStyle; mirror: MirrorKind; fill: WardrobeFill; sections: WSection[]; mezz?: 'lift' | 'hinged' };
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
  // бічні стіни кімнати (для кутових і П-подібних): x і довжина в мм
  walls: { left?: number; right?: { x: number; len: number } };
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
  const walls: SceneModel['walls'] = {};
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
    // антресолі займають простір до стелі (мінус 20 мм монтажного зазору), а не додають висоту
    const tierH = Math.min(900, height - 20 - K.tallH);
    const tier = twoTier && tierH >= 250;
    if (twoTier && !tier) notes.push(`Антресолі не вміщуються: стеля ${height} мм`);

    const baseProto = { kind: 'base' as const, y: 0, h: K.baseH, d: K.baseD, plinth: K.plinth, zone: 'base' as const, handleAt: 'top' as const, drawersEvery: 3 };
    const upperProto = { kind: 'upper' as const, y: K.upperY, h: K.upperH, d: K.upperD, plinth: 0, zone: 'upper' as const, handleAt: 'bottom' as const };
    // антресолі глибокі, як нижні модулі й пенали; верхні лишаються вузькими (рівень голови)
    const topProto = { kind: 'top' as const, y: K.tallH, h: tierH, d: K.baseD, plinth: 0, zone: 'topTier' as const, handleAt: 'bottom' as const, doors: 1 };
    const addTall = (wall: Wall, s: number, mod: TallModule, handleSide: 'left' | 'right') => {
      // з антресолями пенал іде до стелі одним корпусом - верхній фасад суцільний
      units.push({ id: nid('tall'), kind: 'tall', frame: place(wall, s, 600), y: 0, w: 600, h: K.tallH + (tier ? tierH : 0), d: K.baseD, plinth: K.plinth, zone: 'base', doors: 1, drawers: 0, handleAt: 'side', tall: mod, handleSide });
    };
    const counter = (wall: Wall, s0: number, s1: number, d = counterD, z0 = 0, splashFrom = s0) => {
      if (s1 - s0 <= 0) return;
      slabs.push({ id: nid('top'), frame: place(wall, s0, s1 - s0), y: K.baseH, x0: 0, z0, w: s1 - s0, h: c.counterThickness, d });
      // фартух - на стіні від стільниці до верхніх шаф; скло 6 мм, решта 12 мм
      if (c.backsplash !== 'none' && wall.kind !== 'island') {
        const y = K.baseH + c.counterThickness;
        const th = GLASS.some((g) => g.code === c.backsplash) ? 6 : 12;
        slabs.push({ id: nid('bs'), kind: 'backsplash', frame: place(wall, splashFrom, s1 - splashFrom), y, x0: 0, z0: 0, w: s1 - splashFrom, h: K.upperY - y, d: th });
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
    // нижні основної стіни: варильна - над шухлядами біля пенала (або на ~2/3 ряду),
    // карго (подарунок) - вузький модуль між шухлядами й пеналом
    const tallR = !hasRight && rt > 0, tallL = !hasLeft && lt > 0;
    const cargoW = c.gift === 'Висувне Карго' && be - bs >= 900 ? 200 : 0;
    const cargoAtStart = cargoW > 0 && !tallR && tallL;
    let rs = bs, re = be;
    const pushCargo = (s: number) => units.push({ id: nid('cargo'), kind: 'base', frame: place(back, s, cargoW), y: 0, w: cargoW, h: K.baseH, d: K.baseD, plinth: K.plinth, zone: 'base', doors: 1, drawers: 0, handleAt: 'top', cargo: true });
    if (cargoW) { if (cargoAtStart) { pushCargo(rs); rs += cargoW; } else { re -= cargoW; pushCargo(re); } }
    const ws = splitWidths(re - rs);
    const hobIdx = ws.length === 0 ? -1
      : cargoW ? (cargoAtStart ? 0 : ws.length - 1)
      : tallR ? ws.length - 1
      : tallL ? 0
      : hasLeft || hasRight ? Math.floor(ws.length / 2)
      : Math.min(ws.length - 1, Math.round((ws.length - 1) * 0.68));
    let hob: { s: number; w: number } | null = null;
    let sx = rs;
    ws.forEach((w, i) => {
      const isHob = i === hobIdx;
      if (isHob) hob = { s: sx, w };
      units.push({ id: nid('base'), kind: 'base', frame: place(back, sx, w), y: 0, w, h: K.baseH, d: K.baseD, plinth: K.plinth, zone: 'base', doors: isHob ? 0 : doorsFor(w), drawers: isHob ? 3 : 0, handleAt: 'top' });
      sx += w;
    });
    counter(back, aStart, aEnd);
    fill(back, aStart, aEnd, upperProto);
    if (tier) fill(back, aStart, aEnd, topProto);
    if (!hasLeft && lt) addTall(back, 0, c.leftModule, 'right');
    if (!hasRight && rt) addTall(back, a - 600, c.rightModule, 'left');

    // бічні стіни
    const side = (wall: Wall, len: number, tallW: number, mod: TallModule, handleSide: 'left' | 'right') => {
      const end = len - tallW;
      fill(wall, cornerD, end, baseProto);
      // фартух бічної стіни - від самого кута, щоб не було щілини
      counter(wall, counterD, end, counterD, 0, 12);
      fill(wall, K.upperD, end, upperProto);
      if (tier) fill(wall, cornerD, end, topProto);
      if (tallW) addTall(wall, end, mod, handleSide);
    };
    if (hasLeft) { side(left, b, lt, c.leftModule, 'right'); walls.left = b; }
    if (hasRight) { side(right, rightLen, rt, c.rightModule, 'left'); walls.right = { x: a, len: rightLen }; }

    // мийка й варильна поверхня - лише як орієнтир на макеті
    const sinkWall = hasLeft ? left : hasRight ? right : back;
    const sinkRange: [number, number] = hasLeft ? [counterD, b - lt] : hasRight ? [counterD, rightLen - rt] : [aStart, aEnd];
    const h = hob as { s: number; w: number } | null;
    if (h && h.w >= 450) {
      const hw = Math.min(580, h.w - 20);
      fixtures.push({ id: nid('hob'), kind: 'hob', frame: place(back, h.s + (h.w - hw) / 2, hw), y: K.baseH + c.counterThickness, x0: 0, z0: 40, w: hw, h: 6, d: 510 });
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
    const sections = wardrobeSections(W, carcassThickness(c), !sliding, c.glassBar, c.ironing);
    // купе - за шириною; розпашні - по 2 двері на секцію (+1 скляні двері вітрини), тож ручки завжди парами
    const doors = sliding ? Math.max(2, Math.round(W / 900)) : sections.reduce((n, s) => n + (s.kind === 'bar' ? 1 : 2), 0);
    units.push({ id: nid('wardrobe'), kind: 'wardrobe', frame: place(back, 0, W), y: 0, w: W, h: H - mezz, d: D, plinth: 80, zone: 'base', doors, drawers: 0, handleAt: 'side', sliding,
      wardrobe: { style: c.kupeStyle, mirror: c.mirrorKind, fill: c.fill, sections } });
    // купе: напрямні й двері стоять усередині корпусу і забирають ~100 мм глибини
    if (sliding) notes.push(`Купе забирає ~100 мм глибини: корисна глибина ${D - 100} мм${D < 700 ? ' (для повноцінної штанги рекомендуємо глибину 700 мм)' : ''}`);
    const doorH = H - mezz - 80 - 2 * carcassThickness(c);
    if (doorH > SHEET_MAX) notes.push(`Висота дверей ${doorH} мм більша за лист (2800 мм): двері будуть поділені на ${SHEET_MAX} + ${doorH - SHEET_MAX} мм${sliding ? ' горизонтальним профілем' : ''}`);
    // антресоль - продовження шафи: ті самі секції, по одних дверцятах (вгору) на секцію
    if (mezz) units.push({ id: nid('mezz'), kind: 'wardrobe', frame: place(back, 0, W), y: H - mezz, w: W, h: mezz, d: D, plinth: 0, zone: 'base', doors: sections.length * (c.mezzDoors === 'hinged' ? 2 : 1), drawers: 0, handleAt: 'bottom',
      wardrobe: { style: c.kupeStyle, mirror: c.mirrorKind, fill: c.fill, sections, mezz: c.mezzDoors } });
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

  return { units, slabs, fixtures, bounds, notes, walls };
}
