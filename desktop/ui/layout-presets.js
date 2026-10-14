(()=>{
const key='pianlala.layout-presets.v1';let presets=[];
try{const parsed=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(parsed))presets=parsed.filter(p=>typeof p.name==='string'&&p.tree).slice(0,20)}catch{}
const button=document.createElement('button');button.className='btn layoutTool';button.innerHTML='<svg class="workbenchIcon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M9 14h12"/></svg>';button.title='布局';button.setAttribute('aria-label','布局');
$('#shortcutHelpBtn').before(button);
const dialog=document.createElement('dialog');dialog.className='confirmDialog';dialog.setAttribute('aria-labelledby','layoutTitle');
dialog.id='layoutPopover';
dialog.dataset.popoverWidth='280';
dialog.innerHTML='<h2 id="layoutTitle">布局</h2><label class="settingsRow">布局名称<input id="layoutName" maxlength="40" placeholder="例如：拉片、镜头分析"></label><button class="btn" id="saveLayout">保存当前布局</button><label class="settingsRow">已保存布局<select class="select" id="savedLayouts"></select></label><div class="confirmActions"><button class="btn" id="loadLayout">应用</button><button class="btn" id="defaultLayout">恢复默认</button><button class="btn" id="closeLayouts">关闭</button></div>';
document.body.append(dialog);
window.PianlalaPopover(dialog,button);
const name=dialog.querySelector('#layoutName'),list=dialog.querySelector('#savedLayouts');
function refresh(){list.replaceChildren();presets.forEach((p,i)=>{const option=document.createElement('option');option.value=i;option.textContent=p.name;list.append(option)});dialog.querySelector('#loadLayout').disabled=!presets.length;refreshQuick()}
const quick=document.createElement('div');quick.className='layoutQuick';dialog.prepend(quick);
const resetColumns=$('#resetColumnsBtn');if(resetColumns){resetColumns.classList.add('layoutMenuItem');resetColumns.textContent='恢复拉片表格列布局';quick.after(resetColumns)}
$('#settingsLayout')?.closest('section').remove();
const split=(axis,ratio,a,b)=>({axis,ratio,a,b});
function quickItem(label,action){const b=document.createElement('button');b.className='btn layoutMenuItem';b.textContent=label;b.onclick=()=>{if(busy)return;try{if(action()!==false)dialog.close()}catch(e){toast(e.message)}};quick.append(b)}
function refreshQuick(){quick.replaceChildren();quickItem('默认布局',()=>window.PianlalaLayout.reset());quickItem('播放器在左',()=>window.PianlalaLayout.apply(split('h',.45,'player',split('v',.4,split('h',.3,'library',split('h',.65,'timeline','settings')),'study'))));quickItem('镜头工作区优先',()=>window.PianlalaLayout.apply(split('v',.32,split('h',.18,'library',split('h',.7,'player',split('h',.65,'timeline','settings'))),'study')));presets.forEach(p=>quickItem(p.name,()=>window.PianlalaLayout.apply(p.tree)))}
button.onclick=()=>{if(busy)return;refresh();refreshQuick();dialog.showModal()};
dialog.querySelector('#saveLayout').onclick=()=>{if(busy)return;const label=name.value.trim();if(!label)return name.focus();const next={name:label,tree:window.PianlalaLayout.get()},index=presets.findIndex(p=>p.name===label);const updated=presets.slice();if(index>=0)updated[index]=next;else{if(updated.length>=20)return toast('最多保存 20 个布局');updated.push(next)}try{localStorage.setItem(key,JSON.stringify(updated));presets=updated;refresh();toast('布局已保存')}catch{toast('布局保存失败：本机存储不可用')}};
dialog.querySelector('#loadLayout').onclick=()=>{try{const p=presets[Number(list.value)];if(p&&window.PianlalaLayout.apply(p.tree))dialog.close()}catch(e){toast(e.message)}};
dialog.querySelector('#defaultLayout').onclick=()=>{if(window.PianlalaLayout.reset())dialog.close()};
dialog.querySelector('#closeLayouts').onclick=()=>dialog.close();
const style=document.createElement('style');style.textContent='#layoutName{min-width:0;width:100%;padding:8px;border:1px solid var(--line);border-radius:6px;background:var(--surface-input);color:var(--text);font:inherit}.confirmDialog:has(#layoutName) .settingsRow{display:grid;gap:8px;margin:16px 0;font-size:12px}';document.head.append(style);
})();
