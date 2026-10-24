/* Read the source + dictionary lookup. Opens the reader's own sites in a new tab; nothing is hosted here. */
(function(){
var st=document.createElement('style');st.textContent='#read .rt-box{border:1px solid var(--line);background:var(--panel);padding:16px 18px;margin-top:18px}#read .rt-box h3{font-family:var(--title);font-weight:500;font-size:24px;margin:0 0 6px}#read .rt-box p{max-width:70ch;font-size:16px}#read .rt-form{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px}#read .rt-form input[type=text]{flex:1;min-width:200px;font:inherit;font-size:20px;padding:9px 12px;background:rgba(255,255,255,.03);border:1px solid rgba(232,195,117,.4);color:inherit;border-radius:8px}#read .rt-form select,#read .rt-form button{font:13px var(--mono);letter-spacing:.06em;color:var(--gold);background:none;border:1px solid rgba(232,195,117,.45);border-radius:6px;padding:10px 14px;cursor:pointer}#read .rt-form select{max-width:100%}#read .rt-form select option{background:#071118}#read .links{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}#read .links a{white-space:normal}';document.head.appendChild(st);
document.querySelectorAll('#read .rt-form').forEach(function(f){
 var el=document.documentElement.lang==='el',inp=f.querySelector('input'),sel=f.querySelector('select');
 var mean=document.createElement('p');mean.className='rt-mean dim';mean.style.cssText='margin-top:10px;font-size:16px';f.parentNode.insertBefore(mean,f.nextSibling);
 function showMean(){var C=window.SPHERE_CFG,v=inp.value.trim(),W=window.SPHERE_WORDS||[];if(C&&C.dictWord)v=C.dictWord(v);v=v.toLowerCase();var m=null;
  for(var i=0;i<W.length;i++){if(String(W[i][0]).toLowerCase()===v||(W[i][1]&&String(W[i][1]).toLowerCase()===v)){m=W[i];break;}}
  mean.innerHTML=m?('<b>'+(el?'Στη λίστα λέξεων':'In the word list')+':</b> '+(m[2]||'')+' <span style="color:var(--ink-3)">('+m[3]+')</span>'):'';}
 inp.addEventListener('input',showMean);f.addEventListener('rt-fill',showMean);
 function mk(t,fn){var b=document.createElement('button');b.type='button';b.textContent=t;b.addEventListener('click',fn);f.appendChild(b);}
 if(document.getElementById('calc'))mk(el?'Λέξη από τον υπολογιστή':'Take the calculator\u2019s word',function(){var h=document.getElementById('hyin');if(h){var v=h.value.trim(),C=window.SPHERE_CFG;inp.value=C&&C.dictWord?C.dictWord(v):v;showMean();}});

 /* live definition from Wiktionary (read-only, fetched in the reader's own browser) */
 var out=document.createElement('div');out.className='rt-def';out.style.cssText='margin-top:10px;font-size:16px;max-width:70ch';mean.parentNode.insertBefore(out,mean.nextSibling);
 function txt(h){var d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim();}
 function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML;}
 function titles(){var C=window.SPHERE_CFG||{},w=inp.value.trim(),l=w.toLowerCase();if(C.dictWord){w=C.dictWord(w);l=w.toLowerCase();}var t=[];
  if(C.pg){var g=C.pg(w);if(g&&g!==l)t.push('Reconstruction:Proto-Germanic/'+g);}
  var c=C.cap?C.cap(l):l;[inp.value.trim(),c,l,C.norse?C.norse(l):null].forEach(function(x){if(x&&t.indexOf(x)<0)t.push(x);});return t;}
 function tryT(a,i){if(i>=a.length){out.innerHTML='<i>'+(el?'Δεν βρέθηκε ορισμός. Δοκιμάστε τους συνδέσμους παρακάτω.':'No definition found here. Try the search options above.')+'</i>';return;}
  fetch('https://en.wiktionary.org/api/rest_v1/page/definition/'+encodeURIComponent(a[i])).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
   var h='',n=0;Object.keys(j).forEach(function(k){(j[k]||[]).forEach(function(e){if(n>=4)return;var d=(e.definitions||[]).slice(0,3).map(function(x){return txt(x.definition||'');}).filter(Boolean);if(!d.length)return;n++;
    h+='<p style="margin:8px 0 2px"><b>'+esc(e.language||k)+'</b> <span style="color:var(--ink-3)">'+esc(e.partOfSpeech||'')+'</span></p><ol style="margin:0 0 0 20px">'+d.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol>';});});
   if(!n)throw 0;out.innerHTML='<p style="margin:0;color:var(--ink-3)">Wiktionary: '+esc(decodeURIComponent(encodeURIComponent(a[i])))+'</p>'+h;}).catch(function(){tryT(a,i+1);});}
 mk(el?'Ορισμός εδώ':'Show definition here',function(){if(!inp.value.trim())return;out.innerHTML='<i>…</i>';tryT(titles(),0);});
 inp.addEventListener('input',function(){out.innerHTML='';});
 if(document.getElementById('spdb'))mk(el?'Στη σφαίρα':'Put it on the sphere',function(){var w=inp.value.trim();if(window.SPHERE&&w)SPHERE.load(w);var c=document.getElementById('calc');if(c)c.scrollIntoView({behavior:'smooth'});});

 f.addEventListener('submit',function(e){e.preventDefault();var w=f.querySelector('input').value.trim().toLowerCase();if(!w)return;var tpl=f.querySelector('select').value;var C=window.SPHERE_CFG;if(C&&C.dictWord)w=C.dictWord(w).toLowerCase();if(C&&C.cap)w=C.cap(w);var n=(C&&C.norse)?C.norse(w):w,pgf=(C&&C.pg)?C.pg(w):w;window.open(tpl.replace('{p}',encodeURIComponent(pgf)).replace('{l}',encodeURIComponent(w.toLowerCase())).replace('{w}',encodeURIComponent(w)).replace('{n}',encodeURIComponent(n)),'_blank','noopener');});
});
})();
