// Push-notiser för vägföreningens app.
//   action "nyckel": ger appen serverns publika nyckel (skapas första gången och sparas i push_nycklar).
//   action "nyhet":  skickar en notis om en nyhet till alla som slagit på notiser (bara styrelse och admin).
//   action "test":   skickar en testnotis till den inloggade användarens egna enheter.
import { createClient } from "npm:@supabase/supabase-js@2";
import { nyaVapidNycklar, skicka } from "./webpush.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ fel: "Fel metod" }, 405);
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roll } = await sb.rpc("min_roll");
    if (!roll) return json({ fel: "Saknar behörighet" }, 403);
    const body = await req.json().catch(() => ({}));

    // Serverns nycklar (skapas en gång).
    let { data: n } = await admin.from("push_nycklar").select("publik,privat").eq("id", 1).maybeSingle();
    if (!n) {
      const k = await nyaVapidNycklar();
      await admin.from("push_nycklar").insert({ id: 1, publik: k.publik, privat: k.privat });
      ({ data: n } = await admin.from("push_nycklar").select("publik,privat").eq("id", 1).maybeSingle());
    }
    if (!n) return json({ fel: "Kunde inte skapa nycklar" }, 500);
    if (body.action === "nyckel") return json({ publik: n.publik });

    const sendTo = async (subs: any[], payload: unknown) => {
      const text = JSON.stringify(payload);
      let skickade = 0; const bort: string[] = []; let fel = 0; const koder: number[] = [];
      for (let i = 0; i < subs.length; i += 20) {
        const res = await Promise.all(subs.slice(i, i + 20).map((s) => skicka(s, text, n).catch((e) => { console.error("push undantag", String(e?.message ?? e)); return 0; })));
        res.forEach((st, j) => { koder.push(st); if (st >= 200 && st < 300) skickade++; else if (st === 404 || st === 410) bort.push(subs[i + j].id); else fel++; });
      }
      if (bort.length) await admin.from("push_prenumerationer").delete().in("id", bort);
      return { skickade, borttagna: bort.length, fel, koder };
    };

    if (body.action === "test") {
      // Radsäkerheten gör att den inloggade bara ser sina egna enheter.
      const { data: subs, error: sErr } = await sb.from("push_prenumerationer").select("id,endpoint,p256dh,auth");
      if (sErr) return json({ fel: "Kunde inte läsa enheter: " + sErr.message }, 500);
      if (!subs?.length) return json({ fel: "Den här enheten har inte slagit på notiser." }, 400);
      const r = await sendTo(subs, { title: "Notiser är påslagna", body: "Du får en notis när det kommer nyheter från vägföreningen.", url: "./#start", tag: "test" });
      return json(r);
    }

    if (body.action === "nyhet") {
      if (roll !== "admin" && roll !== "styrelse") return json({ fel: "Saknar behörighet" }, 403);
      const { data: doc } = await sb.from("docs").select("data").eq("path", "site/main").maybeSingle();
      const nyhet = (doc?.data?.nyheter ?? []).find((x: any) => x.id === String(body.id ?? ""));
      if (!nyhet) return json({ fel: "Nyheten finns inte." }, 404);
      const text = String(nyhet.text ?? "").replace(/\s+/g, " ").trim();
      const { data: subs } = await admin.from("push_prenumerationer").select("id,endpoint,p256dh,auth");
      if (!subs?.length) return json({ skickade: 0, borttagna: 0, fel: 0, ingen: true });
      return json(await sendTo(subs, {
        title: String(nyhet.rubrik || "Nytt från vägföreningen").slice(0, 120),
        body: (text.length > 160 ? text.slice(0, 157) + "…" : text) || "Ny händelse under Aktuellt.",
        url: "./#start", tag: "nyhet-" + nyhet.id,
      }));
    }
    return json({ fel: "Okänd åtgärd" }, 400);
  } catch (e) {
    return json({ fel: "Något gick fel: " + String((e as Error)?.message ?? e).slice(0, 200) }, 500);
  }
});
