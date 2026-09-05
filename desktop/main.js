const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { requestAI } = require('./ai-api.cjs');
const aiRequests = new Map();

let mainWindow = null;
let activeProcesses = new Set();
let cancelled = false;

function existing(candidates) {
  return candidates.find(candidate => candidate && fs.existsSync(candidate));
}

function mediaTool(name) {
  const ext = process.platform === 'win32' ? '.exe' : '';
  let moduleTool = null;
  try {
    moduleTool = name === 'ffmpeg' ? require('ffmpeg-static') : require('ffprobe-static').path;
    if (app.isPackaged) moduleTool = moduleTool.replace('app.asar', 'app.asar.unpacked');
  } catch (_error) {}
  const packaged = path.join(process.resourcesPath, 'ffmpeg', `${name}${ext}`);
  const beside = path.join(process.resourcesPath, 'ffmpeg', 'bin', `${name}${ext}`);
  const localWin = process.platform === 'win32' ? `C:\\ffmpeg\\bin\\${name}.exe` : null;
  const fromEnv = name === 'ffmpeg' ? process.env.FFMPEG_PATH : process.env.FFPROBE_PATH;
  return existing([fromEnv, moduleTool, packaged, beside, localWin]) || `${name}${ext}`;
}

function sendProgress(percent, label) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('fadeyin:progress', { percent, label });
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options.spawn
    });
    activeProcesses.add(child);
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', chunk => {
      stdout.push(chunk);
      options.onStdout?.(chunk);
    });
    child.stderr.on('data', chunk => {
      stderr.push(chunk);
      options.onStderr?.(chunk);
    });
    child.on('error', error => {
      activeProcesses.delete(child);
      reject(error);
    });
    child.on('close', code => {
      activeProcesses.delete(child);
      const out = Buffer.concat(stdout);
      const err = Buffer.concat(stderr).toString('utf8');
      if (cancelled) return reject(new Error('__cancel__'));
      if (code === 0) resolve({ stdout: out, stderr: err });
      else reject(new Error(err.trim() || `${path.basename(command)} 运行失败 (${code})`));
    });
  });
}

function ratio(text) {
  const [a, b] = String(text || '0/1').split('/').map(Number);
  return b ? a / b : 0;
}

async function probeVideo(videoPath) {
  const result = await run(mediaTool('ffprobe'), [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,r_frame_rate:format=duration',
    '-of', 'json', videoPath
  ]);
  const data = JSON.parse(result.stdout.toString('utf8'));
  const stream = data.streams?.[0];
  const duration = Number(data.format?.duration);
  if (!stream || !Number.isFinite(duration)) throw new Error('无法读取视频信息');
  return {
    duration,
    width: stream.width,
    height: stream.height,
    fps: ratio(stream.avg_frame_rate) || ratio(stream.r_frame_rate) || 25
  };
}

function localMaxima(frames, sensitivity, minGap, duration, fps = 25) {
  const hard = 0.42 - ((Math.max(15, Math.min(65, sensitivity)) - 15) / 50) * 0.30;
  const soft = Math.max(0.045, hard * 0.32);
  const candidates = [];
  for (let i = 1; i < frames.length; i += 1) {
    const current = frames[i];
    const neighbors = frames.slice(Math.max(0, i - 2), Math.min(frames.length, i + 3)).filter(item => item !== current).map(item => item.score);
    const localPeak = neighbors.every(score => current.score >= score);
    const history = frames.slice(Math.max(0, i - 18), i).map(item => item.score).sort((a, b) => a - b);
    const median = history.length ? history[Math.floor(history.length / 2)] : 0;
    const adaptive = Math.max(soft, median * 5 + 0.012);
    if (localPeak && (current.score >= hard || current.score >= adaptive)) candidates.push(current.time);
  }
  const cuts = [0];
  for (const time of candidates) {
    if (time >= 1 / fps - 1e-7 && time <= duration - minGap + 1e-7 && time - cuts[cuts.length - 1] >= minGap - 1e-7) cuts.push(time);
  }
  if (duration - cuts[cuts.length - 1] < minGap * 0.35 && cuts.length > 1) cuts.pop();
  cuts.push(duration);
  return cuts;
}

