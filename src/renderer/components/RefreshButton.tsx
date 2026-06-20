import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchBalance } from '@/lib/ipc'

export default function RefreshButton(): JSX.Element {
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = async (): Promise<void> => {
    setSpinning(true)
    try {
      await fetchBalance()
    } catch {
      // Error is surfaced via onFetchError event
    } finally {
      setSpinning(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={spinning}>
      <RefreshCw className={`h-4 w-4 mr-2 ${spinning ? 'animate-spin' : ''}`} />
      刷新
    </Button>
  )
}
