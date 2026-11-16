// Builds synthetic report payloads for all 5 levels from one deterministic fake organisation.
// In production the Competency Assessment backend produces the same payload shape (see README.md §4).
import { writeFileSync } from 'fs';
import path from 'path';
const OUT = path.dirname(new URL(import.meta.url).pathname);

// ---------- deterministic RNG ----------
let s = 20261116;
const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const norm = (sd = 1) => { const u = 1 - rnd(), v = rnd(); return sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const clamp = (x, a = 1, b = 5) => Math.max(a, Math.min(b, x));
const r1 = x => Math.round(x * 100) / 100;
const pick = a => a[Math.floor(rnd() * a.length)];

// ---------- competency library ----------
const clusters = [
  { id: 'core', name: 'สมรรถนะหลัก', nameEn: 'Core Competencies', tagline: 'ค่านิยมและพฤติกรรมพื้นฐานที่ทุกคนในองค์กรต้องมีร่วมกัน',
    whatItMeasures: 'พฤติกรรมพื้นฐานที่สะท้อนค่านิยมองค์กร ใช้กับพนักงานทุกระดับ เป็นตัวกำหนด “วิธีการ” ทำงานมากกว่า “ผลลัพธ์” ของงาน',
    whyItMatters: 'งานวิจัยด้านวัฒนธรรมองค์กรชี้ว่าพฤติกรรมร่วมเป็นตัวแปรนำของความผูกพันและการรักษาพนักงาน ช่องว่างในกลุ่มนี้จึงเป็นสัญญาณเตือนล่วงหน้าของปัญหาวัฒนธรรม' },
  { id: 'lead', name: 'สมรรถนะการบริหาร', nameEn: 'Leadership Competencies', tagline: 'ความสามารถในการกำหนดทิศทาง นำคน และนำการเปลี่ยนแปลง',
    whatItMeasures: 'ความสามารถในการคิดเชิงกลยุทธ์ ตัดสินใจ พัฒนาคน และนำการเปลี่ยนแปลง ระดับที่คาดหวังเพิ่มขึ้นตามระดับตำแหน่ง',
    whyItMatters: 'คุณภาพของหัวหน้างานอธิบายความแตกต่างของความผูกพันในทีมได้สูงสุดราว 70% (Gallup, 2015) ช่องว่างในกลุ่มนี้จึงส่งผลทวีคูณต่อทั้งหน่วยงาน' },
  { id: 'func', name: 'สมรรถนะตามสายงาน', nameEn: 'Functional Competencies', tagline: 'ความเชี่ยวชาญเชิงเทคนิคและดิจิทัลที่ขับเคลื่อนผลงาน',
    whatItMeasures: 'ความรู้และทักษะเฉพาะที่จำเป็นต่อการส่งมอบผลงาน รวมถึงทักษะข้อมูลและดิจิทัลที่กลายเป็นทักษะพื้นฐานของทุกสายงาน',
    whyItMatters: 'ครึ่งชีวิตของทักษะเชิงเทคนิคสั้นลงเหลือประมาณ 2.5–5 ปี การลงทุนพัฒนากลุ่มนี้อย่างต่อเนื่องจึงเป็นเงื่อนไขของความสามารถในการแข่งขัน' },
];
const comps = [
  ['C1','core','ความซื่อสัตย์และความรับผิดชอบ','Integrity & Accountability','ยึดมั่นในจริยธรรม รักษาคำมั่น และรับผิดชอบต่อผลลัพธ์ของตนเอง', 0.35],
  ['C2','core','การมุ่งเน้นลูกค้า','Customer Centricity','เข้าใจความต้องการของลูกค้าภายในและภายนอก และส่งมอบคุณค่าที่เกินความคาดหวัง', 0.10],
  ['C3','core','การทำงานร่วมกัน','Collaboration','ทำงานข้ามสายงาน แบ่งปันข้อมูล และสร้างความไว้วางใจเพื่อเป้าหมายร่วม', 0.05],
  ['C4','core','การเรียนรู้และปรับตัว','Learning Agility','เรียนรู้สิ่งใหม่อย่างรวดเร็วและปรับวิธีทำงานเมื่อบริบทเปลี่ยน', -0.20],
  ['L1','lead','การคิดเชิงกลยุทธ์','Strategic Thinking','มองภาพรวม เชื่อมโยงงานกับทิศทางองค์กร และคาดการณ์ผลระยะยาว', -0.25],
  ['L2','lead','การพัฒนาคนและทีม','Developing People','โค้ช ให้ feedback และสร้างโอกาสการเติบโตให้ทีม', -0.10],
  ['L3','lead','การตัดสินใจ','Decision Making','ตัดสินใจอย่างมีหลักฐาน ทันเวลา และรับผิดชอบต่อผลการตัดสินใจ', 0.10],
  ['L4','lead','การนำการเปลี่ยนแปลง','Change Leadership','สื่อสารเหตุผลของการเปลี่ยนแปลง สร้างแรงจูงใจ และขับเคลื่อนให้เกิดผล', -0.45],
  ['F1','func','การใช้ข้อมูลเพื่อการวิเคราะห์','Data Literacy','อ่าน วิเคราะห์ และสื่อสารข้อมูลเพื่อสนับสนุนการตัดสินใจ', -0.30],
  ['F2','func','ทักษะดิจิทัลและ AI','Digital & AI Fluency','ใช้เครื่องมือดิจิทัลและ AI อย่างมีวิจารณญาณเพื่อยกระดับผลิตภาพ', -0.60],
  ['F3','func','ความเป็นเลิศด้านกระบวนการ','Process Excellence','ออกแบบ ปรับปรุง และควบคุมกระบวนการให้มีประสิทธิภาพและคุณภาพ', 0.05],
  ['F4','func','ความเชี่ยวชาญในวิชาชีพ','Professional Expertise','ความรู้เชิงลึกในสาขางานของตน และประยุกต์ใช้กับสถานการณ์จริง', 0.20],
].map(([id, cluster, name, nameEn, definition, bias], i) => ({ id, no: i + 1, cluster, name, nameEn, definition, bias }));

const devLib = {
  C4: { outcome: 'พนักงานปรับตัวกับระบบงานใหม่ได้เร็วขึ้น', action: 'จัด Learning Sprint รายไตรมาส และกำหนด “ชั่วโมงเรียนรู้” 4 ชม./เดือน', ratio: '10' },
  C2: { outcome: 'คะแนนความพึงพอใจลูกค้าภายในเพิ่มขึ้น', action: 'ทำ Customer Journey Workshop ข้ามแผนก และหมุนเวียนงานหน้าบ้าน 2 สัปดาห์', ratio: '70' },
  C3: { outcome: 'ลดรอบเวลาส่งต่องานข้ามสายงาน', action: 'ตั้งทีมโครงการข้ามสายงาน (cross-functional squad) พร้อม OKR ร่วม', ratio: '70' },
  C1: { outcome: 'รักษามาตรฐานจริยธรรมระดับสูงอย่างต่อเนื่อง', action: 'ใช้ผู้มีคะแนนสูงเป็น Culture Ambassador และ mentor พนักงานใหม่', ratio: '20' },
  L1: { outcome: 'แผนงานระดับแผนกเชื่อมโยงกับกลยุทธ์องค์กรชัดเจน', action: 'ให้ผู้จัดการร่วมจัดทำแผนกลยุทธ์ประจำปี และเข้าหลักสูตร Strategic Foresight', ratio: '70' },
  L2: { outcome: 'ทุกคนในทีมมี IDP ที่ติดตามได้', action: 'ฝึกทักษะ Coaching แก่หัวหน้างาน และกำหนด 1-on-1 อย่างน้อยเดือนละครั้ง', ratio: '20' },
  L3: { outcome: 'การตัดสินใจรวดเร็วและมีหลักฐานรองรับ', action: 'นำ Decision Log มาใช้ในการประชุมบริหาร และทบทวนผลทุกไตรมาส', ratio: '70' },
  L4: { outcome: 'โครงการเปลี่ยนแปลงบรรลุเป้าหมายตามกำหนด', action: 'มอบหมายผู้บริหารเป็น Change Sponsor ของโครงการจริง พร้อม Executive Coach', ratio: '70' },
  F1: { outcome: 'รายงานและการตัดสินใจอ้างอิงข้อมูลมากขึ้น', action: 'หลักสูตร Data Storytelling แบบ blended และ Data Clinic รายสัปดาห์', ratio: '10' },
  F2: { outcome: 'ผลิตภาพเพิ่มขึ้นจากการใช้ AI อย่างปลอดภัย', action: 'โปรแกรม AI Fluency 3 ระดับ + Use-case Challenge ภายในหน่วยงาน', ratio: '70' },
  F3: { outcome: 'ลดความสูญเปล่าในกระบวนการหลัก', action: 'โครงการ Lean/Kaizen ที่วัดผลได้ โดยมี Green Belt เป็นพี่เลี้ยง', ratio: '70' },
  F4: { outcome: 'รักษาความเชี่ยวชาญระดับสูงและถ่ายทอดสู่รุ่นถัดไป', action: 'จัดทำ Knowledge Map และให้ผู้เชี่ยวชาญเป็นวิทยากรภายใน', ratio: '20' },
};

const scale = [
  { level: 1, label: 'เริ่มต้น', labelEn: 'Foundational', desc: 'มีความรู้พื้นฐาน ต้องได้รับคำแนะนำใกล้ชิด' },
  { level: 2, label: 'กำลังพัฒนา', labelEn: 'Developing', desc: 'ทำได้ในสถานการณ์ทั่วไปภายใต้การกำกับ' },
  { level: 3, label: 'ชำนาญ', labelEn: 'Proficient', desc: 'ทำได้ด้วยตนเองอย่างสม่ำเสมอ' },
  { level: 4, label: 'ชำนาญสูง', labelEn: 'Advanced', desc: 'แก้ปัญหาซับซ้อนและแนะนำผู้อื่นได้' },
  { level: 5, label: 'เชี่ยวชาญ', labelEn: 'Expert', desc: 'เป็นแบบอย่างและกำหนดมาตรฐานให้องค์กร' },
];
const jobLevels = ['L1 พนักงาน','L2 พนักงานอาวุโส','L3 หัวหน้างาน','L4 ผู้จัดการ','L5 ผู้อำนวยการ','L6 ผู้บริหารระดับสูง'];
const REQ = { core: [2,3,3,3,4,4], lead: [1,2,3,3,4,5], func: [2,3,3,4,4,4] };

// ---------- organisation ----------
const org = [
  ['พาณิชย์', 'Commercial', { C2: .35, F2: -.1, L4: .05 }, [
    ['ขาย', 'Sales', ['ขายองค์กร', 'ขายรายย่อย', 'บริหารลูกค้าหลัก']],
    ['การตลาด', 'Marketing', ['การตลาดดิจิทัล', 'แบรนด์และสื่อสาร']]]],
  ['ปฏิบัติการ', 'Operations', { F3: .4, F2: -.35, C4: -.15, F1: -.15 }, [
    ['การผลิต', 'Manufacturing', ['สายการผลิต 1', 'สายการผลิต 2', 'ควบคุมคุณภาพ']],
    ['ห่วงโซ่อุปทาน', 'Supply Chain', ['จัดซื้อ', 'คลังสินค้าและขนส่ง']]]],
  ['เทคโนโลยี', 'Technology', { F2: .85, F1: .55, C2: -.2, L2: -.15 }, [
    ['โครงสร้างพื้นฐานไอที', 'IT Infrastructure', ['เครือข่ายและคลาวด์', 'ความมั่นคงปลอดภัยไซเบอร์']],
    ['ดิจิทัลและข้อมูล', 'Digital & Data', ['วิเคราะห์ข้อมูล', 'พัฒนาแพลตฟอร์มดิจิทัล', 'AI และระบบอัตโนมัติ']]]],
  ['บริหารองค์กร', 'Corporate Services', { C1: .15, F4: .1, L4: -.1 }, [
    ['การเงินและบัญชี', 'Finance', ['บัญชี', 'วางแผนการเงิน']],
    ['ทรัพยากรบุคคล', 'Human Resources', ['สรรหาและพัฒนา', 'ค่าตอบแทนและสวัสดิการ']]]],
];
const first = ['ณัฐพล','ศิริพร','ธนากร','พิมพ์ชนก','กิตติพงษ์','วรรณภา','อนุชา','ปวีณา','ชยพล','สุภาวดี','ภาณุวัฒน์','กมลชนก','ธีรวัฒน์','อรอุมา','ณัฐวุฒิ','จิราพร','ปิยะพงษ์','ศศิธร','วีรยุทธ','นันทนา'];
const last = ['ศรีสุข','วงศ์ไทย','ทองดี','แก้วมณี','บุญมา','จันทร์เพ็ญ','สุขสวัสดิ์','ประเสริฐ','รุ่งเรือง','ธนสาร'];

const employees = [];
let eid = 1000;
for (const [fn, fnEn, fbias, depts] of org) {
  let fnHead = true;
  for (const [dn, dnEn, subs] of depts) {
    let dHead = true;
    for (const sn of subs) {
      const size = 7 + Math.floor(rnd() * 8);
      const unitBias = Object.fromEntries(comps.map(c => [c.id, norm(0.12)]));
      for (let k = 0; k < size; k++) {
        let lvl = k === 0 ? 2 : (rnd() < 0.45 ? 1 : 0);
        if (k === 0 && dHead) { lvl = fnHead ? 4 : 3; }
        const ability = norm(0.30);
        const e = { id: 'E' + (eid++), name: `${pick(first)} ${pick(last)}`, fn, fnEn, dept: dn, deptEn: dnEn, sub: sn, lvl, jobLevel: jobLevels[lvl], scores: {}, req: {}, raters: {} };
        for (const c of comps) {
          const req = REQ[c.cluster][lvl];
          const seniorBoost = c.cluster === 'lead' ? 0.08 * lvl : 0;
          const truth = clamp(req + 0.05 + c.bias + (fbias[c.id] || 0) + unitBias[c.id] + ability + seniorBoost + norm(0.40));
          const mgr = clamp(truth + norm(0.22)), peer = clamp(truth + 0.05 + norm(0.28)), subo = lvl >= 2 ? clamp(truth + 0.1 + norm(0.3)) : null;
          const self = clamp(truth + 0.38 + norm(0.3));
          const final = subo == null ? 0.6 * mgr + 0.4 * peer : 0.5 * mgr + 0.25 * peer + 0.25 * subo;
          e.scores[c.id] = r1(final); e.req[c.id] = req;
          e.raters[c.id] = { self: r1(self), manager: r1(mgr), peer: r1(peer), subordinate: subo == null ? null : r1(subo) };
        }
        employees.push(e);
        dHead = false; fnHead = false;
      }
    }
  }
}

// ---------- aggregation (what the backend does) ----------
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, a.length - 1)); };
const prevShift = Object.fromEntries(comps.map(c => [c.id, 0.04 + norm(0.09)]));

