/* =====================================================================
   Merchant phone (corner shop): scan customer QR, key in cans, send for
   customer confirmation. Quota = stock-in packs x 6 cans / month.
   ===================================================================== */
const myShop=()=>S.shops[0];
const quotaOf=s=>s.stockIn*6;
function cartPts(){let p=0,q=0;const c=S.ui.cart;if(!c)return{p:0,q:0};for(const k in c){for(const f in c[k]){const n=c[k][f];if(!n)continue;p+=calcPts({sku:k,flav:f,ch:'โชห่วย',qty:n,rcpt:false}).pts;q+=n}}return{p,q}}
function renderShop(){
  const el=$('#shop'),s=myShop(),ui=S.ui,qt=quotaOf(s);
  let h=`<div class="shead"><div class="sp"><b style="font:italic 800 21px 'Bai Jamjuree'">VOLT <span style="color:var(--yel)">PARTNER</span></b><span class="chip ${s.sus?'':'y'}" style="${s.sus?'background:var(--bad);color:#fff;border-color:var(--bad)':''}">${s.sus?'ระงับชั่วคราว':s.hold?'ถูกพักแต้ม':'ยืนยันแล้ว'}</span></div><small>${esc(s.n)} · ${esc(s.a)} · เซลส์: ${esc(s.owner)}</small></div><div class="bd">`;
  if(ui.s==='home'){
    h+=`<button class="btn by" data-a="scan" style="min-height:62px;font-size:20px" ${s.sus?'disabled':''}>${bolt('i')}สแกน QR ลูกค้า</button>${s.sus?'<span class="bad" style="font-size:13px">ร้านถูกระงับโดยหลังบ้าน ติดต่อเซลส์ของคุณ</span>':''}
    <div class="kpi2"><div class="card"><span class="mut" style="font-size:12px">โควตาเดือนนี้ (กระป๋อง)</span><b>${s.usedM}<span class="mut" style="font-size:16px">/${qt}</span></b><span id="shopb" style="display:flex;margin-top:8px;justify-content:center">${VoltFX.bolt(Math.min(1,s.usedM/qt),{size:'md',flavor:s.usedM>qt?'p':'y',label:Math.round(Math.min(1,s.usedM/qt)*100)+'%'})}</span></div><div class="card"><span class="mut" style="font-size:12px">แต้มร้าน</span><b>${fmt(s.pts)}</b><span class="mut" style="font-size:12px">แลกส่วนลดสั่งของ</span></div></div>
    <div class="card" style="display:flex;flex-direction:column;gap:8px;font-size:13px"><b class="h3">แลกแต้มร้าน</b><div class="sp"><span>ส่วนลดสั่ง Volt 1 แพ็ก 50฿ · 300</span><button class="mini" data-a="shopRedeem" data-v="300" ${s.pts<300?'disabled':''}>แลก</button></div><div class="sp"><span>ป้าย “ร้านสะสมแต้ม Volt” · ฟรี</span><button class="mini" data-a="shopRedeem" data-v="0">ขอรับ</button></div></div>
    <span class="h3">สแกนล่าสุด</span>${S.scans.slice(0,5).map(x=>`<div class="li"><div class="t"><b>${x.t} · ${x.who}</b><span class="mut">${x.d}</span></div><b class="${x.st==='ok'?'ok':x.st==='wait'?'warn':'bad'}">${x.st==='ok'?'ยืนยันแล้ว':x.st==='wait'?'รอยืนยัน':x.st==='cap'?'เกินเพดาน':'ลูกค้าปฏิเสธ'}</b></div>`).join('')}`;
  }else if(ui.s==='scan'){
    h+=`<button class="cam" data-a="doScan" aria-label="แตะเพื่อสแกน QR ลูกค้า"><i></i><span>แตะเพื่อสแกน QR บนมือถือลูกค้า</span></button><span class="mut center" style="display:block;font-size:12.5px">QR เปลี่ยนทุก 60 วิ · ระบบตรวจตำแหน่งร้านและความถี่ของลูกค้า</span><button class="btn bo" data-a="s" data-v="home">ยกเลิก</button>`;
  }else if(ui.s==='sku'){
    const {p,q}=cartPts(),scanMax=S.user.scansToday>=S.rules.maxScan,capLeft=S.rules.capCans-S.user.cansToday;
    const row=(k,f)=>`<div class="sp"><span><i class="cthumb im-can-${f}"></i> ${FL[f]}</span><span class="step"><button data-a="qty" data-v="${k}|${f}|-1" aria-label="ลด ${FL[f]}">−</button><b>${ui.cart[k][f]}</b><button data-a="qty" data-v="${k}|${f}|1" aria-label="เพิ่ม ${FL[f]}">+</button></span></div>`;
    h+=`<div class="card sp" style="padding:10px 12px"><span><b>คุณ${esc(S.user.name)}</b> · ${TIER[tierIdx()].k}</span><b class="ok" style="font-size:13px">✓ สแกนแล้ว</b></div>
    <div class="card" style="display:flex;flex-direction:column;gap:8px;padding:12px"><div class="sp"><b>กระป๋อง 190 ml</b><span class="chip">${S.rules.p190} แต้ม</span></div>${row('s190','y')}${row('s190','c')}${row('s190','p')}</div>
    <div class="card" style="display:flex;flex-direction:column;gap:8px;padding:12px"><div class="sp"><b>กระป๋อง 310 ml</b><span class="chip">${S.rules.p310} แต้ม</span></div>${row('s310','y')}${row('s310','c')}${row('s310','p')}</div>
    <div class="sp" style="font-size:15px"><b>รวม ${q} กระป๋อง</b><b class="num" style="font-size:22px">+${p} แต้ม</b></div>
    ${q>capLeft?`<span class="warn" style="font-size:13px">ลูกค้ามีสิทธิ์ชาร์จได้อีก ${Math.max(0,capLeft)} กระป๋องวันนี้ (เพดาน ${S.rules.capCans}/วัน) ส่วนเกินจะไม่ได้แต้ม</span>`:''}${scanMax?`<span class="bad" style="font-size:13px">ลูกค้านี้ร่วมครบ ${S.rules.maxScan} ครั้งวันนี้แล้ว</span>`:''}${s.usedM+q>qt?`<span class="warn" style="font-size:13px">เกินโควตาเดือนนี้ ระบบจะแจ้งเซลส์ตรวจ แต้มยังชาร์จให้ลูกค้าตามปกติ</span>`:''}
    <button class="btn bn" data-a="sendCart" ${!q||scanMax?'disabled':''}>ส่งให้ลูกค้ายืนยัน</button><button class="btn bo" data-a="s" data-v="home">ยกเลิก</button>`;
  }else if(ui.s==='wait'){
    h+=`<div class="center" style="display:flex;flex-direction:column;gap:12px;padding-top:40px;align-items:center">${VoltFX.bolt(0,{size:'lg',state:'wait'})}<b class="h3" style="font-size:20px">รอลูกค้ายืนยัน</b><span class="mut">ลูกค้าจะเห็นหน้าต่างให้กดค้างยืนยันในมือถือ (เครื่องซ้าย)</span><b class="num" style="font-size:28px">+${S.pending?S.pending.pts:0} แต้ม</b></div>`;
  }else if(ui.s==='done'){
    h+=`<div class="center" style="display:flex;flex-direction:column;gap:12px;padding-top:40px;align-items:center"><b class="h3" style="font-size:20px">${ui.sRes==='ok'?'ลูกค้ายืนยันแล้ว':ui.sRes==='cap'?'ลูกค้าชาร์จครบเพดานวันนี้':'ลูกค้าปฏิเสธรายการ'}</b>${ui.sRes==='ok'?`<span id="shopb" style="display:flex;justify-content:center">${VoltFX.bolt(Math.min(1,s.usedM/qt),{size:'lg',flavor:'y',label:`โควตา ${s.usedM}/${qt}`})}</span>`:''}<span class="mut">${ui.sRes==='ok'?'แต้มร้านเพิ่มแล้ว · โควตาอัปเดต':'กรุณาตรวจจำนวนกับลูกค้าแล้วสแกนใหม่'}</span><button class="btn bn" data-a="s" data-v="home">กลับหน้าร้าน</button></div>`;
  }
  el.innerHTML=h+'</div>';
}
function renderFeed(){
  const TRY=[['reg','สมัครสมาชิก: LINE Login → ฟอร์ม (อายุ 15+) → OTP รับ Welcome 20 แต้ม (รอกระป๋องแรก)'],['qr','ร้านสแกน QR → ลูกค้ากดค้างยืนยัน เห็นสายฟ้าบินเข้า Charge Bolt'],['receipt','ส่งใบเสร็จ (ลองรูปเบลอ เลขซ้ำ หรือใบเสร็จ AI สร้าง)'],['review','หลังบ้านอนุมัติใบเสร็จในคิวตรวจ'],['goal','ตั้งเป้ารางวัล แล้วดู Charge Bolt เติมตามแต้ม'],['quiz','ตอบ Charge Profile / Weekly Quiz'],['iw','ชาร์จกระป๋องเพื่อลุ้น Instant Win (เดโมตั้งโอกาสสูง)'],['draw','ใช้แต้มซื้อสิทธิ์ Lucky Draw แล้วให้หลังบ้านจับรางวัล'],['rule','หลังบ้านเปิดตัวคูณ แล้วสแกนใหม่'],['suspend','หลังบ้านระงับร้านเจ๊หน่อย แล้วดูมือถือร้าน'],['tier','กด “ข้ามสัปดาห์” แล้วชาร์จอีกครั้ง เพื่อ Level Up']];
  $('#feed').innerHTML=`<div class="panel"><h3>ลองเล่นตามนี้</h3><ol class="try">${TRY.map(([k,t])=>`<li class="${S.ui.done[k]?'done':''}">${t}</li>`).join('')}</ol></div>
  <div class="panel"><div class="sp"><h3>สิ่งที่เกิดขึ้นในระบบ</h3><span class="mut" style="font-size:12px">Audit Log</span></div><div>${S.log.length?S.log.slice(0,9).map(l=>`<div class="ev"><i class="${l.w==='ลูกค้า'?'c':l.w==='ร้าน'?'s':l.w==='หลังบ้าน'?'b':'a'}">${l.w}</i><span>${esc(l.t)}</span><time>${l.at}</time></div>`).join(''):'<span class="mut" style="font-size:13px">ยังไม่มีเหตุการณ์ ลองกดที่มือถือลูกค้าหรือร้านดู</span>'}</div></div>`;
}
