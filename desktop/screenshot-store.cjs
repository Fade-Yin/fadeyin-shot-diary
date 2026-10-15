const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function createScreenshotStore({configPath,picturesPath}){
 function directory(){try{const value=JSON.parse(fs.readFileSync(configPath,'utf8')).directory;if(typeof value==='string'&&path.isAbsolute(value))return value}catch{}return path.join(picturesPath,'片拉拉截图')}
 async function setDirectory(value){if(typeof value!=='string'||!path.isAbsolute(value))throw new Error('请选择截图文件夹');const target=await fs.promises.realpath(value);if(!(await fs.promises.stat(target)).isDirectory())throw new Error('请选择文件夹');await fs.promises.mkdir(path.dirname(configPath),{recursive:true});const temporary=configPath+'.'+crypto.randomUUID()+'.tmp';await fs.promises.writeFile(temporary,JSON.stringify({directory:target}));await fs.promises.rename(temporary,configPath);return target}
 async function save({bytes,name}={}){if(!(bytes instanceof Uint8Array)||bytes.length<24||bytes.length>64*1024*1024)throw new Error('截图数据无效');const buffer=Buffer.from(bytes);if(!buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('只支持 PNG 截图');const folder=directory();await fs.promises.mkdir(folder,{recursive:true});const base=path.basename(String(name||'截图'),'.png').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)||'截图';const file=path.join(folder,base+'_'+Date.now()+'_'+crypto.randomBytes(4).toString('hex')+'.png');await fs.promises.writeFile(file,buffer,{flag:'wx'});return {path:file,directory:folder}}
 return {directory,setDirectory,save};
}
module.exports={createScreenshotStore};
