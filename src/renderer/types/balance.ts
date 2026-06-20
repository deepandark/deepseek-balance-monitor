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
