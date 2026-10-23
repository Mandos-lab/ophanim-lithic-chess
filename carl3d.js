/* Philosophy From A Stone: small turning wireframe figures (plain canvas, no library).
   <canvas data-shape="palace"> ... drag to turn. Pauses off-screen; still if "reduce motion" is set. */
(function(){
'use strict';
var COL={gold:'232,195,117',cyan:'70,227,240',dim:'150,168,174',rust:'176,138,74'};
var PI=Math.PI;
function ring(r,n,y,z0){var a=[];for(var i=0;i<=n;i++){var t=i/n*2*PI;a.push([r*Math.cos(t),y,r*Math.sin(t)]);}return a;}
function L(pts,c,w,dot){return{p:pts,c:c||'dim',w:w||1,dot:!!dot};}
function line(a,b,c,w){return L([a,b],c,w);}
var S={};
S.mirror=function(){var o=[];
  var A=[],B=[];for(var i=0;i<=40;i++){var t=i/40*2*PI;A.push([.55*Math.cos(t),.55*Math.sin(t),-.8]);B.push([.55*Math.cos(t),.55*Math.sin(t),.8]);}
  o.push(L(A,'gold',1.6),L(B,'cyan',1.6));
  [0,PI].forEach(function(ph,k){var h=[];for(var i=0;i<=80;i++){var t=i/80;h.push([.28*Math.cos(t*6*PI+ph),.28*Math.sin(t*6*PI+ph),-.8+1.6*t]);}o.push(L(h,k?'cyan':'gold',1));});
  o.push(line([0,0,-1],[0,0,1],'dim',.8));return o;};
S.palace=function(){var o=[];
  for(var i=0;i<36;i++){var t=i/36*2*PI,x=Math.cos(t),z=Math.sin(t),main=i%9===0;
    o.push(line([x,-.4,z],[x,.45,z],main?'gold':'dim',main?2:1));}
  o.push(L(ring(1,72,-.45),'gold',1.2),L(ring(1,72,.45),'dim',1),L(ring(.55,48,-.6),'cyan',1));
  for(var j=0;j<4;j++){var t2=j/4*2*PI;o.push(line([Math.cos(t2),-.45,Math.sin(t2)],[.55*Math.cos(t2),-.6,.55*Math.sin(t2)],'cyan',.8));}
  return o;};
S.grid=function(){var o=[],cols=['rust','cyan','gold','dim'];
  for(var c=0;c<4;c++){var x=(c-1.5)*.55;
    o.push(line([x,-.85,0],[x,.85,0],cols[c],1.4));
    for(var r=0;r<9;r++){var y=(r-4)*.2,mid=(c===0&&r===4);
      o.push(L([[x-.09,y,0],[x+.09,y,0]],cols[c],1));
      o.push(L([[x,y,0],[x,y,.0]],mid?'gold':cols[c],mid?7:3,true));}
    o.push(L([[x,-.85,-.25],[x,-.85,.25]],cols[c],1));}
  o.push(L([[-.83,-.85,0],[.83,-.85,0],[.83,.85,0],[-.83,.85,0],[-.83,-.85,0]],'dim',.6));
  return o;};
S.tri345=function(){var o=[],k=.26,A=[-2*k,1.5*k],B=[2*k,1.5*k],C=[-2*k,-1.5*k];
  function P(p,z){return[p[0],p[1],z];}
  [-.07,.07].forEach(function(z){o.push(L([P(A,z),P(B,z),P(C,z),P(A,z)],'gold',1.6));});
  [A,B,C].forEach(function(p){o.push(line(P(p,-.07),P(p,.07),'gold',1.2));});
  function sq(p,q,s){var dx=q[0]-p[0],dy=q[1]-p[1],nx=-dy*s,ny=dx*s;
    var a=[p[0],p[1]],b=[q[0],q[1]],c=[q[0]+nx,q[1]+ny],d=[p[0]+nx,p[1]+ny];
    o.push(L([P(a,0),P(b,0),P(c,0),P(d,0),P(a,0)],'cyan',1));}
  sq(A,B,-1);   // 4 below
  sq(C,A,-1);   // 3 left
  sq(B,C,-1);   // 5 outward
  return o;};
S.tree=function(){var o=[];
  o.push(line([0,.7,0],[0,-.25,0],'gold',2.2));
  [[.5,-.3],[.38,-.5],[.2,-.65]].forEach(function(a,i){o.push(L(ring(a[0],40,a[1]),i%2?'gold':'cyan',1.2));});
  for(var i=0;i<6;i++){var t=i/6*2*PI;o.push(line([0,-.25,0],[.5*Math.cos(t),-.3,.5*Math.sin(t)],'dim',.8));}
  var h=[];for(var j=0;j<=80;j++){var u=j/80;h.push([.2*Math.cos(u*6*PI),.7-.6*u,.2*Math.sin(u*6*PI)]);}
  o.push(L(h,'rust',1.8));o.push(L(ring(.09,20,.25),'dim',1));
  for(var r=0;r<5;r++){var t3=r/5*2*PI;o.push(line([0,.7,0],[.6*Math.cos(t3),.95,.6*Math.sin(t3)],'rust',1));}
  return o;};
S.aragats=function(){var o=[],H=[4090,3995,3908,3888],ang=[-PI/2,0,PI/2,PI]; // N,E,S,W -> heights N,W,E,S mapped loosely
  var hs=[4090,3908,3888,3995]; // N,E,S,W
  var tops=[];
  for(var i=0;i<4;i++){var t=ang[i],bx=.62*Math.cos(t),bz=.62*Math.sin(t),y=.5-(hs[i]-3000)/1090*.85;
    o.push(line([bx,.5,bz],[bx,y,bz],'gold',2.4));tops.push([bx,y,bz]);
    o.push(line([bx,y,bz],[bx*1.0,-.62,bz],'cyan',.8));}
  tops.push(tops[0]);o.push(L(tops,'gold',1.2));
  o.push(L(ring(1,72,.5),'dim',1),L(ring(1,72,-.62),'cyan',1.4));
  for(var j=0;j<24;j++){var t2=j/24*2*PI;o.push(line([Math.cos(t2),.5,Math.sin(t2)],[.62*Math.cos(t2),.38,.62*Math.sin(t2)],'dim',.6));}
  o.push(L(ring(.62,48,.38),'dim',.8));
  return o;};
S.tpillar=function(){var o=[];
  function T(x,z,hh,c){var tx=-Math.sin(Math.atan2(z,x)),tz=Math.cos(Math.atan2(z,x)),w=.11;
    o.push(line([x,.5,z],[x,.5-hh,z],c,2));o.push(line([x-tx*w,.5-hh,z-tz*w],[x+tx*w,.5-hh,z+tz*w],c,2.4));}
  for(var i=0;i<12;i++){var t=i/12*2*PI;T(.9*Math.cos(t),.9*Math.sin(t),.7,'dim');}
  T(-.16,0,.95,'gold');T(.16,0,.95,'gold');
  o.push(L(ring(1.05,72,.5),'cyan',1));return o;};
S.djed=function(){var o=[];
  o.push(line([0,.7,0],[0,-.55,0],'gold',2.4));
  [[-.5,.3],[-.38,.26],[-.26,.22],[-.14,.18]].forEach(function(b){o.push(line([-b[1],b[0],0],[b[1],b[0],0],'gold',2));});
  [-1,1].forEach(function(s){var w=[];for(var i=0;i<=20;i++){var t=i/20;w.push([s*(.08+.8*t),-.2-.35*Math.sin(t*PI*.85),.0+.25*Math.sin(t*PI)]);}o.push(L(w,'cyan',1.4));
    var w2=[];for(i=0;i<=20;i++){t=i/20;w2.push([s*(.08+.65*t),-.1-.25*Math.sin(t*PI*.85),-.25*Math.sin(t*PI)]);}o.push(L(w2,'cyan',1));});
  o.push(L(ring(.4,40,.7),'dim',1.2));return o;};
S.lambda=function(){var o=[],xs=[-.9,-.3,.3,.9];
  xs.forEach(function(x,i){var z=(i%2?.18:-.18);o.push(L([[x-.22,.4,z],[x,-.35,z],[x+.22,.4,z]],i<2?'gold':'cyan',2.2));});
  o.push(L(ring(1.05,72,.0),'dim',.8));
  var M=[[-.5,.7,0],[-.5,.55,0],[-.25,.7,0],[0,.55,0],[.25,.7,0],[.5,.55,0],[.5,.7,0]];
  o.push(L([[-.5,-.6,.0],[-.25,-.85,0],[0,-.6,0],[.25,-.85,0],[.5,-.6,0]],'dim',1));
  return o;};
S.ur=function(){var o=[],cells=[],sz=.27,
  rosette={'0,0':1,'0,2':1,'3,1':1,'6,0':1,'6,2':1};
  for(var c=0;c<8;c++)for(var r=0;r<3;r++){var ok=(c<4)||(c>5)||(r===1);if(c===4||c===5){ok=(r===1);}if(ok)cells.push([c,r]);}
  var n=0;cells.forEach(function(q){var c=q[0],r=q[1],x=(c-3.5)*sz,z=(r-1)*sz,h=sz/2,col=(r===1)?'cyan':'dim';n++;
    o.push(L([[x-h,0,z-h],[x+h,0,z-h],[x+h,0,z+h],[x-h,0,z+h],[x-h,0,z-h]],col,1));
    if(rosette[c+','+r]){var d=.07;o.push(L([[x-d,0,z],[x,0,z-d],[x+d,0,z],[x,0,z+d],[x-d,0,z]],'gold',1.6));}});
  return o;};
S.gates=function(){var o=[],n=7;
  for(var i=0;i<n;i++){var z=-.9+i*.3,s=.9-i*.1;
    o.push(L([[-s,-s,z],[s,-s,z],[s,s,z],[-s,s,z],[-s,-s,z]],i%2?'gold':'cyan',1.2));}
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){o.push(line([q[0]*.9,q[1]*.9,-.9],[q[0]*.3,q[1]*.3,.9],'dim',.6));});
  o.push(L([[0,0,1.05]],'gold',8,true));return o;};
