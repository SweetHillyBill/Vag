const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const sup of ['1','0']){
const pg=await b.newPage({viewport:{width:1280,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin&super='+sup+'#admin');await pg.waitForTimeout(1500);
console.log('super='+sup,'rader:',await pg.$$eval('.acc-row',x=>x.map(r=>r.querySelector('strong').textContent+':'+(r.querySelector('select')?'[val '+[...r.querySelectorAll('option')].map(o=>o.value).join('/')+']':r.querySelector('.acc-fast').textContent)).join(' | ')));
console.log(' ny-roll val:',await pg.$$eval('#aRoll option',x=>x.map(o=>o.value).join('/')));
await pg.click('#kontoBtn'); await pg.waitForTimeout(300); console.log(' konto:',await pg.$eval('.kontodlg .hint',e=>e.textContent)); await pg.keyboard.press('Escape');
await pg.click('.navtab[data-page=styrelse]'); await pg.click('#boardList .bcard:has-text("Leif")'); await pg.waitForTimeout(400);
console.log(' kort:',await pg.$eval('.adminrad',e=>e.innerText.replace(/\s+/g,' ')));
if(sup==='1') await pg.screenshot({path:'/tmp/vagtest/sup-acc.png'});
await pg.close();}
await b.close();})();
