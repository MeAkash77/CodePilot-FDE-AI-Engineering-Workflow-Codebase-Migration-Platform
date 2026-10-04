'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { canRead } = require('./access')
test('same tenant can read', () => {
  assert.equal(canRead({ id: 'u-1', tenantId: 'north' }, { tenantId: 'north' }), true)
})
test('other tenant cannot read', () => {
  assert.equal(canRead({ id: 'u-1', tenantId: 'north' }, { tenantId: 'south' }), false)
})
