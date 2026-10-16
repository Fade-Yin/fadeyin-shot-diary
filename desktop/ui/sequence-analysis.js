/* 0.7: one sequence workflow, original-resolution stills, annotated overview. */
(()=>{
const model=window.PianlalaAnalysis;
let editingSequenceId='',distributionWeight='count',distributionTimer;
const categories={shotSize:'景别',angle:'角度',movement:'运镜'};
$('#studyArea').prepend($('#sceneTabs'));
// Move the existing controls, preserving their export handlers and visibility rules.
$('#studyArea').prepend($('#footer'));
const oldSceneTabs=renderSceneTabs;
renderSceneTabs=function(){oldSceneTabs();$('#sceneTabs').hidden=!shots.length;$('#sceneTabs').querySelectorAll('[role="tab"]').forEach(b=>b.setAttribute('aria-controls',appMode==='lap'?'sceneSheet':'results'))};

// Keep legacy database keys, scene IDs and Electron app.name for existing projects.
$('#groupSceneBtn').hidden=true;
$('#groupSceneBtn').style.display='none';
$('#groupSequenceBtn').textContent='选中镜头建立序列';
$('#sceneKind').closest('label').hidden=true;
$('#sceneKind').value='sequence';
const editButton=document.createElement('button');editButton.className='btn';editButton.id='editSequenceBtn';editButton.textContent='修改范围';
$('#sceneCoverBtn').before(editButton);
const formError=document.createElement('p');formError.id='sequenceError';formError.setAttribute('role','alert');
$('#sceneForm .sceneFormActions').before(formError);
const rangePreview=document.createElement('p');rangePreview.id='sequenceRangePreview';
$('#sceneForm .sceneRangeInputs').after(rangePreview);
const oldNormalize=normalizeScenes;
normalizeScenes=function(){oldNormalize();for(const s of scenes)s.kind='sequence'};
function closeForm(){editingSequenceId='';$('#sceneForm').classList.add('hidden');formError.textContent=''}
function updateRangePreview(){
  const start=Number($('#sceneStart').value)-1,end=Number($('#sceneEnd').value);
  formError.textContent=model.validateSequence(start,end,shots.length,scenes,editingSequenceId);
  rangePreview.textContent=!formError.textContent?`${end-start} 个镜头 · ${fmt(shots[start].start)} → ${fmt(shots[end-1].end)} · 不改变镜头或笔记`:'';
  $('#createSceneBtn').disabled=!!formError.textContent||busy;
}
function showForm(start,end,existing=null){
  if(busy||!shots.length)return;
  editingSequenceId=existing?.id||'';
  $('#sceneStart').value=start+1;$('#sceneEnd').value=end;
  $('#sceneStart').max=shots.length;$('#sceneEnd').max=shots.length;
  $('#sceneTitle').value=existing?.title||'';$('#sceneTitle').maxLength=120;
  $('#createSceneBtn').textContent=existing?'保存序列':'建立序列';
  $('#sceneForm').classList.remove('hidden');updateRangePreview();
  $('#sceneForm').scrollIntoView({block:'nearest'});$('#sceneTitle').focus({preventScroll:true});
}
sceneFromSelection=function(){
  if(busy)return;
  const range=model.contiguousSelection(selectedShots,shots.length);
  if(!range)return toast('请选择连续镜头：先点起始镜头，再按 Shift 点击结束镜头');
  showForm(range.start,range.end);
};
openSceneForm=function(){
  if(busy||!shots.length)return;
  if(selectedShots.size)return sceneFromSelection();
  const hit=shots.findIndex((_,i)=>!scenes.some(s=>i>=s.startShot&&i<s.endShot));
  if(hit<0)return toast('全部镜头已归入序列，可选择现有序列后修改范围或拆分');
  let end=hit+1;while(end<shots.length&&!scenes.some(s=>end>=s.startShot&&end<s.endShot))end++;
  showForm(hit,end);
};
const oldMakeScene=makeScene;
makeScene=function(start,end,title=''){const s=oldMakeScene(start,end,title);s.kind='sequence';if(!title)s.title='序列 '+String(sceneSerial).padStart(2,'0');return s};
createManualScene=async function(){
  if(busy)return;
  const start=Number($('#sceneStart').value)-1,end=Number($('#sceneEnd').value);
  const error=model.validateSequence(start,end,shots.length,scenes,editingSequenceId);
  if(error){formError.textContent=error;return}
  let s=editingSequenceId?scenes.find(s=>s.id===editingSequenceId):null;
  if(editingSequenceId&&!s){closeForm();return toast('序列已改变，请重新选择')}
  const title=$('#sceneTitle').value.trim();rememberEdit(false);
  if(s){s.startShot=start;s.endShot=end;s.startTime=shots[start].start;s.endTime=shots[end-1].end;s.coverImage='';s.coverShot=start;if(title)s.title=title}
  else{s=makeScene(start,end,title);scenes.push(s)}
  activeSceneId=s.id;lapPage=0;analysisPage=0;selectedShots.clear();closeForm();
  renderSceneBoard();renderLapTable();renderAnalysisRows();renderOverviewCurve();updateSelectionTools();scheduleLapSave();
  // Capture only after the synchronous transaction; stale callbacks cannot change membership.
  await defaultSceneCover(s);toast('序列已保存，镜头和笔记保持不变');
};
const oldRenderSceneBoard=renderSceneBoard;
renderSceneBoard=function(){oldRenderSceneBoard();editButton.disabled=!activeScene()||busy;updateRangePreviewIfOpen()};
function updateRangePreviewIfOpen(){if(!$('#sceneForm').classList.contains('hidden'))updateRangePreview()}
const oldSelectScene=selectScene;
selectScene=function(id,seekTo=true){if(busy)return;closeForm();oldSelectScene(id,seekTo);analysisPage=0;renderAnalysisRows()};
renderAnalysisRows=function(){
  const rows=$('#rows');rows.replaceChildren();if(appMode!=='analysis')return;
  const sequence=activeScene();
  const indexes=shots.map((_,i)=>i).filter(i=>sequence?i>=sequence.startShot&&i<sequence.endShot:activeSceneId==='unassigned'?!scenes.some(s=>i>=s.startShot&&i<s.endShot):true);
  analysisPage=0;
  for(const i of indexes){
    const s=shots[i],row=document.createElement('div');row.className='shotRow';
    row.innerHTML=`<div class="shotNum"><b>镜头 ${String(i+1).padStart(2,'0')}</b><small>${(s.end-s.start).toFixed(2)} 秒</small></div><img class="thumb" loading="lazy" decoding="async" src="${s.image}" alt="镜头 ${i+1} 中间帧"><div class="time"><b>${fmt(s.start)} → ${fmt(s.end)}</b><small>中间帧 ${fmt(s.mid)}</small></div><div class="rowBtns"><button class="btn" data-play="${i}">播放</button><button class="btn danger" data-cut="${i}">合并前一镜头</button></div>`;
    rows.append(row);
  }
  $('#resultCount').textContent=`${sequence?sequence.title+' · ':''}${indexes.length} 个镜头`;
};
const oldRestoreEdit=restoreEdit;
restoreEdit=function(snapshot){closeForm();oldRestoreEdit(snapshot);renderOverviewCurve()};
const coverJobs=new WeakMap();
defaultSceneCover=async function(s){
  const range=sceneRange(s),url=sourceUrl;if(!range||!url)return;
  const job={};coverJobs.set(s,job);const scratch=document.createElement('video');scratch.muted=true;scratch.preload='auto';
  const wait=(event,action)=>new Promise((resolve,reject)=>{const done=()=>{clearTimeout(timer);scratch.removeEventListener(event,ok);scratch.removeEventListener('error',fail)},ok=()=>{done();resolve()},fail=()=>{done();reject(new Error('封面读取失败'))},timer=setTimeout(()=>{done();reject(new Error('封面读取超时'))},8000);scratch.addEventListener(event,ok,{once:true});scratch.addEventListener('error',fail,{once:true});action()});
  try{
    await wait('loadedmetadata',()=>{scratch.src=url});await wait('seeked',()=>{scratch.currentTime=(range.start+range.end)/2});
    const c=document.createElement('canvas');c.width=Math.min(560,scratch.videoWidth);c.height=Math.round(c.width*scratch.videoHeight/scratch.videoWidth);c.getContext('2d').drawImage(scratch,0,0,c.width,c.height);
    const current=sceneRange(s);
    if(coverJobs.get(s)===job&&sourceUrl===url&&scenes.includes(s)&&current?.start===range.start&&current?.end===range.end){s.coverImage=c.toDataURL('image/jpeg',.82);renderSceneBoard();scheduleLapSave()}
  }catch{/* Existing representative thumbnail stays visible if video seeking fails. */}
  finally{scratch.removeAttribute('src');scratch.load()}
};
const oldSetCover=setSceneCover;
setSceneCover=async function(){const s=activeScene();if(!s||busy)return;coverJobs.set(s,{});rememberEdit(false);busy=true;try{await oldSetCover()}catch(e){toast('封面设置失败：'+e.message)}finally{busy=false;refreshStillControls()}};
$('#sceneCoverBtn').onclick=()=>setSceneCover();
const oldSplit=splitActiveScene,oldMerge=mergeActiveScene;
splitActiveScene=function(){if(busy)return;closeForm();oldSplit();analysisPage=lapPage=0;renderAnalysisRows();renderLapTable()};
mergeActiveScene=function(){if(busy)return;closeForm();oldMerge();analysisPage=lapPage=0;renderAnalysisRows();renderLapTable()};
$('#splitSceneBtn').onclick=()=>splitActiveScene();$('#mergeSceneBtn').onclick=()=>mergeActiveScene();
removeActiveScene=async function(){
  const s=activeScene();if(!s||busy)return;
  if(!await confirmAction({title:'移除这个序列？',message:`仅移除「${s.title}」的分组。镜头、视频与已填写笔记都会保留，可以撤销。`,accept:'移除序列',danger:true}))return;
  if(!scenes.includes(s)||busy)return;
  rememberEdit(false);scenes=scenes.filter(x=>x!==s);activeSceneId='unassigned';closeForm();lapPage=analysisPage=0;
  renderSceneBoard();renderLapTable();renderAnalysisRows();renderOverviewCurve();scheduleLapSave();
};
$('#groupSceneBtn').onclick=()=>sceneFromSelection(); // S remains compatible with old shortcut routing.
$('#groupSequenceBtn').onclick=()=>sceneFromSelection();
$('#addSceneBtn').onclick=()=>openSceneForm();$('#createSceneBtn').onclick=()=>createManualScene();
$('#cancelSceneBtn').onclick=closeForm;$('#removeSceneBtn').onclick=()=>removeActiveScene();
editButton.onclick=()=>{const s=activeScene();if(s)showForm(s.startShot,s.endShot,s)};
$('#sceneStart').addEventListener('input',updateRangePreview);$('#sceneEnd').addEventListener('input',updateRangePreview);
// Cancel stale range editing when switching files/projects or re-running detection.
const oldLoadVideo=loadVideo;loadVideo=async function(...args){closeForm();return oldLoadVideo(...args)};
const oldAnalyze=analyze;analyze=async function(...args){closeForm();try{return await oldAnalyze(...args)}finally{refreshStillControls();updateSelectionTools()}};
$('#analyzeBtn').onclick=()=>analyze();

// Export from decoded source video, never from the small JPEG thumbnail cache.
const stillControls=document.createElement('section');stillControls.className='stillControls';
stillControls.innerHTML='<h3>静帧导出</h3><label for="stillPosition">每个镜头取帧位置</label><select class="select" id="stillPosition"><option value="middle">中间帧</option><option value="start">第一帧</option></select><p id="stillHint">原画面尺寸 · PNG · 全片每个镜头一张</p><button class="btn" id="exportStillsBtn" disabled>导出所有镜头静帧</button><button class="btn" id="revealStillsBtn" hidden>打开导出文件夹</button>';
$('#workspace .settings').append(stillControls);
let stillOutput='';
function refreshStillControls(){
  $('#exportStillsBtn').disabled=!shots.length||busy||!desktopApi?.exportStills;
  $('#stillHint').textContent=desktopApi?.exportStills?`原画面尺寸 · PNG · 全片 ${shots.length} 个镜头，一镜一张`:'请在新版桌面程序中使用静帧导出';
}
$('#exportStillsBtn').onclick=async()=>{
  if(busy||!shots.length||!desktopApi?.exportStills)return;
  const snapshot={path:sourcePath,shots:shots.map(s=>({start:s.start,end:s.end})),position:$('#stillPosition').value};
  busy=true;cancelled=false;refreshStillControls();$('#cancelBtn').classList.remove('hidden');video.pause();activeEnd=null;
  try{
    const outputDir=await desktopApi.chooseExportFolder();if(!outputDir||cancelled)return;
    const result=await desktopApi.exportStills({...snapshot,outputDir});
    stillOutput=result.outputDir;$('#revealStillsBtn').hidden=false;toast(`已导出 ${result.count} 张 PNG 静帧`);
  }catch(e){toast(cancelled||e.message.includes('__cancel__')?'已取消静帧导出，未完成文件已清理':'静帧导出失败：'+e.message)}
  finally{busy=false;$('#cancelBtn').classList.add('hidden');refreshStillControls();updateSelectionTools()}
};
$('#revealStillsBtn').onclick=()=>desktopApi.revealPath(stillOutput).catch(e=>toast(e.message));

// Annotation distributions: whole-film denominator, explicit blanks, selectable weighting.
const distribution=document.createElement('section');distribution.id='annotationDistribution';distribution.hidden=true;
distribution.innerHTML='<div class="distributionHead"><label for="distributionWeight">统计口径</label><select id="distributionWeight" class="select"><option value="count">按镜头数</option><option value="duration">按时长</option></select><span id="distributionCoverage"></span></div><div id="distributionRows"></div><p class="distributionNote">始终统计全片，未填写也计入总数。自定义文字按完整内容归类；时间条宽度代表镜头时长。</p>';
$('#brightnessSvg').closest('.brightnessWrap')?.append(distribution);
if(!distribution.isConnected)$('#overviewReadout').after(distribution);
const categoryGroup=document.createElementNS('http://www.w3.org/2000/svg','g');categoryGroup.id='annotationBands';
$('#movieBarcode').after(categoryGroup);
for(const [key,label] of Object.entries(categories)){
  const b=document.createElement('button');b.className='metricBtn annotationMetric';b.dataset.metric=key;b.textContent=label;b.setAttribute('role','tab');
  b.onclick=()=>{overviewMetric=key;renderOverviewCurve()};$('.metricTabs').append(b);
}
function categoryColor(label){if(label==='未填写')return '#666b76';let hash=0;for(const c of label)hash=(hash*31+c.codePointAt(0))>>>0;return `hsl(${hash%360} 38% 57%)`}
function renderDistribution(){
  const field=overviewMetric,stats=model.distribution(shots,lapNotes,field,distributionWeight);
  $('#distributionCoverage').textContent=`已填写 ${stats.filled} / ${shots.length} 个镜头`;
  $('#metricSummary').textContent=`全片${categories[field]}分布 · ${distributionWeight==='count'?'按镜头数':'按时长'}`;
  $('#axisTop').textContent='';$('#axisBottom').textContent='';
  $('#overviewReadout').textContent='从左至右：全片时间 · 悬停查看镜头标注';
  $('#brightnessLine').setAttribute('d','');$('#brightnessArea').setAttribute('d','');$('#movieBarcode').setAttribute('visibility','hidden');
  document.querySelectorAll('.brightnessGrid').forEach(g=>g.style.display='none');
  $('#brightnessEmpty').style.display=shots.length?'none':'';$('#brightnessEmpty').textContent='分析镜头并填写拉片表后，在这里查看分布';
  $('#brightnessSvg').setAttribute('aria-label','全片'+categories[field]+'时间分布');
  categoryGroup.replaceChildren();
  if(video.duration)shots.forEach((s,i)=>{
    const value=typeof lapNotes[i]?.[field]==='string'?lapNotes[i][field].trim():'';
    const label=value||'未填写',r=document.createElementNS(categoryGroup.namespaceURI,'rect'),t=document.createElementNS(categoryGroup.namespaceURI,'title');
    r.setAttribute('x',s.start/video.duration*1000);r.setAttribute('y',8);r.setAttribute('width',Math.max(0,(s.end-s.start)/video.duration*1000));r.setAttribute('height',80);r.setAttribute('fill',categoryColor(label));
    t.textContent=`镜头 ${i+1} · ${label} · ${fmt(s.start)}—${fmt(s.end)}`;r.append(t);categoryGroup.append(r);
  });
  const rows=$('#distributionRows');rows.replaceChildren();
  stats.groups.forEach(g=>{
    const row=document.createElement('div');row.className='distributionRow';
    const name=document.createElement('span');name.className='distributionLabel';name.textContent=g.label;name.title=g.label;
    const meter=document.createElement('div');meter.className='distributionMeter';const fill=document.createElement('i');fill.style.width=g.percent+'%';fill.style.background=categoryColor(g.label);meter.append(fill);
    const value=document.createElement('span');value.textContent=`${g.percent.toFixed(1)}% · ${distributionWeight==='count'?g.count+' 镜头':g.duration.toFixed(2)+' 秒'}`;
    row.append(name,meter,value);rows.append(row);
  });renderSceneBands();
}
const oldOverview=renderOverviewCurve;
renderOverviewCurve=function(){
  const lap=appMode==='lap';document.querySelectorAll('.annotationMetric').forEach(b=>b.hidden=!lap);
  if(!lap&&categories[overviewMetric])overviewMetric='brightness';
  const categorical=!!categories[overviewMetric];distribution.hidden=!categorical;categoryGroup.replaceChildren();
  document.querySelectorAll('[data-metric]').forEach(b=>{const on=b.dataset.metric===overviewMetric;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});
  if(categorical)renderDistribution();else oldOverview();
};
$('#distributionWeight').onchange=()=>{distributionWeight=$('#distributionWeight').value;renderOverviewCurve()};
$('#lapBody').addEventListener('input',e=>{if(categories[e.target.dataset.field]){clearTimeout(distributionTimer);distributionTimer=setTimeout(()=>renderOverviewCurve(),120)}});
$('#brightnessSvg').addEventListener('pointermove',e=>{if(!categories[overviewMetric]||!video.duration)return;const r=$('#brightnessSvg').getBoundingClientRect(),t=Math.max(0,Math.min(video.duration,(e.clientX-r.left)/r.width*video.duration)),i=shots.findIndex(s=>t>=s.start&&t<s.end);if(i>=0)$('#overviewReadout').textContent=`${fmt(t)} · 镜头 ${i+1} · ${categories[overviewMetric]}：${lapNotes[i]?.[overviewMetric]||'未填写'}`});
const oldRender=render;render=function(){oldRender();refreshStillControls();renderOverviewCurve()};
const oldMode=applyModeView;applyModeView=function(){oldMode();renderSceneTabs();renderOverviewCurve();refreshStillControls()};
const oldUpdateSelection=updateSelectionTools;updateSelectionTools=function(){oldUpdateSelection();refreshStillControls()};
refreshStillControls();renderSceneTabs();renderOverviewCurve();
})();
