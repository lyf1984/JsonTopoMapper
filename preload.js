const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', { filePath, content }),
  onFilePath: (callback) => { ipcRenderer.on('file-path', (_, path) => callback(path)); }
});