export function formatCurrency(amount: number, currency = 'CNY'): string {
  const symbol = currency === 'CNY' ? '¥' : '$'
  return `${symbol}${amount.toFixed(2)}`
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatFullDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
