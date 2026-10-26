# Bundle all slide HTML files into one self-contained page (each slide isolated in an iframe, scaled to fit).
import html, pathlib, re
d = pathlib.Path(__file__).parent
css = (d / 'common.css').read_text(encoding='utf-8')
titles = {
  '01': 'Pain Point → Solution',
  '02': 'System Flow (ตามไวท์บอร์ด ซ้าย → ขวา)',
  '03': 'ยืนยันการซื้อ 4 ทาง',
  '04': 'Mockup หน้าจอ',
  '05': 'System Architecture',
}
slides = []
for f in sorted(d.glob('[0-9][0-9]-*.html')):
    s = f.read_text(encoding='utf-8').replace('<link rel="stylesheet" href="common.css">', f'<style>{css}</style>')
    n = f.name[:2]
    slides.append(f'''<section class="slide"><h2><span>{n}</span>{titles.get(n, f.stem)}</h2>
<div class="frame"><iframe title="{titles.get(n, f.stem)}" srcdoc="{html.escape(s, quote=True)}" scrolling="no"></iframe></div></section>''')
page = f'''<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Volt CRM Architecture</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,400;0,600;1,600&display=swap">
<style>
  :root {{ --navy: #37386c; --cream: #f1ecea; --accent: #e9a23b; --muted: #6b6b80; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: var(--cream); font-family: 'Prompt', sans-serif; color: #1d1d2b; padding: 32px 16px 64px; }}
  header, .slide {{ max-width: 1760px; margin: 0 auto; }}
  header {{ margin-bottom: 28px; }}
  header small {{ color: var(--muted); font-size: 15px; }}
  header h1 {{ font: italic 600 clamp(26px, 4vw, 40px)/1.15 'Prompt'; color: var(--navy); }}
  .slide {{ margin-bottom: 40px; }}
  .slide h2 {{ font: 600 clamp(18px, 2.4vw, 26px)/1.2 'Prompt'; color: var(--navy); margin-bottom: 12px; display: flex; gap: 12px; align-items: baseline; }}
  .slide h2 span {{ font-style: italic; color: var(--accent); }}
  .frame {{ position: relative; width: 100%; aspect-ratio: 1760 / 790; overflow: hidden; border-radius: 16px; background: var(--cream); box-shadow: 0 10px 30px rgba(55,56,108,.12); }}
  .frame iframe {{ position: absolute; top: 0; left: 0; width: 1760px; height: 790px; border: 0; transform-origin: 0 0; }}
  @media print {{ body {{ padding: 0; }} .slide {{ break-inside: avoid; }} .frame {{ box-shadow: none; }} }}
</style></head>
<body>
<header><small>Volt Consumer Campaign 2027 · CRM / Loyalty บน LINE OA</small><h1>System Architecture</h1></header>
{''.join(slides)}
<script>
  function fit() {{ document.querySelectorAll('.frame').forEach(f => {{ f.querySelector('iframe').style.transform = 'scale(' + f.clientWidth / 1760 + ')'; }}); }}
  addEventListener('resize', fit); fit();
</script>
</body></html>'''
(d / 'volt-crm-architecture.html').write_text(page, encoding='utf-8')
print('wrote volt-crm-architecture.html', len(page))
