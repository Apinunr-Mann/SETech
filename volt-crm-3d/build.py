import base64,os
d=os.path.dirname(os.path.abspath(__file__))
s=open(d+'/template.html').read()
for k in 'cyp':
    b=base64.b64encode(open(f'{d}/img/{k}.webp','rb').read()).decode()
    s=s.replace(f'__IMG_{k.upper()}__','data:image/webp;base64,'+b)
open(d+'/volt-grid-3d.html','w').write(s);print(len(s))
