const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'../ui/FadeYin拉片日记.html'),'utf8');
const line=html.split(/\r?\n/).find(x=>x.startsWith('const defaults='));
const tree=vm.runInNewContext(line+';defaults()');
assert.equal(tree.axis,'v');assert.equal(tree.b,'study');assert.equal(tree.a.a,'library');assert.equal(tree.a.b.a,'player');assert.equal(tree.a.b.b.a,'timeline');assert.equal(tree.a.b.b.b,'settings');
const leaves=[];function visit(n){if(typeof n==='string')leaves.push(n);else{visit(n.a);visit(n.b)}}visit(tree);assert.equal(new Set(leaves).size,5);
assert.ok(html.includes("const key='fadeyin.dock.v3'"));assert.ok(!html.includes("key:'s',shift:true"));assert.ok(!html.includes("key:'y',mod:true"));
console.log('PASS five-panel default: upper library/player/timeline/settings, full-width lower study; independent v3 persistence; redundant shortcuts removed. Source model, not rendered layout.');
