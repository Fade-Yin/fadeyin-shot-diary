/* One note store for the table and the playhead inspector. */
(()=>{
'use strict';
const track=$('#trackMode'),panel=document.createElement('section');
panel.id='timelineNotes';panel.setAttribute('aria-label','当前镜头拉片信息');
panel.innerHTML='<header><h2>当前镜头</h2><span class="timelineNoteTime"></span><button class="btn" type="button" aria-expanded="true" title="收起拉片信息">收起</button></header><p class="timelineNoteEmpty">分析视频后，在时间线上选择镜头即可填写。</p><div class="timelineNoteFields"></div>';
track.append(panel);
const fields=panel.querySelector('.timelineNoteFields'),heading=panel.querySelector('h2'),time=panel.querySelector('.timelineNoteTime'),empty=panel.querySelector('p'),toggle=panel.querySelector('button');
let boundShot=null,boundProject='',composing=false,collapsed=false;
function buildFields(){fields.replaceChildren();for(const [key,label,type] of lapFields){
 const wrap=document.createElement('label');wrap.className='timelineNoteField';wrap.textContent=label;
 const input=document.createElement(type==='choice'?'input':'textarea');input.className=type==='choice'?'lapChoice':'lapText';input.dataset.field=key;input.setAttribute('aria-label','当前镜头 '+label);input.placeholder=type==='choice'?'选择或输入':'填写'+label;
 if(type==='choice'){input.addEventListener('click',()=>window.PianlalaOpenChoices?.(input));input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();window.PianlalaOpenChoices?.(input)}})}else input.rows=2;
 wrap.append(input);fields.append(wrap);
}}
buildFields();
addEventListener('pianlala-fields-changed',()=>{buildFields();sync(true)});
function indexAtTime(){const t=video.currentTime;let i=shots.findIndex(s=>t>=s.start&&t<s.end);if(i<0&&shots.length&&t>=shots.at(-1).end)i=shots.length-1;return i}
function sync(force=false){
 if(appMode!=='timeline')return;
 const i=indexAtTime(),shot=shots[i]||null,key=lapStorageKey();
 if(composing&&shot!==boundShot&&!force)return;
 if(shot!==boundShot||key!==boundProject||force){
  const focused=fields.contains(document.activeElement);
  if(shot!==boundShot||key!==boundProject)document.querySelectorAll('.lapPresetMenu:popover-open').forEach(menu=>menu.hidePopover());
  if(focused&&(shot!==boundShot||key!==boundProject))document.activeElement.blur();
  boundShot=shot;boundProject=key;
  for(const input of fields.querySelectorAll('[data-field]')){input.dataset.lapIndex=String(i);input.disabled=!shot||busy;if(document.activeElement!==input)input.value=shot?(lapNotes[i]?.[input.dataset.field]||''):''}
 }
 heading.textContent=shot?'镜头 '+String(i+1).padStart(2,'0')+' · 拉片信息':'当前镜头';
 time.textContent=shot?frameFmt(shot.start)+' → '+frameFmt(shot.end):'';
 empty.hidden=!!shot;fields.hidden=!shot||collapsed;toggle.disabled=!shot;
}
toggle.onclick=()=>{collapsed=!collapsed;toggle.textContent=collapsed?'展开':'收起';toggle.title=collapsed?'展开拉片信息':'收起拉片信息';toggle.setAttribute('aria-expanded',String(!collapsed));sync()};
fields.addEventListener('focusin',()=>window.pianlalaStopTransport?.());
fields.addEventListener('compositionstart',()=>{composing=true});
fields.addEventListener('compositionend',()=>{composing=false;sync()});
fields.addEventListener('input',e=>{
 const input=e.target.closest('[data-field]');if(!input||busy)return;
 const i=shots.indexOf(boundShot);if(i<0||boundProject!==lapStorageKey())return;
 input.dataset.lapIndex=String(i);
 // Reuse the table's writer so exports, undo mapping and autosave see identical data.
 $('#lapBody').oninput(e);
});
fields.addEventListener('change',e=>{const input=e.target.closest('.lapChoice');if(input&&!busy)addLapCustomOption(input.dataset.field,input.value);renderOverviewCurve()});
for(const event of ['timeupdate','seeked','loadedmetadata','emptied'])video.addEventListener(event,()=>sync());
const oldRender=render;render=function(...args){const result=oldRender.apply(this,args);sync(true);return result};
const oldView=applyModeView;applyModeView=function(...args){const result=oldView.apply(this,args);sync(true);return result};
addEventListener('pagehide',()=>{if(appMode==='timeline')saveLapNotes()});
sync(true);
})();
