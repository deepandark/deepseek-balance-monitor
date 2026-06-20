import { useState, useEffect } from 'react'
import { SettingsProvider } from '@/hooks/useSettings'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import { onNavigate } from '@/lib/ipc'

type Page = 'dashboard' | 'settings'

function Header({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }): JSX.Element {
  const tabs: { key: Page; label: string }[] = [
    { key: 'dashboard', label: '仪表盘' },
    { key: 'settings', label: '设置' }
  ]

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 flex items-center h-12 gap-6">
        <span className="text-lg font-bold mr-4">🧠</span>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              page === tab.key
                ? 'text-foreground border-b-2 border-primary h-full flex items-center'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  )
}

function App(): JSX.Element {
  const [page, setPage] = useState<Page>('dashboard')

  useEffect(() => {
    // Listen for navigation from tray menu (will be used in Step 5)
    return onNavigate((target: string) => {
      if (target === 'dashboard' || target === 'settings') {
        setPage(target)
      }
    })
  }, [])

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background">
        <Header page={page} onNavigate={setPage} />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {page === 'dashboard' ? <Dashboard /> : <Settings />}
        </main>
      </div>
    </SettingsProvider>
  )
}

export default App
