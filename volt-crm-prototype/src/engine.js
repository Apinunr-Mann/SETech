/* =====================================================================
   Volt Charge Club prototype: helpers, state, rules engines
   Rules come from the TPS Handoff v1.1 (volt-data.js + handoff text)
   ===================================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('en-US');
const baht=n=>'฿'+fmt(n);
const bolt=c=>`<svg class="${c||''}" viewBox="0 0 24 32" aria-hidden="true"><use href="#bolt"/></svg>`;
const now=()=>new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
const rngOf=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=(a,r)=>a[Math.floor((r||Math.random)()*a.length)];
const SKU={s190:{n:'กระป๋อง 190 ml',s:'190 ml',baht:10},s310:{n:'กระป๋อง 310 ml',s:'310 ml',baht:17}};
const FL={y:'Tropical',c:'Blueberry',p:'Forest Fruit'};
const FLN={y:'เหลือง',c:'ฟ้า',p:'ม่วง'};
const LG=Object.fromEntries(VOLT.lifestyles.map(l=>[l.id,l]));
const PROVS=['กรุงเทพฯ','นนทบุรี','ปทุมธานี','สมุทรปราการ','ชลบุรี','เชียงใหม่','ขอนแก่น','นครราชสีมา','สงขลา','อื่น ๆ'];
const REGION={'กรุงเทพฯ':'กลาง','นนทบุรี':'กลาง','ปทุมธานี':'กลาง','สมุทรปราการ':'กลาง','ชลบุรี':'ตะวันออก','เชียงใหม่':'เหนือ','ขอนแก่น':'อีสาน','นครราชสีมา':'อีสาน','สงขลา':'ใต้'};
const regionOf=p=>REGION[p]||'กลาง';
/* Tier = weeks charged within the last 8 weeks (rolling). Thresholds are assumptions. */
const TIER=[{k:'LF1',w:0,d:'สมัครสมาชิก'},{k:'LF2',w:2,d:'ชาร์จ 2 สัปดาห์ ใน 8 สัปดาห์ล่าสุด'},{k:'LF3',w:4,d:'ชาร์จ 4 สัปดาห์ ใน 8 สัปดาห์ล่าสุด'},{k:'LF4',w:6,d:'ชาร์จ 6 สัปดาห์ ใน 8 สัปดาห์ล่าสุด'},{k:'LF5',w:8,d:'ชาร์จครบ 8 สัปดาห์'}];
const TIERRANK={T0:0,T1:1,T2:2,T3:3};
const TIERNAME={T0:'T0 สิทธิ์พาร์ทเนอร์',T1:'T1 Spark',T2:'T2 Charge',T3:'T3 Boost',D:'Drop'};
const tierOfPts=p=>p<=100?'T1':p<=500?'T2':'T3';
const CODES={'VOLT-7K2P-9QX4':'s310','VOLT-3MDX-2027':'s310','VOLT-A1B2-C3D4':'s190','VOLT-Z9Y8-X7W6':'s190','VOLT-Q5R6-T7U8':'s310'};
const SEG_KEYS=VOLT.rfm.map(r=>r.seg);
const DAYS_TO_SUN=3;

