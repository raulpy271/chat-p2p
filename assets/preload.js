
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('chat', {
  name: () => ipcRenderer.invoke('name'),
  addrs: () => ipcRenderer.invoke('addrs'),
})
