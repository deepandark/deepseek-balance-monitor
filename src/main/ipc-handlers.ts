import { ipcMain, BrowserWindow } from 'electron'
import { fetchBalance } from './api'
import { insertBalance, getLatest, getHistory, BalanceRecord } from './database'
import { getSettings, setSetting } from './settings'
import { setAutoStart } from './auto-start'

export interface DailyConsumption {
  date: string
  consumption: number
  isRecharge: boolean
}

function computeDailyConsumption(records: BalanceRecord[]): DailyConsumption[] {
  if (records.length < 2) return []

  // Group records by calendar date (YYYY-MM-DD), take the last record of each day
  const byDate = new Map<string, BalanceRecord>()
  for (const r of records) {
    const dateKey = r.created_at.slice(0, 10) // YYYY-MM-DD
    const existing = byDate.get(dateKey)
    if (!existing || r.created_at > existing.created_at) {
      byDate.set(dateKey, r)
    }
  }

  const sortedDates = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))

  const result: DailyConsumption[] = []
  for (let i = 1; i < sortedDates.length; i++) {
    const [date, curr] = sortedDates[i]
    const [, prev] = sortedDates[i - 1]
    const diff = prev.total_balance - curr.total_balance

    result.push({
      date,
      consumption: diff >= 0 ? Math.round(diff * 100) / 100 : 0,
      isRecharge: diff < 0
    })
  }

  return result
}

let pollingCallback: (() => Promise<BalanceRecord>) | null = null

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  // Balance: manual fetch
  ipcMain.handle('balance:fetch', async (): Promise<BalanceRecord | null> => {
    try {
      const settings = getSettings()
      if (!settings.apiKey) {
        throw new Error('API Key not configured')
      }
      const record = await fetchBalance(settings.apiKey)
      const saved = insertBalance(record)

      // Broadcast to renderer
      const win = getMainWindow()
      if (win) {
        win.webContents.send('balance:updated', saved)
      }

      return saved
    } catch (err) {
      const win = getMainWindow()
      if (win) {
        win.webContents.send('balance:fetch-error', String(err))
      }
      throw err
    }
  })

  // Balance: get latest
  ipcMain.handle('balance:get-latest', (): BalanceRecord | null => {
    return getLatest()
  })

  // Balance: get history
  ipcMain.handle('balance:get-history', (_event, { days }: { days: number }): BalanceRecord[] => {
    return getHistory(days)
  })

  // Balance: get daily consumption
  ipcMain.handle('balance:get-consumption', (_event, { days }: { days: number }): DailyConsumption[] => {
    const records = getHistory(days + 1) // need N+1 for N days of consumption
    return computeDailyConsumption(records)
  })

  // Settings
  ipcMain.handle('settings:get', (): ReturnType<typeof getSettings> => {
    return getSettings()
  })

  ipcMain.handle('settings:set', (_event, { key, value }: { key: string; value: unknown }) => {
    const typedKey = key as keyof ReturnType<typeof getSettings>
    setSetting(typedKey, value as never)

    // Side effects
    if (typedKey === 'autoStart') {
      setAutoStart(value as boolean)
    }
  })

  // App: quit
  ipcMain.handle('app:quit', () => {
    const { app } = require('electron')
    app.quit()
  })
}

export function setPollingCallback(cb: () => Promise<BalanceRecord>): void {
  pollingCallback = cb
}
