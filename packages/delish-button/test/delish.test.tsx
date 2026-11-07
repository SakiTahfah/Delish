import * as React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { Delish, spring } from '../src'
import { holdCurve } from '../src/spring'

const Star = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 2l3 7h7l-6 4 2 8-6-5-6 5 2-8-6-4h7z" />
  </svg>
)

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  expect(results.violations.map((v) => v.id)).toEqual([])
}

afterEach(() => vi.useRealTimers())

describe('Delish', () => {
  it('renders a native button with type="button" by default', () => {
    render(<Delish>Order</Delish>)
    const btn = screen.getByRole('button', { name: 'Order' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveProperty('type', 'button')
    expect(btn.dataset.variant).toBe('filled')
    expect(btn.dataset.size).toBe('md')
  })

  it('forwards refs, className and native props', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Delish ref={ref} className="mine" variant="ghost" size="lg" type="submit" id="x">
        Go
      </Delish>,
    )
    expect(ref.current?.id).toBe('x')
    expect(ref.current?.className).toBe('delish mine')
    expect(ref.current?.type).toBe('submit')
    expect(ref.current?.dataset.variant).toBe('ghost')
    expect(ref.current?.dataset.size).toBe('lg')
  })

  it('fires onClick on click, Enter and Space', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Delish onClick={onClick}>Go</Delish>)
    const btn = screen.getByRole('button')
    await user.click(btn)
    btn.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('sets pressed state, becomes a long press after the delay, and fires onLongPress once', () => {
    vi.useFakeTimers()
    const onLongPress = vi.fn()
    render(<Delish onLongPress={onLongPress}>Hold</Delish>)
    const btn = screen.getByRole('button')

    fireEvent.pointerDown(btn, { button: 0 })
    expect(btn).toHaveAttribute('data-pressed')
    expect(btn.dataset.press).toBe('tap')

    act(() => vi.advanceTimersByTime(350))
    expect(btn.dataset.press).toBe('long')
    expect(onLongPress).toHaveBeenCalledTimes(1)

    fireEvent.pointerUp(btn)
    act(() => vi.advanceTimersByTime(200))
    expect(btn).not.toHaveAttribute('data-pressed')
    // Kind stays so the release uses the bouncier long-press spring.
    expect(btn.dataset.press).toBe('long')
  })

  it('holds a quick tap pressed for a minimum time so the squish is visible', () => {
    vi.useFakeTimers()
    render(<Delish>Tap</Delish>)
    const btn = screen.getByRole('button')
    fireEvent.pointerDown(btn, { button: 0 })
    fireEvent.pointerUp(btn)
    expect(btn).toHaveAttribute('data-pressed')
    act(() => vi.advanceTimersByTime(120))
    expect(btn).not.toHaveAttribute('data-pressed')
  })

  it('ignores right clicks', () => {
    render(<Delish>Go</Delish>)
    const btn = screen.getByRole('button')
    fireEvent.pointerDown(btn, { button: 2 })
    expect(btn).not.toHaveAttribute('data-pressed')
  })

  it('turns press options into one hold transition on the whole surface', () => {
    render(
      <Delish pressScale={0.92} longPressScale={0.85} longPressDelay={500}>
        Go
      </Delish>,
    )
    const btn = screen.getByRole('button')
    expect(btn.style.getPropertyValue('--delish-hold-scale')).toBe('0.85')
    expect(btn.style.getPropertyValue('--delish-hold-duration')).toBe('500ms')
    expect(btn.style.getPropertyValue('--delish-hold-easing')).toMatch(/^linear\(/)
    expect(btn.style.getPropertyValue('--delish-spring')).toMatch(/^linear\(/)
  })

  it('ripples from the point of contact, then fades and cleans up after release', () => {
    vi.useFakeTimers()
    render(<Delish>Go</Delish>)
    const btn = screen.getByRole('button')
    // jsdom has no layout (0×0), so the contact point equals the client coordinates.
    fireEvent.pointerDown(btn, { button: 0, clientX: 30, clientY: 40 })
    const ripple = btn.querySelector<HTMLElement>('.delish-ripple')!
    expect(ripple).toBeTruthy()
    expect(ripple.parentElement).toHaveAttribute('aria-hidden', 'true')
    const r = Math.hypot(30, 40) // reaches the farthest corner
    expect(parseFloat(ripple.style.width)).toBeCloseTo(r * 2)
    expect(parseFloat(ripple.style.left)).toBeCloseTo(30 - r)
    expect(parseFloat(ripple.style.top)).toBeCloseTo(40 - r)
    expect(ripple).not.toHaveAttribute('data-released')

    fireEvent.pointerUp(btn)
    act(() => vi.advanceTimersByTime(120))
    expect(btn.querySelector('.delish-ripple')).toHaveAttribute('data-released')
    act(() => vi.advanceTimersByTime(600))
    expect(btn.querySelector('.delish-ripple')).toBeNull()
  })

  it('keyboard presses ripple from the center', () => {
    render(<Delish>Go</Delish>)
    const btn = screen.getByRole('button')
    fireEvent.keyDown(btn, { key: ' ' })
    const ripple = btn.querySelector<HTMLElement>('.delish-ripple')!
    expect(ripple.style.left).toBe('0px') // center (0,0) of a 0×0 jsdom box, radius 0
    expect(ripple.style.width).toBe('0px')
  })

  it('ripple={false} renders no ripple layer', () => {
    render(<Delish ripple={false}>Go</Delish>)
    const btn = screen.getByRole('button')
    fireEvent.pointerDown(btn, { button: 0, clientX: 5, clientY: 5 })
    expect(btn.querySelector('.delish-ripples')).toBeNull()
    expect(btn).toHaveAttribute('data-pressed')
  })

  it('disabled: stays focusable, uses aria-disabled, blocks click and press', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Delish disabled onClick={onClick}>
        Nope
      </Delish>,
    )
    const btn = screen.getByRole('button', { name: 'Nope' })
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    expect(btn).not.toHaveAttribute('disabled')
    await user.tab()
    expect(btn).toHaveFocus()
    await user.click(btn)
    await user.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
    fireEvent.pointerDown(btn, { button: 0 })
    expect(btn).not.toHaveAttribute('data-pressed')
    expect(btn.querySelector('.delish-ripple')).toBeNull()
  })

  it('disabled submit buttons do not submit their form', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const user = userEvent.setup()
    render(
      <form onSubmit={onSubmit}>
        <Delish type="submit" disabled>
          Send
        </Delish>
      </form>,
    )
    await user.click(screen.getByRole('button'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('loading: announces, is busy, blocks clicks, keeps the label', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Delish loading onClick={onClick}>
        Pay
      </Delish>,
    )
    const btn = screen.getByRole('button', { name: 'Pay Loading' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    await user.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders icons hidden from assistive tech', () => {
    render(
      <Delish iconStart={<Star />} iconEnd={<Star />}>
        Fave
      </Delish>,
    )
    const btn = screen.getByRole('button', { name: 'Fave' })
    const icons = btn.querySelectorAll('.delish-icon')
    expect(icons).toHaveLength(2)
    icons.forEach((i) => expect(i).toHaveAttribute('aria-hidden', 'true'))
  })

  it('icon-only buttons use aria-label and warn without one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(<Delish aria-label="Favourite" iconStart={<Star />} />)
    expect(screen.getByRole('button', { name: 'Favourite' })).toHaveAttribute('data-icon-only')
    expect(warn).not.toHaveBeenCalled()
    rerender(<Delish iconStart={<Star />} />)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('composes user event handlers', () => {
    const onPointerDown = vi.fn()
    const onKeyDown = vi.fn()
    render(
      <Delish onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        Go
      </Delish>,
    )
    const btn = screen.getByRole('button')
    fireEvent.pointerDown(btn, { button: 0 })
    fireEvent.keyDown(btn, { key: 'a' })
    expect(onPointerDown).toHaveBeenCalled()
    expect(onKeyDown).toHaveBeenCalled()
    expect(btn).toHaveAttribute('data-pressed')
  })

  it('has no axe violations across variants and states', async () => {
    const { container } = render(
      <main>
        <Delish>Filled</Delish>
        <Delish variant="ghost">Ghost</Delish>
        <Delish size="sm" iconStart={<Star />}>
          Small
        </Delish>
        <Delish aria-label="Star" iconStart={<Star />} />
        <Delish loading>Saving</Delish>
        <Delish disabled>Disabled</Delish>
      </main>,
    )
    await expectNoAxeViolations(container)
  })
})

describe('holdCurve', () => {
  const parse = (s: string) => s.slice(7, -1).split(',').map(Number)
  it('reaches pressScale at ~140ms, then keeps slowing to longPressScale', () => {
    const { easing, duration, target } = holdCurve(0.9, 0.87, 350)
    expect(target).toBe(0.87)
    expect(duration).toBe(350)
    const p = parse(easing)
    expect(p[0]).toBe(0)
    expect(p[p.length - 1]).toBe(1)
    // At t = 140/350 = 0.4 the surface should be at 0.9, i.e. (1-0.9)/(1-0.87) of the travel.
    const at = (t: number) => 1 - (1 - target) * p[Math.round(t * (p.length - 1))]
    expect(at(0.4)).toBeCloseTo(0.9, 2)
    // Monotonic and decelerating: no kinks, no overshoot while held.
    const steps = p.slice(1).map((v, i) => v - p[i])
    steps.slice(1).forEach((d, i) => expect(d).toBeLessThanOrEqual(steps[i] + 1e-3))
  })
  it('just presses when longPressScale is not deeper than pressScale', () => {
    expect(holdCurve(0.9, 0.95, 350)).toMatchObject({ target: 0.9, duration: 140 })
  })
})

describe('spring', () => {
  it('starts at 0, ends at 1, overshoots more with more bounce', () => {
    const parse = (s: string) => s.slice(7, -1).split(',').map(Number)
    const soft = parse(spring(0.2, 420).easing)
    const wobbly = parse(spring(0.7, 420).easing)
    expect(soft[0]).toBe(0)
    expect(soft[soft.length - 1]).toBe(1)
    expect(Math.max(...wobbly)).toBeGreaterThan(Math.max(...soft))
    expect(Math.max(...soft)).toBeGreaterThan(1)
  })
})
