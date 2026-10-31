const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [m,opt,tag] of [['admin',{viewport:{width:1280,height:900}},'d'],['admin',devices['iPhone 13'],'m'],['medlem',devices['iPhone 13'],'mm'],['admin',{viewport:{width:820,height:1180}},'t']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m='+m);await pg.waitForTimeout(1200);
await pg.screenshot({path:`/tmp/vagtest/dok-nav-${tag}.png`});
await pg.click('.navtab[data-page=dokument]'); await pg.waitForTimeout(200);
if(m==='admin'&&tag==='d'){
  await pg.click('#dkAdd'); await pg.selectOption('#prKat','ekonomi'); await pg.fill('#prRubrik','Budget 2027');
  await pg.setInputFiles('#prFil',{name:'budget.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from('x')});
  await pg.click('#prOk'); await pg.waitForTimeout(300);
  await pg.click('#dkAdd'); await pg.fill('#prRubrik','Protokoll årsstämma'); await pg.setInputFiles('#prFil',{name:'p.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF')}); await pg.click('#prOk'); await pg.waitForTimeout(300);
  console.log('prot:',await pg.$$eval('#dkList h3',x=>x.map(e=>e.textContent)));
  await pg.click('[data-dk=ekonomi]'); console.log('ekonomi:',await pg.$$eval('#dkList h3',x=>x.map(e=>e.textContent)), await pg.$eval('#dkTitle',e=>e.textContent));
  console.log('uploads:',JSON.stringify(await pg.evaluate(()=>__calls.filter(c=>String(c[0]).startsWith('storage')))));
  await pg.click('[data-dk=lankar]'); await pg.click('#lnkAdd'); await pg.fill('#lnN','Test'); await pg.fill('#lnU','javascript:alert(1)'); await pg.click('#lnOk'); console.log('js-url:',await pg.$eval('#lnMsg',e=>e.textContent));
  await pg.fill('#lnU','example.com'); await pg.click('#lnOk'); await pg.waitForTimeout(200);
  console.log('lankar:',await pg.$$eval('#lnkList strong',x=>x.map(e=>e.textContent).join('|')));
  await pg.click('.navtab[data-page=styrelse]'); await pg.click('[data-st=prot]'); await pg.click('[data-dokadd=styrelse]');
  await pg.selectOption('#prKat','avtal'); await pg.fill('#prRubrik','Snöröjningsavtal'); await pg.setInputFiles('#prFil',{name:'a.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF')}); await pg.click('#prOk'); await pg.waitForTimeout(300);
  console.log('styr:',await pg.$eval('#sprotList',e=>e.innerText.replace(/\s+/g,' ').slice(0,200)));
  await pg.screenshot({path:`/tmp/vagtest/dok-styr.png`,fullPage:false});
  await pg.click('.navtab[data-page=dokument]'); await pg.click('[data-dk=lankar]');
}
await pg.screenshot({path:`/tmp/vagtest/dok-${tag}.png`});
await ctx.close();}
await b.close();})();
