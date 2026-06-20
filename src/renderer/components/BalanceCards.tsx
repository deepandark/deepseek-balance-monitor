import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import type { BalanceRecord } from '@/types/balance'

interface Props {
  latest: BalanceRecord | null
  todayConsumption: number
  loading: boolean
}

export default function BalanceCards({ latest, todayConsumption, loading }: Props): JSX.Element {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded animate-pulse w-16 mb-2" />
              <div className="h-8 bg-muted rounded animate-pulse w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!latest) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {['总余额', '今日消耗'].map(label => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">--</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    { label: '总余额', value: formatCurrency(latest.total_balance, latest.currency), highlight: true },
    { label: '今日消耗', value: formatCurrency(todayConsumption, latest.currency), warn: todayConsumption > 0 }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map(card => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle>{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                card.highlight
                  ? 'text-primary'
                  : card.warn
                    ? 'text-orange-500'
                    : 'text-foreground'
              }`}
            >
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
