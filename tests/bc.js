const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [m,opt,tag] of [['medlem',devices['Pixel 7'],'m'],['admin',{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m+'#styrelse');await pg.waitForTimeout(1200);
const el=await pg.$('#st-led'); await el.screenshot({path:`/tmp/vagtest/bc-${tag}.png`});
console.log(tag,'höjder:',await pg.$$eval('#boardList .bcard',x=>x.map(e=>Math.round(e.getBoundingClientRect().height)).join(',')));
await pg.click('#boardList .bcard'); await pg.waitForTimeout(200); await pg.screenshot({path:`/tmp/vagtest/bc-dlg-${tag}.png`});
if(m==='admin'){ await pg.click('#bpEdit'); await pg.waitForTimeout(200); console.log('edit-form:',await pg.$$eval('#boardList .item input',x=>x.length)); await pg.click('#boardList [data-act=done]'); console.log('tillbaka:',await pg.$$eval('#boardList .bcard',x=>x.length)); }
await ctx.close();}
await b.close();})();
