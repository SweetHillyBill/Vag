const {chromium,devices}=require('playwright'); const fs=require('fs');
const cfg=JSON.parse(fs.readFileSync(process.argv[2]));
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage(); await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html?m=admin');await pg.waitForTimeout(1200);
await pg.evaluate(c=>{ applyRemote(c); },cfg); await pg.waitForTimeout(200);
await pg.evaluate(()=>{ selected="bag31"; renderCards(); renderSummary(); }); await pg.waitForTimeout(100);
console.log(tag,'Baggetorp 3:1 typ:',await pg.$eval('[data-typ]',e=>e.value),'\n',await pg.$eval('.calc',e=>e.textContent));
if(tag==='d'){
 await pg.evaluate(()=>{ openTab='edit'; renderTabs(); }); await pg.click('#addProp'); await pg.waitForTimeout(150);
 const id=await pg.evaluate(()=>selected);
 for(const t of ['perm','frit','flerfam','smahusbr','kombi','jord','skog','obebyggd','teknisk','smabat','natur','jarnvag','egen','annan']){
   await pg.selectOption(`#typ-${id}`,t); await pg.waitForTimeout(80);
   if(t==='perm'||t==='frit'||t==='flerfam'||t==='smahusbr') await pg.evaluate(id=>{ const p=state.props.find(x=>x.id===id); p.route=['H']; },id);
   if(t==='kombi'){ await pg.fill(`#akerHa-${id}`,'2'); await pg.fill(`#beteHa-${id}`,'3'); await pg.fill(`#hastInack-${id}`,'4'); await pg.fill(`#skogHa-${id}`,'2'); }
   if(t==='jord'){ await pg.fill(`#akerHa-${id}`,'25'); await pg.fill(`#beteHa-${id}`,'5'); await pg.check(`#interna-${id}`); await pg.selectOption(`#mjolk-${id}`,'tor'); }
   if(t==='egen') await pg.fill(`#egenTon-${id}`,'3000');
   await pg.evaluate(()=>{ renderSummary(); });
   const fält=await pg.$$eval('#cards fieldset.fs legend',x=>x.map(e=>e.textContent).join('/'));
   const c=await pg.$eval('.calc',e=>e.textContent.split('\n').slice(0,4).join(' | '));
   console.log(' ',t.padEnd(9),'['+fält+']','→',c.slice(0,230));
   if(t==='jord') await pg.screenshot({path:'/tmp/vagtest/vk-jord.png',fullPage:true});
 }
 await pg.evaluate(()=>{ openTab="schab"; renderTabs(); }); await pg.waitForTimeout(100);
 await (await pg.$('#tab-schab')).screenshot({path:'/tmp/vagtest/vk-schab.png'});
} else { await pg.evaluate(()=>{ editProp="bag31"; renderCards(); renderSummary(); }); await pg.screenshot({path:'/tmp/vagtest/vk-m.png',fullPage:true}); }
await ctx.close();}
await b.close();})();
