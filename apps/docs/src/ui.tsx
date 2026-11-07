import * as React from 'react'

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section" aria-labelledby={id + '-h'}>
      <h2 id={id + '-h'}>
        <a href={'#' + id}>{title}</a>
      </h2>
      {children}
    </section>
  )
}

export function Stage({ children, tone }: { children: React.ReactNode; tone?: 'dark' }) {
  return <div className={'stage' + (tone ? ' stage-' + tone : '')}>{children}</div>
}

export function Code({ children, lang = 'tsx' }: { children: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false)
  const code = children.trim()
  return (
    <div className="code">
      <span className="code-lang">{lang}</span>
      <button
        type="button"
        className="code-copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch {
            /* clipboard blocked; nothing to do */
          }
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const svg = (d: React.ReactNode) => () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)

export const HeartIcon = svg(
  <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
)
export const ArrowIcon = svg(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>,
)
export const BagIcon = svg(
  <>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </>,
)
export const PlusIcon = svg(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
)
