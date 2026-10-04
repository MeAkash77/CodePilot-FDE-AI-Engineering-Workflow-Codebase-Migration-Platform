const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const cli = path.join(__dirname, '../bin/fde.js')
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fde-budget-'))
  const eng = path.join(dir, 'client', '.fde')
  fs.mkdirSync(eng, { recursive: true })
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const run = args => spawnSync(process.execPath, [cli, ...args], { cwd: dir, env: { ...process.env, HOME: dir, FDEOPS_ENGAGEMENT: eng, FDEOPS_ENGAGEMENTS_ROOT: dir }, encoding: 'utf8' })
  return { dir, eng, run, write: (name, text) => fs.writeFileSync(path.join(eng, name), text) }
}
test('resume bounds a million-character line and clearly reports omitted content', t => {
  const f = fixture(t)
  f.write('context.md', '# Context\n**Phase:** land\n## Next action\nConfirm access\n' + 'X'.repeat(1000000))
  const out = f.run(['resume'])
  assert.equal(out.status, 0, out.stderr)
  assert.ok(Buffer.byteLength(out.stdout) <= 16384)
  assert.match(out.stdout, /Confirm access/)
  assert.match(out.stdout, /omitted|truncated/i)
  assert.match(out.stdout, /recall/)
})
test('recall retrieves older evidence with a source within its budget, scoped to this client', t => {
  const f = fixture(t)
  f.write('decisions.md', '# Decisions\n- [2026-01-01] retry MUST preserve idempotency. SOURCE_A\n\n' + 'unrelated '.repeat(60000) + '\n\n- [2026-09-10] retry scope changed; prior UI plan superseded. SOURCE_B\n<private>retry SECRET_SENTINEL</private>')
  const other = path.join(f.dir, 'other', '.fde'); fs.mkdirSync(other, { recursive: true }); fs.writeFileSync(path.join(other, 'decisions.md'), 'retry OTHER_CLIENT_SECRET')
  const out = f.run(['recall', 'retry', '--max-bytes', '4096'])
  assert.equal(out.status, 0, out.stderr)
  assert.ok(Buffer.byteLength(out.stdout) <= 4096)
  assert.match(out.stdout, /SOURCE_A/); assert.match(out.stdout, /SOURCE_B/)
  assert.match(out.stdout, /decisions.md/)
  assert.doesNotMatch(out.stdout, /SECRET_SENTINEL|OTHER_CLIENT_SECRET/)
  assert.match(out.stdout, /not.*approval|not.*acceptance|verify/i)
})
test('context budget validates options and preserves valid Unicode', t => {
  const f = fixture(t); f.write('context.md', '# Context\n' + '客户🙂'.repeat(10000))
  for (const args of [['resume', '--max-bytes', 'NaN'], ['recall', 'x', '--max-bytes', '0']]) assert.notEqual(f.run(args).status, 0)
  const out = f.run(['resume', '--max-bytes', '4096'])
  assert.equal(out.status, 0, out.stderr); assert.ok(Buffer.byteLength(out.stdout) <= 4096); assert.ok(!out.stdout.includes('\uFFFD'))
})
test('recall distinguishes an empty search from missing evidence and rejects raw-path queries as paths', t => {
  const f = fixture(t); f.write('context.md', '# Context\n')
  assert.notEqual(f.run(['recall']).status, 0)
  const out = f.run(['recall', '../other'])
  assert.equal(out.status, 0); assert.match(out.stdout, /no match|no matching/i)
})
test('entry and recall include sanitized policy; heading matches retain nearby denials', t => {
  const f = fixture(t)
  f.write('trust-profile.md', '# Policy\nOnly local models may read source code.\n<private>HIDDEN_POLICY_NOTE</private>')
  f.write('decisions.md', '## Retry approval\nThe sponsor explicitly denied production deployment.\n')
  const entry = f.run(['resume'])
  assert.match(entry.stdout, /Only local models/)
  const policy = f.run(['recall', 'local models'])
  assert.match(policy.stdout, /Only local models/); assert.doesNotMatch(policy.stdout, /HIDDEN_POLICY_NOTE/)
  const decision = f.run(['recall', 'retry approval'])
  assert.match(decision.stdout, /denied production deployment/)
})
test('recall retains recent changes and old constraints when a topic has many matches', t => {
  const f = fixture(t)
  f.write('decisions.md', '- [2026-01-01] retry MUST preserve idempotency. ORIGINAL_CONSTRAINT\n' + Array.from({ length: 50 }, (_, i) => `- retry checkpoint ${i}`).join('\n') + '\n- [2026-09-10] retry approval revoked. LATEST_REVOCATION\n')
  const out = f.run(['recall', 'retry'])
  assert.equal(out.status, 0)
  assert.match(out.stdout, /ORIGINAL_CONSTRAINT/); assert.match(out.stdout, /LATEST_REVOCATION/)
  assert.match(out.stdout, /of 52 matching/)
})
test('recall gives every matching file a turn before taking second excerpts', () => {
  const { recallSections } = require('../bin/lib/context')
  const files = ['brief.md', 'context.md', 'decisions.md', 'delivery.md', 'risks.md', 'success.md', 'trust-profile.md']
  const result = recallSections(files.map(file => ({ file, text: 'deployment first\ndeployment second' })), 'deployment')
  for (const file of files) assert.ok(result.sections.some(s => s.startsWith(file + ':')), file)
})

