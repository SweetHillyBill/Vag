const {chromium,devices}=require('playwright'); const fs=require('fs');
const cfg=JSON.parse(fs.readFileSync(process.argv[2]));
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route(/tile\.(openstreetmap|opentopomap)\.org/,rt=>rt.fulfill({body:png,contentType:'image/png'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE',m.text()); });
await pg.goto('http://localhost:8766/verktyg.html?m=admin');await pg.waitForTimeout(1200);
await pg.evaluate(c=>{ applyRemote(c); },cfg); await pg.waitForTimeout(200);
if(tag==='d'){
  const r=await pg.evaluate(()=>{ const G=kartaTest.GK; const a=G.till([59,15]); const back=G.fran(a); const s=G.till([59.329,18.068]); return {a,back,s}; });
  console.log('SWEREF',JSON.stringify(r));
}
await pg.evaluate(()=>{openTab='karta';renderTabs();}); await pg.waitForTimeout(400);
// Rita vägnät: huvudväg utfart(öst) -> väst, gren norrut från mitten. Klicka i kartan.
await pg.evaluate(()=>kartaTest.map.setView([59.053,16.55],14)); await pg.waitForTimeout(200);
await pg.$eval('#karta',e=>e.scrollIntoView({block:'center'})); await pg.waitForTimeout(200); const box=await (await pg.$('#karta')).boundingBox();
const at=async (lat,lng)=>{ const box=await (await pg.$('#karta')).boundingBox(); const p=await pg.evaluate(([a,b])=>{const q=kartaTest.map.latLngToContainerPoint([a,b]); return [q.x,q.y];},[lat,lng]); await pg.mouse.click(box.x+p[0],box.y+p[1]); await pg.waitForTimeout(120); if(process.env.DBG) console.log('klick',lat,lng,p, await pg.evaluate(()=>JSON.stringify(state.karta)).then(x=>x.slice(0,200))); };
await pg.click('[data-km="vag"]'); console.log('dbg',await pg.evaluate(()=>[document.getElementById('kartKlar').hidden, getComputedStyle(document.getElementById('kartKlar')).display, document.querySelector('[data-km=vag]').className]));
await at(59.05,16.565); await at(59.05,16.555); await at(59.05,16.545); await at(59.05,16.535);
await pg.click('#kartKlarBtn');
await at(59.05,16.555); await at(59.055,16.555); await at(59.058,16.552);
await pg.click('#kartKlarBtn');
await pg.click('[data-km="punkt"]');
const sel=async v=>pg.selectOption('#kartPunktVal',v);
await sel('utfart'); await at(59.05,16.565);
const ids=await pg.evaluate(()=>state.props.map(p=>p.id));
const plats={hyt21:[59.058,16.552],bag31:[59.0501,16.536],hyt12:[59.054,16.5551],alv:[59.0499,16.548],stavv:[59.0501,16.56]};
for(const [id,ll] of Object.entries(plats)){ if(!ids.includes(id)) continue; await sel(id+'|route'); await at(...ll); }
await pg.click('[data-km="punkt"]');
const info=await pg.evaluate(()=>({vagar:state.karta.vagar.map(v=>v.pts.length), punkter:state.karta.punkter.length}));
console.log(tag,'ritat',JSON.stringify(info));
await pg.click('#kartBerakna'); await pg.waitForTimeout(200);
console.log(tag,'förslag:',await pg.$eval('#kartForslag',e=>e.innerText.slice(0,900)));
await pg.click('#kartTillampa'); await pg.waitForTimeout(200);
console.log(tag,'segments',JSON.stringify(await pg.evaluate(()=>state.segments.map(g=>[g.id,g.m,g.mot,g.namn]))));
console.log(tag,'routes',JSON.stringify(await pg.evaluate(()=>state.props.filter(p=>p.route.length).map(p=>[p.namn,p.route.join(''),segKm(p.route).toFixed(3)]))));
await pg.selectOption('#kartVisa','hyt21'); await pg.waitForTimeout(200);
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
await (await pg.$('#tab-karta')).screenshot({path:`/tmp/vagtest/vkkarta-${tag}.png`});
// geojson export/import roundtrip
if(tag==='d'){ const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('#pdf')]); await dl.saveAs('/tmp/vagtest/vkkarta.pdf'); console.log('pdf',fs.statSync('/tmp/vagtest/vkkarta.pdf').size);
 const n=await pg.evaluate(()=>{ const k=JSON.parse(JSON.stringify(state.karta)); return k.punkter.length; }); console.log('punkter',n);
  const s=await pg.evaluate(()=>JSON.stringify(state).length); console.log('state bytes',s); }
await ctx.close();}
await b.close();})();
