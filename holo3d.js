/* Philosophy From A Stone: holographic figures, drawn in plain canvas (no library).
   <canvas data-holo="spine|lateral|necklace|reed|wave|obex|helix|pinecone|marsh|fractal|orrery|ring365|lunar|metonic">
   Additive, see-through wire figures with a slow scan beam. Drag to turn. Pauses off-screen. Respects reduced motion. */
(function(){
'use strict';
var COL={gold:'232,195,117',cyan:'70,227,240',rust:'226,134,100',green:'118,222,170',dim:'120,150,165',vio:'176,156,236'};
var PI=Math.PI;
function Sc(){this.L=[];this.P=[];}
Sc.prototype.line=function(a,b,c,w,al){this.L.push([a,b,c,w||1,al==null?1:al]);};
Sc.prototype.poly=function(p,c,w,al){for(var i=0;i<p.length-1;i++)this.L.push([p[i],p[i+1],c,w||1,al==null?1:al]);};
Sc.prototype.dot=function(p,c,r,al){this.P.push([p,c,r||2,al==null?1:al]);};
function rotX(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];}
function add(p,q){return[p[0]+q[0],p[1]+q[1],p[2]+q[2]];}
function ringPts(cn,rx,rz,n,tilt){var o=[];for(var i=0;i<=n;i++){var a=i/n*2*PI,p=[rx*Math.cos(a),0,rz*Math.sin(a)];if(tilt)p=rotX(p,tilt);o.push(add(p,cn));}return o;}
function lerp(a,b,t){return a+(b-a)*t;}
/* ---------- spine ---------- */
var CT=[[0,.04],[.12,.075],[.28,-.02],[.45,-.09],[.62,-.03],[.78,.085],[.9,.0],[1,-.07]];
function zAt(t){t=Math.max(0,Math.min(1,t));for(var i=0;i<CT.length-1;i++){if(t<=CT[i+1][0]){var u=(t-CT[i][0])/(CT[i+1][0]-CT[i][0]);u=(1-Math.cos(u*PI))/2;return lerp(CT[i][1],CT[i+1][1],u);}}return CT[CT.length-1][1];}
function layout(){
  var hs=[],kind=[],sz=[],i;
  for(i=0;i<24;i++){var k=i<7?'c':i<19?'t':'l';kind.push(k);hs.push(k==='c'?.5:k==='t'?.55+(i-7)*.012:.74);sz.push((k==='c'?.07+(i)*.002:k==='t'?.085+(i-7)*.0035:.14+(i-19)*.006)*1.35);}
  kind.push('s');hs.push(1.35);sz.push(.17);kind.push('x');hs.push(.55);sz.push(.05);
  var tot=0;hs.forEach(function(h){tot+=h;});var acc=0,out=[];
  for(i=0;i<hs.length;i++){var tt=(acc+hs[i]/2)/tot;acc+=hs[i];out.push({k:kind[i],s:sz[i],t:tt,y:.95-tt*1.9});}
  return out;
}
var LAY=layout();
function spineBuild(sc,t,o){
  var ptsCanal=[],ptsC=[];
  LAY.forEach(function(v,idx){
    var z=zAt(v.t),sway=o.sway?.07*Math.sin(v.t*7-t*1.7)*(.4+v.t):0,k=(zAt(v.t+.012)-zAt(v.t-.012))/(.024*1.9),tilt=-Math.atan(k);
    var cn=[sway,v.y,z],s=v.s,col=v.k==='c'?'cyan':v.k==='t'?'gold':v.k==='l'?'rust':'dim';
    ptsC.push(cn);
    var rx=s,rz=s*.8,h=s*.55;
    if(v.k==='s'){ // sacrum: tapered wedge
      var top=ringPts(add(cn,rotX([0,h*1.2,0],tilt)),rx,rz,10,tilt),bot=ringPts(add(cn,rotX([0,-h*3.2,0],tilt)),rx*.45,rz*.45,10,tilt);
      sc.poly(top,col,1,.8);sc.poly(bot,col,1,.7);for(var q=0;q<10;q+=2)sc.line(top[q],bot[q],col,.8,.6);
    }else if(v.k==='x'){
      var a=add(cn,rotX([0,h,0],tilt)),b=add(cn,rotX([0,-h*2,-0.01],tilt));sc.line(a,b,col,1.2,.8);sc.poly(ringPts(a,rx,rz,8,tilt),col,.9,.7);
    }else{
      var top=ringPts(add(cn,rotX([0,h/2,0],tilt)),rx,rz,10,tilt),bot=ringPts(add(cn,rotX([0,-h/2,0],tilt)),rx,rz,10,tilt);
      sc.poly(top,col,1.1,.9);sc.poly(bot,col,1,.7);for(var q2=0;q2<10;q2+=2)sc.line(top[q2],bot[q2],col,.7,.5);
      var canal=add(cn,rotX([0,0,-(rz+s*.3)],tilt));ptsCanal.push(canal);
      sc.poly(ringPts(canal,s*.3,s*.28,7,tilt),'cyan',.8,.55);
      var sp0=add(cn,rotX([0,0,-(rz+s*.5)],tilt)),sp1=add(cn,rotX([0,-h*.9,-(rz+s*1.6)],tilt));
      sc.line(sp0,sp1,col,1,.7);
      var tp0=add(cn,rotX([0,0,-(rz+s*.2)],tilt));
      sc.line(tp0,add(cn,rotX([s*1.9,h*.1,-(rz+s*.5)],tilt)),col,.9,.55);sc.line(tp0,add(cn,rotX([-s*1.9,h*.1,-(rz+s*.5)],tilt)),col,.9,.55);
      sc.line(add(cn,rotX([0,0,-rz],tilt)),canal,col,.7,.4);
    }
  });
  // spinal cord, incandescent
  if(ptsCanal.length>1){sc.poly(ptsCanal,'cyan',2,1);}
  if(o.full){
    // ribs
    for(var i=0;i<12;i++){var v=LAY[7+i],z=zAt(v.t),s2=v.s,rxr=.13+.2*Math.sin((i+1)/13*PI),rzr=.13+.07*Math.sin((i+1)/13*PI)*(i<7?1:.4),n=16,lim=i<7?1:.78;
      [-1,1].forEach(function(sd){var pts=[];for(var j=0;j<=n;j++){var ph=j/n*PI*lim,x=sd*rxr*Math.sin(ph),zz=z+rzr*(1-Math.cos(ph)),yy=v.y-.05*j/n-.02;pts.push([x,yy,zz]);}sc.poly(pts,'gold',.9,.45);});}
    // sternum
    var s0=LAY[7],s1=LAY[14];sc.line([0,s0.y-.03,zAt(s0.t)+.26],[0,s1.y-.1,zAt(s1.t)+.27],'gold',1.2,.5);
    // skull
    var top=LAY[0],hc=[0,top.y+.2,zAt(top.t)+.07];
    for(var l=-2;l<=2;l++){var yy=l*.07,rr=.17*Math.sqrt(Math.max(0,1-Math.pow(yy/.19,2)));sc.poly(ringPts([0,hc[1]+yy,hc[2]],rr,rr*1.1,18),'cyan',.8,.5);}
    for(var m=0;m<6;m++){var a=m/6*PI,pts2=[];for(var j2=0;j2<=18;j2++){var b=j2/18*2*PI;pts2.push([hc[0]+.17*Math.cos(a)*Math.cos(b),hc[1]+.19*Math.sin(b),hc[2]+.19*Math.sin(a)*Math.cos(b)]);}sc.poly(pts2,'cyan',.7,.35);}
    // pelvis
    var sa=LAY[24],sy=sa.y,sz=zAt(sa.t);
    [-1,1].forEach(function(sd){sc.poly([[sd*.05,sy+.1,sz],[sd*.24,sy+.16,sz+.04],[sd*.31,sy+.02,sz+.12],[sd*.22,sy-.14,sz+.22],[sd*.05,sy-.2,sz+.27]],'rust',1,.5);});
  }
}
/* ---------- other shapes ---------- */
function tube(sc,pts,r,col,w,al,every){for(var i=0;i<pts.length;i+=every||1){var p=pts[i];sc.poly(ringPts(p,r,r,14),col,w,al);}for(var q=0;q<14;q+=2){var l=[];for(var i2=0;i2<pts.length;i2++){var a=q/14*2*PI;l.push([pts[i2][0]+r*Math.cos(a),pts[i2][1],pts[i2][2]+r*Math.sin(a)]);}sc.poly(l,col,.7,al*.55);}}
var SH={
spine:function(sc,t){spineBuild(sc,t,{full:true});},
lateral:function(sc,t){spineBuild(sc,t,{sway:true});},
necklace:function(sc,t){var pts=[];LAY.forEach(function(v,i){var p=[0,v.y,zAt(v.t)];pts.push(p);});
  sc.poly(pts,'gold',1.2,.7);
  LAY.forEach(function(v,i){var p=pts[i],r=v.k==='s'?.07:.035+v.s*.2;sc.poly(ringPts(p,r,r,12),'gold',1,.8);sc.poly(ringPts(p,r,r,12,PI/2),'gold',.8,.5);sc.dot(p,i<7?'cyan':'gold',3.2,1);});
  var e=pts[pts.length-1];sc.poly([e,[0,e[1]-.12,e[2]],[.06,e[1]-.2,e[2]],[0,e[1]-.28,e[2]],[-.06,e[1]-.2,e[2]],[0,e[1]-.12,e[2]]],'gold',1.2,.9);
  sc.line([0,.95,zAt(0)],[0,1.05,zAt(0)+.05],'cyan',2,.9);},
reed:function(sc,t,o){var H=1.8,r=.2,i;
  for(i=0;i<=14;i++){var y=-H/2+H*i/14,node=(i%3===0);sc.poly(ringPts([0,y,0],r,r,22),node?'gold':'cyan',node?1.8:.9,node?1:.55);}
  for(var q=0;q<12;q++){var a=q/12*2*PI,x=r*Math.cos(a),z=r*Math.sin(a);sc.line([x,-H/2,z],[x,H/2,z],'cyan',.8,.45);}
  sc.line([0,-H/2,0],[0,H/2,0],'cyan',2,1);
  for(i=0;i<5;i++){var ph=((t*.35)+i/5)%1;sc.dot([0,-H/2+H*ph,0],'gold',3,Math.sin(ph*PI));}
  // cut pen tip
  var tip=[];for(i=0;i<=22;i++){var a2=i/22*2*PI;tip.push([r*Math.cos(a2),H/2+.22*(.5+.5*Math.cos(a2)),r*Math.sin(a2)]);}sc.poly(tip,'gold',1.3,.9);
  for(i=0;i<3;i++){var rr=r*(1.4+((t*.3+i/3)%1)*1.6);sc.poly(ringPts([0,-H/2-.08,0],rr,rr,40),'cyan',.8,.5*(1-((t*.3+i/3)%1)));}},
wave:function(sc,t){var pts=[],N=46,H=1.8;for(var i=0;i<=N;i++){var y=-H/2+H*i/N;pts.push([.16*Math.sin(y*5-t*2.4)*Math.sin(PI*i/N*1+.3)+0,y,.1*Math.cos(y*5-t*2.4)]);}
  tube(sc,pts,.1,'cyan',1,.8,2);sc.poly(pts,'gold',1.6,1);
  for(i=0;i<4;i++){var ph=((t*.3)+i/4)%1,k=Math.floor(ph*N),p=pts[k];sc.dot(p,'gold',3.6,Math.sin(ph*PI));}
  sc.poly(ringPts([0,-H/2-.05,0],.3,.3,30),'cyan',.8,.4);sc.poly(ringPts([0,H/2+.05,0],.3,.3,30),'cyan',.8,.4);},
obex:function(sc,t){
  var rh=[[0,.55,0],[.34,.28,0],[0,.0,0],[-.34,.28,0],[0,.55,0]],i;sc.poly(rh,'cyan',1.6,1);sc.line([-.34,.28,0],[.34,.28,0],'cyan',.9,.5);sc.line([0,.55,0],[0,0,0],'cyan',.9,.5);
  var rh2=rh.map(function(p){return[p[0],p[1],p[2]-.12];});sc.poly(rh2,'cyan',1,.55);for(i=0;i<4;i++)sc.line(rh[i],rh2[i],'cyan',.8,.4);
  [-1,1].forEach(function(sd){for(var l=0;l<5;l++){var rr=.26-l*.03;sc.poly(ringPts([sd*.5,.46-l*.07,-.05],rr,rr*.8,16,.2),'rust',.8,.45);}});
  var pts=[];for(i=0;i<=16;i++){var y=-.1-i*.1;pts.push([0,y,-.06]);}tube(sc,pts,.09,'gold',1,.8,2);sc.poly(pts,'cyan',1.8,1);
  var pul=.5+.5*Math.sin(t*3);sc.dot([0,0,0],'gold',4+pul*3,1);sc.poly(ringPts([0,0,0],.07+pul*.07,.07+pul*.07,20),'gold',1,.8);
  sc.poly(ringPts([0,.75,-.05],.3,.3,20),'rust',.7,.3);},
helix:function(sc,t){var H=1.8,N=60,a=[],b=[],i;
  for(i=0;i<=N;i++){var y=-H/2+H*i/N,ph=y*7-t*1.2,rr=.2;a.push([rr*Math.cos(ph),y,rr*Math.sin(ph)]);b.push([rr*Math.cos(ph+PI),y,rr*Math.sin(ph+PI)]);}
  sc.poly(a,'gold',2,1);sc.poly(b,'cyan',2,1);sc.line([0,-H/2,0],[0,H/2,0],'cyan',1.2,.6);
  for(i=0;i<=N;i+=3)sc.line(a[i],b[i],'dim',.7,.35);
  sc.dot(a[N],'gold',4,1);sc.dot(b[N],'cyan',4,1);
  sc.poly(ringPts([0,-H/2,0],.26,.26,24),'rust',1.6,.9);sc.poly(ringPts([0,-H/2-.06,0],.18,.18,24),'rust',1,.6);},
pinecone:function(sc,t){var n=75,ga=PI*(3-Math.sqrt(5)),i;
  for(i=0;i<n;i++){var u=i/(n-1),y=-.85+1.7*u,rr=.45*Math.sqrt(Math.max(0,1-Math.pow((y)/.9,2))),a=i*ga;
    var p=[rr*Math.cos(a),y,rr*Math.sin(a)],d=.075,sx=Math.cos(a),sz=Math.sin(a),tx=-sz,tz=sx;
    var A=[p[0]+tx*d,p[1],p[2]+tz*d],B=[p[0]+sx*.06,p[1]-d*1.1,p[2]+sz*.06],Cc=[p[0]-tx*d,p[1],p[2]-tz*d],D=[p[0],p[1]+d*.7,p[2]];
    sc.poly([A,B,Cc,D,A],'gold',.9,.75);sc.dot(p,'gold',1.6,.9);}
  sc.line([0,.9,0],[0,1.15,0],'gold',1.6,.9);sc.poly(ringPts([0,1.18,0],.06,.06,12),'cyan',1.3,.9);
  var pul=.5+.5*Math.sin(t*2);sc.dot([0,0,0],'cyan',5+pul*2,1);sc.poly(ringPts([0,0,0],.12+pul*.04,.1,16),'cyan',1,.7);},
marsh:function(sc,t){var i,j;
  for(i=0;i<=5;i++){var rr=.25+i*.2;sc.poly(ringPts([0,-.9,0],rr*1.1,rr*.8,40),'cyan',.8,.55-i*.07);}
  for(j=0;j<2;j++)for(i=0;i<9;i++){var sd=j?1:-1,x=sd*(.28+(i%3)*.08),z=-.8+i*.2,h=1.2+.5*Math.sin(i*1.7+j*2),pts=[];
    for(var k=0;k<=8;k++){var u=k/8,sw=.05*Math.sin(t*1.3+i+j*3)*u*u+sd*.06*u*u;pts.push([x+sw,-.9+h*u,z]);}
    sc.poly(pts,'green',1.1,.85);for(k=2;k<=8;k+=3)sc.poly(ringPts(pts[k],.015,.015,6),'gold',1,.8);
    var tp=pts[8];sc.line(tp,[tp[0]+sd*.12,tp[1]-.2,tp[2]],'green',.9,.6);}
  sc.line([0,-.9,-.9],[0,-.9,.9],'gold',1.6,.9);for(i=0;i<6;i++){var ph=((t*.3)+i/6)%1;sc.dot([0,-.9,-.9+1.8*ph],'gold',3,Math.sin(ph*PI));}},
fractal:function(sc,t){
  function br(p,d,len,depth){if(depth>4)return;var e=[p[0]+d[0]*len,p[1]+d[1]*len,p[2]+d[2]*len],col=depth<2?'gold':depth<4?'cyan':'green';sc.line(p,e,col,Math.max(.7,2.2-depth*.4),1-depth*.12);if(depth===4){sc.dot(e,'cyan',2,.9);return;}
    var a0=PI/5+Math.sin(t*.6)*.06,kids=3;for(var k=0;k<kids;k++){var az=k/kids*2*PI+depth*.9,sa=Math.sin(a0),nd=[Math.cos(az)*sa+d[0]*Math.cos(a0),d[1]*Math.cos(a0)+.0,Math.sin(az)*sa+d[2]*Math.cos(a0)];var L=Math.hypot(nd[0],nd[1],nd[2])||1;br(e,[nd[0]/L,nd[1]/L,nd[2]/L],len*.62,depth+1);}}
  br([0,-.9,0],[0,1,0],.62,0);},
/* ---- calendar figures ---- */
orrery:function(sc,t){
  var i,k;
  function ball(c,r,col,n,al){sc.poly(ringPts(c,r,r,n||28),col,1,al);[-.6,.6].forEach(function(h){var y=r*h,rr=r*Math.sqrt(1-h*h);sc.poly(ringPts([c[0],c[1]+y,c[2]],rr,rr,24),col,.7,al*.7);});
    for(k=0;k<3;k++){var a=k/3*PI,pts=[];for(i=0;i<=24;i++){var u=i/24*2*PI;pts.push([c[0]+r*Math.cos(u)*Math.cos(a),c[1]+r*Math.sin(u),c[2]+r*Math.cos(u)*Math.sin(a)]);}sc.poly(pts,col,.6,al*.55);}}
  var R=1.0,wE=.22,th=t*wE,e=[R*Math.cos(th),0,R*Math.sin(th)];
  /* sun */
  ball([0,0,0],.17,'gold',24,1);sc.dot([0,0,0],'gold',6,1);for(i=0;i<8;i++){var a=i/8*2*PI+t*.3;sc.line([.2*Math.cos(a),0,.2*Math.sin(a)],[.3*Math.cos(a),0,.3*Math.sin(a)],'gold',1,.5);}
  /* orbit with 12 month marks and 5 epagomenal days, drawn as the 365-day year */
  sc.poly(ringPts([0,0,0],R,R,120),'cyan',1,.45);
  for(i=0;i<12;i++){var b=i/12*2*PI*(360/365.2422),p=[R*Math.cos(b),0,R*Math.sin(b)];sc.line([p[0]*.96,0,p[2]*.96],[p[0]*1.05,0,p[2]*1.05],'gold',1.4,.9);}
  for(i=0;i<5;i++){var b2=(360+i+.5)/365.2422*2*PI;sc.dot([R*Math.cos(b2),0,R*Math.sin(b2)],'rust',2.4,.95);}
  /* earth trail */
  var tr=[];for(i=0;i<=30;i++){var q=th-i*.03;tr.push([R*Math.cos(q),0,R*Math.sin(q)]);}sc.poly(tr,'gold',1.8,.7);
  /* earth, tilted axis */
  ball(e,.09,'cyan',20,1);var tl=23.44*PI/180,ax=[Math.sin(tl)*.13,Math.cos(tl)*.13,0];
  sc.line([e[0]-ax[0],e[1]-ax[1],e[2]-ax[2]],[e[0]+ax[0],e[1]+ax[1],e[2]+ax[2]],'cyan',1.2,.9);sc.dot([e[0]+ax[0],e[1]+ax[1],e[2]+ax[2]],'cyan',1.8,1);
  sc.poly(ringPts(e,.09,.09,20),'green',.7,.5);
  /* moon: 12.37 turns for every turn of the earth */
  var rm=.24,tm=th*12.368,inc=5.14*PI/180;
  sc.poly(ringPts(e,rm,rm,40,inc),'dim',.7,.5);
  var mp=rotX([rm*Math.cos(tm),0,rm*Math.sin(tm)],inc);mp=add(mp,e);ball(mp,.04,'rust',14,1);sc.dot(mp,'rust',2,1);
  var mt=[];for(i=0;i<=14;i++){var qq=tm-i*.12,pp=rotX([rm*Math.cos(qq),0,rm*Math.sin(qq)],inc);mt.push(add(pp,e));}sc.poly(mt,'rust',1.2,.6);
},
ring365:function(sc,t){
  var i,R=1,y=.05,N=360;
  for(i=0;i<N;i++){var a=i/N*2*PI,long=i%30===0,mid=i%5===0,r1=long?R*.86:mid?R*.92:R*.95,c=Math.cos(a),s=Math.sin(a);
    sc.line([R*c,0,R*s],[r1*c,0,r1*s],long?'gold':'cyan',long?1.6:.6,long?1:.55);}
  sc.poly(ringPts([0,0,0],R,R,120),'cyan',1,.6);
  /* the five epagomenal days and the 0.2422 remainder beyond 360 */
  var A0=2*PI*360/365.2422;
  for(i=0;i<5;i++){var a1=A0+(i+.5)/365.2422*2*PI;sc.dot([R*1.1*Math.cos(a1),0,R*1.1*Math.sin(a1)],'rust',3.2,1);sc.line([R*Math.cos(a1),0,R*Math.sin(a1)],[R*1.1*Math.cos(a1),0,R*1.1*Math.sin(a1)],'rust',1.2,.9);}
  var arc=[];for(i=0;i<=20;i++){var u=A0+(i/20)*(2*PI*5/365.2422);arc.push([R*1.1*Math.cos(u),0,R*1.1*Math.sin(u)]);}sc.poly(arc,'rust',2,.9);
  var gs=[];for(i=0;i<=8;i++){var u2=2*PI-(1-i/8)*(2*PI*.2422/365.2422);gs.push([R*1.2*Math.cos(u2),0,R*1.2*Math.sin(u2)]);}sc.poly(gs,'gold',3,1);
  /* inner 12 x 30 and the 360 day pointer sweeping, the sun's real step is .9856 degrees */
  sc.poly(ringPts([0,0,0],R*.7,R*.7,60),'dim',.8,.5);
  var ph=(t*.08)%1,pa=ph*2*PI;sc.line([0,0,0],[R*.98*Math.cos(pa),0,R*.98*Math.sin(pa)],'gold',1.6,.9);sc.dot([R*.98*Math.cos(pa),0,R*.98*Math.sin(pa)],'gold',3.6,1);
  sc.dot([0,0,0],'gold',4,1);
},
lunar:function(sc,t){
  var i,R=.9,H=.55,syn=29.53059,yr=365.2422,tot=13*syn,n;
  /* year ring */
  sc.poly(ringPts([0,-H,0],R,R,100),'cyan',1,.5);
  /* the 13 x 28 grid: 13 equal cyan marks round the ring, 364 days */
  for(i=0;i<13;i++){var a=i/13*2*PI+0*PI;sc.line([R*.9*Math.cos(a),-H,R*.9*Math.sin(a)],[R*1.0*Math.cos(a),-H,R*1.0*Math.sin(a)],'cyan',1.6,.9);sc.dot([R*.82*Math.cos(a),-H,R*.82*Math.sin(a)],'cyan',2.2,.9);}
  /* thirteen real moons climbing as a helix: each is 29.53 days, 13 of them run past the year */
  var pts=[],steps=260;for(i=0;i<=steps;i++){var d=i/steps*tot,a2=d/yr*2*PI,y=-H+d/tot*2*H;pts.push([R*1.12*Math.cos(a2),y,R*1.12*Math.sin(a2)]);}sc.poly(pts,'gold',1.8,.95);
  for(n=0;n<=13;n++){var dd=n*syn,a3=dd/yr*2*PI,y3=-H+dd/tot*2*H,p=[R*1.12*Math.cos(a3),y3,R*1.12*Math.sin(a3)];sc.dot(p,n===13?'rust':'gold',n===13?4.2:3,1);}
  /* the year ends here; the overshoot is the rust segment from 365.24 to 383.9 */
  var ye=yr/tot,over=[];for(i=0;i<=30;i++){var d3=yr+(i/30)*(tot-yr),a4=d3/yr*2*PI,y4=-H+d3/tot*2*H;over.push([R*1.12*Math.cos(a4),y4,R*1.12*Math.sin(a4)]);}sc.poly(over,'rust',3.2,1);
  sc.line([R*1.12,-H,0],[R*1.12,H,0],'dim',.8,.45);
  var ph=(t*.1)%1,dm=ph*tot,am=dm/yr*2*PI,ym=-H+dm/tot*2*H;sc.dot([R*1.12*Math.cos(am),ym,R*1.12*Math.sin(am)],'green',4.6,1);
  sc.poly(ringPts([0,H,0],R*1.12,R*1.12,60),'rust',.8,.4);
},
metonic:function(sc,t){
  var i,R=1,leap={3:1,6:1,8:1,11:1,14:1,17:1,19:1};
  sc.poly(ringPts([0,0,0],R,R,100),'cyan',1,.55);
  /* 19 years round the ring, 7 of them with a thirteenth month */
  for(i=1;i<=19;i++){var a=(i-1)/19*2*PI,L=!!leap[i],c=Math.cos(a),s=Math.sin(a);
    sc.line([R*.88*c,0,R*.88*s],[R*c,0,R*s],L?'gold':'cyan',L?2:1,.9);
    sc.dot([R*1.08*c,0,R*1.08*s],L?'gold':'cyan',L?4:2.4,1);
    if(L){sc.line([R*c,0,R*s],[R*1.08*c,.16,R*1.08*s],'gold',1.4,.9);sc.dot([R*1.08*c,.16,R*1.08*s],'gold',3,1);}}
  /* 235 lunar months as an inner ring of small marks */
  for(i=0;i<235;i++){var b=i/235*2*PI,c2=Math.cos(b),s2=Math.sin(b);sc.line([R*.62*c2,0,R*.62*s2],[R*.68*c2,0,R*.68*s2],'dim',.6,.6);}
  sc.poly(ringPts([0,0,0],R*.62,R*.62,80),'dim',.7,.45);
  var ph=(t*.07)%1,pa=ph*2*PI;sc.line([0,0,0],[R*.98*Math.cos(pa),0,R*.98*Math.sin(pa)],'green',1.5,.85);sc.dot([R*.98*Math.cos(pa),0,R*.98*Math.sin(pa)],'green',3.6,1);
  sc.dot([0,0,0],'gold',4,1);
}
};
/* ---------- engine ---------- */
function make(cv){
  var kind=cv.getAttribute('data-holo'),fn=SH[kind];if(!fn)return;
  var g=cv.getContext('2d'),W=0,H=0,ay=.6,ax=parseFloat(cv.getAttribute('data-tilt'))||.12,drag=null,vis=false,ext=1,t0=performance.now(),still=false;
  try{still=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  function size(){var d=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth||300;H=cv.clientHeight||300;cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);}
  function proj(p,S){var c=Math.cos(ay),s=Math.sin(ay),x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c,c2=Math.cos(ax),s2=Math.sin(ax),y=p[1]*c2-z*s2,z2=p[1]*s2+z*c2,f=4/(4+z2);return[W/2+x*f*S,H/2-y*f*S,z2];}
  var first=true;
  function draw(){
    var t=(performance.now()-t0)/1000,sc=new Sc();fn(sc,still?2:t,{});
    if(first){var m=.3;sc.L.forEach(function(l){[l[0],l[1]].forEach(function(p){m=Math.max(m,Math.abs(p[0]),Math.abs(p[1]),Math.abs(p[2]));});});ext=m;first=false;}
    var S=Math.min(W,H)*.46/ext;
    g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';
    var gr=g.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.min(W,H)*.55);gr.addColorStop(0,'rgba(70,227,240,.08)');gr.addColorStop(1,'rgba(70,227,240,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
    var sy=Math.sin(t*.7)*ext*.95;
    // scan ring
    var sr=[];for(var i=0;i<=40;i++){var a=i/40*2*PI;sr.push([ext*.55*Math.cos(a),sy,ext*.55*Math.sin(a)]);}
    g.beginPath();sr.forEach(function(p,k){var q=proj(p,S);if(k)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1]);});g.strokeStyle='rgba(70,227,240,.28)';g.lineWidth=1;g.stroke();
    g.lineCap='round';
    sc.L.forEach(function(l){var A=proj(l[0],S),B=proj(l[1],S),z=(A[2]+B[2])/2,ym=(l[0][1]+l[1][1])/2,b=Math.exp(-Math.pow((ym-sy)/(ext*.07),2)),al=Math.max(.12,Math.min(1,.78-z/ext*.4))*l[4],rgb=COL[l[2]]||COL.cyan;
      g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);
      g.strokeStyle='rgba('+rgb+','+(al*.14+b*.12)+')';g.lineWidth=l[3]*3.6;g.stroke();
      g.strokeStyle='rgba('+rgb+','+Math.min(1,al*.85+b*.7)+')';g.lineWidth=l[3]*(1+b*.8);g.stroke();});
    sc.P.forEach(function(p){var P=proj(p[0],S),rgb=COL[p[1]]||COL.cyan,al=p[3];g.beginPath();g.arc(P[0],P[1],p[2]*2.4,0,7);g.fillStyle='rgba('+rgb+','+al*.18+')';g.fill();g.beginPath();g.arc(P[0],P[1],p[2],0,7);g.fillStyle='rgba('+rgb+','+al+')';g.fill();});
    g.globalCompositeOperation='source-over';
  }
  function tick(){if(!vis)return;if(!drag&&!still)ay+=.0055;draw();requestAnimationFrame(tick);}
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!vis){vis=true;size();tick();}else if(!e.isIntersecting)vis=false;});},{threshold:.05}).observe(cv);
  window.addEventListener('resize',function(){if(vis){size();draw();}});
  cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(x){}});
  cv.addEventListener('pointermove',function(e){if(!drag)return;ay+=(e.clientX-drag.x)*.012;ax=Math.max(-1.2,Math.min(1.2,ax+(e.clientY-drag.y)*.008));drag={x:e.clientX,y:e.clientY};if(still)draw();});
  ['pointerup','pointercancel'].forEach(function(n){cv.addEventListener(n,function(){drag=null;});});
  size();draw();
}
function boot(){var c=document.querySelectorAll('canvas[data-holo]');for(var i=0;i<c.length;i++)make(c[i]);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