test('section budget includes truncation markers even with more sections than fit', () => {
  const { boundedSections } = require('../bin/lib/context')
  const out = boundedSections(Array.from({ length: 100 }, () => '客户🙂'.repeat(1000)), 4096)
  assert.ok(Buffer.byteLength(out) <= 4096)
  assert.doesNotMatch(out, /\uFFFD/)
  assert.match(out, /truncated/)
  assert.match(out, /CONTEXT: selected excerpts/)
})

test('fat history cannot displace policy, named signer or the latest sourced decisions at entry', t => {
  const f = fixture(t)
  f.write('trust-profile.md', '# Policy\nLOCAL_MODELS_ONLY: source code stays local.\n' + 'Policy detail '.repeat(10000))
  f.write('success.md', '# Success\n**Stakeholder who signs off:** Mara Chen\n**Done when:** replay returns zero duplicates.\n')
  f.write('context.md', '# Context\n**Phase:** land\n## Next action\nReview replay\n' + Array.from({ length: 1000 }, (_, i) => `Transcript history line ${i}`).join('\n'))
  f.write('decisions.md', Array.from({ length: 1000 }, (_, i) => `- [2026-01-01] Historical choice ${i} [source: meeting:old-${i}]`).join('\n') + '\n- [2026-09-10] Retain replay [source: meeting:recent-a]\n- [2026-09-11] Withdraw release [source: meeting:recent-b]\n')
  const out = f.run(['resume'])
  assert.equal(out.status, 0, out.stderr)
  assert.ok(Buffer.byteLength(out.stdout) <= 16384)
  assert.ok(out.stdout.startsWith(`ENGAGEMENT: ${f.eng}\n\nCLIENT POLICY - trust-profile.md`))
  for (const value of ['LOCAL_MODELS_ONLY', 'Mara Chen', 'meeting:recent-a', 'meeting:recent-b']) assert.ok(out.stdout.includes(value), value)
  assert.doesNotMatch(out.stdout, /Transcript history line 500/)
  assert.match(out.stdout, /truncated|omitted/)
})


test('sections that fit retain complete uneven content including separators and footer', () => {
  const { boundedSections } = require('../bin/lib/context')
  const sections = ['RECORD\n' + '客户🙂'.repeat(180) + '\nENGAGEMENT: fictional-client', '', 'CURRENT ACTION: confirm Tuesday', 'SIGNER: Priya Shah']
  const complete = boundedSections(sections, 65536)
  const bytes = Buffer.byteLength(complete)
  assert.ok(bytes < 4096)
  assert.equal(boundedSections(sections, 4096), complete)
  assert.equal(boundedSections(sections, bytes), complete)
  const clipped = boundedSections(sections, bytes - 1)
  assert.ok(Buffer.byteLength(clipped) <= bytes - 1)
  assert.match(clipped, /Excerpt truncated/)
  assert.doesNotMatch(clipped, /\uFFFD/)
})

test('compact resume preserves a complete fitting packet and still masks private content', t => {
  const f = fixture(t)
  f.write('context.md', '# Context\n**Phase:** land\n## Next action\nConfirm Tuesday replay\n<private>PRIVATE_PACKET_SENTINEL</private>\n')
  f.write('success.md', '# Success\n**Done when:** Replay events; observe exactly one dispatch per ID.\n**Stakeholder who signs off:** Priya Shah [source: meeting:scope]\n')
  f.write('decisions.md', '- [2026-09-10] Keep CSV import [source: meeting:scope]\n')
  const full = f.run(['resume', '--max-bytes', '65536'])
  const compact = f.run(['resume', '--max-bytes', '4096'])
  assert.equal(full.status, 0, full.stderr)
  assert.equal(compact.status, 0, compact.stderr)
  assert.ok(Buffer.byteLength(full.stdout) <= 4096)
  assert.equal(compact.stdout, full.stdout)
  for (const value of [f.eng, 'Keep CSV import', 'Priya Shah', 'Confirm Tuesday replay']) assert.ok(compact.stdout.includes(value), value)
  assert.doesNotMatch(compact.stdout, /Excerpt truncated|PRIVATE_PACKET_SENTINEL/)
})


