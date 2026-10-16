const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ui=path.join(__dirname,'../ui'),html=fs.readFileSync(path.join(ui,'FadeYin拉片日记.html'),'utf8');
const elements=new Map();
function element(){return {children:[],replaceChildren(){this.children=[]},append(x){this.children.push(x)},querySelector(s){return this.fields?.[s]||(this.fields??={},this.fields[s]={value:''})}}}
function $(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)}
const ctx=vm.createContext({$,document:{createElement:element},appMode:'lap',shots:Array.from({length:130},(_,i)=>({start:i,end:i+1,mid:i+.5,image:'x'})),lapNotes:{129:{content:'最后镜头笔记'}},lapFields:[['content','画面内容','text']],scenes:[],activeSceneId:'',lapPage:9,analysisPage:9,activeScene(){return this.scenes.find(s=>s.id===this.activeSceneId)},renderColumnHeader(){},normalizeScenes(){},renderSceneTabs(){},escapeHtml:String,fmt:String});
const lap=html.split('\n').find(l=>l.startsWith('function renderLapTable('));
ctx.activeScene=()=>ctx.scenes.find(s=>s.id===ctx.activeSceneId);
vm.runInContext(lap,ctx);
const sequence=fs.readFileSync(path.join(ui,'sequence-analysis.js'),'utf8');
vm.runInContext(sequence.slice(sequence.indexOf('renderAnalysisRows=function(){'),sequence.indexOf('const oldRestoreEdit=')),ctx);
for(const mode of ['lap','analysis']){
 ctx.appMode=mode;const render=()=>mode==='lap'?ctx.renderLapTable():ctx.renderAnalysisRows();const container=mode==='lap'?'#lapBody':'#rows';
 render();assert.equal($(container).children.length,130);
 for(const i of [40,60,129])assert.ok($(container).children[i].innerHTML.includes(mode==='lap'?`data-lap-index="${i}"`:`data-play="${i}"`));
 if(mode==='lap')assert.equal($(container).children[129].querySelector('[data-field="content"]').value,'最后镜头笔记');
 ctx.scenes=[{id:'test',title:'长序列',startShot:30,endShot:125}];ctx.activeSceneId='test';render();assert.equal($(container).children.length,95);
 ctx.activeSceneId='unassigned';render();assert.equal($(container).children.length,35);
 ctx.scenes=[];ctx.activeSceneId='';
}
assert.ok(!/renderPager|slice\(analysisPage|slice\(lapPage/.test(html+sequence));
console.log('PASS 130-shot continuous analysis/lap, shots 41/61/130, last note, 95-shot sequence, unassigned filter. DOM-double regression.');
