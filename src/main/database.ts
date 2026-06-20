import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

export interface BalanceRecord {
  id: number
  total_balance: number
  currency: string
  is_available: number
  raw_json: string
  created_at: string
}

function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }
  return join(userDataPath, 'balance_records.json')
}

function readRecords(): BalanceRecord[] {
  const dbPath = getDbPath()
  if (!existsSync(dbPath)) {
    return []
  }
  try {
    const data = readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeRecords(records: BalanceRecord[]): void {
  const dbPath = getDbPath()
  writeFileSync(dbPath, JSON.stringify(records, null, 2), 'utf-8')
}

export function insertBalance(record: Omit<BalanceRecord, 'id'>): BalanceRecord {
  const records = readRecords()
  const maxId = records.length > 0 ? Math.max(...records.map(r => r.id)) : 0
  const newRecord: BalanceRecord = { ...record, id: maxId + 1 }
  records.push(newRecord)
  writeRecords(records)
  return newRecord
}

export function getLatest(): BalanceRecord | null {
  const records = readRecords()
  if (records.length === 0) return null
  return records.reduce((latest, r) =>
    r.created_at > latest.created_at ? r : latest
  )
}

export function getHistory(days: number): BalanceRecord[] {
  const records = readRecords()
  if (records.length === 0) return []

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffISO = cutoff.toISOString()

  return records
    .filter(r => r.created_at >= cutoffISO)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function getAllRecords(): BalanceRecord[] {
  return readRecords()
}
