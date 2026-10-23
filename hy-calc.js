/* Philosophy From A Stone: the 360 Phonetic Calculator, Armenian edition.
   Plain canvas, no outside library. Armenian letter values are the Armenian numeral system's own.
   Sphere: 36 letter nodes, longitude = row (9 x 40 degrees), latitude band = column (Earth, Water, Fire, Air); O and F stand at the poles.
   Sounds are made in the browser (harmonic ratios of the 432 Hz scale). Speech uses the device's own voice. Nothing leaves the page. */
(function(){
'use strict';
var EL=(document.documentElement.lang==='el');
var T=function(en,el){return EL?el:en;};
var AR='ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔ'.split('');
var VAL=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000,2000,3000,4000,5000,6000,7000,8000,9000];
var EXTRA={'Օ':10000,'Ֆ':20000};
var TR={'Ա':'a','Բ':'b','Գ':'g','Դ':'d','Ե':'ye','Զ':'z','Է':'e','Ը':'uh','Թ':'t','Ժ':'zh','Ի':'i','Լ':'l','Խ':'kh','Ծ':'ts','Կ':'k','Հ':'h','Ձ':'dz','Ղ':'gh','Ճ':'ch','Մ':'m','Յ':'y','Ն':'n','Շ':'sh','Ո':'vo','Չ':'ch','Պ':'p','Ջ':'j','Ռ':'r','Ս':'s','Վ':'v','Տ':'t','Ր':'r','Ց':'ts','Ւ':'v','Փ':'p','Ք':'k','Օ':'o','Ֆ':'f'};
var VALMAP={},IDX={};AR.forEach(function(c,i){VALMAP[c]=VAL[i];IDX[c]=i;});VALMAP['Օ']=10000;VALMAP['Ֆ']=20000;
var RATIO=[1,9/8,5/4,4/3,3/2,5/3,15/8,2,9/4];
function freq(c){if(c==='Օ')return 216*Math.pow(2,2.5);if(c==='Ֆ')return 108;var i=IDX[c],col=Math.floor(i/9),row=i%9;return 216*Math.pow(2,col/2)*RATIO[row];}
function parse(s){
  s=String(s||'').replace(/և/g,'ԵՒ').toUpperCase().replace(/ՈՒ/g,'ՈՒ');
  var out=[];for(var i=0;i<s.length;i++){var c=s[i];if(c===' '){out.push(' ');continue;}if(VALMAP[c]!==undefined)out.push(c);}
  return out;
}
function nodePos(c){ // returns [x,y,z] on unit sphere
  if(c==='Օ')return[0,-1,0];if(c==='Ֆ')return[0,1,0];
  var i=IDX[c],col=Math.floor(i/9),row=i%9,lat=[-54,-18,18,54][col]*Math.PI/180,lon=row*40*Math.PI/180;
  return[Math.cos(lat)*Math.sin(lon),-Math.sin(lat),Math.cos(lat)*Math.cos(lon)];
}
var host=document.getElementById('hycalc');if(!host)return;
var words=window.HY_WORDS||[];
host.innerHTML=
'<div class="hyc">'+
 '<div class="hyl">'+
  '<label class="hylab" for="hyin">'+T('Type or tap Armenian letters','Πληκτρολογήστε ή πατήστε αρμενικά γράμματα')+'</label>'+
  '<input id="hyin" type="text" lang="hy" autocomplete="off" spellcheck="false" value="Աստված">'+
  '<div class="hykb" id="hykb" role="group" aria-label="'+T('Armenian keyboard','Αρμενικό πληκτρολόγιο')+'"></div>'+
  '<div class="hyrow"><button type="button" id="hyplay">'+T('Play the frequencies','Παίξε τις συχνότητες')+'</button><button type="button" id="hysay">'+T('Speak the word','Πες τη λέξη')+'</button><button type="button" id="hystop">'+T('Stop','Στοπ')+'</button></div>'+
  '<div class="hyout" id="hyout"></div>'+
  '<div class="hytot"><span class="hysum" id="hysum">0</span><span class="hyang" id="hyang"></span></div>'+
  '<div class="hyfacts" id="hyfacts"></div>'+
  '<div class="hylab" style="margin-top:18px">'+T('Word list','Λίστα λέξεων')+'</div><div class="hypre" id="hypre"></div>'+
  '<p class="hynote" id="hynote"></p>'+
 '</div>'+
 '<div class="hyr"><canvas id="hycv" aria-label="'+T('Hologram sphere with the 360 degree compass','Ολόγραμμα σφαίρας με πυξίδα 360 μοιρών')+'"></canvas><div class="hycap">'+T('Drag to turn &middot; tap a node to add its letter','Σύρετε για περιστροφή &middot; πατήστε έναν κόμβο για το γράμμα του')+'</div></div>'+
'</div>';
var $=function(id){return document.getElementById(id);};
var inp=$('hyin'),kb=$('hykb'),out=$('hyout'),sum=$('hysum'),ang=$('hyang'),facts=$('hyfacts'),pre=$('hypre'),note=$('hynote');
AR.concat(['Օ','Ֆ']).forEach(function(c){var b=document.createElement('button');b.type='button';b.className='hyk';b.setAttribute('lang','hy');b.innerHTML='<b>'+c+'</b><small>'+VALMAP[c]+'</small>';b.title=T('Armenian ','Αρμενικό ')+c+' = '+VALMAP[c]+' · '+Math.round(freq(c))+' Hz';b.onclick=function(){add(c);};kb.appendChild(b);});
[['␣',' '],['⌫',null],[T('Clear','Καθαρισμός'),'']].forEach(function(p){var b=document.createElement('button');b.type='button';b.className='hyk wide';b.textContent=p[0];b.onclick=function(){if(p[1]===null)inp.value=Array.from(inp.value).slice(0,-1).join('');else if(p[1]==='')inp.value='';else inp.value+=p[1];recalc();};kb.appendChild(b);});
words.forEach(function(w){var b=document.createElement('button');b.type='button';b.className='hyw';b.setAttribute('lang','hy');b.textContent=w[0];b.title=w[1]+' · '+(EL?w[3]:w[2]);b.onclick=function(){inp.value=w[0];recalc();};pre.appendChild(b);});
function sumOf(arr){return arr.reduce(function(s,c){return s+(VALMAP[c]||0);},0);}
function factor(n){var f=[],m=n;for(var p=2;p*p<=m;p++)while(m%p===0){f.push(p);m/=p;}if(m>1)f.push(m);return f;}
var cur=[],lit=-1,total=0,bearing=0;
function recalc(){
  cur=parse(inp.value);total=sumOf(cur);
  var tiles=cur.map(function(c){return c===' '?'<span class="gap"></span>':'<span class="tile lit"><i lang="hy">'+c+'</i><s>'+VALMAP[c]+'</s></span>';}).join('');
  out.innerHTML='<div class="tiles">'+tiles+'</div>';
  sum.textContent=total;
  bearing=total%360;if(total>0&&bearing===0)bearing=360;
  var sector=Math.min(36,Math.floor((bearing%360)/10)+1),L=AR[sector-1];
  ang.innerHTML=total?(T('bearing ','διεύθυνση ')+'<b>'+bearing+'°</b> &middot; '+T('sector ','τομέας ')+sector+' &middot; <b lang="hy">'+L+'</b>'):'';
  var ch=[];
  if(total>1){var f=factor(total);ch.push(f.length===1?total+T(' is prime',' είναι πρώτος'):total+' = '+f.join(' × '));}
  if(total&&total%36===0)ch.push('36 × '+(total/36));
  if(total&&total%9===0)ch.push('9 × '+(total/9));
  if(total>360)ch.push(total+' = 360 × '+Math.floor(total/360)+' + '+(total%360));
  var cs=cur.filter(function(c){return c!==' ';});
  if(cs.length)ch.push(T('highest pitch ','υψηλότερη νότα ')+Math.round(Math.max.apply(null,cs.map(freq)))+' Hz · '+T('lowest ','χαμηλότερη ')+Math.round(Math.min.apply(null,cs.map(freq)))+' Hz');
  var norm=cur.join('');
  words.forEach(function(w){var a=parse(w[0]);if(total&&sumOf(a)===total&&a.join('')!==norm)ch.push('<b lang="hy">≡ '+w[0]+'</b> · '+w[1]+' · '+(EL?w[3]:w[2]));});
  facts.innerHTML=ch.map(function(c){return '<span class="chip'+(c.indexOf('<b')===0?' hit':'')+'">'+c+'</span>';}).join('');
  words2=null;
}
var words2;
function add(c){inp.value+=c;recalc();tone(c,.35);flash(c);}
inp.addEventListener('input',recalc);
/* ---------- sound ---------- */
var ac=null,master=null,timers=[];
function ctx(){if(ac)return ac;var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{ac=new C();master=ac.createGain();master.gain.value=.5;master.connect(ac.destination);}catch(e){ac=null;}if(ac&&ac.state==='suspended')ac.resume();return ac;}
function tone(c,dur,at,vol){var a=ctx();if(!a)return;var f=freq(c),t=(at||0)+a.currentTime,v=vol||.14;
  [[1,'sine',1],[2,'triangle',.22]].forEach(function(p){var o=a.createOscillator(),g=a.createGain();o.type=p[1];o.frequency.value=f*p[0];g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v*p[2],t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);});}
