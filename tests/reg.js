const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin');await pg.waitForTimeout(1300);
await pg.click('.navtab[data-page=medlemmar]'); console.log(tag,'knappar på Medlemmar:',await pg.$$eval('#page-medlemmar .pghead button',x=>x.filter(e=>e.offsetParent).map(e=>e.textContent.trim())));
await pg.screenshot({path:`/tmp/vagtest/reg-mem-${tag}.png`});
await pg.click('.navtab[data-page=styrelse]'); await pg.click('[data-st=reg]'); await pg.waitForTimeout(200);
console.log(' stat:',await pg.$eval('#regStat',e=>e.innerText.replace(/\s+/g,' ')));
await pg.screenshot({path:`/tmp/vagtest/reg-${tag}.png`});
await pg.click('#addMember'); await pg.waitForTimeout(300);
console.log(' efter ny medlem: sida',await pg.evaluate(()=>location.hash),'dialog öppen',await pg.$eval('#memDlg',d=>d.open),'fält',await pg.$$eval('#memDlg input',x=>x.length));
await ctx.close();}
await b.close();})();
