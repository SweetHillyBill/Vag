const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag,m] of [[devices['Pixel 7'],'m','admin'],[{viewport:{width:1280,height:900}},'d','admin'],[devices['Pixel 7'],'mm','medlem']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html?m='+m);await pg.waitForTimeout(2000);
console.log(tag,'status:',await pg.$eval('#status',e=>e.textContent),'readonly synlig:',await pg.isVisible('#readonly'),'tabs:',await pg.$$eval('.tabs .tab',x=>x.filter(e=>!e.hidden).map(e=>e.textContent)), 'pdf-knapp:',await pg.isVisible('#pdf'));
await pg.screenshot({path:`/tmp/vagtest/vk2-${tag}.png`});
await ctx.close();}
await b.close();})();
