const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [m,w] of [['admin',1280],['admin',390],['medlem&vag=1',390]]){
const pg=await b.newPage({viewport:{width:w,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m);await pg.waitForTimeout(1000);
if(m==='admin'){ await pg.click('.navtab[data-page=styrelse]'); await pg.click('[data-st=atg]'); await pg.click('#addAtg'); }
else { await pg.click('#minaAtg button:has-text("Lägg till"), #minaAtg .add, #minaAtg button').catch(e=>console.log('no btn',e.message)); }
await pg.waitForTimeout(200);
console.log(m,w,'opts:',await pg.$$eval('#aA option',x=>x.map(o=>o.value).join('|')));
await pg.fill('#aU','Snöröjning plan'); await pg.selectOption('#aA','__g:styrelse'); await pg.click('#aOk'); await pg.waitForTimeout(400);
const saved=await pg.evaluate(()=>window.__lastG||JSON.stringify(window.__calls&&window.__calls.filter(c=>String(c[0]||c.path||'').includes('atgarder')).slice(-1)));
console.log('saved:',JSON.stringify(saved).slice(0,400));
console.log('badges:',await pg.$$eval('.atg-who.grp',x=>x.map(e=>e.textContent)));
await pg.screenshot({path:`/tmp/vagtest/grp-${m.slice(0,5)}-${w}.png`});
await pg.close();}
await b.close();})();
