/* 0.9 Tahoe design layer: Liquid Glass materials, SF Symbols-style glyphs, command palette and context menus.
   Presentation and navigation only — every command proxies an existing control so project, edit and export engines stay authoritative. */
(()=>{
'use strict';
const html=document.documentElement,isMac=(window.desktopApi?.platform||navigator.platform||'').toLowerCase().includes('mac')||/darwin/.test(html.dataset.platform||'');
html.dataset.ui='tahoe';
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='tahoe.css';document.head.append(sheet);
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const F='fill="currentColor" stroke="none"';

// SF Symbols-inspired glyphs: 24pt grid, 1.6 stroke, rounded joins, filled transport glyphs.
const glyphs={
 film:'<rect x="3.5" y="4.5" width="17" height="15" rx="3.2"/><path d="M8 4.5v15M16 4.5v15M3.5 9.5H8M3.5 14.5H8M16 9.5h4.5M16 14.5h4.5"/>',
 notes:'<rect x="4" y="3.5" width="16" height="17" rx="3.4"/><circle cx="8.3" cy="8.5" r=".9" '+F+'/><circle cx="8.3" cy="12" r=".9" '+F+'/><circle cx="8.3" cy="15.5" r=".9" '+F+'/><path d="M11 8.5h5M11 12h5M11 15.5h3.5"/>',
 timeline:'<rect x="3" y="5" width="9" height="4.2" rx="1.6"/><rect x="8" y="10.4" width="13" height="4.2" rx="1.6"/><rect x="3" y="15.8" width="7" height="4.2" rx="1.6"/><path d="M14.5 3v18" stroke-width="1.4"/>',
 layout:'<rect x="3" y="4" width="18" height="16" rx="3.6"/><path d="M9.5 4v16M9.5 12H21"/>',
 sidebar:'<rect x="3" y="4" width="18" height="16" rx="3.6"/><path d="M9 4v16"/><path d="M5.3 8h1.6M5.3 11h1.6M5.3 14h1.6" stroke-width="1.3"/>',
 keyboard:'<rect x="2.5" y="5.5" width="19" height="13" rx="3.2"/><path d="M6.5 9.5h.01M9.5 9.5h.01M12.5 9.5h.01M15.5 9.5h.01M17.5 9.5h.01M7.5 12.3h.01M10.5 12.3h.01M13.5 12.3h.01M16.5 12.3h.01M8 15.2h8" stroke-width="1.8"/>',
 settings:'<path d="M10.3 3.2h3.4l.5 2.4 1.6.9 2.3-.8 1.7 2.9-1.8 1.6v1.6l1.8 1.6-1.7 2.9-2.3-.8-1.6.9-.5 2.4h-3.4l-.5-2.4-1.6-.9-2.3.8-1.7-2.9 1.8-1.6v-1.6L4.2 8.6l1.7-2.9 2.3.8 1.6-.9Z"/><circle cx="12" cy="12" r="2.8"/>',
 export:'<path d="M12 14.5V3.5M8.3 7 12 3.3 15.7 7"/><path d="M8.5 10H7a2.5 2.5 0 0 0-2.5 2.5v5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 17 10h-1.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.3"/><path d="m15.2 15.2 5 5"/>',
 play:'<path '+F+' d="M8 5.3c0-1 1.1-1.6 1.9-1.1l9.8 6.6c.8.5.8 1.7 0 2.2l-9.8 6.6C9.1 20.3 8 19.7 8 18.7Z"/>',
 pause:'<rect '+F+' x="6.5" y="4.5" width="4" height="15" rx="1.3"/><rect '+F+' x="13.5" y="4.5" width="4" height="15" rx="1.3"/>',
 previous:'<rect '+F+' x="4.5" y="5" width="2.4" height="14" rx="1.1"/><path '+F+' d="M19.5 6.2c0-.9-1-1.4-1.7-.9l-8.6 5.8c-.6.4-.6 1.4 0 1.8l8.6 5.8c.7.5 1.7 0 1.7-.9Z"/>',
 next:'<rect '+F+' x="17.1" y="5" width="2.4" height="14" rx="1.1"/><path '+F+' d="M4.5 6.2c0-.9 1-1.4 1.7-.9l8.6 5.8c.6.4.6 1.4 0 1.8l-8.6 5.8c-.7.5-1.7 0-1.7-.9Z"/>',
 back:'<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',forward:'<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
 camera:'<path d="M4.5 7.5h2.7l1.5-2.2c.3-.5.8-.8 1.4-.8h3.8c.6 0 1.1.3 1.4.8l1.5 2.2h2.7A1.5 1.5 0 0 1 21 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1.5 1.5 0 0 1 1.5-1.5Z"/><circle cx="12" cy="13.2" r="3.6"/>',
 volume:'<path '+F+' d="M3.5 9.6c0-.6.5-1.1 1.1-1.1h2.8l4.2-3.6c.7-.6 1.9-.1 1.9.9v12.4c0 1-1.2 1.5-1.9.9l-4.2-3.6H4.6c-.6 0-1.1-.5-1.1-1.1Z"/><path d="M16.3 9a4.2 4.2 0 0 1 0 6M18.9 6.4a8 8 0 0 1 0 11.2"/>',
 mute:'<path '+F+' d="M3.5 9.6c0-.6.5-1.1 1.1-1.1h2.8l4.2-3.6c.7-.6 1.9-.1 1.9.9v12.4c0 1-1.2 1.5-1.9.9l-4.2-3.6H4.6c-.6 0-1.1-.5-1.1-1.1Z"/><path d="m16.5 9.5 5 5m0-5-5 5"/>',
 fullscreen:'<path d="M14.5 3.8h5.7v5.7M20.2 3.8l-6 6M9.5 20.2H3.8v-5.7M3.8 20.2l6-6"/>',
 sliders:'<path d="M4 7h9M18 7h2M4 12h3M12 12h8M4 17h11M20 17h0"/><circle cx="15.5" cy="7" r="2.2"/><circle cx="9.5" cy="12" r="2.2"/><circle cx="17.5" cy="17" r="2.2"/>',
 undo:'<path d="M8.5 5 4 9.5 8.5 14"/><path d="M4 9.5h10.5a5.5 5.5 0 0 1 0 11H11"/>',
 redo:'<path d="M15.5 5 20 9.5 15.5 14"/><path d="M20 9.5H9.5a5.5 5.5 0 0 0 0 11H13"/>',
 select:'<path d="M5.5 3.8 18.6 11c.8.4.6 1.6-.3 1.7l-5.4.8-2.7 4.8c-.4.8-1.6.6-1.7-.3Z"/>',
 blade:'<circle cx="6.5" cy="17.5" r="2.8"/><circle cx="17.5" cy="17.5" r="2.8"/><path d="m8.4 15.4 9.1-11.9M15.6 15.4 6.5 3.5"/>',
 merge:'<path d="M5 4v4.5a4 4 0 0 0 1.6 3.2L12 16M19 4v4.5a4 4 0 0 1-1.6 3.2L12 16v4.5"/><path d="m2.8 6.2 2.2-2.4 2.2 2.4M16.8 6.2 19 3.8l2.2 2.4"/>',
 close:'<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',minus:'<path d="M5.5 12h13"/>',
 list:'<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1.1" '+F+'/><circle cx="4.8" cy="12" r="1.1" '+F+'/><circle cx="4.8" cy="17.5" r="1.1" '+F+'/>',
 grid:'<rect x="3.5" y="3.5" width="7.2" height="7.2" rx="2"/><rect x="13.3" y="3.5" width="7.2" height="7.2" rx="2"/><rect x="3.5" y="13.3" width="7.2" height="7.2" rx="2"/><rect x="13.3" y="13.3" width="7.2" height="7.2" rx="2"/>',
 folder:'<path d="M3 7.5V6a2 2 0 0 1 2-2h4.2c.5 0 1 .2 1.4.6L12.2 6H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 9.5h18"/>',
 sun:'<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>',
 moon:'<path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2Z"/>',
 desktop:'<rect x="2.8" y="4" width="18.4" height="12.5" rx="2.6"/><path d="M9 20.5h6M12 16.5v4"/>',
 command:'<path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H17.5A2.5 2.5 0 1 0 15 6.5v11a2.5 2.5 0 1 0 2.5-2.5h-11A2.5 2.5 0 1 0 9 17.5Z"/>',
 scope:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
 sparkles:'<path d="M10 3.5 11.6 8a2 2 0 0 0 1.2 1.2l4.5 1.6-4.5 1.6a2 2 0 0 0-1.2 1.2L10 18l-1.6-4.4a2 2 0 0 0-1.2-1.2L2.7 10.8l4.5-1.6A2 2 0 0 0 8.4 8Z"/><path d="M18 3v4M16 5h4M18.5 16v3.5M16.75 17.75h3.5"/>'
};
const svg=(name,cls='')=>`<svg class="tahoeGlyph ${cls}" data-glyph="${name}" viewBox="0 0 24 24" aria-hidden="true">${glyphs[name]||''}</svg>`;
window.PianlalaGlyph=svg;

// Re-skin every glyph the workbench renders, including ones it swaps later (play ⇄ pause, mute).
function reskin(root=document){
 for(const b of root.querySelectorAll?.('[data-icon-key]')||[]){const name=b.dataset.iconKey.split('|')[0],icon=b.querySelector('svg.macIcon');if(!icon||!glyphs[name]||icon.dataset.glyph===name)continue;icon.innerHTML=glyphs[name];icon.dataset.glyph=name;icon.classList.add('tahoeGlyph')}
 for(const [sel,name] of [['[data-theme-mode="light"]:not([data-icon-key])','sun'],['[data-theme-mode="dark"]:not([data-icon-key])','moon'],['[data-theme-mode="system"]:not([data-icon-key])','desktop'],['#undoBtn:not([data-icon-key])','undo'],['#redoBtn:not([data-icon-key])','redo']]){const icon=root.querySelector?.(sel+' svg');if(icon&&icon.dataset.glyph!==name){icon.innerHTML=glyphs[name];icon.dataset.glyph=name;icon.classList.add('tahoeGlyph')}}
}
reskin();
// New controls use PianlalaGlyph at creation. Only added controls need legacy conversion;
// timecode and progress text changes must not rescan every shot and toolbar button.
new MutationObserver(records=>{
 const added=new Set();for(const record of records)for(const node of record.addedNodes){
  if(node.nodeType!==1||node.closest?.('svg'))continue;
  if(node.matches?.('[data-icon-key]'))reskin(node.parentElement);
  else if(node.querySelector?.('[data-icon-key]'))added.add(node);
 }
 for(const node of added)reskin(node);
}).observe(document.body,{childList:true,subtree:true});
const aiBtn=q('#aiBtn');if(aiBtn&&!aiBtn.querySelector('svg'))aiBtn.innerHTML=svg('sparkles')+'<span>AI 拉片</span>';

// Unified toolbar: sidebar toggle at the leading edge, a search field that opens the command palette.
const top=q('.editorTopbar'),title=q('.macDocumentTitle'),utilities=q('.editorTopbar .macUtilities');
const toolbarButton=(name,label,action,cls='')=>{const b=document.createElement('button');b.type='button';b.className='btn tahoeToolbarButton '+cls;b.innerHTML=svg(name);b.title=label;b.setAttribute('aria-label',label);b.onclick=action;return b};
const sidebarKey='pianlala.tahoe.sidebar';
function setSidebar(open){html.dataset.sidebar=open?'open':'hidden';localStorage.setItem(sidebarKey,open?'open':'hidden');sidebarBtn.setAttribute('aria-pressed',String(open));window.dispatchEvent(new Event('resize'))}
const sidebarBtn=toolbarButton('sidebar',`显示或隐藏项目边栏（${isMac?'⌃⌘S':'Ctrl+Alt+S'}）`,()=>setSidebar(html.dataset.sidebar==='hidden'));
const leading=document.createElement('div');leading.className='tahoeLeading';leading.append(sidebarBtn);if(title)title.before(leading);else top?.prepend(leading);
setSidebar(localStorage.getItem(sidebarKey)!=='hidden');
const searchField=document.createElement('button');searchField.type='button';searchField.className='tahoeSearchField';searchField.innerHTML=svg('search')+'<span>搜索项目、镜头和命令</span><kbd>'+(isMac?'⌘K':'Ctrl K')+'</kbd>';searchField.onclick=()=>openPalette();
if(utilities){utilities.prepend(searchField);
 const group=document.createElement('div');group.className='tahoeGroup';group.append(...[...utilities.querySelectorAll('.notesTool,.layoutTool,#shortcutHelpBtn,.settingsGear')]);utilities.insertBefore(group,utilities.querySelector('.toolbarExport'))}

// Command palette (⌘K): every entry proxies an existing control, so permissions and disabled states stay identical.
const press=sel=>()=>{const el=typeof sel==='function'?sel():q(sel);if(el&&!el.disabled)el.click()};
const transportBtn=label=>()=>qa('.macPlayback button,.macPlayerUtilities button').find(b=>(b.getAttribute('aria-label')||'').startsWith(label));
const commands=[
 {group:'文件',icon:'folder',title:'打开视频…',keys:isMac?'⌘O':'Ctrl O',run:()=>q('#file')?.click()},
 {group:'文件',icon:'plus',title:'新建拉片项目',run:press('#newProjectBtn')},
 {group:'文件',icon:'export',title:'导出…',run:press('.toolbarExport')},
 {group:'视图',icon:'film',title:'切换到 分析',keys:'',run:press('[data-app-mode="analysis"]')},
 {group:'视图',icon:'notes',title:'切换到 拉片',run:press('[data-app-mode="lap"]')},
 {group:'视图',icon:'timeline',title:'切换到 时间线',run:press('[data-app-mode="timeline"]')},
 {group:'视图',icon:'sidebar',title:'显示或隐藏项目边栏',keys:isMac?'⌃⌘S':'Ctrl Alt S',run:()=>setSidebar(html.dataset.sidebar==='hidden')},
 {group:'视图',icon:'layout',title:'工作区布局…',run:press('.layoutTool')},
 {group:'视图',icon:'fullscreen',title:'全屏预览',run:press(transportBtn('全屏'))},
 {group:'播放',icon:'play',title:'播放 / 暂停',keys:'Space',run:press(()=>q('.macMainPlay'))},
 {group:'播放',icon:'previous',title:'上一镜头',run:press(transportBtn('上一镜头'))},
 {group:'播放',icon:'next',title:'下一镜头',run:press(transportBtn('下一镜头'))},
 {group:'播放',icon:'camera',title:'截取当前画面',keys:'C',run:press('#captureFrameBtn')},
 {group:'编辑',icon:'scope',title:'检测切点',run:press('#analyzeBtn')},
 {group:'编辑',icon:'sliders',title:'检测选项…',run:press(()=>qa('.detectionToolbar button').find(b=>b.getAttribute('aria-label')==='检测选项'))},
 {group:'编辑',icon:'select',title:'选择工具',keys:'V',run:press('#selectTool')},
 {group:'编辑',icon:'blade',title:'切分工具',keys:'B',run:press('#bladeTool')},
 {group:'编辑',icon:'undo',title:'撤销',keys:isMac?'⌘Z':'Ctrl Z',run:press('#undoBtn')},
 {group:'编辑',icon:'redo',title:'重做',keys:isMac?'⇧⌘Z':'Ctrl Y',run:press('#redoBtn')},
 {group:'编辑',icon:'plus',title:'新建序列',run:press('#addSceneBtn')},
 {group:'编辑',icon:'notes',title:'项目备注…',run:press('.notesTool')},
 {group:'AI',icon:'sparkles',title:'AI 辅助拉片…',run:press('#aiBtn')},
 {group:'外观',icon:'sun',title:'外观：浅色',run:()=>q('[data-theme-mode="light"]')?.click()},
 {group:'外观',icon:'moon',title:'外观：深色',run:()=>q('[data-theme-mode="dark"]')?.click()},
 {group:'外观',icon:'desktop',title:'外观：跟随系统',run:()=>q('[data-theme-mode="system"]')?.click()},
 {group:'帮助',icon:'keyboard',title:'键盘快捷键',keys:'?',run:press('#shortcutHelpBtn')},
 {group:'帮助',icon:'settings',title:'设置…',keys:isMac?'⌘,':'Ctrl ,',run:press('.settingsGear')}
];
const palette=document.createElement('dialog');palette.className='tahoePalette';palette.setAttribute('aria-label','命令面板');
palette.innerHTML=`<div class="tahoePaletteField">${svg('search')}<input type="text" role="combobox" aria-expanded="true" aria-controls="tahoePaletteList" aria-autocomplete="list" placeholder="搜索项目、镜头编号或命令" spellcheck="false" autocomplete="off"><kbd>esc</kbd></div><div class="tahoePaletteList" id="tahoePaletteList" role="listbox"></div><footer><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↩</kbd> 执行</span><span>输入数字跳到镜头</span></footer>`;
document.body.append(palette);
const pInput=palette.querySelector('input'),pList=palette.querySelector('.tahoePaletteList');let pItems=[],pIndex=0;
const norm=s=>(s||'').toLocaleLowerCase().replace(/\s+/g,'');
function score(text,query){if(!query)return 1;const t=norm(text),qq=norm(query);if(t.includes(qq))return 3-t.indexOf(qq)/100;let i=0;for(const c of t)if(c===qq[i])i++;return i===qq.length?1:0}
function entries(query){
 const out=[];const n=query.trim().match(/^#?(\d{1,4})$/);
 if(n&&typeof shots!=='undefined'&&shots.length){const i=Math.min(shots.length,Math.max(1,+n[1]))-1;out.push({group:'镜头',icon:'film',title:`跳到镜头 ${String(i+1).padStart(2,'0')}`,meta:typeof frameFmt==='function'?frameFmt(shots[i].start):'',run:()=>{video.currentTime=shots[i].start}})}
 for(const item of qa('#projectList .projectEntry')){const p=item.querySelector('.projectItem');if(!p)continue;const name=p.querySelector('b')?.textContent||p.textContent;out.push({group:'项目',icon:'folder',title:name.trim(),meta:p.querySelector('small')?.textContent?.trim()||'',active:p.classList.contains('active'),run:()=>p.click(),rank:.5})}
 for(const c of commands)out.push(c);
 return out.map(e=>({...e,s:score(e.title+' '+e.group,query)*(e.rank??1)})).filter(e=>e.s>0).sort((a,b)=>query?b.s-a.s:0);
}
function renderPalette(){
 const query=pInput.value;pItems=entries(query).slice(0,60);pIndex=Math.min(pIndex,Math.max(0,pItems.length-1));
 if(!pItems.length){pList.innerHTML='<div class="tahoePaletteEmpty">没有匹配的结果</div>';return}
 let last='';pList.innerHTML=pItems.map((e,i)=>{const head=!query&&e.group!==last?`<div class="tahoePaletteGroup">${e.group}</div>`:'';last=e.group;return head+`<div class="tahoePaletteItem" role="option" id="tp-${i}" data-i="${i}" aria-selected="${i===pIndex}">${svg(e.icon)}<span class="t">${escapeText(e.title)}</span>${e.meta?`<small>${escapeText(e.meta)}</small>`:''}${e.keys?`<kbd>${e.keys}</kbd>`:''}</div>`}).join('');
 pInput.setAttribute('aria-activedescendant','tp-'+pIndex);pList.querySelector('[aria-selected=true]')?.scrollIntoView({block:'nearest'});
}
const escapeText=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function openPalette(){if(palette.open)return;qa(':popover-open').forEach(p=>{try{p.hidePopover()}catch{}});pInput.value='';pIndex=0;renderPalette();palette.showModal();pInput.focus()}
function runPalette(i){const e=pItems[i];if(!e)return;palette.close();setTimeout(()=>{try{e.run()}catch(err){window.toast?.(err.message)}},0)}
pInput.addEventListener('input',()=>{pIndex=0;renderPalette()});
pInput.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();pIndex=(pIndex+(e.key==='ArrowDown'?1:-1)+pItems.length)%Math.max(1,pItems.length);renderPalette()}else if(e.key==='Enter'&&!e.isComposing){e.preventDefault();runPalette(pIndex)}});
pList.addEventListener('pointermove',e=>{const it=e.target.closest('.tahoePaletteItem');if(it&&+it.dataset.i!==pIndex){pIndex=+it.dataset.i;pList.querySelectorAll('.tahoePaletteItem').forEach(x=>x.setAttribute('aria-selected',String(+x.dataset.i===pIndex)))}});
pList.addEventListener('click',e=>{const it=e.target.closest('.tahoePaletteItem');if(it)runPalette(+it.dataset.i)});
palette.addEventListener('click',e=>{if(e.target===palette)palette.close()});