/* ---------- state ---------- */
const VKEY='voltProto5';
let S;
function seedRewards(){
  const r=rngOf(7),out=[];
  VOLT.catalog.forEach((c,i)=>out.push({id:'a'+i,k:'cat',n:c.name,gs:[c.g],cost:c.cost,pts:c.pts,tier:c.tier,qty:c.qty,used:Math.round(c.qty*(.12+r()*.38)),plan:45,cap:c.tier==='T1'?4:2,minAge:/Google Play/.test(c.name)?18:0,pop:Math.round(20+r()*80),ship:false,restock:'ทุกวัน 07:00'}));
  VOLT.merch.forEach((m,i)=>{if(m.pts==null)return;const drop=/Drop/.test(m.name);out.push({id:'m'+i,k:'merch',n:m.name,gs:/Three Man Down/.test(m.name)?['music']:['core'],cost:m.cost,pts:m.pts,tier:drop?'D':tierOfPts(m.pts),qty:m.qty,used:Math.round(m.qty*(.1+r()*.3)),plan:50,cap:2,minAge:0,pop:Math.round(15+r()*70),ship:true,drop,tmd:/Three Man Down/.test(m.name),imgExpire:/Three Man Down/.test(m.name)?'31 พ.ค. 2570':'',restock:'ล็อตแรก 50%'})});
  VOLT.partnerPerks.forEach((p,i)=>out.push({id:'p'+i,k:'perk',n:p.name,gs:[p.g],cost:0,pts:0,tier:'T0',qty:9999,used:Math.round(r()*300),plan:0,cap:1,minAge:/แอปการเงิน/.test(p.name)?20:0,pop:Math.round(10+r()*40),ship:false,restock:'พาร์ทเนอร์ออกเงิน',note:/แอปการเงิน/.test(p.name)?'ห้ามสื่อเรื่องผลตอบแทน':''}));
  return out;
}
function seedDraws(){
  const T=VOLT.drawTemplates;
  return [
    {id:'d1',tpl:0,n:'Weekly Lifestyle Draw · ธีมเกม',freq:T[0].freq,entry:T[0].entry,prize:'บัตร Garena 1,000฿ × 5 · บัตร 100฿ × 110',status:'open',cut:'อาทิตย์ 20:00',winners:5,permit:'ชค.001/2570',budgetPool:'A3',cost:5*1000+110*100,entries:18420,ratio:1},
    {id:'d2',tpl:2,n:'Backstage Pass',freq:T[2].freq,entry:T[2].entry,prize:T[2].prize,status:'open',cut:'ก่อนคอนเสิร์ต 7 วัน',winners:20,permit:'ชค.002/2570',budgetPool:'C',cost:20*3000,entries:2310,only7:true},
    {id:'d3',tpl:3,n:'Monthly Mid · AirPods',freq:T[3].freq,entry:T[3].entry,prize:T[3].prize,status:'open',cut:'สิ้นเดือน 23:59',winners:5,permit:'ชค.003/2570',budgetPool:'C',cost:5*6000,entries:6120,packs:true},
    {id:'d4',tpl:4,n:'Grand Fully Charged',freq:T[4].freq,entry:T[4].entry,prize:T[4].prize,status:'published',cut:'ปิด Season',winners:19,permit:'',budgetPool:'C',cost:45000*4+40000*2+17000*5+15000*5+20000*3,entries:41230}
  ];
}
function seed(){
  const r=rngOf(11);
  return {
    v:5,
    hist:[{l:'7-Eleven · 310 ml × 2',p:50,ch:'7-Eleven'},{l:'ร้านเจ๊หน่อย (สแกน) · 190 ml × 3',p:30,ch:'โชห่วย'},{l:'Charge Profile ครบ 10 ข้อ',p:30,ch:'ภารกิจ'}],
    user:{reg:true,name:'มายด์',birth:'2549-05',prov:'กรุงเทพฯ',groups:['music','game','food'],flav:'y',pts:148,pend:0,pendList:[],firstCan:true,
      wk:[0,0,0,0,1,1,0,1],week:true,streak:7,lastDays:2,cansToday:0,scansToday:0,cansM:3,cans30:{y:9,c:2,p:0},trioDone:false,
      spendW:80,spendM:260,profileQ:10,profileAns:{},profilePaid:true,weeklyDone:false,weeklyAns:{},wqLastWk:0,
      pers:true,mk:true,an:false,otp:true,idv:false,address:'',goal:null,hearts:[],beh:{music:2,game:1},
      entries:{d1:2,d2:0,d3:1,d4:5},claims:[],iwWins:[],coupons:[],voted:null,matchDay:false,squad:false,seg:'Loyal',phone:'0812345678',claims:[]},
    rules:{p190:10,p310:20,bonus7:5,welcome:20,profile:30,weekly:5,trio:10,capCans:6,maxScan:3,ageMin:15,entryCost:20,iwDemo:.25},
    mult:[{id:'m1',n:'x2 ช่วงเย็น 310 ml (18:00–21:00)',sku:'s310',m:2,on:false},{id:'m2',n:'Purple Week ภาคเหนือ',flav:'p',region:'เหนือ',m:1.5,on:false},{id:'m3',n:'At Risk comeback x1.5',seg:'At Risk',m:1.5,on:false}],
    rewards:seedRewards(),draws:seedDraws(),
    iw:{pool:VOLT.instantWinDaily.map(p=>({name:p.name,qty:p.qty,left:Math.round(p.qty*.62),cost:p.cost})),played:0},
    pools:{A1:{n:'A1 แลกด้วยแต้ม',plan:2000000,res:310000,iss:560000,paid:520000},A2:{n:'A2 Instant Win รายวัน',plan:645000,res:15000,iss:178000,paid:160000},A3:{n:'A3 รายสัปดาห์',plan:442500,res:13500,iss:118000,paid:104000},B:{n:'B Merch + TMD',plan:950000,res:475000,iss:238000,paid:210000},C:{n:'C รางวัลใหญ่',plan:712500,res:52500,iss:0,paid:0}},
    receipts:[
      {id:'r1',me:true,store:'7-Eleven สาขาสยาม',no:'S-1123-88001',sku:'s310',flav:'y',qty:2,st:'ok',score:.96,why:'',pts:50,ch:'7-Eleven',imgs:1},
      {id:'r2',me:true,store:'Lawson สาขาอโศก',no:'L-0098-55120',sku:'s310',flav:'y',qty:1,st:'review',score:.62,why:'ภาพเบลอ',blur:true,ch:'Lawson',imgs:1,pre:20},
      {id:'r3',me:false,who:'คุณบ**',store:'7-Eleven สาขาบางนา',no:'S-2201-10442',sku:'s310',flav:'c',qty:12,st:'review',score:.41,why:'จำนวนผิดปกติ',ch:'7-Eleven',imgs:2},
      {id:'r4',me:false,who:'คุณก**',store:'Makro สาขารังสิต',no:'M-0441-77812',sku:'s190',flav:'p',qty:24,st:'review',score:.55,why:'ฟอนต์วันที่ต่าง',ch:'Makro',imgs:3},
      {id:'r5',me:false,who:'คุณจ**',store:'Lawson ลาดพร้าว',no:'L-0120-90210',sku:'s310',flav:'y',qty:2,st:'review',score:.58,why:'ตรวจพบ: ใบเสร็จที่ AI สร้าง',aigen:true,ch:'Lawson',imgs:1}],
    shops:[
      {id:'T-0088',n:'ร้านเจ๊หน่อย',a:'บางแค',stockIn:40,usedM:212,risk:'ต่ำ',why:[],sus:false,hold:0,pts:412,auto:true,credit:0,owner:'คุณต้น'},
      {id:'T-0412',n:'ร้านป้าแดง',a:'ลำลูกกา',stockIn:40,usedM:520,risk:'สูง',why:['สแกนเกินโควตา 3 วันติด','ลูกค้า 4 คนเดิม = 61% ของการสแกน','สแกนนอกรัศมีร้าน 2 ครั้ง'],sus:false,hold:0,pts:960,auto:false,credit:0,owner:'คุณต้น'},
      {id:'T-1203',n:'ร้านลุงชัย',a:'หาดใหญ่',stockIn:25,usedM:210,risk:'กลาง',why:['สแกนช่วงตี 2 บ่อยผิดปกติ'],sus:false,hold:0,pts:220,auto:true,credit:0,owner:'คุณมด'},
      {id:'T-2290',n:'ร้านเฮียกิม',a:'เชียงใหม่',stockIn:30,usedM:96,risk:'ต่ำ',why:[],sus:false,hold:0,pts:130,auto:true,credit:0,owner:'คุณมด'}],
    newShops:[],leads:[],
    scans:[{t:'14:32',who:'คุณม**',d:'190 ml × 3',st:'ok'},{t:'13:05',who:'คุณก**',d:'190 ml × 2',st:'ok'},{t:'12:40',who:'คุณจ**',d:'190 ml × 6',st:'no'}],
    shopReq:null,pending:null,
    chat:[{f:'oa',k:'promo'},{f:'oa',k:'ai',kk:'PUSH',x:'ชาร์จครบ 3 รสใน 30 วัน รับเพิ่ม 10 แต้ม · ตอนนี้คุณชาร์จแล้ว 2 รส'}],
    log:[],cases:[{id:'CS-1001',who:'คุณบ**',t:'ใบเสร็จไม่เข้า',st:'เปิด'}],appeals:[],
    drafts:[],approvals:[],sent:{},seg:{freq:{},holdout:10,quiet:true,hour:14},
    advisorPick:null,lbFinal:{},changes:[],
    kpi:{mem:48210,cans:312000,newMem:1208},
    profileQs:VOLT.quizOnboarding,weekly:JSON.parse(JSON.stringify(VOLT.quizWeekly)),
    stage:{votes:{a:41,b:33,c:26}},wallet:[],sim:{hour:14},
    ui:{c:'chat',tab:'receipt',rmTab:'a',rmOpen:true,rf:'all',rg:'all',rd:null,quiz:null,sheet:null,s:'home',cart:null,b:'dash',sel:'r2',shopSel:'T-0412',dt:'bo',lbT:'wk',strip:0,done:{},fl:'y',rcImgs:1,rcBlur:false,qi:0,wq:0,reg:{g:['music','game','food']},match:null}
  };
}
function guest(st){Object.assign(st.user,{reg:false,name:'',birth:'',prov:'',groups:[],flav:null,pts:0,pend:0,pendList:[],firstCan:false,wk:[0,0,0,0,0,0,0,0],week:false,streak:0,lastDays:99,cansToday:0,scansToday:0,cansM:0,cans30:{y:0,c:0,p:0},trioDone:false,spendW:0,spendM:0,profileQ:0,profileAns:{},profilePaid:false,weeklyDone:false,otp:false,address:'',goal:null,hearts:[],beh:{},entries:{d1:0,d2:0,d3:0,d4:0},iwWins:[],coupons:[],voted:null,seg:'New'});
  st.receipts=st.receipts.filter(r=>!r.me);st.wallet=[];st.hist=[];st.user.claims=[];
  st.chat=[{f:'oa',k:'text',x:'ขอบคุณที่เพิ่ม Volt Club เป็นเพื่อน\nสมัครวันนี้ รับ Welcome 20 แต้ม หลังชาร์จกระป๋องแรกผ่าน\nกด “สมัครสมาชิก” ที่เมนูด้านล่างได้เลย'},{f:'oa',k:'promo'}];
  st.ui.c='chat';st.ui.qi=0;return st}
