export interface BalanceApiResponse {
  is_available: boolean
  balance_infos: Array<{
    currency: string
    total_balance: string
    granted_balance: string
    topped_up_balance: string
  }>
}

export interface BalanceRecordInput {
  total_balance: number
  currency: string
  is_available: number
  raw_json: string
  created_at: string
}

export async function fetchBalance(apiKey: string): Promise<BalanceRecordInput> {
  const res = await fetch('https://api.deepseek.com/user/balance', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  const json: BalanceApiResponse = await res.json()

  if (!json.balance_infos || json.balance_infos.length === 0) {
    throw new Error('Unexpected API response: missing balance_infos')
  }

  const info = json.balance_infos[0]

  return {
    total_balance: parseFloat(info.total_balance),
    currency: info.currency,
    is_available: json.is_available ? 1 : 0,
    raw_json: JSON.stringify(json),
    created_at: new Date().toISOString()
  }
}
