import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { fetchBalance, quitApp } from '@/lib/ipc'

export default function Settings(): JSX.Element {
  const { settings, loading, updateSetting } = useSettings()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [intervalInput, setIntervalInput] = useState('60')
  const [saving, setSaving] = useState(false)
  const [intervalError, setIntervalError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setApiKeyInput(settings.apiKey)
      setIntervalInput(String(settings.pollIntervalMinutes))
    }
  }, [settings])

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">设置</h1>
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  const showMessage = (msg: string): void => {
    setSaveMessage(msg)
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleSaveApiKey = async (): Promise<void> => {
    const trimmed = apiKeyInput.trim()
    if (trimmed && !trimmed.startsWith('sk-')) {
      setIntervalError('API Key 应以 sk- 开头')
      return
    }
    setSaving(true)
    await updateSetting('apiKey', trimmed)
    setSaving(false)
    showMessage('API Key 已保存')
  }

  const handleSaveInterval = async (): Promise<void> => {
    const val = parseInt(intervalInput, 10)
    if (isNaN(val) || val < 5 || val > 1440) {
      setIntervalError('请输入 5 ~ 1440 之间的数字')
      return
    }
    setIntervalError(null)
    setSaving(true)
    await updateSetting('pollIntervalMinutes', val)
    setSaving(false)
    showMessage('轮询间隔已保存')
  }

  const handleIntervalChange = (value: string): void => {
    setIntervalInput(value)
    const val = parseInt(value, 10)
    if (value && (isNaN(val) || val < 5 || val > 1440)) {
      setIntervalError('请输入 5 ~ 1440 之间的数字')
    } else {
      setIntervalError(null)
    }
  }

  const handleAutoStartToggle = async (checked: boolean): Promise<void> => {
    await updateSetting('autoStart', checked)
    showMessage(checked ? '已开启开机自启' : '已关闭开机自启')
  }

  const handleRefresh = async (): Promise<void> => {
    try {
      await fetchBalance()
      showMessage('刷新成功')
    } catch {
      // Error surfaced via event
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">设置</h1>
        {saveMessage && (
          <span className="text-sm text-green-600 animate-in fade-in">{saveMessage}</span>
        )}
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={saving}>
              保存
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            从{' '}
            <a
              href="https://platform.deepseek.com/api_keys"
              className="text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              platform.deepseek.com/api_keys
            </a>{' '}
            获取
          </p>
        </CardContent>
      </Card>

      {/* Poll Interval */}
      <Card>
        <CardHeader>
          <CardTitle>轮询间隔</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                type="number"
                min={5}
                max={1440}
                value={intervalInput}
                onChange={e => handleIntervalChange(e.target.value)}
                placeholder="60"
              />
            </div>
            <span className="text-sm text-muted-foreground pb-2">分钟</span>
            <Button onClick={handleSaveInterval} disabled={saving}>
              保存
            </Button>
          </div>
          {intervalError && (
            <p className="text-xs text-red-500">{intervalError}</p>
          )}
          <p className="text-xs text-muted-foreground">范围: 5 ~ 1440 分钟 (1 天)</p>
        </CardContent>
      </Card>

      {/* Auto Start */}
      <Card>
        <CardHeader>
          <CardTitle>开机自启</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>系统启动时自动运行</Label>
            <Switch
              checked={settings.autoStart}
              onCheckedChange={handleAutoStartToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>操作</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            立即刷新余额
          </Button>
          <Button
            variant="outline"
            onClick={() => quitApp()}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            退出应用
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
