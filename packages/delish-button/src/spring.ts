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

const cache = new Map<string, ReturnType<typeof spring>>()

/** Memoized `spring()` — buttons with the same settings share one curve. */
export function cachedSpring(bounce: number, response: number) {
  const key = bounce + ':' + response
  let s = cache.get(key)
  if (!s) cache.set(key, (s = spring(bounce, response)))
  return s
}
