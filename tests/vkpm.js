const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
await pg.addInitScript(()=>{localStorage.setItem('vag_losen_fraga','nej');localStorage.setItem('vag_push_fraga','nej')});
await pg.route('**/supabase.js',rt=>rt.fulfill({path:'/tmp/vagtest/fake-supabase.js',contentType:'text/javascript'}));
await pg.route('**/fonts.googleapis.com/**',rt=>rt.abort()); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8766/verktyg.html?m=admin');await pg.waitForTimeout(1200);
const res=await pg.evaluate(()=>{
  const seg=[{id:"A",namn:"a",m:1000},{id:"B",namn:"b",m:100}];
  const T=(sch,props)=>{ applyRemote({segments:seg,props,schablon:Object.assign({prodOmr:"Ss",tillvOmr:"4",minKm:0.3},sch)}); return calc().rows.map(r=>({namn:r.p.namn,ton:r.ton,tkm:Math.round(r.tkm),share:r.share,txt:calcText(r)})); };
  const out={};
  out.ex631=T({prodOmr:"Gss",tillvOmr:"6"},[{id:"a",namn:"6.3.1",typ:"jord",perm:1,route:["A"],skogHa:15,skiften:[
    {id:"s1",namn:"Skifte 1",aker:5,bete:0,plats:"bc",fu:true,route:[]},{id:"s2",namn:"Skifte 2",aker:20,plats:"inom",fu:true,route:["A"]},
    {id:"s4",namn:"Skifte 4",aker:25,plats:"utanfor",fu:true,route:["A"]},{id:"ar",namn:"Arrende",aker:20,plats:"utanfor",fu:false,route:["A"]}]}])[0];
  out.ex632=T({prodOmr:"Gns"},[{id:"a",namn:"6.3.2",typ:"jord",route:["A"],hastEgna:15,hastInack:10,boxar:25,anstallda:7,skiften:[
    {id:"s2",namn:"Skifte 2",aker:7,plats:"inom",fu:false,route:["A"]},{id:"s3",namn:"Skifte 3",aker:3,plats:"inom",fu:false,route:["A"]},{id:"s4",namn:"Ridskolan",bete:9,plats:"inom",fu:false,route:["A"]}],
    rader:[{id:"r",namn:"Besökare",antal:10,dagar:299,vikt:1.5,farder:1,tor:true}]}])[0];
  out.hast1=T({prodOmr:"Ssk"},[{id:"a",namn:"3.5.7.1 jämkat",typ:"kombi",perm:1,beteHa:7,arealHa:8,hastEgna:2,hastInack:5,boxar:10,hastJamk:"jamka",route:["A"]}])[0];
  out.hast2=T({prodOmr:"Ssk"},[{id:"a",namn:"3.5.7.1 faktiska",typ:"kombi",perm:1,beteHa:7,arealHa:8,hastEgna:2,hastInack:5,boxar:10,route:["A"]}])[0];
  out.minkm=T({},[{id:"a",namn:"3.1.3",typ:"perm",perm:1,route:["B"]}])[0];
  out.direkt=T({},[{id:"a",namn:"3.1.4",typ:"perm",perm:1,route:[],direkt:true,direktFaktor:"0.5"}])[0];
  out.jakt=T({},[{id:"a",namn:"3.8.2.3",typ:"skog",skogRestrHa:250,skogJakt:true,route:["A"]}])[0];
  out.skola=T({},[{id:"a",namn:"6.3.3",typ:"egen",route:["A"],gods:"p25",rader:[["Barn",40,184,1.5,2],["Anst",15,184,1.5,1],["Buss",2,184,12,2],["Taxi",2,184,1.5,2],["Mat",1,184,3.5,1],["Service",4,4,2,1],["Helg",40,90,1.5,1,false],["Kväll",20,184,1.5,1,false]].map((r,i)=>({id:"r"+i,namn:r[0],antal:r[1],dagar:r[2],vikt:r[3],farder:r[4],tor:true,gods:r[5]!==false}))}])[0];
  out.vind=T({},[{id:"a",namn:"kluster 12",typ:"teknisk",tekFrek:"manad",antalAnl:12,kluster:true,route:["A"]}])[0];
  out.mjolk=T({},[{id:"a",namn:"mjölk",typ:"jord",route:["A"],mjolk:"indiv",mjolkSlap:true,skiften:[]}])[0];
  out.kombi2=T({},[{id:"a",namn:"kombi 1,5 ha",typ:"kombi",perm:1,akerHa:1,beteHa:0.5,skogHa:0,route:["A"]}])[0];
  out.minandel=T({minAndel:"5"},[{id:"a",namn:"stor",typ:"perm",perm:10,route:["A"]},{id:"b",namn:"liten",typ:"obebyggd",route:["A"]},{id:"c",namn:"mellan",typ:"perm",perm:1,route:["A"]}]).map(r=>r.namn+" "+r.share.toFixed(3));
  out.legacy=T({},[{id:"a",namn:"legacy",akerHa:24,skogHa:176,perm:1,route:["A"],interna:true}])[0];
  return out; });
const exp={ex631:21305,ex632:30285,hast1:9910,hast2:8610,jakt:180,skola:113920,vind:500*3+500*0.75*9,mjolk:183*50};
for(const [k,v] of Object.entries(res)){ if(Array.isArray(v)){console.log(k,v);continue;} console.log(k.padEnd(8),'ton',v.ton,exp[k]!==undefined?(v.ton===exp[k]?'OK':'FEL väntat '+exp[k]):'','tkm',v.tkm); if(['ex631','minkm','direkt','kombi2','legacy','ex632'].includes(k)) console.log('   '+v.txt.replace(/\n/g,'\n   ')); }
await b.close();})();
