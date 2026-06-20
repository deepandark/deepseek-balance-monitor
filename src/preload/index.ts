import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Balance
  fetchBalance: () => ipcRenderer.invoke('balance:fetch'),
  getLatestBalance: () => ipcRenderer.invoke('balance:get-latest'),
  getHistory: (days: number) => ipcRenderer.invoke('balance:get-history', { days }),
  getConsumption: (days: number) => ipcRenderer.invoke('balance:get-consumption', { days }),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSetting: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', { key, value }),

  // App
  quitApp: () => ipcRenderer.invoke('app:quit'),

  // Events (main -> renderer)
  onBalanceUpdated: (callback: (record: unknown) => void) => {
    const handler = (_event: unknown, record: unknown) => callback(record)
    ipcRenderer.on('balance:updated', handler)
    return () => ipcRenderer.removeListener('balance:updated', handler)
  },
  onFetchError: (callback: (error: string) => void) => {
    const handler = (_event: unknown, error: string) => callback(error)
    ipcRenderer.on('balance:fetch-error', handler)
    return () => ipcRenderer.removeListener('balance:fetch-error', handler)
  },
  onNavigate: (callback: (page: string) => void) => {
    const handler = (_event: unknown, page: string) => callback(page)
    ipcRenderer.on('navigate', handler)
    return () => ipcRenderer.removeListener('navigate', handler)
  }
})
