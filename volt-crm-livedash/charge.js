/* VoltFX: charge animations shared by prototype, mockup and dashboard */
window.VoltFX=(function(){
  const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BOLT='<path d="M15 0L2 18h8l-3 14L22 12h-8l4-12z"/>';
  const ctr=el=>{const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]};
  const visible=el=>{if(!el||!el.isConnected)return false;const r=el.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight};
  function pop(at,text,neg){const [x,y]=ctr(at);const p=document.createElement('div');p.className='vpop'+(neg?' neg':'');p.textContent=text;p.style.left=x+'px';p.style.top=(y-18)+'px';document.body.appendChild(p);setTimeout(()=>p.remove(),1400)}
  function zap(to){to.classList.remove('zap');void to.offsetWidth;to.classList.add('zap')}
  /* bolts fly from `from` (element or [x,y]) into `to`; then the target zaps and a +N pops */
  function charge(from,to,n,label){
    if(!visible(to))return;const neg=n<0,cnt=Math.max(3,Math.min(9,Math.abs(n)));const text=label||((neg?'−':'+')+Math.abs(n)+' แต้ม');
    if(reduce()||!from||!Element.prototype.animate){zap(to);pop(to,text,neg);return}
    const [sx,sy]=Array.isArray(from)?from:ctr(from),[tx,ty]=ctr(to);
    for(let i=0;i<cnt;i++){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 32');s.setAttribute('class','vbolt');s.innerHTML=BOLT;document.body.appendChild(s);
      const a=neg?[tx,ty]:[sx,sy],b=neg?[sx,sy]:[tx,ty],mx=(a[0]+b[0])/2+(Math.random()-.5)*160,my=Math.min(a[1],b[1])-60-Math.random()*80;
      const k=s.animate([{transform:`translate(${a[0]-11}px,${a[1]-15}px) scale(.4) rotate(${-30+Math.random()*60}deg)`,opacity:0},{transform:`translate(${mx-11}px,${my-15}px) scale(1.25)`,opacity:1,offset:.45},{transform:`translate(${b[0]-11}px,${b[1]-15}px) scale(.5)`,opacity:.9}],{duration:700+Math.random()*250,delay:i*70,easing:'cubic-bezier(.3,.1,.3,1)',fill:'forwards'});
      k.onfinish=()=>{s.remove();if(i===cnt-1){zap(to);if(!neg&&to.classList&&to.classList.contains('cbolt'))burst(to,10);pop(to,text,neg)}}}
  }
  /* full overlay inside a positioned container */
  function levelUp(box,title,sub,small){if(!box)return;const o=document.createElement('div');o.className='vlvl';o.setAttribute('role','status');o.innerHTML=`<div><svg viewBox="0 0 24 32" aria-hidden="true">${BOLT}</svg><b>${title}</b><span>${sub||''}</span><small>${small||'แตะเพื่อปิด'}</small></div>`;o.addEventListener('click',()=>o.remove());box.appendChild(o);setTimeout(()=>o.remove(),3200)}
  /* hold-to-charge buttons: [data-hold="<action>"], fires onHold(action, el) after ms */
  let held=null,raf=0,t0=0;const MS=1100;let onHold=()=>{};
  function tick(){if(!held)return;const p=Math.min(1,(performance.now()-t0)/MS);held.style.setProperty('--h',p);if(p>=1){const el=held;held=null;el.style.setProperty('--h',0);onHold(el.dataset.hold,el);return}raf=requestAnimationFrame(tick)}
  function stop(){if(held){held.style.setProperty('--h',0);held=null}cancelAnimationFrame(raf)}
  document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-hold]');if(!b||b.disabled)return;e.preventDefault();held=b;t0=performance.now();raf=requestAnimationFrame(tick)});
  ['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,stop));
  document.addEventListener('keydown',e=>{const b=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-hold]');if(b&&(e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();held=b;t0=performance.now();raf=requestAnimationFrame(tick)}});
  document.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')stop()});
  /* ---- Charge Bolt ---- */
  const BPATH='M29 1L5 37H22L15 63L43 23H26L36 1Z';
  let uid=0;
  const WAVE='M-24 4Q-18 0 -12 4T0 4T12 4T24 4T36 4T48 4T60 4T72 4T84 4V90H-24Z';
  const BUB=[[11,34,2.2,0],[22,48,1.6,-.7],[32,28,2.4,-1.4],[18,60,1.8,-2.1],[36,52,1.5,-.4],[26,40,2,-1.9]];
  const clamp=p=>Math.max(0,Math.min(1,p||0));
  const stOf=(p,o)=>o.state==='wait'?'wait':p>=.999?'full':p<=.001?'0':'mid';
  function bolt(p,o){o=o||{};p=clamp(p);const id='cb'+(++uid),st=stOf(p,o),fl=o.flavor?' f-'+o.flavor:'';
    const lbl=o.label!=null?`<span class="cb-l">${o.label}</span>`:'';
    return `<span class="cbolt cb-${o.size||'md'} cb-${st}${fl}${o.cls?' '+o.cls:''}" style="--p:${p.toFixed(3)}" data-p="${p.toFixed(3)}" role="img" aria-label="${o.aria||('Charge Bolt '+Math.round(p*100)+'%')}"><svg viewBox="0 0 48 64" aria-hidden="true"><defs><clipPath id="${id}c"><path d="${BPATH}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cf2)"/><stop offset="1" stop-color="var(--cf)"/></linearGradient></defs><path class="cb-glass" d="${BPATH}"/><g clip-path="url(#${id}c)"><g class="cb-liq"><g class="cb-w2"><path d="${WAVE}" fill="url(#${id}g)" transform="translate(-6 -2)"/></g><g class="cb-w1"><path d="${WAVE}" fill="url(#${id}g)"/></g>${BUB.map(b=>`<circle class="cb-b" cx="${b[0]}" cy="${b[1]}" r="${b[2]}" style="animation-delay:${b[3]}s"/>`).join('')}</g><g class="cb-idle"><circle cx="21" cy="53" r="1.6" style="animation-delay:0s"/><circle cx="25" cy="46" r="1.1" style="animation-delay:-1.4s"/></g></g><path class="cb-edge" d="${BPATH}"/></svg>${lbl}</span>`}
  function burst(el,n){if(!el||reduce())return;n=n||10;for(let i=0;i<n;i++){const b=document.createElement('i');b.className='cb-burst';const a=Math.random()*Math.PI*2,d=18+Math.random()*26;b.style.setProperty('--dx',Math.cos(a)*d+'px');b.style.setProperty('--dy',(Math.sin(a)*d-16)+'px');b.style.width=b.style.height=(4+Math.random()*5)+'px';el.appendChild(b);setTimeout(()=>b.remove(),1000)}}
  /* update an existing bolt in place (level change animates; success / full bursts) */
  function setBolt(el,p,o){if(!el)return;o=o||{};p=clamp(p);const prev=parseFloat(el.dataset.p||'0'),st=stOf(p,o);
    el.style.setProperty('--p',p.toFixed(3));el.dataset.p=p.toFixed(3);el.classList.remove('cb-0','cb-mid','cb-full','cb-wait');el.classList.add('cb-'+st);
    el.setAttribute('aria-label',o.aria||('Charge Bolt '+Math.round(p*100)+'%'));
    const l=el.querySelector('.cb-l');if(l&&o.label!=null)l.textContent=o.label;
    if(p>prev+.001){el.classList.remove('cb-ok');void el.offsetWidth;el.classList.add('cb-ok');burst(el,8+Math.floor(Math.random()*5));if(navigator.vibrate&&navigator.userActivation&&navigator.userActivation.hasBeenActive)try{navigator.vibrate(30)}catch(e){}}
    if(st==='full'&&prev<.999){el.classList.remove('cb-glow');void el.offsetWidth;el.classList.add('cb-glow');burst(el,12)}}
  const batt=(p,cls,lbl)=>bolt(p,{size:/xl/.test(cls||'')?'xl':/v/.test(cls||'')?'lg':'md',label:lbl});
  return {charge,pop,zap,levelUp,bolt,setBolt,burst,batt,onHold:f=>{onHold=f},BOLT};
})();
