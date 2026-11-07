import * as React from 'react'
import { cachedSpring } from './spring'

export interface UseDelishOptions {
  /** Scale of the whole element while pressed. */
  pressScale?: number
  /** Scale of the inner `.delish-content` during a long press. */
  longPressScale?: number
  /** Milliseconds held before a press becomes a long press. */
  longPressDelay?: number
  /** Spring overshoot, 0 (none) to 0.85 (very wobbly). */
  bounce?: number
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
  /** Spread onto the element. Compose with your own handlers via the second argument of `useDelish`. */
  pressProps: Handlers & {
    'data-pressed'?: ''
    'data-press'?: 'tap' | 'long'
    style: React.CSSProperties
  }
  /** True while the element is held down. */
  pressed: boolean
  /** True once the current press has become a long press. */
  longPressed: boolean
}

/** Shortest time the pressed state is shown, so a quick tap still visibly squishes. */
const MIN_PRESS = 110

export function useDelish(options: UseDelishOptions = {}, handlers: Handlers = {}): UseDelishResult {
  const {
    pressScale = 0.9,
    longPressScale = 0.82,
    longPressDelay = 350,
    bounce = 0.5,
    onLongPress,
    disabled = false,
  } = options

  const [pressed, setPressed] = React.useState(false)
  const [kind, setKind] = React.useState<'tap' | 'long' | undefined>(undefined)
  const startedAt = React.useRef(0)
  const longTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const releaseTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const onLongPressRef = React.useRef(onLongPress)
  onLongPressRef.current = onLongPress

  const clearTimers = () => {
    clearTimeout(longTimer.current)
    clearTimeout(releaseTimer.current)
  }
  React.useEffect(() => clearTimers, [])

  const press = React.useCallback(() => {
    if (disabled) return
    clearTimers()
    startedAt.current = Date.now()
    setPressed(true)
    setKind('tap')
    longTimer.current = setTimeout(() => {
      setKind('long')
      onLongPressRef.current?.()
    }, longPressDelay)
  }, [disabled, longPressDelay])

  const release = React.useCallback(() => {
    clearTimeout(longTimer.current)
    const wait = Math.max(0, MIN_PRESS - (Date.now() - startedAt.current))
    releaseTimer.current = setTimeout(() => setPressed(false), wait)
  }, [])

  // Releasing immediately (no minimum) — used when the press is abandoned.
  const cancel = React.useCallback(() => {
    clearTimers()
    setPressed(false)
  }, [])

  React.useEffect(() => {
    if (disabled) cancel()
  }, [disabled, cancel])

  const style = React.useMemo(() => {
    const tap = cachedSpring(bounce, 420)
    const long = cachedSpring(Math.min(bounce + 0.2, 0.85), 520)
    return {
      '--delish-press-scale': pressScale,
      '--delish-long-scale': longPressScale,
      '--delish-spring': tap.easing,
      '--delish-spring-duration': tap.duration + 'ms',
      '--delish-spring-long': long.easing,
      '--delish-spring-long-duration': long.duration + 'ms',
    } as React.CSSProperties
  }, [bounce, pressScale, longPressScale])

  const pressProps: UseDelishResult['pressProps'] = {
    style,
    'data-pressed': pressed ? '' : undefined,
    'data-press': kind,
    onPointerDown(e) {
      handlers.onPointerDown?.(e)
      // Only the primary button / a touch / a pen tip starts a press.
      if (!e.defaultPrevented && !(e.button > 0)) press()
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
      if (e.key === ' ') press()
      // Enter activates on keydown natively, so give it a full tap pulse.
      if (e.key === 'Enter') {
        press()
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

  return { pressProps, pressed, longPressed: pressed && kind === 'long' }
}
