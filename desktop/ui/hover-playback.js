/* One hover owns the shared source player; progress belongs to the shot object. */
(()=>{
'use strict';
const positions=new WeakMap();let owner=null,frame=0;
function target(node){
 const surface=node?.closest?.('.shotHoverPreview,.lapFramePreview');
 const button=surface?.querySelector('[data-play],[data-lap-play]');
 if(!button)return null;
 const index=Number(button.dataset.play??button.dataset.lapPlay),shot=shots[index];
 return shot?{surface,index,shot}:null;
}
function remember(){
 if(!owner)return;
 const {shot,index}=owner,count=Math.max(1,Math.ceil((shot.end-shot.start)*nativeFps-1e-7));
 const time=Math.max(shot.start,Math.min(shot.end-1/nativeFps,video.currentTime));
 positions.set(shot,time);
 if(video.readyState>=2&&!video.seeking&&video.currentTime>=shot.start&&video.currentTime<shot.end){
  const canvas=owner.canvas;
  if(canvas){const width=Math.min(640,video.videoWidth),height=Math.round(width*video.videoHeight/video.videoWidth);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}canvas.getContext('2d').drawImage(video,0,0,width,height);canvas.hidden=false}
 }
 const value=Math.max(0,Math.min(count-1,Math.floor((time-shot.start)*nativeFps+1e-5)));
 for(const track of document.querySelectorAll(`.shotFrameTrack[data-shot-index="${index}"]`)){
  track.querySelector('input').value=value;
  track.querySelector('small').textContent=`${frameFmt(shot.start+value/nativeFps)} · ${value+1}/${count} 帧`;
 }
}
function leave(){
 if(!owner)return;
 remember();owner.surface.classList.remove('hoverPlaying');owner=null;
 cancelAnimationFrame(frame);frame=0;
 window.pianlalaStopTransport();
}
function tick(){
 if(!owner)return;
 if(!owner.surface.isConnected||shots[owner.index]!==owner.shot||busy||videoLoading){leave();return}
 remember();
 if(video.currentTime>=owner.shot.end-1/nativeFps){leave();return}
 frame=requestAnimationFrame(tick);
}
function enter(next){
 if(!next||owner?.surface===next.surface||busy||videoLoading||!sourceFile)return;
 leave();window.pianlalaStopTransport();owner=next;
 const {shot,surface,index}=next;
 const slider=surface.closest('.shotRow,tr')?.querySelector(`.shotFrameTrack[data-shot-index="${index}"] input`);
 let time=positions.get(shot)??(shot.start+Number(slider?.value||0)/nativeFps);
 if(time>=shot.end-1.5/nativeFps)time=shot.start;
 video.currentTime=Math.max(shot.start,time);activeEnd=shot.end;
 next.canvas=surface.querySelector('.hoverPlaybackCanvas');
 if(!next.canvas){next.canvas=document.createElement('canvas');next.canvas.className='hoverPlaybackCanvas';next.canvas.hidden=true;next.canvas.setAttribute('aria-hidden','true');surface.append(next.canvas)}
 surface.classList.add('hoverPlaying');
 // Muted hover is allowed before the first click by Chromium autoplay policy.
 // Restore the user's mute preference on leaving this preview session.
 const previousMuted=video.muted;next.previousMuted=previousMuted;
 const restore=()=>{if(owner===next||!owner)video.muted=previousMuted};
 next.restore=restore;
 video.play().catch(error=>{
  if(owner!==next)return;
  if(error.name==='NotAllowedError'){video.muted=true;video.play().catch(()=>{if(owner===next){leave();toast('无法预览此镜头，请检查视频是否可播放')}})}
  else if(error.name!=='AbortError'){leave();toast('镜头预览失败：'+error.message)}
 });
 frame=requestAnimationFrame(tick);
}
const oldLeave=leave;
leave=function(){const previous=owner;oldLeave();previous?.restore?.()};
document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const next=target(e.target);if(next&&!next.surface.contains(e.relatedTarget))enter(next)},true);
document.addEventListener('pointerout',e=>{if(owner?.surface.contains(e.target)&&!owner.surface.contains(e.relatedTarget))leave()},true);
// Horizontal mouse movement no longer seeks or pauses the hover player.
document.addEventListener('pointermove',e=>{if(target(e.target))e.stopImmediatePropagation()},true);
document.addEventListener('click',e=>{const next=target(e.target);if(!next||e.target.closest('button:not([data-play]):not([data-lap-play])'))return;e.preventDefault();e.stopImmediatePropagation();enter(next)},true);
document.addEventListener('input',e=>{const track=e.target.closest('.shotFrameTrack');if(track){const value=e.target.value;leave();e.target.value=value;const shot=shots[Number(track.dataset.shotIndex)];if(shot)positions.delete(shot)}},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)leave()});
window.addEventListener('blur',leave);
const hide=document.createElement('style');hide.textContent=`
.framePlayOverlay,[data-play],[data-lap-play],.hoverPreviewOption{display:none!important}
.shotHoverPreview.hoverPlaying,.lapFramePreview.hoverPlaying{outline:2px solid var(--accent);outline-offset:2px}
.shotPreviewLine{display:none!important}`;document.head.append(hide);
hide.textContent+=' .shotHoverPreview,.lapFramePreview{position:relative}.hoverPlaybackCanvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;pointer-events:none;border-radius:inherit}.shotCornerActions{z-index:4}';
})();
