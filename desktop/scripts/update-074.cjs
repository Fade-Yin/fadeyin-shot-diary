const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');
for(const file of ['package.json','package-lock.json']){const p=path.join(root,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('"version": "0.7.3"','"version": "0.7.4"'))}
const p=path.join(root,'ui/FadeYin拉片日记.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('<script src="playback-tools.js"></script>','<script src="playback-tools.js"></script><script src="global-settings.js"></script>'));
