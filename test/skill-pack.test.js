const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const catalog = require('../bin/skill-catalog')
const { expectedFiles, referencesFor, generate } = require('../bin/generate-skills')
const source = path.resolve(__dirname, '../skills/fde/references')

test('selective skill installations contain canonical dependency closures and local links', t => {
  const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'fde-skills-isolated-'))
  t.after(() => fs.rmSync(isolated, { recursive: true, force: true }))
  for (const item of catalog) {
    const dir = path.join(isolated, item.name)
    fs.cpSync(path.resolve(__dirname, '../skills', item.name), dir, { recursive: true })
    for (const [relative, body] of expectedFiles(item)) {
      assert.equal(fs.readFileSync(path.join(dir, relative), 'utf8'), body)
      for (const match of body.matchAll(/\]\(([^)]+\.md)(?:#[^)]*)?\)/g)) {
        if (/^https?:/.test(match[1])) continue
        const target = path.resolve(path.dirname(path.join(dir, relative)), match[1])
        assert.ok(target.startsWith(dir + path.sep), `${relative} escapes skill: ${match[1]}`)
        assert.ok(fs.existsSync(target), `${relative} missing ${match[1]}`)
      }
    }
    assert.ok(fs.existsSync(path.join(dir, 'references', item.method + '.md')))
    assert.ok(fs.existsSync(path.join(dir, 'references/task-context.md')))
  }
  generate(true)
})

test('reference discovery follows transitive links and terminates cycles', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fde-closure-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  fs.writeFileSync(path.join(dir, 'task-context.md'), 'context')
  fs.writeFileSync(path.join(dir, 'start.md'), '[next](next.md#section)')
  fs.writeFileSync(path.join(dir, 'next.md'), '[start](start.md)')
  assert.deepEqual(referencesFor('start', dir), ['next.md', 'start.md', 'task-context.md'])
  fs.writeFileSync(path.join(dir, 'next.md'), '[missing](missing.md)')
  assert.throws(() => referencesFor('start', dir), /Nonportable instruction link/)
  fs.writeFileSync(path.join(dir, 'next.md'), '[escape](../outside.md)')
  assert.throws(() => referencesFor('start', dir), /Nonportable instruction link/)
})

test('every coordinator task and evaluation method has exactly one public catalog entry', () => {
  assert.equal(new Set(catalog.map(s => s.name)).size, catalog.length)
  assert.equal(new Set(catalog.map(s => s.method)).size, catalog.length)
  const router = fs.readFileSync(path.resolve(source, '../SKILL.md'), 'utf8')
  const routes = router.split('## Routing')[1].split('**Overlays')[0]
  const methods = new Set(routes.split('\n').filter(line => line.startsWith('|')).map(line => line.match(/references\/([a-z-]+)\.md/)).filter(Boolean).map(match => match[1]))
  methods.add('eval-pack')
  for (const line of routes.split('\n').filter(line => line.startsWith('|'))) {
    const match = line.match(/references\/([a-z-]+)\.md/)
    if (!match) continue
    const name = line.split('|')[2].trim().replace(/\s*\([^)]*\)\s*$/, '')
    const entry = catalog.find(item => item.name === name)
    assert.ok(entry, `Routed name ${name} is installable`)
    assert.equal(entry.method, match[1], `Correct instructions for ${name}`)
  }
  assert.deepEqual(catalog.map(item => item.method).sort(), [...methods].sort())
  assert.equal(catalog.length, 35)
  const groups = new Set(['Start', 'Discover', 'Plan', 'Build and verify', 'Report', 'Operate'])
  for (const item of catalog) {
    assert.match(item.name, /^[a-z][a-z-]*$/)
    assert.ok(!item.name.startsWith('fde-'))
    assert.ok(groups.has(item.group), item.name)
    assert.ok(item.result.length > 15, item.name)
    assert.ok(['context', 'records', 'source', 'record-write'].includes(item.inputMode), item.name)
  }
})

