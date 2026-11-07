# Delish

A tiny, accessible, dependency-free React button with a delicious springy press.

- **Tap**: the button squishes to 0.9 and springs back.
- **Long press**: the button stays down while the label sinks further, then it releases with a bigger bounce.
- About 2.8 kB gzipped (JS + CSS). No dependencies. Meets WCAG 2.2 AA. The animation runs entirely in CSS.

## Install

```bash
npm i delish-button
```

## Usage

```tsx
import { Delish } from 'delish-button'
import 'delish-button/styles.css'

<Delish onClick={pay}>Pay now</Delish>
<Delish variant="ghost" iconEnd={<ArrowIcon />}>Continue</Delish>
<Delish loading={saving}>Save</Delish>
<Delish aria-label="Favourite" iconStart={<HeartIcon />} />
```

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `"filled" \| "ghost"` | `"filled"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `iconStart` / `iconEnd` | `ReactNode` | — |
| `loading` | `boolean` | `false` |
| `loadingLabel` | `string` | `"Loading"` |
| `disabled` | `boolean` (uses `aria-disabled`) | `false` |
| `pressScale` | `number` | `0.9` |
| `longPressScale` | `number` | `0.82` |
| `longPressDelay` | `number` (ms) | `350` |
| `bounce` | `number` (0–0.85) | `0.5` |
| `onLongPress` | `() => void` | — |

`Delish` also accepts all native `<button>` props and forwards `ref`.

## Theming

To theme the button, override CSS variables in a class you pass through `className`:

```css
.brand {
  --delish-accent: #3b4bc4;
  --delish-radius: 12px;
}
```

See the docs site for the full token list, the `useDelish` hook (which adds the same press to any element) and the `spring()` curve generator.

## License

MIT
