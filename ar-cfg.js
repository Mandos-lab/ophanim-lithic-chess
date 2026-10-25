/* Arabic sphere settings. 28 letters in abjad order (ʾ-B-J-D), eastern (Mashriqi) values.
   Three bands of nine (units, tens, hundreds) + ghayn (1000) alone at the north pole = 28 nodes.
   Four depths: kabir (sum), bast (letter names spelled out), saghir (first digits), asghar (digital root). */
(function(){
var L='ابجدهوزحطيكلمنسعفصقرشتثخذضظغ'.split('');
var V=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000];
var NAME={'ا':'alif','ب':'ba','ج':'jim','د':'dal','ه':'ha','و':'waw','ز':'zay','ح':'ha (heavy)','ط':'ta (heavy)','ي':'ya','ك':'kaf','ل':'lam','م':'mim','ن':'nun','س':'sin','ع':'ayn','ف':'fa','ص':'sad','ق':'qaf','ر':'ra','ش':'shin','ت':'ta','ث':'tha','خ':'kha','ذ':'dhal','ض':'dad','ظ':'za (heavy)','غ':'ghayn'};
var SPELL={'ا':'ألف','ب':'باء','ج':'جيم','د':'دال','ه':'ها','و':'واو','ز':'زاي','ح':'حاء','ط':'طاء','ي':'ياء','ك':'كاف','ل':'لام','م':'ميم','ن':'نون','س':'سين','ع':'عين','ف':'فاء','ص':'صاد','ق':'قاف','ر':'راء','ش':'شين','ت':'تاء','ث':'ثاء','خ':'خاء','ذ':'ذال','ض':'ضاد','ظ':'ظاء','غ':'غين'};
var FOLD={'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ء':'ا','ة':'ه','ى':'ي','ؤ':'و','ئ':'ي'};
function parse(s,M){
  s=String(s||'').replace(/[ً-ٰٟـۖ-ۭ]/g,'');
  var o=[],a=Array.from(s);
  for(var i=0;i<a.length;i++){var c=a[i];if(/\s/.test(c)){o.push(' ');continue;}if(FOLD[c])c=FOLD[c];if(M[c]===undefined)continue;o.push(c);}
  return o;}
var VMAP={};L.forEach(function(c,i){VMAP[c]=V[i];});
function sumArr(arr){return arr.reduce(function(s,c){return s+(VMAP[c]||0);},0);}
var BAST={};L.forEach(function(c){BAST[c]=sumArr(parse(SPELL[c],VMAP));});
function root(n){while(n>9){n=String(n).split('').reduce(function(a,d){return a+(+d);},0);}return n;}
function translit(arr,words,M){
  var w=arr.join('');
  for(var i=0;i<(words||[]).length;i++){if(parse(words[i][0],M||VMAP).join('')===w&&words[i][1])return words[i][1];}
  return arr.map(function(c){return c===' '?' ':(NAME[c]||'').replace(/ \(heavy\)/,'')+' ';}).join('');}
function b(ar,en){return ar+' <small class="uien">'+en+'</small>';}
var DEPTHS=[
 {id:'kabir',ar:'الكبير',en:'Kabīr – the sum',tip:'Add the value of every letter.',per:function(c,M){return M[c];}},
 {id:'bast',ar:'البسط',en:'Basṭ – names spelled out',tip:'Spell each letter by its name (alif = ألف) and add all of those letters.',per:function(c){return BAST[c];}},
 {id:'saghir',ar:'الصغير',en:'Ṣaghīr – first digits',tip:'Add only the first digit of each letter value (30 counts 3, 400 counts 4).',per:function(c,M){return +String(M[c])[0];}},
 {id:'asghar',ar:'الأصغر',en:'Aṣghar – digital root',tip:'Add the letters, then add the digits of the total until one digit is left.',per:function(c,M){return M[c];},post:root}
];
window.ARABIC_BAST=BAST;window.ARABIC_SPELL=SPELL;
window.SPHERE_CFG={letters:L,values:V,names:NAME,lang:'ar',dir:'rtl',sample:'نور',
 label:b('اكتب حروفاً عربية أو المسها (تُهمل الحركات)','Type or tap Arabic letters (vowel marks are ignored)'),kbd:'لوحة الحروف العربية',
 voice:/^ar/i,voiceName:'Arabic',font:'16px "Amiri","Noto Naskh Arabic",serif',parse:parse,translit:translit,
 bands:['الآحاد – Units','العشرات – Tens','المئات – Hundreds'],depths:DEPTHS,
 sayNote:'لا يوجد صوت عربي في هذا الجهاز، فتُنطق الكلمة بحروف لاتينية. – This device has no Arabic voice, so the word is spoken from its Latin spelling.',
 ui:{play:b('شغّل النغمات','Play the frequencies'),say:b('انطق الكلمة','Speak the word'),stop:b('أوقف','Stop'),wlist:'قائمة الكلمات – Word list',
  cap:'اسحب لتدوير الكرة – المس عقدة لإضافة حرفها<br>Drag to turn – tap a node to add its letter',aria:'كرة ثلاثية الأبعاد مع بوصلة ٣٦٠ درجة',
  bearing:'الاتجاه (bearing)',sector:'القطاع (sector)',hi:'أعلى نغمة (highest)',lo:'أدنى (lowest)',depthAria:'عمق القراءة – reading depth',pole:'القطب – Pole',all:'الكل – All',search:'ابحث عن كلمة أو معنى أو عدد – Search a word, meaning or number',
  dbHead:['الكلمة – Word','النطق – Say','المعنى – Meaning','القيمة – Value','الاتجاه – Bearing','القطاع – Sector','النغمات – Pitch',''],
  dbn:function(a,b){return a+' من '+b+' كلمة. المس صفاً لوضع الكلمة على الكرة. – '+a+' of '+b+' words. Tap a row to put it on the sphere.';}}};
})();
