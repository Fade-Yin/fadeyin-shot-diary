const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../ui/toolbar-panels.js'),'utf8');
const code=source.slice(source.indexOf('const fallbackClipExport='),source.lastIndexOf('})();'));
(async()=>{
 for(const mode of ['analysis','lap','timeline']){
  const button={onclick:()=>{throw new Error('Unexpected fallback')}},cancel={classList:{remove(){},add(){}}};let payload,saved=false;
  const ctx=vm.createContext({appMode:mode,busy:false,videoLoading:false,cancelled:false,sourcePath:'test.mp4',shots:[{start:0,end:2},{start:2,end:3},{start:3,end:6}],$:id=>id==='#saveClipsBtn'?button:cancel,window:{},toast:()=>{},projectWriteQueue:Promise.resolve(),saveLapNotes:()=>{saved=true},desktopApi:{chooseExportFolder:async()=>{ctx.shots[1].end=99;return 'output'},splitVideo:async options=>{payload=options;return {outputDir:'output'}},revealPath:async()=>{}}});
  vm.runInContext(code,ctx);await button.onclick();assert(saved);assert.deepEqual(JSON.parse(JSON.stringify(payload.shots)),[{start:0,end:2},{start:2,end:3},{start:3,end:6}]);assert.equal(ctx.busy,false);
  ctx.shots=[{start:0,end:6}];ctx.desktopApi.chooseExportFolder=async()=> 'output';await button.onclick();assert.equal(payload.shots.length,1);assert.equal(payload.shots[0].end,6,'Merged range is exported');
 }
 console.log('PASS edited split/merged ranges in all three modes, snapshot isolation and busy reset (IPC mock)');
})().catch(error=>{console.error(error);process.exitCode=1});
