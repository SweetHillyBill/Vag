-- Medlemsregistret som egen tabell + ändringslogg. Kör hela filen i Supabase → SQL Editor → Run.
create table if not exists public.medlemmar (
  id text primary key default substr(md5(random()::text || clock_timestamp()::text),1,8),
  fastighet text not null default '',
  beteckning text not null default '',
  namn text not null default '',
  telefon text not null default '',
  epost text not null default '',
  adress text not null default '',
  uppdaterad timestamptz not null default now(),
  uppdaterad_av uuid default auth.uid()
);
alter table public.medlemmar enable row level security;
drop policy if exists medlemmar_las on public.medlemmar;
drop policy if exists medlemmar_ny on public.medlemmar;
drop policy if exists medlemmar_andra on public.medlemmar;
drop policy if exists medlemmar_bort on public.medlemmar;
create policy medlemmar_las on public.medlemmar for select to authenticated using (public.ar_medlem());
create policy medlemmar_ny on public.medlemmar for insert to authenticated with check (public.ar_styrelse());
create policy medlemmar_andra on public.medlemmar for update to authenticated using (public.ar_styrelse()) with check (public.ar_styrelse());
create policy medlemmar_bort on public.medlemmar for delete to authenticated using (public.ar_styrelse());
revoke all on public.medlemmar from anon;
grant select, insert, update, delete on public.medlemmar to authenticated;

insert into public.medlemmar (id, fastighet, beteckning, namn, telefon, epost, adress)
select coalesce(nullif(e->>'id',''), substr(md5(random()::text),1,8)), coalesce(e->>'fastighet',''), coalesce(e->>'beteckning',''), coalesce(e->>'namn',''),
       coalesce(e->>'telefon',''), lower(trim(coalesce(e->>'epost',''))), coalesce(e->>'adress','')
from public.docs d, jsonb_array_elements(coalesce(d.data->'medlemmar','[]'::jsonb)) e
where d.path = 'site/main'
on conflict (id) do nothing;

do $$ begin
  begin alter publication supabase_realtime add table public.medlemmar; exception when others then null; end;
end $$;

create or replace function public.uppdatera_min_kontakt(p_id text, p_namn text, p_telefon text, p_adress text)
returns boolean language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt()->>'email','')); n int;
begin
  if em = '' or not public.ar_medlem() then raise exception 'saknar behörighet'; end if;
  if length(trim(coalesce(p_namn,''))) = 0 then raise exception 'namn saknas'; end if;
  update medlemmar set namn = left(trim(p_namn),120), telefon = left(trim(coalesce(p_telefon,'')),40),
    adress = left(trim(coalesce(p_adress,'')),200), uppdaterad = now(), uppdaterad_av = auth.uid()
  where id = p_id and lower(trim(epost)) = em;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'kontakten är inte din'; end if;
  return true;
end $$;

create or replace function public.lagg_till_min_kontakt(p_fastighet text, p_namn text, p_telefon text, p_adress text)
returns boolean language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt()->>'email','')); f text := trim(coalesce(p_fastighet,'')); bt text;
begin
  if em = '' or not public.ar_medlem() then raise exception 'saknar behörighet'; end if;
  if length(trim(coalesce(p_namn,''))) = 0 then raise exception 'namn saknas'; end if;
  if exists (select 1 from medlemmar where lower(trim(epost)) = em) then raise exception 'du finns redan i registret'; end if;
  if f = '' or not exists (select 1 from medlemmar where fastighet = f) then raise exception 'okänd fastighet'; end if;
  select max(beteckning) into bt from medlemmar where fastighet = f;
  insert into medlemmar (fastighet, beteckning, namn, telefon, epost, adress)
  values (f, coalesce(bt,''), left(trim(p_namn),120), left(trim(coalesce(p_telefon,'')),40), em, left(trim(coalesce(p_adress,'')),200));
  return true;
end $$;

create table if not exists public.andringslogg (
  id bigint generated always as identity primary key,
  tid timestamptz not null default now(),
  user_id uuid default auth.uid(),
  epost text default lower(coalesce(auth.jwt()->>'email','')),
  tabell text not null,
  nyckel text not null,
  handelse text not null,
  fore jsonb,
  efter jsonb
);
alter table public.andringslogg enable row level security;
drop policy if exists logg_las on public.andringslogg;
create policy logg_las on public.andringslogg for select to authenticated using (public.ar_admin());
revoke all on public.andringslogg from anon, authenticated;
grant select on public.andringslogg to authenticated;

create or replace function public.logga_andring() returns trigger language plpgsql security definer set search_path = public as $$
declare k text; o jsonb; n jsonb;
begin
  o := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  n := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  k := coalesce(n->>'path', o->>'path', n->>'email', o->>'email', n->>'id', o->>'id', '');
  insert into andringslogg(tabell, nyckel, handelse, fore, efter) values (tg_table_name, k, lower(tg_op), o, n);
  delete from andringslogg where tid < now() - interval '400 days';
  return coalesce(new, old);
end $$;
revoke all on function public.logga_andring() from public, anon, authenticated;

drop trigger if exists logg_docs on public.docs;
create trigger logg_docs after insert or update or delete on public.docs for each row execute function public.logga_andring();
drop trigger if exists logg_medlemmar on public.medlemmar;
create trigger logg_medlemmar after insert or update or delete on public.medlemmar for each row execute function public.logga_andring();
drop trigger if exists logg_roller on public.roller;
create trigger logg_roller after insert or update or delete on public.roller for each row execute function public.logga_andring();

select count(*) as antal_medlemmar_flyttade from public.medlemmar;
