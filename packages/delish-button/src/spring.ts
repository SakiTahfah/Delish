/**
 * Builds a CSS `linear()` easing that traces an underdamped spring, so the
 * whole bounce runs on the compositor with zero JavaScript per frame.
 *
 * @param bounce   0 = no overshoot, 0.85 = very wobbly.
 * @param response Perceived speed of one oscillation, in ms.
 * @returns        The easing string and the time (ms) the spring takes to settle.
 */
export function spring(bounce: number, response: number): { easing: string; duration: number } {
  const zeta = 1 - Math.min(Math.max(bounce, 0.01), 0.85) // damping ratio, kept underdamped
  const omega = (2 * Math.PI) / (response / 1000) // natural frequency (rad/s)
  const wd = omega * Math.sqrt(1 - zeta * zeta) // damped frequency
  const settle = Math.log(1000) / (zeta * omega) // envelope < 0.1%
  const steps = 40
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * settle
    const x =
      i === steps
        ? 1
        : 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t))
    points.push(String(Math.round(x * 1000) / 1000))
  }
  return { easing: `linear(${points.join(',')})`, duration: Math.round(settle * 1000) }
}

/**
 * The press-and-hold curve: one continuous transition from scale 1 that eases
 * down to `pressScale` in ~140ms, then keeps sinking slowly toward `holdScale`,
 * arriving exactly when the press becomes a long press. Because it's a single
 * transition, releasing at any moment springs back from wherever it is.
 */
export function holdCurve(pressScale: number, holdScale: number, holdMs: number) {
  const target = Math.min(holdScale, pressScale)
  const duration = Math.round(Math.max(holdMs, 140))
  // Fraction of the travel the quick press covers, and when it should get there.
  const p1 = (1 - pressScale) / (1 - target || 1)
  const t1 = 140 / duration
  // One ease-out power curve 1-(1-t)^k through (t1, p1): fast start, then a
  // continuously slowing sink — no kinks, velocity reaches 0 at the end.
  const k = p1 >= 0.999 || t1 >= 0.999 ? 3 : Math.max(1, Math.log(1 - p1) / Math.log(1 - t1))
  const steps = 24
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    points.push(String(Math.round((1 - (1 - i / steps) ** k) * 1000) / 1000))
  }
  return { easing: `linear(${points.join(',')})`, duration: p1 >= 0.999 ? 140 : duration, target }
}

const cache = new Map<string, ReturnType<typeof spring>>()

/** Memoized `spring()` — buttons with the same settings share one curve. */
export function cachedSpring(bounce: number, response: number) {
  const key = bounce + ':' + response
  let s = cache.get(key)
  if (!s) cache.set(key, (s = spring(bounce, response)))
  return s
}
