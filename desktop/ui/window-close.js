// Windows close asks explicitly; closing a dialog without choosing never quits.
(()=>{
if(desktopApi?.platform!=='win32'||!desktopApi.onCloseRequested)return;
const d=document.createElement('dialog');d.id='windowCloseDialog';d.className='confirmDialog';
d.setAttribute('aria-labelledby','windowCloseTitle');
d.innerHTML='<h2 id="windowCloseTitle">关闭片拉拉</h2><p id="windowCloseMessage"></p><div class="confirmActions"><button class="btn" data-close-choice="cancel" autofocus>取消</button><button class="btn" data-close-choice="tray">最小化到托盘</button><button class="btn primary" data-close-choice="quit">退出程序</button></div>';
document.body.append(d);let submitting=false,refreshTimer=null;
const exit=d.querySelector('[data-close-choice="quit"]'),message=d.querySelector('p');
function working(){return busy||videoLoading||projectLoading}
function refresh(){exit.disabled=working()||submitting;message.textContent=working()?'任务正在进行，可最小化到右下角托盘继续处理。请先完成或取消任务后退出。':'最小化后仍在后台运行，点击右下角托盘图标可恢复。退出前会保存当前拉片记录。'}
async function choose(choice){
 if(submitting||choice==='quit'&&working())return;submitting=true;
 try{
   if(choice==='quit'&&sourceFile){
     clearTimeout(lapSaveTimer);
     if(!saveLapNotes())throw new Error('笔记保存失败，请先导出备份再退出');
     await projectWriteQueue;
     if($('#lapSaveStatus').textContent.includes('失败'))throw new Error('项目保存失败，请先导出备份再退出');
   }
   await desktopApi.closeChoice(choice);d.close();clearInterval(refreshTimer);refreshTimer=null;
 }catch(e){message.textContent=e.message;clearInterval(refreshTimer);refreshTimer=null}
 finally{submitting=false;exit.disabled=working()}
}
d.addEventListener('click',e=>{const b=e.target.closest('[data-close-choice]');if(b)choose(b.dataset.closeChoice)});
d.addEventListener('cancel',e=>{e.preventDefault();choose('cancel')});
desktopApi.onCloseRequested(()=>{if(!d.open){refresh();d.showModal();d.querySelector('[autofocus]').focus();refreshTimer=setInterval(refresh,400)}});
})();
