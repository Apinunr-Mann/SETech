// Team comments per flow node, stored in the artifact's shared db (collection "comments").
// Doc shape: { node: "n01".."n10", text, author: <user id>, at: ISO time }.
(function () {
  const statusEl = document.getElementById('cm-status');
  const panels = new Map(NODES.map(n => [n.id, document.getElementById('c-' + n.id)]));
  let docs = [], me = null, user = null, db = null, writable = false, renderSeq = 0;

  const fmt = iso => { try { return new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } };
  const setStatus = (text, warn) => { statusEl.textContent = text; statusEl.classList.toggle('warn', !!warn); };
  const setForms = on => panels.forEach(p => { p.querySelector('.cm-form').hidden = !on; });

  async function render() {
    const seq = ++renderSeq;
    const ids = [...new Set(docs.map(d => d.author).filter(Boolean))];
    const ps = user && ids.length ? await user.profiles(ids) : {};
    if (seq !== renderSeq) return;
    for (const n of NODES) {
      const list = docs.filter(d => d.node === n.id);
      const p = panels.get(n.id), ul = p.querySelector('.cm-list');
      p.querySelector('.cm-count').textContent = list.length + ' คอมเมนต์';
      const pin = document.querySelector('.pin[href="#c-' + n.id + '"]');
      if (pin) { pin.querySelector('span').textContent = list.length; pin.classList.toggle('has', list.length > 0); }
      ul.replaceChildren();
      if (!list.length) { const li = document.createElement('li'); li.className = 'cm-empty'; li.textContent = 'ยังไม่มีคอมเมนต์'; ul.append(li); continue; }
      for (const c of list) {
        const prof = ps[c.author] || {};
        const li = document.createElement('li'); li.className = 'cm-item';
        const img = document.createElement('img'); img.alt = ''; if (prof.avatarUrl) img.src = prof.avatarUrl;
        const body = document.createElement('div'); body.className = 'cm-body';
        const meta = document.createElement('div'); meta.className = 'cm-meta';
        const who = document.createElement('b'); who.textContent = prof.name || (c.author && c.author === me ? 'คุณ' : 'สมาชิกทีม');
        const when = document.createElement('span'); when.textContent = fmt(c.at);
        meta.append(who, when);
        if (writable && me && c.author === me) {
          const del = document.createElement('button'); del.type = 'button'; del.className = 'cm-del'; del.textContent = 'ลบ';
          del.addEventListener('click', () => {
            if (!del.classList.contains('arm')) { del.classList.add('arm'); del.textContent = 'กดอีกครั้งเพื่อลบ'; setTimeout(() => { del.classList.remove('arm'); del.textContent = 'ลบ'; }, 3000); return; }
            del.disabled = true;
            db.doc('comments/' + c.id).delete().catch(() => { del.disabled = false; setStatus('ลบไม่สำเร็จ ลองใหม่อีกครั้ง', true); });
          });
          meta.append(del);
        }
        const text = document.createElement('div'); text.className = 'cm-text'; text.textContent = c.text;
        body.append(meta, text); li.append(img, body); ul.append(li);
      }
    }
  }

  async function submit(nodeId, form) {
    const ta = form.querySelector('textarea'), btn = form.querySelector('.cm-btn'), err = form.querySelector('.cm-err');
    const text = ta.value.trim().slice(0, 2000);
    if (!text) return;
    btn.disabled = true; err.hidden = true;
    try {
      await db.collection('comments').add({ node: nodeId, text, author: me, at: new Date().toISOString() });
      ta.value = '';
    } catch (e) {
      err.hidden = false;
      if (e && e.code === 'invalid_argument') { err.textContent = 'บัญชีนี้มีสิทธิ์ดูอย่างเดียว ให้เจ้าของเพิ่มสิทธิ์เป็น Contributor ขึ้นไปก่อน'; writable = false; }
      else if (e && e.code === 'quota_exceeded') err.textContent = 'พื้นที่เก็บคอมเมนต์เต็มแล้ว แจ้งเจ้าของหน้าให้ลบคอมเมนต์เก่า';
      else err.textContent = 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง';
    } finally { btn.disabled = false; }
  }

  panels.forEach((p, nodeId) => {
    const form = p.querySelector('.cm-form');
    form.addEventListener('submit', e => { e.preventDefault(); submit(nodeId, form); });
    form.querySelector('textarea').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(nodeId, form); } });
  });
  setForms(false);
  render();

  if (!window.claude || !window.claude.use) { setStatus('เปิดผ่านลิงก์ claude.ai เพื่ออ่านและเขียนคอมเมนต์', true); return; }
  setStatus('กำลังโหลดคอมเมนต์…');
  Promise.all([window.claude.use('db'), window.claude.use('user')]).then(async ([d, u]) => {
    db = d; user = u;
    if (!db) { setStatus('ลงชื่อเข้าใช้ claude.ai เพื่ออ่านและเขียนคอมเมนต์', true); return; }
    me = user ? await user.id() : null;
    const can = user ? await user.can('data.write') : null;
    writable = !!me && can !== false;
    setForms(writable);
    setStatus(writable ? 'คอมเมนต์ทุกคนเห็นทันที · Ctrl/⌘ + Enter เพื่อส่ง' : 'สิทธิ์ของคุณอ่านได้อย่างเดียว');
    db.collection('comments').orderBy('at').onSnapshot(snap => {
      docs = snap.docs.map(s => Object.assign({ id: s.id }, s.data()));
      render();
    }, () => setStatus('การเชื่อมต่อคอมเมนต์หลุด รีเฟรชหน้าเพื่อโหลดใหม่', true));
  });
})();
