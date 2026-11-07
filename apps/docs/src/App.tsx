import * as React from 'react'
import { Delish } from 'delish-button'
import { Section, Stage, Code, Table, HeartIcon, ArrowIcon, BagIcon, PlusIcon } from './ui'

const NAV = [
  ['variants', 'Variants'],
  ['sizes', 'Sizes'],
  ['icons', 'Icons'],
  ['loading', 'Loading'],
  ['playground', 'Playground'],
  ['themes', 'Themes'],
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['api', 'API Reference'],
  ['theming', 'Theming'],
  ['accessibility', 'Accessibility'],
] as const

const AGENT_PROMPT =
  'Install delish-button (npm i delish-button). Import the Delish component and delish-button/styles.css, then replace the primary call-to-action in my file with a filled Delish button and the secondary one with a ghost Delish button.'

const t = (s: string) => <code>{s}</code>

export function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="nav">
        <a href="#top" className="brand">
          Delish
        </a>
        <nav aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={'#' + id}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main id="main" className="page">
        <Hero />
        <Variants />
        <Sizes />
        <Icons />
        <Loading />
        <Playground />
        <Themes />
        <Installation />
        <Usage />
        <Api />
        <Theming />
        <Accessibility />
        <footer className="footer">
          <p>
            Delish · MIT licensed · {t('delish-button')} on npm
          </p>
        </footer>
      </main>
    </>
  )
}

function Hero() {
  const [count, setCount] = React.useState(0)
  const [held, setHeld] = React.useState(0)
  return (
    <section id="top" className="hero">
      <h1>Delish</h1>
      <p className="lede">A tiny, accessible, dependency-free React button with a delicious springy press.</p>
      <Stage>
        <div className="row">
          <Delish size="lg" onClick={() => setCount((c) => c + 1)} onLongPress={() => setHeld((h) => h + 1)}>
            Tap me
          </Delish>
          <Delish size="lg" variant="ghost" onLongPress={() => setHeld((h) => h + 1)}>
            Now hold me
          </Delish>
        </div>
        <p className="hint" aria-live="polite">
          {count === 0 && held === 0
            ? 'Tap for a quick squish. Hold for a deeper one.'
            : `${count} tap${count === 1 ? '' : 's'} · ${held} long press${held === 1 ? '' : 'es'}`}
        </p>
      </Stage>
      <ul className="facts">
        <li>~2.8 kB gzipped, JS + CSS</li>
        <li>Zero dependencies</li>
        <li>WCAG 2.2 AA</li>
        <li>Animated entirely in CSS</li>
      </ul>
    </section>
  )
}

function Variants() {
  return (
    <Section id="variants" title="Variants">
      <p>
        Two flavors. <strong>Filled</strong> for the thing you most want people to press, <strong>ghost</strong> for
        everything next to it. Both share the same press: a tap squishes the button to 0.9 and springs it back; a long
        press keeps the button down and sinks the label further, then releases with a bigger bounce.
      </p>
      <Stage>
        <div className="row">
          <Delish>Filled</Delish>
          <Delish variant="ghost">Ghost</Delish>
        </div>
      </Stage>
      <Code>{`
<Delish>Filled</Delish>
<Delish variant="ghost">Ghost</Delish>
`}</Code>
    </Section>
  )
}

function Sizes() {
  return (
    <Section id="sizes" title="Sizes">
      <p>
        Three sizes: {t('sm')} (32px), {t('md')} (44px, the default) and {t('lg')} (52px). Every size clears the WCAG
        2.2 minimum target size of 24×24px; {t('md')} and up meet the 44px touch target guidance.
      </p>
      <Stage>
        <div className="row">
          <Delish size="sm">Small</Delish>
          <Delish size="md">Medium</Delish>
          <Delish size="lg">Large</Delish>
        </div>
      </Stage>
      <Code>{`
<Delish size="sm">Small</Delish>
<Delish size="md">Medium</Delish>
<Delish size="lg">Large</Delish>
`}</Code>
    </Section>
  )
}

function Icons() {
  return (
    <Section id="icons" title="Icons">
      <p>
        Pass any element to {t('iconStart')} or {t('iconEnd')}. Icons are hidden from screen readers and sized by{' '}
        {t('--delish-icon-size')}. Leave out the label for an icon-only button, and give it an {t('aria-label')}: Delish
        warns in development if you forget.
      </p>
      <Stage>
        <div className="row">
          <Delish iconStart={<BagIcon />}>Add to bag</Delish>
          <Delish variant="ghost" iconEnd={<ArrowIcon />}>
            Continue
          </Delish>
          <Delish aria-label="Favourite" iconStart={<HeartIcon />} />
          <Delish variant="ghost" size="sm" aria-label="Add" iconStart={<PlusIcon />} />
        </div>
      </Stage>
      <Code>{`
<Delish iconStart={<BagIcon />}>Add to bag</Delish>
<Delish variant="ghost" iconEnd={<ArrowIcon />}>Continue</Delish>

{/* Icon-only: always label it */}
<Delish aria-label="Favourite" iconStart={<HeartIcon />} />
`}</Code>
    </Section>
  )
}

