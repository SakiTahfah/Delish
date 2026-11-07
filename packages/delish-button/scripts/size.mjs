import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const LIMIT = 4096 // bytes, JS + CSS gzipped
let total = 0
for (const f of ['dist/index.js', 'dist/styles.css']) {
  const gz = gzipSync(readFileSync(new URL('../' + f, import.meta.url))).length
  total += gz
  console.log(`${f.padEnd(18)} ${(gz / 1024).toFixed(2)} kB gzipped`)
}
console.log(`${'total'.padEnd(18)} ${(total / 1024).toFixed(2)} kB gzipped (limit ${(LIMIT / 1024).toFixed(2)} kB)`)
if (total > LIMIT) process.exit(1)
