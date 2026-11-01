const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message));
await pg.goto('http://localhost:8766/?m=admin&super=1'); await pg.waitForTimeout(1400);
for(const p of ['start','medlemmar','styrelse','moten','dokument','arenden']){
 await pg.evaluate(p=>document.querySelector('.navtab[data-page='+p+']').click(),p); await pg.waitForTimeout(350);
 const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(sw) console.log(tag,p,'SIDSCROLL');
 if(tag==='m') await pg.screenshot({path:`/tmp/vagtest/en-${p}.png`});
}
if(tag==='m'){ await pg.evaluate(()=>document.querySelector('.navtab[data-page=start]').click()); await pg.waitForTimeout(200);
  await pg.evaluate(()=>document.querySelector('#news [data-act=edit]').click()); await pg.waitForTimeout(200); await (await pg.$('#news .item')).screenshot({path:'/tmp/vagtest/en-edit.png'}); }
await ctx.close();}
await b.close();})();
