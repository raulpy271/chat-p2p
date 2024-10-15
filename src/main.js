
import path from 'path'
import {app, BrowserWindow, ipcMain} from 'electron'
import {chat} from './node.js'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(path.resolve(), 'assets/preload.js')
    }
  })
  win.loadFile('../assets/index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('name', () => chat.name)
  ipcMain.handle('addrs', () => {
    return chat.node.getMultiaddrs().map(ad => ad.toString())
  })
  ipcMain.on('msg', (evt, inpt) => chat.handleInput(inpt))
  createWindow()
})
