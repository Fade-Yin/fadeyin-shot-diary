// Preserve ARM64 defaults; explicitly select Intel helper binaries for x64 builds.
const config=structuredClone(require('./package.json').build);
config.mac.files=config.mac.files.map(p=>p.replace('!node_modules/ffprobe-static/bin/darwin/x64/**','!node_modules/ffprobe-static/bin/darwin/arm64/**'));
config.mac.binaries=config.mac.binaries.map(p=>p.replace('/darwin/arm64/','/darwin/x64/'));
module.exports=config;
