const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [m,opt,tag] of [['admin',devices['Pixel 7'],'am'],['medlem&vag=1',devices['Pixel 7'],'mm'],['admin',{viewport:{width:1280,height:900}},'ad']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m);await pg.waitForTimeout(1500);
await pg.screenshot({path:`/tmp/vagtest/mk-start-${tag}.png`});
console.log(tag,'badge:',await pg.$eval('#kontoBadge',e=>e.hidden?'dold':e.textContent));
await pg.click('#kontoBtn'); await pg.waitForTimeout(500);
console.log(' konto-rader:',await pg.$$eval('.kontodlg .krow strong',x=>x.map(e=>e.textContent.trim()).join(' | ')));
await pg.screenshot({path:`/tmp/vagtest/mk-konto-${tag}.png`});
if(await pg.$('#kMina')){ await pg.click('#kMina'); await pg.waitForTimeout(300); console.log(' mina rader:',await pg.$$eval('.minadlg .minarow',x=>x.length)); await pg.screenshot({path:`/tmp/vagtest/mk-mina-${tag}.png`}); await pg.click('.minadlg button[value=close]'); }
await pg.click('#kKont'); await pg.waitForTimeout(300);
const hasF=await pg.$('#kuF'); if(hasF) await pg.selectOption('#kuF',{index:1});
await pg.fill('#kuN','Test Person'); await pg.fill('#kuT','070-111'); await pg.screenshot({path:`/tmp/vagtest/mk-kont-${tag}.png`});
await pg.click('#kuOk'); await pg.waitForTimeout(300); console.log(' rpc:',JSON.stringify(await pg.evaluate(()=>window.__kont)));
await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
await pg.click('.navtab[data-page=medlemmar]'); await pg.waitForTimeout(200);
console.log(' memMine synlig:',await pg.isVisible('#memMine'),'kort-höjd:',await pg.$eval('.mcard',e=>Math.round(e.getBoundingClientRect().height)));
await pg.screenshot({path:`/tmp/vagtest/mk-mem-${tag}.png`});
await ctx.close();}
await b.close();})();
