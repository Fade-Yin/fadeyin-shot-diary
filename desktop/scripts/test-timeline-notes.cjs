const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class El{
 constructor(){this.dataset={};this.events={};this.children=[];this.value='';this.hidden=false}
 setAttribute(k,v){this[k]=v} append(...x){this.children.push(...x)}
 replaceChildren(...x){this.children=x}
 addEventListener(k,f){this.events[k]=f} querySelector(k){return nodes[k]}
 querySelectorAll(){return this.children.flatMap(x=>x.children).filter(x=>x.dataset.field)}
 contains(e){return this.querySelectorAll().includes(e)} closest(){return this}
 blur(){doc.activeElement=null}
}
const nodes={'.timelineNoteFields':new El(),h2:new El(),'.timelineNoteTime':new El(),p:new El(),button:new El()};
const track=new El(),doc={activeElement:null,createElement:()=>new El(),querySelectorAll:()=>[]};let writes=0;
const context={document:doc,window:{pianlalaStopTransport:()=>{}},lapFields:[['shotSize','景别','choice'],['note','备注','text']],video:new El(),shots:[{start:0,end:2},{start:2,end:4}],lapNotes:{0:{note:'已有表格记录'}},appMode:'timeline',busy:false,lapStorageKey:()=> 'project',frameFmt:String,render:()=>{},applyModeView:()=>{},saveLapNotes:()=>{},addLapCustomOption:()=>{},renderOverviewCurve:()=>{},addEventListener:()=>{},$:s=>s==='#trackMode'?track:{oninput:e=>{const i=+e.target.dataset.lapIndex;context.lapNotes[i]??={};context.lapNotes[i][e.target.dataset.field]=e.target.value;writes++}}};
context.video.currentTime=0;vm.createContext(context);vm.runInContext(fs.readFileSync('ui/timeline-notes.js','utf8'),context);
const field=nodes['.timelineNoteFields'],input=field.querySelectorAll()[1];
assert.equal(input.value,'已有表格记录');input.value='时间线填写';field.events.input({target:input});assert.equal(context.lapNotes[0].note,'时间线填写');
context.video.currentTime=2;context.video.events.seeked();assert.equal(input.dataset.lapIndex,'1');assert.equal(input.value,'');
input.value='第二镜头';field.events.input({target:input});assert.equal(context.lapNotes[1].note,'第二镜头');assert.equal(context.lapNotes[0].note,'时间线填写');
context.lapNotes[1].note='表格修改';context.applyModeView();assert.equal(input.value,'表格修改');
context.shots=[];context.render();assert(input.disabled);input.value='不可写';field.events.input({target:input});assert.equal(writes,2);
context.shots=[{start:0,end:4}];context.video.currentTime=4;context.render();assert.equal(input.dataset.lapIndex,'0');
nodes.button.onclick();assert(field.hidden);nodes.button.onclick();assert(!field.hidden);
console.log('PASS shared notes, playhead boundary, table refresh, removed-shot write guard, end clamp and collapse (DOM mock)');
