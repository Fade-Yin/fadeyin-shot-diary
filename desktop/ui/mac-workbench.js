/* 0.8: desktop interaction shell. Existing project, edit and export engines remain authoritative. */
(()=>{
'use strict';
const html=document.documentElement;html.dataset.design='mac';html.dataset.platform=desktopApi?.platform||'browser';
const icons={
 film:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
 notes:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 timeline:'<path d="M4 5h16M4 12h6m4 0h6M4 19h16M12 3v18"/>',
 layout:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 4v16M8 13h13"/>',
 keyboard:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
 settings:'<path d="m9 3-.5 2-2 1.2-2-.5-2 3.5L4 10.7v2.6l-1.5 1.5 2 3.5 2-.5L8.5 19l.5 2h6l.5-2 2-1.2 2 .5 2-3.5-1.5-1.5v-2.6L21.5 9l-2-3.5-2 .5-2-1L15 3Z"/><circle cx="12" cy="12" r="3"/>',
 export:'<path d="M12 15V3m-4 4 4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 play:'<path d="m9 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',
 previous:'<path d="M5 5v14m14-14L8 12l11 7Z"/>',next:'<path d="M19 5v14M5 5l11 7-11 7Z"/>',
 back:'<path d="m15 5-7 7 7 7"/>',forward:'<path d="m9 5 7 7-7 7"/>',
 camera:'<path d="M4 7h4l2-3h4l2 3h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="4"/>',
 volume:'<path d="M4 9h4l5-4v14l-5-4H4ZM17 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14"/>',
 mute:'<path d="M4 9h4l5-4v14l-5-4H4ZM17 9l5 6m0-6-5 6"/>',
 fullscreen:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
 sliders:'<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 undo:'<path d="m8 5-5 5 5 5M3 10h11a6 6 0 0 1 6 6"/>',redo:'<path d="m16 5 5 5-5 5M21 10H10a6 6 0 0 0-6 6"/>',
 select:'<path d="m5 3 14 10-7 1-3 7Z"/>',blade:'<path d="M12 3v18M8 5H3v14h5M16 5h5v14h-5"/>',
 merge:'<path d="M3 5h6v14H3M21 5h-6v4m0 6v4h6M21 12H9m4-4-4 4 4 4"/>',
 close:'<path d="m7 7 10 10M17 7 7 17"/>',minus:'<path d="M5 12h14"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 moon:'<path d="M20 15A8.5 8.5 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z"/>',
 desktop:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>'
};
function icon(name){return window.PianlalaGlyph?window.PianlalaGlyph(name,'macIcon workbenchIcon'):'<svg class="macIcon workbenchIcon" viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>'}
function decorate(button,name,label,text=false){if(!button)return;const key=name+'|'+label+'|'+text;if(button.dataset.iconKey===key)return;button.dataset.iconKey=key;button.innerHTML=icon(name)+(text?'<span>'+label+'</span>':'');button.title=label;button.setAttribute('aria-label',label);button.type='button';button.classList.add(text?'macTextButton':'macIconButton')}
function button(name,label,action,text=false){const b=document.createElement('button');b.className='btn';decorate(b,name,label,text);b.onclick=action;return b}
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='mac-workbench.css';document.head.append(sheet);

// One stable toolbar, with working modes separated from document utilities.
const top=document.querySelector('.editorTopbar'),nav=document.querySelector('.libraryTools'),modes=document.querySelector('.modeSwitch');
const title=document.createElement('div');title.className='macDocumentTitle';title.innerHTML='<img class="macBrandLogo" src="app-icon.png" alt="" draggable="false"><b>片拉拉</b><span class="macSaveState" role="status" aria-live="polite">未打开项目</span>';top.querySelector('.editorAppName')?.remove();
top.prepend(title);top.insertBefore(modes,nav);nav.classList.add('macUtilities');
for(const [mode,name,label] of [['analysis','film','分析'],['lap','notes','拉片'],['timeline','timeline','时间线']])decorate(document.querySelector(`[data-app-mode="${mode}"]`),name,label,true);
for(const [selector,name,label] of [['.notesTool','notes','项目备注'],['.layoutTool','layout','布局'],['#shortcutHelpBtn','keyboard','快捷键'],['.settingsGear','settings','设置'],['.toolbarExport','export','导出']])decorate(document.querySelector(selector),name,label,selector==='.toolbarExport');
modes.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const all=[...modes.querySelectorAll('button')],i=all.indexOf(document.activeElement),n=e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length;all[n].click();all[n].focus()});

