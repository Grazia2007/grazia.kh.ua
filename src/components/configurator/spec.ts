// Текст специфікації ліда. Той самий текст бачить клієнт (підсумок) і менеджер (Telegram, orders).
import { buildScene, carcassThickness, dimFields, TALL_MODULES, type Config, type Unit } from './layout';
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
};

export const hasCountertop = (c: Config) => c.type === 'Кухня' || c.type === 'Меблі для ванної';
export const hasHandles = (c: Config) => !(c.type === 'Шафа-купе / Гардеробна' && c.wardrobeDoors === 'Купе');

export function facadeZones(c: Config): { id: 'base' | 'upper' | 'topTier'; label: string }[] {
  if (c.type === 'Кухня') {
    const z: { id: 'base' | 'upper' | 'topTier'; label: string }[] = [{ id: 'base', label: 'Нижні фасади' }, { id: 'upper', label: 'Верхні фасади' }];
    if (c.upperTier === 'Двоярусні (з антресолями)') z.push({ id: 'topTier', label: 'Антресолі' });
    return z;
  }
  if (c.type === 'Меблі для ванної') return [{ id: 'base', label: 'Фасади тумби' }, { id: 'upper', label: 'Рамка дзеркальної шафи' }];
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
    lines.push(`Верхні секції: ${c.upperTier}`);
    lines.push(`Лівий пенал: ${TALL_MODULES[c.leftModule]}`);
    lines.push(`Правий пенал: ${TALL_MODULES[c.rightModule]}`);
  }
  if (c.type === 'Шафа-купе / Гардеробна') {
    lines.push(`Двері: ${c.wardrobeDoors}, ${model.units.find((u) => u.kind === 'wardrobe')?.doors ?? 0} шт.`);
    lines.push(`Антресоль: ${model.units.some((u) => u.kind === 'top') ? 'так' : 'ні'}`);
  }
  if (c.type === 'Меблі у вітальню') lines.push(`Пенали з боків: ${c.sidePenals ? 'так' : 'ні'}`);
  if (c.type === 'Меблі для ванної') lines.push(`Пенал: ${c.bathPenal ? 'так' : 'ні'}`);

  // модулі з ширинами
  const groups = new Map<string, number[]>();
  for (const u of model.units) groups.set(KIND_LABEL[u.kind], [...(groups.get(KIND_LABEL[u.kind]) ?? []), u.w]);
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
  lines.push(`Подарунок: ${c.gift || 'не обрано'}`);
  return lines;
}
