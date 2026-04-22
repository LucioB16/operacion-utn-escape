import { existsSync, readFileSync, appendFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const vitestPath = `${root}/reports/vitest-results.json`
const coveragePath = `${root}/coverage/coverage-summary.json`

function readJson(path) {
  if (!existsSync(path)) {
    return null
  }

  return JSON.parse(readFileSync(path, 'utf8'))
}

function statusIcon(status) {
  return status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️'
}

function ms(value) {
  return `${Math.round(value ?? 0)} ms`
}

function pct(metric) {
  return metric ? `${metric.pct}%` : 's/d'
}

const vitest = readJson(vitestPath)
const coverage = readJson(coveragePath)
const rows = []

if (vitest?.testResults) {
  vitest.testResults.forEach((suite) => {
    suite.assertionResults.forEach((test) => {
      rows.push({
        file: suite.name.replace(root.replaceAll('\\', '/'), '.'),
        title: test.fullName,
        status: test.status,
        duration: test.duration,
      })
    })
  })
}

const total = coverage?.total
const passed = rows.filter((row) => row.status === 'passed').length
const failed = rows.filter((row) => row.status === 'failed').length
const totalSuites = vitest?.testResults?.length ?? vitest?.numTotalTestSuites ?? 0
const passedSuites = vitest?.testResults?.filter((suite) => suite.status === 'passed').length
  ?? vitest?.numPassedTestSuites
  ?? 0

const markdown = [
  '## Resultado de CI',
  '',
  '| Métrica | Valor |',
  '|---|---:|',
  `| Suites | ${passedSuites}/${totalSuites} |`,
  `| Tests | ${passed}/${rows.length} pasados |`,
  `| Fallidos | ${failed} |`,
  `| Statements | ${pct(total?.statements)} |`,
  `| Branches | ${pct(total?.branches)} |`,
  `| Functions | ${pct(total?.functions)} |`,
  `| Lines | ${pct(total?.lines)} |`,
  '',
  '## Tabla de tests',
  '',
  '| Estado | Archivo | Test | Duración |',
  '|---|---|---|---:|',
  ...rows.map((row) => `| ${statusIcon(row.status)} ${row.status} | \`${row.file}\` | ${row.title.replaceAll('|', '\\|')} | ${ms(row.duration)} |`),
  '',
].join('\n')

console.log(markdown)

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown, 'utf8')
}