test('entrypoints state record requirements without blocking supplied-context tasks', () => {
  for (const name of ['dashboard', 'switch-clients']) {
    const item = catalog.find(item => item.name === name)
    assert.equal(item.inputMode, 'records')
    const entry = expectedFiles(item).get('SKILL.md')
    assert.match(entry, /operates on existing engagement records/)
    assert.doesNotMatch(entry, /Standalone work does not require/)
  }
  const connect = expectedFiles(catalog.find(item => item.name === 'connect')).get('SKILL.md')
  assert.match(connect, /configuration and capability checks do not require an engagement record/)
  const ingest = expectedFiles(catalog.find(item => item.name === 'ingest')).get('SKILL.md')
  assert.match(ingest, /applying updates requires the bound record and confirmation/)
  assert.match(ingest, /CLI staging and reconciliation use a bound engagement/)
  const build = expectedFiles(catalog.find(item => item.name === 'build')).get('SKILL.md')
  assert.match(build, /Standalone work does not require an engagement folder/)
})

function generationFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fde-generation-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  const referenceRoot = path.join(root, 'skills/fde/references')
  fs.mkdirSync(referenceRoot, { recursive: true })
  fs.writeFileSync(path.join(root, 'skills/fde/SKILL.md'), 'canonical coordinator')
  for (const [name, body] of Object.entries({ 'task-context.md': 'context', 'start.md': '[extra](extra.md)', 'extra.md': 'extra' })) fs.writeFileSync(path.join(referenceRoot, name), body)
  const catalog = [{ name: 'example', method: 'start', description: 'Example task', ui: ['Example Task', 'Exercise a generated task package', 'exercise this example task'] }]
  const options = { root, referenceRoot, catalog }
  return { root, referenceRoot, options, dest: path.join(root, 'skills/example') }
}

function snapshot(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const target = path.join(dir, e.name)
    return e.isDirectory() ? snapshot(target) : [[target, e.isSymbolicLink() ? fs.readlinkSync(target) : fs.readFileSync(target, 'utf8')]]
  })
}

test('generation prunes obsolete dependencies and removed skills; checks never mutate', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  fs.writeFileSync(path.join(f.referenceRoot, 'start.md'), 'no extra dependency')
  fs.unlinkSync(path.join(f.referenceRoot, 'extra.md'))
  const before = snapshot(f.root)
  assert.throws(() => generate(true, f.options), /Obsolete generated file/)
  assert.deepEqual(snapshot(f.root), before)
  generate(false, f.options)
  assert.equal(fs.existsSync(path.join(f.dest, 'references/extra.md')), false)
  generate(true, f.options)
  const removed = { ...f.options, catalog: [] }
  const beforeRemoval = snapshot(f.root)
  assert.throws(() => generate(true, removed), /Obsolete generated file/)
  assert.deepEqual(snapshot(f.root), beforeRemoval)
  generate(false, removed)
  assert.equal(fs.existsSync(f.dest), false)
  assert.equal(fs.readFileSync(path.join(f.root, 'skills/fde/SKILL.md'), 'utf8'), 'canonical coordinator')
})

test('legacy generated packages migrate safely and can be removed', t => {
  const f = generationFixture(t)
  for (const [rel, body] of expectedFiles(f.options.catalog[0], f.referenceRoot)) {
    if (rel === 'agents/openai.yaml') continue // Pre-metadata package.
    fs.mkdirSync(path.dirname(path.join(f.dest, rel)), { recursive: true })
    fs.writeFileSync(path.join(f.dest, rel), body)
  }
  const before = snapshot(f.root)
  assert.throws(() => generate(true, f.options), /Stale generated skill.*fde-generated/)
  assert.deepEqual(snapshot(f.root), before)
  generate(false, f.options)
  generate(true, f.options)
  fs.unlinkSync(path.join(f.dest, '.fde-generated.json'))
  fs.rmSync(path.join(f.dest, 'agents'), { recursive: true })
  generate(false, { ...f.options, catalog: [] })
  assert.equal(fs.existsSync(f.dest), false)
})

