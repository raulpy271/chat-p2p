
import path from 'path'
import {app, BrowserWindow, ipcMain} from 'electron'
import {createChat, runChat} from './node.js'

const createWindow = (chat) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(path.resolve(), 'assets/preload.js')
    }
  })
  win.loadFile('../assets/index.html')
  chat.addEventListener('msg-received', (msg) => win.webContents.send('msg-received', msg))
  chat.addEventListener('disconnected', (msg) => win.webContents.send('disconnected', msg))
  chat.addEventListener('peer-name-discovered', (msg) => win.webContents.send('peer-name-discovered', msg))
  //chat.addEventListener('peer-name-discovered', (msg) => {
  //  win.webContents.on('did-finish-load', () => win.webContents.send('peer-name-discovered', msg));
  //})
}

app.whenReady().then(() => {
  const chat = createChat()
  ipcMain.handle('name', () => chat.name)
  ipcMain.handle('addrs', () => {
    return chat.node.getMultiaddrs().map(ad => ad.toString())
  })
  ipcMain.on('msg', (evt, inpt) => chat.handleInput(inpt))
  createWindow(chat)
  runChat(chat)
})

