// UI cut times are rounded for display; resolve them to actual decoded frame boundaries.
function frameTimesFromCsv(csv,origin=0){return String(csv).split(/\r?\n/).map(line=>parseFloat(line)).filter(Number.isFinite).map(t=>t-origin)}
function boundaryIndex(time,times,duration){
 if(time<=times[0])return 0;if(time>=duration-1e-6)return times.length;
 let lo=0,hi=times.length;while(lo<hi){const mid=(lo+hi)>>1;if(times[mid]<time)lo=mid+1;else hi=mid}
 const right=lo<times.length?times[lo]:duration,left=lo?times[lo-1]:times[0];
 return lo>0&&time-left<right-time?lo-1:lo;
}
function clipRange(shot,times,duration){
 if(!times.length)throw new Error('无法读取视频帧边界');
 const startFrame=boundaryIndex(shot.start,times,duration),endFrame=boundaryIndex(shot.end,times,duration);
 if(endFrame<=startFrame)throw new Error('镜头至少需要包含一帧');
 return {startFrame,endFrame,start:times[startFrame],end:endFrame<times.length?times[endFrame]:duration};
}
function clipArgs(videoPath,output,range){return [
 '-n','-hide_banner','-nostdin','-loglevel','error','-i',videoPath,
 '-map','0:v:0','-map','0:a?',
 '-vf',`trim=start_frame=${range.startFrame}:end_frame=${range.endFrame},setpts=PTS-STARTPTS`,
 '-af',`atrim=start=${Math.max(0,range.start).toFixed(9)}:end=${range.end.toFixed(9)},asetpts=PTS-STARTPTS`,
 '-fps_mode','passthrough','-c:v','libx264','-preset','veryfast','-crf','18','-bf','0',
 '-c:a','aac','-b:a','192k','-movflags','+faststart',output
]}
module.exports={frameTimesFromCsv,boundaryIndex,clipRange,clipArgs};
