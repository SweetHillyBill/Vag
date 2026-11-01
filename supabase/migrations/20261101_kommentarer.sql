-- Kommentarer på inlägg i Aktuellt. Kör i Supabase → SQL Editor → Run.
create table if not exists public.kommentarer (
  id uuid primary key default gen_random_uuid(),
  nyhet_id text not null,
  user_id uuid not null default auth.uid(),
  namn text not null default '',
  text text not null check (length(trim(text)) between 1 and 1000),
  skapad timestamptz not null default now()
);
create index if not exists kommentarer_nyhet on public.kommentarer (nyhet_id, skapad);
alter table public.kommentarer enable row level security;

-- Namnet sätts av databasen (från behörighetslistan eller medlemsregistret), så ingen kan skriva i någon annans namn.
create or replace function public.kommentar_namn() returns trigger language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt()->>'email',''));
begin
  new.user_id := auth.uid();
  new.skapad := now();
  new.text := left(trim(new.text), 1000);
  new.namn := coalesce(
    nullif((select namn from roller where email = em), ''),
    nullif((select namn from medlemmar where lower(trim(epost)) = em order by namn limit 1), ''),
    split_part(em, '@', 1), 'En medlem');
  return new;
end $$;
revoke all on function public.kommentar_namn() from public, anon, authenticated;
drop trigger if exists kommentar_namn on public.kommentarer;
create trigger kommentar_namn before insert on public.kommentarer for each row execute function public.kommentar_namn();

drop policy if exists komm_las on public.kommentarer;
drop policy if exists komm_ny on public.kommentarer;
drop policy if exists komm_bort on public.kommentarer;
-- Alla medlemmar läser och skriver. Man tar bort sina egna; styrelsen och admin kan ta bort alla.
create policy komm_las on public.kommentarer for select to authenticated using (public.ar_medlem());
create policy komm_ny on public.kommentarer for insert to authenticated with check (public.ar_medlem() and user_id = auth.uid());
create policy komm_bort on public.kommentarer for delete to authenticated using (user_id = auth.uid() or public.ar_styrelse());
revoke all on public.kommentarer from anon, authenticated;
grant select, insert, delete on public.kommentarer to authenticated;

-- Historik i ändringsloggen och direktuppdatering i appen.
drop trigger if exists logg_kommentarer on public.kommentarer;
create trigger logg_kommentarer after insert or delete on public.kommentarer for each row execute function public.logga_andring();
do $$ begin
  begin alter publication supabase_realtime add table public.kommentarer; exception when others then null; end;
end $$;

select 'klart' as status;