function aggComp(list, c) {
  const xs = list.map(e => e.scores[c.id]);
  const rq = list.map(e => e.req[c.id]);
  const dist = [0, 0, 0, 0, 0];
  xs.forEach(x => dist[Math.min(4, Math.max(0, Math.round(x) - 1))]++);
  const m = mean(xs), s = sd(xs);
  return {
    score: r1(m), required: r1(mean(rq)), sd: r1(s), ci95: r1(1.96 * s / Math.sqrt(xs.length)), n: xs.length,
    pctMeet: r1(list.filter(e => e.scores[c.id] >= e.req[c.id] - 0.25).length / list.length),
    dist: dist.map(d => r1(d / xs.length)), prev: r1(m - prevShift[c.id]),
  };
}
function cronbach(list) {
  const k = comps.length; const items = comps.map(c => list.map(e => e.scores[c.id]));
  const totals = list.map(e => comps.reduce((a, c) => a + e.scores[c.id], 0));
  const v = a => sd(a) ** 2;
  return r1((k / (k - 1)) * (1 - items.reduce((a, it) => a + v(it), 0) / v(totals)));
}
const unitRow = (name, list) => ({ name, n: list.length, scores: Object.fromEntries(comps.map(c => [c.id, { score: r1(mean(list.map(e => e.scores[c.id]))), required: r1(mean(list.map(e => e.req[c.id]))) }])) });
const groupBy = (list, k) => { const m = new Map(); list.forEach(e => { if (!m.has(e[k])) m.set(e[k], []); m.get(e[k]).push(e); }); return m; };

