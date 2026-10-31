const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin');await pg.waitForTimeout(1200);

await pg.click('.navtab[data-page=dokument]'); await pg.click('#dkAdd');
console.log('mote-val synligt:',await pg.$eval('#prMoteL',e=>!e.hidden).catch(()=>'saknas'));
await pg.selectOption('#prMote',{index:1}); await pg.setInputFiles('#prFil',{name:'p.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF')}); await pg.click('#prOk'); await pg.waitForTimeout(300);
await pg.click('.navtab[data-page=moten]'); console.log('läs-länkar:',await pg.$$eval('#meetList [data-dokid]',x=>x.length));
await pg.close(); const p2=await b.newPage(); await p2.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await p2.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await p2.goto('http://localhost:8766/index.html?m=medlem#dokument');await p2.waitForTimeout(1200);
console.log('medlem: upload synlig',await p2.isVisible('#dkAdd'),'notis synlig',await p2.isVisible('.dknote'),'styrelse-dok-flik', await p2.isVisible('[data-st=prot]'));
await p2.click('[data-dk=lankar]'); console.log('medlem ändra-knappar:',await p2.$$eval('[data-lnkedit]',x=>x.length));
await b.close();})();
