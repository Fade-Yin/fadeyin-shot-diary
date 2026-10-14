const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.children=[];this.dataset={};this.classList={toggle(){}}}
 append(...x){this.children.push(...x)} replaceChildren(...x){this.children=x} setAttribute(){} querySelector(){return new Element()}
}
const doc={createElement:()=>new Element(),querySelector:()=>new Element(),body:new Element()};
const c={document:doc,window:{dispatchEvent(){},PianlalaPopover(){}},Event:class{},lapFields:[],lapPresets:{shotSize:['特写']},lapCustomOptions:{},lapMeta:{},columnWidths:{},applyModeView(){},renderLapTable(){},saveColumns(){},addLapCustomOption(){},saveLapNotes(){},sourceFile:{},appMode:'lap',busy:false,$:()=>new Element()};
vm.createContext(c);vm.runInContext(fs.readFileSync('ui/project-fields.js','utf8'),c);
assert.equal(c.lapFields.length,7);
const first=c.lapMeta;c.lapMeta._fields.push({key:'custom_test',label:'构图',type:'choice',options:['对称'],hidden:false});c.applyModeView();assert.equal(c.lapFields.at(-1)[1],'构图');assert.deepEqual(Array.from(c.lapPresets.custom_test),['对称']);
c.lapMeta._fields[0].hidden=true;c.applyModeView();assert(!c.lapFields.some(f=>f[0]==='shotSize'));
c.lapMeta={};c.applyModeView();assert.equal(c.lapFields.length,7);assert(!c.lapPresets.custom_test);
c.lapMeta=first;c.applyModeView();assert(c.lapFields.some(f=>f[0]==='custom_test'));assert(!c.lapFields.some(f=>f[0]==='shotSize'));
c.lapMeta._fields[0].hidden=false;c.applyModeView();assert(c.lapFields.some(f=>f[0]==='shotSize'));
c.addLapCustomOption('custom_test','居中');assert(c.lapMeta._fields.at(-1).options.includes('居中'));
c.columnWidths={};c.renderLapTable();assert.equal(c.columnWidths.custom_test,140);
c.lapMeta._fields.push({key:'custom_bad',label:'<img>',type:'text'});c.applyModeView();assert(!c.lapFields.some(f=>f[0]==='custom_bad'));
console.log('PASS default schema, project isolation, hide/restore, custom options, width reset and invalid label guard (DOM mock)');
