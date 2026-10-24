/* Futhark sphere settings. The 24 runes of the Elder Futhark in the order of the Kylver Stone, valued 1 to 24 by place in the row.
   24 nodes = 3 bands (the three aettir of 8) x 8 longitudes of 45 degrees. Latin letters are read by sound. */
(function(){
var L='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');
var V=[];for(var i=1;i<=24;i++)V.push(i);
var NAME={'ᚠ':'fehu','ᚢ':'uruz','ᚦ':'thurisaz','ᚨ':'ansuz','ᚱ':'raidho','ᚲ':'kenaz','ᚷ':'gebo','ᚹ':'wunjo','ᚺ':'hagalaz','ᚾ':'nauthiz','ᛁ':'isa','ᛃ':'jera','ᛇ':'eihwaz','ᛈ':'perthro','ᛉ':'algiz','ᛊ':'sowilo','ᛏ':'tiwaz','ᛒ':'berkano','ᛖ':'ehwaz','ᛗ':'mannaz','ᛚ':'laguz','ᛜ':'ingwaz','ᛞ':'dagaz','ᛟ':'othala'};
var TR={'ᚠ':'f','ᚢ':'u','ᚦ':'th','ᚨ':'a','ᚱ':'r','ᚲ':'k','ᚷ':'g','ᚹ':'w','ᚺ':'h','ᚾ':'n','ᛁ':'i','ᛃ':'j','ᛇ':'ei','ᛈ':'p','ᛉ':'z','ᛊ':'s','ᛏ':'t','ᛒ':'b','ᛖ':'e','ᛗ':'m','ᛚ':'l','ᛜ':'ng','ᛞ':'d','ᛟ':'o'};
/* Latin letters by sound. Two-letter sounds first. */
var LAT={'a':'ᚨ','b':'ᛒ','c':'ᚲ','d':'ᛞ','e':'ᛖ','f':'ᚠ','g':'ᚷ','h':'ᚺ','i':'ᛁ','j':'ᛃ','k':'ᚲ','l':'ᛚ','m':'ᛗ','n':'ᚾ','o':'ᛟ','p':'ᛈ','q':'ᚲ','r':'ᚱ','s':'ᛊ','t':'ᛏ','u':'ᚢ','v':'ᚠ','w':'ᚹ','x':'ᚲᛊ','y':'ᛃ','z':'ᛉ','þ':'ᚦ','ð':'ᚦ','ø':'ᛟ','ö':'ᛟ','ǫ':'ᛟ','æ':'ᚨᛖ'};
function parse(s,M){
  s=String(s||'').toLowerCase().replace(/ǫ/g,'o').replace(/ø/g,'o').replace(/æ/g,'ae').replace(/þ|ð/g,'th').normalize('NFD').replace(/[̀-ͯ]/g,'');
  var a=Array.from(s),o=[];
  for(var i=0;i<a.length;i++){var c=a[i];
    if(c===' '){o.push(' ');continue;}
    if(M[c]!==undefined){o.push(c);continue;}
    if(c==='t'&&a[i+1]==='h'){o.push('ᚦ');i++;continue;}
    if(c==='n'&&a[i+1]==='g'){o.push('ᛜ');i++;continue;}
    var r=LAT[c];if(r){Array.from(r).forEach(function(x){o.push(x);});}
  }
  return o;}
function translit(arr){var s='';for(var i=0;i<arr.length;i++){var c=arr[i];s+=(c===' '?' ':(TR[c]||''));}return s;}
function dictWord(w){return Array.from(String(w||'')).map(function(c){return TR[c]!==undefined?TR[c]:c;}).join('').trim();}
/* Old Norse headings as they appear in dictionaries (accents kept). Used by the "Old Norse spelling" dictionary choice. */
var NORSE={'bifrost':'Bifrǫst','mjolnir':'Mjǫllnir','odin':'Óðinn','thor':'Þórr','freyr':'Freyr','freyja':'Freyja','frigg':'Frigg','baldr':'Baldr','loki':'Loki','tyr':'Týr','heimdall':'Heimdallr','yggdrasil':'Yggdrasill','midgard':'Miðgarðr','asgard':'Ásgarðr','valhalla':'Valhǫll','ragnarok':'Ragnarǫk','run':'rún','urd':'Urðr','skald':'skáld','galdr':'galdr','sol':'sól','mani':'máni','dagr':'dagr','natt':'nótt','eldr':'eldr','is':'ís','mann':'maðr','vatn':'vatn','ar':'ár','god':'goð','edda':'Edda'};
/* the rune names in the usual Proto-Germanic reconstruction (as in the Elder Futhark article); several are uncertain */
var PG={'fehu':'fehu','uruz':'ūruz','thurisaz':'þurisaz','ansuz':'ansuz','raidho':'raidō','kenaz':'kauną','gebo':'gebō','wunjo':'wunjō','hagalaz':'hagalaz','nauthiz':'naudiz','isa':'īsaz','jera':'jēra','eihwaz':'īhwaz','perthro':'perþō','algiz':'algiz','sowilo':'sōwilō','tiwaz':'tīwaz','berkano':'berkanan','ehwaz':'ehwaz','mannaz':'mannaz','laguz':'laguz','ingwaz':'ingwaz','dagaz':'dagaz','othala':'ōþala'};
function pg(w){var l=dictWord(w).toLowerCase();return PG[l]||NORSE[l]||l;}
function norse(w){var l=dictWord(w).toLowerCase();return NORSE[l]||l;}
/* the plain spelling with a capital where the Old Norse heading has one (Wiktionary is case-sensitive: Bifrost, not bifrost) */
function cap(w){var l=dictWord(w).toLowerCase(),n=NORSE[l]||l;return (n.charAt(0)!==n.charAt(0).toLowerCase()&&l)?l.charAt(0).toUpperCase()+l.slice(1):l;}
function extra(t){var o=[];if(!t)return o;var n=t%36||36;o.push('engine node '+n+' ('+n*10+'°)');if(t===300)o.push('the whole row, 1 to 24');return o;}
window.SPHERE_CFG={letters:L,values:V,names:NAME,lang:'non',dir:'ltr',sample:'thor',label:'Type Latin letters (read by sound) or tap runes',kbd:'Rune keyboard',
 voice:/^$/,voiceName:'Old Norse',speakLatin:true,sayNote:'No voice exists for Elder Futhark, so the word is spoken from its Latin spelling by your device’s own voice.',dictWord:dictWord,norse:norse,pg:pg,cap:cap,
 cols:8,lat:[30,0,-30],ratio:[1,9/8,5/4,4/3,3/2,5/3,15/8,2],bands:['Freyr’s ætt','Hagal’s ætt','Tiwaz’s ætt'],extra:extra,
 font:'14px "Noto Sans Runic","Segoe UI Historic","Segoe UI Symbol",serif',parse:parse,translit:translit};
window.SPHERE_TR=translit;
})();
