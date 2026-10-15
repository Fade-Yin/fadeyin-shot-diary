/* Covers are small embedded JPEGs in project metadata, never external file paths. */
(()=>{
const camera='<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8" cy="9" r="1.5"/><path d="m4 18 5-5 3 3 4-5 5 6"/></svg>';
const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.hidden=true;document.body.append(input);let targetId='';
function decorate(){for(const entry of document.querySelectorAll('.projectEntry')){
  const button=entry.querySelector('.projectItem');if(!button)continue;
  if(!button.querySelector('.projectCover')){const blank=document.createElement('span');blank.className='projectCover projectCoverEmpty';blank.innerHTML=camera;button.prepend(blank)}
  if(entry.querySelector('.projectCoverEdit'))continue;
  const edit=document.createElement('button');edit.className='projectCoverEdit';edit.innerHTML=camera;edit.title='选择项目封面（默认第 24 帧）';edit.setAttribute('aria-label','选择项目封面：'+button.title);
  edit.onclick=e=>{e.stopPropagation();if(busy||videoLoading||projectLoading)return;targetId=button.dataset.projectId;input.value='';input.click()};entry.append(edit);
}}
function jpeg(image){const c=document.createElement('canvas'),ratio=Math.min(1,320/Math.max(image.videoWidth||image.naturalWidth,image.videoHeight||image.naturalHeight));c.width=Math.max(1,Math.round((image.videoWidth||image.naturalWidth)*ratio));c.height=Math.max(1,Math.round((image.videoHeight||image.naturalHeight)*ratio));c.getContext('2d').drawImage(image,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.85)}
input.onchange=async()=>{
 const file=input.files[0],id=targetId;if(!file||busy||videoLoading||projectLoading)return;
 if(file.size>20*1024*1024)return toast('封面图片请小于 20 MB');
 const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();const cover=jpeg(image);
 await projectWriteQueue;
 if(id===lapStorageKey()){lapMeta._projectCover=cover;lapMeta._coverCustom=true;const localSaved=saveLapNotes();await projectWriteQueue;if(!localSaved||$('#lapSaveStatus').textContent.includes('失败'))throw new Error('本机保存失败，请导出备份后重试')}
 else{projectWriteQueue=projectWriteQueue.then(async()=>{const record=await projectGet(id);if(!record)throw new Error('项目已删除');record.meta={...record.meta,_projectCover:cover,_coverCustom:true};record.updatedAt=Date.now();await projectPut(record)});await projectWriteQueue;await refreshProjectList()}
 toast('项目封面已更新');
 }catch(e){projectWriteQueue=projectWriteQueue.catch(()=>{});toast('封面保存失败：'+e.message)}finally{URL.revokeObjectURL(url)}
};
const oldRefresh=refreshProjectList;refreshProjectList=async function(...args){const result=await oldRefresh.apply(this,args);decorate();return result};decorate();
let generation=0;
const oldLoad=loadVideo;loadVideo=async function(...args){if(busy||videoLoading)return oldLoad.apply(this,args);const token=++generation;await oldLoad.apply(this,args);if(token!==generation||!sourceFile||videoLoading||!sourceUrl||lapMeta._projectCover)return;
 const id=lapStorageKey(),url=sourceUrl,v=document.createElement('video');v.muted=true;v.preload='auto';let timeout;
 try{
  await new Promise((resolve,reject)=>{timeout=setTimeout(()=>reject(new Error('读取封面超时')),15000);v.onloadedmetadata=()=>{const time=Math.min(23/Math.max(1,nativeFps),Math.max(0,v.duration-1/Math.max(1,nativeFps)));v.onseeked=resolve;v.currentTime=time;if(time===0)v.onloadeddata=resolve};v.onerror=()=>reject(new Error('无法读取封面'));v.src=url});
  if(token!==generation||id!==lapStorageKey()||lapMeta._projectCover)return;
  lapMeta._projectCover=jpeg(v);lapMeta._coverCustom=false;saveLapNotes();await projectWriteQueue;
 }catch(e){if(id===lapStorageKey())toast('默认封面未生成，可手动选择图片')}finally{clearTimeout(timeout);v.removeAttribute('src');v.load()}
};
})();
