
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('chat', {
  me: () => ipcRenderer.invoke('me'),
  addrs: () => ipcRenderer.invoke('addrs'),
  msg: (msg) => ipcRenderer.send('msg', msg),
  onMsgReceived: (callback) => ipcRenderer.on('msg-received', (evt, msg) => callback(msg)),
  onDisconnected: (callback) => ipcRenderer.on('disconnected', (evt, msg) => callback(msg)),
  onNameDiscovered: (callback) => ipcRenderer.on('peer-name-discovered', (evt, msg) => callback(msg)),
})
