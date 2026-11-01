const {chromium,devices}=require('playwright');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ applyRemote({props:[{id:"p1",namn:"Gården",typ:"perm",perm:1}]}); openTab='vag'; renderTabs(); }); await pg.waitForTimeout(500);
await pg.evaluate(()=>kartaTest.map.setView([59.05,16.553],14)); await pg.waitForTimeout(200);
const at=async (lat,lng)=>{ await pg.$eval('#karta',e=>e.scrollIntoView({block:'center'})); const box=await (await pg.$('#karta')).boundingBox(); const p=await pg.evaluate(([a,b])=>{const q=kartaTest.map.latLngToContainerPoint([a,b]); return [q.x,q.y];},[lat,lng]); await pg.mouse.click(box.x+p[0],box.y+p[1]); await pg.waitForTimeout(150); };
await pg.evaluate(()=>{ state.karta={vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]}],punkter:[]}; kartaTest.satPunkt("utfart",[59.05,16.565]); });
console.log(tag,'före',await pg.evaluate(()=>state.segments.map(g=>g.id+' '+g.m+' '+g.namn).join(' | ')));
await pg.click('[data-km="dela"]'); await at(59.0501,16.555); await at(59.0499,16.548);
console.log(tag,'efter',await pg.evaluate(()=>state.segments.map(g=>g.id+' '+g.m+' '+g.namn).join(' | ')));
await pg.click('[data-km="radera"]'); await pg.waitForTimeout(200);
const del=await pg.$$('.kpunkt.delning'); if(del[0]) await del[0].click(); await pg.waitForTimeout(200);
console.log(tag,'en borttagen',await pg.evaluate(()=>state.segments.map(g=>g.id+' '+g.m).join(' | ')));
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
if(tag==='m'){ await pg.click('[data-km="radera"]'); await (await pg.$('#steg-vag .kartinfo')).screenshot({path:'/tmp/vagtest/dela.png'}); }
await ctx.close();}
await b.close();})();
