-- ZANFIT: una cuenta se usa en un solo telefono a la vez.
-- Pegar en Supabase -> SQL Editor -> New query -> Run.
-- Se puede correr mas de una vez.

-- 1. Telefono activo de cada cuenta y cuantas veces cambio.
alter table public.cuentas
  add column if not exists dispositivo_id text;
alter table public.cuentas
  add column if not exists dispositivo_desde timestamptz;
alter table public.cuentas
  add column if not exists cambios_dispositivo integer
  not null default 0;

-- 2. "Usar en este telefono": lo llama la app al ingresar
--    o al tocar "Usar aqui". Solo cambia la cuenta propia.
create or replace function public.usar_este_dispositivo(p_id text)
returns void
language sql volatile security definer
set search_path = public
as $$
  update public.cuentas
  set
    cambios_dispositivo = cambios_dispositivo + (
      case
        when dispositivo_id is not null
          and dispositivo_id <> p_id then 1
        else 0
      end
    ),
    dispositivo_id = p_id,
    dispositivo_desde = now()
  where user_id = auth.uid();
$$;

grant execute on function public.usar_este_dispositivo(text)
  to authenticated;

-- 3. La nube solo guarda datos desde el telefono activo
--    (la app manda su identificador en el encabezado x-dispositivo).
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
