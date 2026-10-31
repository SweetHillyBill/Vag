// Skickar utskick från föreningens egen mejlbrevlåda (SMTP), bara för styrelse och admin.
// Hemligheter (Supabase -> Edge Functions -> Secrets): SMTP_HOST, SMTP_PORT (465), SMTP_USER, SMTP_PASS, SMTP_FRAN_NAMN
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const lc = (x: unknown) => String(x ?? "").trim().toLowerCase();
const MAX = 300;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ fel: "Fel metod" }, 405);
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: roll } = await sb.rpc("min_roll");
    if (roll !== "admin" && roll !== "styrelse") return json({ fel: "Saknar behörighet" }, 403);

    const host = Deno.env.get("SMTP_HOST"), user = Deno.env.get("SMTP_USER"), pass = Deno.env.get("SMTP_PASS");
    const port = Number(Deno.env.get("SMTP_PORT") || 465);
    const namn = Deno.env.get("SMTP_FRAN_NAMN") || "Vägföreningen";
    const konfigurerad = !!(host && user && pass);
    const body = await req.json().catch(() => ({}));
    if (body.action === "status") return json({ konfigurerad, fran: konfigurerad ? user : null, namn });
    if (!konfigurerad) return json({ fel: "Föreningens mejl är inte inställd ännu." }, 400);

    const amne = String(body.amne ?? "").slice(0, 200).trim();
    const text = String(body.text ?? "").slice(0, 20000);
    if (!text.trim()) return json({ fel: "Meddelandet är tomt." }, 400);

    // Bara adresser som finns i medlemsregistret eller bland inloggningarna får ta emot.
    const tillatna = new Set<string>();
    const { data: doc } = await sb.from("docs").select("data").eq("path", "site/main").maybeSingle();
    for (const m of (doc?.data?.medlemmar ?? [])) if (lc(m.epost).includes("@")) tillatna.add(lc(m.epost));
    for (const m of (doc?.data?.styrelse ?? [])) if (lc(m.epost).includes("@")) tillatna.add(lc(m.epost));
    const { data: roller } = await sb.from("roller").select("email");
    for (const r of (roller ?? [])) tillatna.add(lc(r.email));
    const till = [...new Set((Array.isArray(body.till) ? body.till : []).map(lc))].filter((e) => tillatna.has(e));
    if (!till.length) return json({ fel: "Inga giltiga mottagare." }, 400);
    if (till.length > MAX) return json({ fel: `Högst ${MAX} mottagare per utskick.` }, 400);

    const t = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, pool: true, maxConnections: 2 });
    const fran = `"${namn.replace(/"/g, "")}" <${user}>`;
    const fot = `\n\n--\n${namn}\nSvara på det här mejlet så når du styrelsen.\nMedlemssidorna: ${body.lank || ""}`.replace(/\nMedlemssidorna: $/, "");
    const misslyckade: string[] = [];
    let skickade = 0;
    for (const to of till) {
      try { await t.sendMail({ from: fran, replyTo: user, to, subject: amne || namn, text: text + fot }); skickade++; }
      catch (_e) { misslyckade.push(to); }
    }
    t.close();
    return json({ skickade, misslyckade, fran: user });
  } catch (e) {
    return json({ fel: "Något gick fel: " + String((e as Error)?.message ?? e).slice(0, 200) }, 500);
  }
});
