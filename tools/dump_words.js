// Dumps the four starter word lists (read from the site's own .js files) to JSON for build_data.py
const fs=require('fs'),path=require('path');
const base=process.argv[2];const out={};
function load(f,key){global.window={};eval(fs.readFileSync(path.join(base,f),'utf8'));return window[key];}
out.greek=load('gr-words.js','SPHERE_WORDS');out.hebrew=load('he-words.js','SPHERE_WORDS');out.futhark=load('fu-words.js','SPHERE_WORDS');
out.armenian=load('hy-words.js','HY_WORDS').map(r=>[r[0],r[1],r[2],'Starter list',r[3]]);
fs.writeFileSync(process.argv[3],JSON.stringify(out));
