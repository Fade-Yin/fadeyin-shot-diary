const assert=require('node:assert/strict');
const called=[],menus=require('../mac-menu.cjs').template(id=>called.push(id));
assert.deepEqual(menus.map(m=>m.label),['片拉拉','文件','编辑','显示','镜头','窗口','帮助']);
const commands=menus.flatMap(m=>m.submenu||[]).filter(x=>x.id);
assert.equal(new Set(commands.map(x=>x.id)).size,commands.length);
for(const item of commands)item.click();
assert.deepEqual(called,commands.map(x=>x.id));
for(const [id,key] of [['settings','Command+,'],['open','Command+O'],['undo','Command+Z'],['redo','Command+Shift+Z']])assert.equal(commands.find(x=>x.id===id).accelerator,key);
console.log('PASS macOS native menu order, dispatch, unique commands and standard Command shortcuts');