function downsampleMetric(frames, field, maxPoints = 1600) {
  const usable = frames.filter(frame => Number.isFinite(frame[field]));
  if (usable.length <= maxPoints) return usable.map(frame => ({ t: frame.time, v: frame[field] }));
  const size = usable.length / maxPoints;
  const output = [];
  for (let index = 0; index < maxPoints; index += 1) {
    const start = Math.floor(index * size);
    const end = Math.max(start + 1, Math.floor((index + 1) * size));
    const bucket = usable.slice(start, end);
    output.push({
      t: bucket.reduce((sum, frame) => sum + frame.time, 0) / bucket.length,
      v: bucket.reduce((sum, frame) => sum + frame[field], 0) / bucket.length
    });
  }
  return output;
}

async function scanScenes(videoPath, meta, sensitivity, minGap) {
  const frames = [];
  let stdoutBuffer = '';
  let stderrBuffer = '';
  let current = null;
  const flushFrame = () => {
    if (current && Number.isFinite(current.time) && Number.isFinite(current.brightness)) frames.push(current);
  };
  const parseMetadata = text => {
    stdoutBuffer += text;
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || '';
    for (const line of lines) {
      const time = line.match(/pts_time:([\d.]+)/);
      if (time) {
        flushFrame();
        current = { time: Number(time[1]), score: 0, brightness: NaN, saturation: NaN };
      }
      const score = line.match(/lavfi\.scene_score=([\d.]+)/);
      if (score && current) current.score = Number(score[1]);
      const brightness = line.match(/lavfi\.signalstats\.YAVG=([\d.]+)/);
      if (brightness && current) current.brightness = Number(brightness[1]) / 255;
      const saturation = line.match(/lavfi\.signalstats\.SATAVG=([\d.]+)/);
      if (saturation && current) current.saturation = Math.min(1, Number(saturation[1]) / 181.02);
    }
  };
  const parseProgress = text => {
    stderrBuffer += text;
    const lines = stderrBuffer.split(/\r?\n/);
    stderrBuffer = lines.pop() || '';
    for (const line of lines) {
      const match = line.match(/^out_time=(\d+):(\d+):([\d.]+)/);
      if (match) {
        const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
        sendProgress(Math.min(68, 5 + seconds / meta.duration * 63), 'FFmpeg 正在逐帧检测切点…');
      }
    }
  };
  await run(mediaTool('ffmpeg'), [
    '-hide_banner', '-nostdin', '-loglevel', 'error', '-i', videoPath,
    '-vf', "select='gte(scene,0)',signalstats,metadata=print:file=-",
    '-an', '-f', 'null', '-', '-progress', 'pipe:2', '-nostats'
  ], {
    onStdout: chunk => parseMetadata(chunk.toString('utf8')),
    onStderr: chunk => parseProgress(chunk.toString('utf8'))
  });
  parseMetadata('\n');
  flushFrame();
  return {
    cuts: localMaxima(frames, sensitivity, minGap, meta.duration, meta.fps),
    brightness: downsampleMetric(frames, 'brightness'),
    color: downsampleMetric(frames, 'saturation')
  };
}

async function scanAudio(videoPath, meta) {
  const points = [];
  let stdoutBuffer = '';
  let currentTime = 0;
  const parseMetadata = text => {
    stdoutBuffer += text;
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || '';
    for (const line of lines) {
      const time = line.match(/pts_time:([\d.]+)/);
      if (time) currentTime = Number(time[1]);
      const rms = line.match(/lavfi\.astats\.Overall\.RMS_level=(-?inf|[-\d.]+)/i);
      if (rms) {
        const db = rms[1].toLowerCase() === '-inf' ? -60 : Number(rms[1]);
        points.push({ time: currentTime, audio: Math.max(0, Math.min(1, (db + 60) / 60)) });
      }
    }
  };
  try {
    await run(mediaTool('ffmpeg'), [
      '-hide_banner', '-nostdin', '-loglevel', 'error', '-i', videoPath,
      '-vn', '-af', 'asetnsamples=n=24000:p=1,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-',
      '-f', 'null', '-'
    ], { onStdout: chunk => parseMetadata(chunk.toString('utf8')) });
    parseMetadata('\n');
  } catch (error) {
    if (error.message === '__cancel__') throw error;
    return [];
  }
  return downsampleMetric(points, 'audio', 1600).map(point => ({
    t: Math.min(meta.duration, point.t),
    v: point.v
  }));
}

