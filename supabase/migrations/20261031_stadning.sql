-- Städning efter version 2.46. Kör i Supabase → SQL Editor → Run.
-- 1. Medlemsregistret ligger nu i tabellen medlemmar; ta bort den gamla kopian i site/main.
update public.docs set data = data - 'medlemmar', uppdaterad = now()
where path = 'site/main' and data ? 'medlemmar';

-- 2. Äldre åtgärder får samma format som nya (lista med ansvariga).
update public.docs d set data = jsonb_set(d.data, '{items}', (
  select coalesce(jsonb_agg(
    case when jsonb_typeof(i->'ansvariga') = 'array' then i
         when coalesce(i->>'ansvarig','') = '' then i || jsonb_build_object('ansvariga','[]'::jsonb)
         else i || jsonb_build_object('ansvariga', jsonb_build_array(jsonb_build_object(
           'namn', i->>'ansvarig', 'epost', lower(coalesce(i->>'ansvarigEpost','')), 'grupp', coalesce(i->>'ansvarigGrupp',''))))
    end), '[]'::jsonb)
  from jsonb_array_elements(coalesce(d.data->'items','[]'::jsonb)) i)), uppdaterad = now()
where d.path = 'styrelse/atgarder';

-- 3. Gamla databasfunktioner som appen inte längre använder.
drop function if exists public.lagg_till_atgard(text, text, text, text, text);
drop function if exists public.lagg_till_atgard_g(text, text, text, text, text, text);

select 'klart' as status,
  (select count(*) from public.medlemmar) as medlemmar,
  (select (data ? 'medlemmar') from public.docs where path = 'site/main') as gammal_kopia_kvar;
