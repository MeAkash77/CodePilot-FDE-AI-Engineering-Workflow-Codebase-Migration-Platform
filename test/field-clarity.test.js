const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { deliverySummary } = require('../bin/lib/delivery-gaps')
const cli = path.join(__dirname, '../bin/fde.js')
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fde-field-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  const workspace = path.join(root, 'workspace'); fs.mkdirSync(workspace)
  const records = path.join(root, 'records')
  const run = (args, input) => spawnSync(process.execPath, [cli, ...args], {
    cwd: workspace, encoding: 'utf8', input,
    env: { ...process.env, FDEOPS_ENGAGEMENTS_ROOT: records, FDEOPS_ENGAGEMENT: '', FDEOS_ENGAGEMENT: '' },
  })
  return { root, workspace, records, run }
}
test('scan includes modern JS/TS modules and counts only code test paths', t => {
  const f = fixture(t)
  for (const ext of ['mjs', 'cjs', 'mts', 'cts']) {
    fs.writeFileSync(path.join(f.workspace, `app.${ext}`), '// FIXME adapter recovery\n')
    fs.writeFileSync(path.join(f.workspace, `app.test.${ext}`), '// test fixture\n')
  }
  fs.writeFileSync(path.join(f.workspace, 'test-plan.md'), '# Test plan\n')
  const r = f.run(['scan'])
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /4 test file\(s\) across 8 code files/)
  assert.match(r.stdout, /app\.mjs:1.*FIXME/)
  assert.match(r.stdout, /COVERAGE/)
  assert.doesNotMatch(r.stdout, /clean scan/)
})
test('scan recognizes test naming conventions without counting latest or specification', t => {
  const f = fixture(t)
  const names = ['src/latest.js', 'contest/router.js', 'specification/parser.ts',
    'src/ModelTest.java', 'test/fixture.mjs', 'src/request_test.go', 'tests/helper.py',
    'src/test_reader.py', '__tests__/adapter.cjs', 'src/route.spec.ts', 'src/route.test.js']
  for (const name of names) {
    const file = path.join(f.workspace, name)
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, '// fixture\n')
  }
  const r = f.run(['scan'])
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /8 test file\(s\) across 11 code files/)
})
test('scan with unsupported files states its limits instead of clean assurance', t => {
  const f = fixture(t)
  fs.writeFileSync(path.join(f.workspace, 'app.custom'), 'FIXME not inspected')
  const r = f.run(['scan'])
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /No supported code files inspected/)
  assert.match(r.stdout, /unsupported/)
  assert.doesNotMatch(r.stdout, /clean scan/)
})
test('scan discloses its file cap instead of implying complete coverage', t => {
  const f = fixture(t)
  for (let i = 0; i < 5001; i++) fs.writeFileSync(path.join(f.workspace, `file-${i}.mjs`), '')
  const r = f.run(['scan'])
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /5,000-file limit reached; scan is partial/)
  assert.doesNotMatch(r.stdout, /clean scan/)
})
test('pending delivery review is separate from saved ledger and leaves it unchanged', t => {
  const f = fixture(t)
  assert.equal(f.run(['resume', '--init', 'cedarline']).status, 0)
  const ledger = path.join(f.records, 'cedarline', '.fde', 'delivery.md')
  const before = fs.readFileSync(ledger, 'utf8')
  const r = f.run(['debrief', '--smart'], 'delivery: Routing|risk-mitigation|human exception path|6 local tests pass|pending|[source: test receipt]|no rollout\n')
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /PENDING UPDATE - not yet saved/)
  assert.match(r.stdout, /SAVED RECORD - before this update/)
  assert.match(r.stdout, /No delivery results saved yet/)
  assert.match(r.stdout, /reported delivery \(not customer acceptance\)/)
  assert.equal(fs.readFileSync(ledger, 'utf8'), before)
})
test('technical result is a reported result, never implied customer value', () => {
  const summary = deliverySummary({ valueRows: [{ state: 'claimed', measured: '6 local tests pass', evidenceMissing: false }] })
  const gap = summary.gaps.find(g => g.kind === 'acceptance')
  assert.equal(gap.text, '1 reported result awaiting acceptance')
  assert.match(gap.action, /result and its evidence/)
  assert.doesNotMatch(gap.text + gap.action, /measured outcome|customer value/)
})
test('unbound handoff explains standalone drafting without creating records', t => {
  const f = fixture(t)
  const r = f.run(['handoff'])
  assert.equal(r.status, 2)
  assert.match(r.stderr, /exports an existing customer record/)
  assert.match(r.stderr, /handoff skill.*supplied notes/)
  assert.match(r.stderr, /no record.*required/i)
  assert.equal(fs.existsSync(f.records), false)
})
