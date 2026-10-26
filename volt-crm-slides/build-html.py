# Bundle all slide HTML files into one self-contained page. Each slide's CSS is scoped under its own
# class (.s01 ... .s05) and the markup is inlined (no iframes), so the page stays small enough for public sharing.
import pathlib, re
d = pathlib.Path(__file__).parent
titles = {
  '01': 'Pain Point → Solution',
  '02': 'System Flow (ตามไวท์บอร์ด ซ้าย → ขวา)',
  '03': 'ยืนยันการซื้อ 4 ทาง',
  '04': 'Mockup หน้าจอ',
  '05': 'System Architecture',
}

def scope(css, cls):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'@import url\([^)]*\)[^;]*;', '', css)
    out = []
    for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', css):
        sels = []
        for s in sel.split(','):
            s = s.strip()
            if s in (':root', 'html', 'body'):
                sels.append(cls)
            elif s == '*':
                sels.append(f'{cls} *')
            else:
                sels.append(f'{cls} {s}')
        out.append(','.join(dict.fromkeys(sels)) + '{' + body.strip() + '}')
    return ''.join(out)

def squeeze(s):
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'\s*([{};:,>])\s*', r'\1', s) if s.lstrip().startswith('.') else re.sub(r'>\s+<', '><', s)
    return s.strip()

styles = [squeeze(scope((d / 'common.css').read_text(encoding='utf-8'), '.sl'))]
slides = []
for f in sorted(d.glob('[0-9][0-9]-*.html')):
    src = f.read_text(encoding='utf-8')
    n = f.name[:2]
    styles.append(squeeze(scope(re.search(r'<style>(.*?)</style>', src, re.S).group(1), f'.s{n}')))
    body = re.search(r'<body>(.*)</body>', src, re.S).group(1)
    body = re.sub(r'<!--.*?-->', '', body, flags=re.S)
    slides.append(f'<section class="slide"><h2><span>{n}</span>{titles.get(n, f.stem)}</h2>'
                  f'<div class="frame"><div class="sl s{n}" role="img" aria-label="{titles.get(n, f.stem)}">{squeeze(body)}</div></div></section>')

page = f'''<title>Volt CRM Architecture</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,500;1,600&display=swap">
<style>
  /* Layout: stacked 16:7 slide frames under a quiet header; slides keep their own light deck palette */
  :root {{ --bg: #f1ecea; --fg: #1d1d2b; --heading: #37386c; --accent: #c98419; --muted: #6b6b80; --shadow: rgba(55,56,108,.12); }}
  @media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg: #17172a; --fg: #ecebf5; --heading: #d9d8f2; --accent: #e9a23b; --muted: #a3a2bb; --shadow: rgba(0,0,0,.45); color-scheme: dark; }} }}
  :root[data-theme="dark"] {{ --bg: #17172a; --fg: #ecebf5; --heading: #d9d8f2; --accent: #e9a23b; --muted: #a3a2bb; --shadow: rgba(0,0,0,.45); color-scheme: dark; }}
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
  .frame > .sl {{ position: absolute; top: 0; left: 0; transform-origin: 0 0; }}
</style>
<style>{''.join(styles)}</style>
<header><small>Volt Consumer Campaign 2027 · CRM / Loyalty บน LINE OA</small><h1>System Architecture</h1></header>
{''.join(slides)}
<script>
  function fit() {{ document.querySelectorAll('.frame').forEach(f => {{ f.firstElementChild.style.transform = 'scale(' + f.clientWidth / 1760 + ')'; }}); }}
  addEventListener('resize', fit); fit();
</script>'''
# Published as a claude.ai Artifact (the host adds the doctype/head wrapper); local copy gets a minimal wrapper.
(d / 'volt-crm-architecture.html').write_text('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + page + '</body></html>', encoding='utf-8')
(d / 'volt-crm-architecture.artifact.html').write_text(page, encoding='utf-8')
print('wrote volt-crm-architecture.html', len(page.encode()), 'bytes')
