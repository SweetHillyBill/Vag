const {chromium,devices}=require('playwright');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
// krokig väg: 60 noder i sicksack + en gren
const huvud=[], gren=[]; for(let i=0;i<=60;i++){ huvud.push({lat:59.05+0.0015*Math.sin(i/3),lon:16.565-i*0.0004}); }
for(let i=0;i<=20;i++){ gren.push({lat:59.05+0.0015*Math.sin(30/3)+i*0.0003,lon:16.553+0.0008*Math.sin(i/2)}); }
const svar={elements:[{type:'way',id:1,nodes:huvud.map((_,i)=>100+i),geometry:huvud,tags:{highway:'track'}},{type:'way',id:2,nodes:[130,...gren.slice(1).map((_,i)=>300+i)],geometry:[huvud[30],...gren.slice(1)],tags:{highway:'track'}}]};
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.(openstreetmap|opentopomap)\.org/,rt=>rt.fulfill({body:png,contentType:'image/png'}));
let anrop=0; await pg.route(/overpass|mail\.ru/,rt=>{ anrop++; });
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(500);
await pg.evaluate(()=>{ applyRemote({}); openTab='vag'; renderTabs(); }); await pg.waitForTimeout(500);
await pg.evaluate(()=>kartaTest.map.setView([59.051,16.553],14)); await pg.waitForTimeout(200);
const at=async (lat,lng)=>{ await pg.$eval('#karta',e=>e.scrollIntoView({block:'center'})); const box=await (await pg.$('#karta')).boundingBox(); const p=await pg.evaluate(([a,b])=>{const q=kartaTest.map.latLngToContainerPoint([a,b]); return [q.x,q.y];},[lat,lng]); await pg.mouse.click(box.x+p[0],box.y+p[1]); await pg.waitForTimeout(400); };
await pg.click('[data-km="vag"]');
await at(huvud[0].lat,huvud[0].lon); await at(huvud[60].lat,huvud[60].lon); await pg.waitForTimeout(21000);
console.log(tag,'hjälp',await pg.$eval('#kartHjalp',e=>e.textContent));
await pg.click('#kartKlarBtn');
await at(huvud[30].lat,huvud[30].lon); await at(gren[20].lat,gren[20].lon); await pg.click('#kartKlarBtn');
await pg.click('[data-km="utfart"]'); await at(huvud[0].lat,huvud[0].lon);
const r=await pg.evaluate(()=>({vagar:state.karta.vagar.map(v=>v.pts.length), segs:state.segments.map(g=>g.id+' '+g.m+' m')}));
// förväntad längd längs sicksacken
const hv=(a,b)=>{const R=6371008.8,r=x=>x*Math.PI/180;const s=Math.sin(r(b.lat-a.lat)/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(r(b.lon-a.lon)/2)**2;return 2*R*Math.asin(Math.sqrt(s));};
let L1=0; for(let i=1;i<=60;i++) L1+=hv(huvud[i-1],huvud[i]); let L2=0; for(let i=1;i<=20;i++) L2+=hv(gren[i-1],gren[i]);
console.log(tag,JSON.stringify(r),'förväntat huvudväg',Math.round(L1),'gren',Math.round(L2),'anrop',anrop);
if(tag==='m') await (await pg.$('#karta')).screenshot({path:'/tmp/vagtest/folj.png'});
await ctx.close();}
await b.close();})();
