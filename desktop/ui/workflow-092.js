/* Explicit hover mode, persistent screenshots and cancellable import analysis. */
(()=>{
'use strict';
const settings=$('#globalSettings'),section=document.createElement('section');
section.innerHTML='<h3>截图保存</h3><p class="screenshotDirectory" role="status">正在读取保存位置…</p><button class="btn" type="button">更改保存位置…</button><p class="lastScreenshot"></p>';
settings.querySelector('header').after(section);
const directory=section.querySelector('.screenshotDirectory'),choose=section.querySelector('button');
async function readDirectory(){try{directory.textContent=desktopApi?.screenshotDirectory?await desktopApi.screenshotDirectory():'浏览器下载目录（位置由浏览器设置）'}catch(e){directory.textContent='无法读取保存位置：'+e.message}}
choose.disabled=!desktopApi?.chooseScreenshotDirectory;
choose.onclick=async()=>{try{const selected=await desktopApi.chooseScreenshotDirectory();if(selected)directory.textContent=selected}catch(e){toast('设置保存位置失败：'+e.message)}};
window.addEventListener('pianlala-screenshot-saved',e=>{section.querySelector('.lastScreenshot').textContent='上次截图：'+e.detail.path});readDirectory();

const hover=document.createElement('label');hover.className='hoverPreviewOption';
hover.innerHTML='<input type="checkbox"><span>鼠标滑动预览</span>';hover.title='开启后，暂停时可在已选镜头画面上移动鼠标浏览；播放时不会触发';
const checkbox=hover.querySelector('input');
try{checkbox.checked=localStorage.getItem('pianlala.hover-preview.v1')==='true'}catch{}
function setHover(){window.pianlalaHoverPreviewEnabled=checkbox.checked;document.documentElement.dataset.hoverPreview=String(checkbox.checked);try{localStorage.setItem('pianlala.hover-preview.v1',String(checkbox.checked))}catch{}window.dispatchEvent(new Event('pianlala-hover-preview-changed'))}
checkbox.onchange=setHover;document.querySelector('[data-panel="study"] .dockBar').append(hover);setHover();

const preview=$('#videoBox .previewWrap'),overlay=document.createElement('div');overlay.className='detectionOverlay';overlay.hidden=true;
overlay.innerHTML='<span role="status">正在检测镜头…</span><button id="stopDetectionBtn" class="btn" type="button">停止检测</button>';
preview.append(overlay);const stop=overlay.querySelector('button');let analysing=false;
function detectionState(on){overlay.hidden=!on;preview.classList.toggle('detectingVideo',on);$('#videoBox').setAttribute('aria-busy',String(on));if(!on){stop.disabled=false;stop.textContent='停止检测'}}
stop.onclick=()=>{cancelled=true;desktopApi?.cancel();stop.textContent='正在停止…';stop.disabled=true};
const priorAnalyze=analyze;analyze=async function(...args){if(busy||videoLoading||!sourceFile)return;analysing=true;try{const task=priorAnalyze.apply(this,args);if(busy)detectionState(true);return await task}finally{analysing=false;detectionState(false);if(cancelled)$('#progressWrap').classList.add('hidden');applyModeView()}};
new MutationObserver(()=>{if(analysing&&busy)detectionState(true)}).observe($('#cancelBtn'),{attributes:true,attributeFilter:['class']});
const priorProgress=setProgress;setProgress=function(p,label){const result=priorProgress(p,label);if(analysing){overlay.querySelector('span').textContent=(label||'正在检测镜头…')+' '+Math.round(p)+'%';if(busy)detectionState(true)}return result};
window.pianlalaImportVideo=async file=>{if(busy||videoLoading)return;pendingProject=null;await acceptVideo(file)};
// A chooser import follows the same new-video flow; explicit project re-linking keeps its records.
const priorAccept=acceptVideo;acceptVideo=async function(file){const restoring=!!pendingProject;await priorAccept(file);if(!restoring&&sourceFile===file&&!busy&&!videoLoading&&!shots.length&&Number.isFinite(video.duration)){saveLapNotes();await projectWriteQueue;await analyze()}};
const priorCurve=renderOverviewCurve;renderOverviewCurve=function(...args){const result=priorCurve.apply(this,args);const svg=$('#brightnessSvg');svg.setAttribute('aria-label',(svg.getAttribute('aria-label')||'').replaceAll('Cineprint','指纹'));return result};
const hoverPlayback=document.createElement('script');hoverPlayback.src='hover-playback.js';document.body.append(hoverPlayback);
const macPlatform=document.createElement('script');macPlatform.src='mac-platform.js';document.body.append(macPlatform);
})();
