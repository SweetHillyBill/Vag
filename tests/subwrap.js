const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const w of [360,390,768,1280]){ const pg=await b.newPage({viewport:{width:w,height:800},deviceScaleFactor:2});
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort());
await pg.goto('http://localhost:8766/index.html?m=admin');await pg.waitForTimeout(1300);
for(const p of ['start','styrelse','dokument']){ await pg.evaluate(p=>document.querySelector(`.navtab[data-page=${p}]`).click(),p); await pg.waitForTimeout(200);
 const r=await pg.evaluate(p=>{ const s=document.querySelector(`#page-${p} .subnav`); const vw=document.documentElement.clientWidth; const bs=[...s.querySelectorAll('.chipbtn')].filter(x=>x.offsetParent); const rader=new Set(bs.map(x=>Math.round(x.getBoundingClientRect().top))).size; const utanfor=bs.filter(x=>x.getBoundingClientRect().right>vw+1||x.scrollWidth>x.clientWidth+1).map(x=>x.textContent.trim()); return {rader,utanfor,scroll:s.scrollWidth>s.clientWidth}; },p);
 console.log(w,p,JSON.stringify(r)); if(p==='styrelse') await (await pg.$('#page-styrelse .subwrap')).screenshot({path:`/tmp/vagtest/subwrap-${w}.png`}); }
await pg.close(); }
await b.close();})();
