const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:800}},'d'],[{viewport:{width:820,height:1180}},'t']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin&img=1#styrelse');await pg.waitForTimeout(1500);
await pg.screenshot({path:`/tmp/vagtest/sub0-${tag}.png`});
await pg.mouse.wheel(0,600); await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const t=document.querySelector('.topbar').getBoundingClientRect(), s=document.querySelector('#page-styrelse .subwrap').getBoundingClientRect(); return {tb:Math.round(t.bottom), sub:Math.round(s.top), y:scrollY};});
console.log(tag,JSON.stringify(r));
await pg.screenshot({path:`/tmp/vagtest/sub-${tag}.png`});
await ctx.close();}
await b.close();})();
