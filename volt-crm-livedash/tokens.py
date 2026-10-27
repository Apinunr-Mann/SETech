# Apply handoff §3 design tokens + fonts to a text file (idempotent).
import sys, re
PAIRS = [('#FFE11A', '#F2C200'), ('rgba(255,225,26', 'rgba(242,194,0'), ('#0B1247', '#0E1640'), ('#060A2B', '#090E2E'),
         ('#13207A', '#1D39D0'), ('#19C3F0', '#2EA8E6'), ('rgba(25,195,240', 'rgba(46,168,230'),
         ('#8A4DFF', '#7B4BD8'), ('rgba(138,77,255', 'rgba(123,75,216'),
         ("'Kanit'", "'Bai Jamjuree'"), ("'Prompt'", "'IBM Plex Sans Thai'"),
         ('family=Kanit:ital,wght@0,500;0,600;0,700;1,600;1,700;1,800;1,900', 'family=Bai+Jamjuree:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700'),
         ('family=Kanit:ital,wght@0,500;0,600;0,700;1,600;1,700;1,800;1,900&family=Prompt:wght@400;500;600', 'family=Bai+Jamjuree:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700'),
         ('family=Prompt:wght@400;500;600', 'family=IBM+Plex+Sans+Thai:wght@400;500;600;700'),
         ('family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,500;1,600', 'family=IBM+Plex+Sans+Thai:wght@400;500;600;700'),
         ('family=Prompt:wght@400;500;600&display=swap', 'family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap')]
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read(); o = s
    for a, b in PAIRS: s = s.replace(a, b)
    s = s.replace('.vhud svg{', '.vhud>svg{')
    if s != o: open(f, 'w', encoding='utf-8').write(s)
    print(f, 'changed' if s != o else 'same')
