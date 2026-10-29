/* =====================================================================
   Actions (data-a delegation), render loop, boot
   ===================================================================== */
const chatPush=(x,kk)=>S.chat.push({f:'oa',k:'ai',kk:kk||'PUSH',x});
const meName=()=>'คุณ'+(S.user.name||'')+' (เดโม)';
const aiOnly=()=>!S.aiOff;
function needApprove(kind,label,payload){S.approvals=S.approvals.filter(a=>!(a.kind===kind&&kind==='rules'));S.approvals.push({id:'ap'+Date.now(),kind,label,by:'คุณมิ้น (Admin)',at:now(),payload});log('หลังบ้าน','ส่งขออนุมัติ: '+label);toast('ส่งขออนุมัติแล้ว รอผู้อนุมัติคนที่ 2')}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
const doneQ=(F)=>{const u=S.user;u.pts+=F.p;S.hist=S.hist||[];S.hist.unshift({l:F.l,p:F.p,ch:'ภารกิจ'});fxPush({n:F.p,label:F.l+' +'+F.p});VoltDash.ingest({pts:F.p,who:meName(),desc:F.l,ch:'ออนไลน์+',cans:0})};

function finish(msg,code){Object.assign(S.ui.rd,{step:'done',msg,code})}
function pay(r){const u=S.user;u.pts-=r.pts;fxPush({n:-r.pts});r.used++;S.pools[poolOf(r)].iss+=r.cost;u.claims.push(r.id);S.hist=S.hist||[];S.hist.unshift({l:'แลก '+r.n,p:-r.pts,ch:'แลก'});
  const code=r.ship?'':'VC-'+Math.random().toString(36).slice(2,8).toUpperCase();
  if(!r.ship)S.wallet.unshift({id:'w'+Date.now(),n:r.n,kind:'cat',code,st:'ready',exp:'30 วัน',cost:r.cost});
  if(u.goal===r.id)u.goal=null;
  VoltDash.ingest({redeem:r.pts,who:meName(),name:r.n,first:!u.redeemed});u.redeemed=true;S.kpi.ptsUse=(S.kpi.ptsUse||0)+r.pts;
  chatPush(r.ship?`แลก ${r.n} สำเร็จ · เลขพัสดุ TH${Math.floor(1e9*Math.random())} จะอัปเดตทาง LINE`:`แลก ${r.n} สำเร็จ · โค้ด ${code}`);log('ลูกค้า',`แลก ${r.n} −${r.pts} แต้ม`);done('redeem');
  finish(r.ship?'จัดส่งถึงบ้านภายใน 7–14 วัน · ติดตามพัสดุใน LINE':'ใช้โค้ดนี้ได้ทันที · เก็บไว้ในกระเป๋าคูปอง',code)}

function reply(v){const u=S.user,ti=tierIdx(),g=goalReward(),q={pts:'แต้มฉันเหลือเท่าไร',near:'ร้านสะสมแต้มใกล้ฉัน',how:'สะสมแต้มยังไง',tier:'ขึ้น Tier ยังไง',next:'ควรทำอะไรต่อ',why:'ทำไมแนะนำชิ้นนี้',human:'ติดต่อทีมงาน'}[v];
  S.chat.push({f:'me',x:q});
  if(!u.reg&&!['how','near','human'].includes(v)){chatPush('คุณยังไม่ได้เป็นสมาชิก กด “สมัครสมาชิก” ที่เมนูด้านล่าง รับ Welcome 20 แต้มหลังชาร์จกระป๋องแรก','PULL');return}
  if((S.aiOff||S.aiK.l1)&&!['human','how'].includes(v)){chatPush('ตอนนี้ระบบผู้ช่วยปิดอยู่ชั่วคราว ดูแต้มและกติกาได้ที่เมนูด้านล่าง หรือกด “ติดต่อทีมงาน”','PULL');return}
  const a={pts:()=>`คุณมี ${fmt(u.pts)} แต้ม (${TIER[ti].k})${u.pend?` · รอปลดล็อก ${u.pend} แต้ม`:''}${g&&g.pts>u.pts?` · อีก ${fmt(g.pts-u.pts)} แต้มถึงเป้า “${g.n}”`:''}`,
    near:()=>`ใกล้คุณมี ${S.shops.filter(s=>!s.sus).length} ร้าน ใกล้สุด: ${S.shops[0].n} 0.3 กม. · กด “ร้านใกล้ฉัน” เพื่อดูแผนที่`,
    how:()=>OPT.b2b?`4 วิธี: 1) กรอกรหัสใต้ห่วง 2) สแกน QR ที่ร้านโชห่วย (ร้านกดอนุมัติ) 3) ส่งรูปใบเสร็จ 7-Eleven / Lawson / Villa / Makro 4) ผูกออเดอร์ออนไลน์ · 190 ml = ${S.rules.p190} · 310 ml = ${S.rules.p310} แต้ม`:`3 วิธี: 1) กรอกรหัสใต้ห่วง (ทุกร้าน รวมร้านโชห่วย) 2) ส่งรูปใบเสร็จ 7-Eleven / Lawson / Villa / Makro 3) ผูกออเดอร์ออนไลน์ · 190 ml = ${S.rules.p190} · 310 ml = ${S.rules.p310} แต้ม`,
    tier:()=>nextTier()?`ชาร์จให้ครบ ${nextTier().w} สัปดาห์ ใน 8 สัปดาห์ล่าสุด ตอนนี้ ${weeksIn()} สัปดาห์ เพื่อขึ้น ${nextTier().k}`:'คุณอยู่ระดับสูงสุดแล้ว',
    next:()=>nextAction().t,
    why:()=>{const r=recommend()[0];return r?`แนะนำ “${r.r.n}” เพราะ${r.why}`:'ยังไม่มีรายการแนะนำ'},
    human:()=>{S.cases.unshift({id:'CS-'+(1002+S.cases.length),who:meName(),t:'ลูกค้าขอคุยกับทีมงาน',st:'เปิด'});return 'ส่งเรื่องให้ทีมงานแล้ว จะติดต่อกลับทาง LINE ภายใน 24 ชม. (เปิดเคสในหลังบ้านให้แล้ว)'}}[v];
  chatPush(a(),'PULL');log('AI','Volt Buddy ตอบ: '+q)}