const keyPlayers = {
  company: [
    { role: 'CEO และคณะผู้บริหาร', icon: 'exec', items: [['กำหนดทิศทาง', 'ประกาศสมรรถนะเชิงกลยุทธ์ 2–3 ตัวที่องค์กรจะลงทุนในปีถัดไป'], ['จัดสรรทรัพยากร', 'อนุมัติงบพัฒนาตามลำดับความสำคัญของช่องว่าง'], ['ติดตามผล', 'ทบทวนความคืบหน้าในที่ประชุมผู้บริหารทุกไตรมาส']] },
    { role: 'ผู้บริหารสายงาน', icon: 'lead', items: [['แปลงสู่แผน', 'นำช่องว่างของสายงานไปกำหนดเป็นแผนพัฒนาระดับหน่วยงาน'], ['เป็นแบบอย่าง', 'แสดงพฤติกรรมตามสมรรถนะที่องค์กรคาดหวัง'], ['สร้างโอกาส', 'เปิดโครงการจริงให้พนักงานได้ฝึก (70%)']] },
    { role: 'HR และ L&D', icon: 'hr', items: [['ออกแบบหลักสูตร', 'จัดโปรแกรมตามโมเดล 70-20-10 สำหรับสมรรถนะลำดับแรก'], ['วัดผล', 'ติดตามผลด้วยการประเมินซ้ำและ KPI ทางธุรกิจ'], ['กำกับคุณภาพ', 'ทบทวน Proficiency Standard และ calibration ผู้ประเมิน']] },
  ],
  function: [
    { role: 'ผู้บริหารสายงาน', icon: 'exec', items: [['กำหนดลำดับความสำคัญ', 'เลือก 2–3 สมรรถนะที่สายงานจะพัฒนาร่วมกัน'], ['จัดสรรทรัพยากร', 'กันงบและเวลาสำหรับการพัฒนาในแผนประจำปี'], ['ติดตามผล', 'ทบทวนผลกับผู้จัดการแผนกรายไตรมาส']] },
    { role: 'ผู้จัดการแผนก', icon: 'lead', items: [['ถ่ายทอดเป้าหมาย', 'แปลงช่องว่างเป็นเป้าหมายพัฒนาระดับแผนก'], ['มอบหมายงานพัฒนา', 'ให้พนักงานรับผิดชอบงาน stretch ที่ตรงช่องว่าง'], ['โค้ชต่อเนื่อง', 'ทำ 1-on-1 และติดตาม IDP']] },
    { role: 'HRBP และ L&D', icon: 'hr', items: [['วิเคราะห์เชิงลึก', 'ระบุกลุ่มเป้าหมายตามระดับตำแหน่งและแผนก'], ['ออกแบบโปรแกรม', 'จับคู่ช่องว่างกับหลักสูตรและโครงการ'], ['วัดผล', 'เปรียบเทียบผลก่อน–หลังพัฒนา']] },
  ],
  department: [
    { role: 'ผู้จัดการแผนก', icon: 'exec', items: [['กำหนดเป้าหมาย', 'ตั้งเป้าคะแนนสมรรถนะที่ต้องการปิดช่องว่างในปีนี้'], ['บริหารงาน', 'จัดสรรงานที่เปิดโอกาสฝึกทักษะจริง'], ['ติดตามผล', 'ทบทวนผลกับหัวหน้างานทุกเดือน']] },
    { role: 'หัวหน้างาน', icon: 'lead', items: [['จัดทำ IDP', 'ร่วมกับพนักงานทุกคนภายใน 30 วัน'], ['โค้ชรายบุคคล', 'ให้ feedback ตามพฤติกรรมที่สังเกตได้'], ['เป็นแบบอย่าง', 'แสดงพฤติกรรมที่คาดหวังในงานประจำวัน']] },
    { role: 'HRBP', icon: 'hr', items: [['ให้คำปรึกษา', 'ช่วยวิเคราะห์ช่องว่างและเลือกวิธีพัฒนา'], ['ประสานหลักสูตร', 'จองที่นั่งหลักสูตรตามลำดับความสำคัญ'], ['ติดตาม', 'รายงานความคืบหน้า IDP รายไตรมาส']] },
  ],
  subdepartment: [
    { role: 'หัวหน้างาน', icon: 'exec', items: [['จัดทำ IDP', 'คุยผลประเมินรายบุคคลและตกลงเป้าหมายพัฒนา'], ['มอบหมายงาน', 'เลือกงานจริงที่เป็นโอกาสฝึก (70%)'], ['ติดตาม', '1-on-1 เดือนละครั้ง']] },
    { role: 'สมาชิกทีม', icon: 'lead', items: [['เป็นเจ้าของการพัฒนา', 'เลือก 1–2 สมรรถนะที่จะพัฒนาในรอบนี้'], ['เรียนรู้จากกัน', 'จับคู่ peer coaching กับผู้มีจุดแข็ง'], ['สะท้อนผล', 'บันทึกการเรียนรู้รายเดือน']] },
    { role: 'HRBP', icon: 'hr', items: [['สนับสนุน', 'แนะนำหลักสูตรและเครื่องมือ'], ['ประสาน', 'หา mentor ข้ามหน่วยงาน'], ['วัดผล', 'ติดตามความคืบหน้าในระบบ']] },
  ],
  individual: [
    { role: 'ตัวท่าน (พนักงาน)', icon: 'exec', items: [['เลือกเป้าหมาย', 'เลือก 1–2 สมรรถนะลำดับแรกจากรายงานนี้'], ['ลงมือฝึก', 'ขอรับงานที่ใช้สมรรถนะนั้นจริง'], ['สะท้อนผล', 'บันทึกสิ่งที่เรียนรู้และขอ feedback สม่ำเสมอ']] },
    { role: 'ผู้บังคับบัญชา', icon: 'lead', items: [['ตกลง IDP', 'ร่วมกำหนดเป้าหมายและตัวชี้วัดภายใน 30 วัน'], ['เปิดโอกาส', 'มอบหมายงาน stretch ที่ตรงกับช่องว่าง'], ['โค้ช', '1-on-1 อย่างน้อยเดือนละครั้ง']] },
    { role: 'HR / Mentor', icon: 'hr', items: [['แนะนำการเรียนรู้', 'เสนอหลักสูตรและแหล่งเรียนรู้ที่เหมาะสม'], ['จับคู่ Mentor', 'เชื่อมกับผู้มีจุดแข็งในสมรรถนะเดียวกัน'], ['ติดตาม', 'ประเมินความคืบหน้ากลางปี']] },
  ],
};