async function scanBarcode(videoPath, meta) {
  // Each sample is a compressed vertical stripe of actual RGB pixels.
  // Bound the payload for feature films without depending on shot boundaries.
  const fps = Math.min(4, 1200 / Math.max(0.1, meta.duration));
  const rows = 32;
  const result = await run(mediaTool('ffmpeg'), [
    '-hide_banner', '-nostdin', '-loglevel', 'error', '-i', videoPath,
    '-an', '-vf', `fps=${fps.toFixed(8)},scale=1:${rows}:flags=area,format=rgb24`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'
  ]);
  const points = [];
  for (let offset = 0, i = 0; offset + rows * 3 <= result.stdout.length; offset += rows * 3, i += 1) {
    const stripe = Array.from(result.stdout.subarray(offset, offset + rows * 3));
    const rgb = [0, 1, 2].map(channel => Math.round(stripe.reduce((sum, value, index) => sum + (index % 3 === channel ? value : 0), 0) / rows));
    points.push({ t: Math.min(meta.duration, i / fps), rgb, stripe });
  }
  return points;
}

async function thumbnail(videoPath, time) {
  const result = await run(mediaTool('ffmpeg'), [
    '-hide_banner', '-nostdin', '-loglevel', 'error', '-ss', time.toFixed(6), '-i', videoPath,
    '-frames:v', '1', '-vf', "scale='min(560,iw)':-2", '-q:v', '3', '-f', 'image2pipe', '-vcodec', 'mjpeg', 'pipe:1'
  ]);
  return `data:image/jpeg;base64,${result.stdout.toString('base64')}`;
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  async function next() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, next));
  return results;
}

async function analyzeVideo(event, options) {
  cancelled = false;
  const videoPath = path.resolve(options.path);
  if (!fs.existsSync(videoPath)) throw new Error('视频文件不存在');
  sendProgress(2, '正在读取视频信息…');
  const meta = await probeVideo(videoPath);
  const minGap = options.minFrames == null ? Math.max(1 / meta.fps, Number(options.minShot) || 1) : Math.max(1, Math.round(Number(options.minFrames) || 1)) / meta.fps;
  const scan = await scanScenes(videoPath, meta, Number(options.sensitivity || 36), minGap);
  sendProgress(69, '正在分析全片音频电平…');
  const audio = await scanAudio(videoPath, meta);
  sendProgress(71, '正在生成全片 Movie Barcode 色带…');
  const color = await scanBarcode(videoPath, meta);
  const cuts = scan.cuts;
  const segments = cuts.slice(0, -1).map((start, index) => ({
    start,
    end: cuts[index + 1],
    mid: (start + cuts[index + 1]) / 2
  }));
  let completed = 0;
  const images = await mapLimit(segments, 3, async segment => {
    const image = await thumbnail(videoPath, segment.mid);
    completed += 1;
    sendProgress(72 + completed / segments.length * 28, `正在提取中间帧 ${completed}/${segments.length}…`);
    return image;
  });
  sendProgress(100, '分析完成');
  return { ...meta, brightness: scan.brightness, color, audio, shots: segments.map((segment, index) => ({ ...segment, image: images[index] })) };
}

