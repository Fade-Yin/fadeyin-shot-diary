const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const events={},frames=new Map();let serial=0;
const shots=[{start:0,end:5},{start:5,end:10}],sliders=[{value:'0'},{value:'0'}];
const surfaces=shots.map((s,i)=>({isConnected:true,classList:{add(){},remove(){}},contains(n){return n===this},closest(){return {querySelector(){return sliders[i]}}},querySelector(sel){return sel.includes('[data-play]')?{dataset:{play:String(i)}}:this.canvas||null},append(c){this.canvas=c}}));
const nodes=surfaces.map(surface=>({closest(sel){return sel.includes('.shotHoverPreview')?surface:null}}));
const video={currentTime:0,readyState:2,seeking:false,videoWidth:1920,videoHeight:1080,muted:false,paused:true,play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true}};
const context={shots,sourceFile:{},busy:false,videoLoading:false,nativeFps:25,video,activeEnd:null,frameFmt:String,toast:assert.fail,requestAnimationFrame(fn){frames.set(++serial,fn);return serial},cancelAnimationFrame(id){frames.delete(id)},window:{addEventListener(){},pianlalaStopTransport(){video.pause();context.activeEnd=null}},document:{addEventListener(k,fn){events[k]=fn},querySelectorAll(sel){const i=Number(sel.match(/="(\d+)"/)[1]);return [{querySelector(s){return s==='input'?sliders[i]:{textContent:''}}}]},createElement(){return {setAttribute(){},getContext(){return {drawImage(){}}}}},head:{append(){}}}};
vm.runInNewContext(fs.readFileSync('ui/hover-playback.js','utf8'),context);
function over(i){events.pointerover({target:nodes[i],relatedTarget:null,pointerType:'mouse'})}
function out(i){events.pointerout({target:surfaces[i],relatedTarget:null})}
over(0);assert.equal(video.paused,false);video.currentTime=1.2;out(0);assert.equal(video.paused,true);assert.equal(sliders[0].value,30);
over(0);assert.equal(video.currentTime,1.2);assert.equal(video.paused,false);
out(0);over(1);assert.equal(video.currentTime,5);video.currentTime=6.4;out(1);assert.equal(video.paused,true);assert.equal(sliders[1].value,35);
over(0);assert.equal(video.currentTime,1.2);out(0);
assert.equal(frames.size,0);
console.log('PASS pointer entry without click, leave pauses, frame progress persists, re-entry resumes, rapid shot switch, RAF cleanup');