// Context menus on shots: the menu lists the card's own actions plus navigation.
// Manual popover: an auto popover would be light-dismissed by the same right-click's pointerup.
const menu=document.createElement('div');menu.className='tahoeMenu';menu.setAttribute('popover','manual');
let menuReturnFocus=null;
const hideMenu=()=>{if(!menu.matches(':popover-open'))return;const hadFocus=menu.contains(document.activeElement);menu.hidePopover();if(hadFocus){if(menuReturnFocus?.isConnected)menuReturnFocus.focus({preventScroll:true});else document.activeElement?.blur?.()}menuReturnFocus=null};
document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))hideMenu()},true);
for(const ev of ['blur','resize'])window.addEventListener(ev,hideMenu);document.addEventListener('scroll',hideMenu,true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.matches(':popover-open')){e.preventDefault();e.stopImmediatePropagation();hideMenu()}},true);menu.setAttribute('role','menu');document.body.append(menu);
function showMenu(x,y,items){menu.innerHTML='';for(const it of items){if(it==='-'){menu.append(Object.assign(document.createElement('hr'),{}));continue}const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.className=it.danger?'danger':'';b.disabled=!!it.disabled;b.innerHTML=svg(it.icon||'')+'<span>'+escapeText(it.title)+'</span>'+(it.keys?'<kbd>'+it.keys+'</kbd>':'');b.onclick=()=>{hideMenu();it.run()};menu.append(b)}
 hideMenu();const prev=document.activeElement;menu.showPopover();menuReturnFocus=prev&&prev!==document.body?prev:null;const r=menu.getBoundingClientRect();menu.style.left=Math.min(x,innerWidth-r.width-8)+'px';menu.style.top=Math.min(y,innerHeight-r.height-8)+'px';menu.querySelector('button:not(:disabled)')?.focus()}
