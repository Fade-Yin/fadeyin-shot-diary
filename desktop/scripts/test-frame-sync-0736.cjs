const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../ui/playback-tools.js'),'utf8');
const code=source.slice(source.indexOf('let trackSyncFrame=0;'),source.indexOf("for(const event of ['timeupdate','seeked','pause','ended'])"));
const slider={value:0},label={textContent:''};let callback;
const track={dataset:{shotIndex:'0'},querySelector:s=>s==='input'?slider:label};
const context=vm.createContext({busy:false,videoLoading:false,video:{currentTime:2.5},shots:[{start:2,end:4}],nativeFps:30,frameFmt:t=>t.toFixed(3),document:{querySelectorAll:()=>[track]},requestAnimationFrame:fn=>{callback=fn;return 1}});
vm.runInContext(code,context);
function update(t){context.video.currentTime=t;vm.runInContext('syncFrameTracks()',context);callback()}
update(2.5);assert.equal(slider.value,15);assert.equal(label.textContent,'2.500 · 16/60 帧');
update(4);assert.equal(slider.value,59,'End frame clamps to last valid frame');
update(2);assert.equal(slider.value,0,'Seeking back resets progress');
update(5);assert.equal(slider.value,0,'Other shots do not move this progress bar');
console.log('PASS playback frame sync, end-frame clamp, seek reset and unrelated-shot isolation');
