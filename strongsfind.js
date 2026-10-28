/* Find Greek and Hebrew words from an English word, using Strong's dictionaries. Data loads on first search. */
(function(){
var box=document.getElementById('sfbox');if(!box)return;
var inp=box.querySelector('input[type=text]'),out=box.querySelector('.sf-out'),pending=null,own=box.getAttribute('data-own')||'G';
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function load(cb){if(window.STRONGS)return cb();if(pending){pending.push(cb);return;}pending=[cb];out.innerHTML='<p class="dim"><i>Loading the dictionaries…</i></p>';var s=document.createElement('script');s.src='strongs.js';s.onload=function(){var q=pending;pending=null;q.forEach(function(f){f();});};s.onerror=function(){pending=null;out.innerHTML='<p><i>The dictionary file could not be loaded (strongs.js).</i></p>';};document.head.appendChild(s);}
function tokens(q){return q.toLowerCase().replace(/[^a-z' -]/g,' ').split(/\s+/).filter(function(x){return x.length>1;});}
function has(text,t){return new RegExp('(^|[^a-z])'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(text);}
function plain(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[ʼʻ'\u02bc\u02bb\u2019]/g,'').toLowerCase();}
function forms(tr){var p=plain(tr).replace(/[^a-z]/g,'');var f=[p];var q=p.replace(/ow/g,'o').replace(/aw/g,'a');if(q!==p)f.push(q);return f;}
function tmatch(tr,t){var T=t.replace(/[^a-z]/g,''),ts=[T];if(/(im|ot|s)$/.test(T)&&T.length>4)ts.push(T.replace(/(im|ot|s)$/,''));
 return forms(tr).some(function(f){return f.length>=3&&ts.some(function(x){return x.length>=3&&(x===f||(f.length>=4&&x.indexOf(f)===0)||(x.length>=4&&f.indexOf(x)===0));});});}
function texact(tr,t){var T=t.replace(/[^a-z]/g,'');return forms(tr).indexOf(T)>=0||forms(tr).indexOf(T.replace(/(im|ot|s)$/,''))>=0&&T.length>4;}
function search(list,tk){var r=[];list.forEach(function(e){var def=e[3].toLowerCase(),kj=e[4].toLowerCase(),sc=0,ok=true;
 tk.forEach(function(t){var a=has(kj,t),b=has(def,t),c=tmatch(e[2]||'',t);if(!a&&!b&&!c){ok=false;return;}if(c)sc+=6;if(c&&texact(e[2]||'',t))sc+=10;if(a)sc+=3;if(b)sc+=1;if(new RegExp('^\\W*'+t).test(kj))sc+=3;if(new RegExp('^\\W*'+t).test(def))sc+=1;});
 if(ok)r.push([sc,e]);});r.sort(function(x,y){return y[0]-x[0]||x[1][0]-y[1][0];});return r.map(function(x){return x[1];});}
function noNiq(s){return s.replace(/[֑-ׇ]/g,'');}
function stem(l){var s=l.replace(/[ᾳῃῳ]/g,function(c){return {'ᾳ':'α','ῃ':'η','ῳ':'ω'}[c];});return s.length>3?s.slice(0,-1):s;}
function row(e,k){var heb=k==='H',lem=e[1];
 return '<div class="sf-r"><div class="sf-h"><span class="sf-l" lang="'+(heb?'he':'el')+'" dir="'+(heb?'rtl':'ltr')+'">'+esc(lem)+'</span> <i>'+esc(e[2])+'</i> <span class="sf-n">'+k+e[0]+'</span></div><div>'+esc(e[3])+(e[5]?' <span class="dim">('+esc(e[5])+')</span>':'')+'</div>'+(e[4]?'<div class="dim">KJV: '+esc(e[4])+'</div>':'')+
 '<div class="sf-b"><button type="button" data-a="dic" data-w="'+esc(heb?noNiq(lem):lem)+'">To the dictionary</button>'+(heb?'':'<button type="button" data-a="lxx" data-w="'+esc(stem(lem))+'">Find in the Septuagint</button>')+'</div></div>';}
var G=[],H=[],shownG=0,shownH=0;
function more(k){var L=k==='G'?G:H,sh=k==='G'?shownG:shownH,e=Math.min(L.length,sh+12),h='';for(var i=sh;i<e;i++)h+=row(L[i],k);var c=out.querySelector('.sf-'+k);c.querySelector('.sf-list').insertAdjacentHTML('beforeend',h);if(k==='G')shownG=e;else shownH=e;c.querySelector('.sf-more').style.display=e<L.length?'':'none';}
function run(){var tk=tokens(inp.value);if(!tk.length){out.innerHTML='';return;}
 load(function(){var D=window.STRONGS;G=search(D.G,tk);H=search(D.H,tk);shownG=shownH=0;
  function sect(k,name,n){return '<div class="sf-'+k+'"><h4>'+name+' <span class="dim">('+n+')</span></h4><div class="sf-list"></div><button type="button" class="sf-more">Show more</button></div>';}
  var gs=sect('G','Greek',G.length),hs=sect('H','Hebrew',H.length);
  out.innerHTML=(own==='G'?gs+hs:hs+gs);
  ['G','H'].forEach(function(k){out.querySelector('.sf-'+k+' .sf-more').addEventListener('click',function(){more(k);});more(k);});});}
box.querySelector('.sf-form').addEventListener('submit',function(e){e.preventDefault();run();});
out.addEventListener('click',function(e){var b=e.target.closest('button[data-a]');if(!b)return;var w=b.getAttribute('data-w'),a=b.getAttribute('data-a');
 if(a==='dic'){var di=document.querySelector('#read .rt-form input');if(di){di.value=w;di.dispatchEvent(new Event('input',{bubbles:true}));di.closest('form').dispatchEvent(new Event('rt-fill'));di.closest('.rt-box').scrollIntoView({behavior:'smooth',block:'center'});}}
 if(a==='lxx'){var lb=document.getElementById('lxxbox');if(lb){var li=lb.querySelector('input[type=text]');li.value=w;lb.querySelector('input[value=stem]').checked=true;lb.querySelector('.lx-form').dispatchEvent(new Event('submit',{cancelable:true}));lb.scrollIntoView({behavior:'smooth'});}}});
})();
