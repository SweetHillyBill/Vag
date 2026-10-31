const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:800}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=medlem&img=1');await pg.waitForTimeout(1500);
await pg.screenshot({path:`/tmp/vagtest/qk0-${tag}.png`});
await pg.mouse.wheel(0,500); await pg.waitForTimeout(400); await pg.screenshot({path:`/tmp/vagtest/qk-${tag}.png`});
await pg.click('.subnav [data-ctype=fel]'); await pg.waitForTimeout(200); console.log(tag,'gick till:',location=await pg.evaluate(()=>location.hash));
await ctx.close();}
await b.close();})();