test('unknown additions and unrelated skills are preserved, including on removal', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  const other = path.join(f.root, 'skills/personal')
  fs.mkdirSync(other)
  fs.writeFileSync(path.join(other, 'SKILL.md'), 'personal instructions')
  generate(false, f.options)
  assert.equal(fs.readFileSync(path.join(other, 'SKILL.md'), 'utf8'), 'personal instructions')
  fs.writeFileSync(path.join(f.dest, 'notes.md'), 'user notes')
  const before = snapshot(f.root)
  for (const check of [true, false]) {
    assert.throws(() => generate(check, f.options), /Unowned generated file/)
    assert.throws(() => generate(check, { ...f.options, catalog: [] }), /Unowned generated file/)
    assert.deepEqual(snapshot(f.root), before)
  }
  fs.unlinkSync(path.join(f.dest, 'notes.md'))
  fs.mkdirSync(path.join(f.dest, 'personal'))
  assert.throws(() => generate(false, f.options), /Unowned generated directory/)
  assert.ok(fs.existsSync(path.join(f.dest, 'personal')))
  assert.throws(() => generate(false, { ...f.options, catalog: [{ ...f.options.catalog[0], name: 'personal' }] }), /Unowned skill/)
})

test('modified obsolete files and unrecognized legacy references are preserved', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  fs.writeFileSync(path.join(f.dest, 'references/extra.md'), 'user modification')
  fs.writeFileSync(path.join(f.referenceRoot, 'start.md'), 'no extra dependency')
  assert.throws(() => generate(false, f.options), /Modified obsolete generated file/)
  assert.equal(fs.readFileSync(path.join(f.dest, 'references/extra.md'), 'utf8'), 'user modification')
  fs.unlinkSync(path.join(f.dest, '.fde-generated.json'))
  assert.throws(() => generate(false, f.options), /Unowned generated file/)
})

test('generation refuses target symlinks and never follows them', t => {
  for (const rel of ['', 'SKILL.md', 'references', 'references/extra.md', 'agents', 'agents/openai.yaml', '.fde-generated.json']) {
    const f = generationFixture(t)
    generate(false, f.options)
    const target = path.join(f.dest, rel)
    const outside = path.join(f.root, 'outside')
    fs.renameSync(target, outside)
    fs.symlinkSync(outside, target)
    const before = snapshot(f.root)
    for (const check of [true, false]) {
      assert.throws(() => generate(check, f.options), /Unsafe generated path|Unowned skill/)
      assert.deepEqual(snapshot(f.root), before)
    }
  }
})

test('generation protects canonical and skills root paths', t => {
  const f = generationFixture(t)
  assert.throws(() => generate(false, { ...f.options, catalog: [{ ...f.options.catalog[0], name: 'fde' }] }), /Invalid generated skill name/)
  const actual = path.join(f.root, 'actual-skills')
  fs.renameSync(path.join(f.root, 'skills'), actual)
  fs.symlinkSync(actual, path.join(f.root, 'skills'))
  assert.throws(() => generate(false, { ...f.options, referenceRoot: path.join(actual, 'fde/references') }), /Unsafe skills root/)
})


test('generation refuses hard links without changing either path', t => {
  for (const rel of ['SKILL.md', 'references/start.md', 'agents/openai.yaml', '.fde-generated.json']) {
    const f = generationFixture(t)
    generate(false, f.options)
    const target = path.join(f.dest, rel)
    const outside = path.join(f.root, 'personal-note.md')
    fs.linkSync(target, outside)
    fs.writeFileSync(path.join(f.referenceRoot, 'start.md'), 'updated canonical')
    const before = snapshot(f.root)
    for (const check of [true, false]) {
      assert.throws(() => generate(check, f.options), /Unsafe generated path/)
      assert.deepEqual(snapshot(f.root), before)
    }
  }
})


