import { Circle } from 'lucide-react'

interface Props {
  lastPolled: string | null
  hasApiKey: boolean
  error: string | null
}

export default function StatusIndicator({ lastPolled, hasApiKey, error }: Props): JSX.Element {
  if (!hasApiKey) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
        <span>未配置 API Key</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <Circle className="h-2 w-2 fill-red-500 text-red-500" />
        <span>查询失败: {error}</span>
      </div>
    )
  }

  if (lastPolled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
        <span>上次轮询: {new Date(lastPolled).toLocaleString('zh-CN')}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Circle className="h-2 w-2 fill-yellow-400 text-yellow-400" />
      <span>等待首次查询...</span>
    </div>
  )
}
