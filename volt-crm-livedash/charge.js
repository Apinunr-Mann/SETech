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
    if(!visible(to))return;const neg=n<0,cnt=Math.max(3,Math.min(9,Math.abs(n)));const text=label||((neg?'−':'+')+Math.abs(n)+' Volt');
    if(reduce()||!from||!Element.prototype.animate){zap(to);pop(to,text,neg);return}
    const [sx,sy]=Array.isArray(from)?from:ctr(from),[tx,ty]=ctr(to);
    for(let i=0;i<cnt;i++){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 32');s.setAttribute('class','vbolt');s.innerHTML=BOLT;document.body.appendChild(s);
      const a=neg?[tx,ty]:[sx,sy],b=neg?[sx,sy]:[tx,ty],mx=(a[0]+b[0])/2+(Math.random()-.5)*160,my=Math.min(a[1],b[1])-60-Math.random()*80;
      const k=s.animate([{transform:`translate(${a[0]-11}px,${a[1]-15}px) scale(.4) rotate(${-30+Math.random()*60}deg)`,opacity:0},{transform:`translate(${mx-11}px,${my-15}px) scale(1.25)`,opacity:1,offset:.45},{transform:`translate(${b[0]-11}px,${b[1]-15}px) scale(.5)`,opacity:.9}],{duration:700+Math.random()*250,delay:i*70,easing:'cubic-bezier(.3,.1,.3,1)',fill:'forwards'});
      k.onfinish=()=>{s.remove();if(i===cnt-1){zap(to);pop(to,text,neg)}}}
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
  const batt=(p,cls,lbl)=>`<span class="batt ${cls||''}" style="--p:${Math.max(0,Math.min(1,p)).toFixed(3)}"><i></i>${lbl!=null?`<b>${lbl}</b>`:''}</span>`;
  return {charge,pop,zap,levelUp,batt,onHold:f=>{onHold=f},BOLT};
})();
