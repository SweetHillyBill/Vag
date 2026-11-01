const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(400);
const fall=async(gard,namn)=>{
 await pg.evaluate(g=>{ applyRemote({props:[{id:"h",namn:"Gården",typ:"jord",perm:1,skiften:[{id:"s1",namn:"Åker och bete",aker:20,bete:10,plats:"bc",fu:true,route:[]}]}],
  karta:{vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]}],punkter:[{id:"u",typ:"utfart",ll:[59.05,16.565]}]}}); openTab='fast'; selected="h"; renderTabs(); renderCards(); renderSummary(); },gard);
 await pg.waitForTimeout(200);
 await pg.selectOption('#skplats-s1','jamn'); await pg.waitForTimeout(300);
 const st0=await pg.$eval('.skstatus',e=>e.innerText.replace(/\n/g,' / '));
 await pg.click('[data-kartmal="h|sk:s1"]'); await pg.waitForTimeout(500);
 const akt=await pg.$eval('#anslAktiv',e=>e.textContent);
 await pg.evaluate(g=>{ kartaTest.satPunkt("h|route",g); kartaTest.satPunkt("h|sk:s1",[59.05,16.555]); kartaTest.satPunkt("h|sk:s1:slut",[59.05,16.545]); },gard); await pg.waitForTimeout(200);
 const lista=await pg.$$eval('.anslrad',x=>x.map(e=>e.innerText.split('\n')[0]).join(' | '));
 await pg.evaluate(()=>{ openTab='fast'; renderTabs(); renderCards(); }); await pg.waitForTimeout(300);
 const st=await pg.$eval('.skstatus',e=>e.innerText.replace(/\n/g,' / '));
 const rad=await pg.evaluate(()=>calcText(calc().rows[0]).split('\n').filter(x=>/Transporter/.test(x)).join(''));
 console.log(tag,namn,'\n  före:',st0,'\n  aktiv:',akt,'\n  lista:',lista,'\n  efter:',st,'\n  ',rad);
 if(tag==='m'&&namn==='utanför') await (await pg.$('.skifte')).screenshot({path:'/tmp/vagtest/jamn.png'});
};
await fall([59.05,16.565],'utanför');   // gården vid utfarten, sträckan längre in
await fall([59.05,16.55],'inne');       // gården mitt på sträckan
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
await ctx.close();}
await b.close();})();
