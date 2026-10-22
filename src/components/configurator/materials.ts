// Каталог матеріалів конструктора. Коди - внутрішні коди Grazia (GR-...),
// за ними менеджер знаходить матеріал у ліді. Щоб прив'язати до декорів постачальника
// (Egger, Kronospan тощо) - змініть name/code тут, решта коду не зміниться.

export type MaterialGroup = 'facade' | 'carcass' | 'countertop' | 'handle';

export interface Material {
  family?: 'painted' | 'veneer' | 'egger-uni' | 'egger-wood' | 'grazia-ldsp';
  code: string;
  name: string;
  group: MaterialGroup;
  color: string;
  finish: string; // мат / глянець / супермат / шпон / камінь / метал
  roughness: number;
  metalness: number;
  clearcoat?: number;
}

export const FACADES: Material[] = [
  { code: 'GR-F01', name: 'Soft White', group: 'facade', color: '#F5F5F7', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F02', name: 'Cashmere', group: 'facade', color: '#E2DCD0', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F03', name: 'Mushroom', group: 'facade', color: '#D1C7BD', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F04', name: 'Dusty Grey', group: 'facade', color: '#8F9394', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F05', name: 'Graphite', group: 'facade', color: '#2C2C2C', finish: 'супермат', roughness: 0.75, metalness: 0, family: 'painted' },
  { code: 'GR-F06', name: 'Emerald', group: 'facade', color: '#1E3527', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F07', name: 'Deep Forest', group: 'facade', color: '#1A2421', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F08', name: 'Navy Blue', group: 'facade', color: '#1F2A38', finish: 'мат', roughness: 0.55, metalness: 0, family: 'painted' },
  { code: 'GR-F09', name: 'Soft White', group: 'facade', color: '#F5F5F7', finish: 'глянець', roughness: 0.12, metalness: 0, clearcoat: 0.7, family: 'painted' },
  { code: 'GR-F10', name: 'Graphite', group: 'facade', color: '#2C2C2C', finish: 'глянець', roughness: 0.12, metalness: 0, clearcoat: 0.7, family: 'painted' },
  { code: 'GR-V01', name: 'Світлий дуб', group: 'facade', color: '#D4B895', finish: 'шпон', roughness: 0.8, metalness: 0, family: 'veneer' },
  { code: 'GR-V02', name: 'Горіх', group: 'facade', color: '#5E4028', finish: 'шпон', roughness: 0.8, metalness: 0, family: 'veneer' },
  { code: 'GR-V03', name: 'Чорне дерево', group: 'facade', color: '#211C18', finish: 'шпон', roughness: 0.8, metalness: 0, family: 'veneer' },
];

// Декори ЛДСП EGGER: коди й назви - з офіційного переліку наявності EGGER (availability.pdf).
// Колір - орієнтовний відтінок, підібраний вручну (текстур немає: потрібен дозвіл EGGER або фото власних зразків).
export const EGGER_LDSP: Material[] = [
  { code: 'EGGER W960 ST7', name: 'Класичний білий', group: 'facade', color: '#F1F0EB', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER W1000 ST9', name: 'Преміум білий', group: 'facade', color: '#F4F4F1', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER W1100 ST9', name: 'Альпійський білий', group: 'facade', color: '#F6F7F5', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER W1050 ST7', name: 'Прибережний білий', group: 'facade', color: '#ECE9E1', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U104 ST7', name: 'Алебастр білий', group: 'facade', color: '#ECE6D8', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U201 ST9', name: 'Галька сірий', group: 'facade', color: '#B9B5AC', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U216 ST9', name: 'Каме бежевий', group: 'facade', color: '#E3D8C3', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U335 ST9', name: 'Іржаво-червоний', group: 'facade', color: '#8E3B2E', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U502 ST9', name: 'Туманний синій', group: 'facade', color: '#9EAAB4', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U599 ST9', name: 'Індиго синій', group: 'facade', color: '#2E3743', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U604 ST9', name: 'Очеретяний зелений', group: 'facade', color: '#7D8670', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U702 ST9', name: 'Кашемір сірий', group: 'facade', color: '#C8BFB3', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U705 ST9', name: 'Ангора сірий', group: 'facade', color: '#A9A39A', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U7081 ST9', name: 'Світло-сірий', group: 'facade', color: '#C9C9C6', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U727 ST9', name: 'Сірий камінь', group: 'facade', color: '#8E8A84', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U732 ST9', name: 'Пиловий сірий', group: 'facade', color: '#7E7B76', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U750 ST9', name: 'Тауп сірий', group: 'facade', color: '#7F756B', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U765 ST7', name: 'Сріблястий сірий', group: 'facade', color: '#A7A9A9', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U767 ST9', name: 'Кубаніт сірий', group: 'facade', color: '#5E5F5F', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U775 ST9', name: 'Біло-сірий', group: 'facade', color: '#DCDCD8', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U779 ST7', name: 'Туманний сірий', group: 'facade', color: '#B6B7B3', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U780 ST9', name: 'Монумент сірий', group: 'facade', color: '#57585A', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U961 ST7', name: 'Графіт сірий', group: 'facade', color: '#3B3D3F', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U963 ST9', name: 'Діамант сірий', group: 'facade', color: '#4A4B4C', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER U999 ST7', name: 'Чорний', group: 'facade', color: '#1E1E1F', finish: 'ЛДСП', roughness: 0.62, metalness: 0, family: 'egger-uni' },
  { code: 'EGGER H1176 ST37', name: 'Дуб Галіфакс білий', group: 'facade', color: '#D9D0C2', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1180 ST37', name: 'Дуб Галіфакс натуральний', group: 'facade', color: '#B98B5E', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1181 ST37', name: 'Дуб Галіфакс тютюновий', group: 'facade', color: '#8A6342', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3180 ST37', name: 'Дуб Галіфакс коричневий', group: 'facade', color: '#6C4A33', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1210 ST12', name: "В'яз Тоссіні сіро-бежевий", group: 'facade', color: '#A7978A', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1222 ST12', name: "В'яз Тоссіні лисячий сірий", group: 'facade', color: '#7E7166', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1701 ST12', name: "В'яз Тоссіні білий", group: 'facade', color: '#DCD5CB', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1223 ST19', name: 'Ясен Севілья', group: 'facade', color: '#C9B79C', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1225 ST12', name: 'Ясен Тронхейм', group: 'facade', color: '#C7B497', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1290 ST19', name: 'Frozen Wood білий', group: 'facade', color: '#D9D6D0', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1288 ST19', name: 'Frozen Wood сірий камінь', group: 'facade', color: '#8E8A84', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1292 ST19', name: 'Frozen Wood карбон', group: 'facade', color: '#3F3D3B', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1307 ST19', name: 'Горіх Вармія коричневий', group: 'facade', color: '#6B4E3A', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1714 ST19', name: 'Горіх Лінкольн', group: 'facade', color: '#6E4B33', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1715 ST12', name: 'Горіх Парона', group: 'facade', color: '#7A583F', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3710 ST12', name: 'Горіх Каріні натуральний', group: 'facade', color: '#7C5B41', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3790 ST12', name: 'Горіх Каріні медовий', group: 'facade', color: '#94693F', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3794 ST12', name: 'Горіх Каріні шоколадний', group: 'facade', color: '#4E3626', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1384 ST40', name: 'Дуб Казелла білий', group: 'facade', color: '#DCD3C5', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1367 ST40', name: 'Дуб Казелла світлий натуральний', group: 'facade', color: '#CDB28E', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1385 ST40', name: 'Дуб Казелла натуральний', group: 'facade', color: '#B58E64', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1386 ST40', name: 'Дуб Казелла коричневий', group: 'facade', color: '#7A5A3E', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3157 ST12', name: 'Дуб Віченца', group: 'facade', color: '#C2A27B', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3158 ST19', name: 'Дуб Віченца сірий', group: 'facade', color: '#9D958A', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3146 ST19', name: 'Дуб Лоренцо бежево-сірий', group: 'facade', color: '#B3A492', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3303 ST10', name: 'Дуб Гамільтон натуральний', group: 'facade', color: '#B88E62', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3171 ST12', name: 'Дуб Кендал олійний', group: 'facade', color: '#A77E55', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H1816 ST7', name: 'Клен натуральний', group: 'facade', color: '#E2CBA6', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3860 ST9', name: 'Клен шампань', group: 'facade', color: '#D8C3A0', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3195 ST19', name: 'Fineline білий', group: 'facade', color: '#DEDAD3', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
  { code: 'EGGER H3198 ST19', name: 'Fineline темно-сірий', group: 'facade', color: '#55524E', finish: 'ЛДСП, дерево', roughness: 0.78, metalness: 0, family: 'egger-wood' },
];

export const CARCASSES: Material[] = [
  { code: 'GR-C01', name: 'ДСП білий', group: 'carcass', color: '#ECECEA', finish: 'мат', roughness: 0.7, metalness: 0, family: 'grazia-ldsp' },
  { code: 'GR-C02', name: 'ДСП сірий', group: 'carcass', color: '#A7A7A5', finish: 'мат', roughness: 0.7, metalness: 0, family: 'grazia-ldsp' },
  { code: 'GR-C03', name: 'ДСП графіт', group: 'carcass', color: '#2B2B2B', finish: 'мат', roughness: 0.7, metalness: 0, family: 'grazia-ldsp' },
  { code: 'GR-C04', name: 'ДСП дуб світлий', group: 'carcass', color: '#C9AD86', finish: 'мат', roughness: 0.75, metalness: 0, family: 'grazia-ldsp' },
];

// корпус: власні базові + усі декори EGGER
export const CARCASS_ALL: Material[] = [...CARCASSES, ...EGGER_LDSP.map((m) => ({ ...m, group: 'carcass' as const }))];

export const COUNTERTOPS: Material[] = [
  { code: 'GR-T01', name: 'Штучний камінь, білий', group: 'countertop', color: '#F2F1EE', finish: 'камінь', roughness: 0.25, metalness: 0, clearcoat: 0.4 },
  { code: 'GR-T02', name: 'Кварц, сірий', group: 'countertop', color: '#BDBDBA', finish: 'камінь', roughness: 0.25, metalness: 0, clearcoat: 0.4 },
  { code: 'GR-T03', name: 'Мармур, чорний', group: 'countertop', color: '#1A1A1A', finish: 'камінь', roughness: 0.2, metalness: 0, clearcoat: 0.5 },
  { code: 'GR-T04', name: 'Вологостійке ДСП, світле дерево', group: 'countertop', color: '#E5D3B3', finish: 'мат', roughness: 0.6, metalness: 0 },
  { code: 'GR-T05', name: 'HPL компакт, бетон', group: 'countertop', color: '#8C8C8C', finish: 'мат', roughness: 0.7, metalness: 0 },
];

// Фартук: окрім цих - будь-яка стільниця або шпон; 'same' - як стільниця, 'none' - без фартуха
export const GLASS: Material[] = [
  { code: 'GR-G01', name: 'Скло (скіналі), біле', group: 'countertop', color: '#EEEFED', finish: 'загартоване скло', roughness: 0.05, metalness: 0, clearcoat: 1 },
  { code: 'GR-G02', name: 'Скло (скіналі), чорне', group: 'countertop', color: '#151515', finish: 'загартоване скло', roughness: 0.05, metalness: 0, clearcoat: 1 },
  { code: 'GR-G03', name: 'Скло (скіналі), графіт', group: 'countertop', color: '#3A3C3E', finish: 'загартоване скло', roughness: 0.05, metalness: 0, clearcoat: 1 },
  { code: 'GR-G04', name: 'Скло (скіналі), бронза', group: 'countertop', color: '#6B5A48', finish: 'загартоване скло', roughness: 0.05, metalness: 0, clearcoat: 1 },
];

// оточення в 3D-сцені (лише візуал, у лід не йде)
export const INTERIORS = { studio: 'Студія', parquet: 'Паркет', tile: 'Плитка', concrete: 'Мікроцемент' } as const;
export type Interior = keyof typeof INTERIORS;

// type: як ручка виглядає на моделі
// profile - торцевий профіль на краю фасаду; gola - врізний профіль у корпусі під стільницею
export type HandleType = 'rail' | 'profile' | 'gola' | 'none';
export interface Handle extends Material { type: HandleType }

export const HANDLES: Handle[] = [
  { code: 'GR-H01', name: 'Рейлінг, сталь', type: 'rail', group: 'handle', color: '#B9BBBD', finish: 'метал', roughness: 0.3, metalness: 0.9 },
  { code: 'GR-H02', name: 'Рейлінг, чорний', type: 'rail', group: 'handle', color: '#1B1B1B', finish: 'метал', roughness: 0.45, metalness: 0.6 },
  { code: 'GR-H03', name: 'Торцевий профіль, алюміній', type: 'profile', group: 'handle', color: '#C4C6C8', finish: 'метал', roughness: 0.35, metalness: 0.85 },
  { code: 'GR-H04', name: 'Торцевий профіль, чорний', type: 'profile', group: 'handle', color: '#1B1B1B', finish: 'метал', roughness: 0.45, metalness: 0.6 },
  { code: 'GR-H06', name: 'Gola, алюміній', type: 'gola', group: 'handle', color: '#C4C6C8', finish: 'метал', roughness: 0.35, metalness: 0.85 },
  { code: 'GR-H07', name: 'Gola, чорний', type: 'gola', group: 'handle', color: '#1B1B1B', finish: 'метал', roughness: 0.45, metalness: 0.6 },
  { code: 'GR-H05', name: 'Без ручок (push-to-open)', type: 'none', group: 'handle', color: '#000000', finish: '-', roughness: 1, metalness: 0 },
];

const byCode = <T extends Material>(list: T[], code: string, fallback: T): T =>
  list.find((m) => m.code === code) ?? fallback;

export const FACADE_ALL: Material[] = [...FACADES, ...EGGER_LDSP];
export const facadeOf = (code: string) => byCode(FACADE_ALL, code, FACADES[0]);
export const carcassOf = (code: string) => byCode(CARCASS_ALL, code, CARCASSES[0]);
export const countertopOf = (code: string) => byCode(COUNTERTOPS, code, COUNTERTOPS[0]);
export const BACKSPLASH_ALL: Material[] = [...COUNTERTOPS, ...GLASS, ...FACADES.filter((m) => m.family === 'veneer')];
export const backsplashOf = (code: string, countertop: string) => (code === 'same' ? countertopOf(countertop) : byCode(BACKSPLASH_ALL, code, COUNTERTOPS[0]));
export const handleOf = (code: string) => byCode(HANDLES, code, HANDLES[0]);

export const FAMILY_LABEL: Record<NonNullable<Material['family']>, string> = {
  painted: 'Фарбовані (МДФ)',
  veneer: 'Шпон',
  'egger-uni': 'ЛДСП EGGER однотонні',
  'egger-wood': 'ЛДСП EGGER деревина',
  'grazia-ldsp': 'Базові ЛДСП',
};

export const materialLabel = (m: Material) => `${m.name}${m.finish && m.finish !== '-' ? ` (${m.finish})` : ''}, код ${m.code}`;