test('established public entry points retain their names and methods', () => {
  const established = { discover: 'discover', scope: 'hold-scope', options: 'three-options', poc: 'poc', build: 'build', integrate: 'integrate', debug: 'debug', review: 'review', evaluate: 'eval-pack', qa: 'qa', ship: 'ship', readout: 'readout', handoff: 'close', feedback: 'encode-pattern' }
  for (const [name, method] of Object.entries(established)) assert.equal(catalog.find(item => item.name === name)?.method, method)
  assert.equal(catalog.find(item => item.name === 'brief').method, 'land')
  assert.equal(catalog.find(item => item.name === 'prioritize').method, 'pick-three')
})

test('generation migrates owned prefixed packages without duplicate entries', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  const old = path.join(f.root, 'skills/fde-example')
  fs.renameSync(f.dest, old)
  const before = snapshot(f.root)
  assert.throws(() => generate(true, f.options), /Obsolete generated file/)
  assert.deepEqual(snapshot(f.root), before)
  generate(false, f.options)
  assert.equal(fs.existsSync(old), false)
  assert.equal(fs.existsSync(path.join(f.dest, 'SKILL.md')), true)
  generate(true, f.options)
})

test('a generic collision prevents any old generated package removal', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  const old = path.join(f.root, 'skills/fde-example')
  fs.renameSync(f.dest, old)
  fs.mkdirSync(f.dest)
  fs.writeFileSync(path.join(f.dest, 'SKILL.md'), 'personal task')
  const before = snapshot(f.root)
  assert.throws(() => generate(false, f.options), /Unowned skill/)
  assert.deepEqual(snapshot(f.root), before)
})


test('public catalog uses installable paths and includes every skill exactly once', () => {
  const { renderCatalog, checkCatalog } = require('../bin/catalog-doc')
  const rendered = renderCatalog()
  const names = [...rendered.matchAll(/\| \[([a-z-]+)\]\(\.\.\/skills\/([a-z-]+)\/SKILL\.md\)/g)]
  assert.deepEqual(names.map(m => m[1]).sort(), catalog.map(s => s.name).sort())
  for (const match of names) assert.equal(match[1], match[2])
  assert.equal(new Set(names.map(m => m[1])).size, catalog.length)
  checkCatalog()
})

// Parse the intentionally small emitted YAML subset and require quoted scalars.
function readInterface(body) {
  const lines = body.trimEnd().split('\n')
  assert.equal(lines.shift(), 'interface:')
  const fields = {}
  for (const line of lines) {
    const match = line.match(/^  ([a-z_]+): (".*")$/)
    assert.ok(match, `Expected a quoted interface scalar: ${line}`)
    fields[match[1]] = JSON.parse(match[2])
  }
  assert.deepEqual(Object.keys(fields), ['display_name', 'short_description', 'default_prompt'])
  return fields
}

test('all task packages and the coordinator have bounded, optional host UI metadata', () => {
  const { entries } = require('../bin/skill-ui')
  assert.deepEqual(Object.keys(entries).sort(), catalog.map(item => item.name).sort())
  const outputs = catalog.map(item => [item.name, expectedFiles(item).get('agents/openai.yaml')])
  outputs.push(['fde', fs.readFileSync(path.resolve(source, '../agents/openai.yaml'), 'utf8')])
  for (const [name, body] of outputs) {
    const ui = readInterface(body)
    assert.ok(ui.display_name.trim())
    assert.ok(ui.short_description.length >= 25 && ui.short_description.length <= 64, name)
    assert.ok(ui.default_prompt.includes(`$${name} `), name)
    assert.doesNotMatch(body, /policy:|dependencies:|icon_small:|icon_large:/)
  }
})

