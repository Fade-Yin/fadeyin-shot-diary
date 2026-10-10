/* Playback tools share the source player; thumbnails never supply exported pixels. */
(()=>{
let reverseTimer=0,reverseSpeed=0,forwardSpeed=0,capturing=false;
let activePreview=null,previewRaf=0,previewPending=null;
const status=document.createElement('span');status.id='transportStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='暂停';
$('#videoBox .videoHead').append(status);
function updateStatus(){status.textContent=reverseTimer?`倒放 ${reverseSpeed}×`:video.paused?'暂停':`正放 ${video.playbackRate}×`}
for(const event of ['play','pause','ratechange','ended'])video.addEventListener(event,updateStatus);
function stopReverse(){clearInterval(reverseTimer);reverseTimer=0;reverseSpeed=0;updateStatus()}
function stopTransport(){stopReverse();forwardSpeed=0;video.playbackRate=1}
function seekFrame(s,index){
  stopTransport();shotStopToken++;clearTimeout(shotStopTimer);activeEnd=null;video.pause();
  video.currentTime=Math.max(s.start,Math.min(s.end-0.0001,s.start+index/nativeFps));
}
const head=$('#videoBox .videoHead');
const capture=document.createElement('button');capture.className='btn';capture.id='captureFrameBtn';capture.textContent='截图';capture.title='保存当前画面为原尺寸 PNG（C）';head.append(capture);
async function screenshot(){
  if(!sourceFile||busy||capturing||video.readyState<2)return;
  capturing=true;capture.disabled=true;stopTransport();video.pause();
  const file=sourceFile,t=video.currentTime;
  try{
    if(video.seeking)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{video.removeEventListener('seeked',done);reject(new Error('定位画面超时'))},5000);function done(){clearTimeout(timer);resolve()}video.addEventListener('seeked',done,{once:true})});
    if(file!==sourceFile)return;
    const image=document.createElement('canvas');image.width=video.videoWidth;image.height=video.videoHeight;
    image.getContext('2d').drawImage(video,0,0);
    const blob=await new Promise(resolve=>image.toBlob(resolve,'image/png'));if(!blob)throw new Error('未能生成截图');
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;
    link.download=file.name.replace(/\.[^.]+$/,'')+'_'+t.toFixed(3).replace('.','-')+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('已保存当前画面 PNG');
  }catch(e){toast('截图失败：'+e.message)}finally{capturing=false;capture.disabled=false}
}
capture.onclick=screenshot;
function decorate(){
  for(const row of document.querySelectorAll('#rows .shotRow')){
    const image=row.querySelector('img.thumb'),button=row.querySelector('[data-play]');
    if(!image||!button||row.querySelector('.shotHoverPreview'))continue;
    const i=Number(button.dataset.play),s=shots[i];if(!s)continue;
    const surface=document.createElement('div');surface.className='shotHoverPreview';surface.tabIndex=0;surface.setAttribute('role','button');surface.setAttribute('aria-label',`浏览镜头 ${i+1}`);
    image.before(surface);surface.append(image);
    const line=document.createElement('span');line.className='shotPreviewLine';line.setAttribute('aria-hidden','true');surface.append(line);
    const count=Math.max(1,Math.ceil((s.end-s.start)*nativeFps-1e-7));
    const activate=()=>{if(busy||videoLoading||shots[i]!==s)return;previewPending=null;if(activePreview)activePreview.classList.remove('active');activePreview=surface;surface.classList.add('active');line.style.left='0%';seekFrame(s,0)};
    surface.onclick=activate;
    surface.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();activate()}};
    surface.onpointermove=e=>{
      if(activePreview!==surface||busy||videoLoading||shots[i]!==s||e.pointerType==='touch')return;
      const r=surface.getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),index=Math.min(count-1,Math.floor(ratio*count));
      line.style.left=`${ratio*100}%`;previewPending={surface,s,i,index};
      if(!previewRaf)previewRaf=requestAnimationFrame(()=>{previewRaf=0;const p=previewPending;previewPending=null;if(!p||p.surface!==activePreview||!p.surface.isConnected||busy||videoLoading||shots[p.i]!==p.s)return;seekFrame(p.s,p.index);const track=row.querySelector('.shotFrameTrack input'),label=row.querySelector('.shotFrameTrack small');if(track)track.value=p.index;if(label)label.textContent=`${fmt(p.s.start+p.index/nativeFps)} · ${p.index+1}/${count} 帧`});
    };
  }
  for(const button of document.querySelectorAll('[data-play],[data-lap-play]')){
    const parent=button.closest('.shotRow')?.querySelector('.rowBtns')||button.parentElement;
    if(parent.querySelector('.shotFrameTrack'))continue;
    const i=Number(button.dataset.play??button.dataset.lapPlay),s=shots[i];if(!s)continue;
    const count=Math.max(1,Math.ceil((s.end-s.start)*nativeFps-1e-7));
    const track=document.createElement('div');track.className='shotFrameTrack';
    const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=count-1;slider.step=1;slider.value=0;slider.setAttribute('aria-label',`镜头 ${i+1} 帧定位`);
    const label=document.createElement('small');const show=()=>{label.textContent=`${fmt(s.start+Number(slider.value)/nativeFps)} · ${Number(slider.value)+1}/${count} 帧`};show();
    slider.oninput=()=>{if(busy||shots[i]!==s)return;seekFrame(s,Number(slider.value));show()};
    track.append(slider,label);parent.append(track);
  }
}
for(const name of ['renderAnalysisRows','renderLapTable']){
  const original=name==='renderAnalysisRows'?renderAnalysisRows:renderLapTable;
  const wrapped=function(...args){const result=original.apply(this,args);decorate();return result};
  if(name==='renderAnalysisRows')renderAnalysisRows=wrapped;else renderLapTable=wrapped;
}
const oldPlay=playShot;playShot=function(...args){stopTransport();return oldPlay.apply(this,args)};
// Delegate on the persistent container: project restoration and pagination replace cards.
const previewRows=$('#rows');
function previewTarget(e){const image=e.target.closest('img.thumb,.shotHoverPreview');if(!image)return null;const row=image.closest('.shotRow'),button=row?.querySelector('[data-play]');if(!button)return null;const i=Number(button.dataset.play),s=shots[i];if(!s)return null;let surface=row.querySelector('.shotHoverPreview');if(!surface){surface=document.createElement('div');surface.className='shotHoverPreview';const img=row.querySelector('img.thumb');img.before(surface);surface.append(img);const line=document.createElement('span');line.className='shotPreviewLine';surface.append(line)}return {row,surface,i,s}}
previewRows.addEventListener('click',e=>{const p=previewTarget(e);if(!p||busy||videoLoading)return;e.stopImmediatePropagation();previewPending=null;if(activePreview)activePreview.classList.remove('active');activePreview=p.surface;p.surface.classList.add('active');p.surface.querySelector('.shotPreviewLine').style.left='0%';seekFrame(p.s,0)},true);
previewRows.addEventListener('pointermove',e=>{const p=previewTarget(e);if(!p||p.surface!==activePreview||busy||videoLoading)return;e.stopImmediatePropagation();const r=p.surface.getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),count=Math.max(1,Math.ceil((p.s.end-p.s.start)*nativeFps-1e-7));p.index=Math.min(count-1,Math.floor(ratio*count));p.surface.querySelector('.shotPreviewLine').style.left=ratio*100+'%';previewPending=p;if(!previewRaf)previewRaf=requestAnimationFrame(()=>{previewRaf=0;const target=previewPending;previewPending=null;if(!target||target.surface!==activePreview||!target.surface.isConnected||busy||videoLoading)return;seekFrame(target.s,target.index);const slider=target.row.querySelector('.shotFrameTrack input');if(slider)slider.value=target.index})},true);
const oldLoad=loadVideo;loadVideo=async function(...args){stopTransport();await oldLoad.apply(this,args);if(sourceFile&&!videoLoading&&Number.isFinite(video.duration)){queueProjectSave();await projectWriteQueue}};
video.addEventListener('play',stopReverse);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTransport();video.pause()}});
document.addEventListener('keydown',e=>{
  if(e.isComposing||e.ctrlKey||e.metaKey||e.altKey||busy||!sourceFile||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable],dialog'))return;
  const key=e.key.toLowerCase();if(!['j','k','l','c',' '].includes(key))return;
  e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  shotStopToken++;clearTimeout(shotStopTimer);
  if(key==='c'){screenshot();return}
  if(key==='k'){stopTransport();video.pause();return}
  if(key===' '){const wasPlaying=!video.paused||!!reverseTimer;stopTransport();if(wasPlaying)video.pause();else{const token=shotStopToken;video.play().then(()=>{if(activeEnd!=null)monitorShotEnd(token)}).catch(e=>toast(e.message))}return}
  if(key==='j'){
    const speed=reverseSpeed?Math.min(4,reverseSpeed*2):1;stopTransport();reverseSpeed=speed;video.pause();activeEnd=null;
    let last=performance.now();reverseTimer=setInterval(()=>{const now=performance.now(),delta=(now-last)/1000;last=now;if(busy||!sourceFile){stopTransport();return}video.currentTime=Math.max(0,video.currentTime-delta*speed);if(video.currentTime<=0)stopTransport()},40);updateStatus();return;
  }
  const speed=forwardSpeed?Math.min(4,forwardSpeed*2):1;stopReverse();forwardSpeed=speed;video.playbackRate=speed;const token=shotStopToken;
  video.play().then(()=>{if(activeEnd!=null)monitorShotEnd(token)}).catch(e=>toast(e.message));
},true);
const dl=$('#shortcutHelp dl');if(dl)for(const [key,text] of [['J / K / L','倒放 / 暂停 / 正放；重复 J 或 L 加速（最高 4×）'],['C','截图：当前画面，原尺寸 PNG']]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=text;dl.append(dt,dd)}
const style=document.createElement('style');style.textContent='.shotFrameTrack{width:100%;display:flex;flex-direction:column;gap:4px;margin-top:8px;min-width:0}.shotFrameTrack input{width:100%;min-width:0;accent-color:var(--accent);cursor:ew-resize}.shotFrameTrack small{color:var(--text);font-variant-numeric:tabular-nums;font-size:11px}.rowBtns{flex-wrap:wrap}.shotFrameTrack small{overflow-wrap:anywhere}';document.head.append(style);decorate();
})();
