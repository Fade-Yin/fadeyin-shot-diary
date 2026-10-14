/* Field definitions travel with project metadata. Removing a field never deletes notes. */
(()=>{
'use strict';
const defaults=[['shotSize','景别','choice'],['angle','角度','choice'],['movement','运镜','choice'],['lightColor','光色','text'],['content','画面内容','text'],['sound','声音','text'],['note','备注','text']];
const presetDefaults=JSON.parse(JSON.stringify(lapPresets));
let signature='';
function schema(){
 if(!Array.isArray(lapMeta._fields))lapMeta._fields=defaults.map(([key,label,type])=>({key,label,type,hidden:false,options:[...(presetDefaults[key]||[])]}));
 return lapMeta._fields;
}
function safeLabel(value){return typeof value==='string'&&value.trim()&&value.length<=40&&!/[<>"'&]/.test(value)}
function apply(){
 const all=schema(),seen=new Set();const valid=all.filter(f=>f&&/^(shotSize|angle|movement|lightColor|content|sound|note|custom_[a-z0-9_]+)$/.test(f.key)&&!seen.has(f.key)&&seen.add(f.key)&&safeLabel(f.label)&&['choice','text'].includes(f.type));
 const next=JSON.stringify(valid);if(next===signature)return;signature=next;
 lapFields.splice(0,lapFields.length,...valid.filter(f=>!f.hidden).map(f=>[f.key,f.label,f.type]));
 for(const key of Object.keys(lapPresets))delete lapPresets[key];
 // Do not inherit another project's custom options.
 lapCustomOptions={};
 for(const f of valid){columnWidths[f.key]??=f.type==='choice'?140:220;if(f.type==='choice')lapPresets[f.key]=Array.isArray(f.options)?f.options.filter(x=>typeof x==='string'):[]}
 window.dispatchEvent(new Event('pianlala-fields-changed'));
}
function commit(){signature='';apply();saveLapNotes();renderLapTable();window.dispatchEvent(new Event('pianlala-fields-changed'))}
const originalView=applyModeView;applyModeView=function(...args){apply();return originalView.apply(this,args)};
const originalTable=renderLapTable;renderLapTable=function(...args){apply();for(const f of lapFields)columnWidths[f[0]]??=f[2]==='choice'?140:220;return originalTable.apply(this,args)};
const originalColumns=saveColumns;saveColumns=function(...args){const order=lapFields.map(f=>f[0]),all=schema();all.sort((a,b)=>(order.includes(a.key)?order.indexOf(a.key):999)-(order.includes(b.key)?order.indexOf(b.key):999));const result=originalColumns.apply(this,args);saveLapNotes();return result};
addLapCustomOption=function(key,value){const f=schema().find(x=>x.key===key);value=value.trim();if(!f||f.type!=='choice'||!value)return;f.options??=[];if(f.options.includes(value))return;f.options.push(value);signature='';apply();saveLapNotes()};
const trigger=document.createElement('button');trigger.className='btn fieldSettingsButton';trigger.type='button';trigger.textContent='字段设置';trigger.title='配置当前项目的拉片字段';
document.querySelector('[data-panel="study"] .dockBar').append(trigger);
const menu=document.createElement('section');menu.id='projectFieldSettings';menu.dataset.popoverWidth='440';menu.setAttribute('role','dialog');menu.setAttribute('aria-label','字段设置');
menu.innerHTML='<header><h2>字段设置</h2><button class="btn" type="button" aria-label="关闭字段设置">×</button></header><p>仅影响当前项目。移除字段后，已有内容仍保留，可随时恢复。</p><div class="projectFieldList"></div><form class="projectFieldAdd"><input aria-label="新字段名称" placeholder="新字段名称" maxlength="40" required><select aria-label="新字段类型"><option value="text">文本</option><option value="choice">下拉选项</option></select><button class="btn" type="submit">新增</button></form><p class="fieldError" role="status"></p>';
document.body.append(menu);window.PianlalaPopover(menu,trigger);menu.querySelector('header button').onclick=()=>menu.close();
const list=menu.querySelector('.projectFieldList'),error=menu.querySelector('.fieldError');
function action(label,fn){const b=document.createElement('button');b.className='btn';b.type='button';b.textContent=label;b.onclick=()=>{if(!busy){fn();commit();draw()}};return b}
function draw(){
 list.replaceChildren();error.textContent='';const all=schema();
 all.forEach((f,i)=>{
  const row=document.createElement('div');row.className='projectFieldRow';row.classList.toggle('fieldHidden',!!f.hidden);
  const name=document.createElement('input');name.value=f.label;name.maxLength=40;name.setAttribute('aria-label','字段名称 '+f.label);
  name.onchange=()=>{if(busy)return;if(!safeLabel(name.value)){error.textContent='名称不能为空，且不能包含 < > & 或引号。';name.value=f.label;return}if(all.some(x=>x!==f&&x.label===name.value.trim())){error.textContent='已有同名字段。';name.value=f.label;return}f.label=name.value.trim();commit()};
  const up=action('↑',()=>{[all[i-1],all[i]]=[all[i],all[i-1]]});up.title='上移 '+f.label;up.setAttribute('aria-label',up.title);up.disabled=i===0;
  const down=action('↓',()=>{[all[i+1],all[i]]=[all[i],all[i+1]]});down.title='下移 '+f.label;down.setAttribute('aria-label',down.title);down.disabled=i===all.length-1;
  row.append(name,up,down,action(f.hidden?'恢复':'移除',()=>{f.hidden=!f.hidden}));
  if(f.type==='choice'){
   const options=document.createElement('textarea');options.value=(f.options||[]).join('\n');options.rows=2;options.placeholder='每行一个选项';options.setAttribute('aria-label',f.label+'备选项，每行一个');options.onchange=()=>{if(busy)return;f.options=[...new Set(options.value.split('\n').map(x=>x.trim()).filter(Boolean))];commit()};row.append(options);
  }
  list.append(row);
 });
}
trigger.onclick=()=>{if(!busy&&sourceFile){apply();draw();menu.togglePopover()}};
menu.querySelector('form').onsubmit=e=>{e.preventDefault();if(busy||!sourceFile)return;const input=e.target.querySelector('input'),label=input.value.trim();if(!safeLabel(label)){error.textContent='请输入有效字段名称，不包含 < > & 或引号。';return}if(schema().some(f=>f.label===label)){error.textContent='已有同名字段，请重命名或恢复原字段。';return}schema().push({key:'custom_'+crypto.randomUUID().replaceAll('-',''),label,type:e.target.querySelector('select').value,hidden:false,options:[]});input.value='';commit();draw()};
function visibility(){trigger.hidden=!sourceFile||!['lap','timeline'].includes(appMode)}
const oldView=applyModeView;applyModeView=function(...args){const r=oldView.apply(this,args);visibility();return r};
apply();visibility();
})();
