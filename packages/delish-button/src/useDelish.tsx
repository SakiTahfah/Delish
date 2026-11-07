import * as React from 'react'
import { cachedSpring, holdCurve } from './spring'

export interface UseDelishOptions {
  /** Scale the surface reaches quickly on press (~140ms). */
  pressScale?: number
  /** Scale the surface slowly sinks to while held, reached at `longPressDelay`. */
  longPressScale?: number
  /** Milliseconds held before a press becomes a long press. */
  longPressDelay?: number
  /** Spring overshoot on release, 0 (none) to 0.85 (very wobbly). */
  bounce?: number
  /** Show a ripple from the point of contact. */
  ripple?: boolean
  /** Called once when a press crosses `longPressDelay`. */
  onLongPress?: () => void
  /** Turns the press interaction off (e.g. while disabled or loading). */
  disabled?: boolean
}

type Handlers = Pick<
  React.HTMLAttributes<HTMLElement>,
  'onPointerDown' | 'onPointerUp' | 'onPointerLeave' | 'onPointerCancel' | 'onKeyDown' | 'onKeyUp' | 'onBlur' | 'onContextMenu'
>

export interface UseDelishResult {
  /** Spread onto the element. Pass your own handlers as the second argument of `useDelish`. */
  pressProps: Handlers & {
    'data-pressed'?: ''
    'data-press'?: 'tap' | 'long'
    style: React.CSSProperties
  }
  /** Render inside the element (first child) to show ripples. `null` when `ripple` is false. */
  ripples: React.ReactNode
  /** True while the element is held down. */
  pressed: boolean
  /** True once the current press has become a long press. */
  longPressed: boolean
}

interface Ripple {
  id: number
  x: number
  y: number
  r: number
  /** Timestamp the fade started, 0 while still held. */
  released: number
}

/** Shortest time the pressed state is shown, so a quick tap still visibly squishes. */
const MIN_PRESS = 110
/** Matches the ripple fade in styles.css. */
const RIPPLE_FADE = 500

let rippleId = 0

