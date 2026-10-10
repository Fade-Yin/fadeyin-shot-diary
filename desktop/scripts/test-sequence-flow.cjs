// State/DOM-double test. This does not claim rendered browser acceptance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'ui/FadeYin拉片日记.html'),'utf8');
const elements=new Map();
function el(){const classes=new Set();return {children:[],value:'',hidden:false,isConnected:true,namespaceURI:'http://www.w3.org/2000/svg',style:{},dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,on){on?classes.add(x):classes.delete(x)}},append(...items){this.children.push(...items)},after(){},before(){},replaceChildren(...x){this.children=x},setAttribute(){},addEventListener(){},removeEventListener(){},closest(){return el()},focus(){},scrollIntoView(){},removeAttribute(){},load(){}}}
function $(s){if(!elements.has(s))elements.set(s,el());return elements.get(s)}
$('#sceneForm').classList.add('hidden');
const c={console,window:{PianlalaAnalysis:require('../ui/analysis-model.js')},document:{createElement:el,createElementNS:el,querySelectorAll:()=>[]},$,setTimeout,clearTimeout,structuredClone,busy:false,appMode:'lap',shots:Array.from({length:5},(_,i)=>({start:i,end:i+1,mid:i+.5,image:'x'})),scenes:[],lapNotes:{0:{content:'保留笔记'},3:{movement:'推'}},selectedShots:new Set(),sceneSerial:0,activeSceneId:'',lapPage:0,analysisPage:0,sourceUrl:'',sourcePath:'',video:{duration:5,pause(){},currentTime:0},desktopApi:null,toast:()=>{},fmt:String};
for(const name of ['renderSceneBoard','renderLapTable','renderOverviewCurve','renderAnalysisRows','renderSceneBands','updateSelectionTools','scheduleLapSave','render','applyModeView','setSceneCover','loadVideo','analyze','renderPager'])c[name]=()=>{};
c.selectScene=id=>c.activeSceneId=id;c.normalizeScenes=()=>{};
c.rememberEdit=()=>c.history.push(structuredClone({shots:c.shots,scenes:c.scenes,lapNotes:c.lapNotes,activeSceneId:c.activeSceneId}));c.history=[];
c.restoreEdit=s=>Object.assign(c,structuredClone(s));c.confirmAction=async()=>true;
function created(){const n=el();let id='';Object.defineProperty(n,'id',{get:()=>id,set:value=>{id=value;elements.set('#'+value,n)}});return n}
c.document.createElement=c.document.createElementNS=created;
c.renderSceneTabs=()=>{};$('#studyArea').prepend=()=>{};$('#sceneTabs').querySelectorAll=()=>[];
c.overviewMetric='brightness';vm.createContext(c);
function original(name){const marker='function '+name+'(',start=html.indexOf(marker);assert.ok(start>=0);const next=html.slice(start+marker.length).search(/\n(?:async )?function /);return html.slice(start,start+marker.length+next)}
for(const name of ['makeScene','activeScene','sceneRange','splitActiveScene','mergeActiveScene'])vm.runInContext(original(name),c);
vm.runInContext(fs.readFileSync(path.join(root,'ui/sequence-analysis.js'),'utf8'),c);
c.defaultSceneCover=async()=>{};
(async()=>{
  c.selectedShots=new Set([0,1]);c.sceneFromSelection();assert.equal($('#sceneStart').value,1);assert.equal($('#sceneEnd').value,2);
  await c.createManualScene();assert.equal(c.scenes.length,1);assert.equal(c.scenes[0].kind,'sequence');assert.equal(c.scenes[0].endShot,2);assert.equal(c.lapNotes[0].content,'保留笔记');
  c.selectedShots=new Set([1,2]);c.sceneFromSelection();await c.createManualScene();assert.equal(c.scenes.length,1);assert.match($('#sequenceError').textContent,/重叠/);
  $('#cancelSceneBtn').onclick();$('#editSequenceBtn').onclick();$('#sceneEnd').value=3;await c.createManualScene();assert.equal(c.scenes[0].endShot,3);
  const edited=structuredClone({shots:c.shots,scenes:c.scenes,lapNotes:c.lapNotes,activeSceneId:c.activeSceneId});c.restoreEdit(c.history.at(-1));assert.equal(c.scenes[0].endShot,2);c.restoreEdit(edited);assert.equal(c.scenes[0].endShot,3);
  c.video.currentTime=1.2;c.splitActiveScene();assert.equal(c.scenes.length,2);assert.equal(c.scenes[0].endShot,1);assert.equal(c.scenes[1].startShot,1);
  c.mergeActiveScene();assert.equal(c.scenes.length,1);assert.equal(c.scenes[0].endShot,3);
  await c.removeActiveScene();assert.equal(c.scenes.length,0);assert.equal(c.shots.length,5);assert.equal(c.lapNotes[0].content,'保留笔记');c.restoreEdit(c.history.at(-1));assert.equal(c.scenes.length,1);
  c.appMode='analysis';c.renderAnalysisRows();assert.equal($('#rows').children.length,3);c.selectScene('unassigned',false);assert.equal($('#rows').children.length,2);
  c.selectedShots=new Set([0,2]);c.sceneFromSelection();assert.equal(c.scenes.length,1);
  console.log('PASS sequence state flow: continuous selection, create, overlap rejection, edit range, undo/redo restoration, split, merge, remove/undo without lost notes, analysis-tab filtering. DOM-double only.');
})().catch(e=>{console.error(e);process.exitCode=1});