menu.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();const all=[...menu.querySelectorAll('button:not(:disabled)')],i=all.indexOf(document.activeElement);all[(i+(e.key==='ArrowDown'?1:-1)+all.length)%all.length]?.focus()});
const iconFor=label=>/合并/.test(label)?'merge':/切分|拆分/.test(label)?'blade':/播放/.test(label)?'play':/删除|移除/.test(label)?'close':/封面|截图/.test(label)?'camera':'forward';
document.addEventListener('contextmenu',e=>{
 const card=e.target.closest('#rows .shotRow,.lapRow,#lapBody tr');if(!card||e.target.closest('input,textarea,select,[contenteditable]'))return;
 e.preventDefault();const idx=Number(card.querySelector('[data-shot-index]')?.dataset.shotIndex??[...card.parentElement.children].indexOf(card));
 const items=[];if(typeof shots!=='undefined'&&shots[idx])items.push({icon:'forward',title:`跳到镜头 ${String(idx+1).padStart(2,'0')}`,run:()=>{video.currentTime=shots[idx].start}});
 const own=[...card.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.getAttribute('aria-label')||b.textContent.trim()));
 if(own.length&&items.length)items.push('-');
 for(const b of own){const label=(b.getAttribute('aria-label')||b.title||b.textContent).trim();items.push({icon:iconFor(label),title:label,disabled:b.disabled,danger:/删除|移除/.test(label),run:()=>b.click()})}
 if(items.length)showMenu(e.clientX,e.clientY,items);
});

