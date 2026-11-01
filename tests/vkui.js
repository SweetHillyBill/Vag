const {chromium,devices}=require('playwright'); const fs=require('fs');
const cfg=JSON.parse(fs.readFileSync(process.argv[2]));
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:820,height:1180}},'t'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html?m=admin');await pg.waitForTimeout(1200);
await pg.evaluate(c=>{ applyRemote(c); },cfg); await pg.waitForTimeout(200);
await pg.evaluate(()=>{ openTab='edit'; renderTabs(); selected="hyt21"; editProp="hyt21"; renderCards(); renderSummary(); });
await pg.click('[data-addsk="hyt21"]'); await pg.waitForTimeout(100);
const sid=await pg.evaluate(()=>state.props.find(p=>p.id==="hyt21").skiften.slice(-1)[0].id);
await pg.fill(`#skaker-${sid}`,'6'); await pg.fill(`#skbete-${sid}`,'4');
await pg.selectOption(`#skplats-${sid}`,'inom'); await pg.waitForTimeout(150);
await pg.click(`label[for="sk_${sid}-hyt21-B"]`); 
await pg.fill('#boxar-hyt21','3'); await pg.fill('#hastEgna-hyt21','1'); await pg.press('#hastEgna-hyt21','Tab'); await pg.waitForTimeout(150);
await pg.click('[data-addrad="hyt21"]'); await pg.waitForTimeout(100);
await pg.keyboard.type('Gårdsförsäljning');
const rid=await pg.evaluate(()=>state.props.find(p=>p.id==="hyt21").rader.slice(-1)[0].id);
await pg.fill(`#rantal-${rid}`,'5'); await pg.fill(`#rdagar-${rid}`,'100');
await pg.evaluate(()=>renderSummary());
console.log(tag, await pg.$eval('.calc',e=>e.textContent));
console.log(tag,'varningar:',await pg.$$eval('#vkn-hyt21 .notice',x=>x.map(e=>e.textContent)));
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log(tag,'sidled scroll:',sw);
await (await pg.$('#cards')).screenshot({path:`/tmp/vagtest/vkui-${tag}.png`});
if(tag==='d'){ await pg.evaluate(()=>{ openTab="schab"; renderTabs(); }); await (await pg.$('#tab-schab')).screenshot({path:'/tmp/vagtest/vkui-schab.png'}); }
await ctx.close();}
await b.close();})();
