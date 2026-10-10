const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
for(const file of ['package.json','package-lock.json']){const p=path.join(root,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('"version": "0.7.19"','"version": "0.7.20"'))}
const p=path.join(root,'ui/FadeYin拉片日记.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('<script src="project-covers.js"></script>','<script src="project-covers.js"></script><script src="layout-presets.js"></script>'));