function load(){try{S=JSON.parse(localStorage.getItem(VKEY)||'null')}catch(e){S=null}if(!S||!S.ui||S.v!==5)S=guest(seed())}
const save=()=>{try{localStorage.setItem(VKEY,JSON.stringify(S))}catch(e){}};
const log=(who,t)=>{S.log.unshift({w:who,t,at:now()});S.log=S.log.slice(0,80)};
const done=k=>{S.ui.done[k]=true};
let toastT;const toast=t=>{const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2800)};

/* ---------- derived ---------- */
const weeksIn=()=>S.user.wk.reduce((a,b)=>a+(b?1:0),0);
const tierIdx=()=>{let i=0;const w=weeksIn();TIER.forEach((t,k)=>{if(w>=t.w)i=k});return i};
const ageOf=()=>{const b=S.user.birth;if(!b)return 0;const [y,m]=b.split('-').map(Number);return Math.max(0,2570-y-(m>5?1:0))};
const allowed=r=>!r.minAge||ageOf()>=r.minAge;
const left=r=>Math.max(0,r.qty-r.used);
const poolOf=r=>r.k==='merch'?'B':'A1';
const poolFull=k=>{const p=S.pools[k];return p&&p.iss+p.res>=p.plan};
const soldOut=r=>r.k!=='perk'&&(left(r)<=0||poolFull(poolOf(r)));
const goalReward=()=>S.rewards.find(r=>r.id===S.user.goal);
const hasBought7=()=>S.receipts.some(r=>r.me&&r.st==='ok'&&r.ch==='7-Eleven'&&r.sku==='s310');

