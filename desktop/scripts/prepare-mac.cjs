const fs = require('fs');
const path = require('path');
const assert = require('assert');

module.exports = async context => {
  if (context.electronPlatformName !== 'darwin') return;
  const arch = { 1: 'x64', 3: 'arm64' }[context.arch];
  assert(arch, 'Mac release requires x64 or arm64');
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  const base = 'Contents/Resources/app.asar.unpacked/node_modules';
  const probeRoot = path.join(app, base, 'ffprobe-static/bin');
  for (const platform of fs.readdirSync(probeRoot)) {
    if (platform !== 'darwin') fs.rmSync(path.join(probeRoot, platform), { recursive: true });
  }
  for (const other of fs.readdirSync(path.join(probeRoot, 'darwin'))) {
    if (other !== arch) fs.rmSync(path.join(probeRoot, 'darwin', other), { recursive: true });
  }
  // Explicitly include unpacked media executables in the nested signing pass.
  context.packager.platformSpecificBuildOptions.binaries = [
    `${base}/ffmpeg-static/ffmpeg`,
    `${base}/ffprobe-static/bin/darwin/${arch}/ffprobe`,
  ];
};
