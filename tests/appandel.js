const {chromium,devices}=require('playwright'); const fs=require('fs');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
const proj=JSON.parse(fs.readFileSync('/tmp/vagtest/fl-projekt.json'));
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext({...opt,acceptDownloads:true});const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route(/tile\.openstreetmap\.org/,rt=>rt.fulfill({body:png,contentType:'image/png'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message));
await pg.goto('http://localhost:8766/?m=admin&super=1'); await pg.waitForTimeout(1300);
await pg.evaluate(()=>document.querySelector('.navtab[data-page=admin]')?document.querySelector('.navtab[data-page=admin]').click():(location.hash='admin')); await pg.waitForTimeout(300);
await pg.evaluate(()=>{ location.hash='admin'; }); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ const s=document.querySelector('[data-fold="a-andel"]'); if(s&&!s.classList.contains('open')) s.firstElementChild.click(); });
const [dl]=await Promise.all([pg.waitForEvent('download'),pg.evaluate(()=>document.getElementById('andelExport').click())]); const f='/tmp/vagtest/app-fast.json'; await dl.saveAs(f); if(tag==='d') console.log('export',fs.readFileSync(f,'utf8').slice(0,300));
await pg.setInputFiles('#andelFil',{name:'p.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(proj))}); await pg.waitForTimeout(200);
console.log(tag,'förhands',await pg.$eval('#andelForhands',e=>e.innerText.replace(/\n/g,' | ')));
await pg.evaluate(()=>document.getElementById('andelPubl').click()); await pg.waitForTimeout(400);
console.log(tag,'efter',await pg.$eval('#andelForhands',e=>e.innerText));
// visa för medlem: simulera snapshot
await pg.evaluate(()=>document.querySelector('.navtab[data-page=dokument]').click()); await pg.waitForTimeout(200);
await pg.evaluate(()=>document.querySelector('[data-dk="andelstal"]').click()); await pg.waitForTimeout(800);
console.log(tag,'dok',(await pg.$eval('#andelInnehall',e=>e.innerText)).slice(0,250).replace(/\n/g,' | '));
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidscroll',sw,'karta synlig',await pg.$eval('#andelKartaWrap',e=>!e.hidden));
if(tag==='m') await pg.screenshot({path:'/tmp/vagtest/app-andel-m.png',fullPage:true});
await ctx.close();}
await b.close();})();
