/* Visual refinement is additive; stored layouts, projects and field order stay intact. */
(()=>{
const icon=paths=>'<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg>';
const plus=icon('<path d="M12 5v14M5 12h14"/>');
const camera=icon('<path d="M3 7h5l2-3h4l2 3h5v14H3Z"/><circle cx="12" cy="13" r="4"/>');
const upload=icon('<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>');
const grip=icon('<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"/>');
// Install the stylesheet before enhancement, and format empty headers before moving controls.
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='workbench.css';document.head.append(sheet);
for(const bar of document.querySelectorAll('.dockBar')){const title=bar.textContent.replace(/^⠿\s*/,'');bar.innerHTML=grip+'<span>'+escapeHtml(title)+'</span>'}
$('#newProjectBtn').innerHTML=plus+'<span>新建项目</span>';
$('#captureFrameBtn').innerHTML=camera+'<span>截图</span>';
$('#drop .dropIcon').innerHTML=upload;
document.querySelector('.projectBrand').textContent='项目库';
const analysisMode=document.querySelector('[data-app-mode="analysis"]');
analysisMode.innerHTML=icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5"/>');analysisMode.title='分析模式';analysisMode.setAttribute('aria-label','分析模式');
const lapMode=document.querySelector('[data-app-mode="lap"]');
lapMode.innerHTML=icon('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>');lapMode.title='拉片模式';lapMode.setAttribute('aria-label','拉片模式');
analysisMode.insertAdjacentHTML('beforeend','<span>分析模式</span>');lapMode.insertAdjacentHTML('beforeend','<span>拉片模式</span>');
// Global navigation belongs beside the project library, not above the player.
const sidebar=document.querySelector('.projectSidebar');
const navigation=document.createElement('div');navigation.className='libraryTools';
navigation.append(document.querySelector('.modeSwitch'),$('#shortcutHelpBtn'),document.querySelector('.settingsGear'));
const topbar=document.createElement('header');topbar.className='editorTopbar';
topbar.setAttribute('aria-label','工作台工具栏');topbar.append(navigation);
const appName=document.createElement('span');appName.className='editorAppName';appName.textContent='片拉拉';topbar.prepend(appName);
document.querySelector('.main .wrap').prepend(topbar);
// One anchored popover system for non-destructive toolbar panels.
window.PianlalaPopover=(panel,trigger)=>{
 panel.classList.add('toolbarPopover');panel.setAttribute('popover','auto');
 trigger.setAttribute('aria-controls',panel.id);trigger.setAttribute('aria-expanded','false');
 const position=()=>{const r=trigger.getBoundingClientRect(),width=Math.min(Number(panel.dataset.popoverWidth)||400,Math.max(0,innerWidth-24));panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(r.right-width,innerWidth-width-12))+'px';panel.style.top=(r.bottom+8)+'px';panel.style.maxHeight=Math.max(80,innerHeight-r.bottom-20)+'px'};
 panel.addEventListener('beforetoggle',e=>{if(e.newState==='open')position()});
 panel.addEventListener('toggle',e=>trigger.setAttribute('aria-expanded',String(e.newState==='open')));
 window.addEventListener('resize',()=>{if(panel.matches(':popover-open'))position()});
 panel.showModal=()=>panel.togglePopover();panel.close=()=>{if(panel.matches(':popover-open'))panel.hidePopover();trigger.focus()};
};
window.PianlalaPopover($('#globalSettings'),document.querySelector('.settingsGear'));
window.PianlalaPopover($('#shortcutHelp'),$('#shortcutHelpBtn'));
const notesButton=document.createElement('button');notesButton.className='btn notesTool';notesButton.textContent='备注';notesButton.title='项目备注';
$('#shortcutHelpBtn').before(notesButton);
const notesPanel=document.createElement('section');notesPanel.id='projectNotesPopover';notesPanel.setAttribute('aria-labelledby','projectNotesTitle');
notesPanel.innerHTML='<header><h2 id="projectNotesTitle">备注</h2><button class="btn" type="button" aria-label="关闭备注">×</button></header>';
notesPanel.append($('#diaryMeta'));document.body.append(notesPanel);
window.PianlalaPopover(notesPanel,notesButton);
notesButton.onclick=()=>{if(!busy)notesPanel.togglePopover()};notesPanel.querySelector('header button').onclick=()=>notesPanel.close();
$('#workspaceFullscreenBtn').hidden=true;$('#workspaceFullscreenBtn').disabled=true;
video.removeAttribute('controlslist');
document.querySelector('.dockPanel[data-panel="player"] .dockBar').after($('#drop'));
// One header row per panel. Existing controls are moved, never cloned.
const playerBar=document.querySelector('.dockPanel[data-panel="player"] .dockBar');
playerBar.append($('#drop'));
const studyBar=document.querySelector('.dockPanel[data-panel="study"] .dockBar');
studyBar.append($('#footer'),$('#sceneTabs'),document.querySelector('#results .resultsHead'));
const timelineBar=document.querySelector('.dockPanel[data-panel="timeline"] .dockBar');
timelineBar.append($('#timelineCount'));
// Buttons in draggable panel headers must not start docking gestures.
for(const bar of [playerBar,studyBar,timelineBar])bar.addEventListener('dragstart',e=>{if(e.target.closest('button,input,select,#drop,.sceneTabs,#footer,.resultsHead')){e.preventDefault();e.stopImmediatePropagation()}},true);
// Disable ancestor HTML dragging before a control's native pointer gesture begins.
// Cancelling dragstart alone can already interrupt Chromium range-input dragging.
for(const bar of [playerBar,studyBar,timelineBar])bar.addEventListener('pointerdown',e=>{
 if(!e.target.closest('button,input,select,textarea,.detectionToolbar'))return;
 const wasDraggable=bar.draggable;bar.draggable=false;
 const restore=()=>{bar.draggable=wasDraggable;window.removeEventListener('pointerup',restore,true);window.removeEventListener('pointercancel',restore,true);window.removeEventListener('blur',restore,true)};
 window.addEventListener('pointerup',restore,true);window.addEventListener('pointercancel',restore,true);window.addEventListener('blur',restore,true);
},true);
$('#selectTool').innerHTML=icon('<path d="M5 3v16l4-4 4 6 3-2-4-6h7Z"/>');
$('#bladeTool').innerHTML=icon('<path d="M7 4h4v16H7M17 4h-4v16h4"/>');
$('#undoBtn').innerHTML=icon('<path d="M8 5 3 10l5 5M3 10h11a6 6 0 0 1 6 6"/>')+'<span>撤销</span>';
$('#redoBtn').innerHTML=icon('<path d="m16 5 5 5-5 5M21 10H10a6 6 0 0 0-6 6"/>')+'<span>重做</span>';
$('#selectTool').setAttribute('aria-label','选择工具 (V)');$('#bladeTool').setAttribute('aria-label','刀片工具 (B)');
const oldTool=setTimelineTool;setTimelineTool=function(...args){const result=oldTool.apply(this,args);timelineEl.removeAttribute('title');return result};timelineEl.removeAttribute('title');
const ai=$('#aiBtn');ai.textContent='AI 拉片 · 未上线';
// Keep all shot export actions together; move existing nodes so handlers stay intact.
const exports=document.querySelector('.stillControls');
exports.querySelector('h3').textContent='导出';
const detection=document.createElement('div');detection.className='detectionToolbar';
const settingsPanel=document.querySelector('#workspace .settings');
const fields=[...settingsPanel.querySelectorAll(':scope > .field')];
detection.append($('#analyzeBtn'),$('#cancelBtn'),...fields,settingsPanel.querySelector('.progressWrap'));
studyBar.insertBefore(detection,studyBar.querySelector('span').nextSibling);
$('#reanalyzeBtn').hidden=true;
const exportBar=document.querySelector('.dockPanel[data-panel="settings"] .dockBar span');exportBar.textContent='导出区';
document.querySelector('[data-metric="color"]').textContent='Cineprint';
setInterval(()=>{const label=shots.length?'重新分析':'检测切点';if($('#analyzeBtn').textContent!==label)$('#analyzeBtn').textContent=label},250);
const reportGroup=document.createElement('div');reportGroup.className='reportExportGroup';
const reportHint=document.createElement('p');reportHint.textContent='单文件 HTML · 镜头画面与时间码 · 可分享查看';
reportGroup.append($('#reportBtn'),reportHint);exports.append(reportGroup);
const diaryGroup=document.createElement('div');diaryGroup.className='reportExportGroup';
diaryGroup.append($('#exportLapBtn'),$('#feishuBtn'));exports.append(diaryGroup);
const clipsGroup=document.createElement('div');clipsGroup.className='reportExportGroup';
const clipsHint=document.createElement('p');clipsHint.textContent=desktopApi?'FFmpeg 精确切分 · 保持原始分辨率':'WebM 镜头视频 ZIP · 实时录制';
const clips=$('#saveClipsBtn');clips.textContent=desktopApi?'导出精确 MP4 镜头':'导出镜头视频 ZIP';clips.classList.remove('hidden');clipsGroup.append(clips,clipsHint);exports.append(clipsGroup);
setInterval(()=>{for(const button of [clips,$('#reportBtn')])button.disabled=busy||videoLoading||!shots.length},120);
ai.hidden=true;$('#projectStorageInfo').append(ai);
document.documentElement.dataset.density='compact';
function covers(){
  for(const entry of document.querySelectorAll('.projectEntry')){
    const button=entry.querySelector('.projectItem');if(!button||button.querySelector('.projectCover'))continue;
    const id=button.dataset.projectId;const record=projectListEntries.find(x=>x.id===id);
    // The list holds small metadata only on some builds. Never load entire films just for covers.
    const image=record?.cover;if(typeof image!=='string'||! /^(data:image\/|blob:)/.test(image))continue;
    const img=document.createElement('img');img.className='projectCover';img.src=image;img.alt='';img.loading='lazy';button.prepend(img);
  }
}
const oldRefresh=refreshProjectList;refreshProjectList=async function(...args){const result=await oldRefresh.apply(this,args);covers();return result};covers();
// Last-loaded CSS wins over historical inline styles while remaining a standalone resource.
})();
