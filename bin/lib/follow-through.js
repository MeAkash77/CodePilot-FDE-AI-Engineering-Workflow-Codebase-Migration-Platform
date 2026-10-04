'use strict'

// Explicit checkboxes keep closure human-owned; prose is not inferred as a debt.
function localDay(now = new Date()) {
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
}

function pendingItems(text, today = localDay()) {
  const items = []
  let section = ''
  let fence = ''
  for (const [index, line] of String(text || '').split('\n').entries()) {
    if (fence) {
      if (new RegExp(`^[\\t ]*${fence.char}{${fence.length},}[\\t ]*$`).test(line)) fence = null
      continue
    }
    const opening = line.match(/^ {0,3}(?:(?:[-+*]|\d{1,9}[.)])[\t ]+)?(`{3,}|~{3,})(.*)$/)
    if (opening && (opening[1][0] !== '`' || !opening[2].includes('`'))) {
      fence = { char: opening[1][0], length: opening[1].length }
      continue
    }
    const heading = line.match(/^(#{1,2})(?:[\t ]+|$)(.*)$/)
    if (heading) section = heading[1] === '##' ? heading[2].replace(/[\t ]+#+[\t ]*$/, '').trim().toLowerCase() : ''
    if (!['commitments', 'open questions'].includes(section)) continue
    const match = line.match(/^ {0,3}-\s+\[ \]\s+(.+)/)
    if (!match) continue
    const due = match[1].match(/\b(?:due|review):\s*(\d{4}-\d{2}-\d{2})\b/i)
    const date = due && due[1]
    const valid = date && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date
    items.push(`context.md:${index + 1} [${section}] ${match[1].slice(0, 400)}${valid && date < today ? ' [past recorded due/review date; confirm status]' : ''}`)
  }
  return items
}

function pendingSummary(text) {
  const items = pendingItems(text)
  if (!items.length) return ''
  return `OPEN FOLLOW-THROUGH (${Math.min(items.length, 8)} of ${items.length} recorded items)\n${items.slice(0, 8).join('\n')}\nRecorded items, not a complete agenda. Confirm status and meeting relevance.`
}

module.exports = { pendingItems, pendingSummary, localDay }
