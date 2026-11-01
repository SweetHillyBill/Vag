const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin&img=1');await pg.waitForTimeout(1500);
await pg.evaluate(()=>document.querySelector('#adminBtn').click()); await pg.waitForTimeout(500);
const st=()=>pg.$$eval('#page-admin [data-fold]',x=>x.map(p=>p.firstElementChild.textContent.trim().slice(0,22)+':'+(p.classList.contains('open')?'öppen':'stängd')));
console.log(tag,await st());
await pg.screenshot({path:`/tmp/vagtest/fold-${tag}.png`});
await pg.evaluate(()=>document.querySelector('#heroSet > h2').click()); await pg.waitForTimeout(200);
console.log(' efter klick startbild:',(await st())[1]);
await pg.evaluate(()=>document.querySelector('#backupBtn').click()); await pg.waitForTimeout(200);
console.log(' knapp i rubrik fällde inte:',(await st())[4]);
await pg.reload(); await pg.waitForTimeout(1500); await pg.evaluate(()=>document.querySelector('#adminBtn').click()); await pg.waitForTimeout(300);
console.log(' efter omladdning startbild:',(await st())[1],' accessMgr rubrik:',await pg.$eval('#accessMgr > :first-child',e=>e.tagName+' '+e.getAttribute('role')));
await pg.evaluate(()=>document.querySelector('.navtab[data-page=start]').click()); await pg.waitForTimeout(200);
console.log(' om vägen:',await pg.$eval('[data-fold=omvagen]',p=>p.classList.contains('open')));
await ctx.close();}
await b.close();})();
