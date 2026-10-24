/* Ophanim Engine: interactive globe with offsets, and the jitterbug / growth ladder. Plain canvas, no libraries. */
(function(){
'use strict';
var D=Math.PI/180, PHI=(1+Math.sqrt(5))/2;
function $(i){return document.getElementById(i)}
function fit(cv){var r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);return {w:cv.width,h:cv.height,d:d}}

/* ================= GLOBE ================= */
var LAND=[
[[-17.5,14.7],[-16.5,19.5],[-13,27.5],[-9.5,32],[-6,35.8],[0,35.8],[10,37.2],[11,33],[15,32.3],[20,32],[25,31.8],[32.5,31.2],[34.2,27.8],[36.5,22],[38.5,18],[43.2,12.5],[51,11.8],[51.3,10.5],[48,5],[42,-1],[39.5,-5],[40.5,-11],[40.5,-15],[35,-20],[35.5,-24],[32.5,-26.5],[31,-30],[27,-33.5],[20,-34.8],[18.4,-34],[15,-27],[12,-18],[13.5,-12],[12,-5],[9.5,1],[9.5,4],[6,4.3],[2,6.2],[-4,5.2],[-8,4.5],[-13,8],[-17,12]],
[[-9.5,37],[-9,43],[-1.5,43.5],[-4.5,48.5],[2,51],[8,54],[10,57.5],[11,59],[5,62],[14,68],[25,71],[40,67],[44,68.5],[60,69],[70,73],[80,73.5],[100,77],[113,73.5],[140,72],[160,70],[170,69.5],[180,68],[180,65],[170,60],[163,58],[156,51],[142,59],[135,54.5],[140,48],[132,43],[129,35],[122,40],[122,31],[120,22],[108,21],[106,10],[100,13],[103,1.3],[98,8],[94,17],[88,22],[80,15],[77.5,8],[72.8,19],[66,25],[57,26],[56,27],[48,30],[50.5,25.5],[56.5,24.5],[59.5,22.5],[52,16],[43,12.8],[39,21.5],[35,28],[34.5,31],[35.8,36.5],[30,36.2],[27,37],[26,40.5],[23.5,40],[21,38],[23,36.5],[19.5,40],[16,38],[18.5,40.2],[12.5,41.5],[9,44.3],[3,43],[-1.5,37],[-5.5,36]],
[[-5.7,50],[-3,50.6],[1.4,51.2],[1.7,52.7],[0,53.5],[-2,55.8],[-2,57.5],[-3.5,58.6],[-5,58.5],[-6,57],[-5.5,55],[-3,54.7],[-3.2,53.4],[-4.5,53],[-4.2,51.7],[-5.2,51.7]],
[[-10,51.5],[-6,52],[-6,54.3],[-8,55.2],[-10,54]],
[[-73,78],[-60,82],[-30,83.5],[-18,80],[-20,70],[-43,60],[-52,64],[-58,76]],
[[-168,66],[-162,70],[-140,70],[-125,70],[-95,72],[-82,69],[-85,66],[-95,61],[-93,57],[-82,55],[-79,62],[-70,59],[-65,60],[-56,52],[-60,47],[-66,44],[-70,43],[-76,38],[-81,31],[-80,25.5],[-83,29],[-90,29.5],[-97,26],[-97.5,22],[-93,18.5],[-90,21],[-87,21.5],[-88,16],[-83.5,15],[-83.5,10],[-79.5,9],[-77.5,8],[-80,7.5],[-85.5,10],[-87.5,13],[-92,14.5],[-96,15.8],[-105,20],[-109,25],[-112,29],[-114.7,31.5],[-110,23],[-112,25],[-117,32.5],[-121,35],[-124.2,40],[-124,46.5],[-127,50],[-134,57],[-141,60],[-152,59.5],[-158,57],[-165,54.5],[-158,58.5],[-162,60],[-165,63]],
[[-77.5,8],[-72,12],[-62,10.5],[-51,4],[-50,0],[-44,-2.5],[-35,-5.5],[-37,-12],[-39,-18],[-41,-22.5],[-48,-26],[-53,-34],[-58,-35],[-57,-38],[-62,-39],[-65,-45],[-68,-50],[-69,-53],[-72,-53],[-75,-47],[-73.5,-40],[-71.5,-30],[-70.5,-18],[-76,-14],[-81,-5],[-80,0],[-78.5,2]],
[[113,-22],[114,-26],[115,-34],[118,-35],[124,-33.5],[131,-31.5],[135.5,-35],[138,-35],[140,-38],[146,-39],[150,-37],[153,-31],[153,-25],[146,-19],[142.5,-10.7],[141,-13],[136,-12],[131,-11.5],[128,-15],[122,-17.5]],
[[44,-25],[47,-25],[50,-15],[49,-12],[47,-15],[44,-20]]
];
var KLAT=21.4225,KLON=39.8262;
var GOLDLAT=-90+180/PHI;                       /* 21.2461 */
var L135=-180/135;                              /* -1.3333 */
var PTS={
 kaaba:{n:'Η Κάαμπα',lat:KLAT,lon:KLON},
 gold:{n:'Σημείο πλάτους χρυσής τομής',lat:GOLDLAT,lon:KLON},
 l135:{n:'Σημείο πλάτους 1/135',lat:L135,lon:KLON},
 centre:{n:'Κέντρο πυξίδας (1,5° Ν)',lat:-1.5,lon:KLON},
 eps:{n:'Σημείο απόκλισης (ολισθητής)',lat:L135,lon:KLON},
 mount:{n:'St Michael’s Mount',lat:50.1167,lon:-5.4833},
 hopton:{n:'Hopton-on-Sea',lat:52.5310,lon:1.7280},
 stone:{n:'Στόουνχεντζ',lat:51.1789,lon:-1.8262},
 aveb:{n:'Έιμπουρι',lat:51.4286,lon:-1.8542}
};
var TOUR=[['Mount Ararat',39.70,44.30],['Matenadaran',40.19,44.52],['Byblos / Ugarit',34.86,35.72],['The Kaaba',KLAT,KLON],['Delphi / Epidaurus',38.04,22.79],['Etruria / Capitoline',42.07,12.12],['St Michael’s corridor',51.3,-1.9],['Rök Runestone',58.30,14.80]];

/* distances: sphere (haversine) and WGS84 ellipsoid (Vincenty inverse) */
function hav(a,b){var R=6371.0088,p1=a.lat*D,p2=b.lat*D,dp=p2-p1,dl=(b.lon-a.lon)*D;var h=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2);return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))}
function vinc(a,b){
  var A=6378137,F=1/298.257223563,B=(1-F)*A;
  var U1=Math.atan((1-F)*Math.tan(a.lat*D)),U2=Math.atan((1-F)*Math.tan(b.lat*D)),L=(b.lon-a.lon)*D,lam=L,i=0,sS,cS,sg,cA,c2,C,sl,cl;
  var sU1=Math.sin(U1),cU1=Math.cos(U1),sU2=Math.sin(U2),cU2=Math.cos(U2);
  if(Math.abs(a.lat-b.lat)<1e-12&&Math.abs(L)<1e-12)return 0;
  do{sl=Math.sin(lam);cl=Math.cos(lam);sS=Math.sqrt(Math.pow(cU2*sl,2)+Math.pow(cU1*sU2-sU1*cU2*cl,2));if(sS===0)return 0;cS=sU1*sU2+cU1*cU2*cl;sg=Math.atan2(sS,cS);var sa=cU1*cU2*sl/sS;cA=1-sa*sa;c2=cA?cS-2*sU1*sU2/cA:0;C=F/16*cA*(4+F*(4-3*cA));var lp=lam;lam=L+(1-C)*F*sa*(sg+C*sS*(c2+C*cS*(-1+2*c2*c2)));}while(Math.abs(lam-lp)>1e-12&&++i<200);
  var u2=cA*(A*A-B*B)/(B*B),AA=1+u2/16384*(4096+u2*(-768+u2*(320-175*u2))),BB=u2/1024*(256+u2*(-128+u2*(74-47*u2)));
  var ds=BB*sS*(c2+BB/4*(cS*(-1+2*c2*c2)-BB/6*c2*(-3+4*sS*sS)*(-3+4*c2*c2)));
  return B*AA*(sg-ds)/1000;
}
function fmt(x){return x<10?x.toFixed(2).replace('.',','):x<100?x.toFixed(1).replace('.',','):Math.round(x).toLocaleString('el')}
function cm(x,n){return x.toFixed(n).replace('.',',')}

