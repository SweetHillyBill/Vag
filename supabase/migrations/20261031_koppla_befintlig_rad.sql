-- Kör i Supabase → SQL Editor → Run. Innehåller även städningen (stadning.sql) så att du bara behöver köra en fil.

-- A. En medlem som lägger till sig på sin fastighet tar över en befintlig rad med samma namn som saknar mejl,
--    i stället för att skapa en dubblett.
create or replace function public.lagg_till_min_kontakt(p_fastighet text, p_namn text, p_telefon text, p_adress text)
returns boolean language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt()->>'email','')); f text := trim(coalesce(p_fastighet,'')); nm text := trim(coalesce(p_namn,'')); bt text; rid text;
begin
  if em = '' or not public.ar_medlem() then raise exception 'saknar behörighet'; end if;
  if length(nm) = 0 then raise exception 'namn saknas'; end if;
  if exists (select 1 from medlemmar where lower(trim(epost)) = em) then raise exception 'du finns redan i registret'; end if;
  if f = '' or not exists (select 1 from medlemmar where fastighet = f) then raise exception 'okänd fastighet'; end if;
  select id into rid from medlemmar
    where fastighet = f and trim(epost) = '' and lower(regexp_replace(trim(namn),'\s+',' ','g')) = lower(regexp_replace(nm,'\s+',' ','g'))
    order by id limit 1;
  if rid is not null then
    update medlemmar set epost = em,
      telefon = case when trim(coalesce(p_telefon,'')) <> '' then left(trim(p_telefon),40) else telefon end,
      adress  = case when trim(coalesce(p_adress,''))  <> '' then left(trim(p_adress),200) else adress end,
      uppdaterad = now(), uppdaterad_av = auth.uid()
    where id = rid;
    return true;
  end if;
  select max(beteckning) into bt from medlemmar where fastighet = f;
  insert into medlemmar (fastighet, beteckning, namn, telefon, epost, adress)
  values (f, coalesce(bt,''), left(nm,120), left(trim(coalesce(p_telefon,'')),40), em, left(trim(coalesce(p_adress,'')),200));
  return true;
end $$;

-- B. Städning
update public.docs set data = data - 'medlemmar', uppdaterad = now() where path = 'site/main' and data ? 'medlemmar';
update public.docs d set data = jsonb_set(d.data, '{items}', (
  select coalesce(jsonb_agg(
    case when jsonb_typeof(i->'ansvariga') = 'array' then i
         when coalesce(i->>'ansvarig','') = '' then i || jsonb_build_object('ansvariga','[]'::jsonb)
         else i || jsonb_build_object('ansvariga', jsonb_build_array(jsonb_build_object(
           'namn', i->>'ansvarig', 'epost', lower(coalesce(i->>'ansvarigEpost','')), 'grupp', coalesce(i->>'ansvarigGrupp',''))))
    end), '[]'::jsonb)
  from jsonb_array_elements(coalesce(d.data->'items','[]'::jsonb)) i)), uppdaterad = now()
where d.path = 'styrelse/atgarder';
drop function if exists public.lagg_till_atgard(text, text, text, text, text);
drop function if exists public.lagg_till_atgard_g(text, text, text, text, text, text);

select 'klart' as status;
