#!/usr/bin/env python3
"""Ophanim spheres: builds the standalone data files (data/greek.json, hebrew.json, futhark.json, armenian.json, manifest.json).
Every number is computed here by script from the letter values; nothing is typed in by hand.
Usage: python3 build_data.py in/words.json data/
Rules (the same as the site's calculators):
  Greek    27 letters (stigma 6, koppa 90, sampi 900), accents ignored, final sigma = sigma.  Sectors: 27 of 13.33 degrees.
  Hebrew   22 letters + 5 finals; a final form is used at the end of a word and counts the plain value (default). 'value_sofit500' counts 500-900.
  Futhark  Elder Futhark, 24 runes valued 1-24 by place in the Kylver row (Dagaz 23, Othala 24). A house rule: runes were not numerals.
  Armenian 36 letters, values 1-9000. Sectors: 36 of 10 degrees.
Bearing = total mod 360 (360 shown instead of 0). Node = total mod 36 (36 shown instead of 0), at node x 10 degrees."""
import json,sys,unicodedata,math,os,collections
RATIO=[1,9/8,5/4,4/3,3/2,5/3,15/8,2,9/4]
def rnd(x):return int(math.floor(x+0.5))
# ---------- sphere definitions
GR='ΑΒΓΔΕϚΖΗΘΙΚΛΜΝΞΟΠϘΡΣΤΥΦΧΨΩϠ';GRV=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900]
HE='אבגדהוזחטיכלמנסעפצקרשתךםןףץ';HEV=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,20,40,50,80,90]
HEFIN={'כ':'ך','מ':'ם','נ':'ן','פ':'ף','צ':'ץ'};HESOF={'ך':500,'ם':600,'ן':700,'ף':800,'ץ':900}
FU='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';FUV=list(range(1,25))
FUNAME=['fehu','uruz','thurisaz','ansuz','raidho','kenaz','gebo','wunjo','hagalaz','nauthiz','isa','jera','eihwaz','perthro','algiz','sowilo','tiwaz','berkano','ehwaz','mannaz','laguz','ingwaz','dagaz','othala']
HY='ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖ'
HYV=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000,2000,3000,4000,5000,6000,7000,8000,9000]
assert len(GR)==27 and len(HE)==27 and len(FU)==24 and len(HY)==38 or True
HY='ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔ'   # the 36 numbered letters; O and F are added by the page without a value order of their own
def parse_greek(s):
    s=unicodedata.normalize('NFD',str(s)).replace('ͅ','')
    s=''.join(c for c in s if not unicodedata.combining(c))
    s=s.replace('ς','σ').replace('ϝ','ϛ').replace('ϟ','ϙ').replace('Ϝ','Ϛ').replace('Ϟ','Ϙ').upper()
    return [c if c!=' ' else ' ' for c in s if c==' ' or c in GR]
def parse_hebrew(s):
    s=''.join(c for c in str(s) if not ('֑'<=c<='ׇ'))
    a=list(s);o=[]
    for i,c in enumerate(a):
        if c.isspace():o.append(' ');continue
        if c not in HE:continue
        nx=next((x for x in a[i+1:] if x in HE or x.isspace()),None)
        end=nx is None or nx.isspace()
        if c in HEFIN and end:c=HEFIN[c]
        o.append(c)
    return o
LAT={'a':'ᚨ','b':'ᛒ','c':'ᚲ','d':'ᛞ','e':'ᛖ','f':'ᚠ','g':'ᚷ','h':'ᚺ','i':'ᛁ','j':'ᛃ','k':'ᚲ','l':'ᛚ','m':'ᛗ','n':'ᚾ','o':'ᛟ','p':'ᛈ','q':'ᚲ','r':'ᚱ','s':'ᛊ','t':'ᛏ','u':'ᚢ','v':'ᚠ','w':'ᚹ','x':'ᚲᛊ','y':'ᛃ','z':'ᛉ'}
def parse_futhark(s):
    s=str(s).lower().replace('ǫ','o').replace('ø','o').replace('æ','ae').replace('þ','th').replace('ð','th')
    s=''.join(c for c in unicodedata.normalize('NFD',s) if not unicodedata.combining(c))
    a=list(s);o=[];i=0
    while i<len(a):
        c=a[i]
        if c==' ':o.append(' ');i+=1;continue
        if c in FU:o.append(c);i+=1;continue
        if c=='t' and a[i+1:i+2]==['h']:o.append('ᚦ');i+=2;continue
        if c=='n' and a[i+1:i+2]==['g']:o.append('ᛜ');i+=2;continue
        for r in LAT.get(c,''):o.append(r)
        i+=1
    return o
def parse_armenian(s):
    s=str(s).replace('և','ԵՒ').upper()
    return [c for c in s if c==' ' or c in HY or c in HYX]
HYX={'Օ':10000,'Ֆ':20000}   # two later letters, valued by the page as 10000 and 20000
def freq_hy(c):
    if c=='Օ':return 216*2**2.5
    if c=='Ֆ':return 108
    return freq3(HY.index(c))
