# Mood & Tone palette remap (black stage, lemon yellow, electric blue, cyan, purple). Idempotent.
import sys
P=[('#F2C200','#FFEB00'),('rgba(242,194,0','rgba(255,235,0'),('#FFD94D','#FFF35C'),('#F5C400','#FFEB00'),
('#0E1640','#0B0B14'),('rgba(14,22,64','rgba(11,11,20'),('#0A1038','#0B0B14'),('#090E2E','#06060C'),('#060A2B','#06060C'),
('#03061F','#000000'),('#04061C','#000000'),('#04061c','#000000'),('rgba(4,7,36','rgba(0,0,0'),('rgba(6,10,43','rgba(0,0,0'),('rgba(4,6,28','rgba(0,0,0'),
('#1E33B8','#2147FF'),('#1D39D0','#2147FF'),('#18268F','#1A36E0'),('#13207A','#1A36E0'),
('#2EA8E6','#17D6FF'),('rgba(46,168,230','rgba(23,214,255'),('#27D3FF','#17D6FF'),
('#7B4BD8','#8A2BFF'),('rgba(123,75,216','rgba(138,43,255'),('#9B5CFF','#9B3DFF')]
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read();o=s
    for a,b in P: s=s.replace(a,b)
    if s!=o: open(f,'w',encoding='utf-8').write(s)
    print(f,'changed' if s!=o else 'same')
