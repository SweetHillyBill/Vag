const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.evaluate(()=>{localStorage.removeItem('andelstal_fall');localStorage.removeItem('andelstal_visa')}); await pg.reload(); await pg.waitForTimeout(300);
await pg.evaluate(()=>{ applyRemote({props:[{id:"a",namn:"Asplunda",typ:"frit",frit:1},{id:"s",namn:"Stavberga",typ:"perm",perm:1},{id:"b",namn:"Baggetorp",typ:"skog",skogHa:40}],
 karta:{vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]}],punkter:[{id:"u",typ:"utfart",ll:[59.05,16.565]}]}}); openTab='vag'; renderTabs(); });
await pg.waitForTimeout(500);
await pg.evaluate(()=>{ kartaTest.satPunkt("punkt",[59.05,16.555]); kartaTest.satPunkt("punkt",[59.05,16.545]); });
await pg.waitForTimeout(200);
console.log(tag,'punktlista:',await pg.$$eval('.punktrad',x=>x.map(e=>e.innerText.replace(/\n/g,' / ')).join(' || ')));
await pg.fill('[data-pnamn]','Stavbergavägen'); await pg.press('[data-pnamn]','Tab'); await pg.waitForTimeout(200);
console.log(tag,'delsträckor:',await pg.evaluate(()=>state.segments.map(g=>g.id+' '+g.m+' '+g.namn).join(' | ')));
// välj på fastigheterna
await pg.evaluate(()=>{ openTab='fast'; selected='a'; renderTabs(); renderCards(); }); await pg.waitForTimeout(200);
const opts=await pg.$eval('#pr-a',e=>[...e.options].map(o=>o.text).join(', ')); console.log(tag,'val:',opts);
const p1=await pg.evaluate(()=>kartaPunkter()[0].id), p2=await pg.evaluate(()=>kartaPunkter()[1].id);
await pg.selectOption('#pr-a',p1); await pg.waitForTimeout(300);
await pg.evaluate(()=>{ selected='s'; renderCards(); }); await pg.selectOption('#pr-s',p1); await pg.waitForTimeout(300);
await pg.evaluate(()=>{ selected='b'; renderCards(); }); await pg.selectOption('#pr-b',p2); await pg.waitForTimeout(300);
console.log(tag,'status Baggetorp:',await pg.$eval('#cards fieldset.fs:has(legend:text("Vägen")) p',e=>e.textContent));
await pg.evaluate(()=>{ openTab='ansl'; renderTabs(); }); await pg.waitForTimeout(400);
console.log(tag,'steg 4:',await pg.$$eval('.anslrad',x=>x.map(e=>e.innerText.replace(/\n/g,' / ')).join(' || ')));
console.log(tag,'resultat:',await pg.evaluate(()=>calc().rows.map(r=>r.p.namn+' '+r.d.toFixed(3)+' km '+r.disp+'%').join(', ')));
await pg.evaluate(()=>{ openTab='vag'; renderTabs(); }); await pg.waitForTimeout(400);
console.log(tag,'punktlista efter:',await pg.$$eval('.punktrad small',x=>x.map(e=>e.textContent).join(' || ')));
if(tag==='m'){ await (await pg.$('#punktLista')).screenshot({path:'/tmp/vagtest/npunkt.png'}); }
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
await ctx.close();}
await b.close();})();
