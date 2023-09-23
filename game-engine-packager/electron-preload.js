const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('steam', {
  send: (stream, data) => {
    ipcRenderer.send(`steam.${stream}`, data);
  },
  receive: (func) => {
    ipcRenderer.on('steam', (event, ...args) => func(...args));
  }
});