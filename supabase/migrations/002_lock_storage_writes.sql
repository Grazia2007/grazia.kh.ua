-- КРОК 2 (запустити ПІСЛЯ деплою і перевірки, що нова адмінка завантажує фото):
-- забороняємо запис у storage з публічним (anon) ключем. Адмінка тепер пише
-- через одноразові посилання від сервера, тож публічний запис більше не потрібен.
-- Публічне читання фото на сайті не зачіпається (бакет public).

-- 2.1 подивитись, які політики зараз є (для звіту, нічого не змінює)
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects';

-- 2.2 видалити політики запису/зміни/видалення для anon та public
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and roles && array['anon', 'public']::name[]
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;
