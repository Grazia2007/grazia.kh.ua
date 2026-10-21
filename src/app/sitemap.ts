import type { MetadataRoute } from 'next';
import { getPublishedProjects, projectPath, SITE_URL } from '@/app/lib/portfolio';

// карта сайту для Google: головна + сторінка кожної опублікованої роботи
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    ...projects.map((p: any) => ({
      url: `${SITE_URL}${projectPath(p)}`,
      lastModified: p.created_at ? new Date(p.created_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: p.photos?.[0]?.url ? [p.photos[0].url] : undefined
    }))
  ];
}
