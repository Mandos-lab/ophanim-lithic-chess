/* Word database table for the sphere pages: search, group filter, sortable columns, click a row to load the word into the sphere. */
(function(){
var host=document.getElementById('spdb');if(!host)return;
var W=window.SPHERE_WORDS||[],CFG=window.SPHERE_CFG,UI=CFG.ui||{},sortKey='',dir=1,grp='All',q='';
var groups=['All'].concat(W.map(function(w){return w[3];}).filter(function(g,i,a){return a.indexOf(g)===i;}));
host.innerHTML='<div class="dbbar"><input id="dbq" type="search" placeholder="'+(UI.search||'Search a word, meaning or number')+'" aria-label="Search the word list"><div class="dbg" id="dbg"></div></div><div class="dbscroll"><table class="dbt"><thead><tr><th data-k="w">'+(UI.dbHead?UI.dbHead[0]:'Word')+'</th><th data-k="s">'+(UI.dbHead?UI.dbHead[1]:'Say')+'</th><th data-k="e">'+(UI.dbHead?UI.dbHead[2]:'Meaning')+'</th><th data-k="v">'+(UI.dbHead?UI.dbHead[3]:'Value')+'</th><th data-k="b">'+(UI.dbHead?UI.dbHead[4]:'Bearing')+'</th><th data-k="c">'+(UI.dbHead?UI.dbHead[5]:'Sector')+'</th><th data-k="h">'+(UI.dbHead?UI.dbHead[6]:'Pitch range')+'</th><th></th></tr></thead><tbody id="dbb"></tbody></table></div><p class="dbn" id="dbn"></p>';
var gb=document.getElementById('dbg'),bd=document.getElementById('dbb'),qi=document.getElementById('dbq'),nn=document.getElementById('dbn');
groups.forEach(function(g){var b=document.createElement('button');b.type='button';b.textContent=(g==='All'&&UI.all)?UI.all:g;b.dataset.g=g;b.onclick=function(){grp=g;draw();};gb.appendChild(b);});
function rows(){return W.map(function(w){var i=window.SPHERE?SPHERE.info(w[0]):{total:0,bearing:0,sector:0,letter:'',hzLow:0,hzHigh:0,letters:[]};var say=w[1]||(CFG.translit?CFG.translit(i.letters,[],{}):'');
  return{w:w[0],s:say,e:w[2],g:w[3],v:i.total,b:i.bearing,c:i.sector,l:i.letter,lo:i.hzLow,hi:i.hzHigh};});}
function draw(){
  var r=rows().filter(function(x){return(grp==='All'||x.g===grp)&&(!q||(x.w+' '+x.s+' '+x.e+' '+x.v).toLowerCase().indexOf(q)>=0);});
  var kf={w:'w',s:'s',e:'e',v:'v',b:'b',c:'c',h:'lo',group:'g'}[sortKey]||'g';
  if(sortKey)r.sort(function(a,b){var x=a[kf],y=b[kf];return(x<y?-1:x>y?1:0)*dir||(a.v-b.v);});
  bd.innerHTML=r.map(function(x){return '<tr data-w="'+x.w+'"><td class="dbw" lang="'+CFG.lang+'" dir="'+CFG.dir+'">'+x.w+'</td><td>'+x.s+'</td><td>'+x.e+'</td><td class="dbv">'+x.v+'</td><td>'+x.b+'&deg;</td><td><span lang="'+CFG.lang+'">'+x.l+'</span> '+x.c+'</td><td dir="ltr" style="text-align:end">'+x.lo+' to '+x.hi+' Hz</td><td><button type="button" class="dbgo" aria-label="Open in the sphere">&#9654;</button> <button type="button" class="dbgo dbdic" aria-label="Look up in a dictionary">Look up</button></td></tr>';}).join('');
  [].forEach.call(gb.children,function(b){b.className=b.dataset.g===grp?'on':'';});
  nn.innerHTML=UI.dbn?UI.dbn(r.length,W.length):(r.length+' of '+W.length+' words. Tap a row to put it on the sphere. &ldquo;Look up&rdquo; sends the word to the dictionary box above the table.');
}
bd.addEventListener('click',function(e){var tr=e.target.closest('tr');if(!tr)return;if(e.target.classList.contains('dbdic')){var inp=document.querySelector('#read .rt-form input'),rd=document.getElementById('read');if(inp){inp.value=CFG.dictWord?CFG.dictWord(tr.dataset.w):tr.dataset.w;inp.dispatchEvent(new Event('input'));if(rd)rd.scrollIntoView({behavior:'smooth'});}return;}SPHERE.load(tr.dataset.w);var c=document.getElementById('calc');if(c)c.scrollIntoView({behavior:'smooth'});});
host.querySelector('thead').addEventListener('click',function(e){var k=e.target.dataset&&e.target.dataset.k;if(!k)return;if(sortKey===k)dir=-dir;else{sortKey=k;dir=1;}draw();});
qi.addEventListener('input',function(){q=qi.value.trim().toLowerCase();draw();});
window.addEventListener('sphere-mode',draw);
if(window.SPHERE)draw();else window.addEventListener('sphere-ready',draw);

function layout(){var h=document.getElementById('splayout');if(!h||!window.SPHERE)return;var L=SPHERE.letters,C=CFG.cols||9,B=CFG.bands||['Units','Tens','Hundreds'],o='<table class="dbt lay"><thead><tr><th>Band</th>';
 for(var i=1;i<=C;i++)o+='<th>'+i+'</th>';o+='<th>Sum</th></tr></thead><tbody>';
 for(var b=0;b<B.length;b++){o+='<tr><th>'+B[b]+'</th>';var sm=0;for(var r=0;r<C;r++){var c=L[b*C+r];sm+=SPHERE.val(c);o+='<td><span class="ll" lang="'+CFG.lang+'">'+c+'</span><small>'+SPHERE.val(c)+'</small><small>'+Math.round(SPHERE.freq(c))+' Hz</small></td>';}o+='<td><b>'+sm+'</b></td></tr>';}
 if(L.length>B.length*C){var xs=L.slice(B.length*C),sx=0;o+='<tr><th>'+((CFG.ui&&CFG.ui.pole)||'Pole')+'</th>';xs.forEach(function(c){sx+=SPHERE.val(c);o+='<td colspan="'+C+'"><span class="ll" lang="'+CFG.lang+'">'+c+'</span> <small style="display:inline">'+SPHERE.val(c)+' · '+Math.round(SPHERE.freq(c))+' Hz</small></td>';});o+='<td><b>'+sx+'</b></td></tr>';}
 h.innerHTML=o+'</tbody></table>';}
window.addEventListener('sphere-mode',layout);
if(window.SPHERE)layout();else window.addEventListener('sphere-ready',layout);
})();