function initGlobe(){
  var cv=$('gl-cv'); if(!cv)return;
  var ctx=cv.getContext('2d'),W,H,lon0=35,lat0=22,drag=null,auto=true,eps=0.1667;
  var L={land:true,grid:true,eq:true,gold:true,kaaba:true,c135:true,eps:true,stm:false,tour:false};
  function size(){var s=fit(cv);W=s.w;H=s.h}
  size();window.addEventListener('resize',function(){size();draw()});
  function proj(lat,lon){
    var p=lat*D,l=(lon-lon0)*D,x=Math.cos(p)*Math.sin(l),y=Math.sin(p),z=Math.cos(p)*Math.cos(l);
    var pc=lat0*D,y2=y*Math.cos(pc)-z*Math.sin(pc),z2=y*Math.sin(pc)+z*Math.cos(pc);
    var R=Math.min(W,H)*0.45;return {x:W/2+x*R,y:H/2-y2*R,z:z2,R:R};
  }
  function line(pts,col,lw,dash){ /* polyline of [lat,lon], hidden part skipped */
    ctx.beginPath();var pen=false;
    for(var i=0;i<pts.length;i++){var q=proj(pts[i][0],pts[i][1]);if(q.z<0){pen=false;continue}if(!pen){ctx.moveTo(q.x,q.y);pen=true}else ctx.lineTo(q.x,q.y)}
    ctx.strokeStyle=col;ctx.lineWidth=lw*(window.devicePixelRatio||1);ctx.setLineDash(dash?dash.map(function(v){return v*(window.devicePixelRatio||1)}):[]);ctx.stroke();ctx.setLineDash([]);
  }
  function latc(lat){var a=[];for(var lo=-180;lo<=180;lo+=3)a.push([lat,lo]);return a}
  function lonc(lon){var a=[];for(var la=-90;la<=90;la+=3)a.push([la,lon]);return a}
  function dot(lat,lon,col,r,label,dx,dy){var q=proj(lat,lon);if(q.z<0)return;var d=window.devicePixelRatio||1;ctx.beginPath();ctx.arc(q.x,q.y,r*d,0,7);ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10*d;ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=1.2*d;ctx.strokeStyle='#fff';ctx.stroke();if(label){ctx.font=(12*d)+'px Inter,sans-serif';ctx.fillStyle=col;ctx.textAlign=dx<0?'right':'left';ctx.fillText(label,q.x+dx*d,q.y+dy*d)}}
  function gc(a,b,n){var A=v3(a),B=v3(b),om=Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2]))),out=[];for(var i=0;i<=n;i++){var f=i/n,s1=Math.sin((1-f)*om)/Math.sin(om),s2=Math.sin(f*om)/Math.sin(om),v=[s1*A[0]+s2*B[0],s1*A[1]+s2*B[1],s1*A[2]+s2*B[2]];out.push([Math.asin(v[2])/D,Math.atan2(v[1],v[0])/D])}return out}
  function v3(p){var la=p.lat*D,lo=p.lon*D;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]}
  function draw(){
    ctx.clearRect(0,0,W,H);var R=Math.min(W,H)*0.45,d=window.devicePixelRatio||1;
    var g=ctx.createRadialGradient(W/2-R*.3,H/2-R*.3,R*.1,W/2,H/2,R);g.addColorStop(0,'#10303d');g.addColorStop(1,'#050d14');
    ctx.beginPath();ctx.arc(W/2,H/2,R,0,7);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=1.5*d;ctx.strokeStyle='rgba(70,227,240,.5)';ctx.stroke();
    if(L.grid){for(var la=-75;la<=75;la+=15)line(latc(la),'rgba(125,142,150,.22)',1);for(var lo=-180;lo<180;lo+=15)line(lonc(lo),'rgba(125,142,150,.22)',1)}
    if(L.land){LAND.forEach(function(poly){ctx.beginPath();var pen=false,vis=0;poly.forEach(function(p,i){var q=proj(p[1],p[0]);if(q.z>-0.05){vis++;if(!pen){ctx.moveTo(q.x,q.y);pen=true}else ctx.lineTo(q.x,q.y)}});if(vis>2){ctx.closePath();ctx.fillStyle='rgba(118,222,170,.16)';ctx.fill();ctx.lineWidth=1.1*d;ctx.strokeStyle='rgba(118,222,170,.55)';ctx.stroke()}})}
    if(L.eq)line(latc(0),'rgba(214,210,194,.6)',1.4,[6,5]);
    if(L.gold){line(latc(GOLDLAT),'rgba(118,222,170,.95)',1.6)}
    if(L.c135){line(latc(L135),'rgba(70,227,240,.9)',1.5);line(latc(-1.5),'rgba(176,156,236,.9)',1.5)}
    if(L.eps){line(latc(PTS.eps.lat),'rgba(232,195,117,.95)',1.8,[3,3])}
    if(L.stm){line(gc(PTS.mount,PTS.hopton,60),'rgba(232,195,117,.95)',1.8);['mount','hopton','stone','aveb'].forEach(function(k,i){dot(PTS[k].lat,PTS[k].lon,k==='stone'?'#e28664':'#e8c375',3.5,i<2?PTS[k].n:'',i==1?6:-6,i==1?4:-4)})}
    if(L.tour){TOUR.forEach(function(t){dot(t[1],t[2],'#b09cec',3.5,'',0,0)})}
    if(L.kaaba)dot(KLAT,KLON,'#e8c375',5,'Κάαμπα',8,-6);
    if(L.eps||L.c135)dot(-1.5,KLON,'#b09cec',4,'',0,0);
    ctx.fillStyle='rgba(214,210,194,.55)';ctx.font=(11*d)+'px monospace';ctx.textAlign='left';ctx.fillText('Πρόχειρα περιγράμματα. Σύρε για να γυρίσει.',12*d,H-12*d);
  }
  function loop(){if(auto&&!drag){lon0+=0.12;if(lon0>180)lon0-=360}draw();requestAnimationFrame(loop)}
  var vis=true;try{new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv)}catch(e){}
  (function tick(){if(vis){if(auto&&!drag){lon0+=0.12;if(lon0>180)lon0-=360}draw()}requestAnimationFrame(tick)})();
  cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);auto=false;$('gl-auto').checked=false});
  cv.addEventListener('pointermove',function(e){if(!drag)return;lon0-=(e.clientX-drag.x)*0.4;lat0=Math.max(-80,Math.min(80,lat0+(e.clientY-drag.y)*0.3));drag={x:e.clientX,y:e.clientY};draw()});
  cv.addEventListener('pointerup',function(){drag=null});cv.addEventListener('pointercancel',function(){drag=null});
  /* layers */
  ['land','grid','eq','gold','kaaba','c135','eps','stm','tour'].forEach(function(k){var b=$('gl-'+k);if(!b)return;b.checked=L[k];b.addEventListener('change',function(){L[k]=b.checked;draw()})});
  $('gl-auto').checked=true;$('gl-auto').addEventListener('change',function(){auto=this.checked});
  /* offset slider */
  function setEps(v){eps=v;PTS.eps.lat=L135-eps;$('gl-epsr').value=v;
    var km=Math.abs(vinc({lat:L135,lon:KLON},{lat:L135-eps,lon:KLON})),ks=hav({lat:L135,lon:KLON},{lat:L135-eps,lon:KLON});
    $('gl-epsout').innerHTML='Απόκλιση &epsilon; = <b>'+cm(eps,4)+'&deg;</b> νότια του πλάτους 1/135 (1,3333&deg; Ν), άρα ο δακτύλιος βρίσκεται στις <b>'+cm(-(L135-eps),4)+'&deg; Ν</b>. Αυτό είναι <b>'+fmt(ks)+' km</b> σε σφαίρα και <b>'+fmt(km)+' km</b> στο ελλειψοειδές WGS84.';
    dist()}
  $('gl-epsr').addEventListener('input',function(){setEps(parseFloat(this.value))});
  var pre={p1:0.1667,p2:0.2,p3:Math.abs(KLAT-GOLDLAT)};
  $('gl-p1').onclick=function(){setEps(pre.p1)};$('gl-p2').onclick=function(){setEps(pre.p2)};$('gl-p3').onclick=function(){setEps(pre.p3)};
  /* measure */
  var keys=['kaaba','gold','l135','centre','eps','mount','hopton','stone','aveb'];
  [$('gl-a'),$('gl-b')].forEach(function(s,j){s.innerHTML=keys.map(function(k){return '<option value="'+k+'">'+PTS[k].n+'</option>'}).join('');s.value=j?'gold':'kaaba';s.addEventListener('change',dist)});
  function dist(){var a=PTS[$('gl-a').value],b=PTS[$('gl-b').value],s=hav(a,b),e=vinc(a,b);
    $('gl-dist').innerHTML='<b>'+a.n+'</b> προς <b>'+b.n+'</b>:<br>σφαίρα <b>'+fmt(s)+' km</b> &middot; ελλειψοειδές WGS84 <b>'+fmt(e)+' km</b> &middot; διαφορά '+fmt(Math.abs(s-e))+' km'}
  setEps(0.1667);
}

