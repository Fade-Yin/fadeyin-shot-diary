const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert');
const arch=process.env.EXPECTED_ARCH;
assert(['arm64','x64'].includes(arch),'EXPECTED_ARCH must be arm64 or x64');
const dir=arch==='arm64'?'mac-arm64':'mac';
const app=process.env.MAC_APP_PATH?path.resolve(process.env.MAC_APP_PATH):path.resolve('dist',dir,'片拉拉.app');
const bundle=path.join(app,'Contents');
cp.execFileSync('codesign',['--verify','--deep','--strict','--verbose=2',app],{stdio:'inherit'});
cp.execFileSync('xcrun',['stapler','validate',app],{stdio:'inherit'});
cp.execFileSync('spctl',['--assess','--type','execute','--verbose=2',app],{stdio:'inherit'});
const signedTeam=checkSignature(app);
function checkSignature(p){
 const r=cp.spawnSync('codesign',['-dvvv',p],{encoding:'utf8'});
 assert(r.status===0,p+' signature unreadable');
 assert(/Authority=Developer ID Application:/.test(r.stderr),p+' lacks Developer ID Application');
 assert(/flags=.*runtime/.test(r.stderr),p+' lacks Hardened Runtime');
 assert(/Timestamp=/.test(r.stderr),p+' lacks secure timestamp');
 const team=/TeamIdentifier=(\S+)/.exec(r.stderr)?.[1];
 assert(team&&team!=='not',p+' lacks Team ID');
 return team;
}
function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(e.isFile()){const type=cp.execFileSync('file',['-b',f]).toString();if(type.includes('Mach-O')){cp.execFileSync('codesign',['--verify','--strict',f]);assert(checkSignature(f)===signedTeam,'Nested Team ID mismatch: '+f);}}}}
walk(bundle);
const res=path.join(bundle,'Resources');
assert(fs.existsSync(path.join(bundle,'Info.plist')));
assert(fs.existsSync(path.join(res,'ui','FadeYin拉片日记.html')));
for(const file of ['analysis-model.js','sequence-analysis.js','sequence-analysis.css','workbench.js','workbench.css','track-mode.js','project-library.js','layout-presets.js','playback-tools.js'])assert(fs.existsSync(path.join(res,'ui',file)),file+' missing');
const bin=path.join(bundle,'MacOS','片拉拉');
const wanted=arch==='arm64'?'arm64':'x86_64';
assert(cp.execFileSync('lipo',['-archs',bin]).toString().includes(wanted));
const base=path.join(res,'app.asar.unpacked','node_modules');
const ff=path.join(base,'ffmpeg-static','ffmpeg');
const probe=path.join(base,'ffprobe-static','bin','darwin',arch,'ffprobe');
for(const p of [ff,probe]){assert(cp.execFileSync('lipo',['-archs',p]).toString().includes(wanted));cp.execFileSync(p,['-version'],{timeout:30000});const libs=cp.execFileSync('otool',['-L',p]).toString();assert(!libs.includes('/opt/homebrew/')&&!libs.includes('/usr/local/'),'external Homebrew dependency');}
const tmp=fs.mkdtempSync(path.join(require('os').tmpdir(),'fadeyin-mac-'));
const sample=path.join(tmp,'sample.mp4');
try {
cp.execFileSync(ff,['-f','lavfi','-i','color=c=red:s=160x90:r=25:d=1','-c:v','libx264',sample],{timeout:30000});
const info=JSON.parse(cp.execFileSync(probe,['-v','error','-show_streams','-of','json',sample],{timeout:30000}));
assert(info.streams[0].width===160&&info.streams[0].height===90);
console.log('PASS Developer ID, Hardened Runtime, nested signatures, stapled app, Gatekeeper, architecture and media encode/probe');
} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
