const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(path.join(__dirname,'../ui',n),'utf8');
const html=read('FadeYin拉片日记.html'),toolbar=read('toolbar-panels.js');
const remove=vm.runInNewContext('('+html.match(/function remove\(n,id\)\{[^\n]+/)[0]+')');
const defaults=vm.runInNewContext(html.match(/const defaults=\(\)=>([^\n]+);/)[1]);
function leaves(n){return typeof n==='string'?[n]:[...leaves(n.a),...leaves(n.b)]}
const before=JSON.stringify(defaults),visible=remove(defaults,'settings');
assert.deepEqual(leaves(visible),['library','player','timeline','study']);
assert.equal(JSON.stringify(defaults),before,'Saved layout stays backwards compatible');
assert.equal(visible.b,'study','Study remains full width');
for(const id of ['reportBtn','exportLapBtn','feishuBtn','saveClipsBtn','exportStillsBtn','revealStillsBtn','stillPosition'])assert(toolbar.includes(id),id+' preserved');
assert(html.includes('exportsInToolbar?remove(tree,\'settings\'):tree'));
assert(html.includes('script src="toolbar-panels.js"'));
new vm.Script(toolbar);new vm.Script(read('layout-presets.js'));
console.log('PASS visible layout pruning, saved-layout preservation, export-control wiring guards and syntax (not native UI acceptance)');
