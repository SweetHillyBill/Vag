// Andelstalsverktygets vägdata. ?route=lon,lat;lon,lat… lägger en linje på vägen via OSRM (routing.openstreetmap.de, gång).
// ?bbox=S,W,N,E hämtar vägar (OpenStreetMap, highway=*) inom en ruta via Overpass.
// Webbläsaren behöver då bara nå Supabase. Ingen inloggning; rutan begränsas för att undvika missbruk.
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};
const svar = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json", ...extra } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const u = new URL(req.url);
  const route = u.searchParams.get("route");
  if (route) {
    const pts = route.split(";").map((x) => x.split(",").map(Number));
    if (pts.length < 2 || pts.length > 200 || pts.some((p) => p.length !== 2 || !p.every(isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90))
      return svar({ fel: "route=lon,lat;lon,lat krävs" }, 400);
    const c = pts.map((p) => p[0].toFixed(6) + "," + p[1].toFixed(6)).join(";");
    try {
      const r = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${c}?overview=full&geometries=geojson`, {
        headers: { "User-Agent": "Vagforeningens-andelstalsverktyg/1.0" }, signal: AbortSignal.timeout(15000) });
      const t = await r.text();
      if (!r.ok) console.log("vagdata route", r.status, t.slice(0, 200));
      return new Response(t, { status: r.status, headers: { ...CORS, "Content-Type": "application/json" } });
    } catch (e) {
      console.log("vagdata route misslyckades", String(e));
      return svar({ fel: "Vägvisaren svarade inte" }, 502);
    }
  }
  const bb = (u.searchParams.get("bbox") || "").split(",").map(Number);
  if (bb.length !== 4 || bb.some((x) => !isFinite(x))) return svar({ fel: "bbox=S,W,N,E krävs" }, 400);
  const [S, W, N, E] = bb;
  if (!(S < N && W < E) || N - S > 0.3 || E - W > 0.6 || S < -90 || N > 90) return svar({ fel: "Rutan är för stor eller fel" }, 400);
  const q = `[out:json][timeout:25];way["highway"](${bb.map((x) => x.toFixed(5)).join(",")});out geom;`;
  const fel: string[] = [];
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        body: "data=" + encodeURIComponent(q),
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Vagforeningens-andelstalsverktyg/1.0" },
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) { fel.push(url + " " + r.status); continue; }
      const j = await r.json();
      const ways = (j.elements || [])
        .filter((x: any) => x.type === "way" && Array.isArray(x.geometry) && Array.isArray(x.nodes) && x.nodes.length === x.geometry.length)
        .map((x: any) => ({ n: x.nodes, g: x.geometry.map((p: any) => [Math.round(p.lat * 1e6) / 1e6, Math.round(p.lon * 1e6) / 1e6]) }));
      return svar({ ways }, 200, { "Cache-Control": "public, max-age=86400" });
    } catch (e) {
      fel.push(url + " " + String(e));
    }
  }
  console.log("vagdata misslyckades", fel.join(" | "));
  return svar({ fel: "Ingen OpenStreetMap-server svarade", detaljer: fel }, 502);
});
