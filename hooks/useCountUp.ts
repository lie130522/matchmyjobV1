'use client'

import { useEffect, useState } from 'react'

/**
 * Animates a number from 0 (or `from`) to `to` over `duration` ms.
 * Returns the current animated value as an integer.
 */
export function useCountUp(to: number, duration = 1200, from = 0): number {
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (to === from) {
      setValue(to)
      return
    }

    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (to - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, from, duration])

  return value
}
