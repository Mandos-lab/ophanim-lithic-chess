/* geo-bg.js: slow geometric figure fixed in the empty left margin; it morphs from one star polygon to the next as the page scrolls. Set window.GEO_SHAPES before loading to change the shapes: ['circle'] | ['star',n,k] | ['liss',a,b]. */
(function(){
  var SH=window.GEO_SHAPES||[['circle'],['star',7,3],['star',9,2],['star',10,3],['star',27,5],['star',36,11],['liss',3,2],['circle']];
  var M=360,TAU=Math.PI*2,still=false;
  try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  function shape(d){var a=[],i;
    if(d[0]==='circle'){for(i=0;i<M;i++){var u=TAU*i/M;a.push([Math.cos(u),Math.sin(u)]);}}
    else if(d[0]==='liss'){for(i=0;i<M;i++){var w=TAU*i/M;a.push([Math.sin(d[1]*w+Math.PI/2),Math.sin(d[2]*w)]);}}
    else{var n=d[1],k=d[2],V=[];for(i=0;i<n;i++){var g=-Math.PI/2+TAU*((i*k)%n)/n;V.push([Math.cos(g),Math.sin(g)]);}
      for(i=0;i<M;i++){var p=i*n/M,c=Math.floor(p),f=p-c,A=V[c%n],B=V[(c+1)%n];a.push([A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f]);}}
    return a;}
  var S=SH.map(shape);
  var cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;left:0;top:0;height:100vh;pointer-events:none;z-index:0;opacity:.75';
  document.body.insertBefore(cv,document.body.firstChild);
  var ctx=cv.getContext('2d'),W=0,H=0,dpr=1,secs=[],cur=0,tgt=0,gold='232,195,117',cyan='70,227,240';
  function css(n,f){try{var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||f}catch(e){return f}}
  function size(){
    var w=document.querySelector('main section .wrap');var left=w?w.getBoundingClientRect().left:0;
    W=Math.max(0,Math.floor(left-10));H=innerHeight;dpr=Math.min(2,window.devicePixelRatio||1);
    if(W<230){cv.style.display='none';return;}cv.style.display='block';
    cv.style.width=W+'px';cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    secs=[].slice.call(document.querySelectorAll('main section'));}
  function target(){
    if(!secs.length)return 0;var mid=scrollY+innerHeight*.5,k=0;
    for(var i=0;i<secs.length;i++){if(secs[i].getBoundingClientRect().top+scrollY<=mid)k=i;}
    var s=secs[k],top=s.getBoundingClientRect().top+scrollY,t=Math.min(1,Math.max(0,(mid-top)/Math.max(1,s.offsetHeight)));
    return (k+t)*(SH.length-1)/Math.max(1,secs.length-1);}
  function ease(t){return t*t*(3-2*t);}
  function draw(ts){
    requestAnimationFrame(draw);if(W<230)return;
    tgt=target();cur+=(tgt-cur)*.07;
    var ft=document.querySelector('footer');if(ft){var fy=ft.getBoundingClientRect().top;cv.style.opacity=(.75*Math.max(0,Math.min(1,(fy-H*.3)/(H*.45)))).toFixed(3);}
    var q=Math.min(SH.length-1,Math.max(0,cur)),i0=Math.floor(q),i1=Math.min(SH.length-1,i0+1),t=ease(q-i0);
    var A=S[i0],B=S[i1],R=Math.min(W/2-26,H*.32,250),cx=W/2,cy=H/2,ang=(still?0:ts*0.00006)+cur*.55;
    ctx.clearRect(0,0,W,H);
    ctx.lineJoin='round';
    ctx.strokeStyle='rgba('+gold+',.18)';ctx.lineWidth=1;ctx.setLineDash([2,6]);ctx.beginPath();ctx.arc(cx,cy,R*1.14,0,TAU);ctx.stroke();ctx.setLineDash([]);
    function layer(scale,rot,col,alpha,lw){
      var c=Math.cos(rot),s=Math.sin(rot);ctx.beginPath();
      for(var k=0;k<=M;k++){var j=k%M,x=A[j][0]+(B[j][0]-A[j][0])*t,y=A[j][1]+(B[j][1]-A[j][1])*t,
        X=cx+R*scale*(x*c-y*s),Y=cy+R*scale*(x*s+y*c);if(k===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}
      ctx.closePath();ctx.strokeStyle='rgba('+col+','+alpha+')';ctx.lineWidth=lw;ctx.shadowColor='rgba('+col+',.55)';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;}
    layer(1,ang,gold,.5,1.2);
    layer(.62,-ang*1.4+Math.PI/5,cyan,.4,1);
    ctx.fillStyle='rgba('+gold+',.8)';ctx.beginPath();ctx.arc(cx,cy,2.5,0,TAU);ctx.fill();
  }
  addEventListener('resize',size);addEventListener('load',size);size();requestAnimationFrame(draw);
})();
