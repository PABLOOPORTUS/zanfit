-- ZANFIT: espacio usado por la base de datos (para el medidor de Administracion).
-- Pegar en Supabase -> SQL Editor -> New query -> Run. Se puede correr mas de una vez.
create or replace function public.espacio_usado()
returns bigint
language sql stable security definer
set search_path = public
as $$
  select case
    when public.es_admin() then pg_database_size(current_database())
    else null
  end;
$$;

grant execute on function public.espacio_usado()
  to authenticated;
