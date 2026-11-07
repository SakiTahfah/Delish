import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
afterEach(() => cleanup())

// jsdom has no PointerEvent; a MouseEvent subclass keeps `button` etc.
if (!('PointerEvent' in window)) {
  class PointerEvent extends MouseEvent {
    pointerType: string
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerType = init.pointerType ?? 'mouse'
    }
  }
  ;(window as any).PointerEvent = PointerEvent
}
