import { existsSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const runsRoot = resolve(root, 'progress/runs')
const requiredFiles = ['brief.md', 'plan.md', 'changes.md', 'verification.md']
const requestedPath = process.argv[2]

function findLatestRun() {
  if (!existsSync(runsRoot)) return null

  const directories = readdirSync(runsRoot)
    .map((name) => resolve(runsRoot, name))
    .filter((path) => statSync(path).isDirectory())
    .sort()

  return directories.at(-1) ?? null
}

const runDirectory = requestedPath
  ? resolve(root, requestedPath)
  : findLatestRun()

if (!runDirectory || !existsSync(runDirectory)) {
  console.error('No existe un run para validar. Usa pnpm harness:new "nombre".')
  process.exit(1)
}

const missingFiles = requiredFiles.filter(
  (filename) => !existsSync(resolve(runDirectory, filename)),
)

if (missingFiles.length > 0) {
  console.error(`Faltan archivos en ${runDirectory}: ${missingFiles.join(', ')}`)
  process.exit(1)
}

console.log(`Run válido: ${runDirectory}`)
