-- ZANFIT: cuentas nuevas con prueba de 7 dias y activacion por periodo.
-- Pegar en Supabase -> SQL Editor -> New query -> Run.
-- Se puede correr mas de una vez.

-- 1. Nuevo estado "pendiente" (se registro y espera que el admin confirme el pago).
alter table public.cuentas
  drop constraint if exists cuentas_estado_check;
alter table public.cuentas
  add constraint cuentas_estado_check
  check (estado in ('pendiente', 'prueba', 'activa', 'bloqueada'));

-- 2. Fin del periodo pagado (vacio = sin vencimiento).
alter table public.cuentas
  add column if not exists activa_hasta timestamptz;

-- 3. Puede usar la app: activa (sin vencer) o prueba vigente.
create or replace function public.puede_usar()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cuentas
    where user_id = auth.uid()
      and (
        (estado = 'activa'
          and (activa_hasta is null or activa_hasta > now()))
        or (estado = 'prueba' and prueba_hasta > now())
      )
  );
$$;

-- 4. WhatsApp de contacto para quien termina la prueba (se puede cambiar en Administracion).
update public.ajustes_venta
set contacto = '+56956024412'
where id = 1 and contacto = '';

-- 5. Administrador: la PRIMERA cuenta creada (la tuya).
insert into public.admins (user_id)
select id from auth.users
order by created_at asc
limit 1
on conflict do nothing;