export function useDelish(options: UseDelishOptions = {}, handlers: Handlers = {}): UseDelishResult {
  const {
    pressScale = 0.9,
    longPressScale = 0.87,
    longPressDelay = 350,
    bounce = 0.5,
    ripple = true,
    onLongPress,
    disabled = false,
  } = options

  const [pressed, setPressed] = React.useState(false)
  const [kind, setKind] = React.useState<'tap' | 'long' | undefined>(undefined)
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const startedAt = React.useRef(0)
  const longTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const releaseTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const rippleTimers = React.useRef(new Set<ReturnType<typeof setTimeout>>())
  const onLongPressRef = React.useRef(onLongPress)
  onLongPressRef.current = onLongPress

  const clearTimers = () => {
    clearTimeout(longTimer.current)
    clearTimeout(releaseTimer.current)
  }
  React.useEffect(
    () => () => {
      clearTimers()
      rippleTimers.current.forEach(clearTimeout)
    },
    [],
  )

  /** Fade out every held ripple, then drop it once the fade has finished. */
  const releaseRipples = React.useCallback(() => {
    const now = Date.now()
    setRipples((rs) => (rs.some((r) => !r.released) ? rs.map((r) => (r.released ? r : { ...r, released: now })) : rs))
    const t = setTimeout(() => {
      rippleTimers.current.delete(t)
      const cutoff = Date.now() - RIPPLE_FADE + 20
      setRipples((rs) => rs.filter((r) => !r.released || r.released > cutoff))
    }, RIPPLE_FADE)
    rippleTimers.current.add(t)
  }, [])

  const press = React.useCallback(
    (el: HTMLElement, clientX?: number, clientY?: number) => {
      if (disabled) return
      clearTimers()
      startedAt.current = Date.now()
      setPressed(true)
      setKind('tap')
      longTimer.current = setTimeout(() => {
        setKind('long')
        onLongPressRef.current?.()
      }, longPressDelay)

      if (ripple) {
        // Measure in the element's own (unscaled) coordinates — it may be mid-bounce.
        const rect = el.getBoundingClientRect()
        const w = el.offsetWidth
        const h = el.offsetHeight
        const sx = rect.width ? w / rect.width : 1
        const sy = rect.height ? h / rect.height : 1
        const x = clientX == null ? w / 2 : (clientX - rect.left) * sx
        const y = clientY == null ? h / 2 : (clientY - rect.top) * sy
        // Big enough to reach the farthest corner from the point of contact.
        const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
        setRipples((rs) => [...rs, { id: ++rippleId, x, y, r, released: 0 }])
      }
    },
    [disabled, longPressDelay, ripple],
  )

  const release = React.useCallback(() => {
    clearTimeout(longTimer.current)
    const wait = Math.max(0, MIN_PRESS - (Date.now() - startedAt.current))
    releaseTimer.current = setTimeout(() => {
      setPressed(false)
      releaseRipples()
    }, wait)
  }, [releaseRipples])

  // Abandoned press: let go immediately.
  const cancel = React.useCallback(() => {
    clearTimers()
    setPressed(false)
    releaseRipples()
  }, [releaseRipples])

  React.useEffect(() => {
    if (disabled) cancel()
  }, [disabled, cancel])

  const style = React.useMemo(() => {
    const hold = holdCurve(pressScale, longPressScale, longPressDelay)
    const tap = cachedSpring(bounce, 420)
    const long = cachedSpring(Math.min(bounce + 0.15, 0.85), 480)
    return {
      '--delish-hold-scale': hold.target,
      '--delish-hold-easing': hold.easing,
      '--delish-hold-duration': hold.duration + 'ms',
      '--delish-spring': tap.easing,
      '--delish-spring-duration': tap.duration + 'ms',
      '--delish-spring-long': long.easing,
      '--delish-spring-long-duration': long.duration + 'ms',
    } as React.CSSProperties
  }, [bounce, pressScale, longPressScale, longPressDelay])

  const rippleNodes = ripple ? (
    <span className="delish-ripples" aria-hidden="true">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="delish-ripple"
          data-released={r.released ? '' : undefined}
          style={{ left: r.x - r.r, top: r.y - r.r, width: r.r * 2, height: r.r * 2 }}
        />
      ))}
    </span>
  ) : null

  const pressProps: UseDelishResult['pressProps'] = {
    style,
    'data-pressed': pressed ? '' : undefined,
    'data-press': kind,
    onPointerDown(e) {
      handlers.onPointerDown?.(e)
      // Primary mouse button, touch or pen tip only.
      if (!e.defaultPrevented && !(e.button > 0)) press(e.currentTarget, e.clientX, e.clientY)
    },
    onPointerUp(e) {
      handlers.onPointerUp?.(e)
      if (pressed) release()
    },
    onPointerLeave(e) {
      handlers.onPointerLeave?.(e)
      if (pressed) release()
    },
    onPointerCancel(e) {
      handlers.onPointerCancel?.(e)
      cancel()
    },
    onKeyDown(e) {
      handlers.onKeyDown?.(e)
      if (e.defaultPrevented || e.repeat || disabled) return
      // Keyboard presses ripple from the center.
      if (e.key === ' ') press(e.currentTarget)
      // Enter activates on keydown natively, so give it a full tap pulse.
      if (e.key === 'Enter') {
        press(e.currentTarget)
        release()
      }
    },
    onKeyUp(e) {
      handlers.onKeyUp?.(e)
      if (e.key === ' ' && pressed) release()
    },
    onBlur(e) {
      handlers.onBlur?.(e)
      if (pressed) cancel()
    },
    onContextMenu(e) {
      handlers.onContextMenu?.(e)
      // A long touch press shouldn't pop the OS context menu mid-squish.
      if (pressed) e.preventDefault()
    },
  }

  return { pressProps, ripples: rippleNodes, pressed, longPressed: pressed && kind === 'long' }
}
