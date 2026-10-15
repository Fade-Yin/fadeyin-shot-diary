/* Grouped help and export dialogs; existing export controls keep their handlers. */
(()=>{
function makeDialog(id,title,trigger){const d=document.createElement('section');d.id=id;d.className='editorDialog anchoredTaskPanel';d.setAttribute('role','dialog');d.setAttribute('aria-labelledby',id+'Title');d.dataset.popoverWidth='760';d.innerHTML=`<header><h2 id="${id}Title">${title}</h2><button class="btn" type="button" aria-label="关闭${title}"><svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>`;document.body.append(d);window.PianlalaPopover(d,trigger);d.querySelector('header button').onclick=()=>d.close();trigger.setAttribute('aria-haspopup','dialog');return d}
function tabs(host,entries){const nav=document.createElement('div');nav.className='editorDialogTabs';nav.setAttribute('role','tablist');host.append(nav);const pairs=[];entries.forEach(([label,content],i)=>{const b=document.createElement('button'),p=document.createElement('section');b.type='button';b.className='btn';b.id=host.id+'Tab'+i;b.textContent=label;b.setAttribute('role','tab');p.id=host.id+'Pane'+i;p.className='editorDialogPane';p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',b.id);b.setAttribute('aria-controls',p.id);p.append(content);host.append(p);nav.append(b);pairs.push([b,p]);b.onclick=()=>select(i);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?pairs.length-1:(i+(e.key==='ArrowRight'?1:-1)+pairs.length)%pairs.length;select(n);pairs[n][0].focus()}}});function select(n){pairs.forEach(([b,p],i)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;p.hidden=i!==n})}select(0)}
const help=$('#shortcutHelp'),helpTrigger=$('#shortcutHelpBtn'),helpDialog=makeDialog('shortcutWindow','快捷键',helpTrigger);
const groups=[['播放与浏览',[]],['镜头与编辑',[]],['工作区',[]]];
for(const dt of help.querySelectorAll('dt')){const key=dt.textContent.trim(),text=dt.nextElementSibling?.textContent||'',index=/Space|J \/ K|, \/|\[ \/|^C$/.test(key)?0:/^\?|1 \/ 2/.test(key)?2:1;groups[index][1].push([key,text])}
groups[0][1].push(['Ctrl / ⌘ + 滚轮','缩放时间线']);groups[1][1].push(['← / →','时间线聚焦时选择镜头'],['Shift + ← / →','时间线聚焦时连续选择'],['Home / End','时间线聚焦时选择首尾镜头'],['Enter','时间线聚焦时播放所选镜头']);
tabs(helpDialog,groups.map(([title,items])=>{const list=document.createElement('dl');list.className='shortcutGrid';for(const [key,text] of items){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd'),kbd=document.createElement('kbd');dt.textContent=text;kbd.textContent=key;dd.append(kbd);row.append(dt,dd);list.append(row)}return [title,list]}));
const note=document.createElement('footer');note.textContent='输入文字时不触发快捷键 · Mac 使用 ⌘ 代替 Ctrl';helpDialog.append(note);
help.togglePopover=()=>{if(helpDialog.matches(':popover-open'))helpDialog.close();else if(!busy)helpDialog.showPopover()};help.hidePopover=()=>helpDialog.close();helpTrigger.onclick=()=>help.togglePopover();
const exportButton=document.createElement('button');exportButton.className='btn primary toolbarExport';exportButton.innerHTML='<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m-4 4 4-4 4 4M4 13v8h16v-8"/></svg><span>导出</span>';document.querySelector('.libraryTools').append(exportButton);
const dialog=makeDialog('exportWindow','导出',exportButton),body=document.createElement('div'),preview=document.createElement('aside'),options=document.createElement('div');body.className='exportWindowBody';preview.className='exportPreview';preview.innerHTML='<img alt="当前镜头预览"><b></b><span></span>';options.id='exportOptions';body.append(preview,options);dialog.append(body);
const stills=document.querySelector('.stillControls'),stillsPane=document.createElement('div');stillsPane.className='exportFields';for(const selector of ['label[for="stillPosition"]','#stillPosition','#stillHint','#exportStillsBtn','#revealStillsBtn']){const el=stills.querySelector(selector);if(el)stillsPane.append(el)}
const clips=document.createElement('div');clips.className='exportFields';const hint=document.createElement('p');hint.textContent='按已分析的镜头切分，保持原始分辨率。';clips.append(hint,$('#saveClipsBtn'));
const documents=document.createElement('div');documents.className='exportFields';documents.append($('#reportBtn'),$('#exportLapBtn'),$('#feishuBtn'));tabs(options,[['静帧',stillsPane],['镜头视频',clips],['报告与日记',documents]]);
const footer=document.createElement('footer');footer.innerHTML='<span role="status"></span><button class="btn" type="button">关闭</button>';dialog.append(footer);footer.querySelector('button').onclick=()=>dialog.close();
exportButton.onclick=()=>{if(busy)return toast('请等待当前任务完成');const shot=shots.find(s=>video.currentTime>=s.start&&video.currentTime<s.end)||shots[0],img=preview.querySelector('img');img.hidden=!shot;if(shot)img.src=shot.image;else img.removeAttribute('src');preview.querySelector('b').textContent=lapMeta.title||sourceFile?.name||'尚未选择视频';preview.querySelector('span').textContent=shots.length?`${shots.length} 个镜头 · ${fmt(Number.isFinite(video.duration)?video.duration:0)}`:'请先导入视频并分析镜头';dialog.showModal();exportButton.setAttribute('aria-expanded','true');sync()};
function sync(){if(!dialog.matches(':popover-open'))return;footer.querySelector('span').textContent=busy?'正在处理，完成后会提示结果':shots.length?'导出时选择保存位置':'请先完成镜头分析';for(const id of ['exportLapBtn','feishuBtn'])$('#'+id).disabled=busy||!shots.length;$('#stillPosition').disabled=busy}
setInterval(sync,150);window.PianlalaLayout.integrateExports();
const playIcon='<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
const mergeIcon='<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h7v14H3M21 5h-7v4m0 6v4h7M20 12H9m4-4-4 4 4 4"/></svg>';
function decorateShotActions(){
 for(const button of document.querySelectorAll('#rows [data-play],#lapBody [data-lap-play]')){
  const index=Number(button.dataset.play??button.dataset.lapPlay),row=button.closest('.shotRow'),image=row?.querySelector('img.thumb')||button.closest('td')?.querySelector('img.lapFrame');if(!image)continue;
  const shot=shots[index];if(shot){const time=row?.querySelector('.time');if(time)time.innerHTML=`<b>${frameFmt(shot.start)} → ${frameFmt(shot.end)}</b><small>中间帧 ${frameFmt(shot.mid)}</small>`;const lapTime=button.closest('tr')?.querySelector('.lapTime');if(lapTime)lapTime.innerHTML=`${frameFmt(shot.start)}<br>→ ${frameFmt(shot.end)}<br>${Math.round((shot.end-shot.start)*nativeFps)} 帧`}
  let preview=image.closest('.shotHoverPreview,.lapFramePreview');if(!preview){preview=document.createElement('div');preview.className='lapFramePreview';image.before(preview);preview.append(image)}
  preview.classList.add('sharedShotPreview');if(preview.hasAttribute('role'))preview.setAttribute('role','group');preview.append(button);button.className='btn framePlayOverlay';button.type='button';button.title='播放镜头';button.setAttribute('aria-label','播放镜头 '+(index+1));button.innerHTML=playIcon;button.onkeydown=e=>e.stopPropagation();
  button.onclick=e=>{e.stopPropagation();if(!busy&&!videoLoading)playShot(index)};
  if(preview.querySelector('.shotCornerActions'))continue;
  const actions=document.createElement('div');actions.className='shotCornerActions';const merge=row?.querySelector('[data-cut]')||document.createElement('button');merge.dataset.cut=String(index);merge.className='btn shotActionIcon';merge.type='button';merge.title='合并前一镜头';merge.setAttribute('aria-label','合并前一镜头');merge.innerHTML=mergeIcon;merge.disabled=index===0;
  merge.onclick=e=>{e.stopPropagation();if(busy||videoLoading)return;window.pianlalaStopTransport?.();$('#rows').onclick({target:merge})};
  const split=document.createElement('button');split.type='button';split.className='btn shotActionIcon';split.title='在此处切分镜头';split.setAttribute('aria-label','在此处切分镜头');split.innerHTML='<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M8 5H3v14h5M16 5h5v14h-5"/></svg>';
  split.onclick=e=>{e.stopPropagation();if(busy||videoLoading)return;const s=shots[index],t=Math.round(video.currentTime*nativeFps)/nativeFps;if(!s||t<=s.start||t>=s.end)return toast('请先用此镜头的进度条定位到要切分的画面');if(t-s.start<1/nativeFps-1e-7||s.end-t<1/nativeFps-1e-7)return toast('切点距离镜头边缘太近');window.pianlalaStopTransport?.();rememberEdit();const a={...s,end:t,mid:(s.start+t)/2},b={...s,start:t,mid:(t+s.end)/2};shots.splice(index,1,a,b);render();refreshImage(a).then(()=>refreshImage(b)).then(render).catch(error=>toast(error.message))};
  actions.addEventListener('keydown',e=>e.stopPropagation());actions.append(merge,split);preview.append(actions);
 }
}
const analysisBeforeIcons=renderAnalysisRows;renderAnalysisRows=function(...args){const result=analysisBeforeIcons.apply(this,args);decorateShotActions();return result};
const lapBeforeIcons=renderLapTable;renderLapTable=function(...args){const result=lapBeforeIcons.apply(this,args);decorateShotActions();return result};decorateShotActions();
// Restored projects and page changes can replace cards outside the render wrappers.
// Only unconverted buttons trigger decoration, so observer work cannot loop.
const cardObserver=new MutationObserver(records=>{const selector='[data-play]:not(.framePlayOverlay),[data-lap-play]:not(.framePlayOverlay)';if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(selector)||node.querySelector?.(selector)))))decorateShotActions()});
for(const container of [$('#rows'),$('#lapBody')])cardObserver.observe(container,{childList:true,subtree:true});
// All modes edit the same shots model. Freeze its latest ranges before any await.
const fallbackClipExport=$('#saveClipsBtn').onclick;
$('#saveClipsBtn').onclick=async e=>{
 if(busy||videoLoading)return;
 if(!desktopApi||!sourcePath)return fallbackClipExport(e);
 if(!shots.length)return toast('请先完成镜头分析');
 const snapshot={path:sourcePath,shots:shots.map(({start,end})=>({start,end}))};
 busy=true;cancelled=false;$('#saveClipsBtn').disabled=true;$('#cancelBtn').classList.remove('hidden');window.pianlalaStopTransport?.();
 try{saveLapNotes();await projectWriteQueue;const outputDir=await desktopApi.chooseExportFolder();if(!outputDir||cancelled)return;const result=await desktopApi.splitVideo({...snapshot,outputDir});toast(`已按当前切点导出 ${snapshot.shots.length} 个 MP4 镜头`);await desktopApi.revealPath(result.outputDir)}
 catch(error){toast(error.message==='__cancel__'||cancelled?'导出已取消':'导出失败：'+error.message)}
 finally{busy=false;$('#saveClipsBtn').disabled=!shots.length;$('#cancelBtn').classList.add('hidden')}
};
})();