function approveReq(p,auto){const sh=S.shops.find(x=>x.id===p.shopId),over=sh.usedM+p.q>quotaOf(sh);
  const why=p.gpsOut?'ตำแหน่งนอกรัศมีร้าน':sh.risk==='สูง'?'ร้านถูกเฝ้าระวัง':sh.hold?'ร้านถูกพักแต้ม':over?'เกินโควตาร้าน':'';
  const res=awardCans(p.items,`${p.shop} (QR ร้าน) · ${p.q} กระป๋อง`,{shop:p.shop,hold:!!why,why});
  const sc=S.scans.find(x=>x.st==='wait'||x.d===p.lines.map(l=>l.t+' × '+l.q).join(', '));
  if(res.cans){sh.usedM+=res.cans;sh.pts+=res.cans;S.user.scansToday++;if(sc)sc.st=why?'hold':'ok';if(sh.id===myShop().id)fxPush({to:'#shopb .cbolt',n:res.cans,label:`ร้าน +${res.cans}`});log(auto?'ระบบ':'ร้าน',`อนุมัติ ${p.q} กระป๋อง ${why?'(พักแต้ม: '+why+')':''}`);done('qr');if(res.iw&&res.iw.win)toast('Instant Win! ดูกระเป๋าคูปอง')}
  else{if(sc)sc.st='cap';log('ระบบ','ลูกค้าชาร์จครบเพดานวันนี้')}}
