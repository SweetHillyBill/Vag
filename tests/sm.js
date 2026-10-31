const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [opt,tag] of [[devices['Pixel 7'],'m'],[{viewport:{width:1280,height:900}},'d']]){
const ctx=await b.newContext(opt);const pg=await ctx.newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
for(const pgn of ['medlemmar','styrelse']){ await pg.goto('http://localhost:8766/index.html?m=medlem&x='+pgn+'#'+pgn);await pg.waitForTimeout(1300);
 console.log(tag,pgn,await pg.$$eval('#page-'+pgn+' .mcard,#page-'+pgn+' .bcard',x=>x.slice(0,3).map(e=>Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)).join(' ')));
 await pg.screenshot({path:`/tmp/vagtest/sm-${pgn}-${tag}.png`}); }
await ctx.close();}
await b.close();})();
