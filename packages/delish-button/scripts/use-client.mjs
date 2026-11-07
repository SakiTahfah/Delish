// Re-add the "use client" directive that minification strips (needed for React Server Components).
import { readFileSync, writeFileSync } from 'node:fs'
for (const f of ['dist/index.js', 'dist/index.cjs']) {
  const src = readFileSync(f, 'utf8')
  if (!src.startsWith('"use client"')) writeFileSync(f, '"use client";\n' + src)
}
