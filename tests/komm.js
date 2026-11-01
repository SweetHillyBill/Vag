const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [m,opt,tag] of [['medlem',devices['Pixel 7'],'m'],['admin',{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m);await pg.waitForTimeout(1500);
console.log(tag,'knapp:',await pg.$eval('#news [data-kommtoggle]',e=>e.textContent));
await pg.click('#news [data-kommtoggle]'); await pg.waitForTimeout(200);
await pg.fill('#news [data-kommtext]','Ser bra ut, tack!'); await pg.click('#news [data-kommsend]'); await pg.waitForTimeout(400);
console.log(' lista:',await pg.$$eval('#news .kc',x=>x.map(e=>e.innerText.replace(/\s+/g,' '))), 'knapp:',await pg.$eval('#news [data-kommtoggle]',e=>e.textContent));
console.log(' ta bort-knappar:',await pg.$$eval('#news [data-kommdel]',x=>x.length));
await pg.screenshot({path:`/tmp/vagtest/komm-${tag}.png`});
await ctx.close();}
await b.close();})();