/* ---------- points ---------- */
function multFor(sku,flav,ch){let m=1;const tags=[];S.mult.forEach(x=>{if(!x.on)return;if((!x.sku||x.sku===sku)&&(!x.flav||x.flav===flav)&&(!x.region||x.region===regionOf(S.user.prov))&&(!x.shop||x.shop===ch)&&(!x.seg||x.seg===S.user.seg)){if(x.m>m)m=x.m;tags.push(x.n)}});return{m,tags}}
function calcPts(it){const base=S.rules[it.sku==='s310'?'p310':'p190'],mu=multFor(it.sku,it.flav,it.ch),bonus=(it.ch==='7-Eleven'&&it.sku==='s310'&&it.rcpt!==false)?S.rules.bonus7*it.qty:0;return{pts:Math.round(base*it.qty*mu.m)+bonus,base:base*it.qty,mult:mu.m,tags:mu.tags,bonus}}
const entriesFor=(qty,ch,sku)=>qty+0*ch;
function fxQueue(){return window.__fx||(window.__fx=[])}

/* Award passed cans. items=[{sku,qty,flav,ch,rcpt}] one claim => one Instant Win chance */
function awardCans(items,label,from){
  const u=S.user,res={pts:0,cans:0,capped:false,iw:null,lvl:false,released:0,items:[]};
  const tier0=tierIdx();let room=Math.max(0,S.rules.capCans-u.cansToday);
  items.forEach(it=>{const q=Math.min(it.qty,room);room-=q;if(q<it.qty)res.capped=true;if(q<=0)return;const c=calcPts({...it,qty:q});res.pts+=c.pts;res.cans+=q;res.items.push({...it,qty:q,c});
    u.cans30[it.flav]=(u.cans30[it.flav]||0)+q;u.spendW+=SKU[it.sku].baht*q;u.spendM+=SKU[it.sku].baht*q;u.beh.core=(u.beh.core||0)+1});
  if(!res.cans){fxQueue().push({toast:'วันนี้ชาร์จครบเพดาน '+S.rules.capCans+' กระป๋องแล้ว พักก่อนนะ'});S.chat.push({f:'oa',k:'ai',kk:'PUSH',x:`วันนี้ชาร์จครบเพดาน ${S.rules.capCans} กระป๋องแล้ว พักก่อนนะ แล้วพรุ่งนี้มาชาร์จใหม่`});return res}
  u.cansToday+=res.cans;u.cansM+=res.cans;u.pts+=res.pts;u.lastDays=0;
  S.hist=S.hist||[];S.hist.unshift({l:label,p:res.pts,ch:items[0].ch});
  if(!u.firstCan){u.firstCan=true;let rel=0;u.pendList.filter(p=>p.firstCan).forEach(p=>rel+=p.p);if(!rel)rel=S.rules.welcome;u.pendList=u.pendList.filter(p=>!p.firstCan);u.pend=u.pendList.reduce((a,b)=>a+b.p,0);u.pts+=rel;res.released=rel;
    S.hist.unshift({l:'ปลดล็อก Welcome'+(rel>S.rules.welcome?' + Charge Profile':''),p:rel,ch:'โบนัส'});
    S.chat.push({f:'oa',k:'ai',kk:'PUSH',x:`ชาร์จกระป๋องแรกผ่านแล้ว ปลดล็อก ${fmt(rel)} แต้ม (Welcome${rel>S.rules.welcome?' + Charge Profile':''})`});fxQueue().push({n:rel,label:'Welcome +'+rel})}
  if(!u.week){u.week=true;u.wk[7]=1;u.streak++}
  if(u.cans30.y&&u.cans30.c&&u.cans30.p&&!u.trioDone){u.trioDone=true;u.pts+=S.rules.trio;S.hist.unshift({l:'Flavor Trio ครบ 3 รส',p:S.rules.trio,ch:'ภารกิจ'});S.chat.push({f:'oa',k:'ai',kk:'PUSH',x:`Flavor Trio สำเร็จ ได้ +${S.rules.trio} แต้ม`});fxQueue().push({n:S.rules.trio,label:'Flavor Trio +'+S.rules.trio})}
  if(tierIdx()>tier0){res.lvl=true;fxQueue().push({lvl:'LEVEL UP!',sub:'ชาร์จเต็ม · ขึ้น '+TIER[tierIdx()].k,small:'ปลดล็อกรางวัล Pin ใหม่ · แตะเพื่อปิด'});log('ระบบ','ลูกค้าขึ้น Tier '+TIER[tierIdx()].k)}
  res.iw=rollIW(items);
  S.kpi.cans+=res.cans;
  const ch=items[0].ch;
  VoltDash.ingest({ch:/^7/.test(ch)?'7-Eleven':['Lawson','Makro','โชห่วย'].includes(ch)?ch:'ออนไลน์+',cans:res.cans,pts:res.pts,who:'คุณ'+(u.name||'')+' (เดโม)',me:u.pts,tier:TIER[tierIdx()].k,shop:ch==='โชห่วย'?(from&&from.shop)||S.shops[0].n:null,desc:label});
  fxQueue().push({n:res.pts});
  if(res.capped)S.chat.push({f:'oa',k:'ai',kk:'PUSH',x:`วันนี้ชาร์จครบเพดาน ${S.rules.capCans} กระป๋องแล้ว พักก่อนนะ`});
  nudge();return res}
