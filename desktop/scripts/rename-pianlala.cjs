// Mechanical display-name migration. Persistent identifiers deliberately stay unchanged.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),file=path.join(root,'ui/FadeYin拉片日记.html');
let html=fs.readFileSync(file,'utf8');
html=html.replaceAll('FadeYin 拉片日记','片拉拉').replaceAll('FadeYin拉片日记','片拉拉').replaceAll('>FadeYin<','>片拉拉<');
html=html.replaceAll('FadeYin 镜头报告','片拉拉 镜头报告').replaceAll('FadeYin · Danny','片拉拉 · Danny').replaceAll('按场组织','按序列组织').replaceAll('手动序列','建立序列');
for(const [from,to] of [['分场','序列'],['场次','序列'],['本场','本序列'],['上一场','上一序列'],['各场','各序列'],['这一场','这一序列'],[' 场',' 个序列']])html=html.replaceAll(from,to);
html=html.replaceAll('未序列','未归入序列').replaceAll('如何序列','如何划分序列').replaceAll('在当前镜头前序列','在当前镜头前拆分').replaceAll('不会自动序列','不会自动划分序列');
html=html.replace('<h2>序列</h2>','<h2>序列分析</h2>').replace("run:()=>click('groupSceneBtn')","run:()=>click('groupSequenceBtn')");
if(!html.includes('src="sequence-analysis.js"'))html=html.replace('</script></body></html>','</script><script src="analysis-model.js"></script><script src="sequence-analysis.js"></script></body></html>');
if(!html.includes('href="sequence-analysis.css"'))html=html.replace('</head>','<link rel="stylesheet" href="sequence-analysis.css">\n</head>');
fs.writeFileSync(file,html);
const packageFile=path.join(root,'package.json'),pkg=JSON.parse(fs.readFileSync(packageFile));
pkg.version='0.7.0';pkg.description='片拉拉 - 镜头拆解与序列拉片分析';pkg.build.productName='片拉拉';
pkg.build.extraResources=[{from:'ui',to:'ui',filter:['*.html','*.js','*.css']}];
pkg.build.win.artifactName='Pianlala-Windows-Portable-${version}.${ext}';pkg.build.mac.artifactName='Pianlala-macOS-${arch}-${version}.${ext}';pkg.build.dmg.title='片拉拉';
fs.writeFileSync(packageFile,JSON.stringify(pkg,null,2)+'\n');
const lockFile=path.join(root,'package-lock.json'),lock=JSON.parse(fs.readFileSync(lockFile));lock.version=pkg.version;lock.packages[''].version=pkg.version;fs.writeFileSync(lockFile,JSON.stringify(lock,null,2)+'\n');
const check=path.join(root,'scripts/check-mac.cjs');let text=fs.readFileSync(check,'utf8');text=text.replaceAll("'FadeYin拉片日记.app'","'片拉拉.app'").replace("'MacOS','FadeYin拉片日记'","'MacOS','片拉拉'");fs.writeFileSync(check,text);
