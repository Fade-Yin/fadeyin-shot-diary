const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),handlers={},events={},sent=[],trays=[];let hidden=false,quit=0;
const app={whenReady:()=>({then(){}}),on(n,f){events[n]=f},quit(){quit++}};
class Tray{constructor(){trays.push(this)}setToolTip(){}setContextMenu(m){this.menu=m}on(){}destroy(){this.destroyed=true}}
const electron={app,Tray,Menu:{buildFromTemplate:x=>x},BrowserWindow:{},dialog:{},ipcMain:{handle(n,f){handlers[n]=f},on(){}},shell:{}};
const localRequire=require('node:module').createRequire(path.join(root,'main.js'));
const c={require:n=>n==='electron'?electron:localRequire(n),process:{...process,platform:'win32',resourcesPath:root},__dirname:root,Buffer,console};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'main.js'),'utf8'),c);
c.win={webContents:{mainFrame:{url:'file:///trusted'},send:x=>sent.push(x)},isDestroyed:()=>false,isMinimized:()=>false,show(){hidden=false},hide(){hidden=true},focus(){}};
vm.runInContext("mainWindow=win;trustedPage='file:///trusted'",c);const e={sender:c.win.webContents,senderFrame:c.win.webContents.mainFrame};
(async()=>{
 await assert.rejects(handlers['fadeyin:close-choice']({},'quit'),/不受信任/);
 await assert.rejects(handlers['fadeyin:close-choice'](e,'quit'),/没有待处理/);
 vm.runInContext('requestWindowClose();requestWindowClose()',c);assert.equal(sent.length,1);
 await handlers['fadeyin:close-choice'](e,'tray');assert.equal(hidden,true);assert.equal(trays.length,1);assert.equal(quit,0);
 trays[0].menu[0].click();assert.equal(hidden,false);
 vm.runInContext('requestWindowClose();mediaJob=true',c);await assert.rejects(handlers['fadeyin:close-choice'](e,'quit'),/任务尚未完成/);
 await handlers['fadeyin:close-choice'](e,'cancel');assert.equal(quit,0);
 vm.runInContext('mediaJob=false;requestWindowClose()',c);await handlers['fadeyin:close-choice'](e,'quit');assert.equal(quit,1);events['before-quit']();assert.equal(trays[0].destroyed,true);
 const h=fs.readFileSync(path.join(root,'ui/FadeYin拉片日记.html'),'utf8');assert.ok(h.includes('开发者 B站 Fadeyin'));assert.ok(!h.includes('开发者 Danny'));assert.ok(h.includes('src="app-icon.png"'));
 const icon=fs.readFileSync(path.join(root,'ui/app-icon.png'));assert.equal(icon.readUInt32BE(16),1024);
 const ico=fs.readFileSync(path.join(root,'assets/fadeyin-icon.ico'));assert.ok(ico.readUInt16LE(4)>=8);assert.ok(Array.from({length:ico.readUInt16LE(4)},(_,i)=>ico[6+16*i]||256).includes(256));
 new vm.Script(fs.readFileSync(path.join(root,'ui/window-close.js'),'utf8'));
 console.log('PASS close request deduplication, IPC guards, tray hide/restore, busy-exit protection, cancel, quit and tray cleanup; attribution; 1024px UI icon and multi-size Windows ICO. Mock Electron lifecycle, not native UI acceptance.');
})().catch(e=>{console.error(e);process.exitCode=1});
