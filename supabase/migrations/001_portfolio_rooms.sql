-- КРОК 1 (запустити ДО пушу коду): нові поля об'єктів портфоліо.
-- Безпечно для наявних даних: лише додає колонки зі значеннями за замовчуванням.

alter table public.portfolio_projects
  add column if not exists category text not null default 'home',
  add column if not exists slug text,
  add column if not exists year integer,
  add column if not exists is_published boolean not null default true,
  add column if not exists rooms jsonb not null default '[]'::jsonb;

do $$ begin
  alter table public.portfolio_projects
    add constraint portfolio_projects_category_check
    check (category in ('home', 'hospital', 'kindergarten', 'office', 'commercial'));
exception when duplicate_object then null; end $$;

create unique index if not exists portfolio_projects_slug_key
  on public.portfolio_projects (slug) where slug is not null;

-- обмеження сховища: тільки фото, до 15 МБ на файл
update storage.buckets
  set file_size_limit = 15728640,
      allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
  where id = 'grazia-media';
