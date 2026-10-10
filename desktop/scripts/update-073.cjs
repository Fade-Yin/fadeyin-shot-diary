const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
function edit(p,fn){p=path.join(root,p);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')))}
edit('ui/FadeYin拉片日记.html',s=>s.replaceAll('开发者 Fadeyin','开发者 B站 Fadeyin').replace('<script src="window-close.js"></script>','<script src="window-close.js"></script><script src="playback-tools.js"></script>'));
edit('ui/sequence-analysis.js',s=>s.replace('>起始帧</option>','>第一帧</option>').replace('>一键导出静帧</button>','>导出所有镜头静帧</button>'));
for(const p of ['package.json','package-lock.json'])edit(p,s=>s.replaceAll('"version": "0.7.2"','"version": "0.7.3"'));
edit('scripts/test-close-071.cjs',s=>s.replace('开发者 Fadeyin','开发者 B站 Fadeyin'));
