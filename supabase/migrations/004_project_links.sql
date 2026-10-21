-- КРОК 4: посилання на відеоогляд та Instagram (якщо колонок ще немає).
-- Безпечно: if not exists нічого не змінює, якщо колонки вже є.
alter table public.portfolio_projects
  add column if not exists youtube_url text,
  add column if not exists instagram_url text;
