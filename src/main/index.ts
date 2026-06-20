import { app, BrowserWindow, shell, Tray } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { createTray, setQuitting, destroyTray, updateTrayTooltip } from './tray'
import { startPolling, stopPolling, initPollingListener, fetchAndStore as pollNow } from './poller'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function isDev(): boolean {
  return process.env['ELECTRON_RENDERER_URL'] !== undefined
}

function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 720,
    minWidth: 600,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev() && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  // Register IPC handlers before creating window
  registerIpcHandlers(() => mainWindow)

  const win = createWindow()

  // Create tray with refresh callback
  tray = createTray(win, () => {
    if (mainWindow) {
      startPolling(mainWindow)
    }
  })

  // Start background polling
  startPolling(win)
  initPollingListener(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
  setQuitting(true)
  stopPolling()
  destroyTray()
})

app.on('window-all-closed', () => {
  // Don't quit - we stay in the tray
  // Only actual quit via tray menu or app.quit() will exit
})
