const {chromium,devices}=require('playwright');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
const huvud=[]; for(let i=0;i<=60;i++) huvud.push([59.05+0.0015*Math.sin(i/3),16.565-i*0.0004]);
(async()=>{const b=await chromium.launch();
for(const [opt,tag,laege] of [[devices['Pixel 7'],'m','ok'],[{viewport:{width:1280,height:900}},'d','ok'],[{viewport:{width:1280,height:900}},'d-fel','fel']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\./,rt=>rt.fulfill({body:png,contentType:'image/png'}));
let anrop=[]; await pg.route(/routing\.openstreetmap\.de|functions\/v1\/vagdata/,rt=>{ anrop.push(rt.request().url().slice(0,60));
  if(laege==='fel') return rt.fulfill({status:502,body:'{}',headers:{'access-control-allow-origin':'*'}});
  rt.fulfill({body:JSON.stringify({code:'Ok',routes:[{geometry:{type:'LineString',coordinates:huvud.map(p=>[p[1],p[0]])}}]}),contentType:'application/json',headers:{'access-control-allow-origin':'*'}}); });
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(500);
await pg.evaluate(()=>{ applyRemote({}); openTab='vag'; renderTabs(); }); await pg.waitForTimeout(500);
await pg.evaluate(()=>kartaTest.map.setView([59.051,16.553],14)); await pg.waitForTimeout(200);
const at=async (lat,lng)=>{ await pg.$eval('#karta',e=>e.scrollIntoView({block:'center'})); const box=await (await pg.$('#karta')).boundingBox(); const p=await pg.evaluate(([a,b])=>{const q=kartaTest.map.latLngToContainerPoint([a,b]); return [q.x,q.y];},[lat,lng]); await pg.mouse.click(box.x+p[0],box.y+p[1]); await pg.waitForTimeout(150); };
await pg.click('[data-km="vag"]');
for(const i of [0,12,24,36,48,60]) await at(...huvud[i]);
const t0=Date.now(); await pg.click('#kartKlarBtn'); await pg.waitForTimeout(800);
console.log(tag,'hjälp:',await pg.$eval('#kartHjalp',e=>e.textContent));
await pg.click('[data-km="utfart"]'); await at(...huvud[0]);
console.log(tag,JSON.stringify(await pg.evaluate(()=>({pts:state.karta.vagar.map(v=>v.pts.length),segs:state.segments.map(g=>g.id+' '+g.m)}))),'anrop',anrop.length);
await ctx.close();}
await b.close();})();
