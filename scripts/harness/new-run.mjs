import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const rawName = process.argv.slice(2).join(' ') || 'iteracion'
const slug = rawName
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'iteracion'
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago',
}).format(new Date())
const baseId = `${date}-${slug}`
const runsRoot = resolve(root, 'progress/runs')
mkdirSync(runsRoot, { recursive: true })

let runId = baseId
let suffix = 2
while (existsSync(resolve(runsRoot, runId))) {
  runId = `${baseId}-${suffix}`
  suffix += 1
}

const runDirectory = resolve(runsRoot, runId)
mkdirSync(runDirectory)

const templates = {
  'brief.md': `# ${rawName}\n\n## Objetivo\n\nDescribe el resultado esperado.\n`,
  'plan.md': '# Plan\n\n- [ ] Descomponer el trabajo\n- [ ] Implementar\n- [ ] Revisar\n',
  'changes.md': '# Cambios\n\n- Pendiente\n',
  'verification.md': '# Verificación\n\n- [ ] `pnpm typecheck`\n- [ ] `pnpm lint`\n- [ ] `pnpm test`\n- [ ] `pnpm build`\n',
}

for (const [filename, contents] of Object.entries(templates)) {
  writeFileSync(resolve(runDirectory, filename), contents)
}

console.log(`Run creado: ${runDirectory}`)
