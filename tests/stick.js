const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1100}},'t'],[{viewport:{width:1280,height:700}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort());
await pg.goto('http://localhost:8766/index.html?m=admin&img=1');await pg.waitForTimeout(1500);
const ut=[];
for(const p of ['start','styrelse','dokument']){ await pg.evaluate(p=>{document.querySelector(`.navtab[data-page=${p}]`).click(); window.scrollTo(0,0);},p); await pg.waitForTimeout(250);
 const m=async()=>pg.evaluate(p=>{ const t=document.querySelector('.topbar').getBoundingClientRect().bottom, s=document.querySelector(`#page-${p} .subnav`).getBoundingClientRect().top; return Math.round(s-t); },p);
 const vila=await m(); await pg.evaluate(()=>window.scrollTo(0,400)); await pg.waitForTimeout(250); const fast=await m();
 ut.push(`${p}: vila ${vila} / scroll ${fast}`); }
console.log(tag,ut.join(' · '));
await pg.evaluate(()=>{document.querySelector('.navtab[data-page=styrelse]').click(); window.scrollTo(0,300);}); await pg.waitForTimeout(250);
await pg.screenshot({path:`/tmp/vagtest/stick-${tag}.png`,clip:{x:0,y:0,width:opt.viewport?opt.viewport.width:412,height:420}});
await ctx.close();}
await b.close();})();
