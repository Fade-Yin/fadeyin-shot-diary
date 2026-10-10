const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
const file=path.join(root,'ui/FadeYin拉片日记.html');let html=fs.readFileSync(file,'utf8');
const match=html.match(/class="appMark" src="data:image\/png;base64,([^"]+)"/);
if(match){const old=Buffer.from(match[1],'base64');console.log('Previous UI icon:',old.readUInt32BE(16),old.readUInt32BE(20));}
html=html.replace(/(class="appMark" src=")data:image\/png;base64,[^"]+/, '$1app-icon.png');
html=html.replaceAll('开发者 Danny','开发者 Fadeyin').replaceAll('片拉拉 · Danny','开发者 Fadeyin');
// Close prompt must remain usable while the editor is busy.
html=html.replaceAll("e.target.closest('#cancelBtn')","e.target.closest('#cancelBtn,#windowCloseDialog')");
html=html.replaceAll('<script src="window-close.js"></script>','');
const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script src="window-close.js"></script>'+html.slice(end);
fs.writeFileSync(file,html);fs.copyFileSync(path.join(root,'assets/fadeyin-icon.png'),path.join(root,'ui/app-icon.png'));
const pkgPath=path.join(root,'package.json'),pkg=JSON.parse(fs.readFileSync(pkgPath));pkg.version='0.7.1';pkg.author='Fadeyin';
pkg.build.extraResources[0].filter=['*.html','*.js','*.css','*.png'];fs.writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n');
const lockPath=path.join(root,'package-lock.json'),lock=JSON.parse(fs.readFileSync(lockPath));lock.version=lock.packages[''].version='0.7.1';fs.writeFileSync(lockPath,JSON.stringify(lock,null,2)+'\n');
