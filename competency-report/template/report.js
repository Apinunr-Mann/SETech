/* Competency Assessment Report renderer.
 * Usage: renderReport(payload) → fills <main id="report"> with 16:9 pages.
 * One template serves all five levels: company · function · department · subdepartment · individual.
 * Narrative ("data storytelling") is generated from the data; any text can be overridden in payload.narrative.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------ config
  const LEVEL = {
    company:       { th: 'รายงานภาพรวมองค์กร',  en: 'Company Report',        unit: 'องค์กร' },
    function:      { th: 'รายงานระดับหน่วยงาน', en: 'Function Report',        unit: 'หน่วยงาน' },
    department:    { th: 'รายงานระดับแผนก',     en: 'Department Report',      unit: 'แผนก' },
    subdepartment: { th: 'รายงานระดับแผนกย่อย', en: 'Sub-department Report',  unit: 'แผนกย่อย' },
    individual:    { th: 'รายงานรายบุคคล',      en: 'Individual Report',      unit: 'ท่าน' },
  };
  const DEFAULT_THRESHOLDS = { watch: 0, priority: -0.25 }; // gap = score − required
  const STATUS = {
    strength: { th: 'จุดแข็ง', en: 'Strength', color: 'var(--good)', ring: 0 },
    watch:    { th: 'เฝ้าระวัง', en: 'Watch', color: 'var(--warning)', ring: 1 },
    priority: { th: 'ต้องพัฒนาเร่งด่วน', en: 'Priority', color: 'var(--critical)', ring: 2 },
  };
  // diverging gap scale: red (below standard) ↔ grey ↔ blue (above standard)
  const GAP_BINS = [
    { max: -0.6, bg: '#b92f2f', fg: '#fff', label: '≤ −0.6' },
    { max: -0.3, bg: '#e2706d', fg: '#fff', label: '−0.6 ถึง −0.3' },
    { max: -0.1, bg: '#f5c6c3', fg: '#0b0b0b', label: '−0.3 ถึง −0.1' },
    { max: 0.1,  bg: '#f0efec', fg: '#0b0b0b', label: '±0.1' },
    { max: 0.3,  bg: '#cde2fb', fg: '#0b0b0b', label: '+0.1 ถึง +0.3' },
    { max: 0.6,  bg: '#6da7ec', fg: '#0b0b0b', label: '+0.3 ถึง +0.6' },
    { max: 99,   bg: '#1c5cab', fg: '#fff', label: '≥ +0.6' },
  ];
  const ORDINAL = ['#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b']; // proficiency 1→5

  const ICONS = {
    core: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M8.5 12l2.4 2.4L15.5 9.8"/>',
    lead: '<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.2"/><circle cx="19" cy="10" r="2.2"/><path d="M6.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6"/><path d="M1.8 18.5c0-2.3 1.4-4.2 3.3-4.2M22.2 18.5c0-2.3-1.4-4.2-3.3-4.2"/>',
    func: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    exec: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-4 3.1-7 7-7s7 3 7 7"/><path d="M12 14l-1.3 3 1.3 1.5 1.3-1.5z"/>',
    hr: '<path d="M3 13l4-4 3 2 4-4 3 3 4-3"/><path d="M3 19h18"/><circle cx="7" cy="9" r="1"/><circle cx="14" cy="7" r="1"/>',
  };
  const statusIcon = s => s === 'strength'
    ? '<svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="6.5" fill="var(--good)"/><path d="M4 7.2l2 2 4-4.2" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>'
    : s === 'watch'
      ? '<svg viewBox="0 0 14 14"><path d="M7 1l6.3 11.5H.7z" fill="var(--warning)"/><path d="M7 5v3.5" stroke="#0b0b0b" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="10.6" r=".9" fill="#0b0b0b"/></svg>'
      : '<svg viewBox="0 0 14 14"><rect x="1.3" y="1.3" width="11.4" height="11.4" rx="2" transform="rotate(45 7 7)" fill="var(--critical)"/><path d="M7 4v4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="7" cy="10.2" r=".95" fill="#fff"/></svg>';

  // ------------------------------------------------------------------ helpers
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f2 = x => (x == null || isNaN(x) ? '–' : Number(x).toFixed(2));
  const sgn = x => (x > 0.005 ? '+' : x < -0.005 ? '−' : '±') + Math.abs(x).toFixed(2);
  const pct = x => Math.round(x * 100);
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const icon = (k, cls = '') => `<div class="disc ${cls}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></div>`;
  const statusChip = s => `<span class="status">${statusIcon(s)}${STATUS[s].th}</span>`;
  const gapBin = g => GAP_BINS.find(b => g <= b.max);

  let FIG = 0, PAGE = 0;
  const fig = (title, sub) => `<div class="fig-cap"><span class="fno">ภาพที่ ${++FIG}</span>${esc(title)}</div>${sub ? `<div class="fig-sub">${esc(sub)}</div>` : ''}`;

  // ------------------------------------------------------------------ model
  function buildModel(d) {
    const th = Object.assign({}, DEFAULT_THRESHOLDS, d.thresholds);
    const comps = d.competencies.map(c => {
      const gap = c.score - c.required;
      const status = gap >= th.watch ? 'strength' : gap >= th.priority ? 'watch' : 'priority';
      return Object.assign({}, c, { gap, status });
    });
    const clusters = d.clusters.map((cl, i) => {
      const items = comps.filter(c => c.cluster === cl.id);
      return Object.assign({}, cl, {
        idx: i, items,
        score: mean(items.map(c => c.score)), required: mean(items.map(c => c.required)),
        prev: items.every(c => c.prev != null) ? mean(items.map(c => c.prev)) : null,
        pctMeet: mean(items.map(c => c.pctMeet)),
        nMeet: items.filter(c => c.status === 'strength').length,
        best: [...items].sort((a, b) => b.gap - a.gap)[0], worst: [...items].sort((a, b) => a.gap - b.gap)[0],
      });
    });
    const byGap = [...comps].sort((a, b) => a.gap - b.gap);
    const isInd = d.meta.level === 'individual';
    return {
      d, th, comps, clusters, byGap, isInd, L: LEVEL[d.meta.level],
      overall: mean(comps.map(c => c.score)), overallReq: mean(comps.map(c => c.required)),
      overallPrev: comps.every(c => c.prev != null) ? mean(comps.map(c => c.prev)) : null,
      pctMeet: mean(comps.map(c => c.pctMeet)),
      nPriority: comps.filter(c => c.status === 'priority').length,
      nStrength: comps.filter(c => c.status === 'strength').length,
      strongest: byGap[byGap.length - 1], weakest: byGap[0],
    };
  }

  // ------------------------------------------------------------------ narrative (auto, overridable)
  function narrative(m) {
    const o = m.d.narrative || {};
    const W = m.weakest, S = m.strongest, ent = m.d.meta.entityName;
    const delta = m.overallPrev != null ? m.overall - m.overallPrev : null;
    const auto = {};
    if (m.isInd) {
      auto.headline = `จุดแข็งที่โดดเด่นคือ “${S.name}” — โอกาสพัฒนาลำดับแรกคือ “${W.name}”`;
      auto.lede = `รายงานนี้สรุปผลการประเมินสมรรถนะแบบ 360 องศาของท่าน เทียบกับระดับที่ตำแหน่ง ${m.d.person?.jobLevel || ''} กำหนด ท่านมีสมรรถนะที่ถึงหรือสูงกว่ามาตรฐาน ${m.nStrength} จาก ${m.comps.length} ด้าน ใช้รายงานนี้เป็นจุดตั้งต้นในการพูดคุยกับผู้บังคับบัญชาเพื่อจัดทำแผนพัฒนารายบุคคล (IDP) ภายใน 30 วัน`;
    } else {
      auto.headline = `“${S.name}” คือรากฐานที่แข็งแรง แต่ “${W.name}” คือช่องว่างที่ต้องปิดเป็นลำดับแรก`;
      auto.lede = `ผลการประเมินของ${ent}จากผู้ตอบ ${m.d.participation.completed.toLocaleString()} คน พบว่าพนักงานโดยเฉลี่ย ${pct(m.pctMeet)}% มีสมรรถนะถึงระดับที่ตำแหน่งกำหนด`
        + (delta != null ? ` คะแนนรวมเฉลี่ย${delta >= 0 ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(delta).toFixed(2)} จุดจากรอบก่อน` : '')
        + ` และมี ${m.nPriority} สมรรถนะที่ต่ำกว่ามาตรฐานอย่างมีนัยสำคัญ การวางแผนพัฒนาจึงควรมุ่งที่ช่องว่างเหล่านี้ ควบคู่กับการใช้จุดแข็งเป็นกลไกถ่ายทอดความรู้`;
    }
    auto.insights = m.isInd ? [
      `ระดับสมรรถนะเฉลี่ย ${f2(m.overall)} เทียบกับมาตรฐานตำแหน่ง ${f2(m.overallReq)} (${sgn(m.overall - m.overallReq)})`,
      `ช่องว่างที่ใหญ่ที่สุดคือ ${W.name} (${sgn(W.gap)}) ควรเป็นเป้าหมายแรกของ IDP`,
      `${S.name} สูงกว่ามาตรฐาน ${sgn(S.gap)} — สามารถเป็นพี่เลี้ยงให้เพื่อนร่วมทีมได้`,
    ] : [
      `${m.nStrength} จาก ${m.comps.length} สมรรถนะถึงมาตรฐาน · ${m.nPriority} สมรรถนะอยู่ในกลุ่ม “ต้องพัฒนาเร่งด่วน”`,
      `${W.name} มีช่องว่างมากที่สุด (${sgn(W.gap)}) และมีพนักงานเพียง ${pct(W.pctMeet)}% ที่ถึงมาตรฐาน`,
      `${S.name} สูงกว่ามาตรฐาน ${sgn(S.gap)} — ใช้เป็นต้นแบบและกลไก mentoring ได้`,
    ];
    return Object.assign(auto, o);
  }

  // ------------------------------------------------------------------ decoration (original art, not traced)
  function curves(w, h, opts = {}) {
    const { x0 = 0.18, glow = true } = opts;
    let p = '';
    const lines = [[0.05, 0.62], [0.14, 0.58], [0.24, 0.66]];
    lines.forEach(([dy, ex], i) => {
      const sx = w * x0, sy = -10, ey = h * (0.22 + dy), cx1 = w * (x0 + 0.12), cy1 = h * (0.55 + dy), cx2 = w * (ex - 0.12), cy2 = h * 0.42;
      p += `<path d="M${sx},${sy} C${cx1},${cy1} ${cx2},${cy2} ${w * ex},${ey}" stroke="rgba(185,205,240,${0.55 - i * 0.1})" stroke-width="2" fill="none"/>`;
      if (glow) p += `<circle cx="${w * ex}" cy="${ey}" r="5" fill="#cfe1fb"/><circle cx="${w * ex}" cy="${ey}" r="14" fill="rgba(134,182,239,.25)"/>`;
    });
    p += `<path d="M${w * 0.5},-10 C${w * 0.6},${h * 0.5} ${w * 0.75},${h * 0.2} ${w * 0.95},-10" stroke="rgba(185,205,240,.35)" stroke-width="2" fill="none"/>`;
    return p;
  }
  function dots(w, h, cols, rows, x0, y0, step, seed = 7) {
    let p = '', s = seed;
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const v = r(); if (v < 0.45) continue;
      const fade = 1 - i / cols;
      p += `<circle cx="${x0 + i * step}" cy="${y0 + j * step}" r="${v > 0.92 ? 3.2 : 2.4}" fill="rgba(${v > 0.92 ? '160,205,255' : '42,120,214'},${(0.35 + 0.55 * fade).toFixed(2)})"/>`;
    }
    return p;
  }
  function particles(w, h, n, cx, cy, spread, seed = 3) {
    let p = '', s = seed;
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * spread;
      p += `<circle cx="${(cx + Math.cos(a) * d * 1.6).toFixed(1)}" cy="${(cy + Math.sin(a) * d * 0.55).toFixed(1)}" r="${(r() * 1.4 + 0.4).toFixed(1)}" fill="rgba(170,210,255,${(r() * 0.6 + 0.15).toFixed(2)})"/>`;
    }
    return p;
  }
  const svgLayer = (w, h, inner) => `<svg class="deco" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none">${inner}</svg>`;

  // ------------------------------------------------------------------ fan (the "competency landscape" map)
  function fanPath(cx, cy, r0, r1, a0, a1) {
    const pt = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
    const [x1, y1] = pt(r1, a0), [x2, y2] = pt(r1, a1), [x3, y3] = pt(r0, a1), [x4, y4] = pt(r0, a0);
    return r0 > 0
      ? `M${x1},${y1} A${r1},${r1} 0 0 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0 0 ${x4},${y4} Z`
      : `M${cx},${cy} L${x1},${y1} A${r1},${r1} 0 0 1 ${x2},${y2} Z`;
  }
  const FAN_FILLS = ['#b7d3f6', '#2a78d6', '#0d2f78'];
  function fan(items, opts = {}) {
    const { w = 260, h = 150, highlight = null, mini = false } = opts;
    const cx = w / 2, cy = h - 4, A = (mini ? 52 : 55) * Math.PI / 180;
    const R = [0, h * 0.40, h * 0.69, h * 0.97];
    let p = '';
    for (let k = 2; k >= 0; k--) {
      const fill = mini ? (highlight ? FAN_FILLS[k] : 'none') : FAN_FILLS[k];
      p += `<path d="${fanPath(cx, cy, R[k], R[k + 1], -A, A)}" fill="${fill}" stroke="${mini ? '#b7d3f6' : '#86b6ef'}" stroke-width="${mini ? 1.2 : 1.5}"/>`;
    }
    if (!mini) {
      [0, 1, 2].forEach(ring => {
        const list = items.filter(c => STATUS[c.status].ring === ring);
        list.forEach((c, i) => {
          const span = list.length > 2 ? 0.8 : 0.62, stagger = list.length > 2;
          const a = list.length === 1 ? 0 : -A * span + (2 * A * span) * i / (list.length - 1);
          const rr = ring === 0
            ? R[1] * 0.82
            : R[ring] + (R[ring + 1] - R[ring]) * (stagger ? (i % 2 ? 0.78 : 0.3) : 0.5);
          const x = cx + rr * Math.sin(a), y = cy - rr * Math.cos(a);
          p += `<g><title>${esc(c.name)} · คะแนน ${f2(c.score)} · มาตรฐาน ${f2(c.required)} · ${sgn(c.gap)}</title><circle cx="${x}" cy="${y}" r="${stagger ? 9.8 : 11.5}" fill="#eb6834" stroke="${FAN_FILLS[ring]}" stroke-width="1.5"/><text x="${x}" y="${y + 3.8}" text-anchor="middle" font-family="IBM Plex Sans" font-weight="600" font-size="${stagger ? 10.5 : 11.5}" fill="#fff">${c.no}</text></g>`;
        });
      });
    } else if (highlight) {
      p += `<circle cx="${cx}" cy="${cy - R[3] + 5}" r="3" fill="#eb6834"/>`;
    }
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${p}</svg>`;
  }
  const fanNav = (m, active) => `<div style="display:flex;gap:10px">${m.clusters.map(c => fan([], { w: 68, h: 36, mini: true, highlight: c.id === active })).join('')}</div>`;

  // ------------------------------------------------------------------ charts
  /** Diverging bar: gap to standard for every competency, sorted. */
  function gapBars(m, width = 760) {
    const rows = [...m.comps].sort((a, b) => b.gap - a.gap);
    const rowH = 22.5, labW = 250, valW = 120, top = 20;
    const ext = Math.max(0.5, Math.ceil(Math.max(...rows.map(r => Math.abs(r.gap))) * 4) / 4);
    const plotW = width - labW - valW, x0 = labW + plotW / 2, sc = (plotW / 2) / ext;
    const H = top + rows.length * rowH + 22;
    let p = '';
    const ticks = []; for (let t = -ext; t <= ext + 1e-9; t += (ext > 0.5 ? 0.25 : 0.25)) ticks.push(+t.toFixed(2));
    (ticks.length > 7 ? ticks.filter((t, i) => i % 2 === (ticks.indexOf(0) % 2)) : ticks).forEach(t => {
      const x = x0 + t * sc;
      p += `<line x1="${x}" x2="${x}" y1="${top - 4}" y2="${H - 20}" stroke="${t === 0 ? '#0b0b0b' : '#e6e8ee'}" stroke-width="${t === 0 ? 1.2 : 1}"/>`;
      p += `<text x="${x}" y="${H - 6}" text-anchor="middle" font-size="10.5" fill="#8a8983" font-family="IBM Plex Sans">${t === 0 ? 'มาตรฐาน' : sgn(t)}</text>`;
    });
    p += `<text x="${x0 - 8}" y="12" text-anchor="end" font-size="11" fill="#52514e">◀ ต่ำกว่ามาตรฐาน</text><text x="${x0 + 8}" y="12" font-size="11" fill="#52514e">สูงกว่ามาตรฐาน ▶</text>`;
    rows.forEach((c, i) => {
      const y = top + i * rowH, bw = Math.max(2, Math.abs(c.gap) * sc), pos = c.gap >= 0;
      const x = pos ? x0 + 1 : x0 - bw - 1, col = pos ? '#2a78d6' : (c.status === 'priority' ? '#d03b3b' : '#ec8f86');
      p += `<g><title>${esc(c.name)}: คะแนน ${f2(c.score)} · มาตรฐาน ${f2(c.required)} · ช่องว่าง ${sgn(c.gap)}</title>`;
      p += `<rect x="0" y="${y}" width="${width}" height="${rowH}" fill="transparent"/>`;
      p += `<text x="0" y="${y + 15}" font-size="12.5" fill="#0b0b0b"><tspan font-family="IBM Plex Sans" font-weight="600" fill="#2a78d6">${c.id}</tspan>  ${esc(c.name)}</text>`;
      p += `<rect x="${x}" y="${y + 5}" width="${bw}" height="12" rx="3" fill="${col}"/>`;
      p += `<text x="${width - valW + 14}" y="${y + 15}" font-size="12" font-family="IBM Plex Sans" font-weight="500" fill="#0b0b0b">${sgn(c.gap)}</text>`;
      p += `<g transform="translate(${width - valW + 62},${y + 4.5})">${statusIcon(c.status).replace('<svg ', '<svg width="13" height="13" ')}</g></g>`;
    });
    return `<svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}">${p}</svg>`;
  }

  /** Dumbbell: score vs required on the 1–5 scale, with 95% CI and previous cycle. */
  function dumbbell(items, width = 600, opts = {}) {
    const labW = 200, valW = 112, top = 20, rowH = opts.rowH || 40;
    const plotW = width - labW - valW, x = v => labW + (v - 1) / 4 * plotW;
    const H = top + items.length * rowH + 6;
    let p = '';
    [1, 2, 3, 4, 5].forEach(t => {
      p += `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${H - 4}" stroke="#e6e8ee"/><text x="${x(t)}" y="${top - 8}" text-anchor="middle" font-size="10.5" fill="#8a8983" font-family="IBM Plex Sans">${t}</text>`;
    });
    items.forEach((c, i) => {
      const y = top + i * rowH + rowH / 2;
      p += `<g><title>${esc(c.name)} · คะแนน ${f2(c.score)}${c.ci95 ? ' (95% CI ±' + f2(c.ci95) + ')' : ''} · มาตรฐาน ${f2(c.required)}${c.prev != null ? ' · รอบก่อน ' + f2(c.prev) : ''}</title>`;
      p += `<text x="0" y="${y - 2}" font-size="12.5" fill="#0b0b0b"><tspan font-family="IBM Plex Sans" font-weight="600" fill="#2a78d6">${c.id}</tspan> ${esc(c.name)}</text>`;
      p += `<text x="0" y="${y + 13}" font-size="10.5" fill="#8a8983" font-family="IBM Plex Sans">${esc(c.nameEn)}</text>`;
      const a = Math.min(c.score, c.required), b = Math.max(c.score, c.required);
      p += `<line x1="${x(a)}" x2="${x(b)}" y1="${y}" y2="${y}" stroke="${c.gap >= 0 ? '#86b6ef' : '#f5c6c3'}" stroke-width="6" stroke-linecap="round"/>`;
      if (c.ci95) p += `<line x1="${x(c.score - c.ci95)}" x2="${x(c.score + c.ci95)}" y1="${y}" y2="${y}" stroke="#0d366b" stroke-width="1.5"/><line x1="${x(c.score - c.ci95)}" x2="${x(c.score - c.ci95)}" y1="${y - 4}" y2="${y + 4}" stroke="#0d366b" stroke-width="1.5"/><line x1="${x(c.score + c.ci95)}" x2="${x(c.score + c.ci95)}" y1="${y - 4}" y2="${y + 4}" stroke="#0d366b" stroke-width="1.5"/>`;
      if (c.prev != null) p += `<circle cx="${x(c.prev)}" cy="${y}" r="4.5" fill="#fff" stroke="#8a8983" stroke-width="1.5"/>`;
      p += `<rect x="${x(c.required) - 1.5}" y="${y - 10}" width="3" height="20" rx="1" fill="#1d1d2b"/>`;
      p += `<circle cx="${x(c.score)}" cy="${y}" r="7" fill="#2a78d6" stroke="#fff" stroke-width="2"/>`;
      p += `<text x="${width - valW + 10}" y="${y - 1}" font-size="13" font-family="IBM Plex Sans" font-weight="600">${f2(c.score)}</text><text x="${width - valW + 50}" y="${y - 1}" font-size="11.5" font-family="IBM Plex Sans" fill="#52514e">${sgn(c.gap)}</text>`;
      p += `<g transform="translate(${width - valW + 10},${y + 5})">${statusIcon(c.status).replace('<svg ', '<svg width="11" height="11" ')}</g><text x="${width - valW + 25}" y="${y + 14}" font-size="10.5" fill="#52514e">${STATUS[c.status].th}</text></g>`;
    });
    return `<svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}">${p}</svg>`;
  }
  const dumbbellLegend = (withCI, withPrev) => `<div style="display:flex;gap:18px;font-size:11px;color:#52514e;align-items:center;margin-top:2px">
    <span style="display:flex;align-items:center;gap:5px"><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#2a78d6"/></svg>คะแนนเฉลี่ย</span>
    <span style="display:flex;align-items:center;gap:5px"><svg width="6" height="16"><rect x="1.5" width="3" height="16" fill="#1d1d2b"/></svg>ระดับที่ตำแหน่งกำหนด</span>
    ${withCI ? '<span style="display:flex;align-items:center;gap:5px"><svg width="22" height="10"><path d="M2 1v8M2 5h18M20 1v8" stroke="#0d366b" stroke-width="1.5" fill="none"/></svg>ช่วงความเชื่อมั่น 95%</span>' : ''}
    ${withPrev ? '<span style="display:flex;align-items:center;gap:5px"><svg width="12" height="12"><circle cx="6" cy="6" r="4.5" fill="#fff" stroke="#8a8983" stroke-width="1.5"/></svg>รอบประเมินก่อน</span>' : ''}</div>`;

  /** 100% stacked bar of proficiency distribution (ordinal ramp). */
  function distBars(items, width = 600) {
    const labW = 200, top = 2, rowH = 21, plotW = width - labW - 10;
    const H = top + items.length * rowH + 4;
    let p = '';
    items.forEach((c, i) => {
      const y = top + i * rowH; let acc = 0;
      p += `<text x="0" y="${y + 14}" font-size="11.5" fill="#0b0b0b"><tspan font-family="IBM Plex Sans" font-weight="600" fill="#2a78d6">${c.id}</tspan> ${esc(c.name)}</text>`;
      c.dist.forEach((v, k) => {
        if (v <= 0) return;
        const w = v * plotW, xx = labW + acc * plotW;
        p += `<g><title>${esc(c.name)} · ระดับ ${k + 1}: ${pct(v)}%</title><rect x="${xx + 1}" y="${y + 3}" width="${Math.max(0, w - 2)}" height="15" rx="${k === 0 || k === 4 ? 3 : 0}" fill="${ORDINAL[k]}"/></g>`;
        if (v >= 0.09) p += `<text x="${xx + w / 2}" y="${y + 14.5}" text-anchor="middle" font-size="10" font-family="IBM Plex Sans" fill="${k >= 2 ? '#fff' : '#0b0b0b'}">${pct(v)}</text>`;
        acc += v;
      });
    });
    return `<svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}">${p}</svg>`;
  }
  const distLegend = scale => `<div style="display:flex;gap:12px;font-size:10.5px;color:#52514e;margin-top:2px">${scale.map((s, k) => `<span style="display:flex;align-items:center;gap:4px"><i style="width:12px;height:10px;border-radius:2px;background:${ORDINAL[k]};display:inline-block"></i>${s.level} ${esc(s.label)}</span>`).join('')}</div>`;

  /** Radar (spider) for the individual profile. */
  function radar(m, size = 420) {
    const c = size / 2, R = size / 2 - 64, n = m.comps.length;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
    const pt = (i, v) => [c + R * (v / 5) * Math.cos(ang(i)), c + R * (v / 5) * Math.sin(ang(i))];
    const poly = (vals) => vals.map((v, i) => pt(i, v).map(z => z.toFixed(1)).join(',')).join(' ');
    let p = '';
    [1, 2, 3, 4, 5].forEach(t => p += `<polygon points="${poly(Array(n).fill(t))}" fill="none" stroke="#e6e8ee"/>`);
    m.comps.forEach((cc, i) => {
      const [x, y] = pt(i, 5), [lx, ly] = pt(i, 5.75);
      p += `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#e6e8ee"/>`;
      p += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="11.5" font-family="IBM Plex Sans" font-weight="600" fill="#2a78d6">${cc.id}</text>`;
    });
    [1, 3, 5].forEach(t => { const [x, y] = pt(0, t); p += `<text x="${x + 4}" y="${y + 3}" font-size="9.5" fill="#8a8983" font-family="IBM Plex Sans">${t}</text>`; });
    // clusters arcs label
    p += `<polygon points="${poly(m.comps.map(x => x.required))}" fill="none" stroke="#1d1d2b" stroke-width="2"/>`;
    p += `<polygon points="${poly(m.comps.map(x => x.score))}" fill="rgba(42,120,214,.16)" stroke="#2a78d6" stroke-width="2"/>`;
    p += `<polygon points="${poly(m.comps.map(x => x.raters?.self ?? x.score))}" fill="none" stroke="#eb6834" stroke-width="2"/>`;
    m.comps.forEach((cc, i) => { const [x, y] = pt(i, cc.score); p += `<circle cx="${x}" cy="${y}" r="4.5" fill="#2a78d6" stroke="#fff" stroke-width="2"><title>${esc(cc.name)}: ผู้อื่น ${f2(cc.score)} · ตนเอง ${f2(cc.raters?.self)} · มาตรฐาน ${f2(cc.required)}</title></circle>`; });
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}</svg>`;
  }

  /** Self vs others dot plot (individual). */
  function selfOthers(m, width = 700) {
    const labW = 220, top = 22, rowH = 26.5, plotW = width - labW - 70, x = v => labW + (v - 1) / 4 * plotW;
    const H = top + m.comps.length * rowH + 4;
    let p = '';
    [1, 2, 3, 4, 5].forEach(t => p += `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${H}" stroke="#e6e8ee"/><text x="${x(t)}" y="${top - 9}" text-anchor="middle" font-size="10.5" fill="#8a8983" font-family="IBM Plex Sans">${t}</text>`);
    m.comps.forEach((c, i) => {
      const y = top + i * rowH + rowH / 2, s = c.raters.self, o = c.score, d = s - o;
      p += `<g><title>${esc(c.name)} · ตนเอง ${f2(s)} · ผู้อื่น ${f2(o)} · ส่วนต่าง ${sgn(d)}</title>`;
      p += `<text x="0" y="${y + 4}" font-size="12.3"><tspan font-family="IBM Plex Sans" font-weight="600" fill="#2a78d6">${c.id}</tspan> ${esc(c.name)}</text>`;
      p += `<line x1="${x(Math.min(s, o))}" x2="${x(Math.max(s, o))}" y1="${y}" y2="${y}" stroke="${d >= 0.5 ? '#f3b49b' : '#d6dbe4'}" stroke-width="4" stroke-linecap="round"/>`;
      p += `<rect x="${x(c.required) - 1.5}" y="${y - 9}" width="3" height="18" rx="1" fill="#1d1d2b"/>`;
      p += `<circle cx="${x(o)}" cy="${y}" r="6.5" fill="#2a78d6" stroke="#fff" stroke-width="2"/><circle cx="${x(s)}" cy="${y}" r="6.5" fill="#eb6834" stroke="#fff" stroke-width="2"/>`;
      p += `<text x="${width - 58}" y="${y + 4}" font-size="11.5" font-family="IBM Plex Sans" fill="${d >= 0.5 ? '#b2461c' : '#52514e'}" font-weight="${d >= 0.5 ? 600 : 400}">${sgn(d)}</text></g>`;
    });
    return `<svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}">${p}</svg>`;
  }

  // ------------------------------------------------------------------ page shell
  function page(cls, inner, opts = {}) {
    PAGE++;
    const m = opts.m;
    const head = opts.noHead ? '' : `<div class="run-head">${esc(m.d.meta.cycleEn)} · ${esc(m.L.en)}</div>`;
    const foot = opts.noFoot ? '' : `<div class="run-foot"><span class="conf">${esc(m.d.meta.confidentiality)} · ${esc(m.d.meta.entityName)}</span><span>${esc(m.d.meta.organization)}</span><span class="pg num">${PAGE}</span></div>`;
    return `<section class="page ${cls}">${opts.deco || ''}${head}<div class="body">${inner}</div>${foot}</section>`;
  }

  // ------------------------------------------------------------------ pages
  function pCover(m) {
    const d = m.d, mt = d.meta;
    const deco = svgLayer(1280, 720,
      `<defs><radialGradient id="cg" cx="0.72" cy="0.5" r="0.5"><stop offset="0" stop-color="#1c4596" stop-opacity=".9"/><stop offset="1" stop-color="#0b2463" stop-opacity="0"/></radialGradient></defs>
       <rect width="1280" height="720" fill="url(#cg)"/>
       ${particles(1280, 720, 520, 900, 380, 300, 11)}
       <rect x="0" y="352" width="1280" height="26" fill="rgba(80,150,240,.10)"/>
       <circle cx="930" cy="380" r="205" fill="#0b2463" stroke="#4f97ec" stroke-width="5"/>
       <circle cx="930" cy="380" r="214" fill="none" stroke="rgba(134,182,239,.35)" stroke-width="10"/>
       ${(() => { // concentric proficiency rings + rising curves inside the circle (original motif)
          let q = '<clipPath id="cc"><circle cx="930" cy="380" r="203"/></clipPath><g clip-path="url(#cc)">';
          for (let k = 0; k < 6; k++) q += `<path d="M720,${470 + k * 26} C840,${520 + k * 20} 930,${470 - k * 6} ${1150},${250 + k * 34}" stroke="rgba(160,200,250,${0.75 - k * 0.1})" stroke-width="2" fill="none"/>`;
          [[810, 452], [870, 470], [940, 452], [995, 402], [1040, 350], [1088, 300], [905, 515], [980, 520]].forEach(([x, y]) => q += `<circle cx="${x}" cy="${y}" r="9" fill="rgba(134,182,239,.35)"/><circle cx="${x}" cy="${y}" r="3.5" fill="#fff"/>`);
          for (let i = 0; i < 6; i++) q += `<rect x="${745 + i * 60}" y="${600 - i * 34 - 60}" width="40" height="${i * 34 + 60}" fill="rgba(42,120,214,${0.12 + i * 0.03})"/>`;
          return q + '</g>';
        })()}`);
    return page('navy cover', `
      <div class="logo"><i></i>${esc(mt.organization)}</div>
      <div class="title-block">
        <div class="lvl">${esc(m.L.th)} · ${esc(m.L.en.toUpperCase())}</div>
        <h1 class="display">รายงานผลการประเมิน<br>สมรรถนะ ${esc(mt.cycle.replace(/^การประเมินสมรรถนะประจำปี\s*/, ''))}</h1>
        <div class="entity">${esc(mt.entityName)}${m.isInd && d.person ? ` · ${esc(d.person.position)}` : ''}</div>
        ${mt.path?.length ? `<div class="path">${mt.path.map(esc).join('  ›  ')}</div>` : ''}
      </div>
      <div class="meta">
        <div>ช่วงการประเมิน<b>${esc(mt.period)}</b></div>
        <div>วิธีการประเมิน<b>${esc(mt.method)}</b></div>
        <div>วันที่ออกรายงาน<b>${esc(mt.reportDate)}</b></div>
        <div>ชั้นความลับ<b>${esc(mt.confidentiality)}</b></div>
      </div>`, { m, deco, noHead: true, noFoot: true });
  }

  function pForeword(m, N) {
    const d = m.d, s = d.foreword?.signer || {};
    return page('navy foreword', `
      <h1 class="display">${esc(N.headline)}</h1>
      <p class="lede">${esc(N.lede)}</p>
      <div class="pillars">${m.clusters.map(cl => `
        <div class="pillar">
          <div class="ic">${icon(cl.id, 'sm')}</div>
          <h3>${esc(cl.name)}</h3><div class="en">${esc(cl.nameEn)}</div>
          <p>${esc(cl.tagline)}</p>
          <div class="kpi">
            <div><b class="num">${f2(cl.score)}</b>คะแนนเฉลี่ย</div>
            <div><b class="num">${sgn(cl.score - cl.required)}</b>เทียบมาตรฐาน</div>
            <div><b class="num">${cl.nMeet}/${cl.items.length}</b>ถึงมาตรฐาน</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="signer"><div class="av">${esc((s.name || 'HR').replace(/^ดร\./, '').trim().charAt(0))}</div><div><b>${esc(s.name)}</b><span>${esc(s.title)}</span></div></div>`,
      { m, deco: svgLayer(1280, 720, particles(1280, 720, 220, 1180, 690, 140, 5)) });
  }

  function pLandscape(m) {
    const th = m.th;
    return page('navy landscape', `
      <h1 class="display">ภูมิทัศน์สมรรถนะ ${esc(m.isInd ? 'ของท่าน' : m.d.meta.entityName)}</h1>
      <div class="cols">
        <div class="intro">
          <p>การประเมินสมรรถนะต้องสมดุลระหว่าง “ความพร้อมในวันนี้” และ “ความสามารถที่องค์กรต้องการในอนาคต”</p>
          <p>แผนภาพนี้จัดสมรรถนะทั้ง ${m.comps.length} ด้านออกเป็น 3 กลุ่ม และวางแต่ละสมรรถนะลงในวงตาม <b>ช่องว่างจากมาตรฐาน</b> (คะแนนจริง − ระดับที่ตำแหน่งกำหนด) ยิ่งอยู่วงนอก ยิ่งห่างจากมาตรฐาน</p>
          <p>ใช้แผนภาพนี้เพื่อตัดสินใจว่าสมรรถนะใดควร <b>รักษา</b> ใดควร <b>เฝ้าระวัง</b> และใดต้อง <b>ลงทุนพัฒนา</b> เป็นลำดับแรก</p>
          ${fig('ภูมิทัศน์สมรรถนะ', '').replace('fig-cap', 'fig-cap" style="color:#fff;margin-top:22px').replace('fig-sub', 'x')}
          <div class="small" style="color:#b9c6e6">ที่มา: ${esc(m.d.meta.cycle)}, n = ${m.d.participation.completed.toLocaleString()}</div>
        </div>
        <div>
          <div class="fan-legend">
            ${['strength', 'watch', 'priority'].map((k, i) => `<div><svg width="34" height="20">${`<path d="${fanPath(17, 19, i === 0 ? 0 : 8, 18, -0.9, 0.9)}" fill="${FAN_FILLS[i]}" stroke="#86b6ef"/>`}</svg><div><b>${STATUS[k].th}</b><span>${k === 'strength' ? 'ถึง/สูงกว่ามาตรฐาน' : k === 'watch' ? `ต่ำกว่าไม่เกิน ${Math.abs(th.priority).toFixed(2)}` : `ต่ำกว่าเกิน ${Math.abs(th.priority).toFixed(2)}`}</span></div></div>`).join('')}
          </div>
          <div class="fans">${m.clusters.map(cl => `
            <div class="fan-col">
              <div style="position:relative;width:260px;height:196px;margin:0 auto">
                ${fan(cl.items, { w: 260, h: 152 })}
                <div style="position:absolute;left:99px;top:126px">${icon(cl.id)}</div>
              </div>
              <h4>${esc(cl.name)}<br><span style="font-weight:400;font-size:12px;color:#b9c6e6">${esc(cl.nameEn)}</span></h4>
              <ol>${cl.items.map(c => `<li><span class="badge">${c.no}</span><span>${esc(c.name)}</span></li>`).join('')}</ol>
            </div>`).join('')}
          </div>
        </div>
      </div>`, { m, deco: svgLayer(1280, 720, dots(1280, 720, 22, 4, 40, 640, 18, 4) + particles(1280, 720, 160, 160, 690, 110, 9)) });
  }

  function pGlance(m, N) {
    const d = m.d, pr = d.participation;
    const delta = m.overallPrev != null ? m.overall - m.overallPrev : null;
    const tiles = m.isInd ? [
      ['ระดับสมรรถนะเฉลี่ย', `${f2(m.overall)}<small>/ 5</small>`, `มาตรฐานตำแหน่ง ${f2(m.overallReq)} (${sgn(m.overall - m.overallReq)})`],
      ['สมรรถนะที่ถึงมาตรฐาน', `${m.nStrength}<small>/ ${m.comps.length}</small>`, `${m.nPriority} ด้านต้องพัฒนาเร่งด่วน`],
      ['จุดแข็งสูงสุด', `<span class="text">${esc(m.strongest.name)}</span>`, `${sgn(m.strongest.gap)} จากมาตรฐาน`],
      ['โอกาสพัฒนาลำดับแรก', `<span class="text">${esc(m.weakest.name)}</span>`, `${sgn(m.weakest.gap)} จากมาตรฐาน`],
    ] : [
      ['อัตราการตอบกลับ', `${pct(pr.completed / pr.invited)}<small>%</small>`, `${pr.completed.toLocaleString()} จาก ${pr.invited.toLocaleString()} คน`],
      ['คะแนนสมรรถนะเฉลี่ย', `${f2(m.overall)}<small>/ 5</small>`, `มาตรฐาน ${f2(m.overallReq)}${delta != null ? ` · รอบก่อน ${sgn(delta)}` : ''}`],
      ['ถึงระดับที่ตำแหน่งกำหนด', `${pct(m.pctMeet)}<small>%</small>`, 'สัดส่วนเฉลี่ยของพนักงาน×สมรรถนะ'],
      ['สมรรถนะที่ต้องพัฒนาเร่งด่วน', `${m.nPriority}<small>/ ${m.comps.length}</small>`, `${m.nStrength} ด้านถึงมาตรฐาน`],
    ];
    return page('content glance', `
      <div class="kicker">ภาพรวมในหนึ่งหน้า · At a glance</div>
      <h1 class="display">${m.isInd ? 'สมรรถนะของท่านเทียบกับมาตรฐานตำแหน่ง' : `${esc(d.meta.entityName)} อยู่ตรงไหนเมื่อเทียบกับมาตรฐาน`}</h1>
      <div class="tiles">${tiles.map(([l, v, s]) => `<div class="tile"><div class="lab">${l}</div><div class="val num">${v}</div><div class="sub">${s}</div></div>`).join('')}</div>
      <div class="grid-2">
        <div>${fig('ช่องว่างจากมาตรฐาน รายสมรรถนะ', 'คะแนนเฉลี่ยถ่วงน้ำหนัก − ระดับที่ตำแหน่งกำหนด เรียงจากมากไปน้อย')}${gapBars(m, 770)}</div>
        <div class="insight-box" style="align-self:start;margin-top:40px">
          <h4>ข้อมูลบอกอะไรเรา</h4>
          <ol>${N.insights.map((t, i) => `<li><span class="badge blue">${i + 1}</span><span>${esc(t)}</span></li>`).join('')}</ol>
          <div class="source">ที่มา: ${esc(d.meta.cycle)}${m.isInd ? '' : `, n = ${pr.completed.toLocaleString()}`}</div>
        </div>
      </div>`, { m });
  }

  function pBreakdown(m) {
    const b = m.d.breakdown; if (!b) return '';
    const minN = m.d.privacy?.minN ?? 3;
    const named = m.d.meta.level === 'subdepartment';
    const rows = b.rows;
    const withCallouts = rows.length <= 9;
    const rowH = Math.max(18, Math.min(34, Math.floor((withCallouts ? 200 : 360) / (rows.length + 1))));
    const cell = (s) => { const g = s.score - s.required, bin = gapBin(g); return `<td style="background:${bin.bg};color:${bin.fg}" title="คะแนน ${f2(s.score)} · มาตรฐาน ${f2(s.required)} · ${sgn(g)}">${s.score.toFixed(1)}</td>`; };
    const masked = `<td style="background:repeating-linear-gradient(45deg,#f5f5f3,#f5f5f3 4px,#e9e9e6 4px,#e9e9e6 6px);color:#8a8983">n&lt;${minN}</td>`;
    return page('content breakdown', `
      <div class="kicker">เจาะลึก${esc(b.label)} · Drill-down</div>
      <h1 class="display">ช่องว่างกระจุกตัวอยู่ที่ใด</h1>
      <div style="margin-top:16px">${fig(`แผนที่ความร้อนของคะแนนสมรรถนะ ${b.label}`, 'ตัวเลขคือคะแนนเฉลี่ย (1–5) · สีแสดงช่องว่างเทียบกับระดับที่ตำแหน่งกำหนดของหน่วยนั้น')}</div>
      <table class="heat" style="--rowh:${rowH}px;font-size:${rowH < 26 ? 11.5 : 12.5}px">
        <thead><tr><th class="rowh"></th><th></th>${m.clusters.map(cl => `<th class="grp" colspan="${cl.items.length}">${esc(cl.name)}</th>`).join('')}</tr>
        <tr><th class="rowh">${esc(b.label.replace(/^ราย/, ''))}</th><th>n</th>${m.comps.map(c => `<th><span class="num" style="color:#2a78d6;font-weight:600">${c.id}</span><br>${esc(c.name)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td class="rowh">${esc(r.name)}</td><td class="n num">${r.n}</td>${m.comps.map(c => (!named && r.n < minN) ? masked : cell(r.scores[c.id])).join('')}</tr>`).join('')}
          <tr class="total"><td class="rowh">รวมทั้ง${esc(m.L.unit)}</td><td class="n num">${m.d.participation.completed}</td>${m.comps.map(c => cell(c)).join('')}</tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
        <div class="scale-legend"><span style="margin-left:0">ต่ำกว่ามาตรฐาน</span>${GAP_BINS.map(g => `<i style="background:${g.bg}" title="${g.label}"></i>`).join('')}<span>สูงกว่ามาตรฐาน</span></div>
        <div class="source">${named ? 'แสดงรายบุคคลเฉพาะผู้บังคับบัญชาโดยตรงและ HRBP' : `หน่วยที่มีผู้ตอบน้อยกว่า ${minN} คนจะถูกปิดบังเพื่อรักษาความลับ`} · ที่มา: ${esc(m.d.meta.cycle)}</div>
      </div>
      ${withCallouts ? heatCallouts(m, rows.filter(r => named || r.n >= minN), b.label) : ''}`, { m });
  }

  /** Three auto-generated reading cues under the heatmap: hotspot, strongest unit, widest spread. */
  function heatCallouts(m, rows, label) {
    if (!rows.length) return '';
    const cells = [];
    rows.forEach(r => m.comps.forEach(c => cells.push({ r, c, s: r.scores[c.id].score, g: r.scores[c.id].score - r.scores[c.id].required })));
    const hot = cells.sort((a, b) => a.g - b.g)[0];
    const unitGap = rows.map(r => ({ r, g: mean(m.comps.map(c => r.scores[c.id].score - r.scores[c.id].required)) })).sort((a, b) => b.g - a.g);
    const spread = m.comps.map(c => { const v = rows.map(r => r.scores[c.id].score); return { c, d: Math.max(...v) - Math.min(...v), hi: rows[v.indexOf(Math.max(...v))].name, lo: rows[v.indexOf(Math.min(...v))].name }; }).sort((a, b) => b.d - a.d)[0];
    const o = m.d.narrative?.heatmap || {};
    return `<div class="callouts">
      <div class="callout"><div class="lab">จุดที่ต้องเร่งด่วนที่สุด</div><div class="big">${esc(hot.r.name)} × ${esc(hot.c.name)}</div><p>${o.hotspot || `คะแนน ${f2(hot.s)} ต่ำกว่ามาตรฐาน ${Math.abs(hot.g).toFixed(2)} จุด เป็นช่องว่างที่ลึกที่สุดในแผนที่ ควรได้รับการพัฒนาแบบเจาะจงก่อน`}</p></div>
      <div class="callout"><div class="lab">${esc(label.replace(/^ราย/, ''))}ที่แข็งแรงที่สุดโดยรวม</div><div class="big">${esc(unitGap[0].r.name)}</div><p>${o.strongest || `ช่องว่างเฉลี่ย ${sgn(unitGap[0].g)} เทียบกับ ${esc(unitGap[unitGap.length - 1].r.name)} ที่ ${sgn(unitGap[unitGap.length - 1].g)} — ใช้เป็นแหล่งเรียนรู้และ mentor ข้ามหน่วย`}</p></div>
      <div class="callout"><div class="lab">ความแตกต่างระหว่างหน่วยมากที่สุด</div><div class="big">${esc(spread.c.name)}</div><p>${o.spread || `คะแนนต่างกัน ${spread.d.toFixed(2)} จุด ระหว่าง${esc(spread.hi)}และ${esc(spread.lo)} บ่งชี้ว่าควรออกแบบการพัฒนาเฉพาะหน่วย มากกว่าหลักสูตรเดียวทั้งองค์กร`}</p></div>
    </div>`;
  }

  function pPerspectives(m) {
    const blind = m.comps.filter(c => c.raters.self - c.score >= 0.5).sort((a, b) => (b.raters.self - b.score) - (a.raters.self - a.score));
    const hidden = m.comps.filter(c => c.score - c.raters.self >= 0.2);
    const rc = m.d.person?.raterCounts || {};
    return page('content perspectives', `
      <div class="kicker">มุมมองจากผู้ประเมิน · 360° perspectives</div>
      <h1 class="display">ท่านมองตนเองต่างจากผู้อื่นอย่างไร</h1>
      <div style="display:grid;grid-template-columns:400px 1fr;gap:34px;margin-top:18px">
        <div>${fig('โปรไฟล์สมรรถนะ', 'ผู้อื่น (ถ่วงน้ำหนัก) · ตนเอง · มาตรฐานตำแหน่ง')}
          ${radar(m, 370)}
          <div style="display:flex;gap:16px;font-size:11px;color:#52514e;justify-content:center">
            <span><svg width="18" height="8"><rect y="2" width="18" height="4" fill="#2a78d6"/></svg> ผู้อื่น</span>
            <span><svg width="18" height="8"><rect y="2" width="18" height="4" fill="#eb6834"/></svg> ตนเอง</span>
            <span><svg width="18" height="8"><rect y="3" width="18" height="2" fill="#1d1d2b"/></svg> มาตรฐาน</span></div>
        </div>
        <div>${fig('การรับรู้ตนเองเทียบกับผู้อื่น', 'ตัวเลขด้านขวา = คะแนนตนเอง − คะแนนผู้อื่น · ส่วนต่าง ≥ 0.5 คือ “จุดบอด” (Atwater & Yammarino, 1992)')}
          ${selfOthers(m, 700)}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px">
            <div class="insight-box" style="border-color:#eb6834;padding:10px 14px"><h4 style="margin-bottom:4px">จุดบอด (Blind spots)</h4><div class="small">${blind.length ? blind.slice(0, 3).map(c => `${esc(c.name)} (${sgn(c.raters.self - c.score)})`).join(' · ') : 'ไม่พบ — การรับรู้ตนเองสอดคล้องกับผู้อื่น'}</div></div>
            <div class="insight-box" style="padding:10px 14px"><h4 style="margin-bottom:4px">จุดแข็งที่ซ่อนอยู่ (Hidden strengths)</h4><div class="small">${hidden.length ? hidden.slice(0, 3).map(c => esc(c.name)).join(' · ') : 'ไม่พบ — ผู้อื่นไม่ได้ให้คะแนนสูงกว่าที่ท่านประเมินตนเอง'}</div></div>
          </div>
          <div class="source" style="margin-top:8px">ผู้ประเมิน: ตนเอง ${rc.self ?? 1} · ผู้บังคับบัญชา ${rc.manager ?? '–'} · เพื่อนร่วมงาน ${rc.peer ?? '–'} · ผู้ใต้บังคับบัญชา ${rc.subordinate ?? '–'} คน</div>
        </div>
      </div>`, { m });
  }

  function pDivider(m, cl) {
    const ent = m.isInd ? 'ท่าน' : m.d.meta.entityName;
    const note = m.d.narrative?.clusters?.[cl.id] ||
      `${cl.whatItMeasures}<br><br>สำหรับ${esc(ent)} สมรรถนะกลุ่มนี้มีคะแนนเฉลี่ย <b>${f2(cl.score)}</b> เทียบกับมาตรฐาน <b>${f2(cl.required)}</b> โดย <b>${cl.nMeet} จาก ${cl.items.length}</b> สมรรถนะถึงมาตรฐาน — จุดแข็งคือ <b>${esc(cl.best.name)}</b> และช่องว่างที่ใหญ่ที่สุดคือ <b>${esc(cl.worst.name)}</b> (${sgn(cl.worst.gap)})`;
    return page('navy divider', `
      ${icon(cl.id, 'lg')}
      <h1 class="display">${esc(cl.name)}</h1>
      <div class="tag">${esc(cl.tagline)}</div>
      <div class="en">${esc(cl.nameEn)} · กลุ่มที่ ${cl.idx + 1} จาก ${m.clusters.length}</div>
      <div class="note">${note}</div>`, { m, deco: svgLayer(1280, 720, curves(1280, 720) + dots(1280, 720, 9, 36, 8, 20, 20, cl.idx + 2)) });
  }

  function pDetail(m, cl) {
    const meet = cl.pctMeet, prev = cl.prev;
    const items = cl.items;
    const hero = m.isInd
      ? { big: `${cl.nMeet}<small>/${items.length}</small>`, frac: cl.nMeet / items.length, claim: `สมรรถนะในกลุ่มนี้ของท่านถึงมาตรฐาน ${cl.nMeet} จาก ${items.length} ด้าน คะแนนเฉลี่ย ${f2(cl.score)} เทียบกับมาตรฐานตำแหน่ง ${f2(cl.required)}` }
      : { big: `${pct(meet)}<small>%</small>`, frac: meet, claim: `พนักงาน ${pct(meet)}% มีสมรรถนะกลุ่มนี้ถึงระดับที่ตำแหน่งกำหนด คะแนนเฉลี่ย ${f2(cl.score)} เทียบกับมาตรฐาน ${f2(cl.required)}${prev != null ? ` (รอบก่อน ${f2(prev)}, ${sgn(cl.score - prev)})` : ''}` };
    const second = m.isInd
      ? `${fig('คะแนนแยกตามกลุ่มผู้ประเมิน', '')}
         <table class="scale" style="font-size:12px"><tr style="color:#52514e"><td style="font:500 11px 'IBM Plex Sans Thai';width:200px">สมรรถนะ</td><td>ตนเอง</td><td>ผู้บังคับบัญชา</td><td>เพื่อนร่วมงาน</td><td>ผู้ใต้บังคับบัญชา</td><td>ค่าเฉลี่ยทีม</td></tr>
         ${items.map(c => `<tr><td style="font:400 12px 'IBM Plex Sans Thai';color:#0b0b0b;width:200px"><b style="color:#2a78d6">${c.id}</b> ${esc(c.name)}</td>${[c.raters.self, c.raters.manager, c.raters.peer, c.raters.subordinate, c.teamAvg].map(v => `<td class="num" style="font:400 12.5px 'IBM Plex Sans';color:#0b0b0b">${f2(v)}</td>`).join('')}</tr>`).join('')}</table>`
      : `${fig('การกระจายระดับความสามารถของพนักงาน', 'สัดส่วนพนักงาน (%) ตามระดับคะแนนที่ปัดเศษ')}${distBars(items, 600)}${distLegend(m.d.scale)}`;
    return page('split detail', `
      <div class="panel">
        ${svgLayer(532, 720, dots(532, 720, 10, 30, 10, 30, 20, cl.idx + 5).replace(/rgba\(42,120,214,([\d.]+)\)/g, (s, a) => `rgba(42,120,214,${(a * 0.6).toFixed(2)})`))}
        <div style="position:absolute;left:300px;top:40px">${fanNav(m, cl.id)}</div>
        <div class="eyebrow">กลุ่มที่ ${cl.idx + 1}</div>
        <h1 class="display">${esc(cl.name)}</h1>
        <div style="color:#b9c6e6;font-size:13px;margin-top:4px">${esc(cl.nameEn)}</div>
        <div class="rule"></div>
        <h5>วัดอะไร?</h5><p>${esc(cl.whatItMeasures)}</p>
        <div class="rule"></div>
        <h5>ทำไมจึงสำคัญ?</h5><p>${esc(cl.whyItMatters)}</p>
      </div>
      <div class="card">
        <div class="whats">ผลลัพธ์สำคัญ</div>
        <div class="hero-row"><div class="hero num">${hero.big}</div>
          <div class="hero-track"><i style="width:${(hero.frac * 100).toFixed(1)}%"></i><b style="left:${(hero.frac * 100).toFixed(1)}%"></b>${m.isInd ? '' : `<em style="left:80%"><span>เป้าหมาย 80%</span></em>`}</div></div>
        <div class="claim">${hero.claim}</div>
        ${fig(`คะแนนเทียบมาตรฐาน: ${cl.name}`, '')}
        ${dumbbell(items, 600, { rowH: 33 })}
        ${dumbbellLegend(!m.isInd, items.some(c => c.prev != null))}
        <div style="margin-top:8px">${second}</div>
        <div class="source" style="position:absolute;bottom:10px;left:22px">ที่มา: ${esc(m.d.meta.cycle)}${m.isInd ? '' : `, n = ${m.d.participation.completed.toLocaleString()}`}</div>
      </div>`, { m });
  }

  function pAction(m, cl) {
    const items = [...cl.items].sort((a, b) => a.gap - b.gap);
    const kp = m.d.keyPlayers || [];
    const ratio = { '70': '70 · เรียนรู้จากงานจริง', '20': '20 · เรียนรู้จากผู้อื่น', '10': '10 · เรียนรู้แบบเป็นทางการ' };
    return page('action', `
      <div class="band">
        ${svgLayer(1280, 172, dots(1280, 172, 12, 7, 700, 14, 22, cl.idx + 1))}
        <div class="eyebrow">กลุ่มที่ ${cl.idx + 1} <span class="bar">|</span> ${esc(cl.name)}</div>
        <h1 class="display">${m.isInd ? 'แผนพัฒนารายบุคคล (IDP)' : 'แผนพัฒนาเพื่อปิดช่องว่าง'}: ${esc(cl.name)}</h1>
        <div class="nav">${fanNav(m, cl.id)}</div>
      </div>
      <h2 class="section">แผนปฏิบัติการ เรียงตามลำดับความสำคัญ (โมเดล 70-20-10)</h2>
      <table class="steps">
        <tr><th>สมรรถนะ</th>${items.map((c, i) => `<th><div class="hd"><span class="badge">${i + 1}</span><div>${esc(c.name)}<div class="status">${statusIcon(c.status)} ${STATUS[c.status].th} · ${sgn(c.gap)}</div></div></div></th>`).join('')}</tr>
        <tr><td>ผลลัพธ์ที่คาดหวัง</td>${items.map(c => `<td>${esc(c.development?.outcome || '–')}</td>`).join('')}</tr>
        <tr class="alt"><td>การดำเนินการ</td>${items.map(c => `<td>${c.status === 'strength' ? '<b>ต่อยอดจุดแข็ง:</b> ' : ''}${esc(c.development?.action || '–')}</td>`).join('')}</tr>
        <tr><td>รูปแบบการเรียนรู้</td>${items.map(c => `<td>${esc(ratio[c.development?.ratio] || '–')}</td>`).join('')}</tr>
      </table>
      <h2 class="section" style="margin-top:18px">ผู้มีบทบาทสำคัญต่อความสำเร็จ</h2>
      <div class="players">${kp.map(p => `
        <div class="player"><div class="ph"><svg viewBox="0 0 24 24">${ICONS[p.icon] || ICONS.exec}</svg>${esc(p.role)}</div>
          <ul>${p.items.map(([a, b]) => `<li><b>${esc(a)}:</b> ${esc(b)}</li>`).join('')}</ul></div>`).join('')}
      </div>`, { m });
  }

  function pMethod(m) {
    const d = m.d, pr = d.participation;
    return page('content method', `
      <div class="kicker">ระเบียบวิธี · Methodology</div>
      <h1 class="display">วิธีการประเมินและการอ่านรายงาน</h1>
      <div class="cols3">
        <div><h3>มาตรวัดระดับความสามารถ (Proficiency scale)</h3>
          <table class="scale">${d.scale.map(s => `<tr><td>${s.level}</td><td><b>${esc(s.label)}</b> <span style="color:#8a8983">${esc(s.labelEn)}</span><br>${esc(s.desc)}</td></tr>`).join('')}</table>
        </div>
        <div><h3>นิยามและการคำนวณ</h3>
          <div class="formula">คะแนนรายสมรรถนะ (ถ่วงน้ำหนัก 360°)<code>S = 0.50·ผู้บังคับบัญชา + 0.25·เพื่อน + 0.25·ผู้ใต้บังคับบัญชา</code></div>
          <div class="formula">ช่องว่างจากมาตรฐาน<code>Gap = S − ระดับที่ตำแหน่งกำหนด</code></div>
          <div class="formula">สถานะ<code>จุดแข็ง: Gap ≥ ${m.th.watch.toFixed(2)} · เฝ้าระวัง: ${m.th.priority.toFixed(2)} ≤ Gap &lt; ${m.th.watch.toFixed(2)} · เร่งด่วน: Gap &lt; ${m.th.priority.toFixed(2)}</code></div>
          <div class="formula">ช่วงความเชื่อมั่น 95% ของค่าเฉลี่ย<code>x̄ ± 1.96 · SD / √n</code></div>
          <div class="small" style="color:#52514e">คะแนนตนเองแสดงเพื่อการพัฒนาเท่านั้น ไม่นำมาคำนวณ · “ถึงมาตรฐาน” ยอมรับความคลาดเคลื่อนของมาตรวัด 0.25</div>
        </div>
        <div><h3>คุณภาพข้อมูล</h3>
          <div class="stat-list">
            ${m.isInd ? Object.entries({ self: 'ตนเอง', manager: 'ผู้บังคับบัญชา', peer: 'เพื่อนร่วมงาน', subordinate: 'ผู้ใต้บังคับบัญชา' }).map(([k, t]) => `<div><span>ผู้ประเมิน: ${t}</span><b>${d.person?.raterCounts?.[k] ?? '–'} คน</b></div>`).join('')
              + `<div><span>เกณฑ์แสดงผลกลุ่มผู้ประเมิน</span><b>n ≥ ${d.privacy?.minRaters ?? 3} (ยกเว้นผู้บังคับบัญชา)</b></div>` : `
            <div><span>ผู้ได้รับเชิญ</span><b>${pr.invited.toLocaleString()}</b></div>
            <div><span>ผู้ตอบครบถ้วน</span><b>${pr.completed.toLocaleString()}</b></div>
            <div><span>อัตราการตอบกลับ</span><b>${pct(pr.completed / pr.invited)}%</b></div>
            <div><span>ความเที่ยง (Cronbach’s α)</span><b>${pr.reliability != null ? pr.reliability.toFixed(2) : 'n/a'}</b></div>
            <div><span>เกณฑ์ปกปิดข้อมูลหน่วยย่อย</span><b>n &lt; ${d.privacy?.minN ?? 3}</b></div>`}
          </div>
          <h3 style="margin-top:16px">เอกสารอ้างอิง</h3>
          <div class="refs">
            <p>Atwater, L. E., & Yammarino, F. J. (1992). Does self–other agreement on leadership perceptions moderate the validity of leadership and performance predictions? <i>Personnel Psychology, 45</i>(1), 141–164.</p>
            <p>Cronbach, L. J. (1951). Coefficient alpha and the internal structure of tests. <i>Psychometrika, 16</i>(3), 297–334.</p>
            <p>Lombardo, M. M., & Eichinger, R. W. (1996). <i>The career architect development planner.</i> Lominger.</p>
            <p>McClelland, D. C. (1973). Testing for competence rather than for “intelligence.” <i>American Psychologist, 28</i>(1), 1–14.</p>
            <p>Spencer, L. M., & Spencer, S. M. (1993). <i>Competence at work.</i> Wiley.</p>
          </div>
        </div>
      </div>`, { m });
  }

  function pClosing(m) {
    const steps = m.d.nextSteps || (m.isInd ? [
      ['ภายใน 30 วัน', 'คุยผลกับผู้บังคับบัญชา', 'เลือก 1–2 สมรรถนะลำดับแรกและบันทึก IDP ในระบบ'],
      ['ไตรมาส 1', 'ลงมือพัฒนา', 'รับงาน stretch และเข้าร่วมกิจกรรมตามแผน 70-20-10'],
      ['ไตรมาส 2', 'ทบทวนกลางปี', 'ขอ feedback รอบสั้นจากผู้ประเมินเดิม'],
      ['ไตรมาส 4', 'ประเมินรอบถัดไป', 'วัดความก้าวหน้าเทียบกับรายงานฉบับนี้'],
    ] : [
      ['ภายใน 30 วัน', 'สื่อสารผลและจัดทำ IDP', 'ผู้บังคับบัญชาคุยผลรายบุคคลและบันทึก IDP ครบ 100%'],
      ['ไตรมาส 1', 'เริ่มโปรแกรมพัฒนา', `เปิดโปรแกรมสำหรับ ${m.byGap.slice(0, 2).map(c => c.name).join(' และ ')}`],
      ['ไตรมาส 2', 'ติดตามกลางปี', 'Pulse survey และทบทวนความคืบหน้าในที่ประชุมผู้บริหาร'],
      ['ไตรมาส 4', 'ประเมินรอบถัดไป', 'วัดผลการเปลี่ยนแปลงเทียบกับรอบนี้ (baseline)'],
    ]);
    return page('navy closing', `
      <h1 class="display">ก้าวต่อไป</h1>
      <p class="lede">ข้อมูลมีคุณค่าเมื่อนำไปสู่การลงมือ รายงานฉบับนี้คือ baseline สำหรับติดตามความก้าวหน้าของ${m.isInd ? 'ท่าน' : esc(m.d.meta.entityName)}ในรอบการประเมินถัดไป</p>
      <div class="timeline">${steps.map(([w, t, p]) => `<div class="milestone"><div class="when">${esc(w)}</div><b>${esc(t)}</b><p>${esc(p)}</p></div>`).join('')}</div>
      <div style="position:absolute;left:64px;bottom:64px;font-size:13px;color:#b9c6e6">สอบถามข้อมูลเพิ่มเติม: ฝ่ายทรัพยากรบุคคล · ${esc(m.d.meta.organization)}</div>`,
      { m, deco: svgLayer(1280, 720, particles(1280, 720, 380, 380, 690, 220, 17) + dots(1280, 720, 26, 5, 300, 610, 14, 8)) });
  }

  // ------------------------------------------------------------------ assemble
  function renderReport(d, el) {
    FIG = 0; PAGE = 0;
    const m = buildModel(d), N = narrative(m);
    const pages = [pCover(m), pForeword(m, N), pLandscape(m), pGlance(m, N), m.isInd ? pPerspectives(m) : pBreakdown(m)];
    m.clusters.forEach(cl => pages.push(pDivider(m, cl), pDetail(m, cl), pAction(m, cl)));
    pages.push(pMethod(m), pClosing(m));
    (el || document.getElementById('report')).innerHTML = pages.join('');
    document.title = `${m.L.en} – ${d.meta.entityNameEn || d.meta.entityName}`;
    return { pages: PAGE };
  }
  window.renderReport = renderReport;
})();
