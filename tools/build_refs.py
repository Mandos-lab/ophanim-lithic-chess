"""Step 2, first two anchors. Recomputes every number from the words, then writes data/references.json.
   Greek: house letter values (alpha 1 ... omega 800, sampi 900); accents, breathings and capitals ignored; final sigma = 200.
   Hebrew: standard values, plain (finals count as the plain letter)."""
import json,unicodedata,sys
GR={'α':1,'β':2,'γ':3,'δ':4,'ε':5,'ϛ':6,'ζ':7,'η':8,'θ':9,'ι':10,'κ':20,'λ':30,'μ':40,'ν':50,'ξ':60,'ο':70,'π':80,'ϙ':90,'ρ':100,'σ':200,'ς':200,'τ':300,'υ':400,'φ':500,'χ':600,'ψ':700,'ω':800,'ϡ':900}
HE={'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ך':20,'ל':30,'מ':40,'ם':40,'נ':50,'ן':50,'ס':60,'ע':70,'פ':80,'ף':80,'צ':90,'ץ':90,'ק':100,'ר':200,'ש':300,'ת':400}
def gr(w):
    s=''.join(c for c in unicodedata.normalize('NFD',w.lower()) if not unicodedata.combining(c));return sum(GR[c] for c in s if c in GR)
def he(w): return sum(HE[c] for c in w if c in HE)
def factors(n):
    f=[];p=2
    while p*p<=n:
        while n%p==0:f.append(p);n//=p
        p+=1
    if n>1:f.append(n)
    return f
def tri(n): return n*(n+1)//2
def istri(n):
    k=int(((8*n+1)**.5-1)/2);return k if tri(k)==n else None
def bearing(n):
    b=n%360;return dict(bearing=b,sectors={str(N):int(b*N/360)+1 for N in (22,24,27,36)})
def tri_split(n,k):
    # triangle of T(n) points (side n-1): count the three corner triangles of k rows and what is left, by barycentric counting
    m=n-1;corner=sum(1 for a in range(m+1) for b in range(m+1-a) if max(a,b,m-a-b)>=m-(k-1));rest=sum(1 for a in range(m+1) for b in range(m+1-a) if max(a,b,m-a-b)<=m-k)
    return corner,rest
R=[]
# 1. Genesis 1:1, Hebrew
w=['בראשית','ברא','אלהים','את','השמים','ואת','הארץ'];vals=[he(x) for x in w];s=sum(vals)
assert s==2701 and factors(s)==[37,73] and istri(s)==73
R.append(dict(id='gen-1-1-he',ref='Genesis 1:1',lang='he',edition='Hebrew (Masoretic) text, words as in any standard edition, without vowel marks',words=[dict(w=a,v=b) for a,b in zip(w,vals)],total=s,factors=factors(s),triangular=istri(s),
 notes=['2701 = 37 x 73, and also the 73rd triangular number (1 + 2 + ... + 73). The page reads that as a triangle, delta 73 (delta is the Greek triangle).','Hebrew letter values here are the standard ones with final letters counted as plain.','The last two words, ואת הארץ ("and the earth"), add up to 407 + 296 = 703, which is the 37th triangular number (37 x 38 / 2) and also 19 x 37.','Geometry, as recomputed: a triangle of 2701 points (73 rows) splits into three corner triangles of 666 points (36 rows each, 666 = the 36th triangular number) around a central triangle of 703 points (the 37th). 3 x 666 + 703 = 2701. The centre is an inverted triangle, not a hexagon. 703 is also a hexagonal number (the 19th), but that is a separate fact and not the shape of this remainder.','Reference text: Hebrew (Masoretic); KJV: "In the beginning God created the heaven and the earth."'],
 triangle_split=dict(rows=73,corners=3,corner_rows=36,corner_points=666,centre_points=703,checked_by_counting=True),
 spatial=bearing(2701),
 status='computed here, all numbers recomputed by this script'))
c,r=tri_split(73,36);assert (c,r)==(1998,703)
# 2. Genesis 1:1, Greek (Swete)
w=['Ἐν','ἀρχῇ','ἐποίησεν','ὁ','θεὸς','τὸν','οὐρανὸν','καὶ','τὴν','γῆν'];vals=[gr(x) for x in w];s=sum(vals)
R.append(dict(id='gen-1-1-lxx',ref='Genesis 1:1',lang='grc',edition='Septuagint, Swete (1909), as in LXX-Swete-1930',words=[dict(w=a,v=b) for a,b in zip(w,vals)],total=s,factors=factors(s),
 notes=['This is the Greek of the Septuagint, a different text from the Hebrew above. Its total has no relation to 2701; the two should not be compared as one verse.'],status='computed here'))
