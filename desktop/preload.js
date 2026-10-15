const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('fadeYinDesktop', {
  platform: process.platform,
  setAppearance: (theme,preference) => ipcRenderer.invoke('fadeyin:appearance', theme,preference),
  onNativeCommand: callback => {
    const listener=(_event,command)=>callback(command);
    ipcRenderer.on('fadeyin:native-command',listener);
    return ()=>ipcRenderer.removeListener('fadeyin:native-command',listener);
  },
  updateNativeMenu: state => ipcRenderer.send('fadeyin:native-menu-state',state),
  closeChoice: choice => ipcRenderer.invoke('fadeyin:close-choice', choice),
  onCloseRequested: callback => {
    const listener=()=>callback();ipcRenderer.on('fadeyin:close-requested',listener);
    return ()=>ipcRenderer.removeListener('fadeyin:close-requested',listener);
  },
  getPathForFile: file => webUtils.getPathForFile(file),
  describeVideo: path => ipcRenderer.invoke('fadeyin:describe-video', path),
  requestAI: options => ipcRenderer.invoke('fadeyin:ai-request', options),
  cancelAI: () => ipcRenderer.send('fadeyin:ai-cancel'),
  analyzeVideo: options => ipcRenderer.invoke('fadeyin:analyze', options),
  chooseExportFolder: () => ipcRenderer.invoke('fadeyin:choose-export-folder'),
  screenshotDirectory: () => ipcRenderer.invoke('fadeyin:screenshot-directory'),
  chooseScreenshotDirectory: () => ipcRenderer.invoke('fadeyin:choose-screenshot-directory'),
  saveScreenshot: options => ipcRenderer.invoke('fadeyin:save-screenshot', options),
  splitVideo: options => ipcRenderer.invoke('fadeyin:split-video', options),
  exportStills: options => ipcRenderer.invoke('fadeyin:export-stills', options),
  saveReport: options => ipcRenderer.invoke('fadeyin:save-report', options),
  revealPath: path => ipcRenderer.invoke('fadeyin:reveal-path', path),
  cancel: () => ipcRenderer.send('fadeyin:cancel'),
  onProgress: callback => {
    const listener = (_event, detail) => callback(detail);
    ipcRenderer.on('fadeyin:progress', listener);
    return () => ipcRenderer.removeListener('fadeyin:progress', listener);
  }
});