function rollIW(items){const iw=S.iw,u=S.user,tot=iw.pool.reduce((a,p)=>a+p.left,0);iw.played++;
  if(tot<=0)return null;const hit=Math.random()<S.rules.iwDemo;if(!hit)return{win:false};
  let r=Math.random()*tot,pz=iw.pool[0];for(const p of iw.pool){if(r<p.left){pz=p;break}r-=p.left}
  pz.left--;S.pools.A2.iss+=pz.cost;const code='IW-'+Math.random().toString(36).slice(2,8).toUpperCase();
  S.wallet.unshift({id:'w'+Date.now(),n:pz.name,kind:'iw',code,st:'ready',exp:'30 วัน',cost:pz.cost});u.iwWins.push(pz.name);
  S.chat.push({f:'oa',k:'ai',kk:'PUSH',x:`Instant Win! คุณได้ ${pz.name} · ดูโค้ดที่กระเป๋าคูปอง`});log('ระบบ',`Instant Win: ${pz.name} (เหลือ ${pz.left}/${pz.qty})`);done('iw');
  VoltDash.ingest({redeem:Math.round(pz.cost/0.1),who:'ผู้โชคดี Instant Win',name:pz.name});
  return{win:true,prize:pz.name,code}}
function nudge(){const g=goalReward();if(g&&g.pts>S.user.pts){const x=`อีก ${g.pts-S.user.pts} แต้ม ถึงเป้า “${g.n}”`;const last=S.chat[S.chat.length-1];if(!last||last.x!==x)S.chat.push({f:'oa',k:'ai',kk:'PUSH',x})}}

