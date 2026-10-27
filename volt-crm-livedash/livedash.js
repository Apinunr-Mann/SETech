/* Volt Live Dashboard: self-contained, simulated live feed; hosts can push real events with VoltDash.ingest() */
window.VoltDash=(function(){
  const CH=[['7-Eleven','#19C3F0',.46],['โชห่วย','#FFE11A',.32],['Lawson','#8A4DFF',.09],['Makro','#2F6BFF',.07],['ออนไลน์+','#C9D2FF',.06]];
  const CK=CH.map(c=>c[0]);
  let sd=11;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  const fmt=n=>Math.round(n).toLocaleString('en-US');
  const fk=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':fmt(n);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const split=t=>{const o={};CH.forEach(([k,,s])=>o[k]=Math.round(t*s*(.9+rnd()*.2)));return o};
  const dlab=[];for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*864e5);dlab.push(d.getDate()+'/'+(d.getMonth()+1))}
  const D={filter:'all',tab:'wk',board:'mem',paused:false,fsel:1,riskFix:0,last:Date.now(),
    wk:{lab:[...Array(12)].map((_,i)=>'W'+(i+1)),cur:5,prog:.38,act:[52,55,58,61,63,24.6].map(x=>split(x*1000)),tgt:[50,54,57,60,62,64,66,66,64,62,60,56].map(x=>x*1000),name:'รายสัปดาห์'},
    dy:{lab:dlab,cur:13,prog:.42,act:[8.4,8.9,9.1,8.7,9.6,10.2,9.4,8.8,9.3,9.5,9.0,9.9,10.4,4.1].map(x=>split(x*1000)),tgt:Array(14).fill(8800),name:'รายวัน'},
    mo:{lab:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.'],cur:2,prog:.3,act:[58,236,88].map(x=>split(x*1000)),tgt:[55,240,265,250,120].map(x=>x*1000),name:'รายเดือน'},
    fun:{mem:48210,act:30120,rep:21080,red:9640},tg:{mem:50000,act:30000,rep:20000,red:12000},
    ptsOut:1204000,ptsUse:402000,budget:31.0,lift:11.8,base:{cans:0},
    ret:{d:[410,432,450,441,470,488,476,462,481,495,488,510,522,236],n:[190,184,201,176,188,196,170,172,180,175,168,182,176,88]},
    cyc:73,cycDays:5.1,risk:14.0,
    wa:[8120,8840,9020,8700,9610,10220,9400],waPrev:[7900,8420,8610,8550,9300,9880,9120],
    mem:[{n:'คุณบอส',t:'LF4',v:612},{n:'คุณแพร',t:'LF3',v:505},{n:'คุณนนท์',t:'LF3',v:388},{n:'คุณจูน',t:'LF2',v:171},{n:'คุณมายด์',t:'LF2',v:148,me:1},{n:'คุณเก่ง',t:'LF2',v:120}],
    shop:[{n:'ร้านเจ๊หน่อย',t:'บางแค',v:412},{n:'ร้านลุงชัย',t:'หาดใหญ่',v:388},{n:'ร้านเฮียกิม',t:'เชียงใหม่',v:301},{n:'ร้านป้าแดง',t:'ลำลูกกา',v:296},{n:'ร้านยายศรี',t:'ขอนแก่น',v:254},{n:'ร้านพี่ต่าย',t:'โคราช',v:233}],
    tk:[]};
  const today=(new Date().getDay()+6)%7;for(let i=today+1;i<7;i++)D.wa[i]=0;D.wa[today]=Math.round(D.wa[today]*.42);
  const AV=['#19C3F0','#FFE11A','#8A4DFF','#2F6BFF','#4BE39A','#FF9BD2'];
  let root,opts={},toastT;

  const sumF=o=>D.filter==='all'?CK.reduce((a,k)=>a+o[k],0):o[D.filter];
  const share=()=>D.filter==='all'?1:CH.find(c=>c[0]===D.filter)[2];
  const chTot=k=>D.wk.act.reduce((a,o)=>a+o[k],0);
  const cansAll=()=>CK.reduce((a,k)=>a+chTot(k),0);

  function build(){
    root.innerHTML=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="ldgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#19C3F0"/><stop offset="1" stop-color="#2F6BFF" stop-opacity=".55"/></linearGradient>
      <linearGradient id="ldgY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE11A"/><stop offset="1" stop-color="#FFB800" stop-opacity=".6"/></linearGradient>
      <linearGradient id="ldgD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#19C3F0"/><stop offset="1" stop-color="#8A4DFF"/></linearGradient>
      <linearGradient id="ldgR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A4DFF"/><stop offset="1" stop-color="#FF7A7F"/></linearGradient>
      <linearGradient id="ldgA1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A4DFF" stop-opacity=".55"/><stop offset="1" stop-color="#8A4DFF" stop-opacity="0"/></linearGradient>
      <linearGradient id="ldgA2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#19C3F0" stop-opacity=".5"/><stop offset="1" stop-color="#19C3F0" stop-opacity="0"/></linearGradient></defs></svg>
    <div class="ld-top"><h3>Live Dashboard</h3><span class="ld-live ${D.paused?'off':''}" data-r="live"><i></i>${D.paused?'หยุดชั่วคราว':'LIVE'}</span><span class="ld-clock" data-r="clock"></span><span class="ld-sp"></span>
      <div class="ld-chips" role="group" aria-label="กรองช่องทาง"><button class="ld-chip" data-ld="f:all" aria-pressed="${D.filter==='all'}">ทุกช่องทาง</button>${CH.map(([k,c])=>`<button class="ld-chip" data-ld="f:${k}" aria-pressed="${D.filter===k}"><i style="background:${c}"></i>${k}</button>`).join('')}</div>
      <button class="ld-btn ${D.paused?'y':''}" data-ld="pause">${D.paused?'▶ เล่นต่อ':'❚❚ หยุด'}</button></div>
    <div class="ld-alerts" data-r="alerts"></div>
    <div class="ld-grid">
      <section class="ld-c ld-funnel"><div class="ld-h"><b>Conversion</b><span>Member Funnel · คลิกเพื่อดูรายละเอียด</span></div>
        <div class="ld-fwrap"><div class="ld-stack" data-r="stack"></div><div class="ld-pills" data-r="pills"></div></div>
        <div class="ld-fdet" data-r="fdet"></div>
        <div class="ld-stats"><div><span>กระป๋องสะสม</span><b data-n="cans" data-f="k">0</b><small data-r="today"></small></div><div><span>แต้มออก</span><b data-n="pts" data-f="k">0</b><small data-r="burn"></small></div><div><span>งบรางวัลใช้</span><b data-n="bud" data-f="p1">0</b><small>แผน 29%</small></div></div></section>
      <section class="ld-c ld-trend"><div class="ld-th"><div><div class="ld-h"><b>กระป๋อง: เป้า vs จริง</b></div><div class="ld-tabs" role="group" aria-label="ช่วงเวลา">${['dy','wk','mo'].map(t=>`<button data-ld="tab:${t}" aria-pressed="${D.tab===t}">${D[t].name}</button>`).join('')}</div></div>
        <div class="ld-kv"><div><span>Target</span><b data-n="tg" data-f="i" style="color:#9AA5DD">0</b></div><div><span>Actual</span><b data-n="ac" data-f="i">0</b></div><div><span>KPI</span><b data-n="kpi" data-f="p0" style="color:#FFE11A">0</b></div></div></div>
        <div data-r="trend" class="grow"></div></section>
      <section class="ld-c ld-ret"><div class="ld-h"><b>Retention</b><span>ซื้อซ้ำ / ซื้อใน 30 วัน</span></div><div class="ld-dn" data-r="retd"></div><div class="ld-leg"><span><i style="background:#8A4DFF"></i>ซื้อซ้ำ</span><span><i style="background:#19C3F0"></i>ลูกค้าใหม่</span></div><div data-r="wave"></div><span class="ld-h"><span>14 วันล่าสุด · คนที่ส่งแต้มต่อวัน</span></span></section>
      <section class="ld-c ld-cyc"><div class="ld-h"><b>Purchase Cycle</b><span>รอบการซื้อซ้ำ</span></div><div class="ld-cycw" data-r="cyc"></div></section>
      <section class="ld-c ld-pipe"><div class="ld-pw"><div><div class="ld-h"><b>ช่องทาง</b><span>คลิกแท่งเพื่อกรอง</span></div><div data-r="pipe" class="grow"></div></div><div><div class="ld-h"><b>Weekly Activity</b><span data-r="wapct"></span></div><div data-r="wa"></div></div></div></section>
      <section class="ld-c ld-board"><div class="ld-h"><b>Leaderboard</b><div class="ld-tabs"><button data-ld="bd:mem" aria-pressed="${D.board==='mem'}">สมาชิก</button><button data-ld="bd:shop" aria-pressed="${D.board==='shop'}">ร้านโชห่วย</button></div></div><div data-r="board" style="display:flex;flex-direction:column;gap:6px"></div></section>
    </div>
    <div class="ld-ticker"><b>⚡ LIVE FEED</b><div class="ld-tk" data-r="tk"></div></div>
    <div class="ld-tip" hidden></div>`;
    stack();setTimeout(()=>root.querySelectorAll('.grow').forEach(e=>e.classList.remove('grow')),1400);
  }
  const R=k=>root.querySelector(`[data-r="${k}"]`);
  const STG=[['สมาชิก','สมัครผ่าน LINE OA','mem','linear-gradient(90deg,#19C3F0,#2F6BFF)'],['ซื้อใน 30 วัน','ส่งแต้มอย่างน้อย 1 ครั้ง','act','linear-gradient(90deg,#2F6BFF,#6A5BFF)'],['ซื้อซ้ำ','2 ครั้งขึ้นไป','rep','linear-gradient(90deg,#6A4DFF,#B04DFF)'],['แลกรางวัล','ใช้แต้มแล้ว','red','linear-gradient(90deg,#FFB800,#FFE11A)']];
  function stack(){
    R('stack').innerHTML=STG.map((s,i)=>`<button class="ld-stg ${D.fsel===i?'on':''}" data-ld="stg:${i}" style="width:${100-i*15}%;background:${s[3]};${i===3?'color:#0B1247;text-shadow:none':''}" data-r="stg${i}" aria-label="${s[0]}">0%</button>`).join('')+`<div class="ld-bowl" data-tip="ยอดขายกระป๋องเทียบ baseline ก่อนแคมเปญ · เป้า +10–15%">ยอดขาย +<span data-n="lift" data-f="p1n">0</span>%</div>`;
    R('pills').innerHTML=STG.map((s,i)=>`<button class="ld-pill ${D.fsel===i?'on':''}" data-ld="stg:${i}"><span><b>${s[0]}</b><small>${s[1]}</small></span><em><span data-n="f${i}" data-f="i">0</span><small data-r="k${i}"></small></em></button>`).join('');
  }
  function update(flash){
    const F=D.fun,T=D.tg;const vals=[F.mem,F.act,F.rep,F.red];const conv=[F.mem/T.mem,F.act/F.mem,F.rep/F.act,F.red/F.rep];
    STG.forEach((s,i)=>{R('stg'+i).textContent=(conv[i]*100).toFixed(0)+'%';set('f'+i,vals[i]);const k=vals[i]/T[s[2]]*100;const el=R('k'+i);el.textContent=`KPI ${k.toFixed(0)}%`;el.style.color=k>=100?'#4BE39A':k>=85?'#FFE11A':'#FF7A7F'});
    const fs=D.fsel;R('fdet').textContent=`${STG[fs][0]}: ${fmt(vals[fs])} คน · ${fs?`${(conv[fs]*100).toFixed(1)}% ของขั้นก่อนหน้า`:`${(conv[0]*100).toFixed(1)}% ของเป้าสมาชิก`} · เป้า ${fmt(T[STG[fs][2]])}`;
    set('lift',D.lift);set('cans',cansAll()*share()+D.base.cans);set('pts',D.ptsOut*share());set('bud',D.budget);
    R('today').textContent=`+${fmt(sumF(D.dy.act[D.dy.cur]))} วันนี้`;R('burn').textContent=`burn ${(D.ptsUse/D.ptsOut*100).toFixed(0)}%`;
    trend(flash);retention();cycle();pipe(flash);weekly();board();ticker();alerts();
    R('live').className='ld-live'+(D.paused?' off':'');R('live').lastChild.textContent=D.paused?'หยุดชั่วคราว':'LIVE';
  }
  function trend(flash){
    const s=D[D.tab],n=s.lab.length,sh=share();const act=s.act.map((o,i)=>i<=s.cur?sumF(o):null),tgt=s.tgt.map(t=>t*sh);
    const W=600,H=180,l=44,b=22,t=16,mx=Math.max(...tgt,...act.filter(x=>x!=null))*1.15,cw=(W-l)/n,bw=cw*.56,y=v=>H-b-(v/mx)*(H-b-t);
    let g='';for(let k=0;k<=3;k++){const v=mx/3*k;g+=`<line x1="${l}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,.07)"/><text x="${l-8}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="#9AA5DD">${fk(v)}</text>`}
    let bars='',labs='',top=act.indexOf(Math.max(...act.filter(x=>x!=null)));
    act.forEach((v,i)=>{const x=l+cw*i+(cw-bw)/2;labs+=`<text x="${x+bw/2}" y="${H-6}" text-anchor="middle" font-size="10" fill="${i===s.cur?'#FFE11A':'#9AA5DD'}">${s.lab[i]}</text>`;
      if(v==null){bars+=`<rect x="${x}" y="${y(tgt[i])}" width="${bw}" height="${H-b-y(tgt[i])}" rx="4" fill="none" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 3"/>`;return}
      bars+=`<rect class="b ${flash&&i===s.cur?'pulse':''}" x="${x}" y="${y(v)}" width="${bw}" height="${Math.max(1,H-b-y(v))}" rx="4" fill="url(#${i===s.cur?'ldgY':'ldgB'})" style="animation-delay:${i*40}ms" data-tip="${s.lab[i]}${i===s.cur?' (กำลังเก็บ)':''}\nจริง ${fmt(v)} กระป๋อง\nเป้า ${fmt(tgt[i])} · ${(v/tgt[i]*100).toFixed(0)}%"/>`;
      if(i===top)bars+=`<text x="${x+bw/2}" y="${y(v)-6}" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">${fk(v)}</text>`});
    const pts=tgt.map((v,i)=>[l+cw*i+cw/2,y(v)]);
    const line=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="2"/>`+pts.map((p,i)=>`<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#0B1247" stroke="#fff" stroke-width="2" data-tip="เป้า ${s.lab[i]}: ${fmt(tgt[i])}"/>`).join('');
    R('trend').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟกระป๋องจริงเทียบเป้า${s.name}">${g}${bars}${line}${labs}</svg>`;
    const done=act.slice(0,s.cur).reduce((a,v)=>a+v,0)+act[s.cur],tg=tgt.slice(0,s.cur).reduce((a,v)=>a+v,0)+tgt[s.cur]*s.prog;
    set('tg',tg);set('ac',done);set('kpi',done/tg*100);
  }
  function donut(p,r,sw,grad,label,sub,size){const c=2*Math.PI*r;return `<div class="ld-dn" style="width:${size}px;height:${size}px;margin:0 auto"><svg viewBox="0 0 ${r*2+sw*2} ${r*2+sw*2}" style="transform:rotate(-90deg)"><circle cx="${r+sw}" cy="${r+sw}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${sw}"/><circle cx="${r+sw}" cy="${r+sw}" r="${r}" fill="none" stroke="url(#${grad})" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c*p} ${c}" style="transition:stroke-dasharray .8s;filter:drop-shadow(0 0 6px rgba(25,195,240,.5))"/></svg><div class="c"><b style="font-size:${size/4.4}px">${label}</b><small>${sub}</small></div></div>`}
  function retention(){
    const p=D.fun.rep/D.fun.act;R('retd').innerHTML=donut(p,54,14,'ldgD',(p*100).toFixed(0)+'%','ซื้อซ้ำ',136);R('retd').setAttribute('data-tip',`ซื้อซ้ำ ${fmt(D.fun.rep)} จาก ${fmt(D.fun.act)} คนที่ซื้อใน 30 วัน`);
    const W=260,H=80,a=D.ret.d.map((v,i)=>i===13?Math.round(v/D.dy.prog):v),b=D.ret.n.map((v,i)=>i===13?Math.round(v/D.dy.prog):v),mx=Math.max(...a)*1.1,x=i=>i/(a.length-1)*W,y=v=>H-v/mx*H;
    const path=arr=>arr.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
    R('wave').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="คนซื้อซ้ำและลูกค้าใหม่รายวัน"><path d="${path(a)} L${W} ${H} L0 ${H}Z" fill="url(#ldgA1)"/><path d="${path(a)}" fill="none" stroke="#8A4DFF" stroke-width="2"/><path d="${path(b)} L${W} ${H} L0 ${H}Z" fill="url(#ldgA2)"/><path d="${path(b)}" fill="none" stroke="#19C3F0" stroke-width="2"/>${a.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="6" fill="transparent" data-tip="${dlab[i]}\nซื้อซ้ำ ${fmt(v)} · ใหม่ ${fmt(b[i])}"/>`).join('')}</svg>`;
  }
  function cycle(){
    R('cyc').innerHTML=`<div data-tip="ลูกค้าที่กลับมาซื้อภายใน 7 วันหลังซื้อครั้งก่อน">${donut(D.cyc/100,46,13,'ldgD',D.cyc.toFixed(0)+'%',`เฉลี่ย ${D.cycDays.toFixed(1)} วัน`,128)}<div class="ld-leg" style="margin-top:4px"><span>ซื้อซ้ำภายใน 7 วัน</span></div></div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center"><div data-tip="สมาชิกที่ไม่ซื้อเกิน 21 วัน เสี่ยงหลุด">${donut(D.risk/100,30,10,'ldgR',D.risk.toFixed(1)+'%','Risk',86)}</div><span style="font-size:11.5px;color:#9AA5DD;text-align:center">ไม่ซื้อ &gt;21 วัน · ${fmt(D.fun.act*D.risk/100)} คน</span><button class="ld-btn y" data-ld="noti">${D.riskFix?'กำลังดึงกลับ…':'ส่ง AI Noti ดึงกลับ'}</button></div>`;
  }
  function pipe(flash){
    const W=200,H=150,b=20,t=18,vals=CH.map(c=>chTot(c[0])),mx=Math.max(...vals)*1.12,cw=W/CH.length,bw=cw*.6;
    R('pipe').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="กระป๋องสะสมแยกช่องทาง">${CH.map(([k,c],i)=>{const v=vals[i],h=v/mx*(H-b-t),x=cw*i+(cw-bw)/2,dim=D.filter!=='all'&&D.filter!==k;
      return `<rect class="b ${flash&&D.lastCh===k?'pulse':''}" x="${x}" y="${H-b-h}" width="${bw}" height="${h}" rx="5" fill="${c}" fill-opacity="${dim?.25:.9}" data-ld="f:${k}" style="animation-delay:${i*60}ms" data-tip="${k}\n${fmt(v)} กระป๋อง · ${(v/vals.reduce((a,c)=>a+c,0)*100).toFixed(1)}%\nคลิกเพื่อกรอง"/><text x="${x+bw/2}" y="${H-b-h-5}" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">${fk(v)}</text><text x="${x+bw/2}" y="${H-5}" text-anchor="middle" font-size="10" fill="#9AA5DD">${k}</text>`}).join('')}</svg>`;
  }
  function weekly(){
    const W=200,H=150,b=20,t=26,days=['จ','อ','พ','พฤ','ศ','ส','อา'],tot=D.wa.reduce((a,v)=>a+v,0),mx=Math.max(...D.wa,...D.waPrev)*1.15,x=i=>14+i*(W-28)/6,y=v=>H-b-v/mx*(H-b-t);
    const pts=D.wa.map((v,i)=>[x(i),y(v)]).slice(0,today+1),prev=D.waPrev.map((v,i)=>x(i)+','+y(v)).join(' ');
    R('wapct').textContent=`${fk(tot)} กระป๋อง · เส้นประ = สัปดาห์ก่อน`;
    R('wa').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="กิจกรรมรายวันในสัปดาห์นี้เทียบสัปดาห์ก่อน"><polyline points="${prev}" fill="none" stroke="#8A4DFF" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="4 4"/>${D.waPrev.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="transparent" data-tip="${days[i]} สัปดาห์ก่อน: ${fmt(v)} กระป๋อง"/>`).join('')}<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#19C3F0" stroke-width="2.5"/>${D.wa.map((v,i)=>i>today?`<circle cx="${x(i)}" cy="${H-b}" r="3" fill="rgba(255,255,255,.15)"/>`:`<circle class="pt" cx="${x(i)}" cy="${y(v)}" r="${i===today?6:4}" fill="${i===today?'#FFE11A':'#19C3F0'}" stroke="#0B1247" stroke-width="2" data-tip="${days[i]}: ${fmt(v)} กระป๋อง${i===today?' (วันนี้ สด)':''}"/><text x="${x(i)}" y="${y(v)-10}" text-anchor="middle" font-size="9.5" fill="${i===today?'#FFE11A':'#fff'}">${(v/tot*100).toFixed(0)}%</text>`).join('')}${days.map((d,i)=>`<text x="${x(i)}" y="${H-4}" text-anchor="middle" font-size="10" fill="${i===today?'#FFE11A':'#9AA5DD'}">${d}</text>`).join('')}</svg>`;
  }
  function board(){
    const list=(D.board==='mem'?D.mem:D.shop).slice().sort((a,b)=>b.v-a.v);const top=list[0].v;let rows=list.slice(0,5);const me=list.findIndex(r=>r.me);if(me>4)rows=rows.slice(0,4).concat(list[me]);
    R('board').innerHTML=rows.map(r=>{const i=list.indexOf(r);return `<div class="ld-row ${r.me?'me':''}" data-tip="${esc(r.n)} · ${esc(r.t)}\n${fmt(r.v)} ${D.board==='mem'?'แต้ม':'กระป๋องสัปดาห์นี้'}"><small>Top-${i+1}</small><span class="ld-av" style="background:${AV[i%6]}">${esc(r.n.replace(/^(คุณ|ร้าน)/,'').slice(0,1))}</span><div><span>${esc(r.n)} <small>${esc(r.t)}</small></span><div class="ld-bar"><i style="width:${r.v/top*100}%"></i></div></div><em>${fmt(r.v)}</em></div>`}).join('')+`<div class="ld-leg" style="justify-content:flex-start"><span><i style="background:#2F6BFF"></i>${D.board==='mem'?'แต้มสะสม':'กระป๋องที่สแกน'}</span><span><i style="background:#FFE11A"></i>คุณ (เดโม)</span></div>`;
  }
  function ticker(){R('tk').innerHTML=D.tk.slice(0,6).map(t=>`<span>${t}</span>`).join('')||'<span>รอข้อมูลสด…</span>'}
  function alerts(){const a=opts.alerts?opts.alerts():[];R('alerts').innerHTML=a.map(x=>`<button class="${x.cls||''}" data-a="${x.a}" data-v="${esc(x.v||'')}">${esc(x.t)}</button>`).join('');R('alerts').hidden=!a.length}
  /* count-up */
  const shown={};let raf=0;
  function set(k,v){const el=root.querySelector(`[data-n="${k}"]`);if(!el)return;el._to=v;if(el._v==null)el._v=shown[k]!=null?shown[k]:0;if(!raf)raf=requestAnimationFrame(step)}
  function out(el){const f=el.dataset.f,v=el._v;el.textContent=f==='k'?fk(v):f==='p1'?v.toFixed(1)+'%':f==='p1n'?v.toFixed(1):f==='p0'?v.toFixed(0)+'%':fmt(v)}
  function step(){raf=0;let more=false;root.querySelectorAll('[data-n]').forEach(el=>{if(el._to==null)return;const d=el._to-el._v;if(Math.abs(d)<.05){el._v=el._to}else{el._v+=d*.18;more=true}shown[el.dataset.n]=el._v;out(el)});if(more)raf=requestAnimationFrame(step)}

  function pick(){let r=rnd(),a=0;for(const c of CH){a+=c[2];if(r<=a)return c[0]}return CK[0]}
  const SHOPS=['ร้านเจ๊หน่อย','ร้านลุงชัย','ร้านเฮียกิม','ร้านยายศรี','ร้านพี่ต่าย'],FLV=['Tropical','Blueberry','Forest Fruit'];
  function ingest(ev){
    ev=ev||{};
    if(ev.redeem){D.ptsUse+=ev.redeem;D.budget+=ev.redeem*4e-6;if(ev.first)D.fun.red++;D.tk.unshift(`${esc(ev.who||'สมาชิก')} แลก <b>${esc(ev.name||'รางวัล')}</b> −${fmt(ev.redeem)} แต้ม`);D.last=Date.now();update(false);return}
    const ch=CK.includes(ev.ch)?ev.ch:pick(),cans=ev.cans||1+Math.floor(rnd()*5),pts=ev.pts!=null?ev.pts:cans*(ch==='โชห่วย'?1:2);
    [D.wk,D.dy,D.mo].forEach(s=>s.act[s.cur][ch]+=cans);D.ptsOut+=pts;D.budget+=pts*1.5e-6;D.lift+=cans*.0006;D.wa[today]+=cans;
    if(rnd()<.7)D.ret.d[13]++;else D.ret.n[13]++;if(rnd()<.35)D.fun.mem++;if(rnd()<.45)D.fun.act++;if(rnd()<.32)D.fun.rep++;
    if(D.riskFix){D.risk=Math.max(9,D.risk-.35);D.riskFix--}else D.risk=Math.min(16,D.risk+(rnd()-.45)*.08);
    const me=D.mem.find(m=>m.me);if(ev.me!=null){me.v=ev.me;if(ev.tier)me.t=ev.tier}else{const m=D.mem[Math.floor(rnd()*D.mem.length)];if(!m.me)m.v+=pts}
    const sh=ch==='โชห่วย'?(ev.shop||SHOPS[Math.floor(rnd()*SHOPS.length)]):null;if(sh){const s=D.shop.find(x=>x.n===sh);if(s)s.v+=cans}
    const who=ev.who||['คุณป**','คุณน**','คุณฟ**','คุณต**','คุณอ**'][Math.floor(rnd()*5)];
    D.tk.unshift(`${esc(who)} · ${esc(sh||ch)} · ${ev.desc?esc(ev.desc):`${rnd()<.5?'190':'310'} ml ${FLV[Math.floor(rnd()*3)]} × ${cans}`} <b>+${pts} แต้ม</b>`);D.tk=D.tk.slice(0,12);D.lastCh=ch;D.last=Date.now();update(true);
  }
  function toast(t){let el=root.querySelector('.ld-toast');if(!el){el=document.createElement('div');el.className='ld-toast';el.setAttribute('role','status');root.appendChild(el)}el.textContent=t;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2500)}
  function act(v){const [k,x]=v.split(':');
    if(k==='f'){D.filter=x;build();update()}else if(k==='tab'){D.tab=x;build();update()}else if(k==='bd'){D.board=x;root.querySelectorAll('[data-ld^="bd:"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ld==='bd:'+x));board()}
    else if(k==='stg'){D.fsel=+x;stack();update()}else if(k==='pause'){D.paused=!D.paused;build();update()}
    else if(k==='noti'){if(!D.riskFix){D.riskFix=12;toast(`ส่ง AI Noti ถึง ${fmt(D.fun.act*D.risk/100)} คนแล้ว · Risk จะลดลงในไม่กี่นาที`);cycle();if(opts.onNoti)opts.onNoti()}}}
  function init(o){if(root)return api;opts=o||{};root=document.createElement('div');root.className='ld';build();update();
    root.addEventListener('click',e=>{const b=e.target.closest('[data-ld]');if(b){e.stopPropagation();act(b.dataset.ld)}});
    const tip=()=>root.querySelector('.ld-tip');
    root.addEventListener('mousemove',e=>{const t=e.target.closest('[data-tip]'),tp=tip();if(!t){tp.hidden=true;return}const rr=root.getBoundingClientRect(),sc=rr.width/root.offsetWidth||1;tp.textContent=t.getAttribute('data-tip');tp.hidden=false;let x=(e.clientX-rr.left)/sc+14,y=(e.clientY-rr.top)/sc+14;if(x>root.offsetWidth-250)x-=270;tp.style.left=x+'px';tp.style.top=y+'px'});
    root.addEventListener('mouseleave',()=>tip().hidden=true);
    setInterval(()=>{if(!D.paused&&!document.hidden&&root.isConnected)ingest()},2600);
    setInterval(()=>{const c=R('clock');if(c)c.textContent=new Date().toLocaleTimeString('th-TH')+` · อัปเดต ${Math.round((Date.now()-D.last)/1000)} วิที่แล้ว`},1000);
    for(let i=0;i<4;i++)ingest();
    return api}
  const api={init,ingest,refresh:()=>root&&update(),get el(){return root}};
  return api;
})();
