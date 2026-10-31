const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route(/icon\.png\?token=t&f=bild\.jpg/,rt=>rt.fulfill({path:'/tmp/vagtest/hero.jpg',contentType:'image/jpeg'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin&img=1');await pg.waitForTimeout(1500);
await pg.click('#adminBtn'); await pg.waitForTimeout(500);
const r=await (await pg.$('#heroImg')).boundingBox();
await pg.mouse.move(r.x+r.width*0.81,r.y+r.height*0.33); await pg.mouse.down(); await pg.mouse.move(r.x+r.width*0.82,r.y+r.height*0.34); await pg.mouse.up(); await pg.waitForTimeout(800);
console.log(tag,'reglage',await pg.$eval('#heroX',e=>e.value),await pg.$eval('#heroY',e=>e.value),'header pos:',await pg.$eval('#welcome',e=>e.style.getPropertyValue('--hero-pos')));
await pg.locator('#heroSet').scrollIntoViewIfNeeded(); await pg.screenshot({path:`/tmp/vagtest/heropos-${tag}.png`});
await pg.evaluate(()=>window.scrollTo(0,0)); await pg.screenshot({path:`/tmp/vagtest/heropos-top-${tag}.png`,clip:{x:0,y:0,width:tag==='m'?412:1280,height:260}});
await ctx.close();}
await b.close();})();
