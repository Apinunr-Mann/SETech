# Assemble the Prototype from src/ into index.html, then run the shared sync (Live Dashboard + charge module).
import pathlib, subprocess, sys
d = pathlib.Path(__file__).parent
src = d / 'src'
r = lambda n: (src / n).read_text(encoding='utf-8')
css = r('base.css') + '\n' + r('proto.css') + '\n/*LD-CSS*/\n/*LD-CSS-END*/\n'
app = '\n'.join(r(n) for n in ('volt-data.js', 'engine.js', 'cust.js', 'shop.js', 'bo.js', 'app.js'))
html = r('head.html') + '<style>\n' + css + '</style>\n' + r('body.html') + '\n<script>//LD-JS\n//LD-JS-END\n</script>\n<script>\n(function(){\n' + app + '\n})();\n</script>\n'
(d / 'index.html').write_text(html, encoding='utf-8')
subprocess.check_call([sys.executable, str(d.parent / 'volt-crm-livedash' / 'sync.py')])
