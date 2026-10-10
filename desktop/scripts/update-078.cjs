const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
for(const file of ['package.json','package-lock.json']){const p=path.join(root,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('"version": "0.7.7"','"version": "0.7.8"'))}
const p=path.join(root,'ui/FadeYin拉片日记.html');let html=fs.readFileSync(p,'utf8');
html=html.replace(/<label class="check"><input id="splitClips"[\s\S]*?<\/label>/,'');
html=html.replace("$('#saveClipsBtn').classList.toggle('hidden',!$('#splitClips').checked);",'');
html=html.replace(/^.*\$\('#splitClips'\)\.addEventListener.*\r?\n/m,'');
if(html.includes('splitClips'))throw new Error('Legacy checkbox dependency remains');
fs.writeFileSync(p,html);
