const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const pg=await (await b.newContext()).newPage();
await pg.route(/tile\.|overpass/,rt=>rt.abort()); await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('dialog',d=>d.accept());
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(400);
// gammalt läge: delsträcka med geo men ingen väg
await pg.evaluate(()=>{ applyRemote({segments:[{id:"A",namn:"x",m:500,mot:"",geo:[[59,16],[59.001,16.01]]}],props:[{id:"p",namn:"P",typ:"perm",perm:1,route:["A"]}],karta:{vagar:[],punkter:[]}}); save(); });
await pg.reload(); await pg.waitForTimeout(400);
await pg.evaluate(()=>{ openTab='vag'; renderTabs(); }); await pg.waitForTimeout(400);
console.log('efter öppning',await pg.evaluate(()=>JSON.stringify({segs:state.segments.length, route:state.props[0].route})));
// rita väg, utfart, sedan ta bort vägen
await pg.evaluate(()=>{ state.karta.vagar.push({id:"v",pts:[[59.05,16.56],[59.05,16.55]]}); kartaTest.satPunkt("utfart",[59.05,16.56]); });
console.log('med väg',await pg.evaluate(()=>state.segments.map(g=>g.id+" "+g.m).join(", ")));
await pg.evaluate(()=>{ state.karta.vagar=[]; kartaTest.satPunkt("utfart",[59.05,16.56]); });
console.log('väg borttagen',await pg.evaluate(()=>state.segments.length));
await b.close();})();