var flashT=0,flashC=null;function flash(c){flashC=c;flashT=performance.now();}
function stopAll(){timers.forEach(clearTimeout);timers=[];lit=-1;try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}pulse=0;}
function play(){
  stopAll();var cs=cur.filter(function(c){return c!==' ';});if(!cs.length||!ctx())return;
  var step=.55;cs.forEach(function(c,i){tone(c,.7,i*step);timers.push(setTimeout(function(){lit=i;pulse=1;},i*step*1000));});
  var end=cs.length*step;var uniq=cs.filter(function(c,i){return cs.indexOf(c)===i;}).slice(0,6);
  uniq.forEach(function(c){tone(c,2.2,end,.07);});
  timers.push(setTimeout(function(){lit=cs.length;pulse=1;},end*1000));
  timers.push(setTimeout(function(){lit=-1;},end*1000+2300));
}
function translit(arr){var s='',p=arr;for(var i=0;i<p.length;i++){var c=p[i];if(c===' '){s+=' ';continue;}if(c==='Ո'&&p[i+1]==='Ւ'){s+='u';i++;continue;}s+=(TR[c]||'');}return s;}
var voices=[];function loadVoices(){try{voices=speechSynthesis.getVoices()||[];}catch(e){voices=[];}}
if(window.speechSynthesis){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}}
function say(){
  stopAll();if(!window.speechSynthesis||!cur.length){note.textContent=T('Speech is not available in this browser.','Η ομιλία δεν είναι διαθέσιμη σε αυτόν τον περιηγητή.');return;}
  loadVoices();var hy=voices.filter(function(v){return /^hy/i.test(v.lang);})[0];
  var u;if(hy){u=new SpeechSynthesisUtterance(cur.join('').toLowerCase());u.voice=hy;u.lang=hy.lang;note.textContent='';}
  else{u=new SpeechSynthesisUtterance(translit(cur));u.lang=EL?'el-GR':'en-US';note.textContent=T('This device has no Armenian voice, so the word is spoken from its Latin spelling.','Αυτή η συσκευή δεν έχει αρμενική φωνή, γι᾽ αυτό η λέξη λέγεται από τη λατινική της γραφή.');}
  u.rate=.8;u.onstart=function(){pulse=1;};try{speechSynthesis.speak(u);}catch(e){}
}
$('hyplay').onclick=play;$('hysay').onclick=say;$('hystop').onclick=stopAll;
/* ---------- the hologram ---------- */
var cv=$('hycv'),g=cv.getContext('2d'),W=0,H=0,ay=.5,ax=.35,drag=null,moved=0,vis=false,pulse=0,still=false,t0=performance.now();
try{still=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
function size(){var d=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth||400;H=cv.clientHeight||400;cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);}
function rot(p){var c=Math.cos(ay),s=Math.sin(ay),x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c,c2=Math.cos(ax),s2=Math.sin(ax),y=p[1]*c2-z*s2,z2=p[1]*s2+z*c2;return[x,y,z2];}
var SC,CX,CY;function pr(p){var q=rot(p),f=3/(3+q[2]);return[CX+q[0]*f*SC,CY+q[1]*f*SC,q[2],f];}
var GOLD='232,195,117',CY_='70,227,240',DIM='150,168,174';
function seg(a,b,col,al,w){var A=pr(a),B=pr(b),z=(A[2]+B[2])/2,k=Math.max(.12,Math.min(1,.62-z*.4))*al;g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.strokeStyle='rgba('+col+','+k+')';g.lineWidth=w||1;g.stroke();}
function poly(pts,col,al,w){for(var i=0;i<pts.length-1;i++)seg(pts[i],pts[i+1],col,al,w);}
function circ(fn,n){var a=[];for(var i=0;i<=n;i++)a.push(fn(i/n*2*Math.PI));return a;}
var PHI=(1+Math.sqrt(5))/2,CUBO=[],ICO=[],EDG=[];
(function(){var s=1/Math.SQRT2,v=[];[-1,1].forEach(function(a){[-1,1].forEach(function(b){v.push([0,a*s,b*s]);v.push([a*s,b*s,0]);v.push([a*s,0,b*s]);});});CUBO=v;
 v.forEach(function(p){var q=p.slice();if(p[0]===0)q[2]=p[2]*PHI;else if(p[2]===0)q[1]=p[1]*PHI;else q[0]=p[0]*PHI;ICO.push(q);});
 var m=9;for(var i=0;i<12;i++)for(var j=i+1;j<12;j++){var d=Math.hypot(CUBO[i][0]-CUBO[j][0],CUBO[i][1]-CUBO[j][1],CUBO[i][2]-CUBO[j][2]);if(Math.abs(d-1)<.01)EDG.push([i,j]);}})();