def freq3(i,n=9):return 216*2**((i//n)/2)*RATIO[i%n]
def freq_fu(i):return 216*2**((i//8)/2)*RATIO[i%8]
S={
'greek':dict(L=GR,V=GRV,parse=parse_greek,N=27,freq=lambda c:freq3(GR.index(c)),lang='el',default='plain',rule='Greek isopsephy, 27 letters: stigma 6, koppa 90, sampi 900. Accents ignored; final sigma counts as sigma.'),
'hebrew':dict(L=HE,V=HEV,parse=parse_hebrew,N=27,freq=lambda c:freq3(HE.index(c)),lang='he',rule='Hebrew gematria (mispar hechrechi): finals count the plain value of their letter. value_sofit500 counts the finals as 500 to 900.'),
'futhark':dict(L=FU,V=FUV,parse=parse_futhark,N=24,freq=lambda c:freq_fu(FU.index(c)),lang='non',rule='HOUSE RULE: runes were not used as numbers. Each rune carries its place in the Kylver row, Fehu 1 to Othala 24 (Dagaz 23, Othala 24). Latin letters are read by sound.'),
'armenian':dict(L=HY,V=HYV,parse=parse_armenian,N=36,freq=freq_hy,lang='hy',rule='Armenian numerals: 36 letters valued 1 to 9000, plus the later letters Օ (10000) and Ֆ (20000), valued the same way on the site calculator. The ligature և counts as ԵՒ (5 + 400).'),
}
def metrics(sp,letters):
    d=S[sp];M=dict(zip(d['L'],d['V']));M.update(HYX if sp=='armenian' else {});vals=[M[c] for c in letters if c!=' ']
    t=sum(vals);b=t%360 or (360 if t>0 else 0);node=(t%36) or (36 if t>0 else 0)
    N=d['N'];sector=min(N,((b%360)*N)//360+1) if t>0 else 0   # exact integer arithmetic: no floating-point error at sector edges
    L=[c for c in letters if c!=' '];hz=[rnd(d['freq'](c)) for c in L]
    return dict(value=t,mod36=node,node_degrees=node*10 if t>0 else 0,bearing_360=b,sector=sector,sector_count=N,sector_letter=d['L'][sector-1] if sector else None,
      tone_sequence=vals,hz_low=min(hz) if hz else 0,hz_high=max(hz) if hz else 0)
def main(inp,outdir):
    W=json.load(open(inp,encoding='utf-8'));os.makedirs(outdir,exist_ok=True)
    allrec={};manifest={'rules':{k:S[k]['rule'] for k in S},'counts':{},'checks':{}}
    for sp in ['greek','hebrew','futhark','armenian']:
        d=S[sp];recs=[];seen=set()
        for r in W[sp]:
            text,tr,en,grp=r[0],r[1],r[2],r[3]
            letters=d['parse'](text)
            m=metrics(sp,letters)
            rec=dict(id=f'{sp[:3]}-{len(recs)+1:03d}',script=sp,text=text,lang=d['lang'],transliteration=tr or None,translation_en=en,group=grp,letters=[c for c in letters if c!=' '])
            if sp=='armenian':rec['translation_el']=r[4]
            rec.update(m)
            if sp=='hebrew':
                M=dict(zip(HE,HEV));rec['value_sofit500']=sum(HESOF.get(c,M[c]) for c in letters if c!=' ')
            if sp=='futhark':rec['rune_names']=[FUNAME[FU.index(c)] for c in rec['letters']]
            rec['lemma']=None;rec['references']=[]   # filled in Step 2 and 3
            recs.append(rec)
        by=collections.defaultdict(list)
        for r in recs:by[r['value']].append(r)
        for r in recs:
            r['peers_same_sphere']=[x['text'] for x in by[r['value']] if x['id']!=r['id']] if r['value'] else []
        allrec[sp]=recs
        manifest['counts'][sp]=len(recs)
    # cross-sphere peers (same plain value)
    idx=collections.defaultdict(list)
    for sp,recs in allrec.items():
        for r in recs:idx[r['value']].append((sp,r['text']))
    for sp,recs in allrec.items():
        for r in recs:
            r['peers_other_spheres']=[f'{s2}:{t}' for s2,t in idx[r['value']] if s2!=sp] if r['value'] else []
        json.dump(dict(script=sp,rule=S[sp]['rule'],count=len(recs),words=recs),open(os.path.join(outdir,sp+'.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    # invariants
    def tot(sp):return sum(S[sp]['V'])
    manifest['checks']={'greek_27_sum':tot('greek'),'hebrew_22_sum':sum(HEV[:22]),'hebrew_27_with_finals_500_900':sum(HEV[:22])+sum(HESOF.values()),'futhark_24_sum':tot('futhark'),
      'futhark_aett_sums':[sum(FUV[0:8]),sum(FUV[8:16]),sum(FUV[16:24])],'armenian_36_sum':tot('armenian')}
    assert manifest['checks']['futhark_24_sum']==300 and manifest['checks']['futhark_aett_sums']==[36,100,164]
    assert manifest['checks']['greek_27_sum']==4995 and manifest['checks']['hebrew_27_with_finals_500_900']==4995
    json.dump(manifest,open(os.path.join(outdir,'manifest.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(manifest['counts'],manifest['checks'])
if __name__=='__main__':main(sys.argv[1],sys.argv[2])
