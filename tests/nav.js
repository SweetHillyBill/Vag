const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.evaluate(()=>localStorage.removeItem('andelstal_fall')); await pg.waitForTimeout(300);
await pg.evaluate(()=>{ applyRemote({props:[{id:"a",namn:"Asplunda",typ:"frit",frit:1},{id:"b",namn:"Baggetorp",typ:"jord",perm:1,skiften:[{id:"s",namn:"Skifte 1",aker:20,bete:0,plats:"bc",fu:true,route:[]}]},{id:"c",namn:"Grannas",typ:"kombi",perm:1,beteHa:1,hastEgna:6}],
 karta:{vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]}],punkter:[{id:"u",typ:"utfart",ll:[59.05,16.565]},{id:"p1",typ:"anslutning",prop:"a",galler:"route",ll:[59.05,16.56]},{id:"p2",typ:"anslutning",prop:"b",galler:"route",ll:[59.05,16.55]}]}}); openTab='fast'; selected="a"; renderTabs(); renderCards(); });
await pg.waitForTimeout(300);
const nav=async()=>pg.evaluate(()=>[document.getElementById('stegForra').hidden?'-':document.getElementById('stegForra').textContent, document.getElementById('stegNasta').textContent, selected, openTab].join(' | '));
console.log(tag,'1',await nav());
await pg.click('#stegNasta'); await pg.waitForTimeout(200); console.log(tag,'2',await nav());
console.log(tag,'  delar:',await pg.$$eval('#cards fieldset.fs',x=>x.map(f=>f.querySelector('legend').textContent+(f.classList.contains('stangd')?'(stängd)':'(öppen)')).join(', ')));
await pg.click('#stegNasta'); await pg.waitForTimeout(200); console.log(tag,'3',await nav());
await pg.click('#stegForra'); await pg.waitForTimeout(200); console.log(tag,'4',await nav());
await pg.click('#stegNasta'); await pg.click('#stegNasta'); await pg.waitForTimeout(400); console.log(tag,'5',await nav());
// fäll ihop/upp
await pg.evaluate(()=>{ openTab='fast'; selected='b'; renderTabs(); renderCards(); }); await pg.waitForTimeout(200);
await pg.click('#cards fieldset.fs legend:text("Skog")'); await pg.waitForTimeout(100);
console.log(tag,'  skog efter klick:',await pg.$eval('#cards fieldset.fs:has(legend:text("Skog"))',f=>f.classList.contains('stangd')?'stängd':'öppen'));
if(tag==='m') await (await pg.$('#cards')).screenshot({path:'/tmp/vagtest/nav-kort.png'});
await pg.evaluate(()=>{ openTab='ansl'; renderTabs(); }); await pg.waitForTimeout(500);
await pg.evaluate(()=>kartaTest.map.setView([59.05,16.553],14)); await pg.waitForTimeout(300);
console.log(tag,'  namn synliga zoom14:',await pg.$$eval('.kp b',x=>x.filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent).join(', ')));
await pg.evaluate(()=>kartaTest.map.setZoom(16)); await pg.waitForTimeout(500);
console.log(tag,'  namn synliga zoom16:',await pg.$$eval('.kp b',x=>x.filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent).join(', ')));
if(tag==='m'){ await pg.evaluate(()=>kartaTest.map.setZoom(14)); await pg.waitForTimeout(400); await (await pg.$('#karta')).screenshot({path:'/tmp/vagtest/nav-karta.png'}); }
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw);
await ctx.close();}
await b.close();})();
