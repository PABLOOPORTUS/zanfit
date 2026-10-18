-- ZANFIT: cuánto usa la app cada cuenta (solo para el admin, en Administración).
-- Lee la copia en la nube de cada usuario y devuelve solo números, sin el detalle de sus entrenos.
-- Pegar en Supabase -> SQL Editor -> New query -> Run. Se puede correr más de una vez.

create or replace function public.uso_cuentas()
returns table (
  user_id uuid,
  ultimo_ingreso timestamptz,
  ultima_sync timestamptz,
  entrenos integer,
  entrenos_30d integer,
  ultimo_entreno timestamptz,
  evaluacion boolean
)
language sql stable security definer
set search_path = public
as $$
  select
    c.user_id,
    u.last_sign_in_at,
    d.actualizado_en,
    coalesce(w.total, 0)::integer,
    coalesce(w.mes, 0)::integer,
    w.ultimo,
    coalesce(jsonb_array_length(
      d.datos -> 'datos' -> 'perfil'), 0) > 0
  from public.cuentas c
  join auth.users u on u.id = c.user_id
  left join public.datos_usuario d on d.user_id = c.user_id
  left join lateral (
    select
      count(*) filter (where x ? 'fechaFin') as total,
      count(*) filter (
        where x ? 'fechaFin'
          and (x ->> 'fechaInicio')::numeric / 1000
            > extract(epoch from now() - interval '30 days')
      ) as mes,
      to_timestamp(max((x ->> 'fechaInicio')::numeric) / 1000) as ultimo
    from jsonb_array_elements(
      coalesce(d.datos -> 'datos' -> 'workouts', '[]'::jsonb)) x
  ) w on true
  where public.es_admin();
$$;

grant execute on function public.uso_cuentas()
  to authenticated;
