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

    ctx.strokeStyle = '#89b4fa'
    ctx.lineWidth = 1.5
    ctx.beginPath()

    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width
      const y = height - ((p - min) / range) * height
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    // LEARNER TODO Week 4: replace with uPlot or lightweight-charts
  }, [tick])

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontFamily: 'monospace', marginBottom: 8 }}>{symbol}</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        style={{ background: '#1e1e2e', borderRadius: 4, display: 'block' }}
      />
      <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6c7086', marginTop: 4 }}>
        Price: {tick?.price.toFixed(2) ?? '—'}
      </p>
    </div>
  )
})
