-- КРОК 3: вид меблів для розділів галереї всіх робіт (кухні, шафи, дитячі...).
-- Безпечно: лише додає необов'язкову колонку.
alter table public.portfolio_projects
  add column if not exists furniture_type text;
