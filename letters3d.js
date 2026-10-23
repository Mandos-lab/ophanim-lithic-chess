/* Philosophy From A Stone: the geometric alphabet, drawn as turning wireframe letters.
   <canvas data-letter="Α" data-tint="gold|cyan|green|rust"> or data-rhomb="1" for a diphthong rhombus.
   Plain canvas, no outside library. Front and back outlines joined at the nodes. Drag to turn. Pauses off-screen. */
(function(){
'use strict';
function ell(a,b,n,close){var p=[];for(var i=0;i<=n;i++){var t=i/n*2*Math.PI+Math.PI/2;p.push([a*Math.cos(t),b*Math.sin(t)]);}return p;}
var L={
'Α':{p:[[[-.5,-.8],[0,.8],[.5,-.8]],[[-.27,-.15],[.27,-.15]]]},
'Β':{p:[[[-.4,-.8],[-.4,.8],[.12,.8],[.4,.58],[.4,.22],[.12,0],[-.4,0]],[[.12,0],[.45,-.22],[.45,-.58],[.12,-.8],[-.4,-.8]]]},
'Γ':{p:[[[-.35,-.8],[-.35,.8],[.42,.8]]]},
'Δ':{p:[[[-.5,-.8],[0,.8],[.5,-.8],[-.5,-.8]]]},
'Ε':{p:[[[.42,.8],[-.36,.8],[-.36,-.8],[.42,-.8]],[[-.36,0],[.25,0]]]},
'Ζ':{p:[[[-.4,.8],[.4,.8],[-.4,-.8],[.4,-.8]]]},
'Η':{p:[[[-.4,.8],[-.4,-.8]],[[.4,.8],[.4,-.8]],[[-.4,0],[.4,0]]]},
'Θ':{p:[ell(.5,.8,24)],bar:[[-.26,0],[.26,0]],ne:3},
'Ι':{p:[[[0,.8],[0,-.8]],[[-.2,.8],[.2,.8]],[[-.2,-.8],[.2,-.8]]]},
'Κ':{p:[[[-.4,.8],[-.4,-.8]],[[.42,.8],[-.4,0],[.42,-.8]]]},
'Λ':{p:[[[-.5,-.8],[0,.8],[.5,-.8]]]},
'Μ':{p:[[[-.5,-.8],[-.5,.8],[0,-.1],[.5,.8],[.5,-.8]]]},
'Ν':{p:[[[-.4,-.8],[-.4,.8],[.4,-.8],[.4,.8]]]},
'Ξ':{p:[[[-.42,.8],[.42,.8]],[[-.26,0],[.26,0]],[[-.42,-.8],[.42,-.8]]]},
'Ο':{p:[ell(.5,.8,24)],ne:3},
'Π':{p:[[[-.45,-.8],[-.45,.8],[.45,.8],[.45,-.8]]]},
'Ρ':{p:[[[-.4,-.8],[-.4,.8],[.12,.8],[.42,.58],[.42,.22],[.12,0],[-.4,0]]]},
'Σ':{p:[[[.42,.8],[-.4,.8],[.1,0],[-.4,-.8],[.42,-.8]]]},
'Τ':{p:[[[-.5,.8],[.5,.8]],[[0,.8],[0,-.8]]]},
'Υ':{p:[[[-.45,.8],[0,0],[.45,.8]],[[0,0],[0,-.8]]]},
'Φ':{p:[ell(.38,.5,20),[[0,.8],[0,-.8]]],ne:3},
'Χ':{p:[[[-.45,.8],[.45,-.8]],[[.45,.8],[-.45,-.8]]]},
'Ψ':{p:[[[-.5,.8],[-.5,.1],[-.25,-.3],[0,-.3],[.25,-.3],[.5,.1],[.5,.8]],[[0,.8],[0,-.8]]]},
'Ω':{p:[[[-.5,-.8],[-.2,-.8],[-.2,-.5],[-.45,-.25],[-.5,.15],[-.35,.6],[0,.8],[.35,.6],[.5,.15],[.45,-.25],[.2,-.5],[.2,-.8],[.5,-.8]]]},
'◇':{p:[[[0,.8],[.55,0],[0,-.8],[-.55,0],[0,.8]],[[-.55,0],[.55,0]]]}
};
L['Θ'].p.push(L['Θ'].bar);delete L['Θ'].bar;
var TINT={gold:'232,195,117',cyan:'70,227,240',green:'118,222,170',rust:'226,134,100',violet:'176,156,236'};
function make(cv){
  var key=cv.getAttribute('data-letter')||'◇',sp=L[key]||L['◇'],tint=TINT[cv.getAttribute('data-tint')||'gold'];
  var rh=cv.hasAttribute('data-rhomb'),D=.2,ay=.5+Math.random()*.5,ax=.18,drag=null,vis=false,W=0,H=0,g=cv.getContext('2d');
  var still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  var lines=[],nodes=[];
  if(cv.hasAttribute('data-double')){sp={p:[[[0,.85],[.6,0],[0,-.85],[-.6,0],[0,.85]],[[0,.45],[.3,0],[0,-.45],[-.3,0],[0,.45]]]};}
  sp.p.forEach(function(pl){
    var ne=sp.ne||1;
    for(var i=0;i<pl.length;i++){
      var a=pl[i];if(i<pl.length-1){var b=pl[i+1];lines.push([[a[0],a[1],D],[b[0],b[1],D]]);lines.push([[a[0],a[1],-D],[b[0],b[1],-D]]);}
      if(i%ne===0&&!(pl.length>2&&i===pl.length-1&&pl[0][0]===a[0]&&pl[0][1]===a[1])){nodes.push([a[0],a[1],D]);nodes.push([a[0],a[1],-D]);lines.push([[a[0],a[1],D],[a[0],a[1],-D]]);}
    }
  });
  if(cv.hasAttribute('data-double')){[[0,.85,0,.45],[.6,0,.3,0],[0,-.85,0,-.45],[-.6,0,-.3,0]].forEach(function(q){lines.push([[q[0],q[1],D],[q[2],q[3],D]]);lines.push([[q[0],q[1],-D],[q[2],q[3],-D]]);});
    for(var k=0;k<6;k++){var ph=k/6*Math.PI*2;nodes.push([.16*Math.cos(ph),.28*Math.sin(ph),0]);}
    lines.push([[0,.45,0],[0,-.45,0]]);lines.push([[-.3,0,0],[.3,0,0]]);}
  else if(rh){ // convergence: two vectors meeting in the rhombus
    lines.push([[-.55,0,D],[0,0,D]]);lines.push([[0,0,D],[.55,0,D]]);nodes.push([0,0,0]);
  }
  function size(){var d=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth||200;H=cv.clientHeight||200;cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);}
  function proj(p){var c=Math.cos(ay),s=Math.sin(ay),x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c,c2=Math.cos(ax),s2=Math.sin(ax),y=-p[1]*c2-z*s2,z2=-p[1]*-s2*-1+z*c2;z2=p[1]*s2+z*c2;var f=3.2/(3.2+z2),S=Math.min(W,H)*.5;return[W/2+x*f*S,H/2+y*f*S,z2];}
  function draw(){
    g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';
    var gr=g.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.min(W,H)*.5);gr.addColorStop(0,'rgba('+tint+',.10)');gr.addColorStop(1,'rgba('+tint+',0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
    if(cv.hasAttribute('data-double')){[D,-D].forEach(function(z,ii){var q=[[0,.85],[.6,0],[0,-.85],[-.6,0]].map(function(a){return proj([a[0],a[1],z]);});g.beginPath();g.moveTo(q[0][0],q[0][1]);for(var k=1;k<4;k++)g.lineTo(q[k][0],q[k][1]);g.closePath();g.fillStyle='rgba('+tint+','+(ii?.035:.06)+')';g.fill();});}
    g.lineCap='round';g.lineJoin='round';
    lines.forEach(function(l){var A=proj(l[0]),B=proj(l[1]),z=(A[2]+B[2])/2,al=Math.max(.14,Math.min(1,.7-z*.45));g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.strokeStyle='rgba('+tint+','+al+')';g.lineWidth=l[0][2]===l[1][2]?1.7:.8;g.stroke();});
    nodes.forEach(function(n){var P=proj(n),al=Math.max(.25,Math.min(1,.85-P[2]*.4));g.beginPath();g.arc(P[0],P[1],2.3,0,7);g.fillStyle='rgba(70,227,240,'+al+')';g.fill();});
    g.globalCompositeOperation='source-over';
  }
  function tick(){if(!vis)return;if(!drag&&!still)ay+=.009;draw();requestAnimationFrame(tick);}
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!vis){vis=true;size();tick();}else if(!e.isIntersecting)vis=false;});},{threshold:.05}).observe(cv);
  window.addEventListener('resize',function(){if(vis){size();draw();}});
  cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(x){}});
  cv.addEventListener('pointermove',function(e){if(!drag)return;ay+=(e.clientX-drag.x)*.012;ax=Math.max(-1.2,Math.min(1.2,ax+(e.clientY-drag.y)*.008));drag={x:e.clientX,y:e.clientY};if(still)draw();});
  ['pointerup','pointercancel'].forEach(function(n){cv.addEventListener(n,function(){drag=null;});});
  size();draw();
}
function boot(){var c=document.querySelectorAll('canvas[data-letter],canvas[data-rhomb]');for(var i=0;i<c.length;i++)make(c[i]);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
