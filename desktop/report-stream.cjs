const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
// The output is created exclusively; existing reports are never overwritten.
async function writeVideoReport({videoPath, outputPath, template, marker, isCancelled=()=>false, onProgress=()=>{}}) {
  if(typeof template!=='string'||typeof marker!=='string'||!marker||template.split(marker).length!==2)throw new Error('报告模板无效');
  const [prefix,suffix]=template.split(marker);
  const size=(await fs.promises.stat(videoPath)).size;
  const handle=await fs.promises.open(outputPath,'wx');
  const output=handle.createWriteStream();let outputError;
  output.on('error',e=>{outputError=e});
  const write=async data=>{if(isCancelled())throw new Error('__cancel__');if(outputError)throw outputError;if(!output.write(data))await once(output,'drain')};
  try{
    const mime={'.webm':'video/webm','.mov':'video/quicktime','.mkv':'video/x-matroska','.avi':'video/x-msvideo'}[path.extname(videoPath).toLowerCase()]||'video/mp4';
    await write(prefix);await write(`data:${mime};base64,`);let remainder=Buffer.alloc(0),read=0;
    for await(const chunk of fs.createReadStream(videoPath,{highWaterMark:192*1024})){
      const bytes=remainder.length?Buffer.concat([remainder,chunk]):chunk;
      const length=bytes.length-bytes.length%3;
      await write(bytes.subarray(0,length).toString('base64'));remainder=Buffer.from(bytes.subarray(length));read+=chunk.length;onProgress(size?read/size:1);
    }
    if(remainder.length)await write(remainder.toString('base64'));
    await write(suffix);output.end();await once(output,'finish');
  }catch(e){output.destroy();await handle.close().catch(()=>{});await fs.promises.unlink(outputPath).catch(()=>{});throw e}
  finally{await handle.close().catch(()=>{})}
  return outputPath;
}
module.exports={writeVideoReport};