/* ---------- recommendation (rules v1, handoff §6) ---------- */
function recommend(){
  const u=S.user,out=[],groups=u.groups||[];
  const items=S.rewards.filter(r=>r.tier!=='T0'&&r.k!=='perk');
  const sc=r=>{const g=r.gs[0],interest=r.gs.some(x=>groups.includes(x))?1:(g==='core'?.35:0),beh=Math.min(1,((u.beh[g]||0)+(u.hearts.includes(r.id)?2:0))/5),pop=r.pop/100;
    const reach=r.pts>0&&u.pts>=r.pts*.5?1.2:1;return{s:(.5*interest+.3*beh+.2*pop)*reach,interest,beh,pop,reach}};
  let pool=items.filter(r=>!soldOut(r)&&allowed(r)&&(r.tier!=='D'||true));
  if(!u.pers||!groups.length||S.aiOff){pool=pool.map(r=>({r,sc:{s:r.pop/100},why:'ยอดนิยมรวมตอนนี้'})).sort((a,b)=>b.sc.s-a.sc.s)}
  else pool=pool.map(r=>{const c=sc(r);const g=r.gs.find(x=>groups.includes(x));
    const need=Math.max(0,r.pts-u.pts);const why=g&&g!=='core'?`คุณเลือกกลุ่ม${LG[g].th}${need?` และอีก ${fmt(need)} แต้มถึง`:' แต้มพอแลกแล้ว'}`:c.interest>0?'ของพื้นฐานที่ทุกคนแลกได้':'ยอดนิยมในคนคล้ายกัน';return{r,sc:c,why}}).sort((a,b)=>b.sc.s-a.sc.s);
  const cnt={};let hasT1=false;
  for(const x of pool){const g=x.r.gs[0];if((cnt[g]||0)>=2)continue;cnt[g]=(cnt[g]||0)+1;out.push(x);if(x.r.tier==='T1')hasT1=true;if(out.length>=6)break}
  if(!hasT1){const t1=pool.find(x=>x.r.tier==='T1'&&!out.includes(x));if(t1){if(out.length>=6)out.pop();out.push(t1)}}
  return out.sort((a,b)=>b.sc.s-a.sc.s).slice(0,6)}

