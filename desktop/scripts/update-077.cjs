const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
for(const file of ['package.json','package-lock.json']){const p=path.join(root,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('"version": "0.7.6"','"version": "0.7.7"'))}
const p=path.join(root,'ui/FadeYin拉片日记.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('cover:p.shots?.[0]?.image','cover:p.meta?._projectCover').replace('<script src="workbench.js"></script>','<script src="workbench.js"></script><script src="project-covers.js"></script>'));
