# Assemble the Prototype from src/ into index.html, run the shared sync (Live Dashboard + charge module),
# then write one page per proposal option into dist/:
#   o1  = B2C, design option 1 (app style)     o2 = B2C, design option 2 (bento hero)
#   b2b = Retailer add-on (shop QR, merchant phone, shop admin), design option 1
import pathlib, subprocess, sys
d = pathlib.Path(__file__).parent
src = d / 'src'
r = lambda n: (src / n).read_text(encoding='utf-8')
css = r('base.css') + '\n' + r('proto.css') + '\n/*LD-CSS*/\n/*LD-CSS-END*/\n'
app = "const OPT=window.VOLT_OPT||{d:'o1',b2b:true};\n" + '\n'.join(r(n) for n in ('volt-data.js', 'engine.js', 'cust.js', 'shop.js', 'bo.js', 'app.js'))
html = r('head.html') + '<style>\n' + css + '</style>\n' + r('body.html') + '\n<script>//LD-JS\n//LD-JS-END\n</script>\n<script>\n(function(){\n' + app + '\n})();\n</script>\n'
(d / 'index.html').write_text(html, encoding='utf-8')
subprocess.check_call([sys.executable, str(d.parent / 'volt-crm-livedash' / 'sync.py')])

VARIANTS = {'o1': ("{d:'o1',b2b:false}", 'Volt CRM · Option 1'), 'o2': ("{d:'o2',b2b:false}", 'Volt CRM · Option 2'), 'b2b': ("{d:'o1',b2b:true}", 'Volt B2B Add-on')}
synced = (d / 'index.html').read_text(encoding='utf-8').replace('<title>Volt Club Prototype</title>', '')
(d / 'dist').mkdir(exist_ok=True)
for k, (opt, title) in VARIANTS.items():
    cls = ('o1' if k == 'b2b' else k) + (' b2b' if k == 'b2b' else ' b2c')
    page = ('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{title}</title><script>window.VOLT_OPT={opt}</script></head><body class="{cls}">' + synced + '</body></html>')
    (d / 'dist' / f'volt-prototype-{k}.html').write_text(page, encoding='utf-8')
    print('wrote dist/volt-prototype-%s.html' % k, len(page.encode()), 'bytes')
