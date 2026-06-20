import ReactECharts from 'echarts-for-react'
import type { DailyConsumption } from '@/types/balance'

interface Props {
  data: DailyConsumption[]
}

export default function ConsumptionChart({ data }: Props): JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        数据不足，至少需要两天的记录才能计算消耗
      </div>
    )
  }

  const dates = data.map(d => {
    const parts = d.date.split('-')
    return `${parts[1]}/${parts[2]}` // MM/DD
  })

  const values = data.map(d => d.consumption)
  const isRecharge = data.map(d => d.isRecharge)

  const option = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0]
        const idx = data.findIndex(d => {
          const parts = d.date.split('-')
          return `${parts[1]}/${parts[2]}` === p.name
        })
        if (idx >= 0 && isRecharge[idx]) {
          return `<strong>${p.name}</strong><br/>💰 充值日 (余额增加)`
        }
        return `<strong>${p.name}</strong><br/>消耗: ¥${p.value.toFixed(2)}`
      }
    },
    grid: {
      left: 60,
      right: 20,
      top: 20,
      bottom: 30
    },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(2)}`
      }
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: isRecharge[i] ? '#f59e0b' : '#3b82f6' // amber for recharge, blue for normal
          }
        })),
        barMaxWidth: 30
      }
    ]
  }

  return (
    <ReactECharts option={option} style={{ height: 300 }} notMerge />
  )
}