const A={
  c:(v)=>{if(S.ui.c==='chat'&&v!=='chat'){gateOpen();S.ui.from=v==='home'?null:v;v='home'}else if(v==='home')S.ui.from=null;S.ui.c=v;if(v==='rewards'||v==='collect')S.ui.rd=null;if(v==='quizP')S.ui.qi=0;if(v==='quizW')S.ui.qi=0},
  collectTab:(v)=>{S.ui.c='collect';S.ui.tab=v},
  fl:(v)=>{S.ui.fl=v},imgs:(v)=>{S.ui.rcImgs=Math.max(1,Math.min(6,S.ui.rcImgs+ +v))},
  assist:()=>{if(S.aiOff||S.aiK.l3)return toast('ผู้ช่วยปิดอยู่ชั่วคราว');const sku=$('#rsku').value,q=Math.max(1,+$('#rqty').value||1),st=$('#rstore').value,u=S.user,bo=st==='7-Eleven'&&sku==='s310'?Math.min(q,u.boostPool||0):0,pts=S.rules[sku==='s310'?'p310':'p190']*q+bo*S.rules.bonus7;toast(`ประมาณ +${pts} แต้ม${bo?` (รวม Retail Boost ${bo} กป.)`:''} · ถ่ายให้เห็นร้าน วันที่ รายการชัด · ผู้ช่วยไม่ตัดสินผลการตรวจ`);log('AI','ผู้ช่วยในหน้า: ดูตัวอย่างแต้ม')},
  rg2:(v)=>{S.ui.rg=v},
  noti:()=>toast('การแจ้งเตือนทั้งหมด (ผลตรวจ แต้มเข้า โปรโมชัน) ส่งไปที่แชต LINE OA'),
  rmToggle:()=>{S.ui.rmOpen=!S.ui.rmOpen},rmTab:(v)=>{S.ui.rmTab=v},
  ask:(v)=>reply(v),
  heart:(v)=>{const h=S.user.hearts,i=h.indexOf(v);i<0?h.push(v):h.splice(i,1)},
  goal:(v)=>{const u=S.user;if(u.goal===v){u.goal=null;toast('เอาเป้าหมายออกแล้ว');return}u.goal=v;done('goal');const r=goalReward();log('ลูกค้า','ตั้งเป้ารางวัล '+r.n);toast('ตั้งเป้าแล้ว · ดู Charge Bolt เติมขึ้นทุกครั้งที่ชาร์จ')},
  goalClear:()=>{S.user.goal=null;S.ui.c='rewards'},
  invite:()=>{toast('เปิดรายชื่อเพื่อนใน LINE (LIFF Share) · ส่งการ์ดชวนเพื่อน เพื่อนสมัครและชาร์จกระป๋องแรก คุณได้ +5 แต้ม');log('ลูกค้า','ชวนเพื่อนผ่าน LIFF shareTargetPicker')},
  liffMenu:()=>toast('เมนู LIFF: แชร์หน้านี้ให้เพื่อนใน LINE · รีเฟรช · เปิดในเบราว์เซอร์'),
  liffInfo:()=>toast('เปิดใน LINE ผ่าน LIFF จึงไม่ต้องล็อกอินซ้ำ · ถ้าเปิดนอก LINE ระบบให้เข้าด้วย LINE Login'),
  liffScan:(v)=>{setTimeout(()=>A.liffFill(v));log('ลูกค้า','สแกนด้วยกล้อง LINE (liff.scanCodeV2)')},
  /* runs after the click handler restores the form, so the scanned values stay */
  liffFill:(v)=>{if(v==='code'){const i=$('#ccode');if(i)i.value='VOLT-7K2P-9QX4';toast('กล้อง LINE อ่านรหัสแล้ว · กดยืนยันรหัส')}else{const i=$('#rno');if(i)i.value='R-7011-'+Math.floor(10000+Math.random()*89999);const st=$('#rstore');if(st)st.value='7-Eleven';toast('กล้อง LINE อ่าน QR ใบเสร็จแล้ว · เติมร้านและเลขใบเสร็จให้ · ถ่ายรูปใบเสร็จแล้วส่ง')}},
  /* collect */
  sendReceipt:()=>{const store=$('#rstore').value,no=$('#rno').value.trim(),sku=$('#rsku').value,qty=Math.max(1,Math.min(24,+$('#rqty').value||1)),blur=$('#rblur').checked,aig=$('#raig').checked,flav=S.ui.fl||S.user.flav||'y';
    if(!no)return toast('กรอกเลขใบเสร็จก่อน');const dup=S.receipts.some(r=>r.no===no);
    const r={id:'r'+Date.now(),me:true,store,no,sku,flav,qty,st:'checking',score:0,why:'',blur,ch:store,imgs:S.ui.rcImgs};S.receipts.push(r);log('ลูกค้า',`ส่งใบเสร็จ ${store} ${no} (${r.imgs} รูป)`);done('receipt');
    setTimeout(()=>{
      if(dup){r.st='dup';r.score=.05;r.why='ใบเสร็จซ้ำ';chatPush(`ใบเสร็จ ${no} เคยส่งแล้ว ระบบจึงไม่ชาร์จแต้มซ้ำ`);log('ระบบ','ปฏิเสธใบเสร็จซ้ำ '+no)}
      else if(aig||blur||qty>S.rules.capCans){r.st='review';r.score=aig?.31:blur?.62:.45;r.aigen=aig;r.why=aig?'ตรวจพบ: ใบเสร็จที่ AI สร้าง':blur?'ภาพเบลอ':'จำนวนผิดปกติ';S.ui.sel=r.id;chatPush(`ใบเสร็จ ${store} อยู่ระหว่างทีมตรวจ (ไม่เกิน 24 ชม.)`);log('ระบบ',`ส่งคนตรวจ ${store} · ${r.why} (score ${r.score})`)}
      else{r.st='ok';r.score=.95;const res=awardCans([{sku,qty,flav,ch:store,bp:store==='7-Eleven'&&sku==='s310'}],`${store} · ${SKU[sku].s} × ${qty}`);r.pts=res.pts;chatPush(`ใบเสร็จผ่าน ได้ ${res.pts} แต้ม · รวม ${fmt(S.user.pts)} แต้ม${res.iw&&res.iw.win?' · Instant Win!':''}`);log('ระบบ',`อนุมัติอัตโนมัติ ${store} +${res.pts} แต้ม`)}
      render()},1200)},
  sendCode:()=>{const c=$('#ccode').value.trim().toUpperCase(),u=S.user,used=S.receipts.some(r=>r.no===c);
    if(CODES[c]&&!used){const sku=CODES[c];if(sku==='s310')u.boostPool=(u.boostPool||0)+1;const res=awardCans([{sku,qty:1,flav:u.flav||'y',ch:'รหัส',rcpt:false}],`รหัสใต้ห่วง ${SKU[sku].s}`);S.receipts.push({id:'r'+Date.now(),me:true,store:'รหัสใต้ห่วง',no:c,sku,flav:'y',qty:1,st:'ok',pts:res.pts,ch:'รหัส'});u.codeFails=0;toast(`รหัสถูกต้อง +${res.pts} แต้ม`);log('ลูกค้า',`ใช้รหัส ${c} +${res.pts}`)}
    else{u.codeFails=(u.codeFails||0)+1;toast(used?'รหัสนี้ถูกใช้ไปแล้ว':'รหัสไม่ถูกต้อง');log('ระบบ',`กรอกรหัสผิด (${u.codeFails}/5)`)}},
  sendOnline:()=>{const pl=$('#oplat').value,no=$('#ono').value.trim(),n=+$('#osku').value;if(S.receipts.some(r=>r.no===no))return toast('เลขออเดอร์นี้ถูกใช้แล้ว');
    const r={id:'r'+Date.now(),me:true,store:pl==='other'?'Shopee ร้านทั่วไป':'Volt Official '+(pl==='off'?'Shopee':'Lazada'),no,sku:'s310',flav:S.user.flav||'y',qty:n,ch:'ออนไลน์'};S.receipts.push(r);
    if(pl==='other'){r.st='review';r.score=.7;r.why='ไม่ใช่ร้าน Official';S.ui.sel=r.id;toast('ส่งทีมตรวจแล้ว');log('ลูกค้า','ผูกออเดอร์ร้านทั่วไป → ส่งคนตรวจ')}
    else{r.st='ok';const res=awardCans([{sku:'s310',qty:n,flav:r.flav,ch:'ออนไลน์'}],`ออนไลน์ · 310 ml แพ็ก ${n}`,{hold:true,why:'รอปิดช่วงคืนสินค้า'});r.pts=res.pts;r.st='held';toast(`ออเดอร์ยืนยันแล้ว · แต้ม ${res.pts} พักจนปิดช่วงคืนสินค้า`);log('ลูกค้า',`ผูกออเดอร์ Official +${res.pts}`)}},
  deskCode:()=>{const c=$('#dcode').value.trim().toUpperCase();if(CODES[c]&&!S.receipts.some(r=>r.no===c)){const res=awardCans([{sku:CODES[c],qty:1,flav:S.user.flav||'y',ch:'รหัส',rcpt:false}],'รหัสใต้ห่วง (เว็บ)');S.receipts.push({id:'r'+Date.now(),me:true,store:'รหัสใต้ห่วง',no:c,sku:CODES[c],flav:'y',qty:1,st:'ok',pts:res.pts,ch:'รหัส'});toast(`+${res.pts} แต้ม · มือถือเห็นยอดเดียวกัน`);log('ลูกค้า','ใช้รหัสผ่านเว็บ Desktop')}else toast('รหัสไม่ถูกต้องหรือถูกใช้แล้ว')},
  /* rewards */
  openRw:(v)=>{if(!S.user.reg){S.ui.c='reg1';toast('สมัครสมาชิกก่อนแลกรางวัล');return}const r=S.rewards.find(x=>x.id===v);S.ui.c='redeem';S.ui.rd={id:v,step:'choose',addrOk:!!S.user.address}},
  confirmRw:()=>{const r=S.rewards.find(x=>x.id===S.ui.rd.id),d=S.ui.rd,u=S.user;
    if(!allowed(r))return toast(`รางวัลนี้สำหรับอายุ ${r.minAge} ปีขึ้นไป`);if(soldOut(r))return toast('รางวัลหมดแล้ว');if(u.pts<r.pts)return toast('แต้มไม่พอ');
    if(u.claims.filter(x=>x===r.id).length>=r.cap)return toast(`แลกครบ ${r.cap} สิทธิ์/คนแล้ว`);
    if(!u.otp){d.step='otp';return}
    if(r.ship&&!d.addrOk){d.step='addr';return}
    pay(r)},
  otp:()=>{if(!/^\d{6}$/.test($('#otp').value))return toast('ใส่ตัวเลข 6 หลัก');S.user.otp=true;log('ลูกค้า','ยืนยัน OTP');A.confirmRw()},
  addr:()=>{S.ui.rd.addrOk=true;S.user.address=$('#ad2').value;A.confirmRw()},
  entry:(v)=>{const d=S.draws.find(x=>x.id===v),u=S.user,c=S.rules.entryCost;if(d.only7&&!hasBought7())return toast('ต้องซื้อ 7-Eleven 310 ml พร้อมใบเสร็จก่อน');if(u.pts<c)return toast('แต้มไม่พอ');
    u.pts-=c;u.entries[v]=(u.entries[v]||0)+1;d.entries++;fxPush({n:-c});S.hist=S.hist||[];S.hist.unshift({l:'สิทธิ์ลุ้น '+d.n,p:-c,ch:'ลุ้น'});S.pools[d.budgetPool].res=S.pools[d.budgetPool].res;VoltDash.ingest({redeem:c,who:meName(),name:d.n});log('ลูกค้า',`ใช้ ${c} แต้ม ซื้อสิทธิ์ ${d.n}`);done('draw');toast(`ได้ 1 สิทธิ์ · รวม ${u.entries[v]} สิทธิ์`)},
  lbT:(v)=>{S.ui.lbT=v},
  /* quizzes */
  qP:()=>{const u=S.user;if(u.profileQ>=10)return;u.profileQ++;S.ui.qi=u.profileQ;if(u.profileQ>=10){if(u.firstCan){u.profilePaid=true;doneQ({p:S.rules.profile,l:'Charge Profile ครบ 10 ข้อ'});chatPush(`Charge Profile ครบแล้ว ได้ +${S.rules.profile} แต้ม`)}else{u.pendList.push({l:'Charge Profile',p:S.rules.profile,firstCan:true});u.pend+=S.rules.profile;chatPush(`Charge Profile ครบแล้ว ${S.rules.profile} แต้มจะปลดล็อกหลังชาร์จกระป๋องแรก`)}log('ลูกค้า','ตอบ Charge Profile ครบ 10 ข้อ');done('quiz')}},
  qW:()=>{const u=S.user;S.ui.qi++;if(S.ui.qi>=3){u.weeklyDone=true;S.ui.qi=0;if(u.lastDays>=14){u.entries.d1=(u.entries.d1||0)+1;S.draws[0].entries++;fxPush({toast:'ได้ 1 สิทธิ์จับรางวัล Weekly Draw'});chatPush('ตอบ Weekly Quiz ครบ ได้ 1 สิทธิ์จับรางวัลแทนแต้ม เพราะไม่ได้ชาร์จเกิน 14 วัน')}else{doneQ({p:S.rules.weekly,l:'Weekly Quiz'})}log('ลูกค้า','ตอบ Weekly Quiz ครบ');done('quiz')}},
  /* pending confirm (customer) + shop */
  scanShop:(v)=>{S.ui.sc={id:v,cart:{s190:{y:0,c:0,p:0},s310:{y:0,c:0,p:0}},gpsOut:false};log('ลูกค้า','สแกน QR ร้าน '+S.shops.find(x=>x.id===v).n)},
  scanReset:()=>{S.ui.sc=null},
  cq:(v)=>{const [k,f,d]=v.split('|'),c=S.ui.sc.cart[k];c[f]=Math.max(0,Math.min(24,c[f]+ +d))},
  gpsToggle:()=>{S.ui.sc.gpsOut=!S.ui.sc.gpsOut},
  sendShopReq:()=>{const sc=S.ui.sc,sh=S.shops.find(x=>x.id===sc.id),u=S.user;if(u.scansToday>=S.rules.maxScan)return toast(`วันนี้ขอชาร์จผ่านร้านครบ ${S.rules.maxScan} ครั้งแล้ว`);if(S.pending)return toast('มีคำขอที่รอร้านอนุมัติอยู่');
    const lines=[],items=[];for(const k in sc.cart)for(const f in sc.cart[k])if(sc.cart[k][f]){lines.push({t:`${SKU[k].s} ${FL[f]}`,q:sc.cart[k][f]});items.push({sku:k,flav:f,qty:sc.cart[k][f],ch:'โชห่วย'})}
    const {p,q}=cartPts(sc.cart),pd={shop:sh.n,shopId:sh.id,pts:p,q,lines,items,gpsOut:sc.gpsOut};S.ui.sc=null;
    S.scans.unshift({t:now(),who:'คุณม**',d:lines.map(l=>l.t+' × '+l.q).join(', '),st:'wait'});log('ลูกค้า',`ขอชาร์จ ${q} กระป๋อง ผ่าน QR ${sh.n}`);
    if(sh.id===myShop().id){S.pending=pd;toast('ส่งคำขอให้ร้านแล้ว · ไปกด “อนุมัติ” ที่มือถือร้าน')}else{S.scans[0].st='ok';approveReq(pd,true)}},
  shopCancel:()=>{S.pending=null;const sc=S.scans.find(x=>x.st==='wait');if(sc)sc.st='no';log('ลูกค้า','ยกเลิกคำขอ')},
  shopApprove:()=>{const p=S.pending;if(!p)return;S.pending=null;approveReq(p,false)},
  shopDeny:()=>{S.pending=null;const sc=S.scans.find(x=>x.st==='wait');if(sc)sc.st='no';chatPush('ร้านปฏิเสธรายการที่คุณขอชาร์จ ถ้าไม่ถูกต้องให้ขอใหม่หรือส่งใบเสร็จแทน');log('ร้าน','ปฏิเสธคำขอชาร์จ')},
  shopRedeem:(v)=>{const s=myShop();s.pts-=+v;toast(+v?'แลกส่วนลด 50฿ แล้ว ใช้ได้กับการสั่งของรอบถัดไป':'เซลส์จะนำป้ายไปติดที่ร้านภายใน 7 วัน');log('ร้าน',+v?'แลกแต้มร้าน 300 → ส่วนลด 50฿':'ขอรับป้ายร้านสะสมแต้ม')},
  /* register */
  rg:(v)=>{const i=v.indexOf(':'),k=v.slice(0,i),x=v.slice(i+1),r=S.ui.reg;if(k==='f'){r.f=x;return}const a=r.g,j=a.indexOf(x);if(j>=0)a.splice(j,1);else if(a.length<3)a.push(x);else toast('เลือกได้ไม่เกิน 3 กลุ่ม')},
  regAllow:()=>{S.ui.c='reg2';log('ลูกค้า','อนุญาตสิทธิ์ LIFF (โปรไฟล์ + เพิ่มเพื่อน + ส่งข้อความ)')},
  regSubmit:()=>{const nick=$('#rgNick').value.trim(),ph=$('#rgPhone').value.replace(/\D/g,''),bd=$('#rgBirth').value;
    const err=!nick?'กรอกชื่อเล่น':!/^0\d{9}$/.test(ph)?'เบอร์โทร 10 หลัก ขึ้นต้นด้วย 0':!bd?'เลือกเดือน-ปีเกิด':!S.ui.reg.g.length?'เลือกไลฟ์สไตล์อย่างน้อย 1 กลุ่ม':!$('#rgT').checked?'ต้องยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว':'';
    if(err)return toast(err);
    const [y,m]=bd.split('-').map(Number),age=2570-y-(m>5?1:0);S.ui.rgData={nick,ph,bd,prov:$('#rgProv').value,mk:$('#rgM').checked,an:$('#rgA').checked,age};
    if(age<S.rules.ageMin){S.ui.c='regAge';log('ระบบ',`ปฏิเสธสมัคร: อายุ ${age} < ${S.rules.ageMin} (ไม่เก็บข้อมูล)`);return}
    S.ui.c='reg3';log('ลูกค้า',`ส่งฟอร์มสมัคร · ขอ OTP ไป ${ph.slice(0,3)}-xxx-${ph.slice(-4)}`)},
  otpResend:()=>{toast('ส่งรหัส OTP ใหม่แล้ว');log('ระบบ','ส่ง OTP ใหม่')},
  regOtp:()=>{if(!/^\d{6}$/.test($('#rgOtp').value.trim()))return toast('ใส่รหัส OTP 6 หลัก');const d=S.ui.rgData,u=S.user;
    Object.assign(u,{reg:true,otp:true,name:d.nick,birth:d.bd,prov:d.prov,groups:S.ui.reg.g.slice(),flav:S.ui.reg.f||'y',mk:d.mk,an:d.an,pers:d.an,phone:d.ph});
    u.pendList=[{l:'Welcome',p:S.rules.welcome,firstCan:true}];u.pend=S.rules.welcome;S.kpi.mem++;S.kpi.newMem++;
    chatPush(`ยินดีต้อนรับคุณ${d.nick} สู่ Volt Club\nWelcome ${S.rules.welcome} แต้ม จะปลดล็อกเมื่อชาร์จกระป๋องแรกผ่าน\nเมนูด้านล่างเปลี่ยนเป็นเมนูสมาชิก`);
    VoltDash.ingest({newMember:true,who:'คุณ'+d.nick+' (เดโม)',pts:0});
    log('ระบบ',`สมัครสมาชิกสำเร็จ คุณ${d.nick} · ${d.prov} · ข่าวสาร ${d.mk?'✓':'✗'} · วิเคราะห์ ${d.an?'✓':'✗'}`);done('reg');fxPush({lvl:'WELCOME TO VOLT',sub:'สมัครแล้ว · ชาร์จกระป๋องแรกเพื่อปลดล็อก 20 แต้ม',small:'แตะเพื่อไปต่อ'});S.ui.c='reg4'},
  /* back office */
  b:(v)=>{S.ui.b=v},dtview:(v)=>{S.ui.dt=v},sel:(v)=>{S.ui.sel=v},
  rv:(v)=>{const r=S.receipts.find(x=>x.id===S.ui.sel&&x.st==='review')||S.receipts.find(x=>x.st==='review');if(!r)return;const qn=Math.max(0,Math.min(+$('#aq').value||0,S.rules.capCans));
    if(v==='ok'){r.st='ok';r.qty=qn;if(r.me){const res=awardCans([{sku:r.sku,qty:qn,flav:r.flav||'y',ch:r.ch,bp:r.ch==='7-Eleven'&&r.sku==='s310'}],`${r.store} · ${SKU[r.sku].s} × ${qn}`);r.pts=res.pts;chatPush(`ทีมตรวจอนุมัติใบเสร็จ ${r.store} แล้ว +${res.pts} แต้ม`)}log('หลังบ้าน',`อนุมัติใบเสร็จ ${r.no} (${qn} ชิ้น)`)}
    else if(v==='resubmit'){r.st='resubmit';if(r.me)chatPush(`ใบเสร็จ ${r.store} ภาพไม่ชัด รบกวนถ่ายใหม่อีกครั้ง`);log('หลังบ้าน',`ขอรูปใหม่ ${r.no}`)}
    else{r.st='no';if(r.me)chatPush(`ใบเสร็จ ${r.store} ไม่ผ่านการตรวจ · อุทธรณ์ได้ 1 ครั้ง`);if(v==='fraud'){S.cases.unshift({id:'CS-'+(1002+S.cases.length),who:r.me?meName():r.who,t:'สงสัยทุจริตใบเสร็จ '+r.no,st:'เปิด'});log('หลังบ้าน',`ปฏิเสธ + แจ้งทุจริต ${r.no}`)}else log('หลังบ้าน',`ปฏิเสธใบเสร็จ ${r.no}`)}
    done('review');S.ui.sel=(S.receipts.find(x=>x.st==='review')||{}).id;toast('บันทึกแล้ว · แจ้งลูกค้าทาง LINE')},
  appealReq:(v)=>{const r=S.receipts.find(x=>x.id===v);if(r.appealed)return;r.appealed=true;r.st='review';r.why='อุทธรณ์ครั้งที่ 1';S.appeals.push({id:'ap'+v,no:r.no});log('ลูกค้า','อุทธรณ์ใบเสร็จ '+r.no);toast('ส่งอุทธรณ์แล้ว (ครั้งเดียว)')},
  appeal:(v)=>{S.appeals=S.appeals.filter(a=>a.id!==v);S.ui.b='receipts';toast('ไปที่คิวตรวจใบเสร็จ')},
  rwF:(v)=>{S.ui.rwF=v},rwSel:(v)=>{S.ui.rwSel=v},
  saveRw:()=>{const r=S.rewards.find(x=>x.id===(S.ui.rwSel||S.rewards[0].id));r.pts=Math.max(0,+$('#rwPts').value||0);r.qty=Math.max(r.used,+$('#rwQty').value||0);r.cap=Math.max(1,+$('#rwCap').value||1);r.minAge=Math.max(0,+$('#rwAge').value||0);log('หลังบ้าน',`แก้รางวัล ${r.n}: ${r.pts} แต้ม · ${r.qty} ชิ้น · อายุ ${r.minAge}+`);toast('บันทึกแล้ว ลูกค้าเห็นผลทันที')},
  advRw:(v)=>{const [id,d]=v.split('|'),r=S.rewards.find(x=>x.id===id);r.pts=Math.round(r.pts*(1+.1*+d)/10)*10;log('หลังบ้าน',`ใช้คำแนะนำ AI: ${r.n} → ${r.pts} แต้ม (คนอนุมัติ)`);toast('ปรับแล้ว ลูกค้าเห็นผลทันที')},
  rwStop:()=>{const r=S.rewards.find(x=>x.id===(S.ui.rwSel||S.rewards[0].id));if(soldOut(r)&&left(r)<=0){r.qty+=50;log('หลังบ้าน','เติมสต็อก '+r.n+' +50')}else{r.used=r.qty;log('หลังบ้าน','หยุดรับแลก '+r.n)}},
  cpc:(v)=>{S.cpc=+v;VoltDash.ingest({cpc:+v});log('หลังบ้าน','จำลอง Cost-per-Can ฿'+(+v).toFixed(2))},
  poolMove:()=>{const f=$('#pfrom').value,t=$('#pto').value,amt=Math.max(0,+$('#pamt').value||0),p=S.pools[f];if(f===t)return toast('เลือกถังคนละใบ');if(amt<=0)return toast('ใส่จำนวนเงิน');if(amt>p.plan-p.iss-p.res)return toast('เกินงบที่ยังไม่ผูกของถัง '+f);needApprove('pool',`ย้ายงบ ${f} → ${t} ${baht(amt)}`,{f,t,amt})},
  approve:(v)=>{const a=S.approvals.find(x=>x.id===v);if(!a)return;S.approvals=S.approvals.filter(x=>x.id!==v);const p=a.payload;
    if(a.kind==='rules'){Object.assign(S.rules,p);done('rule')}
    else if(a.kind==='pool'){S.pools[p.f].plan-=p.amt;S.pools[p.t].plan+=p.amt}
    else if(a.kind==='draw'){const d=S.draws.find(x=>x.id===p.id);d.status='open'}
    log('หลังบ้าน','อนุมัติโดยคุณเจ (คนที่ 2): '+a.label);toast('อนุมัติแล้ว มีผลทันที')},
  reject:(v)=>{const a=S.approvals.find(x=>x.id===v);S.approvals=S.approvals.filter(x=>x.id!==v);if(a)log('หลังบ้าน','ปฏิเสธคำขอ: '+a.label)},
  shopSel:(v)=>{S.ui.shopSel=v},goShop:(v)=>{S.ui.b='shops';S.ui.shopSel=v},
  saveQuota:()=>{const s=S.shops.find(x=>x.id===S.ui.shopSel);s.stockIn=Math.max(0,+$('#sstock').value||0);log('หลังบ้าน',`ปรับของเข้า ${s.id} เป็น ${s.stockIn} แพ็ก (โควตา ${quotaOf(s)})`);toast('บันทึกแล้ว')},
  suspend:()=>{const s=S.shops.find(x=>x.id===S.ui.shopSel);s.sus=!s.sus;log('หลังบ้าน',`${s.sus?'ระงับ':'ยกเลิกระงับ'}ร้าน ${s.id} ${s.n}`);if(s.id==='T-0088')done('suspend');toast(s.sus?'ระงับร้านแล้ว':'เปิดร้านแล้ว')},
  holdShop:()=>{const s=S.shops.find(x=>x.id===S.ui.shopSel);s.hold=s.hold?0:1;log('หลังบ้าน',`${s.hold?'พัก':'ปล่อย'}แต้มที่ยังไม่ยืนยันของ ${s.id}`);toast(s.hold?'พักแต้มแล้ว':'ปล่อยแต้มแล้ว')},
  sendSales:()=>{const s=S.shops.find(x=>x.id===S.ui.shopSel);log('หลังบ้าน',`มอบงานเซลส์ตรวจร้าน ${s.id}`);toast('ส่งงานให้เซลส์พื้นที่แล้ว')},
  newLead:()=>{const n=S.leads.length+S.newShops.length+1;S.leads.push({id:'L'+n,n:['ร้านป้าสมศรี','ร้านเฮียหมง','ร้านน้องฟ้า'][n%3],a:['ธนบุรี','โคราช','สงขลา'][n%3]});log('ระบบ','เซลส์ส่งร้านสมัครใหม่')},
  shopOk:(v)=>{const l=S.leads.find(x=>x.id===v);S.leads=S.leads.filter(x=>x.id!==v);S.newShops.push({id:'T-'+(3000+S.newShops.length),n:l.n,a:l.a,stockIn:20,usedM:0,risk:'ต่ำ',why:[],sus:false,hold:0,pts:0,auto:true,credit:0,owner:'คุณมด'});S.shops.push(S.newShops[S.newShops.length-1]);S.newShops=[];log('หลังบ้าน','อนุมัติร้านใหม่ '+l.n);toast('อนุมัติร้านแล้ว · ส่งป้ายและ QR ร้าน')},
  saveRules:()=>{const g=id=>Math.max(0,+$('#'+id).value||0),p={p190:g('r190'),p310:g('r310'),bonus7:g('rb7'),welcome:g('rw1'),profile:g('rpf'),weekly:g('rwk'),trio:g('rtr'),capCans:Math.max(1,g('rcap')),maxScan:Math.max(1,g('rscan')),ageMin:g('rage'),entryCost:Math.max(1,g('rent'))};
    if(JSON.stringify(Object.keys(p).map(k=>p[k]))===JSON.stringify(Object.keys(p).map(k=>S.rules[k])))return toast('ไม่มีการเปลี่ยนแปลง');needApprove('rules','แก้กติกาแต้ม',p)},
  mult:(v)=>{const m=S.mult.find(x=>x.id===v);if(!m.on&&cpcNow()>=1.5)return toast('Governor อยู่โซนเตือน/หยุด เปิดตัวคูณใหม่ไม่ได้');m.on=!m.on;log('หลังบ้าน',`${m.on?'เปิด':'ปิด'}ตัวคูณ ${m.n}`);done('rule')},
  seg:(v)=>{S.ui.seg=v},
  aiDraft:(v)=>{if(S.aiOff||S.aiK.l2)return toast('AI ถูกปิดอยู่ (Kill switch)');const r=VOLT.rfm.find(x=>x.seg===v);S.seg.draft=`(${v}) ${r.push}`.slice(0,120);log('AI','ร่างข้อความถึง '+v+' (รอคนอนุมัติ)')},
  segSend:(v)=>{const m=($('#dmsg').value||'').trim();if(!m)return toast('ใส่ข้อความก่อน');if((S.seg.freq[v]||0)>=2)return toast('ส่งครบ 2 ครั้ง/สัปดาห์แล้ว');if(S.sim.hour<8||S.sim.hour>=22)return toast('ช่วงห้ามส่ง 22:00–08:00');
    S.seg.freq[v]=(S.seg.freq[v]||0)+1;log('หลังบ้าน',`อนุมัติและส่งถึง Segment ${v} (holdout ${S.seg.holdout}%)`);if(S.user.reg&&S.user.mk){chatPush(m,'PUSH');toast('ส่งแล้ว (สมาชิกตัวอย่างได้รับในแชต)')}else toast('ส่งแล้ว · สมาชิกตัวอย่างไม่ได้ยินยอมข่าวสาร จึงไม่ได้รับ')},
  advG:(v)=>{const g=S.user.groups,i=g.indexOf(v);if(i>=0)g.splice(i,1);else if(g.length<3)g.push(v);else toast('เลือกได้ไม่เกิน 3 กลุ่ม')},
  advP:()=>{S.user.pers=!S.user.pers},
  wqNext:()=>{S.ui.wq++;S.ui.qi=0;S.user.weeklyDone=false;log('หลังบ้าน','เผยแพร่ Weekly Quiz สัปดาห์ '+(S.ui.wq%S.weekly.length+1))},
  lbFinal:()=>{const t=S.ui.lbT;S.lbFinal[t]=true;const me=lbRows(t).find(x=>x.me);log('หลังบ้าน','ปิดอันดับ '+t);if(me&&me.rank<=3)chatPush(`ยินดีด้วย! คุณได้อันดับ ${me.rank} ใน Leaderboard`);toast('ปิดอันดับแล้ว')},
  drawNew:()=>{S.ui.drawB=!S.ui.drawB},
  drawSave:()=>{const t=VOLT.drawTemplates[+$('#dtpl').value],n=$('#dnm').value.trim()||t.name,w=Math.max(1,+$('#dwn').value||1);S.draws.push({id:'d'+Date.now(),tpl:+$('#dtpl').value,n,freq:t.freq,entry:t.entry,prize:t.prize,status:'draft',cut:'ตามเทมเพลต',winners:w,permit:$('#dpm').value.trim(),budgetPool:'A3',cost:w*1000,entries:0});S.ui.drawB=false;log('หลังบ้าน','สร้างร่าง Draw '+n)},
  drawPub:(v)=>{const d=S.draws.find(x=>x.id===v);if(!d.permit)return toast('ต้องมีเลขใบอนุญาตชิงโชคก่อนเผยแพร่');d.status='pending';needApprove('draw','เผยแพร่ Draw: '+d.n,{id:v})},
  rigDemo:()=>{S.ui.rigDemo=!S.ui.rigDemo},
  drawRun:(v)=>{const d=S.draws.find(x=>x.id===v),u=S.user,mine=u.entries[v]||0,total=d.entries,names=['คุณบ**','คุณก**','คุณจ**','คุณน**','คุณพ**','คุณส**','คุณม**','คุณร**','คุณว**','คุณอ**'];
    d.snap=hash(v+':'+total+':'+mine);d.seed=hash(d.snap+now());const rn=rngOf(parseInt(d.seed,16));
    const w=[];const youWin=u.reg&&mine>0&&S.ui.rigDemo;if(youWin)w.push('คุณ'+u.name+' (เดโม)');while(w.length<Math.min(d.winners,6))w.push(pick(names,rn)+Math.floor(rn()*90+10));d.winnersList=w;d.status='done';S.pools[d.budgetPool].iss+=d.cost;
    if(youWin){if(ageOf()<S.rules.ageMin)log('ระบบ','ผู้ชนะอายุไม่ถึงเกณฑ์ ตัดสิทธิ์');else{S.wallet.unshift({id:'w'+Date.now(),n:'ผู้ชนะ '+d.n,kind:'draw',code:'WIN-'+d.seed.slice(0,6).toUpperCase(),st:'ready',exp:'ติดต่อภายใน 30 วัน',cost:d.cost/d.winners});chatPush(`ยินดีด้วย! คุณเป็นผู้โชคดี ${d.n} · ทีมงานจะติดต่อเพื่อตรวจอายุและจัดส่งรางวัล`);fxPush({lvl:'YOU WIN!',sub:d.n,small:'แตะเพื่อปิด'})}}
    log('ระบบ',`จับรางวัล ${d.n}: snapshot ${d.snap} seed ${d.seed}`);toast('จับรางวัลแล้ว · เก็บผลแบบแก้ไขไม่ได้')},
  aiK:(v)=>{S.aiK[v]=!S.aiK[v];log('หลังบ้าน',`${S.aiK[v]?'ปิด':'เปิด'} AI ${v.toUpperCase()}`)},
  campToggle:(v)=>{const c=S.campaigns.find(x=>x.id===v),m=S.mult.find(x=>x.id==={fl1:'m1',fl2:'m2'}[v]);if(c.st==='off'&&cpcNow()>=1.5)return toast('Governor อยู่โซนเตือน/หยุด เปิด Flash ไม่ได้');c.st=c.st==='on'?'off':'on';if(m)m.on=c.st==='on';log('หลังบ้าน',`${c.st==='on'?'เปิด':'ปิด'}แคมเปญ ${c.n}`);done('rule')},
  liftRecalc:()=>{const L=S.lift;L.base=98+Math.random()*4;L.exp=L.base*(1.07+Math.random()*.1);log('ระบบ','คำนวณ Lift ใหม่')},
  aiOff:()=>{S.aiOff=!S.aiOff;log('หลังบ้าน',`${S.aiOff?'เปิด':'ปิด'} Kill switch AI`)},
  dsr:()=>{guest(S);log('ระบบ','DSR: ลบข้อมูลสมาชิกตามคำขอ');toast('ลบข้อมูลสมาชิกตัวอย่างแล้ว')},
  /* demo controls */
  week:()=>{const u=S.user;u.wk.shift();u.wk.push(0);u.week=false;u.cansToday=0;u.scansToday=0;u.lastDays+=7;u.weeklyDone=false;S.ui.wq++;S.ui.qi=0;let rel=0;u.pendList=u.pendList.filter(x=>{if(x.hold){rel+=x.p;return false}return true});if(rel){u.pts+=rel;u.pend=u.pendList.reduce((a,b)=>a+b.p,0);S.hist=S.hist||[];S.hist.unshift({l:'ปล่อยแต้มที่พักตรวจ',p:rel,ch:'ระบบ'});chatPush(`ปล่อยแต้มที่พักตรวจ ${rel} แต้มแล้ว`);fxPush({n:rel,label:'ปล่อยแต้ม +'+rel})}log('ระบบ','เริ่มสัปดาห์ใหม่ (เดโม)');toast('ข้ามไปสัปดาห์ถัดไป · ชาร์จสัปดาห์นี้เพื่อนับต่อเนื่อง');done('tier')},
  reset:()=>{S=guest(seed());toast('รีเซ็ตเดโมแล้ว')},
  guest:()=>{S=guest(seed());toast('เริ่มเป็นผู้ใช้ใหม่ · กด “สมัครสมาชิก” ที่ Rich Menu')},
  member:()=>{S=seed();toast('โหลดสมาชิกตัวอย่าง: คุณมายด์ LF2 · 148 แต้ม')},
  dash:()=>{}
};

