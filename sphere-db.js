/* Word database table for the sphere pages: search, group filter, sortable columns, click a row to load the word into the sphere. */
(function(){
var host=document.getElementById('spdb');if(!host)return;
var W=window.SPHERE_WORDS||[],CFG=window.SPHERE_CFG,sortKey='',dir=1,grp='All',q='';
var groups=['All'].concat(W.map(function(w){return w[3];}).filter(function(g,i,a){return a.indexOf(g)===i;}));
host.innerHTML='<div class="dbbar"><input id="dbq" type="search" placeholder="Search a word, meaning or number" aria-label="Search the word list"><div class="dbg" id="dbg"></div></div><div class="dbscroll"><table class="dbt"><thead><tr><th data-k="w">Word</th><th data-k="s">Say</th><th data-k="e">Meaning</th><th data-k="v">Value</th><th data-k="b">Bearing</th><th data-k="c">Sector</th><th data-k="h">Pitch range</th><th></th></tr></thead><tbody id="dbb"></tbody></table></div><p class="dbn" id="dbn"></p>';
var gb=document.getElementById('dbg'),bd=document.getElementById('dbb'),qi=document.getElementById('dbq'),nn=document.getElementById('dbn');
groups.forEach(function(g){var b=document.createElement('button');b.type='button';b.textContent=g;b.dataset.g=g;b.onclick=function(){grp=g;draw();};gb.appendChild(b);});
function rows(){return W.map(function(w){var i=window.SPHERE?SPHERE.info(w[0]):{total:0,bearing:0,sector:0,letter:'',hzLow:0,hzHigh:0,letters:[]};var say=w[1]||(CFG.translit?CFG.translit(i.letters,[],{}):'');
  return{w:w[0],s:say,e:w[2],g:w[3],v:i.total,b:i.bearing,c:i.sector,l:i.letter,lo:i.hzLow,hi:i.hzHigh};});}
function draw(){
  var r=rows().filter(function(x){return(grp==='All'||x.g===grp)&&(!q||(x.w+' '+x.s+' '+x.e+' '+x.v).toLowerCase().indexOf(q)>=0);});
  var kf={w:'w',s:'s',e:'e',v:'v',b:'b',c:'c',h:'lo',group:'g'}[sortKey]||'g';
  if(sortKey)r.sort(function(a,b){var x=a[kf],y=b[kf];return(x<y?-1:x>y?1:0)*dir||(a.v-b.v);});
  bd.innerHTML=r.map(function(x){return '<tr data-w="'+x.w+'"><td class="dbw" lang="'+CFG.lang+'" dir="'+CFG.dir+'">'+x.w+'</td><td>'+x.s+'</td><td>'+x.e+'</td><td class="dbv">'+x.v+'</td><td>'+x.b+'&deg;</td><td><span lang="'+CFG.lang+'">'+x.l+'</span> '+x.c+'</td><td>'+x.lo+' to '+x.hi+' Hz</td><td><button type="button" class="dbgo" aria-label="Open in the sphere">&#9654;</button> <button type="button" class="dbgo dbdic" aria-label="Look up in a dictionary">Look up</button></td></tr>';}).join('');
  [].forEach.call(gb.children,function(b){b.className=b.dataset.g===grp?'on':'';});
  nn.innerHTML=r.length+' of '+W.length+' words. Tap a row to put it on the sphere. &ldquo;Look up&rdquo; sends the word to the dictionary box above the table.';
}
bd.addEventListener('click',function(e){var tr=e.target.closest('tr');if(!tr)return;if(e.target.classList.contains('dbdic')){var inp=document.querySelector('#read .rt-form input'),rd=document.getElementById('read');if(inp){inp.value=tr.dataset.w;if(rd)rd.scrollIntoView({behavior:'smooth'});}return;}SPHERE.load(tr.dataset.w);var c=document.getElementById('calc');if(c)c.scrollIntoView({behavior:'smooth'});});
host.querySelector('thead').addEventListener('click',function(e){var k=e.target.dataset&&e.target.dataset.k;if(!k)return;if(sortKey===k)dir=-dir;else{sortKey=k;dir=1;}draw();});
qi.addEventListener('input',function(){q=qi.value.trim().toLowerCase();draw();});
window.addEventListener('sphere-mode',draw);
if(window.SPHERE)draw();else window.addEventListener('sphere-ready',draw);

function layout(){var h=document.getElementById('splayout');if(!h||!window.SPHERE)return;var L=SPHERE.letters,B=['Units','Tens','Hundreds'],o='<table class="dbt lay"><thead><tr><th>Band</th>'+[1,2,3,4,5,6,7,8,9].map(function(i){return '<th>'+i+'</th>';}).join('')+'</tr></thead><tbody>';
 for(var b=0;b<3;b++){o+='<tr><th>'+B[b]+'</th>';for(var r=0;r<9;r++){var c=L[b*9+r];o+='<td><span class="ll" lang="'+CFG.lang+'">'+c+'</span><small>'+SPHERE.val(c)+'</small><small>'+Math.round(SPHERE.freq(c))+' Hz</small></td>';}o+='</tr>';}
 h.innerHTML=o+'</tbody></table>';}
window.addEventListener('sphere-mode',layout);
if(window.SPHERE)layout();else window.addEventListener('sphere-ready',layout);
})();
