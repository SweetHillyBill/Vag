const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:700}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=medlem#medlemmar');await pg.waitForTimeout(1500);
console.log(tag,'sök synlig:',await pg.isVisible('#memSearch'),'avatarer:',await pg.$$eval('.mcard .avatar',x=>x.length));
await pg.screenshot({path:`/tmp/vagtest/mem3-${tag}.png`}); await ctx.close();}
await b.close();})();
