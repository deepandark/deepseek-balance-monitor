const api = window.electronAPI

export async function fetchBalance() {
  return api.fetchBalance()
}

export async function getLatestBalance() {
  return api.getLatestBalance()
}

export async function getHistory(days: number) {
  return api.getHistory(days)
}

export async function getConsumption(days: number) {
  return api.getConsumption(days)
}

export async function getSettings() {
  return api.getSettings()
}

export async function setSetting(key: string, value: unknown) {
  return api.setSetting(key, value)
}

export async function quitApp() {
  return api.quitApp()
}

export function onBalanceUpdated(callback: (record: Parameters<typeof api.onBalanceUpdated>[0]) => void) {
  return api.onBalanceUpdated(callback)
}

export function onFetchError(callback: (error: string) => void) {
  return api.onFetchError(callback)
}

export function onNavigate(callback: (page: string) => void) {
  return api.onNavigate(callback)
}
