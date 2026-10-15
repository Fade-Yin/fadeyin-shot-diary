const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {createScreenshotStore}=require('../screenshot-store.cjs');
(async()=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'pianlala-screenshot-'))),configPath=path.join(root,'settings','screenshots.json');
 const store=createScreenshotStore({configPath,picturesPath:root});const bytes=fs.readFileSync(path.join(__dirname,'../ui/app-icon.png'));
 const a=await store.save({bytes,name:'shot.png'}),b=await store.save({bytes,name:'shot.png'});assert.notEqual(a.path,b.path);assert(fs.readFileSync(a.path).equals(bytes));assert.equal(a.directory,path.join(root,'片拉拉截图'));
 const custom=path.join(root,'custom');fs.mkdirSync(custom);await store.setDirectory(custom);await store.setDirectory(custom);
 const restored=createScreenshotStore({configPath,picturesPath:root});assert.equal(restored.directory(),custom);
 const c=await restored.save({bytes,name:'../../unsafe.png'});assert.equal(path.dirname(c.path),custom);
 await assert.rejects(()=>store.save({bytes:Buffer.from('bad'),name:'bad'}));await assert.rejects(()=>store.setDirectory('relative'));
 console.log('PASS real PNG writes, unique names, persisted directory, folder confinement and invalid input rejection');
})().catch(e=>{console.error(e);process.exitCode=1});
