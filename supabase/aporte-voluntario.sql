-- ZANFIT: 3 meses de regalo para todos y después aporte voluntario.
-- Nadie queda bloqueado por la fecha; solo las cuentas que el admin pausa.
-- Pegar en Supabase -> SQL Editor -> New query -> Run. Se puede correr más de una vez.

-- 1. Interruptor del modo "aporte voluntario" (se puede apagar en Administración).
alter table public.ajustes_venta
  add column if not exists aporte_voluntario boolean
  not null default false;

update public.ajustes_venta
set aporte_voluntario = true, dias_prueba = 90
where id = 1;

-- 2. Regalo: 3 meses desde hoy a todas las cuentas
--    (sin acortarle el plazo a quien ya tenga más).
update public.cuentas
set estado = 'prueba',
    prueba_hasta = greatest(
      coalesce(prueba_hasta, now()),
      now() + interval '90 days')
where estado in ('prueba', 'pendiente');

update public.cuentas
set activa_hasta = greatest(
      activa_hasta, now() + interval '90 days')
where estado = 'activa' and activa_hasta is not null;

-- 3. En modo aporte voluntario, cualquier cuenta no pausada
--    puede guardar (se mantiene "un teléfono a la vez").
create or replace function public.puede_usar()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cuentas
    where user_id = auth.uid()
      and (
        (estado <> 'bloqueada'
          and coalesce((select aporte_voluntario
            from public.ajustes_venta where id = 1), false))
        or (estado = 'activa'
          and (activa_hasta is null or activa_hasta > now()))
        or (estado = 'prueba' and prueba_hasta > now())
      )
      and (
        dispositivo_id is null
        or dispositivo_id = coalesce(
          current_setting('request.headers', true)::json
            ->> 'x-dispositivo',
          ''
        )
      )
  );
$$;
