const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:800}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin&img=1');await pg.waitForTimeout(1300);
for(const pgn of ['start','styrelse','dokument']){ await pg.click(`.navtab[data-page=${pgn}]`); await pg.waitForTimeout(300);
 const r=await pg.evaluate(p=>{const t=document.querySelector('.topbar').getBoundingClientRect().bottom, w=document.querySelector('#page-'+p+' .subwrap').getBoundingClientRect(); return Math.round(w.top-t)+'/'+Math.round(w.height);},pgn);
 console.log(tag,pgn,'avstånd/höjd',r); await pg.screenshot({path:`/tmp/vagtest/top-${pgn}-${tag}.png`}); }
await ctx.close();}
await b.close();})();
