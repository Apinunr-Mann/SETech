// Generate the static Mockup for one proposal option by driving the built Prototype (dist/) in Chromium:
// each phone screen is captured as HTML (buttons → spans, no ids / handlers), desktop views as JPEG.
// usage: node mock.js o1|o2|b2b   → ../dist/volt-mockup-<v>.html
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const V = process.argv[2] || 'o1', B2B = V === 'b2b';
const DIST = path.join(__dirname, '..', 'dist');
const SRC = path.join(DIST, `volt-prototype-${V}.html`);
const TITLE = {o1: 'Option 1 · App Style', o2: 'Option 2 · Bento Hero', b2b: 'Option เสริม · B2B Retailer Add-on'}[V];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1440, height: 1000}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + SRC); await p.waitForTimeout(800);
  const grab = (sel = '#cust') => p.$eval(sel, e => {
    const c = e.cloneNode(true);
    c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    c.querySelectorAll('button').forEach(bt => { const s = document.createElement('span'); for (const a of bt.attributes) if (!a.name.startsWith('data-') && a.name !== 'disabled') s.setAttribute(a.name, a.value); s.setAttribute('role', 'button'); s.innerHTML = bt.innerHTML; bt.replaceWith(s); });
    c.querySelectorAll('[data-a],[data-v],[data-hold]').forEach(x => { x.removeAttribute('data-a'); x.removeAttribute('data-v'); x.removeAttribute('data-hold'); });
    c.querySelectorAll('input').forEach(i => { i.setAttribute('value', i.value); i.setAttribute('tabindex', '-1'); i.setAttribute('readonly', ''); });
    return {cls: e.className, html: c.innerHTML};
  });
  const base = {};
  const reset = async who => { await p.click(`[data-a=${who}]`); await p.waitForTimeout(250); base[who] = await p.evaluate(() => localStorage.voltProto5); };
  await reset('guest'); await reset('member');
  // open a state: who = guest|member, fn mutates S (runs in page)
  const st = async (who, fn) => { await p.evaluate(([b, f]) => { const S = JSON.parse(b); (new Function('S', f))(S); localStorage.voltProto5 = JSON.stringify(S); }, [base[who], fn]); await p.reload(); await p.waitForTimeout(650); };
  const ui = (who, c, extra = '') => st(who, `S.ui.c='${c}';S.ui.from=null;S.ui.rd=null;S.ui.sc=null;S.pending=null;${extra}`);
  const shotDesk = async b => { await st('member', `S.ui.dt='bo';S.ui.b='${b}'`); await p.waitForTimeout(500); const el = await p.$('.dtw'); return (await el.screenshot({type: 'jpeg', quality: 78})).toString('base64'); };

  const F = []; // {sec,id,t,d,phone|img,tall}
  const ph = async (sec, id, t, d, setup, o = {}) => { await setup(); const g = await grab(o.sel); F.push({sec, id, t, d, cls: g.cls, html: g.html, tall: o.tall}); };

  if (!B2B) {
    // LINE gateway
    await ph('line', 'L1', 'Rich Menu · ผู้ใช้ใหม่', 'เพิ่มเพื่อน LINE OA แล้วเห็นเมนูนี้ · ทุกปุ่มเปิด Microsite', () => ui('guest', 'chat', 'S.ui.rmOpen=true'));
    await ph('line', 'L2', 'LINE Login (SSO)', 'กด Rich Menu → ยืนยันตัวตนด้วย LINE อัตโนมัติ → เปิด club.volt.co.th', async () => { await ui('guest', 'chat', 'S.ui.rmOpen=true'); await p.click('#cust .rm [data-v=rewards]'); await p.waitForTimeout(120); });
    await ph('line', 'L3', 'Rich Menu · สมาชิก (A)', 'สะสม & แลก · เมนูเปลี่ยนเองหลังสมัคร', () => ui('member', 'chat', "S.ui.rmOpen=true;S.ui.rmTab='a'"));
    await ph('line', 'L4', 'Rich Menu · สมาชิก (B)', 'Community & ลุ้น · Push แจ้งผลกลับในแชต', () => ui('member', 'chat', "S.ui.rmOpen=true;S.ui.rmTab='b'"));
    // Microsite
    await ph('home', 'H1', 'Home · ผู้ใช้ใหม่', 'หน้าแรกหลังกด Rich Menu · สมัครสมาชิกเป็นปุ่มหลัก · ฟีเจอร์ที่ต้องสมัครแสดงสถานะ', () => ui('guest', 'home'), {tall: 1});
    await ph('home', 'H2', 'Home · สมาชิก', 'แต้ม + Tier ด้านบน · เมนูลัดทุกฟีเจอร์ · แถบเมนูล่าง 5 ปุ่ม (ปุ่มกลาง = ชาร์จแต้ม)', () => ui('member', 'home'), {tall: 1});
    await ph('home', 'H3', 'มาจาก Rich Menu', 'ปุ่มที่กดใน LINE ถูกไฮไลต์บนหน้า Home ให้กดต่อได้ทันที', () => ui('member', 'home', "S.ui.from='rewards'"));
    await ph('join', 'J1', 'ขอสิทธิ์ LINE Login', 'ใช้โปรไฟล์ LINE + เพิ่มเพื่อน · ไม่ต้องตั้งรหัสผ่าน', () => ui('guest', 'reg1'));
    await ph('join', 'J2', 'ฟอร์มสมัคร + PDPA', 'อายุ 15+ · consent แยกข้อ ไม่ติ๊กไว้ก่อน', () => ui('guest', 'reg2'));
    await ph('join', 'J3', 'ยืนยัน OTP', '1 เบอร์ = 1 สมาชิก', () => ui('guest', 'reg3', "S.ui.rgData={ph:'0812344521'}"));
    await ph('join', 'J4', 'ต้อนรับสมาชิกใหม่', 'Welcome 20 แต้ม ปลดล็อกหลังชาร์จกระป๋องแรก', () => ui('member', 'reg4'));
    await ph('earn', 'E1', 'ชาร์จแต้ม · รหัสใต้ห่วง', 'ช่องทางหลัก ใช้ได้ทุกร้านรวมร้านโชห่วย · 190 ml = 10 · 310 ml = 20 แต้ม', () => ui('member', 'collect', "S.ui.tab='code'"));
    await ph('earn', 'E2', 'ชาร์จแต้ม · ใบเสร็จ', 'AI อ่านใบเสร็จ · ผู้ช่วยบอกแต้มก่อนส่ง · เคสไม่ชัดส่งทีมตรวจ', () => ui('member', 'collect', "S.ui.tab='receipt'"));
    await ph('earn', 'E3', 'ชาร์จแต้ม · ออนไลน์', 'ผูกเลขออเดอร์ Shopee / Lazada / TikTok · พักแต้ม 7 วัน', () => ui('member', 'collect', "S.ui.tab='online'"));
    await ph('earn', 'E4', 'บัตรสมาชิก + Dynamic QR', 'QR เปลี่ยนทุก 60 วินาที · Charge Bolt บอกความคืบหน้า Tier', () => ui('member', 'card'));
    await ph('burn', 'R1', 'แลกรางวัล', 'แนะนำเฉพาะตัวพร้อมเหตุผล · กรองตามไลฟ์สไตล์ · ตั้งเป้า', () => ui('member', 'rewards'));
    await ph('burn', 'R2', 'ยืนยันแลก (กดค้าง)', 'Hold to Charge · ตรวจอายุและเพดานสิทธิ์', async () => { await ui('member', 'redeem', ""); await p.evaluate(b => { const S = JSON.parse(b); const r = S.rewards.find(x => x.pts > 0 && x.pts <= 140 && !x.minAge); S.ui.c = 'redeem'; S.ui.rd = {id: r.id, step: 'choose', addrOk: true}; localStorage.voltProto5 = JSON.stringify(S); }, base.member); await p.reload(); await p.waitForTimeout(650); });
    await ph('burn', 'R3', 'เป้าหมาย · Charge Bolt', 'สายฟ้าเติมตามแต้ม บอกอีกกี่แต้มและกี่กระป๋อง', () => ui('member', 'goal', "S.user.goal=S.rewards.find(x=>x.pts>148).id"));
    await ph('burn', 'R4', 'กระเป๋าคูปอง', 'คูปองที่แลกแล้ว พร้อมใช้', () => ui('member', 'wallet', "S.wallet=[{id:'w1',n:'คูปอง Volt 10฿ ที่ 7-Eleven',code:'VC-7K2P9Q',st:'ready',exp:'30 วัน'},{id:'w2',n:'LINE MAN 50฿',code:'VC-A1B2C3',st:'ready',exp:'14 วัน'}]"));
    await ph('play', 'P1', 'Missions · Tier', 'ขึ้น Tier จากความถี่การซื้อ (สัปดาห์ที่ชาร์จใน 8 สัปดาห์) · ภารกิจรับแต้ม', () => ui('member', 'tier'));
    await ph('play', 'P2', 'Charge Profile', '10 ข้อ ตอบครบรับ 30 แต้ม', () => ui('member', 'quizP', 'S.user.profileQ=3;S.user.profilePaid=false;S.ui.qi=3'));
    await ph('play', 'P3', 'Weekly Quiz', '3 ข้อ/สัปดาห์ · +5 แต้ม', () => ui('member', 'quizW', 'S.user.weeklyDone=false;S.ui.qi=0'));
    await ph('play', 'P4', 'Lucky Draw', '20 แต้ม = 1 สิทธิ์ · ต้องมีใบอนุญาตก่อนเปิด', () => ui('member', 'draws'));
    await ph('play', 'P5', 'Leaderboard', 'สัปดาห์ · เดือน · จังหวัด · Streak · มหาวิทยาลัย', () => ui('member', 'board'));
    await ph('me', 'M1', 'Profile', 'ข้อมูลสมาชิก · ประวัติ · คูปอง · ความเป็นส่วนตัว', () => ui('member', 'profile'));
    await ph('me', 'M2', 'Volt Buddy (AI L1)', 'ตอบกติกา แต้ม รางวัล · ไม่แก้แต้ม · ส่งต่อทีมงานได้', () => ui('member', 'buddy'));
    await ph('me', 'M3', 'ร้านที่มี Volt ใกล้ฉัน', 'แผนที่ร้านที่ขาย Volt', () => ui('member', 'near'));
  } else {
    await ph('b2b', 'S1', 'ลูกค้า: สแกน QR ร้าน', 'เมนูชาร์จแต้ม › QR ร้าน · ตรวจ GPS กับร้าน', () => ui('member', 'collect', "S.ui.tab='shop'"));
    await ph('b2b', 'S2', 'ลูกค้า: เลือกจำนวน + รส', 'ส่งให้ร้านอนุมัติ · แต้มเข้าเมื่อร้านกด', () => ui('member', 'collect', "S.ui.tab='shop';S.ui.sc={id:S.shops[0].id,cart:{s190:{y:2,c:1,p:0},s310:{y:0,c:0,p:0}},gpsOut:false}"));
    await ph('b2b', 'S3', 'ลูกค้า: รอร้านอนุมัติ', 'Charge Bolt โหมดรอ · ยกเลิกได้', async () => { await ui('member', 'collect', "S.ui.tab='shop';S.ui.sc={id:S.shops[0].id,cart:{s190:{y:2,c:1,p:0},s310:{y:0,c:0,p:0}},gpsOut:false}"); await p.click('#cust [data-a=sendShopReq]'); await p.waitForTimeout(400); });
    await ph('b2b', 'S4', 'มือถือร้าน: คำขอชาร์จ', 'ร้านเห็นรายการและแต้ม · กดอนุมัติ/ปฏิเสธ', async () => {}, {sel: '#shop'});
    await ph('b2b', 'S5', 'มือถือร้าน: QR ร้าน + โควตา', 'โควตา = ของเข้า × 1.1 / เดือน · แต้มร้านแลกส่วนลดสั่งของ', async () => { await ui('member', 'home'); }, {sel: '#shop'});
  }
  // desktop views
  const D = B2B ? [['shops', 'Back Office · ร้านค้า', 'โควตา ความเสี่ยง ระงับร้าน มอบงานเซลส์'], ['dash', 'Live Dashboard', 'Leaderboard ร้านโชห่วย · ช่องทาง']]
    : [['dash', 'Live Dashboard', 'Funnel · เป้า vs จริง · Retention · ช่องทาง · Copilot'], ['receipts', 'ตรวจใบเสร็จ', 'คิวตรวจ SLA 24 ชม. · AI ช่วยอ่าน'], ['rewards', 'รางวัล + Pacing', 'สต็อก · ราคาแต้ม · คำแนะนำ AI'], ['budget', 'งบรางวัล + Governor', '5 BudgetPools · Cost-per-Can'], ['members', 'สมาชิก · RFM', 'กลุ่มลูกค้า · ส่งข้อความ'], ['camp', 'Campaign Studio', 'Always-on · Season · Flash']];
  const imgs = [];
  for (const [k, t, d] of D) imgs.push({t, d, img: await shotDesk(k)});
  if (errs.length) console.error('page errors', errs);

  // assemble
  const src = fs.readFileSync(SRC, 'utf8');
  const css = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const fonts = (src.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/) || [''])[0];
  const sprite = (src.match(/<svg width="0" height="0"[\s\S]*?<\/svg>/) || [''])[0];
  const SEC = B2B ? {b2b: ['B2B · ร้านโชห่วย', 'ส่วนเสริม: ลูกค้าสแกน QR ร้าน · ร้านอนุมัติบนมือถือ · ร้านสะสมแต้มของร้าน']}
    : {line: ['LINE OA = Gateway', 'แชต · Rich Menu · Push · LINE Login เท่านั้น ฟีเจอร์ CRM ทั้งหมดอยู่บน Microsite'], home: ['Microsite · Home', 'กดเมนูใน LINE แล้วมาหน้านี้ก่อน แจกไปทุกฟีเจอร์'], join: ['สมัครสมาชิก', 'LINE Login → ข้อมูล + อายุ 15+ → OTP → Welcome 20 แต้ม'], earn: ['Scan · สะสมแต้ม', 'รหัสใต้ห่วง · ใบเสร็จ · ออนไลน์ · บัตรสมาชิก'], burn: ['Unlock · แลกรางวัล', 'รางวัล · กดค้างเพื่อแลก · เป้าหมาย · คูปอง'], play: ['Missions & Community', 'Tier · Quiz · Lucky Draw · Leaderboard'], me: ['Profile', 'ข้อมูลสมาชิก · AI Buddy · ร้านใกล้ฉัน']};
  const fig = f => `<figure class="mf${f.tall ? ' tall' : ''}"><div class="ph"><div class="${f.cls}">${f.html}</div></div><figcaption><b><i>${f.id}</i>${f.t}</b><span>${f.d}</span></figcaption></figure>`;
  const secs = Object.entries(SEC).map(([k, [h, d]]) => `<section class="ms"><header><h2>${h}</h2><p>${d}</p></header><div class="mg">${F.filter(f => f.sec === k).map(fig).join('')}</div></section>`).join('');
  const desk = `<section class="ms"><header><h2>${B2B ? 'หลังบ้าน · ร้านค้า' : 'Dashboard & หลังบ้าน'}</h2><p>ใช้ดีไซน์เดียวกับ ${TITLE} · ข้อมูลตัวอย่าง</p></header><div class="md">${imgs.map(x => `<figure><img src="data:image/jpeg;base64,${x.img}" alt="${x.t}"><figcaption><b>${x.t}</b><span>${x.d}</span></figcaption></figure>`).join('')}</div></section>`;
  const kv = V === 'o2' ? 'im-o2-hero' : 'im-o1-news';
  const sw = V === 'o2' ? [['#FFEB00', 'Volt Yellow'], ['#2147FF', 'Electric Blue'], ['#8A2BFF', 'Purple'], ['#17D6FF', 'Cyan'], ['#030718', 'Night']] : [['#FFEB00', 'Volt Yellow'], ['#1D33D6', 'Royal Blue'], ['#0A1449', 'Navy Glass'], ['#B66BFF', 'Purple'], ['#040A2C', 'Deep Navy']];
  const intro = `<header class="mh0"><div><span class="kick">Volt CRM · Mockup · ${B2B ? 'B2B (Optional)' : 'B2C'}</span><h1 class="slog">${TITLE}</h1><p>${B2B ? 'ส่วนเสริมสำหรับร้านโชห่วย เสนอแยกจาก CRM หลัก (B2C) · ใช้ระบบสมาชิก แต้ม และหลังบ้านชุดเดียวกัน' : 'LINE OA เป็นทางเข้า (Gateway) → CRM Microsite club.volt.co.th · ภาพทุกหน้าจอสร้างจาก Prototype ของ Option นี้โดยตรง'}</p>
    <div class="sw">${sw.map(([c, n]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}<span class="ty">Barlow Condensed · Bai Jamjuree · IBM Plex Sans Thai</span></div></div><div class="kvx ${kv}" role="img" aria-label="Scan. Collect. Unlock Experience."></div></header>`;
  const extra = `
body{padding:0 max(16px,env(safe-area-inset-left,0px)) 64px}
.mw{max-width:1380px;margin:0 auto}
.mh0{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px;align-items:center;padding:36px 0 26px;border-bottom:1px solid rgba(255,255,255,.12)}
.mh0 h1{font-size:clamp(40px,6vw,76px);color:#fff;margin:8px 0 10px}
.mh0 p{color:#C5CCF0;max-width:60ch}
.kvx{border-radius:22px;aspect-ratio:${V === 'o2' ? '1080/740' : '841/285'};background-size:cover;background-position:center;box-shadow:0 20px 50px rgba(0,0,0,.5),0 0 0 1px rgba(110,150,255,.35)}
.sw{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.sw span{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#DCE2FF;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:4px 10px 4px 5px}
.sw i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
.sw .ty{padding-left:10px}
.ms{padding:34px 0 8px}
.ms>header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;margin-bottom:18px}
.ms h2{font:800 26px 'Bai Jamjuree',sans-serif;color:#fff}
.ms>header p{color:#AFB8E6;font-size:14px}
.mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:30px 22px;align-items:start}
.mf{display:flex;flex-direction:column;align-items:center;gap:12px;margin:0}
.mf .ph{width:min(340px,100%);height:720px;pointer-events:none}
.mf.tall .ph{height:auto}
.mf.tall .scr{height:auto}
.mf.tall .bd{overflow:visible;flex:none}
.mf figcaption{text-align:center;display:flex;flex-direction:column;gap:3px;max-width:320px}
.mf figcaption b{font:700 15px 'Bai Jamjuree',sans-serif;color:#fff}
.mf figcaption b i{font-style:normal;color:#05050A;background:#FFEB00;border-radius:6px;padding:1px 7px;margin-right:7px;font-size:12px}
.mf figcaption span,.md figcaption span{font-size:12.5px;color:#AFB8E6}
.md{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,560px),1fr));gap:24px}
.md figure{margin:0;display:flex;flex-direction:column;gap:10px}
.md img{width:100%;border-radius:14px;box-shadow:0 0 0 1px rgba(110,150,255,.3),0 20px 40px rgba(0,0,0,.45)}
.md figcaption{display:flex;flex-direction:column;gap:2px}.md figcaption b{color:#fff;font:700 15px 'Bai Jamjuree',sans-serif}
.mfoot{margin-top:40px;color:#7F89BF;font-size:12px;text-align:center}
@media (max-width:760px){.mh0{grid-template-columns:1fr}}
`;
  const cls = V === 'o2' ? 'o2 b2c' : B2B ? 'o1 b2b' : 'o1 b2c';
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${B2B ? 'Volt B2B Mockup' : 'Volt Mockup ' + (V === 'o2' ? 'Option 2' : 'Option 1')}</title>${fonts}<style>${css}\n${extra}</style></head><body class="${cls}">${sprite}<main class="mw">${intro}${secs}${desk}<p class="mfoot">ข้อมูลทั้งหมดเป็นตัวอย่าง · domain club.volt.co.th เป็นตัวอย่าง</p></main></body></html>`;
  const out = path.join(DIST, `volt-mockup-${V}.html`);
  fs.writeFileSync(out, html);
  console.log('wrote', out, (html.length / 1024 | 0) + 'KB', F.length, 'phones', imgs.length, 'desk');
  await b.close();
})();
