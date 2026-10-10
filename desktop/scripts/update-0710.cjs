const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
for(const file of ['package.json','package-lock.json']){const p=path.join(root,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('"version": "0.7.9"','"version": "0.7.10"'))}
const p=path.join(root,'ui/FadeYin拉片日记.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('<span class="desktopOnly">FFmpeg 分析</span>',''));
