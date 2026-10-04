'use strict'
const records = new Map([
  ['north-1', { id: 'north-1', tenantId: 'north', body: 'Fictional North account report' }],
  ['south-1', { id: 'south-1', tenantId: 'south', body: 'Fictional South account report' }]
])
// Called after middleware validates the session and supplies req.user.
exports.getRecord = req => {
  if (!req.user) return { status: 401 }
  const record = records.get(req.params.id)
  if (!record) return { status: 404 }
  if (req.query.preview === 'true') return { status: 200, body: record }
  if (req.user.tenantId !== record.tenantId) return { status: 403 }
  return { status: 200, body: record }
}