S.heptagon=function(){var o=[],R=.9,P=[];
  for(var i=0;i<7;i++){var t=i/7*2*PI-PI/2;P.push([R*Math.cos(t),0,R*Math.sin(t)]);}
  var h=P.slice();h.push(P[0]);o.push(L(h,'cyan',1.6));
  var st=[];for(var j=0;j<=7;j++)st.push(P[(j*3)%7]);o.push(L(st,'dim',.9));
  o.push(line([0,-.95,0],[0,.0,0],'gold',2.4));o.push(L([[0,0,0]],'gold',8,true));
  P.forEach(function(p){o.push(line([p[0],0,p[2]],[p[0],.12,p[2]],'cyan',1));});
  return o;};
S.torus=function(){var o=[],R=.6,r=.3;
  for(var i=0;i<16;i++){var u=i/16*2*PI,m=[];for(var j=0;j<=24;j++){var v=j/24*2*PI;m.push([(R+r*Math.cos(v))*Math.cos(u),r*Math.sin(v),(R+r*Math.cos(v))*Math.sin(u)]);}o.push(L(m,i%2?'gold':'cyan',.9));}
  for(var k=0;k<6;k++){var v2=k/6*2*PI,l=[];for(var q=0;q<=48;q++){var u2=q/48*2*PI;l.push([(R+r*Math.cos(v2))*Math.cos(u2),r*Math.sin(v2),(R+r*Math.cos(v2))*Math.sin(u2)]);}o.push(L(l,'dim',.7));}
  return o;};
