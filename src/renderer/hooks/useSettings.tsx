import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSettings, setSetting } from '@/lib/ipc'
import type { Settings } from '@/types/balance'

interface SettingsContextValue {
  settings: Settings | null
  loading: boolean
  updateSetting: (key: string, value: unknown) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  loading: true,
  updateSetting: async () => {}
})

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const updateSetting = useCallback(async (key: string, value: unknown) => {
    await setSetting(key, value)
    setSettings(prev => prev ? { ...prev, [key]: value } : null)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}
