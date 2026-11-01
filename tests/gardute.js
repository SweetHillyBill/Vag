const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ applyRemote({props:[{id:"h",namn:"Storgården",typ:"jord",perm:1,anstallda:2,skiften:[{id:"s1",namn:"Åkern vid sjön",aker:12,bete:0,plats:"bc",fu:true,route:[]},{id:"s2",namn:"Betet",aker:0,bete:6,plats:"bc",fu:true,route:[]}]}],
  karta:{vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]}],punkter:[{id:"u",typ:"utfart",ll:[59.05,16.565]}]}}); openTab='fast'; selected="h"; renderTabs(); renderCards(); renderSummary(); });
await pg.waitForTimeout(300);
await pg.click('#cards fieldset.fs legend:text("Gården")'); await pg.check('#gardUtanfor-h'); await pg.waitForTimeout(400);
console.log(tag,'fält:',await pg.$$eval('#cards fieldset.fs legend',x=>x.map(e=>e.textContent).join(' / ')));
console.log(tag,'skiftesval:',await pg.$eval('#skplats-s1',e=>[...e.options].map(o=>o.text+(o.selected?'*':'')).join(' | ')));
await pg.evaluate(()=>{ openTab='ansl'; renderTabs(); }); await pg.waitForTimeout(500);
console.log(tag,'lista:',await pg.$$eval('.anslrad',x=>x.map(e=>e.innerText.split('\n')[0]).join(' | ')));
await pg.evaluate(()=>{ kartaTest.satPunkt("h|route",[59.05,16.565]); kartaTest.satPunkt("h|sk:s1",[59.05,16.55]); kartaTest.satPunkt("h|sk:s2",[59.05,16.541]); }); await pg.waitForTimeout(200);
console.log(tag,'uträkning:\n'+await pg.evaluate(()=>calcText(calc().rows[0])));
if(tag==='m'){ await pg.evaluate(()=>{ openTab='fast'; renderTabs(); renderCards(); }); await pg.waitForTimeout(300); await (await pg.$('#cards')).screenshot({path:'/tmp/vagtest/gardute.png'}); }
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
await ctx.close();}
await b.close();})();