# 4 placeholder order: Revelation 11:1 is added after John 21:11
a,b=gr('τὸ δίκτυον'),gr('ἰχθύες');assert a==b==1224
c=gr('ἰχθύων')
R.append(dict(id='john-21-11',ref='John 21:11',lang='grc',edition='Greek New Testament (Nestle 1904 text as printed on Bible Hub)',
 words=[dict(w='τὸ δίκτυον',v=a,in_verse=True),dict(w='ἰχθύες',v=b,in_verse=False,note='nominative plural, "fish" as a dictionary form'),dict(w='ἰχθύων',v=c,in_verse=True,note='the form the verse actually has: "full of large fish"')],
 total=None,
 fish_count=153,fish_count_check=dict(value=153,triangular=istri(153),sum_of='1 + 2 + ... + 17'),
 notes=['The verse says the net was full of 153 large fish. The pairing of the net with fish at 1224 is exact, but it uses the form ἰχθύες, which is not in the verse. The verse has ἰχθύων, which is 1869.','153 is the 17th triangular number. The Greek has 17 consonants, which is a coincidence of number, not a link of meaning.'],status='computed here; verse wording read from Bible Hub, to be confirmed against a printed edition'))
# Revelation 11:1
w=['κάλαμος','ὅμοιος','ῥάβδῳ'];vals=[gr(x) for x in w];s2=sum(vals)
assert vals==[362,460,907] and s2==1729
def gr_sub(x):
    t=0
    for ch in unicodedata.normalize('NFD',x.lower()):
        if ch=='\u0345':t+=10
        elif not unicodedata.combining(ch):t+=GR.get(ch,0)
    return t
assert gr_sub('ῥάβδῳ')==917 and gr('Κάδμος')==335 and gr('κάλαμος')-gr('Κάδμος')==27==3**3 and gr('σῶμα τοῦ Ἰησοῦ')==2499
assert 1729==1**3+12**3==9**3+10**3
R.append(dict(id='rev-11-1',ref='Revelation 11:1',lang='grc',edition='Greek New Testament, Nestle 1904 as printed on Bible Hub: Καὶ ἐδόθη μοι κάλαμος ὅμοιος ῥάβδῳ, λέγων · Ἔγειρε καὶ μέτρησον τὸν ναὸν …',
 words=[dict(w=a,v=b) for a,b in zip(w,vals)],total=s2,factors=factors(s2),
 sum_of_cubes=['1^3 + 12^3','9^3 + 10^3'],
 cadmus=dict(kadmos=gr('Κάδμος'),kalamos=gr('κάλαμος'),difference=27,reading='delta (4) is replaced by lambda + alpha (31), a net +27 = 3^3'),
 spatial=bearing(1729),
 excluded=[dict(claim='σῶμα τοῦ Ἰησοῦ = 1729',actual=gr('σῶμα τοῦ Ἰησοῦ'),status='does not hold, kept as an exclusion')],
 notes=['The three words are consecutive: "a reed like a rod". 1729 is the smallest number that is the sum of two positive cubes in two different ways (Ramanujan and Hardy), 1 + 1728 and 729 + 1000.',f'The iota subscript in ῥάβδῳ is not counted here (the house calculator ignores it), which gives 907 and a total of 1729. Counting it as an iota (10) gives 917 and a total of 1739. The word-by-word line in the submitted draft listed a +10 but added to 907; as written, the addends make 917. The total holds only without the iota subscript.','The King James text reads "and the angel stood, saying". Those words (καὶ ὁ ἄγγελος εἰστήκει) are in the Scrivener 1894 Textus Receptus line, but not in the Nestle 1904 line used here, so the English and the Greek are different texts at that point.'],
 status='computed here; Greek wording read from Bible Hub (Nestle 1904), to be confirmed against a printed edition'))
json.dump(dict(note='Step 2 references. Every sum is recomputed by tools/build_refs.py.',items=R),open(sys.argv[1] if len(sys.argv)>1 else 'data/references.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
for r in R:print(r['id'],r.get('total'),r.get('factors'))
