const test = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const run = promisify(execFile)

// A loopback protocol fixture checks the runner and real read-only CLI calls.
// It is not model inference and supplies no evidence of model answer quality.
test('local-model receipts record the settings actually sent to inference', { timeout: 30000 }, async t => {
  const requests = []
  const toolResults = []
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.url === '/api/version') return res.end(JSON.stringify({ version: 'protocol-fixture' }))
    if (req.url !== '/api/chat') { res.statusCode = 404; return res.end('{}') }
    let body = ''
    for await (const chunk of req) body += chunk
    const input = JSON.parse(body)
    requests.push(input)
    const last = input.messages.at(-1)
    let message
    if (last.role === 'tool') {
      toolResults.push(last)
      message = { role: 'assistant', content: 'Fixture completed its read-only tool call.' }
    } else {
      const name = last.content.includes('ERP') ? 'fde_recall' : last.content.includes('delivery') ? 'fde_status' : 'fde_resume'
      message = { role: 'assistant', content: '', tool_calls: [{ function: { name, arguments: name === 'fde_recall' ? { topic: 'ERP' } : {} } }] }
    }
    res.end(JSON.stringify({ message, prompt_eval_count: 7, eval_count: 3 }))
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  t.after(() => new Promise(resolve => server.close(resolve)))
  const { stdout } = await run(process.execPath, [path.resolve(__dirname, '../evals/local-model/check.js'), 'fixture-local'], {
    env: { ...process.env, FDEOPS_TEST_OLLAMA: `http://127.0.0.1:${server.address().port}` },
    timeout: 25000,
  })
  const receipt = JSON.parse(stdout)
  assert.equal(receipt.model, 'fixture-local')
  assert.equal(receipt.runtime, 'protocol-fixture')
  assert.equal(requests.length, 6)
  assert.ok(Number.isInteger(receipt.settings.maxTurns) && receipt.settings.maxTurns >= 2)
  assert.ok(receipt.settings.requestTimeoutMs > 0)
  for (const input of requests) {
    assert.equal(input.model, receipt.model)
    assert.equal(input.think, receipt.settings.think)
    assert.deepEqual(input.options, receipt.settings.options)
    assert.equal(input.keep_alive, receipt.settings.keep_alive)
    assert.equal(input.stream, false)
  }
  assert.deepEqual(toolResults.map(result => result.tool_name), ['fde_resume', 'fde_recall', 'fde_status'])
  assert.match(toolResults[0].content, /Mara/)
  assert.match(toolResults[1].content, /ERP/)
  assert.match(toolResults[2].content, /not yet accepted/i)
  assert.ok(toolResults.every(result => !result.content.includes('PRIVATE_LOCAL_SENTINEL')))
  assert.equal(receipt.results.length, 3)
  for (const result of receipt.results) {
    assert.equal(result.toolCheckPassed, true)
    assert.equal(result.promptTokens, 14)
    assert.equal(result.completionTokens, 6)
    assert.equal(result.qualityVerdict, 'requires manual review against the fixture')
  }
})
