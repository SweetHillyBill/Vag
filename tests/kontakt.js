const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const m of ['admin','medlem']){ const ctx=await b.newContext(devices['Pixel 7']);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m);await pg.waitForTimeout(1300);
if(m==='admin'){ await pg.click('.navtab[data-page=styrelse]'); await pg.click('[data-st=atg]'); await pg.click('.navtab[data-page=start]'); }
await pg.click('[data-stab=led]'); await pg.waitForTimeout(300);
console.log(m,'sida',await pg.evaluate(()=>location.hash),'ledamöter synliga',await pg.isVisible('#st-led'),'åtgärder dolda',!(await pg.isVisible('#st-atg')),'aktiv flik',await pg.$eval('.subnav [data-st].on',e=>e.textContent).catch(()=>'-'));
await ctx.close();}
await b.close();})();
