-- ZANFIT: tabla para guardar el progreso de cada usuario en la nube.
-- Pegar en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez sin problema.

create table if not exists public.datos_usuario (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- Copia completa de los datos del usuario (mismo formato que el respaldo JSON de la app).
  datos jsonb not null,
  actualizado_en timestamptz not null default now(),
  dispositivo text
);

-- Seguridad: cada usuario solo puede ver y modificar su propia fila.
alter table public.datos_usuario enable row level security;

drop policy if exists "ver lo propio" on public.datos_usuario;
drop policy if exists "crear lo propio" on public.datos_usuario;
drop policy if exists "actualizar lo propio" on public.datos_usuario;
drop policy if exists "borrar lo propio" on public.datos_usuario;

create policy "ver lo propio" on public.datos_usuario for select using (auth.uid() = user_id);
create policy "crear lo propio" on public.datos_usuario for insert with check (auth.uid() = user_id);
create policy "actualizar lo propio" on public.datos_usuario for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar lo propio" on public.datos_usuario for delete using (auth.uid() = user_id);