// Compact library with actual filtering and the existing persisted view/sort controls.
const library=document.querySelector('.projectSidebar'),list=$('#projectList');
const search=document.createElement('label');search.className='macSearch';search.innerHTML=icon('search')+'<input type="search" placeholder="搜索项目" aria-label="搜索项目">';library.insertBefore(search,document.querySelector('.projectLibraryTools'));
const libraryHead=document.querySelector('[data-panel="library"] .dockBar');libraryHead.querySelector('span').textContent='项目';libraryHead.append($('#newProjectBtn'));decorate($('#newProjectBtn'),'plus','新建项目');
const filter=()=>{const query=search.querySelector('input').value.trim().toLocaleLowerCase();let count=0;for(const entry of list.querySelectorAll('.projectEntry')){const match=(entry.querySelector('.projectItem')?.textContent||'').toLocaleLowerCase().includes(query);entry.hidden=!match;if(match)count++}noMatches.hidden=!query||count>0};
const noMatches=document.createElement('p');noMatches.className='macNoMatches';noMatches.textContent='没有匹配的项目';noMatches.hidden=true;list.after(noMatches);search.querySelector('input').addEventListener('input',filter);
const libTools=document.querySelector('.projectLibraryTools'),viewSelect=libTools.querySelector('select');viewSelect.hidden=true;
const viewGroup=document.createElement('div');viewGroup.className='macViewSwitch';viewGroup.setAttribute('role','group');viewGroup.setAttribute('aria-label','项目显示方式');
for(const [value,name,label] of [['list','list','列表视图'],['grid','grid','缩略图视图']]){const b=button(name,label,()=>{viewSelect.value=value;viewSelect.dispatchEvent(new Event('change'));updateView()});b.dataset.view=value;viewGroup.append(b)}libTools.prepend(viewGroup);
function updateView(){viewGroup.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===viewSelect.value)))}updateView();
new MutationObserver(()=>{filter();for(const b of list.querySelectorAll('.projectDelete:not([data-mac-icon])')){decorate(b,'close','删除项目');b.dataset.macIcon='true'}}).observe(list,{childList:true,subtree:true});

// All non-modal task panels share the same width and open at their own trigger.
for(const panel of document.querySelectorAll('.toolbarPopover'))panel.dataset.popoverWidth='440';
for(const b of document.querySelectorAll('.toolbarPopover header button'))decorate(b,'close',b.getAttribute('aria-label')||'关闭');
$('#settingsTitle').textContent='设置';
for(const [value,name,label] of [['light','sun','浅色'],['dark','moon','深色'],['system','desktop','跟随系统']])decorate(document.querySelector(`[data-theme-mode="${value}"]`),name,label,true);
const preferenceKey='pianlala.design-0.8';if(!localStorage.getItem(preferenceKey)){applyTheme('system');localStorage.setItem(preferenceKey,'1')}
const syncNativeTheme=()=>desktopApi?.setAppearance?.(html.dataset.theme).catch(()=>{});new MutationObserver(syncNativeTheme).observe(html,{attributes:true,attributeFilter:['data-theme']});syncNativeTheme();
$('#feishuBtn').textContent='导出 CSV 表格';$('#reportBtn').textContent='镜头图文报告';$('#exportLapBtn').textContent='可播放拉片日记';
const exportHint=$('#exportWindow .exportFields p');if(exportHint)exportHint.textContent='使用当前切点，保留原始分辨率。';
const layout=$('#layoutPopover'),heading=layout.querySelector('h2'),layoutHeader=document.createElement('header');layoutHeader.append(heading,button('close','关闭布局',()=>layout.close()));layout.prepend(layoutHeader);$('#closeLayouts').hidden=true;
layout.querySelector('.confirmActions').hidden=true;
layout.classList.remove('confirmDialog');