/* ---------- render loop (animate Charge Bolt level changes across re-renders) ---------- */
const BIDS=['hud','cardbolt','goalbolt','tierbolt','shopb','welbolt'];
function boltSnap(){const m={};BIDS.forEach(id=>{const b=document.querySelector('#'+id+' .cbolt');if(b)m[id]=parseFloat(b.dataset.p||0)});return m}
function boltAnim(prev){for(const id in prev){const b=document.querySelector('#'+id+' .cbolt');if(!b)continue;const np=parseFloat(b.dataset.p||0);if(np>prev[id]+.001){b.style.setProperty('--p',VoltFX.vis(prev[id]));b.dataset.p=prev[id];void b.offsetWidth;VoltFX.setBolt(b,np)}}}
function render(){const pb=boltSnap();renderCust();renderShop();renderFeed();renderDesk();boltAnim(pb);save();flushFx()}
const CLEAR={guest:1,member:1,sendReceipt:1,sendCode:1,sendOnline:1,saveRw:1,deskCode:1,otp:1,addr:1,reset:1,collectTab:1,c:1,openRw:1,saveRules:1,drawSave:1,b:1,segSend:1};
function snap(){const m={};document.querySelectorAll('#cust [id],#shop [id],#desk [id]').forEach(el=>{if(el.matches('input,select,textarea'))m[el.id]=el.type==='checkbox'?el.checked:el.value});return m}
function restore(m){for(const id in m){const el=document.getElementById(id);if(el&&el.matches('input,select,textarea')&&el.type!=='file'){if(el.type==='checkbox')el.checked=m[id];else el.value=m[id]}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled||b.matches('input[type=range]'))return;const k=b.dataset.a,f=A[k];if(!f)return;setFrom(b);const m=snap();f(b.dataset.v,b);render();if(!CLEAR[k])restore(m)});
document.addEventListener('change',e=>{const b=e.target.closest('input[type=range][data-a]');if(!b)return;A[b.dataset.a](b.value,b);render()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('#ccode')){A.sendCode();render()}if((e.key==='Enter'||e.key===' ')&&e.target.matches('.filt span[data-a]')){e.preventDefault();e.target.click()}});
VoltFX.onHold((act,el)=>{const i=act.indexOf(':'),fn=act.slice(0,i),v=act.slice(i+1);if(!A[fn])return;setFrom(el);A[fn](v,el);render()});
function fit(){const w=$('.dtw'),d=$('#desk');const sc=w.clientWidth/1280;d.style.transform='scale('+sc+')';w.style.height=(d.offsetHeight*sc)+'px'}
addEventListener('resize',fit);
load();
/* B2C build: no merchant phone, no shop-QR channel, no shop admin (those live in the B2B Retailer Add-on) */
document.body.classList.add(OPT.d,OPT.b2b?'b2b':'b2c');
if(!OPT.b2b){const sc=$('#shop');if(sc)sc.closest('.col').remove()}
const KI=$('.hero .kick');if(KI)KI.textContent=OPT.b2b?'Volt CRM · Option เสริม · B2B Retailer Add-on':`Volt CRM · B2C · ${OPT.d==='o2'?'Design Option 2 · Bento Hero':'Design Option 1 · App Style'}`;
const HP=$('.hero p');if(HP)HP.textContent=OPT.b2b?'ส่วนเสริมสำหรับร้านโชห่วย: ลูกค้าสแกน QR ร้าน ร้านกดอนุมัติบนมือถือ ร้านสะสมแต้มของร้านเอง และหลังบ้านคุมโควตาร้าน · ใช้ข้อมูลชุดเดียวกับระบบ B2C':'มือถือลูกค้า (LINE → Microsite ผ่าน LIFF) และหลังบ้าน ใช้ข้อมูลชุดเดียวกัน ทำอะไรในมือถือ หลังบ้านเห็นผลทันที · ข้อมูลทั้งหมดเป็นตัวอย่าง';
VoltDash.init({alerts:()=>{const a=[];if(OPT.b2b)S.shops.filter(s=>s.risk==='สูง'&&!s.sus).forEach(s=>a.push({t:`ร้าน ${s.id} ${s.n}: ${s.why[0]} ›`,cls:'r',a:'goShop',v:s.id}));const q=S.receipts.filter(r=>r.st==='review').length;if(q)a.push({t:`คิวตรวจใบเสร็จ ${q} รายการ ›`,cls:'a',a:'b',v:'receipts'});if(S.approvals.length)a.push({t:`รออนุมัติคนที่ 2 ${S.approvals.length} เรื่อง ›`,cls:'a',a:'b',v:'rules'});return a},
  onNoti:()=>{log('หลังบ้าน','ส่งข้อความดึงกลุ่มเสี่ยง (ไม่ซื้อ >21 วัน) กลับ');chatPush('คิดถึงกัน! กลับมาชาร์จสัปดาห์นี้ รับตัวคูณพิเศษ (เฉพาะผู้ยินยอมข่าวสาร)');renderCust();renderFeed();save()}});
render();fit();setTimeout(fit,400);