test('populated compact entry keeps identity, policy and goals outside long triage', t => {
  const f = fixture(t)
  f.write('trust-profile.md', '# Policy\nRead-only until customer approves writes.\n' + 'Policy detail '.repeat(800))
  f.write('success.md', '# Success\n**Stakeholder who signs off:** Mara Chen\n**Done when:** replay produces no duplicates.\n')
  f.write('context.md', '# Context\n**Phase:** land\n## Next action\nReview replay\n' + 'History '.repeat(2000))
  f.write('decisions.md', Array.from({ length: 8 }, (_, i) => `- [2026-09-10] Decision ${i} ${'detail '.repeat(80)} [source: meeting:${i}]`).join('\n'))
  for (const budget of ['4096', '16384']) {
    const out = f.run(['resume', '--max-bytes', budget])
    assert.equal(out.status, 0, out.stderr)
    assert.ok(Buffer.byteLength(out.stdout) <= Number(budget))
    for (const value of [`ENGAGEMENT: ${f.eng}`, 'Read-only until customer approves writes', 'Mara Chen', 'Review replay']) assert.ok(out.stdout.includes(value), value)
    assert.match(out.stdout, /truncated/)
  }
})

test('fresh entry recovers a saved implementation checkpoint after pre-compact without following its source', t => {
  const f = fixture(t)
  const source = path.join(f.dir, 'tasks.md')
  fs.writeFileSync(source, 'UNREAD_TASK_FILE_SENTINEL\n')
  const checkpoint = `Next action: add the timeout regression for TASK-42.\nTask record: ${source}#TASK-42\nRevision: abc123; dirty: adapter.js\nCompleted: happy-path check passed locally.\nPending: timeout check; staging; deployment.\nBlocker: staging access unavailable.\nUpdated: 2026-09-17\n<private>CHECKPOINT_PRIVATE_SENTINEL</private>`
  f.write('trust-profile.md', '# Policy\nUse synthetic data only.\n')
  f.write('context.md', '# Context\n**Phase:** ship\n## Next action\nContinue TASK-42\n## Session end\n' + 'Old history\n'.repeat(250) + '\n## Implementation checkpoint\n' + checkpoint + '\n## Session end\n' + 'Later history\n'.repeat(250))
  const hook = spawnSync('bash', [path.join(__dirname, '../hooks/pre-compact')], { cwd: f.dir,
    env: { ...process.env, HOME: f.dir, USERPROFILE: f.dir, FDEOPS_ENGAGEMENT: f.eng, FDEOS_ENGAGEMENT: '', FDEOPS_ENGAGEMENTS_ROOT: f.dir,
      CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, '..'), PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin` }, encoding: 'utf8', timeout: 15000 })
  assert.equal(hook.status, 0, hook.stderr)
  assert.ok(fs.readFileSync(path.join(f.eng, 'context.md'), 'utf8').includes(checkpoint))
  for (const budget of ['4096', '16384']) {
    // Each CLI invocation starts a fresh process with no prior conversation.
    const out = f.run(['resume', '--max-bytes', budget])
    assert.equal(out.status, 0, out.stderr)
    assert.ok(Buffer.byteLength(out.stdout) <= Number(budget))
    assert.match(out.stdout, /SAVED IMPLEMENTATION CHECKPOINT/)
    assert.match(out.stdout, /Next action: add the timeout regression for TASK-42/)
    assert.match(out.stdout, /Pending: timeout check; staging; deployment/)
    assert.match(out.stdout, /not fresh verification/)
    assert.doesNotMatch(out.stdout, /CHECKPOINT_PRIVATE_SENTINEL|UNREAD_TASK_FILE_SENTINEL/)
  }
  assert.equal(fs.readFileSync(source, 'utf8'), 'UNREAD_TASK_FILE_SENTINEL\n')
})

test('checkpoint selection is client scoped and does not invent missing progress', t => {
  const f = fixture(t)
  fs.mkdirSync(path.join(f.dir, 'other', '.fde'), { recursive: true })
  fs.writeFileSync(path.join(f.dir, 'other', '.fde', 'context.md'), '## Implementation checkpoint\nOTHER_CLIENT_CHECKPOINT\n')
  f.write('context.md', '# Context\n## Next action\nInvestigate current customer\n')
  const missing = f.run(['resume'])
  assert.equal(missing.status, 0, missing.stderr)
  assert.doesNotMatch(missing.stdout, /SAVED IMPLEMENTATION CHECKPOINT|OTHER_CLIENT_CHECKPOINT/)
  f.write('context.md', '# Context\n## Implementation checkpoint\nOld pending action\n## Implementation checkpoint\nClosed: TASK-42 complete locally; deployment not authorized.\n')
  const updated = f.run(['resume'])
  assert.match(updated.stdout, /Closed: TASK-42 complete locally; deployment not authorized/)
  assert.doesNotMatch(updated.stdout, /Old pending action|OTHER_CLIENT_CHECKPOINT/)
})


test('nested checkpoint headings survive history trimming and an empty replacement clears old progress', t => {
  const f = fixture(t)
  const history = '## Session end\n' + 'history\n'.repeat(200)
  f.write('context.md', history + '## Implementation checkpoint\n### Next action\nRun TASK-82 timeout check\n### Task record\ntasks/plan.md#TASK-82\n### Checks\nLocal only; production not run\n' + history)
  const out = f.run(['resume'])
  assert.equal(out.status, 0, out.stderr)
  assert.match(out.stdout, /SAVED IMPLEMENTATION CHECKPOINT/)
  assert.match(out.stdout, /Run TASK-82 timeout check/)
  assert.match(out.stdout, /tasks\/plan.md#TASK-82/)
  f.write('context.md', '## Implementation checkpoint\nOld task\n## Implementation checkpoint\n\n## Session end\nFinished\n')
  const cleared = f.run(['resume'])
  assert.doesNotMatch(cleared.stdout, /SAVED IMPLEMENTATION CHECKPOINT|Old task/)
})

test('checkpoint extraction ignores fenced and indented Markdown examples', () => {
  const { implementationCheckpoint } = require('../bin/lib/context')
  for (const fence of ['```sh', '~~~~text']) {
    const close = fence.startsWith('`') ? '```' : '~~~~'
    const body = ['Next action: run TASK-90 check', fence, '## setup', '# sample', '## Implementation checkpoint', 'example only', close,
      '    ## Implementation checkpoint', '\t## Implementation checkpoint', 'Pending: real review'].join('\n')
    const outside = ['## Notes', '```md', '## Implementation checkpoint', 'outside example', '```', '    ## Implementation checkpoint', '    indented example'].join('\n')
    const text = '## Implementation checkpoint ##\n' + body + '\n' + outside
    const result = implementationCheckpoint(text)
    assert.equal(result.checkpoint, body)
    assert.equal(result.remaining, outside)
  }
  const unclosed = 'Next action: test\n````md\n```\n## Implementation checkpoint\nexample'
  assert.equal(implementationCheckpoint('## Implementation checkpoint\n' + unclosed).checkpoint, unclosed)
})


test('list examples cannot replace or end the top-level recovery checkpoint', () => {
  const { implementationCheckpoint } = require('../bin/lib/context')
  const example = '- ```md\n  ## Implementation checkpoint\n  Next: example only\n  ```'
  const body = 'Next: real\n' + example + '\nPending: real review'
  const notes = '## Notes\n' + example
  assert.deepEqual(implementationCheckpoint('## Implementation checkpoint\n' + body + '\n' + notes), { checkpoint: body, remaining: notes })
})

test('recall finds client lessons and dated retrospectives without crossing linked records', t => {
  const f = fixture(t)
  f.write('patterns.md', '# Lessons\nretry LOCAL_LESSON\n<private>retry PRIVATE_LESSON</private>')
  fs.mkdirSync(path.join(f.eng, 'retrospectives'))
  f.write('retrospectives/2026-09-01-launch.md', 'retry RETRO_LESSON')
  fs.writeFileSync(path.join(f.dir, 'external.md'), 'retry EXTERNAL_LESSON')
  fs.symlinkSync(path.join(f.dir, 'external.md'), path.join(f.eng, 'retrospectives/2026-09-02-linked.md'))
  const out = f.run(['recall', 'retry'])
  assert.equal(out.status, 0, out.stderr)
  assert.match(out.stdout, /LOCAL_LESSON/)
  assert.match(out.stdout, /retrospectives\/2026-09-01-launch.md/)
  assert.match(out.stdout, /RETRO_LESSON/)
  assert.doesNotMatch(out.stdout, /PRIVATE_LESSON|EXTERNAL_LESSON/)
  fs.rmSync(path.join(f.eng, 'retrospectives'), { recursive: true })
  fs.mkdirSync(path.join(f.dir, 'other-retros'))
  fs.writeFileSync(path.join(f.dir, 'other-retros/2026-09-01-secret.md'), 'retry EXTERNAL_LESSON')
  fs.symlinkSync(path.join(f.dir, 'other-retros'), path.join(f.eng, 'retrospectives'))
  assert.doesNotMatch(f.run(['recall', 'retry']).stdout, /EXTERNAL_LESSON/)
})

test('prep and resume surface explicit open commitments and questions, never completed or private items', t => {
  const f = fixture(t)
  f.write('context.md', '# Context\n**Phase:** build\n## Commitments\n- [ ] I owe the runbook; owner: delivery lead; due: 2026-01-01\n- [x] CLOSED_ITEM\n<private>\n- [ ] PRIVATE_ITEM\n</private>\n## Open questions\n- [ ] Who approves the replay?\n## History\n- [ ] HISTORICAL_ITEM\n')
  const out = f.run(['prep'])
  assert.equal(out.status, 0, out.stderr)
  assert.match(out.stdout, /I owe the runbook/)
  assert.match(out.stdout, /Who approves the replay/)
  assert.match(out.stdout, /past recorded due/)
  assert.doesNotMatch(out.stdout, /CLOSED_ITEM|PRIVATE_ITEM|HISTORICAL_ITEM/)
  assert.match(f.run(['resume']).stdout, /OPEN FOLLOW-THROUGH/)
})

test('follow-through uses recorded dates, ignores invalid dates and does not infer severity', () => {
  const { pendingItems } = require('../bin/lib/follow-through')
  const items = pendingItems('## Commitments\n- [ ] Wait on access; due: 2026-02-30\n- [ ] Send report; review: 2026-09-18\n- [ ] Confirm owner; review: 2026-09-01', '2026-09-17')
  assert.doesNotMatch(items[0], /past recorded/)
  assert.doesNotMatch(items[1], /past recorded/)
  assert.match(items[2], /past recorded/)
})

test('follow-through does not treat fenced or indented examples as commitments', () => {
  const { pendingItems } = require('../bin/lib/follow-through')
  assert.deepEqual(pendingItems('```markdown\n## Commitments\n- [ ] Example only\n```\n## Open questions\n    - [ ] Indented example\n- [ ] Real question'), ['context.md:7 [open questions] Real question'])
})

test('follow-through retains nested headings and ignores malformed or list-contained fences', () => {
  const { pendingItems } = require('../bin/lib/follow-through')
  const text = '## Commitments\n```markdown\n```not-a-closing-fence\n- [ ] EXAMPLE\n```\n### Operations\n- [ ] REAL\n## Notes\n- ```markdown\n  ## Commitments\n  - [ ] EXAMPLE\n  ```\n## Commitments\n- [ ] ALSO_REAL'
  const items = pendingItems(text)
  assert.equal(items.length, 2)
  assert.match(items[0], /REAL/)
  assert.match(items[1], /ALSO_REAL/)
  assert.doesNotMatch(items.join('\n'), /EXAMPLE/)
})

test('follow-through compares due dates to the local calendar day west and east of UTC', () => {
  const modulePath = path.join(__dirname, '../bin/lib/follow-through.js')
  for (const [tz, expected] of [['America/Los_Angeles', '2026-09-17'], ['Asia/Kolkata', '2026-09-18']]) {
    const result = spawnSync(process.execPath, ['-e', `const {localDay,pendingItems}=require(${JSON.stringify(modulePath)}); const day=localDay(new Date('2026-09-18T00:30:00Z')); console.log(day); console.log(pendingItems('## Commitments\\n- [ ] Due today; due: '+day,day).join(''));`], { env: { ...process.env, TZ: tz }, encoding: 'utf8' })
    assert.equal(result.status, 0)
    assert.ok(result.stdout.startsWith(expected))
    assert.doesNotMatch(result.stdout, /past recorded/)
  }
})

test('excluded retrospective links and directories cannot displace real files from recall', t => {
  const f = fixture(t)
  fs.mkdirSync(path.join(f.eng, 'retrospectives'))
  f.write('retrospectives/2020-01-01-real.md', 'retry RETAINED_REAL_LESSON')
  for (let i = 0; i < 100; i++) fs.symlinkSync('/nonexistent', path.join(f.eng, `retrospectives/2026-09-18-link-${i}.md`))
  fs.mkdirSync(path.join(f.eng, 'retrospectives/2026-09-19-directory.md'))
  const out = f.run(['recall', 'retry'])
  assert.equal(out.status, 0, out.stderr)
  assert.match(out.stdout, /RETAINED_REAL_LESSON/)
  assert.doesNotMatch(out.stdout, /Older retrospectives omitted/)
})
