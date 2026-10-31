const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [m,opt,tag] of [['admin',devices['Pixel 7'],'am'],['medlem&vag=1',{viewport:{width:1280,height:900}},'vd']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m);await pg.waitForTimeout(1300);
if(m==='admin'){ await pg.click('.navtab[data-page=styrelse]'); await pg.click('[data-st=atg]'); await pg.click('#addAtg'); }
else { await pg.click('#kontoBtn'); await pg.waitForTimeout(400); await pg.click('#kMina'); await pg.waitForTimeout(200); await pg.click('#addMinaAtg'); }
await pg.waitForTimeout(200);
await pg.fill('#aU','Rensa diken');
await pg.click('.ansv-opt:has-text("Hela styrelsen")'); await pg.click('.ansv-opt:has-text("Bo Ström")');
await pg.click('#aAnnan'); await pg.fill('#aAn','Grävare Gustav'); await pg.fill('#aAe','Gustav@Ex.se'); await pg.click('#aAnOk');
await pg.screenshot({path:`/tmp/vagtest/multi-dlg-${tag}.png`});
await pg.click('#aOk'); await pg.waitForTimeout(300);
if(m==='admin'){ console.log(tag,'chips:',await pg.$$eval('#atgList .item:has-text("Rensa diken") .atg-who',x=>x.map(e=>e.textContent))); await pg.screenshot({path:`/tmp/vagtest/multi-${tag}.png`});
  await pg.click('#atgList .item:has-text("Rensa diken") [data-atgedit]'); await pg.waitForTimeout(200); console.log(' förvalda:',await pg.$$eval('[data-ansv]:checked',x=>x.map(e=>JSON.parse(e.dataset.ansv).namn))); }
else console.log(tag,'rpc:',JSON.stringify(await pg.evaluate(()=>window.__lastM)));
await ctx.close();}
await b.close();})();
