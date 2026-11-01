const {chromium,devices}=require('playwright'); const fs=require('fs');
const cfg=JSON.parse(fs.readFileSync(process.argv[2]));
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[{...devices['iPhone SE']},'se'],[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html?m=admin');await pg.waitForTimeout(1200);
cfg.schablon.utdebitering="20000"; cfg.props[0].andelNu="12,5";
await pg.evaluate(c=>{ applyRemote(c); },cfg); await pg.waitForTimeout(200);
await pg.evaluate(()=>{openTab='schab';renderTabs();}); const r=await pg.evaluate(()=>{ const s=[...document.querySelectorAll('.schref .tbl')].map(x=>x.scrollWidth+'/'+x.parentElement.clientWidth).join(' '); console.log; const t=document.querySelector('#summary'), w=t.closest('.panel'); return {tab:t.scrollWidth, panel:w.clientWidth, page:document.documentElement.scrollWidth, vw:innerWidth, schref:s, heads:[...t.querySelectorAll('th')].filter(x=>getComputedStyle(x).display!=='none').map(x=>x.textContent)}; });
console.log(tag,JSON.stringify(r));
if(tag==='se'){ await (await pg.$('#summary')).screenshot({path:'/tmp/vagtest/vkmob-sum.png'}); await pg.evaluate(()=>{openTab="schab";renderTabs();}); await (await pg.$('#tab-schab')).screenshot({path:'/tmp/vagtest/vkmob-schab.png'}); }
await ctx.close();}
await b.close();})();
