// Skickar utskick åt styrelse och admin.
// Avsändare: tjänstens adress (MAIL_FRAN) i föreningens namn. Svar går till föreningens egen adress
// (site/main -> installningar.epost), som admin skriver in i appen.
// Mottagare kontrolleras mot medlemsregistret (tabellen medlemmar), styrelsen och inloggningarna.
// Hemligheter (Supabase -> Edge Functions -> Secrets):
//   RESEND_API_KEY, MAIL_FRAN (t.ex. baggetorp@vagappen.se), MAIL_FRAN_NAMN (föreningens namn)
// Reserv: SMTP_HOST, SMTP_PORT (465), SMTP_USER, SMTP_PASS om Resend inte används.
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const lc = (x: unknown) => String(x ?? "").trim().toLowerCase();
const okMail = (x: string) => /^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/.test(x);
const MAX = 300;
const MAX_BILAGOR = 15 * 1024 * 1024;

// Hämtar bilagor som styrelsen laddat upp till den låsta lagringsplatsen (styrelse/bilagor/...).
// Varje bilaga skickas som { path: "bilagor/<uuid>/<säkert-namn>", namn: "Riktigt namn.pdf" }.
async function hamtaBilagor(items: unknown): Promise<{ filename: string; bytes: Uint8Array }[]> {
  const list = (Array.isArray(items) ? items : [])
    .map((x: any) => ({ path: String(x?.path ?? x ?? ""), namn: String(x?.namn ?? "") }))
    .filter((x) => /^bilagor\/[\w-]+\/[\w.-]+$/.test(x.path)).slice(0, 10);
  if (!list.length) return [];
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ut: { filename: string; bytes: Uint8Array }[] = [];
  let total = 0;
  for (const { path: p, namn } of list) {
    const { data, error } = await admin.storage.from("styrelse").download(p);
    if (error || !data) throw new Error("Kunde inte hämta bilagan " + (namn || p.split("/").pop()));
    const bytes = new Uint8Array(await data.arrayBuffer());
    total += bytes.length;
    if (total > MAX_BILAGOR) throw new Error("Bilagorna är för stora (högst 15 MB totalt).");
    const filename = (namn || p.split("/").pop()!).replace(/[\\/\u0000-\u001f"]/g, "_").slice(0, 150);
    ut.push({ filename, bytes });
  }
  return ut;
}
const resendAtt = (b: { filename: string; bytes: Uint8Array }[]) => b.map((x) => ({ filename: x.filename, content: encodeBase64(x.bytes) }));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ fel: "Fel metod" }, 405);
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: roll } = await sb.rpc("min_roll");
    if (roll !== "admin" && roll !== "styrelse") return json({ fel: "Saknar behörighet" }, 403);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const smtp = { host: Deno.env.get("SMTP_HOST"), user: Deno.env.get("SMTP_USER"), pass: Deno.env.get("SMTP_PASS"), port: Number(Deno.env.get("SMTP_PORT") || 465) };
    const franAdr = Deno.env.get("MAIL_FRAN") || smtp.user || "";
    const namn = (Deno.env.get("MAIL_FRAN_NAMN") || Deno.env.get("SMTP_FRAN_NAMN") || "Vägföreningen").replace(/["<>]/g, "");
    const satt = resendKey ? "resend" : (smtp.host && smtp.user && smtp.pass) ? "smtp" : null;
    const konfigurerad = !!(satt && franAdr);

    const { data: doc } = await sb.from("docs").select("data").eq("path", "site/main").maybeSingle();
    const site = doc?.data ?? {};
    const svarTill = lc(site.installningar?.epost);
    const replyTo = okMail(svarTill) ? svarTill : (satt === "smtp" ? franAdr : "");

    const body = await req.json().catch(() => ({}));
    if (body.action === "status") return json({ konfigurerad, fran: konfigurerad ? franAdr : null, namn, svar_till: replyTo || null });
    if (!konfigurerad) return json({ fel: "Mejltjänsten är inte kopplad ännu." }, 400);

    // Hämta innehållet till ett mottaget mejl som sparades utan text.
    if (body.action === "hamta") {
      const { data: m } = await sb.from("inkorg").select("id,resend_id,text,html").eq("id", String(body.inkorg_id ?? "")).maybeSingle();
      if (!m) return json({ fel: "Mejlet finns inte." }, 404);
      if (m.text || m.html) return json({ text: m.text, html: m.html });
      if (!m.resend_id || !resendKey) return json({ fel: "Innehållet går inte att hämta." }, 400);
      const r = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(m.resend_id)}`, { headers: { Authorization: `Bearer ${resendKey}` } });
      if (!r.ok) {
        const t = (await r.text()).slice(0, 300);
        console.log("Kunde inte hämta innehåll från Resend:", r.status, t);
        return json({ fel: r.status === 401 || r.status === 403 ? "API-nyckeln saknar behörighet att läsa mottagna mejl (behöver Full access)." : `Resend svarade ${r.status}.`, detalj: t }, 502);
      }
      const d = await r.json();
      const text = String(d.text ?? "").slice(0, 200000), html = String(d.html ?? "").slice(0, 500000);
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await admin.from("inkorg").update({ text, html }).eq("id", m.id);
      return json({ text, html });
    }

    const amne = String(body.amne ?? "").slice(0, 200).trim();
    const text = String(body.text ?? "").slice(0, 20000);
    if (!text.trim()) return json({ fel: "Meddelandet är tomt." }, 400);

    // Svar på ett mejl i inkorgen: går bara till den som skrev mejlet.
    if (body.action === "svara") {
      const { data: m } = await sb.from("inkorg").select("id,fran,amne,text,mottagen").eq("id", String(body.inkorg_id ?? "")).maybeSingle();
      if (!m || !okMail(lc(m.fran))) return json({ fel: "Mejlet finns inte." }, 404);
      const subj = /^(re|sv):/i.test(m.amne) ? m.amne : `Sv: ${m.amne || namn}`;
      const citat = `\n\n--\n${namn}\n\nDen ${new Date(m.mottagen).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })} skrev ${m.fran}:\n` +
        String(m.text || "").split("\n").slice(0, 200).map((r: string) => "> " + r).join("\n");
      let bil: { filename: string; bytes: Uint8Array }[] = [];
      try { bil = await hamtaBilagor(body.bilagor); } catch (e) { return json({ fel: (e as Error).message }, 400); }
      const mail = { from: `"${namn}" <${franAdr}>`, to: [m.fran], subject: subj, text: text + citat, ...(replyTo ? { reply_to: replyTo } : {}), ...(bil.length ? { attachments: resendAtt(bil) } : {}) };
      let ok = false;
      if (satt === "resend") {
        const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify(mail) });
        ok = r.ok;
      } else {
        const t = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, auth: { user: smtp.user, pass: smtp.pass } });
        try { await t.sendMail({ from: mail.from, to: m.fran, subject: subj, text: mail.text, replyTo: replyTo || undefined, attachments: bil.map((x) => ({ filename: x.filename, content: x.bytes })) }); ok = true; } catch (_e) { ok = false; }
      }
      if (!ok) return json({ fel: "Det gick inte att skicka svaret." }, 502);
      const { data: u } = await sb.auth.getUser((req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, ""));
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: cur } = await admin.from("inkorg").select("svar").eq("id", m.id).maybeSingle();
      await admin.from("inkorg").update({ last: true, svar: [...(cur?.svar ?? []), { datum: new Date().toISOString(), av: u?.user?.email ?? "", text, bilagor: bil.map((x) => x.filename) }] }).eq("id", m.id);
      return json({ skickade: 1, till: m.fran });
    }

    // Bara adresser som finns i medlemsregistret, styrelsen eller bland inloggningarna får ta emot.
    const tillatna = new Set<string>();
    const { data: medl } = await sb.from("medlemmar").select("epost");
    for (const m of (medl ?? [])) if (okMail(lc(m.epost))) tillatna.add(lc(m.epost));
    for (const m of (site.styrelse ?? [])) if (okMail(lc(m.epost))) tillatna.add(lc(m.epost));
    const { data: roller } = await sb.from("roller").select("email");
    for (const r of (roller ?? [])) tillatna.add(lc(r.email));
    const till = [...new Set((Array.isArray(body.till) ? body.till : []).map(lc))].filter((e) => tillatna.has(e));
    if (!till.length) return json({ fel: "Inga giltiga mottagare." }, 400);
    if (till.length > MAX) return json({ fel: `Högst ${MAX} mottagare per utskick.` }, 400);

    let bil: { filename: string; bytes: Uint8Array }[] = [];
    try { bil = await hamtaBilagor(body.bilagor); } catch (e) { return json({ fel: (e as Error).message }, 400); }
    const fran = `"${namn}" <${franAdr}>`;
    const fot = `\n\n--\n${namn}` + (replyTo ? `\nSvara på det här mejlet så når du styrelsen.` : "") + (body.lank ? `\nMedlemssidorna: ${body.lank}` : "");
    const subject = amne || namn;
    const misslyckade: string[] = [];
    let skickade = 0;

    if (satt === "resend" && bil.length) {
      // Massutskick med bilagor: dold kopia, högst 49 mottagare per mejl (Resend tillåter inte bilagor i batch).
      const att = resendAtt(bil);
      for (let i = 0; i < till.length; i += 49) {
        const del = till.slice(i, i + 49);
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: fran, to: [franAdr], bcc: del, subject, text: text + fot, attachments: att, ...(replyTo ? { reply_to: replyTo } : {}) }),
        });
        if (r.ok) skickade += del.length; else { misslyckade.push(...del); console.log("Resend fel:", r.status, (await r.text()).slice(0, 300)); }
      }
    } else if (satt === "resend") {
      for (let i = 0; i < till.length; i += 100) {
        const del = till.slice(i, i + 100);
        const r = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(del.map((to) => ({ from: fran, to: [to], subject, text: text + fot, ...(replyTo ? { reply_to: replyTo } : {}) }))),
        });
        if (r.ok) skickade += del.length; else misslyckade.push(...del);
      }
    } else {
      const t = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, auth: { user: smtp.user, pass: smtp.pass }, pool: true, maxConnections: 2 });
      for (const to of till) {
        try { await t.sendMail({ from: fran, replyTo: replyTo || undefined, to, subject, text: text + fot, attachments: bil.map((x) => ({ filename: x.filename, content: x.bytes })) }); skickade++; }
        catch (_e) { misslyckade.push(to); }
      }
      t.close();
    }
    return json({ skickade, misslyckade, fran: franAdr, svar_till: replyTo || null, bilagor: bil.map((x) => x.filename) });
  } catch (e) {
    return json({ fel: "Något gick fel: " + String((e as Error)?.message ?? e).slice(0, 200) }, 500);
  }
});
