const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync(require('path').join(__dirname,'../ui/interaction-update.js'),'utf8');
const fn=src.slice(src.indexOf('function followFocusedShot(){'),src.indexOf("video.addEventListener('seeked',followFocusedShot)"));
let scrolled=0,highlight='',selector='',editing=false,scene=null;
const row={classList:{add(c){highlight=c}},scrollIntoView(){scrolled++}};
const ctx=vm.createContext({appMode:'analysis',busy:false,videoLoading:false,shots:Array.from({length:130},(_,i)=>({start:i,end:i+1})),video:{currentTime:60.2},scenes:[],activeSceneId:'',activeScene:()=>scene,document:{querySelectorAll:()=>[],activeElement:{closest:()=>editing},querySelector(s){selector=s;return {closest:()=>row}}},renderLapTable(){throw Error('unexpected render')},renderAnalysisRows(){throw Error('unexpected render')}});
vm.runInContext(fn,ctx);
for(const mode of ['analysis','lap']){
 ctx.appMode=mode;ctx.video.currentTime=60.2;ctx.followFocusedShot();assert.ok(selector.includes('="60"'));assert.equal(highlight,mode==='lap'?'lapCurrentShot':'analysisCurrentShot');
 ctx.video.currentTime=61;ctx.followFocusedShot();assert.ok(selector.includes('="61"'));
 ctx.video.currentTime=130;ctx.followFocusedShot();assert.ok(selector.includes('="129"'));
 const count=scrolled;scene={startShot:0,endShot:40};ctx.followFocusedShot();assert.equal(scrolled,count);scene=null;
 editing=true;ctx.followFocusedShot();assert.equal(scrolled,count);editing=false;
}
console.log('PASS both modes follow seek, exact cut and final frame, filters preserved, editing does not scroll; no transport commands.');
