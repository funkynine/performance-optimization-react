import { memo, useEffect, useRef } from 'react'
import { useTickStore } from '../store/useTickStore'

type Props = { symbol: string }

export const PriceChart = memo(function PriceChart({ symbol }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pricesRef = useRef<number[]>([])
  const tick = useTickStore((s) => s.ticks[symbol])

  useEffect(() => {
    if (!tick) return
    pricesRef.current.push(tick.price)
    if (pricesRef.current.length > 200) pricesRef.current.shift()

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const prices = pricesRef.current
    if (prices.length < 2) return

    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1

    ctx.strokeStyle = '#58a6ff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width
      const y = height - ((p - min) / range) * (height - 8) - 4
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    // LEARNER TODO Week 4: replace with uPlot or lightweight-charts
  }, [tick])

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', fontFamily: 'monospace' }}>{symbol}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', fontFamily: 'monospace' }}>
          {tick?.price.toFixed(2) ?? '—'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={240}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 800,
          height: 240,
          background: '#161b22',
          border: '1px solid #21262d',
          borderRadius: 8,
        }}
      />
    </div>
  )
})
