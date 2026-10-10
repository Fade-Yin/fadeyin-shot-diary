const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
for(const file of ['package.json','package-lock.json']){const p=path.join(root,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('"version": "0.7.13"','"version": "0.7.14"'))}
const p=path.join(root,'ui/FadeYin拉片日记.html');let html=fs.readFileSync(p,'utf8');html=html.replace(/^.*key:'f',label:'F',text:'切换工作区全屏'.*\r?\n/m,'');fs.writeFileSync(p,html);
