export interface BalanceRecord {
  id: number
  total_balance: number
  currency: string
  is_available: number
  raw_json: string
  created_at: string
}

export interface DailyConsumption {
  date: string
  consumption: number
  isRecharge: boolean
}

export interface Settings {
  apiKey: string
  pollIntervalMinutes: number
  autoStart: boolean
}

export interface ElectronAPI {
  fetchBalance: () => Promise<BalanceRecord>
  getLatestBalance: () => Promise<BalanceRecord | null>
  getHistory: (days: number) => Promise<BalanceRecord[]>
  getConsumption: (days: number) => Promise<DailyConsumption[]>
  getSettings: () => Promise<Settings>
  setSetting: (key: string, value: unknown) => Promise<void>
  quitApp: () => Promise<void>
  onBalanceUpdated: (callback: (record: BalanceRecord) => void) => () => void
  onFetchError: (callback: (error: string) => void) => () => void
  onNavigate: (callback: (page: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
