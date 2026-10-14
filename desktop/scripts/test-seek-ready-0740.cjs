const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../ui/FadeYin拉片日记.html'),'utf8').split(/\r?\n/).find(line=>line.startsWith('function seek(t)'));
const listeners=new Map();let time=0;
const video={duration:20,readyState:3,seeking:false,get currentTime(){return time},set currentTime(t){time=t;this.seeking=true},addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name)}};
const ctx=vm.createContext({video,setTimeout,clearTimeout});vm.runInContext(source,ctx);
(async()=>{let ready=false;const promise=ctx.seek(5).then(()=>{ready=true});await new Promise(resolve=>setTimeout(resolve,5));assert.equal(ready,false,'Assigning currentTime must not resolve seek');video.seeking=false;listeners.get('seeked')();await promise;assert.equal(ready,true);assert.equal(listeners.size,0);await ctx.seek(5);console.log('PASS waits for decoded seeked event; same-frame seek and listener cleanup');})().catch(error=>{console.error(error);process.exitCode=1});
