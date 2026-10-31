const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:700}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort());
await pg.goto('http://localhost:8766/index.html?m=admin#styrelse');await pg.waitForTimeout(1500);
await pg.evaluate(()=>window.scrollTo(0,150)); await pg.waitForTimeout(200);
await pg.evaluate(()=>document.querySelector('#boardList .bcard').click()); await pg.waitForTimeout(300);
const a=await pg.evaluate(()=>scrollY); await pg.mouse.move(50,400); await pg.mouse.wheel(0,600); await pg.waitForTimeout(300); const b2=await pg.evaluate(()=>scrollY);
await pg.mouse.click(30,30); await pg.waitForTimeout(200);
console.log(tag,'öppnad vid',a,'efter scrollförsök',b2,'dialog kvar öppen',await pg.$$eval('dialog[open]',x=>x.length),'sida',await pg.evaluate(()=>location.hash));
await pg.keyboard.press('Escape'); await pg.waitForTimeout(200); await pg.mouse.wheel(0,100); await pg.waitForTimeout(300); console.log(' efter stängning scroll fungerar:',await pg.evaluate(()=>scrollY));
await ctx.close();}
await b.close();})();
