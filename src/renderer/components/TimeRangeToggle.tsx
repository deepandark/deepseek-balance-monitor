interface Props {
  value: number
  onChange: (days: number) => void
}

const OPTIONS = [
  { days: 7, label: '7 天' },
  { days: 30, label: '30 天' },
  { days: 90, label: '90 天' }
]

export default function TimeRangeToggle({ value, onChange }: Props): JSX.Element {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      {OPTIONS.map(opt => (
        <button
          key={opt.days}
          onClick={() => onChange(opt.days)}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            value === opt.days
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
