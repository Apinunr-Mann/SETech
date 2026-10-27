# Copy the shared Live Dashboard (and dark theme) into the prototype and mockup pages.
# Each target holds marker comments; the text between them is replaced on every run.
import pathlib, re, sys
d = pathlib.Path(__file__).parent
css = (d / 'livedash.css').read_text(encoding='utf-8') + '\n' + (d / 'dark.css').read_text(encoding='utf-8')
js = (d / 'livedash.js').read_text(encoding='utf-8')
targets = [d.parent / 'volt-crm-prototype' / 'index.html', d.parent / 'volt-crm-mockups' / 'index.html']
for t in targets:
    s = t.read_text(encoding='utf-8')
    s, n1 = re.subn(r'/\*LD-CSS\*/.*?/\*LD-CSS-END\*/', lambda m: '/*LD-CSS*/\n' + css + '\n/*LD-CSS-END*/', s, flags=re.S)
    s, n2 = re.subn(r'//LD-JS\n.*?//LD-JS-END', lambda m: '//LD-JS\n' + js + '\n//LD-JS-END', s, flags=re.S)
    if not (n1 and n2):
        sys.exit(f'markers missing in {t}')
    t.write_text(s, encoding='utf-8')
    wrapped = t.with_name({'volt-crm-prototype': 'volt-club-prototype.html', 'volt-crm-mockups': 'volt-club-mockups.html'}[t.parent.name])
    wrapped.write_text('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + s + '</body></html>', encoding='utf-8')
    print('synced', t.relative_to(d.parent), len(s.encode()), 'bytes')
