import { memo, useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, LastPriceAnimationMode, LineData, LineSeries, LineType } from 'lightweight-charts'
import { useTickStore } from '../store/useTickStore'

type Props = { symbol: string }

const CHART_OPTIONS = {
  layout: { background: { color: '#161b22' }, textColor: '#8b949e' },
  grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
  crosshair: { vertLine: { labelBackgroundColor: '#21262d' }, horzLine: { labelBackgroundColor: '#21262d' } },
  timeScale: { borderColor: '#21262d', timeVisible: true, secondsVisible: true },
  rightPriceScale: { borderColor: '#21262d' },
  height: 240,
}

export const PriceChart = memo(function PriceChart({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tick = useTickStore((s) => s.ticks[symbol])
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current!, CHART_OPTIONS);
    seriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#58a6ff',
      lineWidth: 1,
      lastPriceAnimation: LastPriceAnimationMode.Continuous,
      lineType: LineType.Simple
    });

    const observer = new ResizeObserver(() => chartRef.current?.applyOptions({ width: containerRef.current!.clientWidth }));
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!tick) return;

    seriesRef.current?.update({ time: new Date().getTime() / 1000 as LineData['time'], value: tick?.price })
  }, [tick]);

  return (
    <div style={{ padding: 20 }}>
        <div ref={containerRef} style={{ width: '100%', height: 240 }} />
    </div>
  )
})
