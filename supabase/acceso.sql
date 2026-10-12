-- ZANFIT: acceso pagado (códigos de prueba y de compra).
-- Pegar en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez sin problema.
-- ANTES DE CORRER: cambia el correo de la última sección por el de TU cuenta de ZANFIT (la del administrador).

-- Cuentas que pueden usar la app. Solo las crea el servidor (api/registro, con la clave service_role).
create table if not exists public.cuentas (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  correo text not null default '',
  -- prueba: puede usar la app hasta `prueba_hasta`; activa: pagó; bloqueada: no puede.
  estado text not null check (estado in ('prueba', 'activa', 'bloqueada')),
  prueba_hasta timestamptz,
  codigo text,
  nota text not null default '',
  creada_en timestamptz not null default now(),
  activada_en timestamptz
);

-- Códigos de un solo uso que entrega el administrador (por WhatsApp, por ejemplo).
create table if not exists public.codigos (
  codigo text primary key,
  tipo text not null check (tipo in ('prueba', 'compra')),
  dias integer not null default 7,
  nota text not null default '',
  creado_en timestamptz not null default now(),
  usado_por uuid references auth.users (id) on delete set null,
  usado_en timestamptz
);

-- Administradores (los que ven la pantalla de Administración).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Precio y datos para transferir (una sola fila). Los ven todos los usuarios con sesión; los edita el administrador.
create table if not exists public.ajustes_venta (
  id integer primary key default 1 check (id = 1),
  precio text not null default '',
  datos_transferencia text not null default '',
  contacto text not null default '',
  dias_prueba integer not null default 7
);
insert into public.ajustes_venta (id) values (1) on conflict do nothing;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ¿Puede usar la app? Cuenta activa o prueba vigente.
create or replace function public.puede_usar() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.cuentas
    where user_id = auth.uid() and (estado = 'activa' or (estado = 'prueba' and prueba_hasta > now()))
  );
$$;

alter table public.cuentas enable row level security;
alter table public.codigos enable row level security;
alter table public.admins enable row level security;
alter table public.ajustes_venta enable row level security;

drop policy if exists "ver la propia o admin" on public.cuentas;
drop policy if exists "admin actualiza" on public.cuentas;
create policy "ver la propia o admin" on public.cuentas for select using (user_id = auth.uid() or public.es_admin());
create policy "admin actualiza" on public.cuentas for update using (public.es_admin()) with check (public.es_admin());

drop policy if exists "solo admin" on public.codigos;
create policy "solo admin" on public.codigos for all using (public.es_admin()) with check (public.es_admin());

drop policy if exists "saber si soy admin" on public.admins;
create policy "saber si soy admin" on public.admins for select using (user_id = auth.uid());

drop policy if exists "ver datos de venta" on public.ajustes_venta;
drop policy if exists "admin edita datos de venta" on public.ajustes_venta;
create policy "ver datos de venta" on public.ajustes_venta for select to authenticated using (true);
create policy "admin edita datos de venta" on public.ajustes_venta for update using (public.es_admin()) with check (public.es_admin());

-- La nube solo guarda datos de cuentas activas o en prueba vigente (aunque alguien se salte la app).
-- Leer lo propio se permite siempre: así, al pagar, recupera todo.
drop policy if exists "crear lo propio" on public.datos_usuario;
drop policy if exists "actualizar lo propio" on public.datos_usuario;
create policy "crear lo propio" on public.datos_usuario for insert with check (auth.uid() = user_id and public.puede_usar());
create policy "actualizar lo propio" on public.datos_usuario for update using (auth.uid() = user_id) with check (auth.uid() = user_id and public.puede_usar());

-- Las cuentas que ya existían (las de ustedes) quedan activas.
insert into public.cuentas (user_id, nombre, correo, estado, activada_en)
select id, coalesce(raw_user_meta_data ->> 'nombre', ''), coalesce(email, ''), 'activa', now()
from auth.users
on conflict (user_id) do nothing;

-- Administrador: CAMBIA este correo por el de tu cuenta de ZANFIT.
insert into public.admins (user_id)
select id from auth.users where email = 'CAMBIA_ESTE_CORREO@ejemplo.cl'
on conflict do nothing;
