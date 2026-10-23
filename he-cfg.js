/* Hebrew sphere settings. 22 letters + 5 final forms (sofit) = 27, the same nine-by-three plan as the Greek. */
(function(){
var L='אבגדהוזחטיכלמנסעפצקרשתךםןףץ'.split('');
var V=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,20,40,50,80,90];
var SOF=[['ך',500],['ם',600],['ן',700],['ף',800],['ץ',900]];
var FIN={'כ':'ך','מ':'ם','נ':'ן','פ':'ף','צ':'ץ'};
var NAME={'א':'alef','ב':'bet','ג':'gimel','ד':'dalet','ה':'he','ו':'vav','ז':'zayin','ח':'chet','ט':'tet','י':'yod','כ':'kaf','ל':'lamed','מ':'mem','נ':'nun','ס':'samekh','ע':'ayin','פ':'pe','צ':'tsadi','ק':'qof','ר':'resh','ש':'shin','ת':'tav','ך':'final kaf','ם':'final mem','ן':'final nun','ף':'final pe','ץ':'final tsadi'};
function parse(s,M){
  s=String(s||'').replace(/[֑-ׇ]/g,'');
  var o=[],a=Array.from(s);
  for(var i=0;i<a.length;i++){var c=a[i];if(/\s/.test(c)){o.push(' ');continue;}if(M[c]===undefined)continue;
    var nx=a.slice(i+1).filter(function(x){return M[x]!==undefined||/\s/.test(x);})[0];var wordEnd=(nx===undefined||/\s/.test(nx));
    if(FIN[c]&&wordEnd)c=FIN[c];o.push(c);}
  return o;}
var SP={'א':'a','ב':'b','ג':'g','ד':'d','ה':'h','ו':'v','ז':'z','ח':'kh','ט':'t','י':'y','כ':'kh','ל':'l','מ':'m','נ':'n','ס':'s','ע':'a','פ':'p','צ':'ts','ק':'k','ר':'r','ש':'sh','ת':'t','ך':'kh','ם':'m','ן':'n','ף':'f','ץ':'ts'};
function translit(arr,words,M){
  var w=arr.join('').replace(/ /g,' ');
  for(var i=0;i<(words||[]).length;i++){if(parse(words[i][0],M||{}).join('')===w&&words[i][1])return words[i][1];}
  return arr.map(function(c){return c===' '?' ':(NAME[c]||'').replace('final ','')+' ';}).join('');}
window.SPHERE_CFG={letters:L,values:V,sofit:SOF,names:NAME,lang:'he',dir:'rtl',sample:'אור',label:'Type or tap Hebrew letters (vowel points are ignored)',kbd:'Hebrew keyboard',
 voice:/^(he|iw)/i,voiceName:'Hebrew',font:'14px "Noto Serif Hebrew","Frank Ruhl Libre",serif',parse:parse,translit:translit};
})();