/* ================= JITTERBUG + LADDER ================= */
function norm(a){var m=0;a.forEach(function(p){m=Math.max(m,Math.hypot(p[0],p[1],p[2]))});return a.map(function(p){return [p[0]/m,p[1]/m,p[2]/m]})}
function cube(){var a=[];for(var x=-1;x<=1;x+=2)for(var y=-1;y<=1;y+=2)for(var z=-1;z<=1;z+=2)a.push([x,y,z]);return a}
var T4=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
var O6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
var I12=(function(){var a=[];[-1,1].forEach(function(s){[-1,1].forEach(function(t){a.push([0,s,t*PHI],[s,t*PHI,0],[t*PHI,0,s])})});return a})();
var CO12=(function(){var a=[];[-1,1].forEach(function(s){[-1,1].forEach(function(t){a.push([0,s,t],[s,t,0],[t,0,s])})});return a})();
var VE13=CO12.concat([[0,0,0]]);
var CAGE26=(function(){var a=[];for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++)if(x||y||z)a.push([x,y,z]);return a})();
var CORE27=CAGE26.concat([[0,0,0]]);
var RAD34=CAGE26.concat(cube().map(function(c){return [c[0]*1.7,c[1]*1.7,c[2]*1.7]}));
function edgesAt(P,len,tol){var e=[];for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){var d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1],P[i][2]-P[j][2]);if(Math.abs(d-len)<(tol||0.02))e.push([i,j])}return e}
var STAGES=[
 {k:'t',n:4,name:'Τετράεδρο',note:'Το απλούστερο στερεό: τέσσερα τρίγωνα.',P:T4,E:edgesAt(T4,2*Math.SQRT2)},
 {k:'o',n:6,name:'Οκτάεδρο',note:'Οκτώ τρίγωνα· το σχήμα με το οποίο ένα κρύσταλλο αλατιού περιβάλλει κάθε ιόν.',P:O6,E:edgesAt(O6,Math.SQRT2)},
 {k:'c',n:8,name:'Κύβος',note:'Οι κορυφές του κλουβιού.',P:cube(),E:edgesAt(cube(),2)},
 {k:'i',n:12,name:'Εικοσάεδρο',note:'Είκοσι τρίγωνα.',P:I12,E:edgesAt(I12,2)},
 {k:'v',n:13,name:'Ισορροπία διανυσμάτων',note:'Τα 12 σημεία του κυβοκταέδρου γύρω από ένα κέντρο. Το σχήμα εκκίνησης του Φούλερ για το jitterbug.',P:VE13,E:edgesAt(VE13,Math.SQRT2).concat(edgesAt(VE13,0,0)).filter(function(){return true})},
 {k:'g',n:26,name:'Το κλουβί',note:'Η εξωτερική επιφάνεια ενός μπλοκ 3 × 3 × 3.',P:CAGE26,E:edgesAt(CAGE26,1)},
 {k:'h',n:27,name:'Το μπλοκ',note:'Το κλουβί μαζί με το κέντρο του.',P:CORE27,E:edgesAt(CORE27,1)},
 {k:'r',n:34,name:'Ο ακτινοβολητής',note:'Το κλουβί των 26 σημείων συν 8 ακτίνες γωνιών που εκτείνονται προς τα έξω.',P:RAD34,E:edgesAt(CAGE26,1).concat((function(){var e=[];for(var i=0;i<8;i++){var c=RAD34[26+i],best=-1,bd=9;for(var j=0;j<26;j++){var d=Math.hypot(c[0]/1.7-CAGE26[j][0],c[1]/1.7-CAGE26[j][1],c[2]/1.7-CAGE26[j][2]);if(d<bd){bd=d;best=j}}e.push([best,26+i])}return e})())}
];
/* VE13 edges: centre to each of the 12 outer points */
STAGES[4].E=edgesAt(CO12,Math.SQRT2).concat(CO12.map(function(_,i){return [i,12]}));
/* 36: the vector equilibrium with all its vectors (24 outer edges + 12 spokes) */
STAGES.push({k:'e',n:36,name:'Τα 36 διανύσματα',note:'Η ισορροπία διανυσμάτων των 13 σημείων με κάθε διάνυσμα σχεδιασμένο: 24 εξωτερικές ακμές (γαλάζιες) και 12 ακτίνες από το κέντρο (βιολετί). 24 + 12 = 36.',cnt:'13 σημεία, 36 διανύσματα',P:VE13,E:STAGES[4].E});
/* 37: the shell left when a 3x3x3 block sits in a 4x4x4 grid (64 - 27) */
(function(){var a=[];for(var x=0;x<4;x++)for(var y=0;y<4;y++)for(var z=0;z<4;z++)if(!(x<3&&y<3&&z<3))a.push([x-1.5,y-1.5,z-1.5]);
 STAGES.push({k:'s',n:37,name:'Το κέλυφος των 37',note:'Τα 37 κελιά ενός πλέγματος 4 × 4 × 4 που βρίσκονται έξω από ένα μπλοκ 3 × 3 × 3 σε μια γωνία: 64 - 27 = 37.',P:a,E:edgesAt(a,1)})})();
