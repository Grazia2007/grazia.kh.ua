import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, PlayCircle, Star } from 'lucide-react';
import ProjectGallery from '@/components/ProjectGallery';
import SameAsProjectLead from '@/components/SameAsProjectLead';
import { getPublishedProjects, projectPath, workGroupOf, SITE_URL } from '@/app/lib/portfolio';

// окрема сторінка кожної роботи: індексується Google, має своє прев'ю в месенджерах
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

const findProject = async (slug: string) => {
  const key = decodeURIComponent(slug);
  const list = await getPublishedProjects();
  const project = list.find((p: any) => p.slug === key || String(p.id) === key) || null;
  return { project, list };
};

export async function generateStaticParams() {
  const list = await getPublishedProjects();
  return list.map((p: any) => ({ slug: String(p.slug || p.id) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { project } = await findProject(slug);
  if (!project) return { title: 'Роботу не знайдено — Меблі Grazia' };

  const group = workGroupOf(project);
  const title = `${project.project} — ${group}, Харків | Меблі Grazia`;
  const description = (project.description?.trim()
    || `${project.project}: ${group.toLowerCase()} на замовлення від Меблі Grazia. ${project.name}.`).slice(0, 160);
  const url = `${SITE_URL}${projectPath(project)}`;
  const cover = project.photos?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: 'Меблі Grazia',
      locale: 'uk_UA',
      images: cover ? [{ url: cover, alt: project.project }] : undefined
    }
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const { project, list } = await findProject(slug);
  if (!project) notFound();

  const group = workGroupOf(project);
  const related = list
    .filter((p: any) => p.id !== project.id && workGroupOf(p) === group && p.photos?.[0])
    .slice(0, 4);
  const more = related.length > 0 ? related : list.filter((p: any) => p.id !== project.id && p.photos?.[0]).slice(0, 4);

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Меблі Grazia', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: group, item: `${SITE_URL}/#portfolio` },
      { '@type': 'ListItem', position: 3, name: project.project, item: `${SITE_URL}${projectPath(project)}` }
    ]
  };

  return (
    <main className="min-h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <header className="sticky top-0 z-50 bg-[var(--modal-bg)] backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 shrink-0 bg-[var(--btn-bg)] text-[var(--btn-text)] flex items-center justify-center font-serif font-bold text-2xl tracking-tighter">G</span>
            <span className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-main)] block font-bold">Меблі Grazia</span>
              <span className="text-sm font-serif truncate block">{project.name}</span>
            </span>
          </Link>
          <Link href="/#portfolio" className="h-12 px-6 shrink-0 flex items-center gap-2 rounded-full bg-[var(--btn-bg)] text-[var(--btn-text)] text-xs font-semibold uppercase tracking-widest hover:opacity-85 transition-opacity">
            <ArrowLeft size={16} /> Усі роботи
          </Link>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <nav aria-label="Навігація" className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-light)] mb-8 flex flex-wrap gap-2">
          <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Головна</Link>
          <span>/</span>
          <Link href="/#portfolio" className="hover:text-[var(--text-main)] transition-colors">{group}</Link>
        </nav>

        <ProjectGallery project={project} title={project.project} />

        <div className="mt-8 pt-12 border-t border-[var(--border-color)] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-12 items-start">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-main)] font-semibold block mb-4">Деталі виконання</span>
            {project.description && (
              <p className="text-[var(--text-muted)] leading-relaxed text-base mb-8 font-light whitespace-pre-line">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-[var(--border-color)]">
              <div className="flex items-center gap-1.5 text-[var(--accent-main)]">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                <span className="text-sm font-bold ml-2 text-[var(--text-main)]">{project.rating} / 5.0</span>
              </div>
              <div className="text-xs text-[var(--text-light)] font-mono flex items-center gap-2">
                <MapPin size={14} className="text-[var(--accent-main)]" /> {project.name}
                <span className="opacity-65">(задля конфіденційності замовників точна адреса не вказується)</span>
              </div>
            </div>
            {(project.youtube_url || project.instagram_url) && (
              <div className="flex flex-wrap gap-4">
                {project.youtube_url && (
                  <a href={project.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-[var(--btn-bg)] text-[var(--btn-text)] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity rounded-sm">
                    <PlayCircle size={16} /> Відеоогляд об&apos;єкта
                  </a>
                )}
                {project.instagram_url && (
                  <a href={project.instagram_url} target="_blank" rel="noopener noreferrer" className="border border-[var(--border-color)] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] transition-colors rounded-sm">
                    Перейти в Instagram
                  </a>
                )}
              </div>
            )}
          </div>

          <SameAsProjectLead
            projectId={project.id}
            projectTitle={project.project}
            projectLocation={project.name}
            coverUrl={project.photos?.[0]?.url}
            projectPath={projectPath(project)}
          />
        </div>

        {more.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end gap-6 mb-8">
              <h2 className="text-2xl md:text-3xl font-serif shrink-0">{related.length > 0 ? `Ще ${group.toLowerCase()}` : 'Інші роботи'}</h2>
              <div className="flex-1 h-px bg-[var(--border-color)] mb-3"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {more.map((p: any) => (
                <Link key={p.id} href={projectPath(p)} className="group relative block overflow-hidden bg-[var(--bg-card)] aspect-[4/3] rounded-lg border border-[var(--border-color)]">
                  <Image src={p.photos[0].url} alt={p.project || p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-full p-5">
                    <span className="text-[9px] text-white/70 font-mono uppercase tracking-widest block mb-1 truncate">{p.name}</span>
                    <h3 className="text-base font-serif text-white leading-tight line-clamp-2">{p.project}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
