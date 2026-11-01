const {chromium}=require('playwright'); const fs=require('fs');
const cfg=JSON.parse(fs.readFileSync(process.argv[2]));
(async()=>{const b=await chromium.launch();
async function kor(fil){ const pg=await b.newPage();
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/verktyg.js*',rt=>rt.fulfill({path:fil,contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html?m=admin');await pg.waitForTimeout(1200);
const r=await pg.evaluate(c=>{ state=Object.assign(structuredClone(DEFAULT),JSON.parse(JSON.stringify(c)),{schablon:Object.assign({},DEFAULT.schablon,c.schablon)}); return calc().rows.map(x=>[x.p.namn,Math.round(x.tkm),x.disp]); },cfg);
await pg.close(); return r; }
const gam=await kor(process.argv[3]), ny=await kor('/home/user/baggetorphytternas.github.io/verktyg.js');
let ok=true; gam.forEach((g,i)=>{ const n=ny[i]; const same=g[1]===n[1]&&g[2]===n[2]; if(!same) ok=false; console.log((same?'  ':'≠ ')+g[0].padEnd(24),'gammal',String(g[1]).padStart(7),g[2]+' %','| ny',String(n[1]).padStart(7),n[2]+' %'); });
console.log(ok?'IDENTISKA':'SKILLNADER'); await b.close();})();
