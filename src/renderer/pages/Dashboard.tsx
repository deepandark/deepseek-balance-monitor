import { useState, useEffect, useRef } from 'react'
import BalanceCards from '@/components/BalanceCards'
import BalanceChart from '@/components/BalanceChart'
import ConsumptionChart from '@/components/ConsumptionChart'
import TimeRangeToggle from '@/components/TimeRangeToggle'
import RefreshButton from '@/components/RefreshButton'
import { getLatestBalance, getHistory, getConsumption, onBalanceUpdated, onFetchError } from '@/lib/ipc'
import type { BalanceRecord, DailyConsumption } from '@/types/balance'

export default function Dashboard(): JSX.Element {
  const [latest, setLatest] = useState<BalanceRecord | null>(null)
  const [history, setHistory] = useState<BalanceRecord[]>([])
  const [consumption, setConsumption] = useState<DailyConsumption[]>([])
  const [todayConsumption, setTodayConsumption] = useState(0)
  const [timeRange, setTimeRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      const record = await getLatestBalance()
      setLatest(record)

      const hist = await getHistory(timeRange)
      setHistory(hist)

      const cons = await getConsumption(timeRange)
      setConsumption(cons)

      const todayCons = await getConsumption(1)
      const today = todayCons.find(c => c.date === new Date().toISOString().slice(0, 10))
      setTodayConsumption(today?.consumption ?? 0)

      setError(null)
    } catch {
      setError('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const isMounted = useRef(false)
  const lastRefreshRef = useRef(0)

  // Initial load + reload when timeRange changes
  useEffect(() => {
    if (isMounted.current) {
      // timeRange changed — only refetch chart data
      ;(async () => {
        const hist = await getHistory(timeRange)
        setHistory(hist)
        const cons = await getConsumption(timeRange)
        setConsumption(cons)
      })()
    } else {
      // Initial mount
      isMounted.current = true
      loadData()
      lastRefreshRef.current = Date.now()
    }
  }, [timeRange])

  // Subscribe to balance updates from polling
  useEffect(() => {
    const unsub1 = onBalanceUpdated((record) => {
      if (record && typeof record === 'object') {
        const r = record as BalanceRecord
        setLatest(r)
        setError(null)
        // Skip full refresh if just loaded (avoid duplicate chart animation)
        if (Date.now() - lastRefreshRef.current < 3000) return
        getHistory(timeRange).then(setHistory)
        getConsumption(timeRange).then(setConsumption)
        getConsumption(1).then(c => {
          const today = c.find(d => d.date === new Date().toISOString().slice(0, 10))
          setTodayConsumption(today?.consumption ?? 0)
        })
      }
    })

    const unsub2 = onFetchError((errMsg) => {
      setError(errMsg)
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [timeRange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DeepSeek 余额监控</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {latest
              ? `上次更新: ${new Date(latest.created_at).toLocaleString('zh-CN')}`
              : '暂无数据'
            }
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Balance Cards */}
      <BalanceCards latest={latest} todayConsumption={todayConsumption} loading={loading} />

      {/* Charts */}
      <div className="space-y-6">
        {/* Balance Trend */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">余额趋势</h2>
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          </div>
          <BalanceChart records={history} />
        </div>

        {/* Daily Consumption */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">每日消耗</h2>
            <p className="text-xs text-muted-foreground">
              🟡 充值日 &nbsp; 🔵 正常消耗
            </p>
          </div>
          <ConsumptionChart data={consumption} />
        </div>
      </div>
    </div>
  )
}
