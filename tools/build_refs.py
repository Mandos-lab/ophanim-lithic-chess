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
R=[]
# 1. Genesis 1:1, Hebrew
w=['בראשית','ברא','אלהים','את','השמים','ואת','הארץ'];vals=[he(x) for x in w];s=sum(vals)
assert s==2701 and factors(s)==[37,73] and istri(s)==73
R.append(dict(id='gen-1-1-he',ref='Genesis 1:1',lang='he',edition='Hebrew (Masoretic) text, words as in any standard edition, without vowel marks',words=[dict(w=a,v=b) for a,b in zip(w,vals)],total=s,factors=factors(s),triangular=istri(s),
 notes=['2701 = 37 x 73, and also the 73rd triangular number (1 + 2 + ... + 73). The page reads that as a triangle, delta 73 (delta is the Greek triangle).','Hebrew letter values here are the standard ones with final letters counted as plain.'],status='computed here, all numbers recomputed by this script'))
# 2. Genesis 1:1, Greek (Swete)
w=['Ἐν','ἀρχῇ','ἐποίησεν','ὁ','θεὸς','τὸν','οὐρανὸν','καὶ','τὴν','γῆν'];vals=[gr(x) for x in w];s=sum(vals)
R.append(dict(id='gen-1-1-lxx',ref='Genesis 1:1',lang='grc',edition='Septuagint, Swete (1909), as in LXX-Swete-1930',words=[dict(w=a,v=b) for a,b in zip(w,vals)],total=s,factors=factors(s),
 notes=['This is the Greek of the Septuagint, a different text from the Hebrew above. Its total has no relation to 2701; the two should not be compared as one verse.'],status='computed here'))
# 3. John 21:11
a,b=gr('τὸ δίκτυον'),gr('ἰχθύες');assert a==b==1224
c=gr('ἰχθύων')
R.append(dict(id='john-21-11',ref='John 21:11',lang='grc',edition='Greek New Testament (Nestle 1904 text as printed on Bible Hub)',
 words=[dict(w='τὸ δίκτυον',v=a,in_verse=True),dict(w='ἰχθύες',v=b,in_verse=False,note='nominative plural, "fish" as a dictionary form'),dict(w='ἰχθύων',v=c,in_verse=True,note='the form the verse actually has: "full of large fish"')],
 total=None,
 fish_count=153,fish_count_check=dict(value=153,triangular=istri(153),sum_of='1 + 2 + ... + 17'),
 notes=['The verse says the net was full of 153 large fish. The pairing of the net with fish at 1224 is exact, but it uses the form ἰχθύες, which is not in the verse. The verse has ἰχθύων, which is 1869.','153 is the 17th triangular number. The Greek has 17 consonants, which is a coincidence of number, not a link of meaning.'],status='computed here; verse wording read from Bible Hub, to be confirmed against a printed edition'))
json.dump(dict(note='Step 2 references. Every sum is recomputed by tools/build_refs.py.',items=R),open(sys.argv[1] if len(sys.argv)>1 else 'data/references.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
for r in R:print(r['id'],r.get('total'),r.get('factors'))