/* ---------- next best action (AI level 3) ---------- */
function nextAction(){const u=S.user,g=goalReward();
  if(!u.firstCan)return{t:'ชาร์จกระป๋องแรกรับ Welcome 20 แต้ม',go:'collect'};
  if(u.profileQ<10)return{t:`ตอบ Charge Profile อีก ${10-u.profileQ} ข้อ ได้ 30 แต้ม`,go:'quizP'};
  if(!u.weeklyDone)return{t:'ตอบ Weekly Quiz 3 ข้อ รับ 5 แต้ม',go:'quizW'};
  if(g&&g.pts>u.pts)return{t:`อีก ${fmt(g.pts-u.pts)} แต้ม ถึงเป้า “${g.n}” (ประมาณ ${Math.ceil((g.pts-u.pts)/20)} กระป๋อง 310 ml)`,go:'collect'};
  if(g)return{t:`แต้มพอแล้ว แลก “${g.n}” ได้เลย`,go:'rewards'};
  if(!(u.cans30.y&&u.cans30.c&&u.cans30.p))return{t:'ลองให้ครบ 3 รสใน 30 วัน รับ +10 แต้ม',go:'tier'};
  return{t:'ตั้งเป้ารางวัลที่อยากได้ แล้วดูแบตเติมขึ้นทุกครั้งที่ชาร์จ',go:'rewards'}}

/* ---------- RFM (daily 03:00 snapshot, deterministic) ---------- */
function rfmGrid(){const r=rngOf(2027);const g=[];let tot=0;for(let R=5;R>=1;R--){const row=[];for(let F=1;F<=5;F++){const w=(R>=4&&F>=3?2.4:R<=2&&F<=2?2.0:1)+r()*1.6;const n=Math.round(w*(R*F>12?260:R*F<4?330:410));row.push(n);tot+=n}g.push(row)}return{g,tot}}
function rfmSegs(){const r=rngOf(99),base=[6100,11400,5200,3900,4300,6200,5100,4300,520,6800,2900];return VOLT.rfm.map((s,i)=>({...s,n:base[i]+Math.round(r()*200),chg:Math.round((r()-.45)*22)/10,avg:Math.round(120+r()*380),flav:pick(['Tropical','Blueberry','Forest Fruit'],r),ch:pick(['7-Eleven','ร้านโชห่วย','Lawson'],r),ls:pick(VOLT.lifestyles,r).th,prov:pick(['กรุงเทพฯ','เชียงใหม่','ขอนแก่น','ชลบุรี'],r)}))}

/* ---------- leaderboard ---------- */
function lbRows(type){const r=rngOf(type.length*31+5),names=['คุณบอส','คุณแพร','คุณนนท์','คุณจูน','คุณเก่ง','คุณฟ้า','คุณต้น','คุณมิว','คุณอาร์ม','คุณปุ๊ก','คุณโอ๊ต','คุณเนย'];
  const scale={wk:1,mo:3.4,prov:2.2,chg:1,campus:1}[type]||1;
  let rows=names.map((n,i)=>({n,v:Math.round((920-i*58+r()*20)*scale),sub:''}));
  if(type==='chg')rows=rows.map((x,i)=>({...x,v:30-i,sub:'วันที่ชาร์จ'}));
  if(type==='campus'){rows=['จุฬาฯ','เกษตรศาสตร์','มหิดล','ธรรมศาสตร์','เชียงใหม่','ขอนแก่น','สงขลานครินทร์','มศว'].map((n,i)=>({n:'ม.'+n,v:Math.round(5400-i*470+r()*80),sub:'คนชาร์จ'}))}
  const u=S.user;if(u.reg&&type!=='campus'){const mine=type==='chg'?Math.max(0,Math.min(30,u.wk.reduce((a,b)=>a+b,0)*3+u.cansToday)):(type==='wk'?u.spendW:u.spendM*(type==='prov'?1:1));rows.push({n:'คุณ'+u.name+' (คุณ)',v:Math.round(mine),me:true,sub:type==='chg'?'วันที่ชาร์จ':''})}
  rows.sort((a,b)=>b.v-a.v);rows.forEach((x,i)=>x.rank=i+1);return rows}
