import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

export interface Settings {
  apiKey: string
  pollIntervalMinutes: number
  autoStart: boolean
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  pollIntervalMinutes: 60,
  autoStart: false
}

type SettingsListener = (settings: Settings) => void
const listeners: SettingsListener[] = []

function getSettingsPath(): string {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }
  return join(userDataPath, 'settings.json')
}

export function getSettings(): Settings {
  const settingsPath = getSettingsPath()
  if (!existsSync(settingsPath)) {
    return { ...DEFAULT_SETTINGS }
  }
  try {
    const data = readFileSync(settingsPath, 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Settings {
  const settings = getSettings()
  settings[key] = value
  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
  // Notify listeners
  for (const listener of listeners) {
    listener(settings)
  }
  return settings
}

export function onSettingsChange(callback: SettingsListener): () => void {
  listeners.push(callback)
  return () => {
    const idx = listeners.indexOf(callback)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}
