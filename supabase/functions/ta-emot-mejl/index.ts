// Tar emot inkommande mejl från Resend (webhook "email.received") och sparar dem i tabellen inkorg.
// Hemligheter: RESEND_WEBHOOK_SECRET (whsec_…, från webhooken i Resend), RESEND_API_KEY (för att hämta mejlets innehåll).
// Driftsätts med verify_jwt = false; äktheten kontrolleras med Resends (Svix) signatur.
import { createClient } from "npm:@supabase/supabase-js@2";

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function verify(req: Request, raw: string): Promise<boolean> {
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";
  const id = req.headers.get("svix-id"), ts = req.headers.get("svix-timestamp"), sig = req.headers.get("svix-signature");
  if (!secret || !id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 600) return false;
  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = b64(await crypto.subtle.sign("HMAC", key, enc.encode(`${id}.${ts}.${raw}`)));
  return sig.split(" ").some((s) => s.split(",")[1] === mac);
}

const parseAddr = (x: unknown): { adr: string; namn: string } => {
  const s = Array.isArray(x) ? String(x[0] ?? "") : typeof x === "object" && x ? String((x as any).email ?? (x as any).address ?? "") : String(x ?? "");
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return m ? { namn: m[1].trim(), adr: m[2].trim().toLowerCase() } : { namn: "", adr: s.trim().toLowerCase() };
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const raw = await req.text();
  if (!(await verify(req, raw))) return new Response("ogiltig signatur", { status: 401 });
  let ev: any;
  try { ev = JSON.parse(raw); } catch { return new Response("fel format", { status: 400 }); }
  if (ev?.type !== "email.received") return new Response("ignorerad");

  const d = ev.data ?? {};
  const rid = String(d.email_id ?? d.id ?? "");
  let text = String(d.text ?? ""), html = String(d.html ?? ""), subject = String(d.subject ?? "");
  let from: unknown = d.from, to: unknown = d.to;
  // Innehållet skickas inte alltid med i webhooken; hämta det då från Resend.
  const key = Deno.env.get("RESEND_API_KEY");
  if (rid && key && !text && !html) {
    try {
      const r = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(rid)}`, { headers: { Authorization: `Bearer ${key}` } });
      if (r.ok) { const m = await r.json(); text = String(m.text ?? ""); html = String(m.html ?? ""); subject = subject || String(m.subject ?? ""); from = from || m.from; to = to || m.to; }
    } catch (_e) { /* sparas utan innehåll */ }
  }
  const f = parseAddr(from), t = parseAddr(to);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await admin.from("inkorg").upsert({
    resend_id: rid || null,
    mottagen: d.created_at || new Date().toISOString(),
    fran: f.adr.slice(0, 320), fran_namn: f.namn.slice(0, 200), till: t.adr.slice(0, 320),
    amne: subject.slice(0, 500), text: text.slice(0, 200000), html: html.slice(0, 500000),
  }, { onConflict: "resend_id", ignoreDuplicates: true });
  if (error) return new Response("kunde inte spara", { status: 500 });
  return new Response("sparat");
});