STAGES.forEach(function(s){s.P=norm(s.P)});
/* true jitterbug: cuboctahedron -> icosahedron -> octahedron, one slider */
function jverts(u){
  var A,B,V=[];
  if(u<=1){A=1;B=1+(PHI-1)*u}else{A=Math.max(0,2-u)/PHI;B=1}
  [-1,1].forEach(function(s){[-1,1].forEach(function(t){V.push([0,s*A,t*B],[s*B,0,t*A],[s*A,t*B,0])})});
  var m=0;V.forEach(function(p){m=Math.max(m,Math.hypot(p[0],p[1],p[2]))});return V.map(function(p){return [p[0]/m,p[1]/m,p[2]/m]});
}
/* faces: the 8 triangles, found once on the cuboctahedron (u=0) and kept through the whole motion */
var JTRI=(function(){var V=jverts(0),t=[];for(var i=0;i<12;i++)for(var j=i+1;j<12;j++)for(var k=j+1;k<12;k++){var d1=Math.hypot(V[i][0]-V[j][0],V[i][1]-V[j][1],V[i][2]-V[j][2]),d2=Math.hypot(V[i][0]-V[k][0],V[i][1]-V[k][1],V[i][2]-V[k][2]),d3=Math.hypot(V[j][0]-V[k][0],V[j][1]-V[k][1],V[j][2]-V[k][2]);var e=Math.SQRT2/Math.hypot(1,1,0);if(Math.abs(d1-d2)<1e-6&&Math.abs(d2-d3)<1e-6&&Math.abs(d1-Math.min(d1,1))<2)t.push([i,j,k,d1])}
  var m=Math.min.apply(null,t.map(function(x){return x[3]}));return t.filter(function(x){return Math.abs(x[3]-m)<1e-6}).map(function(x){return [x[0],x[1],x[2]]})})();

