const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const pg=await (await b.newContext()).newPage();
await pg.route(/tile\.|routing|vagdata/,rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html'); await pg.waitForTimeout(400);
for (const [namn,extra] of [["utan hästar",{}],["6 hästar",{hastEgna:2,hastInack:4}]]){
const r=await pg.evaluate(x=>{ applyRemote({segments:[{id:"A",namn:"a",m:1000}],props:[Object.assign({id:"g",namn:"Grannas",typ:"kombi",perm:1,akerHa:0.5,beteHa:1,route:["A"]},x)]}); const rr=calc().rows[0]; return calcText(rr)+"\nVARNINGAR: "+varningar(rr.p,rr).join(" | "); },extra);
console.log("== "+namn+"\n"+r); }
await b.close();})();
