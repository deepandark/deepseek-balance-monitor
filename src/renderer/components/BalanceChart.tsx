import ReactECharts from 'echarts-for-react'
import type { BalanceRecord } from '@/types/balance'

interface Props {
  records: BalanceRecord[]
}

export default function BalanceChart({ records }: Props): JSX.Element {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        暂无数据，请先配置 API Key 并刷新
      </div>
    )
  }

  const option = {
    tooltip: {
      trigger: 'axis' as const,
      valueFormatter: (value: number) => `¥${value.toFixed(2)}`
    },
    grid: {
      left: 60,
      right: 20,
      top: 20,
      bottom: 30
    },
    xAxis: {
      type: 'category' as const,
      data: records.map(r => {
        const d = new Date(r.created_at)
        return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      }),
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`
      }
    },
    series: [
      {
        name: '总余额',
        type: 'line',
        data: records.map(r => r.total_balance),
        smooth: true,
        lineStyle: { width: 2, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59,130,246,0.15)' },
              { offset: 1, color: 'rgba(59,130,246,0)' }
            ]
          }
        }
      }
    ]
  }

  return (
    <ReactECharts option={option} style={{ height: 300 }} notMerge />
  )
}