test('UI serialization preserves YAML-sensitive strings without extra fields', () => {
  const { interfaceYaml } = require('../bin/skill-ui')
  const fields = ['Task: "review"', 'Check "quoted" text: paths and evidence', 'inspect C:\\work and line\nbreaks # safely']
  const ui = readInterface(interfaceYaml('example', fields))
  assert.equal(ui.display_name, fields[0])
  assert.equal(ui.short_description, fields[1])
  assert.equal(ui.default_prompt, `Use $example to ${fields[2]}.`)
  assert.throws(() => interfaceYaml('example', ['Example', 'Too short', 'try it']), /Invalid skill UI metadata/)
})

test('version-one manifests gain metadata and report drift without mutation', t => {
  const f = generationFixture(t)
  const legacyOptions = { ...f.options, catalog: [{ ...f.options.catalog[0], ui: null }] }
  generate(false, legacyOptions)
  const manifestPath = path.join(f.dest, '.fde-generated.json')
  const oldManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(oldManifest.version, 1)
  assert.equal(oldManifest.files['agents/openai.yaml'], undefined)
  const before = snapshot(f.root)
  assert.throws(() => generate(true, f.options), /Stale generated skill: example\/agents\/openai.yaml/)
  assert.deepEqual(snapshot(f.root), before)
  generate(false, f.options)
  generate(true, f.options)
  const yaml = path.join(f.dest, 'agents/openai.yaml')
  fs.writeFileSync(yaml, 'edited metadata')
  const edited = snapshot(f.root)
  assert.throws(() => generate(true, f.options), /Stale generated skill/)
  assert.deepEqual(snapshot(f.root), edited)
  generate(false, f.options)
  generate(true, f.options)
})

test('unknown agent files and directories survive both generation and removal', t => {
  for (const rel of ['agents/personal.yaml', 'agents/nested']) {
    const f = generationFixture(t)
    generate(false, f.options)
    const target = path.join(f.dest, rel)
    if (rel.endsWith('nested')) fs.mkdirSync(target)
    else fs.writeFileSync(target, 'personal metadata')
    const before = snapshot(f.root)
    for (const check of [true, false]) {
      for (const options of [f.options, { ...f.options, catalog: [] }]) {
        assert.throws(() => generate(check, options), /Unowned generated (file|directory)/)
        assert.deepEqual(snapshot(f.root), before)
        assert.ok(fs.existsSync(target))
      }
    }
  }
})

test('unowned openai metadata is not adopted during legacy migration', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  fs.unlinkSync(path.join(f.dest, '.fde-generated.json'))
  const before = snapshot(f.root)
  assert.throws(() => generate(false, f.options), /Unowned generated file: example\/agents\/openai.yaml/)
  assert.deepEqual(snapshot(f.root), before)
})

test('obsolete UI output is pruned only when unchanged and empty agents directories are removed', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  const options = { ...f.options, catalog: [{ ...f.options.catalog[0], ui: null }] }
  const yaml = path.join(f.dest, 'agents/openai.yaml')
  const original = fs.readFileSync(yaml, 'utf8')
  fs.writeFileSync(yaml, 'personal edit')
  assert.throws(() => generate(false, options), /Modified obsolete generated file/)
  assert.equal(fs.readFileSync(yaml, 'utf8'), 'personal edit')
  fs.writeFileSync(yaml, original)
  const before = snapshot(f.root)
  assert.throws(() => generate(true, options), /Obsolete generated file/)
  assert.deepEqual(snapshot(f.root), before)
  generate(false, options)
  assert.equal(fs.existsSync(path.join(f.dest, 'agents')), false)
  generate(true, options)
})

test('a file blocking the agents directory is preserved before any writes', t => {
  const f = generationFixture(t)
  generate(false, f.options)
  fs.rmSync(path.join(f.dest, 'agents'), { recursive: true })
  fs.writeFileSync(path.join(f.dest, 'agents'), 'personal file')
  const before = snapshot(f.root)
  for (const check of [true, false]) {
    assert.throws(() => generate(check, f.options), /Unowned generated file: example\/agents/)
    assert.deepEqual(snapshot(f.root), before)
  }
})