// Detection parameters belong to a dedicated anchored control, not a permanent input row.
const studyBar=document.querySelector('[data-panel="study"] .dockBar'),detection=document.querySelector('.detectionToolbar');
const analysisOptions=button('sliders','检测选项',()=>params.togglePopover()),params=document.createElement('section');params.id='macDetectionOptions';params.className='macParameters';params.dataset.popoverWidth='440';
params.innerHTML='<header><h2>检测选项</h2></header>';params.querySelector('header').append(button('close','关闭检测选项',()=>params.close()));
for(const field of [...detection.querySelectorAll(':scope > .field')])params.append(field);document.body.append(params);window.PianlalaPopover(params,analysisOptions);
const editTools=document.createElement('div');editTools.className='macEditTools';editTools.append($('#selectTool'),$('#bladeTool'),$('#undoBtn'),$('#redoBtn'));
for(const [id,name,label] of [['selectTool','select','选择工具（V）'],['bladeTool','blade','切分工具（B）'],['undoBtn','undo','撤销'],['redoBtn','redo','重做']])decorate(editTools.querySelector('#'+id),name,label);
detection.append(analysisOptions);studyBar.insertBefore(editTools,detection);const progress=$('#progressWrap');studyBar.after(progress);progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
const tabs=$('#sceneTabs');studyBar.after(tabs);tabs.classList.add('macSceneTabs');
studyBar.querySelector(':scope > span').textContent='镜头';
const empty=document.createElement('div');empty.className='macStudyEmpty';empty.innerHTML=icon('film')+'<h2>从一个镜头开始</h2><p>导入视频后检测切点，或在播放头位置手动切分。</p>';$('#studyArea').prepend(empty);
const overviewBar=document.querySelector('[data-panel="timeline"] .dockBar');overviewBar.querySelector('span').textContent='全片通览';
document.querySelector('.timelineDockEmpty').innerHTML='<strong>看见影片的节奏</strong><span>分析后查看亮度、色彩和声音变化，并将镜头整理成序列。</span>';
decorate($('#addSceneBtn'),'plus','新建序列',true);
decorate($('#captureFrameBtn'),'camera','截图（C）');decorate($('#pickBtn'),'folder','打开视频');
const playerBar=document.querySelector('[data-panel="player"] .dockBar');playerBar.querySelector('span').textContent='预览';
const previewIdentity=document.createElement('div');previewIdentity.className='macPreviewIdentity';previewIdentity.append(playerBar.querySelector(':scope > span'),$('#pickBtn'));playerBar.querySelector(':scope > svg')?.remove();
playerBar.append(previewIdentity,modes,$('#videoMeta'));$('#drop').hidden=true;

// Report only completed IndexedDB commits, never a timer or an optimistic write.
const saveState=title.querySelector('.macSaveState');let savedProjectKey='';
function showSaveState(state,stamp){saveState.dataset.state=state;saveState.textContent=state==='saved'?new Date(stamp).toLocaleTimeString('zh-CN',{hour12:false})+' 自动保存本地':state==='saving'?'正在保存…':state==='error'?'保存失败，请导出备份':'未打开项目'}
const originalProjectPut=projectPut;projectPut=async function(record){try{const result=await originalProjectPut(record);if(lapStorageKey()===record.id){savedProjectKey=record.id;showSaveState('saved',Date.now())}return result}catch(error){if(lapStorageKey()===record.id)showSaveState('error');throw error}};
const originalSaveNotes=saveLapNotes;saveLapNotes=function(...args){if(sourceFile)showSaveState('saving');const result=originalSaveNotes.apply(this,args);if(result===false&&sourceFile)showSaveState('error');return result};