function payload(level, entity, entityEn, pathArr, list, breakdownLabel, breakdownRows, extra = {}) {
  const compsOut = comps.map(c => ({ id: c.id, no: c.no, cluster: c.cluster, name: c.name, nameEn: c.nameEn, definition: c.definition, ...aggComp(list, c), development: devLib[c.id] }));
  return {
    meta: { level, entityName: entity, entityNameEn: entityEn, path: pathArr, organization: 'บริษัท ตัวอย่าง จำกัด (มหาชน)', cycle: 'การประเมินสมรรถนะประจำปี 2569', cycleEn: 'Annual Competency Assessment 2026', period: 'ต.ค. – พ.ย. 2569', reportDate: '16 พฤศจิกายน 2569', confidentiality: level === 'individual' ? 'ลับเฉพาะบุคคล' : 'ลับ – ใช้ภายใน', method: '360° (ผู้บังคับบัญชา 50% · เพื่อนร่วมงาน 25% · ผู้ใต้บังคับบัญชา 25%)' },
    foreword: {
      signer: level === 'individual' ? { name: 'ฝ่ายทรัพยากรบุคคล', title: 'Human Resources' } : { name: 'ดร.สมชาย ตัวอย่าง', title: 'ประธานเจ้าหน้าที่ฝ่ายทรัพยากรบุคคล (CHRO)' },
    },
    participation: { invited: Math.round(list.length * (level === 'individual' ? 1 : 1.06)), completed: list.length, reliability: list.length > 20 ? cronbach(list) : null },
    scale, clusters, competencies: compsOut,
    breakdown: breakdownRows ? { label: breakdownLabel, rows: breakdownRows } : null,
    keyPlayers: keyPlayers[level],
    ...extra,
  };
}

