# Bundle all slide HTML files into one self-contained page (each slide isolated in an iframe, scaled to fit),
# plus a team comment thread for each of the 10 nodes on the system-flow slide.
import html, json, pathlib
d = pathlib.Path(__file__).parent
css = (d / 'common.css').read_text(encoding='utf-8')
titles = {
  '01': 'Pain Point → Solution',
  '02': 'System Flow (ตามไวท์บอร์ด ซ้าย → ขวา)',
  '03': 'ยืนยันการซื้อ 4 ทาง',
  '04': 'Mockup หน้าจอ',
  '05': 'System Architecture',
}
# Flow nodes on 02-system-flow.html: (title, top-right corner x, y in the 1760x790 slide).
NODES = [
  ('ช่องทางซื้อ', 468, 4), ('In · LINE OA', 790, 4), ('Check (AI + คน)', 1112, 4), ('DB', 1434, 4), ('Display', 1756, 4),
  ('Management', 468, 376), ('Gamification', 790, 376), ('รางวัล', 1112, 376), ('Burn Point', 1434, 376), ('Community', 1756, 376),
]
nodes = [{'id': f'n{i:02d}', 'num': i, 'title': t} for i, (t, _, _) in enumerate(NODES, 1)]
icon = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
pins = ''.join(
  f'<a class="pin" href="#c-{n["id"]}" style="left:{(x - 30) / 17.6:.2f}%;top:{(y + 26) / 7.9:.2f}%" aria-label="คอมเมนต์ Node {n["num"]} {html.escape(n["title"])}">{icon}<span>0</span></a>'
  for n, (_, x, y) in zip(nodes, NODES))
panels = ''.join(f'''<article class="cm-node" id="c-{n["id"]}">
  <div class="cm-nh"><i>{n["num"]}</i><b>{html.escape(n["title"])}</b><span class="cm-count">0 คอมเมนต์</span></div>
  <ul class="cm-list"></ul>
  <form class="cm-form"><label class="sr" for="cm-in-{n["id"]}">คอมเมนต์ Node {n["num"]}</label>
    <textarea id="cm-in-{n["id"]}" maxlength="2000" placeholder="พิมพ์คอมเมนต์สำหรับ {html.escape(n["title"])}"></textarea>
    <div class="cm-row"><small class="cm-err" hidden></small><button class="cm-btn" type="submit">ส่งคอมเมนต์</button></div>
  </form>
</article>''' for n in nodes)
comments_section = f'''<section class="comments" id="comments">
  <div class="cm-head"><h3>คอมเมนต์ทีม · แต่ละ Node ของ Flow</h3><span class="cm-status" id="cm-status"></span></div>
  <div class="cm-grid">{panels}</div>
</section>'''

slides = []
for f in sorted(d.glob('[0-9][0-9]-*.html')):
    s = f.read_text(encoding='utf-8').replace('<link rel="stylesheet" href="common.css">', f'<style>{css}</style>')
    n = f.name[:2]
    extra = pins if n == '02' else ''
    slides.append(f'''<section class="slide"><h2><span>{n}</span>{titles.get(n, f.stem)}</h2>
<div class="frame"><iframe title="{titles.get(n, f.stem)}" srcdoc="{html.escape(s, quote=True)}" scrolling="no"></iframe>{extra}</div></section>''')
    if n == '02':
        slides.append(comments_section)

page = f'''<title>Volt CRM Architecture</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,400;0,500;0,600;1,600&display=swap">
<style>
  /* Layout: stacked 16:7 slide frames under a quiet header; slides keep their own light deck palette */
  :root {{ --bg: #f1ecea; --fg: #1d1d2b; --heading: #37386c; --accent: #c98419; --accent-soft: rgba(233,162,59,.25); --muted: #6b6b80; --shadow: rgba(55,56,108,.12);
    --surface: #ffffff; --line: #d9d6e4; --chip: #ecebf3; --danger: #b2382c; --pin-bg: #37386c; --pin-fg: #ffffff; }}
  @media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg: #17172a; --fg: #ecebf5; --heading: #d9d8f2; --accent: #e9a23b; --accent-soft: rgba(233,162,59,.3); --muted: #a3a2bb; --shadow: rgba(0,0,0,.45);
    --surface: #212138; --line: #37375a; --chip: #2c2c48; --danger: #f08a7e; --pin-bg: #37386c; --pin-fg: #ffffff; color-scheme: dark; }} }}
  :root[data-theme="dark"] {{ --bg: #17172a; --fg: #ecebf5; --heading: #d9d8f2; --accent: #e9a23b; --accent-soft: rgba(233,162,59,.3); --muted: #a3a2bb; --shadow: rgba(0,0,0,.45);
    --surface: #212138; --line: #37375a; --chip: #2c2c48; --danger: #f08a7e; --pin-bg: #37386c; --pin-fg: #ffffff; color-scheme: dark; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: var(--bg); color: var(--fg); font-family: 'Prompt', sans-serif; padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
  header, .slide {{ max-width: 1760px; margin: 0 auto; }}
  header {{ margin-bottom: 28px; }}
  header small {{ color: var(--muted); font-size: 15px; }}
  header h1 {{ font: italic 600 clamp(26px, 4vw, 40px)/1.15 'Prompt', sans-serif; color: var(--heading); text-wrap: balance; }}
  .slide {{ margin-bottom: 40px; }}
  .slide h2 {{ font: 600 clamp(18px, 2.4vw, 26px)/1.2 'Prompt', sans-serif; color: var(--heading); margin-bottom: 12px; display: flex; gap: 12px; align-items: baseline; text-wrap: balance; }}
  .slide h2 span {{ font-style: italic; color: var(--accent); }}
  .frame {{ position: relative; width: 100%; max-width: 100%; aspect-ratio: 1760 / 790; overflow: hidden; border-radius: 16px; background: #f1ecea; box-shadow: 0 10px 30px var(--shadow); }}
  .frame iframe {{ position: absolute; top: 0; left: 0; width: 1760px; height: 790px; border: 0; transform-origin: 0 0; }}
  .sr {{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }}
{(d / 'comments.css').read_text(encoding='utf-8')}
</style>
<header><small>Volt Consumer Campaign 2027 · CRM / Loyalty บน LINE OA</small><h1>System Architecture</h1></header>
{''.join(slides)}
<script>
  function fit() {{ document.querySelectorAll('.frame').forEach(f => {{ f.querySelector('iframe').style.transform = 'scale(' + f.clientWidth / 1760 + ')'; }}); }}
  addEventListener('resize', fit); fit();
  const NODES = {json.dumps(nodes, ensure_ascii=False)};
{(d / 'comments.js').read_text(encoding='utf-8')}
</script>'''
# Published as a claude.ai Artifact (the host adds the doctype/head wrapper); local copy gets a minimal wrapper.
(d / 'volt-crm-architecture.html').write_text('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + page + '</body></html>', encoding='utf-8')
(d / 'volt-crm-architecture.artifact.html').write_text(page, encoding='utf-8')
print('wrote volt-crm-architecture.html', len(page))
