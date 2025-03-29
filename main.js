// 主进程：Electron 应用的核心进程，负责窗口管理和系统交互
import { Menu, app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'  // 使用 Promise 版本的 fs 模块
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow  // 主窗口引用
/*----------------------- 窗口管理 -----------------------*/
/**
 * 创建应用主窗口
 */
function createWindow() {
  // 创建浏览器窗口并配置安全设置
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,      // 禁用 Node.js 集成
      contextIsolation: true,      // 启用上下文隔离
      sandbox:false,
      preload: join(__dirname, 'preload.js')  // 预加载脚本
    }
  })

  // 加载本地 HTML 文件
  const startUrl = join(__dirname, 'dist/index.html')
  mainWindow.loadFile(startUrl)

  // 开发模式下自动打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

/*----------------------- IPC 通信处理 -----------------------*/
// 处理渲染进程的文件读取请求
ipcMain.handle('read-file', async (event, relativePath) => {
  return fs.readFile(relativePath, 'utf-8')
})

// 处理渲染进程的文件保存请求
ipcMain.handle('write-file', async (event, { filePath, content }) => {
  return fs.writeFile(filePath, content)
})

/*----------------------- 应用生命周期管理 -----------------------*/
// 应用准备就绪后创建窗口
app.whenReady().then(createWindow)

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// macOS 应用激活时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

/*----------------------- 应用菜单配置 -----------------------*/
const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '打开',
        click: async () => {
          // 显示文件选择对话框
          const { filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
          })
      
          if (filePaths.length > 0) {
            // 将选择的文件路径发送给渲染进程
            mainWindow.webContents.send('file-path', filePaths[0])
          }
        }
      },
      {
        label: '重新加载',
        accelerator: 'CmdOrCtrl+R',
        click: () => mainWindow.reload()
      },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'  // 使用内置退出功能
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

// 设置应用菜单
Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))