const projectMenu=q('.projectContextMenu');
if(projectMenu){projectMenu.setAttribute('popover','manual');
 const hideProjectMenu=()=>{if(projectMenu.matches(':popover-open'))projectMenu.hidePopover()};
 document.addEventListener('pointerdown',e=>{if(!projectMenu.contains(e.target))hideProjectMenu()},true);
 projectMenu.addEventListener('click',()=>setTimeout(hideProjectMenu,0));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&projectMenu.matches(':popover-open')){e.preventDefault();e.stopImmediatePropagation();hideProjectMenu()}},true);
 for(const ev of ['blur','resize'])window.addEventListener(ev,hideProjectMenu)}

// Global shortcuts: ⌘K palette, ⌃⌘S (macOS) / Ctrl+Alt+S sidebar.
document.addEventListener('keydown',e=>{
 if(e.isComposing||e.repeat||e.getModifierState?.('AltGraph'))return;const mod=isMac?e.metaKey:e.ctrlKey,code=e.code;
 const typing=!!e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable=false])')&&!palette.contains(e.target);
 const otherSurface=!!document.querySelector('dialog[open]:not(.tahoePalette),:popover-open:not(.tahoeMenu)');
 if(mod&&!e.shiftKey&&!e.altKey&&code==='KeyK'){if(typing||otherSurface)return;e.preventDefault();e.stopImmediatePropagation();palette.open?palette.close():openPalette();return}
 if(code==='KeyS'&&!e.shiftKey&&(isMac?(e.metaKey&&e.ctrlKey&&!e.altKey):(e.ctrlKey&&e.altKey&&!e.metaKey))){if(typing)return;e.preventDefault();e.stopImmediatePropagation();setSidebar(html.dataset.sidebar==='hidden');return}
 if(mod&&!e.shiftKey&&!e.altKey&&code==='KeyO'){if(typing||otherSurface||palette.open)return;e.preventDefault();q('#file')?.click()}
},true);

