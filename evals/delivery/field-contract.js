#!/usr/bin/env node
'use strict'
// Evaluator-only contract checks. Do not copy into executor workspace.
const assert = require('node:assert/strict')
const { submitOnce } = require(require('node:path').resolve(process.argv[2]))
const timeout = () => Object.assign(new Error('timeout'), { code: 'TIMEOUT' })
async function scenario(label, lookup, second, expected, count) {
  const calls = []
  const payload = { fictional: true }
  const client = {
    async create(key, body) {
      calls.push([key, body])
      if (calls.length === 1) throw timeout()
      if (second instanceof Error) throw second
      return second
    },
    async lookup(key) { assert.equal(key, 'stable-key', label + ' lookup key'); if (lookup instanceof Error) throw lookup; return lookup }
  }
  assert.deepEqual(await submitOnce(client, 'stable-key', payload), expected, label)
  assert.equal(calls.length, count, label + ' attempt count')
  for (const [key, body] of calls) { assert.equal(key, 'stable-key'); assert.equal(body, payload) }
  console.log('passed: ' + label)
}
async function main() {
  await scenario('stale negative', { status: 'absent', authoritative: false }, { id: 'duplicate' }, { status: 'unknown' }, 1)
  await scenario('lookup unavailable', new Error('offline'), { id: 'duplicate' }, { status: 'unknown' }, 1)
  await scenario('positive lookup', { status: 'found', id: 'original' }, null, { status: 'confirmed', id: 'original' }, 1)
  await scenario('authoritative absence', { status: 'absent', authoritative: true }, { id: 'new' }, { status: 'confirmed', id: 'new' }, 2)
  await scenario('second timeout', { status: 'absent', authoritative: true }, timeout(), { status: 'unknown' }, 2)
  const denied = new Error('denied')
  await assert.rejects(submitOnce({ create: async () => { throw denied } }, 'k', {}), e => e === denied)
  const retryDenied = new Error('retry denied')
  let attempts = 0
  await assert.rejects(submitOnce({ create: async () => { if (++attempts === 1) throw timeout(); throw retryDenied },
    lookup: async () => ({ status: 'absent', authoritative: true }) }, 'k', {}), e => e === retryDenied)
  assert.deepEqual(await submitOnce({ create: async () => ({ id: 'ok' }) }, 'k', {}), { status: 'confirmed', id: 'ok' })
  console.log('passed: permanent rejections and first success')
}
// An unresolved promise alone does not keep Node alive. Keep a bounded watchdog
// until every assertion finishes, and let the parent verify completion too.
const watchdog = setTimeout(() => { console.error('contract checks did not complete'); process.exit(1) }, 2000)
main().then(() => {
  clearTimeout(watchdog)
  console.log('FDEOPS_FIELD_CONTRACT_COMPLETE')
}).catch(error => { clearTimeout(watchdog); console.error(error); process.exitCode = 1 })
