/* macOS commands stay in the system menu; content uses the shared 0.9.3 engine. */
(()=>{
if(desktopApi?.platform!=='darwin')return;
const commands={new:'#newProjectBtn',open:'#pickBtn',notes:'.notesTool',export:'.toolbarExport',settings:'.settingsGear',layout:'.layoutTool',shortcuts:'#shortcutHelpBtn',search:'.tahoeSearchField',sidebar:'.tahoeLeading button',analysis:'[data-app-mode="analysis"]',lap:'[data-app-mode="lap"]',timeline:'[data-app-mode="timeline"]',detect:'#analyzeBtn','detect-options':'[aria-label="检测选项"]',select:'#selectTool',blade:'#bladeTool',capture:'#captureFrameBtn',sequence:'#addSceneBtn',undo:'#undoBtn',redo:'#redoBtn'};
desktopApi.onNativeCommand?.(command=>{
 if(command==='undo'||command==='redo'){
  const typing=document.activeElement?.matches('input:not([type=range]):not([type=checkbox]),textarea,[contenteditable=true]');
  if(typing){document.execCommand(command);return}
 }
 const button=document.querySelector(commands[command]||'nosuchcontrol');
 if(button&&!button.disabled&&!busy)button.click();
});
let queued=false,last='';
function syncMenu(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const state={};for(const [id,selector] of Object.entries(commands)){const button=document.querySelector(selector);state[id]=!!button&&!button.disabled&&!busy}const typing=document.activeElement?.matches('input:not([type=range]):not([type=checkbox]),textarea,[contenteditable=true]');if(typing){state.undo=true;state.redo=true}const key=JSON.stringify(state);if(key!==last){last=key;desktopApi.updateNativeMenu?.(state)}})}
new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes].some(n=>n.nodeType===1)))syncMenu()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
document.addEventListener('focusin',syncMenu);document.addEventListener('focusout',syncMenu);syncMenu();
// Pass the preference, not only the resolved colour, so system appearance remains live.
const theme=applyTheme;applyTheme=function(mode){theme(mode);desktopApi.setAppearance(document.documentElement.dataset.theme,themeMode).catch(()=>{})};applyTheme(themeMode);
const style=document.createElement('style');style.textContent=`
html[data-platform=darwin] .editorTopbar{padding-left:88px!important;padding-right:4px!important}
html[data-platform=darwin] .macSaveState{font-variant-numeric:tabular-nums}
@media(prefers-reduced-transparency:reduce){html[data-platform=darwin],html[data-platform=darwin] body{background:var(--t-surface)!important}html[data-platform=darwin] :is(.editorTopbar,.projectSidebar,[popover]){backdrop-filter:none!important;background:var(--t-surface)!important}}
@media(prefers-contrast:more){html[data-platform=darwin]{--t-label-2:var(--t-label);--t-separator:color-mix(in srgb,var(--t-label) 45%,transparent)}html[data-platform=darwin] .btn{outline:1px solid var(--t-separator)}}`;
document.head.append(style);
})();
