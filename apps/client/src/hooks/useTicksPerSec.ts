import { useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'

export function useTicksPerSec(): number {
  const ticks = useTickStore((s) => s.ticks)
  const countRef = useRef(0)
  const [ticksPerSec, setTicksPerSec] = useState(0)

  useEffect(() => {
    countRef.current += 1
  })

  useEffect(() => {
    const id = setInterval(() => {
      setTicksPerSec(countRef.current)
      countRef.current = 0
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return ticksPerSec
}
