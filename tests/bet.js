const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/index.html?m=admin#medlemmar');await pg.waitForTimeout(1500);
await pg.screenshot({path:`/tmp/vagtest/bet-${tag}.png`});
await pg.fill('#memSearch','stav 1:5'); await pg.waitForTimeout(200); console.log(tag,'sök:',await pg.$$eval('.mcard strong',x=>x.map(e=>e.textContent)));
await pg.fill('#memSearch',''); await pg.waitForTimeout(100);
await pg.click('.mcard:has-text("Stavberga")'); await pg.waitForTimeout(200);
console.log(' head:',await pg.$eval('#memDlg .mhead',e=>e.innerText.replace(/\s+/g,' ')));
await pg.click('#memDlg [data-act=edit]'); await pg.waitForTimeout(200);
console.log(' fält:',await pg.$$eval('#memDlg .edit label',x=>x.map(e=>e.childNodes[0].textContent.trim()).join('|')));
await pg.fill('#memDlg .edit [data-f=beteckning]','Stav 1:6'); await pg.dispatchEvent('#memDlg .edit [data-f=beteckning]','input');
await pg.click('#memDlg [data-act=done]'); await pg.waitForTimeout(200);
console.log(' efter:',await pg.$eval('#memDlg .mhead',e=>e.innerText.replace(/\s+/g,' ')));
await pg.screenshot({path:`/tmp/vagtest/bet-dlg-${tag}.png`});
await ctx.close();}
await b.close();})();
