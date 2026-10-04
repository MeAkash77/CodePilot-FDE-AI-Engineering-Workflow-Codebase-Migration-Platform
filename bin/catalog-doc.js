#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const catalog = require('./skill-catalog')
const root = path.resolve(__dirname, '..')
const inputs = {
  context: 'Supplied notes, code or evidence',
  records: 'Existing customer records + CLI',
  source: 'Host source tools or setup documentation',
  'record-write': 'Notes or source tools; selected record for staging/saving',
}
const cell = value => value.replace(/\|/g, '\\|').replace(/\n/g, ' ')
function renderCatalog(items = catalog) {
  const out = ['# FDEOps skills', '', `**${items.length} task skills + one coordinator, \`fde\` = ${items.length + 1} installable skills.**`, '',
    'Every task below can be installed and used directly. Ask `fde` to select the relevant skills when working across a customer project. The groups help you find a task; they are not required phases.', '',
    'Install a task with `npx skills add suboss87/fdeops --skill <name>`, replacing `<name>` with its catalog name. See [installation](install.md#individual-skills-and-the-full-pack) for the full pack and host-specific invocation.', '',
    'Customer records live at `~/fde-engagements/<customer>/.fde/`. A skill provides instructions, not customer credentials or infrastructure. Drafting from supplied notes does not need a customer record. Viewing records does; staging or saving requires the intended customer and applicable confirmation.', '']
  for (const group of [...new Set(items.map(item => item.group))]) {
    out.push(`## ${group}`, '', '| Skill | Use it when | Result | Input needed |', '|---|---|---|---|')
    for (const item of items.filter(item => item.group === group)) {
      out.push(`| [${item.name}](../skills/${item.name}/SKILL.md) | ${cell(item.description)} | ${cell(item.result)} | ${inputs[item.inputMode]} |`)
    }
    out.push('')
  }
  out.push('## Domain guidance', '', 'The skills can apply supporting guidance for AI systems, financial services, healthcare, government work and customer-facing artifacts when relevant. These references are included instructions, not additional installable skills or a substitute for the responsible specialists.', '', '[Starting examples](skills.md) · [Customer records](schema.md) · [Verification and limits](verification.md)', '')
  return out.join('\n')
}
function checkCatalog(base = root) {
  const file = path.join(base, 'docs/skills-reference.md')
  if (fs.readFileSync(file, 'utf8') !== renderCatalog()) throw new Error('Public skill catalog is stale; run npm run generate:skills')
  const readme = fs.readFileSync(path.join(base, 'README.md'), 'utf8')
  if (!readme.includes(`**${catalog.length} task skills + one coordinator, \`fde\`**`)) throw new Error('README skill count differs from the catalog')
}
module.exports = { renderCatalog, checkCatalog }
if (require.main === module) {
  if (process.argv.includes('--check')) checkCatalog()
  else fs.writeFileSync(path.join(root, 'docs/skills-reference.md'), renderCatalog())
}
