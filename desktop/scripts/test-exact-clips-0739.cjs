// Runs the production export arguments against real FFmpeg, not an IPC mock.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {frameTimesFromCsv,clipRange,clipArgs}=require('../clip-export.cjs');
const ffmpeg=require('ffmpeg-static'),ffprobe=require('ffprobe-static').path;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pianlala-exact-clips-'));
function run(tool,args){return execFileSync(tool,args,{windowsHide:true,maxBuffer:16*1024*1024})}
function probe(file){return JSON.parse(run(ffprobe,['-v','error','-show_entries','format=duration,start_time:stream=codec_type,start_time,nb_frames','-of','json',file]))}
function gray(file){return run(ffmpeg,['-hide_banner','-loglevel','error','-i',file,'-map','0:v:0','-vf','format=gray','-fps_mode','passthrough','-f','rawvideo','pipe:1'])}
for(const [name,rate,audio,vfr] of [['30-audio','30',true,false],['2997-audio','30000/1001',true,false],['60-silent','60',false,false],['vfr-silent','30',false,true]]){
 const source=path.join(dir,name+'.mkv'),filter="geq=lum='16+mod(N,20)*10':cb=128:cr=128"+(vfr?",select='not(eq(mod(n,5),0))'":'');
 const args=['-hide_banner','-loglevel','error','-f','lavfi','-i',`color=black:s=64x64:r=${rate}:d=3`];
 if(audio)args.push('-f','lavfi','-i','sine=frequency=440:duration=3');
 args.push('-vf',filter,'-fps_mode','passthrough','-c:v','ffv1');if(audio)args.push('-c:a','pcm_s16le');args.push(source);run(ffmpeg,args);
 const meta=probe(source).format,duration=Number(meta.duration),times=frameTimesFromCsv(run(ffprobe,['-v','error','-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time','-of','csv=p=0',source]).toString(),Number(meta.start_time)||0),pixels=gray(source),size=64*64;
 assert.equal(pixels.length/size,times.length);
 // Rounded cut times simulate analysis metadata and manual frame-aligned cuts.
 const cuts=[0,Number(times[31].toFixed(6)),Number(times[51].toFixed(6)),duration];let total=0;
 for(let i=0;i<3;i++){
  const range=clipRange({start:cuts[i],end:cuts[i+1]},times,duration),output=path.join(dir,`${name}-${i}.mp4`);run(ffmpeg,clipArgs(source,output,range));
  const decoded=gray(output),count=decoded.length/size;assert.equal(count,range.endFrame-range.startFrame,'No duplicated or extra boundary frame');total+=count;
  for(let frame=0;frame<count;frame++){let difference=0;for(let p=0;p<size;p++)difference+=Math.abs(decoded[frame*size+p]-pixels[(range.startFrame+frame)*size+p]);assert(difference/size<2,`${name} clip ${i} frame ${frame}: wrong source frame`)}
  const video=probe(output).streams.find(s=>s.codec_type==='video');assert(Math.abs(Number(video.start_time))<.00001,'Video starts at zero');
 }
 assert.equal(total,times.length,'Adjacent exports cover each source frame exactly once');console.log('PASS '+name+': every frame matched; adjacent boundaries and zero origin verified');
}
console.log('Real MP4 test files: '+dir);
