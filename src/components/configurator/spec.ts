// Текст специфікації ліда. Той самий текст бачить клієнт (підсумок) і менеджер (Telegram, orders).
import { buildScene, carcassThickness, dimFields, TALL_MODULES, LIV_COLUMNS, LIV_FRONTS, SEC_KINDS, SINKS, MIRRORS, KUPE_STYLES, MIRROR_KINDS, DRESSER_AT, FILL_KINDS, LED_MODES, type Config, type Unit } from './layout';
import { facadeOf, carcassOf, countertopOf, handleOf, backsplashOf, materialLabel } from './materials';

const KIND_LABEL: Record<Unit['kind'], string> = {
  base: 'Нижні модулі',
  corner: 'Кутовий модуль',
  upper: 'Верхні модулі',
  top: 'Антресолі',
  tall: 'Пенали',
  wardrobe: 'Шафа',
  hanging: 'Підвісні тумби',
  vanity: 'Тумба',
  mirror: 'Дзеркальна шафа',
  penal: 'Пенали',
  living: 'ТВ-зона (тумба + колони)',
  bath: 'Комплект для ванної',
};

export const hasCountertop = (c: Config) => c.type === 'Кухня' || c.type === 'Меблі для ванної';
export const hasHandles = (c: Config) => !(c.type === 'Шафа-купе / Гардеробна' && c.wardrobeDoors === 'Купе');

export function facadeZones(c: Config): { id: 'base' | 'upper' | 'topTier'; label: string }[] {
  if (c.type === 'Кухня') {
    const z: { id: 'base' | 'upper' | 'topTier'; label: string }[] = [{ id: 'base', label: 'Нижні фасади' }, { id: 'upper', label: 'Верхні фасади' }];
    if (c.upperTier === 'Двоярусні (з антресолями)') z.push({ id: 'topTier', label: 'Антресолі' });
    return z;
  }
  if (c.type === 'Меблі у вітальню') return [{ id: 'base', label: 'Фасади' }, { id: 'upper', label: 'Стільниця, полиці, панель' }];
  if (c.type === 'Меблі для ванної') return [{ id: 'base', label: 'Фасади' }];
  return [{ id: 'base', label: 'Фасади' }];
}

