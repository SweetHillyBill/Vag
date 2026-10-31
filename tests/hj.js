const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [n,opt] of [['android',devices['Pixel 7']],['iphone',devices['iPhone 13']],['dator',{viewport:{width:1280,height:900}}]]){
const ctx=await b.newContext(opt); const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=medlem');await pg.waitForTimeout(3500);
console.log(n,'banner ?:',await pg.$$eval('#pushBanner:not([hidden]) [data-pushhjalp]',x=>x.length));
await pg.click('#kontoBtn'); await pg.waitForTimeout(400);
await pg.screenshot({path:`/tmp/vagtest/hj-konto-${n}.png`});
await pg.click('#kNotHjalp'); await pg.waitForTimeout(300);
console.log(n,'flik:',await pg.$eval('.hjalpdlg .chipbtn.on',e=>e.textContent));
await pg.screenshot({path:`/tmp/vagtest/hj-${n}.png`});
await pg.click('.hjalpdlg [data-h=dat]'); console.log('byt:',await pg.$eval('.hjalpdlg .hbody',e=>e.textContent.slice(0,40)));
await pg.click('.hjalpdlg button[value=close]'); await pg.waitForTimeout(200);
console.log('kvar dialoger:',await pg.$$eval('dialog[open]',x=>x.map(d=>d.className)));
await ctx.close();}
await b.close();})();
