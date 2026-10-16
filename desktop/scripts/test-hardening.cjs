const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const {writeVideoReport}=require(root+'/report-stream.cjs');
const html=fs.readFileSync(root+'/ui/FadeYin拉片日记.html','utf8');
function fn(name){return html.split('\n').find(l=>l.startsWith('async function '+name+'(')||l.startsWith('function '+name+'('))}
(async()=>{
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fadeyin-unit-'));
for(const length of [1,2,3,196609,1048577]){const bytes=Buffer.alloc(length);for(let i=0;i<length;i++)bytes[i]=i%251;const input=path.join(dir,length+'.mp4'),output=path.join(dir,length+'.html');fs.writeFileSync(input,bytes);await writeVideoReport({videoPath:input,outputPath:output,template:'beforeMARKafter',marker:'MARK'});assert.equal(fs.readFileSync(output,'utf8'),'beforedata:video/mp4;base64,'+bytes.toString('base64')+'after');await assert.rejects(writeVideoReport({videoPath:input,outputPath:output,template:'aMARKb',marker:'MARK'}),e=>e.code==='EEXIST')}
const cancelFile=path.join(dir,'cancel.html');await assert.rejects(writeVideoReport({videoPath:path.join(dir,'1048577.mp4'),outputPath:cancelFile,template:'aMARKb',marker:'MARK',isCancelled:()=>true}),/__cancel__/);assert.equal(fs.existsSync(cancelFile),false);
await assert.rejects(writeVideoReport({videoPath:path.join(dir,'1.mp4'),outputPath:path.join(dir,'bad.html'),template:'missing',marker:'MARK'}),/模板/);
// Test storage logic with an asynchronous transaction double, not a browser.
const stores={projects:new Map(),analyses:new Map()};
const db={transaction(){const tx={};let scheduled=false;const complete=()=>{if(!scheduled){scheduled=true;setTimeout(()=>tx.oncomplete?.(),10)}};tx.objectStore=name=>({put(value){stores[name].set(value.id,structuredClone(value));complete()},get(id){const req={};setTimeout(()=>{req.result=structuredClone(stores[name].get(id));req.onsuccess?.();complete()},0);return req}});return tx}};
const ctx=vm.createContext({projectDb:async()=>db,Promise,Error});vm.runInContext(fn('projectPut')+'\n'+fn('projectGet'),ctx);
const record={id:'old',video:{name:'原片.mp4'},shots:[{start:0,end:1,image:'image'}],notes:{0:{content:'原笔记'}},brightness:[{t:0,v:.5}]};stores.projects.set('old',structuredClone(record));assert.equal((await ctx.projectGet('old')).shots.length,1);
await ctx.projectPut(record);assert.equal(stores.projects.get('old').shots,undefined);assert.equal((await ctx.projectGet('old')).shots[0].image,'image');
await ctx.projectPut({id:'old',video:record.video,count:1,notes:{0:{content:'新笔记'}}});assert.equal((await ctx.projectGet('old')).shots[0].image,'image');assert.equal((await ctx.projectGet('old')).notes[0].content,'新笔记');
// 1000 shots: all thumbnail nodes are built, original indices retained.
const rows={children:[],replaceChildren(){this.children=[]},append(x){this.children.push(x)}};const renderCtx=vm.createContext({appMode:'analysis',analysisPage:5,shots:Array.from({length:1000},(_,i)=>({start:i,end:i+1,mid:i+.5,image:'data:'})),document:{createElement:()=>({})},$:()=>rows,fmt:String,renderPager(){}});vm.runInContext(fn('renderAnalysisRows'),renderCtx);renderCtx.renderAnalysisRows();assert.equal(rows.children.length,1000);assert.ok(rows.children[0].innerHTML.includes('data-play="0"'));renderCtx.appMode='lap';renderCtx.renderAnalysisRows();assert.equal(rows.children.length,0);
for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1])new vm.Script(m[1]);
assert.ok(!/[^A-Za-z]confirm\(/.test(html));assert.ok(html.includes("el.id='shot-focus-'+keyboardShot"));
console.log('PASS streaming bytes at five boundaries, exclusive output, cancel cleanup, malformed template, legacy storage + notes-only save, 1000-shot continuous display, UI parse. Test artifacts: '+dir);
})().catch(e=>{console.error(e);process.exit(1)});
