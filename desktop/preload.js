const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('fadeYinDesktop', {
  platform: process.platform,
  getPathForFile: file => webUtils.getPathForFile(file),
  describeVideo: path => ipcRenderer.invoke('fadeyin:describe-video', path),
  requestAI: options => ipcRenderer.invoke('fadeyin:ai-request', options),
  cancelAI: () => ipcRenderer.send('fadeyin:ai-cancel'),
  analyzeVideo: options => ipcRenderer.invoke('fadeyin:analyze', options),
  chooseExportFolder: () => ipcRenderer.invoke('fadeyin:choose-export-folder'),
  splitVideo: options => ipcRenderer.invoke('fadeyin:split-video', options),
  revealPath: path => ipcRenderer.invoke('fadeyin:reveal-path', path),
  cancel: () => ipcRenderer.send('fadeyin:cancel'),
  onProgress: callback => {
    const listener = (_event, detail) => callback(detail);
    ipcRenderer.on('fadeyin:progress', listener);
    return () => ipcRenderer.removeListener('fadeyin:progress', listener);
  }
});
