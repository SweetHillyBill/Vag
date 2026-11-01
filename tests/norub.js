const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log(tag,'ERR',e.message));
for(const p of ['medlemmar','styrelse','moten','dokument','arenden','admin']){
 if(p==='medlemmar'){ await pg.goto('http://localhost:8766/?m=admin&super=1'); await pg.waitForTimeout(1200);} await pg.evaluate(p=>{ const t=document.querySelector('.navtab[data-page='+p+']'); if(t) t.click(); else location.hash=p; },p); await pg.waitForTimeout(400);
 const r=await pg.evaluate(p=>{const el=document.getElementById('page-'+p); return {synlig:!el.hidden, h1:el.querySelectorAll('h1').length, sw:document.documentElement.scrollWidth>innerWidth}},p);
 console.log(tag,p,JSON.stringify(r));
 if(tag==='m'&&(p==='styrelse'||p==='medlemmar')) await pg.screenshot({path:`/tmp/vagtest/norub-${p}.png`});
 if(tag==='d'&&p==='arenden') await pg.screenshot({path:`/tmp/vagtest/norub-arenden-d.png`});
}
await ctx.close();}
await b.close();})();
