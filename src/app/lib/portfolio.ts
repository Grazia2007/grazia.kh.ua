// спільний шар даних портфоліо - один і той самий код на сервері й на клієнті

export const DEFAULT_MAP_LOCATIONS = [
  {
    id: 'grazia-main',
    name: 'м. Харків (Центр)',
    coordinates: [36.2304, 50.0058],
    project: 'Ексклюзивні меблі GRAZIA',
    radius: 'Локація виробництва',
    type: 'city',
    description: 'Ми створюємо преміальні корпусні меблі за індивідуальними проєктами з 2007 року. Кожен виріб — це поєднання бездоганного стилю, передових технологій та європейської якості.',
    rating: 5,
    photos: [
      { url: 'https://gpxbzpqnpbbumtiyfstc.supabase.co/storage/v1/object/public/grazia-media/photo_2026-05-25_02-26-43.jpg' }
    ]
  }
];

// ГРУПУВАННЯ ПРОЄКТІВ ЗА КООРДИНАТАМИ (Variant B - Product First)
export const groupProjectsByCoordinates = (projects: any[]) => {
  const groups: Record<string, any> = {};
  projects.forEach((proj) => {
    const lon = proj.coordinates && proj.coordinates[0] !== undefined ? proj.coordinates[0] : 36.2304;
    const lat = proj.coordinates && proj.coordinates[1] !== undefined ? proj.coordinates[1] : 50.0058;
    // Округлення до 4 знаків після коми
    const key = `${lon.toFixed(4)}_${lat.toFixed(4)}`;
    if (!groups[key]) {
      groups[key] = {
        id: proj.id || key,
        name: proj.name,
        coordinates: [lon, lat],
        type: proj.type || 'city',
        projects: []
      };
    }
    groups[key].projects.push(proj);
  });
  return Object.values(groups);
};

// мапінг рядка portfolio_projects у форму, яку очікує інтерфейс
export const formatPortfolioRow = (item: any) => {
  let coords = [36.2263, 50.0152];
  if (item.coordinates) {
    if (typeof item.coordinates === 'string') {
      const cleaned = item.coordinates.replace('(', '').replace(')', '').replace(',', ' ').trim().split(/\s+/);
      coords = [parseFloat(cleaned[0]), parseFloat(cleaned[1])];
    } else if (typeof item.coordinates === 'object') {
      coords = [
        item.coordinates.x !== undefined ? item.coordinates.x : item.coordinates.lon,
        item.coordinates.y !== undefined ? item.coordinates.y : item.coordinates.lat
      ];
    }
  }
  return {
    id: item.id,
    name: item.location_name,
    coordinates: coords,
    project: item.title,
    radius: `Безпечний радіус: ${item.radius_meters || 300}м`,
    type: item.coordinates ? 'city' : 'region',
    description: item.description,
    rating: parseFloat(item.rating) || 5.0,
    photos: item.media || [],
    youtube_url: item.youtube_url,
    instagram_url: item.instagram_url
  };
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gpxbzpqnpbbumtiyfstc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2VUpjTZW1Bf1Bg0Fs0vh6Q_6tIr5eP0';

// серверне читання портфоліо - кеш 5 хвилин, щоб не бити в базу на кожен запит
export async function getGroupedPortfolio() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_projects?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 300, tags: ['portfolio'] }
    });
    if (!res.ok) return groupProjectsByCoordinates(DEFAULT_MAP_LOCATIONS);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return groupProjectsByCoordinates(DEFAULT_MAP_LOCATIONS);
    return groupProjectsByCoordinates(data.map(formatPortfolioRow));
  } catch {
    // база недоступна - сторінка все одно рендериться з дефолтною локацією
    return groupProjectsByCoordinates(DEFAULT_MAP_LOCATIONS);
  }
}