async function splitVideo(event, options) {
  cancelled = false;
  const videoPath = path.resolve(options.path);
  const outputDir = path.resolve(options.outputDir);
  if (!fs.existsSync(videoPath) || !fs.existsSync(outputDir)) throw new Error('视频或导出文件夹不存在');
  const shots = Array.isArray(options.shots) ? options.shots : [];
  const base = path.basename(videoPath, path.extname(videoPath)).replace(/[<>:"/\\|?*]/g, '_');
  const targetDir = path.join(outputDir, `${base}_镜头视频`);
  fs.mkdirSync(targetDir, { recursive: true });
  for (let index = 0; index < shots.length; index += 1) {
    if (cancelled) throw new Error('__cancel__');
    const shot = shots[index];
    const output = path.join(targetDir, `shot_${String(index + 1).padStart(3, '0')}.mp4`);
    sendProgress(index / shots.length * 100, `FFmpeg 正在精确导出镜头 ${index + 1}/${shots.length}…`);
    await run(mediaTool('ffmpeg'), [
      '-y', '-hide_banner', '-nostdin', '-loglevel', 'error',
      '-ss', Number(shot.start).toFixed(6), '-to', Number(shot.end).toFixed(6), '-i', videoPath,
      '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-avoid_negative_ts', 'make_zero', output
    ]);
  }
  sendProgress(100, '镜头视频导出完成');
  return { outputDir: targetDir };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#17181b',
    title: 'FadeYin 拉片日记',
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'fadeyin-icon.ico' : 'fadeyin-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  const page = app.isPackaged
    ? path.join(process.resourcesPath, 'ui', 'FadeYin拉片日记.html')
    : path.join(__dirname, '..', 'outputs', 'FadeYin拉片日记.html');
  mainWindow.loadFile(page);
}

ipcMain.handle('fadeyin:analyze', analyzeVideo);
ipcMain.handle('fadeyin:ai-request', async (event, options) => {
  throw new Error('功能未上线，敬请稍后');
});
ipcMain.on('fadeyin:ai-cancel', event => aiRequests.get(event.sender.id)?.abort());
ipcMain.handle('fadeyin:describe-video', async (_event, value) => {
  if (typeof value !== 'string' || !path.isAbsolute(value) || !/\.(mp4|mov|mkv|webm|avi|m4v|mpeg|mpg|mts|m2ts)$/i.test(value)) throw new Error('请选择本地视频文件');
  const videoPath = path.resolve(value);
  const stat = await fs.promises.stat(videoPath);
  if (!stat.isFile()) throw new Error('视频文件不存在');
  cancelled = false;
  const meta = await probeVideo(videoPath);
  return { ...meta, path: videoPath, url: pathToFileURL(videoPath).href, name: path.basename(videoPath), size: stat.size, lastModified: Math.trunc(stat.mtimeMs) };
});
ipcMain.handle('fadeyin:choose-export-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});
ipcMain.handle('fadeyin:split-video', splitVideo);
ipcMain.handle('fadeyin:reveal-path', (_event, target) => shell.showItemInFolder(path.resolve(target)));
ipcMain.on('fadeyin:cancel', () => {
  cancelled = true;
  for (const child of activeProcesses) child.kill();
});

app.whenReady().then(() => {
  const selfTestIndex = process.argv.indexOf('--self-test');
  if (selfTestIndex >= 0) {
    const testPath = process.argv[selfTestIndex + 1];
    analyzeVideo(null, { path: testPath, sensitivity: 36, minShot: 0.4 })
      .then(result => console.log(JSON.stringify({
        duration: result.duration,
        fps: result.fps,
        shots: result.shots.map(({ start, end }) => ({ start, end })),
        brightnessPoints: result.brightness.length,
        brightnessRange: [
          Math.min(...result.brightness.map(point => point.v)),
          Math.max(...result.brightness.map(point => point.v))
        ],
        colorPoints: result.color.length,
        barcodeSample: result.color[0],
        audioPoints: result.audio.length
      }, null, 2)))
      .catch(error => {
        console.error(error);
        process.exitCode = 1;
      })
      .finally(() => app.quit());
    return;
  }
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