// Unified player controls, frame-accurate seek, range and audible state.
video.controls=false;const player=$('#videoBox'),transport=document.createElement('div');transport.className='macTransport';
const scrub=document.createElement('input');scrub.type='range';scrub.min='0';scrub.max='0';scrub.step='1';scrub.value='0';scrub.setAttribute('aria-label','播放位置（帧）');scrub.className='macPlayerScrub';
const controlRow=document.createElement('div');controlRow.className='macTransportRow';const time=document.createElement('output');time.className='macTimecode';
const playback=document.createElement('div');playback.className='macPlayback';
const stop=()=>window.pianlalaStopTransport?.();
function moveFrame(delta){if(!sourceFile||busy)return;stop();video.currentTime=Math.max(0,Math.min(video.duration-1/nativeFps,(Math.round(video.currentTime*nativeFps)+delta)/nativeFps))}
function moveShot(delta){if(!shots.length||busy)return;stop();let i=shots.findIndex(s=>video.currentTime>=s.start&&video.currentTime<s.end);if(i<0)i=0;i=Math.max(0,Math.min(shots.length-1,i+delta));video.currentTime=shots[i].start}
const play=button('play','播放（空格）',async()=>{if(!sourceFile||busy)return;if(!video.paused){stop();video.pause()}else{stop();if(video.currentTime>=video.duration-1/nativeFps)video.currentTime=0;try{await video.play()}catch(e){toast('无法播放：'+e.message)}}});play.classList.add('macMainPlay');
playback.append(button('previous','上一镜头',()=>moveShot(-1)),button('back','上一帧',()=>moveFrame(-1)),play,button('forward','下一帧',()=>moveFrame(1)),button('next','下一镜头',()=>moveShot(1)));
const utilities=document.createElement('div');utilities.className='macPlayerUtilities';const mute=button('volume','静音',()=>{video.muted=!video.muted});
const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='1';volume.step='.05';volume.value=String(video.volume);volume.setAttribute('aria-label','音量');volume.oninput=()=>{video.volume=Number(volume.value);video.muted=video.volume===0};
const fullscreen=button('fullscreen','全屏预览',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await player.requestFullscreen()}catch(e){toast('无法进入全屏：'+e.message)}});
utilities.append(mute,volume,$('#captureFrameBtn'),fullscreen);controlRow.append(time,playback,utilities);transport.append(scrub,controlRow);player.append(transport);controlRow.append($('#transportStatus'));
let scrubbing=false;const endScrub=()=>{scrubbing=false};scrub.addEventListener('pointerdown',()=>{scrubbing=true;stop()});scrub.addEventListener('change',endScrub);scrub.addEventListener('pointercancel',endScrub);scrub.addEventListener('blur',endScrub);scrub.oninput=()=>{if(!sourceFile||busy)return;stop();video.currentTime=Number(scrub.value)/nativeFps;updatePlayer()};
function updatePlayer(){const duration=Number.isFinite(video.duration)?video.duration:0,current=Number.isFinite(video.currentTime)?video.currentTime:0;const frames=Math.max(0,Math.ceil(duration*nativeFps)-1);scrub.max=String(frames);if(!scrubbing)scrub.value=String(Math.min(frames,Math.round(current*nativeFps)));scrub.disabled=!sourceFile||busy;time.textContent=frameFmt(current)+' / '+frameFmt(duration);scrub.setAttribute('aria-valuetext',frameFmt(current));scrub.style.setProperty('--progress',frames?Number(scrub.value)/frames*100+'%':'0%');decorate(play,video.paused?'play':'pause',video.paused?'播放（空格）':'暂停（空格）');decorate(mute,video.muted?'mute':'volume',video.muted?'取消静音':'静音');for(const b of playback.querySelectorAll('button'))b.disabled=!sourceFile||busy;mute.disabled=!sourceFile;volume.disabled=!sourceFile;fullscreen.disabled=!sourceFile;volume.value=String(video.muted?0:video.volume)}
for(const event of ['timeupdate','loadedmetadata','emptied','play','pause','volumechange','seeked','ratechange'])video.addEventListener(event,updatePlayer);
const welcome=document.createElement('div');welcome.className='macWelcome';welcome.innerHTML=icon('film')+'<h1>把视频放到这里</h1><p>逐帧观看，拆解镜头，记录你的发现。</p>';welcome.append(button('plus','打开视频',()=>$('#file').click(),true));player.querySelector('.previewWrap').append(welcome);

