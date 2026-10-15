const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../ui/playback-tools.js'),'utf8');
const code=source.slice(source.indexOf('playShot=async function(i){'),source.indexOf('// Delegate on the persistent container:'));
let plays=[],monitored=[],errors=[];
const video={currentTime:8,seeking:false,paused:true,pause(){this.paused=true},play(){this.paused=false;return new Promise((resolve,reject)=>plays.push({resolve,reject,time:this.currentTime}))}};
const c={video,shots:[{start:0,end:.12},{start:3,end:3.2}],busy:false,videoLoading:false,shotStopToken:0,shotStopTimer:0,startingShotToken:null,previewPending:{},activeEnd:null,stopTransport(){},clearTimeout(){},monitorShotEnd:t=>monitored.push(t),toast:s=>errors.push(s)};
vm.createContext(c);vm.runInContext(code,c);
(async()=>{
 const first=c.playShot(0);assert.equal(plays.length,1,'play must begin synchronously in click gesture');assert.equal(plays[0].time,0);assert.equal(c.activeEnd,.12);assert.equal(c.previewPending,null);assert.equal(c.startingShotToken,c.shotStopToken);
 const second=c.playShot(1);assert.equal(plays.length,2);assert.equal(plays[1].time,3);
 plays[0].resolve();await first;assert.equal(monitored.length,0,'stale click cannot monitor the new shot');assert.equal(c.startingShotToken,c.shotStopToken);
 plays[1].resolve();await second;assert.deepEqual(monitored,[2]);assert.equal(c.startingShotToken,null);
 const aborted=c.playShot(0);plays[2].reject(Object.assign(new Error('interrupted'),{name:'AbortError'}));await aborted;assert.equal(errors.length,0);assert.equal(c.activeEnd,null);
 c.busy=true;await c.playShot(0);assert.equal(plays.length,3);
 console.log('PASS synchronous short-shot start, rapid-click isolation, queued preview clear and cancellation guard');
})().catch(e=>{console.error(e);process.exitCode=1});