const outputs = {};
const all = employees;
outputs.company = payload('company', 'บริษัท ตัวอย่าง จำกัด (มหาชน)', 'Company Overview', [], all, 'รายสายงาน',
  [...groupBy(all, 'fn')].map(([k, v]) => unitRow(k, v)));

const fnName = 'เทคโนโลยี';
const fnList = all.filter(e => e.fn === fnName);
outputs.function = payload('function', 'สายงานเทคโนโลยี', 'Technology Function', ['บริษัท ตัวอย่าง จำกัด (มหาชน)'], fnList, 'รายแผนก',
  [...groupBy(fnList, 'dept')].map(([k, v]) => unitRow(k, v)));

const dName = 'ดิจิทัลและข้อมูล';
const dList = fnList.filter(e => e.dept === dName);
outputs.department = payload('department', 'แผนกดิจิทัลและข้อมูล', 'Digital & Data Department', ['บริษัท ตัวอย่าง จำกัด (มหาชน)', 'สายงานเทคโนโลยี'], dList, 'รายแผนกย่อย',
  [...groupBy(dList, 'sub')].map(([k, v]) => unitRow(k, v)));

const sName = 'วิเคราะห์ข้อมูล';
const sList = dList.filter(e => e.sub === sName);
outputs.subdepartment = payload('subdepartment', 'แผนกย่อยวิเคราะห์ข้อมูล', 'Data Analytics Section', ['บริษัท ตัวอย่าง จำกัด (มหาชน)', 'สายงานเทคโนโลยี', 'แผนกดิจิทัลและข้อมูล'], sList, 'รายบุคคลในทีม',
  sList.map(e => unitRow(e.name, [e])));

const me = sList.find(e => e.lvl === 2) || sList[0];
const meAgg = payload('individual', me.name, me.jobLevel, ['บริษัท ตัวอย่าง จำกัด (มหาชน)', 'สายงานเทคโนโลยี', 'แผนกดิจิทัลและข้อมูล', 'แผนกย่อยวิเคราะห์ข้อมูล'], [me], null, null, {
  person: { id: me.id, name: me.name, jobLevel: me.jobLevel, position: 'หัวหน้างานวิเคราะห์ข้อมูล', raterCounts: { self: 1, manager: 1, peer: 4, subordinate: 5 } },
});
meAgg.competencies.forEach(c => { c.raters = me.raters[c.id]; c.teamAvg = aggComp(sList, comps.find(x => x.id === c.id)).score; c.ci95 = null; c.sd = null; });
outputs.individual = meAgg;

for (const [k, v] of Object.entries(outputs)) {
  writeFileSync(path.join(OUT, `sample-${k}.json`), JSON.stringify(v, null, 1));
  console.log(k, v.competencies.length, 'competencies, n =', v.participation.completed);
}