// Focus, names and state are shared across all three editing modes.
function updateState(){const loaded=!!sourceFile;welcome.hidden=loaded;empty.hidden=shots.length>0;empty.querySelector('h2').textContent=loaded?'准备好拆解这部影片':'从一个镜头开始';empty.querySelector('p').textContent=loaded?'点击“检测切点”生成镜头，也可以手动切分。':'打开或拖入视频，项目将自动保存。';title.title=lapMeta.title||sourceFile?.name||'未打开项目';if(!loaded){savedProjectKey='';showSaveState('empty')}else if(savedProjectKey!==lapStorageKey()){savedProjectKey=lapStorageKey();showSaveState('saving')}$('#analyzeBtn').disabled=busy||videoLoading||!loaded;analysisOptions.disabled=busy;for(const b of modes.querySelectorAll('button')){const selected=b.dataset.appMode===appMode;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1}tabs.hidden=!shots.length;document.querySelector('.thumbControls').hidden=appMode!=='analysis';updatePlayer()}
const oldRender=render;render=function(...args){const result=oldRender.apply(this,args);updateState();return result};const oldMode=applyModeView;applyModeView=function(...args){const result=oldMode.apply(this,args);updateState();return result};
const oldLoad=loadVideo;loadVideo=async function(...args){try{return await oldLoad.apply(this,args)}finally{updateState()}};
let progressDismiss=0;
const oldProgress=setProgress;setProgress=function(...args){clearTimeout(progressDismiss);const result=oldProgress.apply(this,args);updateState();if(Number(args[0])>=100)progressDismiss=setTimeout(()=>{if(!busy)progress.classList.add('hidden')},1500);return result};
// Use a bounded icon pass only for newly rendered controls.
function finishIcons(){for(const [selector,name,label] of [['.shotCornerActions [data-cut]','merge','合并前一镜头'],['.shotCornerActions button:not([data-cut])','blade','在此处切分镜头'],['.framePlayOverlay','play','播放镜头']])for(const b of document.querySelectorAll(selector+':not([data-mac-icon])')){decorate(b,name,label);b.dataset.macIcon='1'}for(const b of document.querySelectorAll('.thumbControls button:not([data-mac-icon])')){decorate(b,b.getAttribute('aria-label').includes('缩小')?'minus':'plus',b.getAttribute('aria-label'));b.dataset.macIcon='1'}}
const observer=new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('button')||node.querySelector?.('button')))))finishIcons()});observer.observe($('#rows'),{childList:true,subtree:true});observer.observe($('#lapBody'),{childList:true,subtree:true});finishIcons();
const studyObserver=new MutationObserver(updateState);studyObserver.observe($('#analyzeBtn'),{childList:true});
updateState();
const fieldScript=document.createElement('script');fieldScript.src='project-fields.js';fieldScript.onload=()=>{const inspectorScript=document.createElement('script');inspectorScript.src='timeline-notes.js';document.body.append(inspectorScript)};document.body.append(fieldScript);
})();