function Loading() {
  const [loading, setLoading] = React.useState(false)
  const start = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }
  return (
    <Section id="loading" title="Loading">
      <p>
        Set {t('loading')} and the label fades out behind a spinner while the button keeps its width, so nothing around
        it jumps. Clicks are blocked, {t('aria-busy')} is set, and screen readers hear the {t('loadingLabel')}{' '}
        (&ldquo;Loading&rdquo; by default).
      </p>
      <Stage>
        <div className="row">
          <Delish loading={loading} onClick={start} iconStart={<BagIcon />}>
            Place order
          </Delish>
          <Delish variant="ghost" loading={loading} onClick={start}>
            Save draft
          </Delish>
          <Delish disabled>Disabled</Delish>
        </div>
        <p className="hint">Press either button to load for two seconds.</p>
      </Stage>
      <Code>{`
const [loading, setLoading] = useState(false)

<Delish loading={loading} loadingLabel="Placing order" onClick={placeOrder}>
  Place order
</Delish>
`}</Code>
    </Section>
  )
}

function Playground() {
  const [pressScale, setPressScale] = React.useState(0.9)
  const [longPressScale, setLongPressScale] = React.useState(0.82)
  const [longPressDelay, setLongPressDelay] = React.useState(350)
  const [bounce, setBounce] = React.useState(0.5)
  const [variant, setVariant] = React.useState<'filled' | 'ghost'>('filled')

  const slider = (
    label: string,
    value: number,
    set: (n: number) => void,
    min: number,
    max: number,
    step: number,
    unit = '',
  ) => (
    <label className="slider">
      <span>
        {label} <output>{value + unit}</output>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} />
    </label>
  )

  const props = [
    variant !== 'filled' && `variant="ghost"`,
    pressScale !== 0.9 && `pressScale={${pressScale}}`,
    longPressScale !== 0.82 && `longPressScale={${longPressScale}}`,
    longPressDelay !== 350 && `longPressDelay={${longPressDelay}}`,
    bounce !== 0.5 && `bounce={${bounce}}`,
  ].filter(Boolean)

  return (
    <Section id="playground" title="Playground">
      <p>Tune the feel. The spring curve is regenerated from {t('bounce')} and handed to CSS as a {t('linear()')} easing.</p>
      <Stage>
        <div className="row">
          <Delish
            size="lg"
            variant={variant}
            pressScale={pressScale}
            longPressScale={longPressScale}
            longPressDelay={longPressDelay}
            bounce={bounce}
          >
            Taste it
          </Delish>
        </div>
        <div className="controls">
          {slider('pressScale', pressScale, setPressScale, 0.7, 1, 0.01)}
          {slider('longPressScale', longPressScale, setLongPressScale, 0.6, 1, 0.01)}
          {slider('longPressDelay', longPressDelay, setLongPressDelay, 150, 1000, 10, 'ms')}
          {slider('bounce', bounce, setBounce, 0, 0.85, 0.05)}
          <fieldset className="seg">
            <legend className="sr-only">Variant</legend>
            {(['filled', 'ghost'] as const).map((v) => (
              <label key={v}>
                <input type="radio" name="pg-variant" checked={variant === v} onChange={() => setVariant(v)} />
                <span>{v}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </Stage>
      <Code>{`<Delish${props.length ? ' ' + props.join(' ') : ''}>Taste it</Delish>`}</Code>
    </Section>
  )
}

const THEMES = [
  { name: 'Tomato', className: '', note: 'Default' },
  { name: 'Blueberry', className: 'theme-blueberry' },
  { name: 'Matcha', className: 'theme-matcha' },
  { name: 'Honey', className: 'theme-honey' },
  { name: 'Licorice', className: 'theme-licorice', dark: true },
]

function Themes() {
  return (
    <Section id="themes" title="Themes">
      <p>
        Every color, size and radius is a CSS custom property. Override a handful through a class and Delish tastes like
        your brand. All of these pass WCAG AA contrast.
      </p>
      <div className="themes">
        {THEMES.map((th) => (
          <div key={th.name} className={'theme-card' + (th.dark ? ' theme-card-dark' : '')}>
            <span className="theme-name">
              {th.name}
              {th.note && <em> · {th.note}</em>}
            </span>
            <div className="row">
              <Delish className={th.className} size="sm">
                Order
              </Delish>
              <Delish className={th.className} size="sm" variant="ghost">
                Menu
              </Delish>
            </div>
          </div>
        ))}
      </div>
      <Code lang="css">{`
.theme-blueberry {
  --delish-accent: #3b4bc4;
}

.theme-honey {
  --delish-accent: #f2b631;
  --delish-on-accent: #3a2600;
  --delish-ghost-fg: #8a5a00; /* darker so ghost text keeps 4.5:1 */
  --delish-focus-ring: #8a5a00;
}

/* Licorice: for dark surfaces */
.theme-licorice {
  --delish-accent: #f5efe6;
  --delish-on-accent: #1a1614;
  --delish-filled-hover-bg: #ffffff;
}
`}</Code>
    </Section>
  )
}

function Installation() {
  return (
    <Section id="installation" title="Installation">
      <Code lang="bash">npm i delish-button</Code>
      <p>Or tell your agent:</p>
      <Code lang="prompt">{AGENT_PROMPT}</Code>
    </Section>
  )
}

function Usage() {
  return (
    <Section id="usage" title="Usage">
      <p>Import the component once, and the stylesheet once (anywhere in your app).</p>
      <Code>{`
import { Delish } from 'delish-button'
import 'delish-button/styles.css'

export function Checkout() {
  return (
    <div>
      <Delish onClick={pay}>Pay now</Delish>
      <Delish variant="ghost" onClick={back}>Back</Delish>
    </div>
  )
}
`}</Code>
      <h3>Bring the press to anything</h3>
      <p>
        {t('useDelish')} gives you the same press on your own elements: a link, a card, a tile. Add the {t('delish-press')} class for the spring, and put the part that should
        sink on a long press inside an element with the {t('delish-content')} class.
      </p>
      <Code>{`
import { useDelish } from 'delish-button'

function Tile({ href, children }) {
  const { pressProps } = useDelish({ pressScale: 0.96, longPressScale: 0.9 })
  return (
    <a href={href} className="delish-press tile" {...pressProps}>
      <span className="delish-content">{children}</span>
    </a>
  )
}
`}</Code>
    </Section>
  )
}

function Api() {
  return (
    <Section id="api" title="API Reference">
      <h3>{'<Delish />'}</h3>
      <p>
        Accepts every native {t('<button>')} attribute and forwards its {t('ref')} to the button element.
      </p>
      <Table
        head={['Prop', 'Type', 'Default', 'Description']}
        rows={[
          ['variant', '"filled" | "ghost"', '"filled"', 'Visual style.'],
          ['size', '"sm" | "md" | "lg"', '"md"', 'Height, padding and type size: 32, 44 or 52px.'],
          ['iconStart', 'ReactNode', '—', 'Icon before the label. Hidden from assistive tech.'],
          ['iconEnd', 'ReactNode', '—', 'Icon after the label. Hidden from assistive tech.'],
          ['loading', 'boolean', 'false', 'Shows a spinner, keeps the width, sets aria-busy and blocks clicks.'],
          ['loadingLabel', 'string', '"Loading"', 'Text read to screen readers while loading.'],
          ['disabled', 'boolean', 'false', 'Blocks activation via aria-disabled, so the button stays focusable.'],
          ['pressScale', 'number', '0.9', 'Scale of the whole button while pressed.'],
          ['longPressScale', 'number', '0.82', 'Scale of the label during a long press (on top of pressScale).'],
          ['longPressDelay', 'number', '350', 'Milliseconds held before a press becomes a long press.'],
          ['bounce', 'number', '0.5', 'Spring overshoot, 0 (none) to 0.85 (wobbly). Long presses add 0.2.'],
          ['onLongPress', '() => void', '—', 'Fires once when a press crosses longPressDelay. onClick still fires on release.'],
          ['type', 'string', '"button"', 'Defaults to "button" so it never submits a form by accident.'],
          ['className', 'string', '—', 'Added after "delish". Use it to override CSS variables.'],
        ].map(([a, b, c, d]) => [t(a), t(b), c === '—' ? c : t(c), d])}
      />

      <h3>useDelish(options, handlers?)</h3>
      <p>
        Options are the press props above: {t('pressScale')}, {t('longPressScale')}, {t('longPressDelay')},{' '}
        {t('bounce')}, {t('onLongPress')}, plus {t('disabled')}. Pass your own pointer and key handlers as the second
        argument and they are called first.
      </p>
      <Table
        head={['Returns', 'Type', 'Description']}
        rows={[
          [t('pressProps'), t('object'), 'Event handlers, data-pressed / data-press attributes and the spring CSS variables. Spread onto your element.'],
          [t('pressed'), t('boolean'), 'True while held down.'],
          [t('longPressed'), t('boolean'), 'True once the current press has become a long press.'],
        ]}
      />

      <h3>spring(bounce, response)</h3>
      <p>
        The curve generator Delish uses internally, exported in case you want the same spring elsewhere. Returns{' '}
        {t('{ easing, duration }')}: a CSS {t('linear()')} string and its settle time in ms.
      </p>
      <Code>{`
import { spring } from 'delish-button'

const { easing, duration } = spring(0.5, 420)
el.style.transition = \`transform \${duration}ms \${easing}\`
`}</Code>
    </Section>
  )
}

function Theming() {
  return (
    <Section id="theming" title="Theming">
      <p>
        Override CSS custom properties through a class passed to {t('className')}. The defaults live inside{' '}
        {t(':where()')}, which has zero specificity, so your class wins no matter where it loads.
      </p>
      <Table
        head={['Variable', 'Default', 'Description']}
        rows={[
          ['--delish-accent', '#c2361c', 'Brand color. Feeds the filled background, ghost text and focus ring.'],
          ['--delish-on-accent', '#ffffff', 'Text and icon color on filled buttons.'],
          ['--delish-filled-bg', 'var(--delish-accent)', 'Filled background.'],
          ['--delish-filled-fg', 'var(--delish-on-accent)', 'Filled text color.'],
          ['--delish-filled-hover-bg', 'accent + 12% black', 'Filled background on hover.'],
          ['--delish-ghost-bg', 'transparent', 'Ghost background.'],
          ['--delish-ghost-fg', 'var(--delish-accent)', 'Ghost text color.'],
          ['--delish-ghost-border', 'accent at 30%', 'Ghost border color.'],
          ['--delish-ghost-hover-bg', 'accent at 10%', 'Ghost background on hover.'],
          ['--delish-focus-ring', 'var(--delish-accent)', 'Keyboard focus outline color.'],
          ['--delish-radius', '999px', 'Corner radius.'],
          ['--delish-font-family', 'inherit', 'Font family.'],
          ['--delish-font-weight', '600', 'Font weight.'],
          ['--delish-height', '44px', 'Height (per size).'],
          ['--delish-padding-x', '20px', 'Horizontal padding (per size).'],
          ['--delish-font-size', '15px', 'Font size (per size).'],
          ['--delish-gap', '8px', 'Space between icon and label (per size).'],
          ['--delish-icon-size', '18px', 'Icon and spinner size (per size).'],
          ['--delish-disabled-opacity', '0.45', 'Opacity when disabled.'],
          ['--delish-press-duration', '140ms', 'How fast the button goes down.'],
          ['--delish-long-duration', '380ms', 'How fast the label sinks on a long press.'],
        ].map(([a, b, c]) => [t(a), t(b), c])}
      />
      <Code lang="css">{`
/* Dark surface example */
.my-dark-button {
  --delish-accent: #f5efe6;
  --delish-on-accent: #1a1614;
  --delish-filled-hover-bg: #ffffff;
  --delish-radius: 12px;
}
`}</Code>
    </Section>
  )
}

function Accessibility() {
  return (
    <Section id="accessibility" title="Accessibility">
      <ul className="a11y">
        <li>
          Renders a native {t('<button>')}, so name, role, focus and Enter / Space activation come from the browser.
        </li>
        <li>Keyboard presses get the same squish as pointer presses: Space follows the key, Enter plays a full tap.</li>
        <li>
          The focus ring only shows for keyboard focus ({t(':focus-visible')}) and uses a 2px outline with a 2px offset.
        </li>
        <li>Default colors meet 4.5:1 text contrast for both variants, in every state.</li>
        <li>Sizes are 32px, 44px and 52px tall, all above the 24×24px minimum target size.</li>
        <li>
          {t('disabled')} uses {t('aria-disabled')} instead of the attribute, so the button stays in the tab order and
          screen readers can still find it and say it is unavailable.
        </li>
        <li>
          {t('loading')} sets {t('aria-busy')} and announces {t('loadingLabel')}, and the button keeps its width.
        </li>
        <li>
          A long press never replaces a click: {t('onLongPress')} is extra, and {t('onClick')} still fires on release.
        </li>
        <li>
          With {t('prefers-reduced-motion')}, Delish doesn&rsquo;t scale at all; a press dims the button slightly
          instead.
        </li>
        <li>Icons are {t('aria-hidden')}. Icon-only buttons need an {t('aria-label')}, and Delish warns if one is missing.</li>
        <li>Windows High Contrast (forced colors) mode gets a visible border and system focus color.</li>
      </ul>
    </Section>
  )
}
