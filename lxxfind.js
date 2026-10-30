/* Find a Greek word in the Septuagint (Torah). The text loads on first search. */
(function(){
var box=document.getElementById('lxxbox');if(!box)return;
var inp=box.querySelector('input'),out=box.querySelector('.lx-out'),st=box.querySelector('.lx-st'),loaded=null,shown=0,res=[],stem='',ex=false;
var BH=['genesis','exodus','leviticus','numbers','deuteronomy'];
function norm(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/ς/g,'σ').replace(/[^α-ω\s]/g,'');}
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function load(cb){if(window.LXX_TORAH)return cb();if(loaded){loaded.push(cb);return;}loaded=[cb];var s=document.createElement('script');s.src='lxx-torah.js';s.onload=function(){var q=loaded;loaded=null;q.forEach(function(f){f();});};s.onerror=function(){loaded=null;out.innerHTML='<p><i>The text file could not be loaded (lxx-torah.js).</i></p>';};document.head.appendChild(s);}
function hl(t,q){var words=t.split(' '),h=[];words.forEach(function(w){var n=norm(w).trim();h.push((ex?n===q:n.indexOf(q)===0)?'<mark>'+esc(w)+'</mark>':esc(w));});return h.join(' ');}
function more(){var T=window.LXX_TORAH,e=Math.min(res.length,shown+60),h='';for(var i=shown;i<e;i++){var r=res[i],v=T.v[r],b=T.b[v[0]],ch=String(v[1]);
 h+='<div class="lx-r"><div class="lx-ref"><b>'+b+' '+v[1]+':'+v[2]+'</b> <a href="https://biblehub.com/sepd/'+BH[v[0]]+'/'+v[1]+'.htm" target="_blank" rel="noopener noreferrer">Greek chapter</a> <a href="https://mechon-mamre.org/p/pt/pt0'+(v[0]+1)+(ch.length<2?'0':'')+ch+'.htm" target="_blank" rel="noopener noreferrer">Hebrew + English</a></div><div lang="grc" class="lx-t">'+hl(v[3],stem)+'</div></div>';}
 shown=e;var m=out.querySelector('.lx-list');m.insertAdjacentHTML('beforeend',h);var b=out.querySelector('.lx-more');b.style.display=shown<res.length?'':'none';}
function run(){var raw=inp.value.trim();stem=norm(raw).trim().split(/\s+/)[0]||'';if(!stem){out.innerHTML='';return;}
 var exact=box.querySelector('input[name=lxm]:checked').value==='exact';ex=exact;
 load(function(){var T=window.LXX_TORAH,per=[0,0,0,0,0],n=0;res=[];shown=0;
  T.v.forEach(function(v,i){var hit=false;v[3].split(' ').forEach(function(w){var q=norm(w).trim();if(exact?q===stem:q.indexOf(stem)===0){n++;per[v[0]]++;hit=true;}});if(hit)res.push(i);});
  var sum=T.b.map(function(b,i){return b+' '+per[i];}).join(' &middot; ');
  out.innerHTML='<p class="lx-sum"><b>'+n+'</b> '+(n===1?'occurrence':'occurrences')+' in <b>'+res.length+'</b> '+(res.length===1?'verse':'verses')+' of the Torah. '+(n?'<span class="dim">'+sum+'</span>':'Try fewer letters, or the stem without endings.')+'</p><div class="lx-list"></div><button type="button" class="lx-more">Show more</button>';
  out.querySelector('.lx-more').addEventListener('click',more);more();});}
box.querySelector('.lx-form').addEventListener('submit',function(e){e.preventDefault();run();});
function sw(){var o=document.getElementById('hyin');return o&&o.value.trim()?o:document.querySelector('#read .rt-form input');}
var d=box.querySelector('.lx-dic');if(d)d.addEventListener('click',function(){var o=sw();if(o&&o.value){inp.value=o.value;run();}});
/* the box follows the word on the sphere: whatever is put in the top box is carried here (and searched once this box has been used or the word changes) */
var last='',used=false;box.querySelector('.lx-form').addEventListener('submit',function(){used=true;});
setInterval(function(){var o=document.getElementById('hyin');if(!o)return;var v=o.value.trim();if(v===last)return;var first=(last==='');last=v;if(!v)return;inp.value=v;if(!first)run();},500);
})();
