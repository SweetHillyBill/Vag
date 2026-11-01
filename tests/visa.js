const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html'); await pg.evaluate(()=>localStorage.removeItem('andelstal_visa')); await pg.reload(); await pg.waitForTimeout(300);
await pg.evaluate(()=>{ applyRemote({props:[{id:"a",namn:"Asplunda",typ:"frit",frit:1},{id:"b",namn:"Baggetorp",typ:"skog",skogHa:40,skogEgen:true}],
 karta:{vagar:[{id:"v",pts:[[59.05,16.565],[59.05,16.54]]}],punkter:[{id:"u",typ:"utfart",ll:[59.05,16.565]},{id:"p1",typ:"anslutning",prop:"a",galler:"route",ll:[59.05,16.56]},{id:"p2",typ:"anslutning",prop:"b",galler:"route",ll:[59.05,16.55]},{id:"p3",typ:"anslutning",prop:"b",galler:"skog",ll:[59.05,16.545]}]}}); openTab='ansl'; renderTabs(); });
await pg.waitForTimeout(600);
const n=async()=>pg.evaluate(()=>[document.querySelectorAll('#karta .kp').length, document.querySelectorAll('#karta .ksegm').length].join(' punkter, ')+' bokstäver');
console.log(tag,'start',await n());
await pg.click('.kvisa-knapp'); await pg.waitForTimeout(100);
await pg.uncheck('[data-kvis="ansl"]'); await pg.waitForTimeout(150); console.log(tag,'utan anslutningar',await n());
await pg.uncheck('[data-kvis="skog"]'); await pg.waitForTimeout(150); console.log(tag,'utan skog',await n());
await pg.uncheck('[data-kvis="bokstav"]'); await pg.waitForTimeout(150); console.log(tag,'utan bokstäver',await n());
await pg.check('[data-kvis="namn"]'); await pg.waitForTimeout(150); console.log(tag,'namn synliga',await pg.$$eval('.kp b',x=>x.filter(e=>getComputedStyle(e).display!=='none').length));
if(tag==='m') await (await pg.$('#karta')).screenshot({path:'/tmp/vagtest/visa.png'});
await pg.reload(); await pg.waitForTimeout(800); console.log(tag,'efter omladdning',await n());
await ctx.close();}
await b.close();})();
