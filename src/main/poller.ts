import { BrowserWindow } from 'electron'
import { fetchBalance } from './api'
import { insertBalance, BalanceRecord } from './database'
import { getSettings, onSettingsChange } from './settings'
import { updateTrayTooltip } from './tray'

let timer: ReturnType<typeof setInterval> | null = null
let isPolling = false

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchAndStore(win: BrowserWindow): Promise<void> {
  if (isPolling) return
  isPolling = true

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const settings = getSettings()
      if (!settings.apiKey) {
        // Skip polling if no API key configured
        break
      }

      const record = await fetchBalance(settings.apiKey)
      const saved = insertBalance(record)

      // Broadcast to renderer
      win.webContents.send('balance:updated', saved)

      // Update tray tooltip
      const currency = record.currency === 'CNY' ? '¥' : '$'
      updateTrayTooltip(`DeepSeek 余额: ${currency}${record.total_balance.toFixed(2)}`)

      isPolling = false
      return
    } catch (err) {
      if (attempt === 2) {
        // Last retry failed, notify renderer
        win.webContents.send('balance:fetch-error', String(err))
      } else {
        await sleep(30_000) // Wait 30s before retry
      }
    }
  }

  isPolling = false
}

export function startPolling(win: BrowserWindow): void {
  stopPolling()

  const settings = getSettings()
  if (!settings.apiKey) return

  const intervalMs = settings.pollIntervalMinutes * 60 * 1000

  // Do an initial fetch
  fetchAndStore(win)

  timer = setInterval(() => {
    fetchAndStore(win)
  }, intervalMs)
}

export function stopPolling(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export { fetchAndStore }

export function restartPolling(win: BrowserWindow): void {
  stopPolling()
  startPolling(win)
}

let lastSettings = getSettings()

// Listen for settings changes that affect polling
export function initPollingListener(win: BrowserWindow): void {
  onSettingsChange((newSettings) => {
    const changed =
      newSettings.apiKey !== lastSettings.apiKey ||
      newSettings.pollIntervalMinutes !== lastSettings.pollIntervalMinutes

    lastSettings = { ...newSettings }

    if (changed || timer === null) {
      restartPolling(win)
    }
  })
}
