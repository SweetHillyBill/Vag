const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ applyRemote({props:[{id:"h",namn:"Hytternäs",typ:"jord",perm:2,skiften:[{id:"s1",namn:"Skifte 1",aker:8,bete:22,plats:"inom",fu:true,route:[]}]}],
  karta:{vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]},{id:"g",pts:[[59.05,16.555],[59.056,16.555]]}],punkter:[{id:"u",typ:"utfart",ll:[59.05,16.565]},{id:"a",typ:"anslutning",prop:"h",galler:"route",ll:[59.05,16.541]}]}}); openTab='fast'; selected="h"; renderTabs(); renderCards(); renderSummary(); });
await pg.waitForTimeout(300);
console.log(tag,'status före:',await pg.$eval('.skstatus',e=>e.innerText.replace(/\n/g,' / ')));
console.log(tag,'varning:',await pg.$eval('#vkn-h',e=>e.innerText.slice(0,120)));
if(tag==='m') await (await pg.$('.skifte')).screenshot({path:'/tmp/vagtest/skifte-fore.png'});
await pg.click('[data-kartmal]'); await pg.waitForTimeout(500);
console.log(tag,'steg',await pg.evaluate(()=>openTab),'aktiv:',await pg.$eval('#anslAktiv',e=>e.textContent));
await pg.evaluate(()=>kartaTest.satPunkt("h|sk:s1",[59.0558,16.555])); await pg.waitForTimeout(200);
await pg.evaluate(()=>{ openTab='fast'; renderTabs(); renderCards(); }); await pg.waitForTimeout(300);
console.log(tag,'status efter:',await pg.$eval('.skstatus',e=>e.innerText.replace(/\n/g,' / ')));
console.log(tag,'uträkning:',await pg.evaluate(()=>calcText(calc().rows[0]).split('\n').filter(x=>/gården–/.test(x)).join('')));
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
if(tag==='m') await (await pg.$('.skifte')).screenshot({path:'/tmp/vagtest/skifte-efter.png'});
await ctx.close();}
await b.close();})();
