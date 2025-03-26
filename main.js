const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs').promises

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载本地文件
  const startUrl = path.join(__dirname, 'src/index.html')
  mainWindow.loadFile(startUrl)

  // 开发模式打开调试工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

ipcMain.handle('read-file', async (event, relativePath) => {
  // 开发环境路径
  const devPath = path.join(__dirname, './', relativePath);

  return fs.readFile(devPath, 'utf-8');
});

ipcMain.handle('write-file', async (event, {filePath,content}) => {
  // 开发环境路径
  const devPath = path.join(__dirname, './', filePath);

  return fs.writeFile(devPath, content);
});



app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

const { Menu } = require('electron')

const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '重新加载',
        accelerator: 'CmdOrCtrl+R',
        click: () => mainWindow.reload()
      },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ]
  },
  {
    label: '开发者工具',
    submenu: [
      {
        label: '切换开发者工具',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: () => mainWindow.webContents.toggleDevTools()
      }
    ]
  }
]

Menu.setApplicationMenu(Menu.buildFromTemplate(template))
