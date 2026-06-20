import { Tray, Menu, BrowserWindow, nativeImage, app } from 'electron'
import { join } from 'path'

let tray: Tray | null = null
let isQuitting = false

export function setQuitting(value: boolean): void {
  isQuitting = value
}

export function createTray(win: BrowserWindow, onRefresh?: () => void): Tray {
  const iconPath = join(app.getAppPath(), 'resources', 'tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  tray.setToolTip('DeepSeek 余额监控')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        win.show()
        win.focus()
      }
    },
    {
      label: '立即刷新',
      click: () => {
        onRefresh?.()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // Double-click to show window
  tray.on('double-click', () => {
    win.show()
    win.focus()
  })

  return tray
}

export function updateTrayTooltip(text: string): void {
  if (tray) {
    tray.setToolTip(text)
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