function initJit(){
  var cv=$('jt-cv'); if(!cv)return;
  var ctx=cv.getContext('2d'),W,H,yaw=0.6,pit=0.35,drag=null,auto=true,mode='jit',u=0,stage=0,morph=null,cur=null;
  function size(){var s=fit(cv);W=s.w;H=s.h}
  size();window.addEventListener('resize',size);
  function rot(p){var cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pit),sp=Math.sin(pit);var x=p[0]*cy+p[2]*sy,z=-p[0]*sy+p[2]*cy,y=p[1]*cp-z*sp;z=p[1]*sp+z*cp;return [x,y,z]}
  function sc(){return Math.min(W,H)*0.34}
  function P2(p){var r=rot(p),k=1/(1-r[2]*0.18);return [W/2+r[0]*sc()*k,H/2-r[1]*sc()*k,r[2]]}
  function seg(a,b,al,col){var A=P2(a),B=P2(b);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.strokeStyle=col;ctx.globalAlpha=al*(0.55+0.45*((A[2]+B[2])/2+1)/2);ctx.stroke();ctx.globalAlpha=1}
  function pt(p,col,r){var q=P2(p),d=window.devicePixelRatio||1;ctx.beginPath();ctx.arc(q[0],q[1],r*d*(0.8+0.3*(q[2]+1)/2),0,7);ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=9*d;ctx.fill();ctx.shadowBlur=0}
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
  function setStage(i){
    var from=cur||STAGES[stage].P,to=STAGES[i].P,n=to.length,src=[];
    for(var j=0;j<n;j++){var best=0,bd=1e9;for(var k=0;k<from.length;k++){var d=Math.hypot(to[j][0]-from[k][0],to[j][1]-from[k][1],to[j][2]-from[k][2]);if(d<bd){bd=d;best=k}}src.push(from[best])}
    morph={from:src,to:to,t:0,idx:i};stage=i;
    document.querySelectorAll('#jt-ladder button').forEach(function(b,j){b.classList.toggle('on',j===i)});
    $('jt-note').innerHTML='<b>'+STAGES[i].name+' ('+(STAGES[i].cnt||(STAGES[i].n+' σημεία'))+')</b>. '+STAGES[i].note}
  var lad=$('jt-ladder');lad.innerHTML=STAGES.map(function(s,i){return '<button type="button">'+s.n+'</button>'}).join('');
  lad.querySelectorAll('button').forEach(function(b,i){b.onclick=function(){setMode('lad');setStage(i)}});
  STAGES.forEach(function(s,i){lad.children[i].title=s.name});
  function setMode(m){mode=m;$('jt-m1').classList.toggle('on',m==='jit');$('jt-m2').classList.toggle('on',m==='lad');$('jt-jctl').style.display=m==='jit'?'':'none';$('jt-lad-wrap').style.display=m==='lad'?'':'none';if(m==='jit')$('jt-note').textContent=jtxt(u);else setStage(stage)}
  function jtxt(v){return v<0.05?'Κυβοκτάεδρο: 12 σημεία, 8 τρίγωνα και 6 τετράγωνα.':v>0.95&&v<1.05?'Εικοσάεδρο: τα τετράγωνα έχουν στραφεί σε τρίγωνα. 12 σημεία. Τα 8 τρίγωνα που φαίνονται είναι 8 από τις 20 έδρες του.':v>1.95?'Οκτάεδρο: τα 12 σημεία έχουν ενωθεί ανά δύο σε 6.':v<=1?'Τα 8 τρίγωνα στρέφονται και τα τετράγωνα διπλώνουν: το κυβοκτάεδρο γίνεται εικοσάεδρο.':'Το εικοσάεδρο πλησιάζει προς το οκτάεδρο.'}
  $('jt-m1').onclick=function(){setMode('jit')};$('jt-m2').onclick=function(){setMode('lad')};
  var sl=$('jt-u');sl.addEventListener('input',function(){u=parseFloat(sl.value);auto=false;$('jt-play').textContent='Αναπαραγωγή';$('jt-note').textContent=jtxt(u)});
  var playing=false,dir=1;$('jt-play').onclick=function(){playing=!playing;this.textContent=playing?'Παύση':'Αναπαραγωγή'};
  cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)});
  cv.addEventListener('pointermove',function(e){if(!drag)return;yaw+=(e.clientX-drag.x)*0.01;pit=Math.max(-1.4,Math.min(1.4,pit+(e.clientY-drag.y)*0.01));drag={x:e.clientX,y:e.clientY}});
  cv.addEventListener('pointerup',function(){drag=null});cv.addEventListener('pointercancel',function(){drag=null});
  var vis=true;try{new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv)}catch(e){}
  function frame(){
    requestAnimationFrame(frame);if(!vis)return;
    var d=window.devicePixelRatio||1;ctx.clearRect(0,0,W,H);ctx.lineWidth=1.6*d;
    if(!drag)yaw+=0.004;
    if(mode==='jit'){
      if(playing){u+=dir*0.006;if(u>=2){u=2;dir=-1}if(u<=0){u=0;dir=1}sl.value=u;$('jt-note').textContent=jtxt(u)}
      var V=jverts(u);
      ctx.fillStyle='rgba(70,227,240,.07)';JTRI.forEach(function(t){var a=P2(V[t[0]]),b=P2(V[t[1]]),c=P2(V[t[2]]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill()});
      JTRI.forEach(function(t){seg(V[t[0]],V[t[1]],.9,'#46e3f0');seg(V[t[1]],V[t[2]],.9,'#46e3f0');seg(V[t[0]],V[t[2]],.9,'#46e3f0')});
      V.forEach(function(p){pt(p,'#e8c375',3.4)});
      $('jt-cnt').textContent=(u>1.97?'6':'12')+' σημεία';
    }else{
      var S=STAGES[stage],pts;
      if(morph){morph.t=Math.min(1,morph.t+0.025);var e=morph.t<.5?2*morph.t*morph.t:1-Math.pow(-2*morph.t+2,2)/2;pts=morph.to.map(function(p,i){return lerp(morph.from[i],p,e)});cur=pts;if(morph.t>=1)morph=null}else{pts=S.P;cur=pts}
      var a=morph?morph.t:1;
      S.E.forEach(function(e,ix){seg(pts[e[0]],pts[e[1]],a,(S.k==='e'&&ix>=24)?'#b09cec':'#46e3f0')});
      pts.forEach(function(p,i){pt(p,(S.k==='r'&&i>=26)?'#b09cec':'#e8c375',S.n>20?2.6:3.6)});
      $('jt-cnt').textContent=S.cnt||(S.n+' σημεία');
    }
  }
  setMode('jit');$('jt-note').textContent=jtxt(0);frame();
}
function go(){initGlobe();initJit()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
