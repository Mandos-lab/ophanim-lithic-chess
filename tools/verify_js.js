// Cross-check: the page's own JavaScript calculator vs data/*.json (built by build_data.py). Run with playwright.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let bad=0,n=0;
const base=process.argv[2],data=process.argv[3];
for(const [sp,page] of [['greek','greek-sphere'],['hebrew','hebrew-sphere'],['futhark','futhark-sphere']]){
 const p=await b.newPage();await p.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
 await p.goto('file://'+base+'/'+page+'.html');await p.waitForTimeout(900);
 const D=JSON.parse(fs.readFileSync(data+'/'+sp+'.json','utf8')).words;
 const res=await p.evaluate(ws=>ws.map(w=>{const i=SPHERE.info(w);return [i.total,i.bearing,i.sector,i.hzLow,i.hzHigh]}),D.map(r=>r.text));
 D.forEach((r,k)=>{n++;const a=res[k],e=[r.value,r.bearing_360,r.sector,r.hz_low,r.hz_high];if(JSON.stringify(a)!==JSON.stringify(e)){bad++;console.log('MISMATCH',sp,r.text,a,e)}});
 await p.close()}
// Armenian: type each word into the page calculator
const p=await b.newPage();await p.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
await p.goto('file://'+base+'/carl-tate-codex.html');await p.waitForTimeout(1200);
await (await p.$('#calc')).scrollIntoViewIfNeeded();await p.waitForTimeout(800);
const A=JSON.parse(fs.readFileSync(data+'/armenian.json','utf8')).words;
for(const r of A){const out=await p.evaluate(w=>{const i=document.getElementById('hyin');i.value=w;i.dispatchEvent(new Event('input'));return [parseInt(document.getElementById('hysum').textContent),document.getElementById('hyang').textContent]},r.text);
 const m=/bearing (\d+)°.*sector (\d+)/.exec(out[1]);n++;if(out[0]!==r.value||!m||+m[1]!==r.bearing_360||+m[2]!==r.sector){bad++;console.log('MISMATCH armenian',r.text,out,[r.value,r.bearing_360,r.sector])}}
console.log('checked',n,'words; mismatches',bad);await b.close()})();