function rot(p,ay,ax){var x=p[0],y=p[1],z=p[2],c=Math.cos(ay),s=Math.sin(ay),x1=x*c+z*s,z1=-x*s+z*c,c2=Math.cos(ax),s2=Math.sin(ax),y1=y*c2-z1*s2,z2=y*s2+z1*c2;return[x1,y1,z2];}
function init(cv){
  var name=cv.getAttribute('data-shape'),make=S[name];if(!make)return;
  var lines=make(),ctx=cv.getContext('2d'),ay=.6,ax=.38,vis=false,drag=null,still=false,w=0,h=0;
  try{still=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  function size(){var d=Math.min(2,window.devicePixelRatio||1);w=cv.clientWidth||300;h=cv.clientHeight||300;cv.width=Math.round(w*d);cv.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);}
  function draw(){
    ctx.clearRect(0,0,w,h);var sc=Math.min(w,h)*.34,cx=w/2,cy=h/2;
    function pr(p){var q=rot(p,ay,ax),f=3/(3+q[2]);return[cx+q[0]*f*sc,cy+q[1]*f*sc,q[2],f];}
    lines.forEach(function(l){
      var pts=l.p.map(pr),col=COL[l.c];
      if(l.dot){pts.forEach(function(q){ctx.beginPath();ctx.arc(q[0],q[1],l.w,0,2*PI);ctx.fillStyle='rgba('+col+','+Math.max(.4,Math.min(1,.8-q[2]*.2))+')';ctx.fill();});return;}
      for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],z=(a[2]+b[2])/2,al=Math.max(.15,Math.min(.95,.62-z*.35));
        ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle='rgba('+col+','+al+')';ctx.lineWidth=l.w*(0.8+.3*(a[3]+b[3])/2);ctx.stroke();}
      if(l.w>=4){}});
  }
  function tick(){if(!vis)return;if(!drag&&!still)ay+=.0045;draw();requestAnimationFrame(tick);}
  new (window.IntersectionObserver||function(){this.observe=function(){vis=true;};})(function(es){es.forEach(function(e){var on=e.isIntersecting;if(on&&!vis){vis=true;size();tick();}else if(!on){vis=false;}});},{threshold:.05}).observe(cv);
  window.addEventListener('resize',function(){if(vis){size();draw();}});
  cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(x){}cv.style.cursor='grabbing';});
  cv.addEventListener('pointermove',function(e){if(!drag)return;ay+=(e.clientX-drag.x)*.01;ax=Math.max(-1.2,Math.min(1.2,ax+(e.clientY-drag.y)*.008));drag={x:e.clientX,y:e.clientY};if(still)draw();});
  function up(){drag=null;cv.style.cursor='';}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  size();draw();
}
function go(){var l=document.querySelectorAll('canvas[data-shape]');for(var i=0;i<l.length;i++)init(l[i]);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