// Segmented controls get a sliding selection thumb, like AppKit's NSSegmentedControl on macOS 26.
function thumb(group,selector){if(!group)return;const t=document.createElement('i');t.className='tahoeThumb';t.setAttribute('aria-hidden','true');group.prepend(t);group.classList.add('tahoeSegmented');
 const place=()=>{const on=group.querySelector(selector);if(!on||!on.offsetWidth){t.style.opacity='0';return}t.style.opacity='1';t.style.width=on.offsetWidth+'px';t.style.transform=`translateX(${on.offsetLeft}px)`};
 new MutationObserver(place).observe(group,{subtree:true,attributes:true,attributeFilter:['aria-selected','aria-pressed','class']});new ResizeObserver(place).observe(group);requestAnimationFrame(place)}
thumb(q('.modeSwitch'),'[aria-selected=true]');
thumb(q('.macViewSwitch'),'[aria-pressed=true]');
const themeSwitch=q('#settingsTheme')||q('.themeSwitch');thumb(themeSwitch,'.active,[aria-pressed=true]');

// Slider fill follows each range's value; several are moved programmatically during playback.
const rangeValues=new WeakMap();
function syncRange(r){if(r.classList.contains('macPlayerScrub'))return;const min=+r.min||0,max=r.max===''?100:+r.max,v=+r.value,key=min+'|'+max+'|'+v;if(rangeValues.get(r)===key)return;rangeValues.set(r,key);r.style.setProperty('--progress',max>min?((v-min)/(max-min)*100)+'%':'0%')}
const syncRanges=()=>qa('input[type=range]').forEach(syncRange);
document.addEventListener('input',e=>{if(e.target.matches?.('input[type=range]'))syncRange(e.target)},true);
let rangeFrame=0;const queueRanges=()=>{if(rangeFrame)return;rangeFrame=requestAnimationFrame(()=>{rangeFrame=0;syncRanges()})};
for(const ev of ['timeupdate','seeked','loadedmetadata','volumechange'])q('#video')?.addEventListener(ev,queueRanges);
new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('input[type=range]')||node.querySelector?.('input[type=range]')))))queueRanges()}).observe(document.body,{childList:true,subtree:true});syncRanges();

// Toasts behave like a HUD: brief, centered, never covering the export button.
const toastEl=q('#toast');if(toastEl)toastEl.setAttribute('role','status');
})();