function jit(s){var P=CUBO.map(function(a,i){var b=ICO[i],x=a[0]+(b[0]-a[0])*s,y=a[1]+(b[1]-a[1])*s,z=a[2]+(b[2]-a[2])*s,l=Math.hypot(x,y,z)||1;return[x/l*.26,y/l*.26,z/l*.26];});return P;}
function draw(){
  var now=performance.now(),tt=(now-t0)/1000;
  g.clearRect(0,0,W,H);
  SC=Math.min(W,H)*.3;CX=W/2;CY=H/2;
  var gr=g.createRadialGradient(CX,CY,0,CX,CY,SC*1.5);gr.addColorStop(0,'rgba(70,227,240,.10)');gr.addColorStop(1,'rgba(70,227,240,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';
  [-60,-30,30,60].forEach(function(d){var l=d*Math.PI/180;poly(circ(function(t){return[Math.cos(l)*Math.sin(t),-Math.sin(l),Math.cos(l)*Math.cos(t)];},64),CY_,.22,.8);});
  for(var m=0;m<12;m++){var lo=m*30*Math.PI/180;poly(circ(function(t){return[Math.cos(t)*Math.sin(lo),-Math.sin(t),Math.cos(t)*Math.cos(lo)];},48),CY_,.16,.7);}
  // compass ring (equator plane, radius 1.2)
  var R=1.2;poly(circ(function(t){return[R*Math.sin(t),0,R*Math.cos(t)];},120),GOLD,.55,1.2);
  for(var k=0;k<36;k++){var a=k*10*Math.PI/180,long=(k%9===0),r2=long?R-.1:R-.05;seg([R*Math.sin(a),0,R*Math.cos(a)],[r2*Math.sin(a),0,r2*Math.cos(a)],GOLD,long?.8:.4,long?1.4:.8);}
  g.font='11px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';
  [0,90,180,270].forEach(function(d){var a=d*Math.PI/180,P=pr([(R+.12)*Math.sin(a),0,(R+.12)*Math.cos(a)]);g.fillStyle='rgba('+GOLD+','+Math.max(.25,Math.min(.9,.75-P[2]*.3))+')';g.fillText(d+'°',P[0],P[1]);});
  // needle
  if(total){var na=bearing*Math.PI/180;seg([0,0,0],[R*Math.sin(na),0,R*Math.cos(na)],GOLD,.9,1.6);var NP=pr([R*Math.sin(na),0,R*Math.cos(na)]);g.beginPath();g.arc(NP[0],NP[1],4,0,7);g.fillStyle='rgba('+GOLD+',.95)';g.fill();}
  // jitterbug core
  pulse*=.985;var s=still?.2:(.5+.5*Math.sin(tt*(1.1+pulse*2.2)))*(.35+.65*Math.min(1,.4+pulse));
  var J=jit(s);EDG.forEach(function(e){seg(J[e[0]],J[e[1]],GOLD,.55+.4*pulse,1.1);});J.forEach(function(p){var P=pr(p);g.beginPath();g.arc(P[0],P[1],1.6+pulse*1.6,0,7);g.fillStyle='rgba('+GOLD+',.9)';g.fill();});
  // nodes
  var cs=cur.filter(function(c){return c!==' ';}),usedIdx={};cs.forEach(function(c,i){if(usedIdx[c]===undefined)usedIdx[c]=i;});
  var all=AR.concat(['Օ','Ֆ']);
  g.font='13px "Noto Sans Armenian",Sylfaen,serif';
  all.forEach(function(c){var p=nodePos(c),P=pr(p),on=usedIdx[c]!==undefined,hot=(on&&lit>=0&&lit<cs.length&&cs[lit]===c)||(flashC===c&&now-flashT<500);
    var al=Math.max(.2,Math.min(1,.7-P[2]*.35));
    g.beginPath();g.arc(P[0],P[1],hot?6:on?4:2,0,7);g.fillStyle='rgba('+(on?GOLD:CY_)+','+(on?Math.min(1,al+.3):al*.7)+')';g.fill();
    if(hot){g.beginPath();g.arc(P[0],P[1],14,0,7);g.strokeStyle='rgba('+GOLD+',.6)';g.lineWidth=1.2;g.stroke();}
    g.fillStyle='rgba('+(on?GOLD:DIM)+','+(on?Math.min(1,al+.2):al*.8)+')';g.fillText(c,P[0]+(P[0]>CX?9:-9),P[1]-8);});
  // word: spokes from centre and path along the surface
  var prev=null;cs.forEach(function(c,i){var p=nodePos(c),on=(lit<0||i<=lit||lit>=cs.length);if(!on){prev=p;return;}
    seg([0,0,0],p,GOLD,.55,1.1);
    if(prev){var a=prev,b=p,d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2],om=Math.acos(Math.max(-1,Math.min(1,d))),pts=[];for(var j=0;j<=16;j++){var u=j/16;if(om<1e-4){pts.push(a);continue;}var A=Math.sin((1-u)*om)/Math.sin(om),B=Math.sin(u*om)/Math.sin(om);pts.push([A*a[0]+B*b[0],A*a[1]+B*b[1],A*a[2]+B*b[2]]);}poly(pts,GOLD,.95,1.8);}
    prev=p;});
  g.globalCompositeOperation='source-over';
}
function tick(){if(!vis)return;if(!drag&&!still)ay+=.003;draw();requestAnimationFrame(tick);}
new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!vis){vis=true;size();tick();}else if(!e.isIntersecting)vis=false;});},{threshold:.05}).observe(cv);
window.addEventListener('resize',function(){if(vis){size();draw();}});
cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};moved=0;try{cv.setPointerCapture(e.pointerId);}catch(x){}});
cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);ay+=dx*.01;ax=Math.max(-1.3,Math.min(1.3,ax+dy*.008));drag={x:e.clientX,y:e.clientY};if(still)draw();});
cv.addEventListener('pointerup',function(e){var was=drag;drag=null;if(!was||moved>6)return;
  var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,best=null,bd=18;
  AR.concat(['Օ','Ֆ']).forEach(function(c){var P=pr(nodePos(c)),d=Math.hypot(P[0]-mx,P[1]-my);if(P[2]<.6&&d<bd){bd=d;best=c;}});
  if(best)add(best);});
cv.addEventListener('pointercancel',function(){drag=null;});
recalc();size();draw();
})();
