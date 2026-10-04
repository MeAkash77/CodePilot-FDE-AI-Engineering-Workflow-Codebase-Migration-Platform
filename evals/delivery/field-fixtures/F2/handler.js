'use strict'
exports.makeHandler = apply => {
  const seen = new Set()
  return event => {
    if (seen.has(event.id)) return { duplicate: true }
    apply(event)
    seen.add(event.id)
    return { duplicate: false }
  }
}
