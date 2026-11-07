import * as React from 'react'
import { useDelish, type UseDelishOptions } from './useDelish'

declare const process: { env: { NODE_ENV?: string } }

export type DelishVariant = 'filled' | 'ghost'
export type DelishSize = 'sm' | 'md' | 'lg'

export interface DelishProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    Omit<UseDelishOptions, 'disabled'> {
  /** Visual style. */
  variant?: DelishVariant
  /** Height, padding and type size. */
  size?: DelishSize
  /** Icon rendered before the label. Hidden from assistive tech. */
  iconStart?: React.ReactNode
  /** Icon rendered after the label. Hidden from assistive tech. */
  iconEnd?: React.ReactNode
  /** Shows a spinner, keeps the button's width, and blocks activation. */
  loading?: boolean
  /** Text announced to screen readers while loading. */
  loadingLabel?: string
  /**
   * Disables the button. Uses `aria-disabled` so it stays focusable and
   * discoverable by keyboard and screen reader users.
   */
  disabled?: boolean
}

export const Delish = React.forwardRef<HTMLButtonElement, DelishProps>(function Delish(
  {
    variant = 'filled',
    size = 'md',
    iconStart,
    iconEnd,
    loading = false,
    loadingLabel = 'Loading',
    disabled = false,
    pressScale,
    longPressScale,
    longPressDelay,
    bounce,
    ripple,
    onLongPress,
    className,
    style,
    children,
    type = 'button',
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur,
    onContextMenu,
    ...rest
  },
  ref,
) {
  const inert = disabled || loading
  const { pressProps, ripples } = useDelish(
    { pressScale, longPressScale, longPressDelay, bounce, ripple, onLongPress, disabled: inert },
    { onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp, onBlur, onContextMenu },
  )

  const iconOnly = children == null || children === false
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && iconOnly && !rest['aria-label'] && !rest['aria-labelledby']) {
    console.warn('[delish] Icon-only buttons need an `aria-label` so screen readers can name them.')
  }

  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      {...pressProps}
      style={{ ...pressProps.style, ...style }}
      className={className ? 'delish ' + className : 'delish'}
      data-variant={variant}
      data-size={size}
      data-icon-only={iconOnly ? '' : undefined}
      data-loading={loading ? '' : undefined}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (inert) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      }}
    >
      {ripples}
      <span className="delish-content">
        {iconStart != null && (
          <span className="delish-icon" aria-hidden="true">
            {iconStart}
          </span>
        )}
        {!iconOnly && <span className="delish-label">{children}</span>}
        {iconEnd != null && (
          <span className="delish-icon" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </span>
      {loading && (
        <>
          <span className="delish-spinner" aria-hidden="true" />
          <span className="delish-sr">{loadingLabel}</span>
        </>
      )}
    </button>
  )
})
