/* Find a Greek word in the Greek New Testament (Byzantine text). The text loads on first search. */
(function(){
var box=document.getElementById('ntbox');if(!box)return;
var inp=box.querySelector('input'),out=box.querySelector('.nt-out'),loaded=null,shown=0,res=[],stem='',ex=false;
function norm(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/ς/g,'σ').replace(/[^α-ω\s]/g,'');}
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function load(cb){if(window.NT_GREEK)return cb();if(loaded){loaded.push(cb);return;}loaded=[cb];var s=document.createElement('script');s.src='nt-greek.js';s.onload=function(){var q=loaded;loaded=null;q.forEach(function(f){f();});};s.onerror=function(){loaded=null;out.innerHTML='<p class="dim">The text could not be loaded. Check that nt-greek.js is on the site.</p>';};document.head.appendChild(s);}
function hl(t,q){var words=t.split(' '),h=[];words.forEach(function(w){var n=norm(w).trim();h.push((ex?n===q:n.indexOf(q)===0)?'<mark>'+esc(w)+'</mark>':esc(w));});return h.join(' ');}
function more(){var T=window.NT_GREEK,e=Math.min(res.length,shown+60),h='';for(var i=shown;i<e;i++){var v=T.v[res[i]],b=T.b[v[0]];
 h+='<div class="nt-r"><div class="nt-ref"><b>'+b+' '+v[1]+':'+v[2]+'</b> <a href="https://biblehub.com/interlinear/'+T.s[v[0]]+'/'+v[1]+'.htm" target="_blank" rel="noopener noreferrer">Greek with English, chapter</a></div><div lang="grc" class="nt-t">'+hl(v[3],stem)+'</div></div>';}
 shown=e;out.querySelector('.nt-list').insertAdjacentHTML('beforeend',h);out.querySelector('.nt-more').style.display=shown<res.length?'':'none';}
function run(){var raw=inp.value.trim();stem=norm(raw).trim().split(/\s+/)[0]||'';if(!stem){out.innerHTML='';return;}
 var exact=box.querySelector('input[name=ntm]:checked').value==='exact';ex=exact;
 load(function(){var T=window.NT_GREEK,per=T.b.map(function(){return 0;}),n=0;res=[];shown=0;
  T.v.forEach(function(v,i){var hit=false;v[3].split(' ').forEach(function(w){var q=norm(w).trim();if(exact?q===stem:q.indexOf(stem)===0){n++;per[v[0]]++;hit=true;}});if(hit)res.push(i);});
  var sum=T.b.map(function(b,i){return per[i]?b+' '+per[i]:'';}).filter(Boolean).join(' &middot; ');
  out.innerHTML='<p class="nt-sum"><b>'+n+'</b> '+(n===1?'occurrence':'occurrences')+' in <b>'+res.length+'</b> '+(res.length===1?'verse':'verses')+' of the New Testament. '+(n?'<span class="dim">'+sum+'</span>':'Try fewer letters, or the stem without endings.')+'</p><div class="nt-list"></div><button type="button" class="nt-more">Show more</button>';
  out.querySelector('.nt-more').addEventListener('click',more);more();});}
box.querySelector('.nt-form').addEventListener('submit',function(e){e.preventDefault();run();});
var d=box.querySelector('.nt-dic');if(d)d.addEventListener('click',function(){var o=document.querySelector('#read .rt-form input');if(o&&o.value){inp.value=o.value;run();}});
})();