export function buildSpec(c: Config): string[] {
  const model = buildScene(c);
  const lines: string[] = [];
  lines.push(`Виріб: ${c.type}`);
  lines.push(`Клас: ${c.furnitureClass}`);
  lines.push(`Розміри: ${dimFields(c).map((f) => `${f.label.toLowerCase()} ${c.dims[f.key]} мм`).join(', ')}`);
  if (c.type === 'Кухня') {
    lines.push(`Планування: ${c.layout}`);
    lines.push(`Верхні секції: ${c.upperTier}${c.upperTier === 'Двоярусні (з антресолями)' ? `; антресолі ${c.topDoors === 'hinged' ? 'розпашні' : 'підйомні'}${c.topGlass ? ', скло з підсвіткою' : ''}` : ''}`);
    lines.push(`Лівий пенал: ${TALL_MODULES[c.leftModule]}`);
    lines.push(`Правий пенал: ${TALL_MODULES[c.rightModule]}`);
  }
  if (c.type === 'Шафа-купе / Гардеробна') {
    lines.push(`Двері: ${c.wardrobeDoors}, ${model.units.find((u) => u.kind === 'wardrobe' && !u.wardrobe?.mezz)?.doors ?? 0} шт.${c.wardrobeDoors === 'Розпашні' && c.glassBar ? ' (крайні - скляна вітрина з підсвіткою)' : ''}`);
    lines.push(`Антресоль: ${model.units.some((u) => u.wardrobe?.mezz) ? (c.mezzDoors === 'hinged' ? 'так, розпашні дверцята' : 'так, дверцята вгору') : 'ні'}`);
    if (c.wardrobeDoors === 'Купе') {
      lines.push(`Двері купе: ${KUPE_STYLES[c.kupeStyle]}`);
      if (c.kupeStyle !== 'ldsp') lines.push(`Дзеркало: ${MIRROR_KINDS[c.mirrorKind]}`);
    }
    const f = c.fill;
    lines.push(`Наповнення: комоди - ${DRESSER_AT[f.dresserAt].toLowerCase()}${f.dresserAt !== 'none' ? ` (${f.drawers} шухляди)` : ''}; центр - ${FILL_KINDS[f.center].toLowerCase()}; боки - ${FILL_KINDS[f.sides].toLowerCase()}${c.ironing ? '; місце під прасувальну дошку' : ''}`);
  }
  if (c.type === 'Меблі у вітальню') {
    const v = c.living;
    const u = model.units.find((x) => x.living)?.living;
    lines.push(`Тумба: ${v.mount === 'wall' ? 'підвісна' : 'на підлозі'}, закриті - ${LIV_FRONTS[v.fronts].toLowerCase()}; центр - ${SEC_KINDS[v.centerKind].toLowerCase()}, боки - ${SEC_KINDS[v.sideKind].toLowerCase()}${u ? ` (${u.modules.length} секції: ${u.modules.join(', ')} мм)` : ''}`);
    lines.push(`Ліва колона: ${LIV_COLUMNS[v.left]}; права колона: ${LIV_COLUMNS[v.right]}${v.left !== 'none' || v.right !== 'none' ? (v.colMount === 'wall' ? ' (підвісні)' : ' (на підлозі)') : ''}${v.topRow && (v.left !== 'none' || v.right !== 'none') ? '; ряд шаф над ТВ' : ''}`);
    if (v.shelves) lines.push(`Настінні полиці: ${v.shelves} шт., ${v.shelvesAt === 'tv' ? 'над ТВ' : v.shelvesAt === 'left' ? 'ліворуч від ТВ' : 'праворуч від ТВ'}`);
    if (v.panel) lines.push(`Панель за ТВ: ${v.panelKind === 'slats' ? 'рейки' : 'гладка'}`);
    lines.push(`ТВ ${v.tvSize}" ${v.tv === 'wall' ? 'на стіні' : 'на тумбі'}`);
  }
  if (c.type === 'Меблі для ванної') {
    const b = model.units.find((x) => x.bath)?.bath;
    const v = c.bath;
    if (b) {
      const side = (s: string) => (s === 'left' ? 'ліворуч' : 'праворуч');
      lines.push(`Тумба: ${v.mount === 'wall' ? 'підвісна' : 'на ніжках'}, ${Math.round(b.cabW)} мм, ${v.fronts === 'drawers' ? '2 шухляди' : v.fronts === 'doors' ? 'дверцята' : 'шухляда + дверцята'}, фасади ${v.style === 'fluted' ? 'рифлені' : 'гладкі'}`);
      lines.push(`Раковина: ${SINKS[v.sink]}, ${v.sinkAt === 'center' ? 'по центру' : side(v.sinkAt)}`);
      if (b.washer !== 'none') lines.push(`Ніша під пральну машину ${side(b.washer)} (600 мм)`);
      if (v.penal !== 'none') lines.push(`Пенал ${side(v.penal)} 350 мм`);
      lines.push(`Дзеркало: ${MIRRORS[v.mirror]}${v.mirror !== 'none' && v.mirrorLed ? ' з підсвіткою (сенсорна кнопка)' : ''}${['rect', 'round', 'arch'].includes(v.mirror) && v.mirrorSides !== 'none' ? `; по боках шафки 150 мм - ${v.mirrorSides === 'open' ? 'відкриті' : v.mirrorSides === 'glass' ? 'за склом' : 'з дверцятами'}` : ''}`);
    }
  }

  // модулі з ширинами
  const groups = new Map<string, number[]>();
  for (const u of model.units) { const k = u.cargo ? 'Карго (висувне)' : u.wardrobe?.mezz ? 'Антресоль' : KIND_LABEL[u.kind]; groups.set(k, [...(groups.get(k) ?? []), u.w]); }
  lines.push('Модулі:');
  for (const [label, ws] of groups) lines.push(`• ${label}: ${ws.length} шт. (${ws.map((w) => Math.round(w)).join(', ')} мм)`);

  lines.push('Матеріали:');
  for (const z of facadeZones(c)) lines.push(`• ${z.label}: ${materialLabel(facadeOf(c.materials[z.id]))}`);
  lines.push(`• Корпус: ${materialLabel(carcassOf(c.materials.carcass))}, ДСП ${carcassThickness(c)} мм`);
  if (hasHandles(c)) lines.push(`• Ручки: ${materialLabel(handleOf(c.materials.handle))}`);
  else lines.push(`• Профіль дверей купе: ${materialLabel(handleOf(c.materials.handle))}`);
  if (hasCountertop(c)) {
    const t = c.type === 'Меблі для ванної' ? Math.min(c.counterThickness, 28) : c.counterThickness;
    lines.push(`• Стільниця: ${materialLabel(countertopOf(c.materials.countertop))}, ${t} мм${c.type === 'Кухня' ? `, виступ ${c.counterOverhang} мм` : ''}`);
    if (c.type === 'Кухня') lines.push(`• Фартук: ${c.backsplash === 'none' ? 'без фартуха' : c.backsplash === 'same' ? 'як стільниця' : materialLabel(backsplashOf(c.backsplash, c.materials.countertop))}`);
  }
  for (const n of model.notes) lines.push(`⚠ ${n}`);
  lines.push(`Подарунок: ${c.gift === "Кам'яна Мийка" ? "Кам'яна мийка Granado" : c.gift || 'не обрано'}${c.gift === 'LED Підсвітка' && c.type === 'Шафа-купе / Гардеробна' ? ` (${LED_MODES[c.ledMode].toLowerCase()})` : ''}`);
  return lines;
}
