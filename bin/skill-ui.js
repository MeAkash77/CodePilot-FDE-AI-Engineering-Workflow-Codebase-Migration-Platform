// Optional host UI metadata. Task routing and methods live in skill-catalog.js.
const entries = {
  brief: ['Customer Brief', 'Clarify the outcome, constraints, and evidence', 'clarify this customer brief and its open questions'],
  audit: ['Engagement Audit', 'Check inherited claims against delivery evidence', 'audit this inherited engagement and its risks'],
  'who-decides': ['Who Decides', 'Map stakeholders and decision ownership', 'map the stakeholders and decision rights for this work'],
  'earn-trust': ['Earn Trust', 'Plan credible next steps and appropriate access', 'plan how to earn trust and appropriate customer access'],
  discover: ['Discover', 'Trace the workflow and identify the real problem', 'trace this customer workflow and identify evidence gaps'],
  'test-assumptions': ['Test Assumptions', 'Find consequential assumptions and test them', 'identify and test the assumptions behind this proposal'],
  'score-use-cases': ['Score Use Cases', 'Compare customer use cases and their trade-offs', 'compare these customer use cases using the available evidence'],
  poc: ['Proof of Concept', 'Test a delivery uncertainty with a bounded pilot', 'design a bounded proof of concept for this uncertainty'],
  scope: ['Scope', 'Assess new requests against agreed commitments', 'assess this request against the agreed scope'],
  options: ['Delivery Options', 'Compare feasible approaches to a customer problem', 'compare feasible approaches and recommend a delivery path'],
  plan: ['Delivery Plan', 'Sequence delivery into verifiable increments', 'turn this agreed outcome into a sequenced delivery plan'],
  'business-case': ['Business Case', 'Connect investment decisions to costs and evidence', 'develop a business case with explicit assumptions'],
  prioritize: ['Prioritize', 'Choose immediate priorities and explicit deferrals', 'choose the immediate priorities from this competing work'],
  'red-team': ['Red Team', 'Challenge a plan with evidence and failure modes', 'stress-test this plan and identify corrective actions'],
  build: ['Build', 'Implement and verify an agreed software change', 'implement this scoped change and verify the agreed behavior'],
  integrate: ['Integrate', 'Prove system connections and failure handling', 'implement this integration and verify its downstream result'],
  debug: ['Debug', 'Investigate failures and verify the repair', 'investigate this failure using the available evidence'],
  review: ['Code Review', 'Review a change for delivery and operational risks', 'review this change against its outcome and operational risks'],
  evaluate: ['Evaluate AI', 'Measure AI workflow behavior and failure modes', 'evaluate this AI workflow using representative cases'],
  qa: ['Journey QA', 'Verify the real customer journey and its results', 'exercise the changed customer journey and report evidence'],
  'what-breaks': ['What Breaks', 'Assess the blast radius before changing a system', 'assess the impact of this change on dependent systems'],
  rollback: ['Rollback', 'Rehearse recovery and expose remaining gaps', 'prepare a recovery drill within the permitted environment'],
  ship: ['Ship', 'Prepare a controlled release with recovery evidence', 'prepare this increment for an authorized release'],
  readout: ['Sponsor Readout', 'Separate promises, measured results, and acceptance', 'prepare a sponsor readout from the delivery evidence'],
  'demo-prep': ['Demo Prep', 'Rehearse an evidenced demo with a fallback', 'prepare a customer demo and its failure fallback'],
  debrief: ['Meeting Debrief', 'Extract sourced decisions and next actions', 'turn these meeting notes into sourced decisions and actions'],
  'board-memo': ['Board Memo', 'Draft an executive account of outcomes and risks', 'draft an executive memo from the engagement evidence'],
  rescue: ['Rescue', 'Triage urgent delivery and engagement failures', 'triage this failing engagement and identify recovery steps'],
  dashboard: ['Engagement Dashboard', 'Review status across existing engagement records', 'review the portfolio using available engagement records'],
  'switch-clients': ['Switch Clients', 'Refresh customer context and triage competing needs', 'switch to the requested engagement and refresh its context'],
  runbook: ['Operating Runbook', 'Document verified operations and recovery steps', 'draft an operating runbook from these verified procedures'],
  handoff: ['Handoff', 'Transfer operation with evidence and clear ownership', 'prepare an operating handoff with evidence and ownership'],
  feedback: ['Field Feedback', 'Assess field lessons for safe and useful reuse', 'assess this field lesson for reuse or product feedback'],
  connect: ['Connect a Source', 'Check source setup and available host capabilities', 'check the requested source connection and available capabilities'],
  ingest: ['Ingest Notes', 'Prepare sourced engagement updates for review', 'prepare sourced engagement updates from this requested material'],
}

function interfaceYaml(name, fields = entries[name]) {
  if (!fields) return null
  const [displayName, shortDescription, prompt] = fields
  if (typeof displayName !== 'string' || !displayName.trim() || typeof shortDescription !== 'string' || shortDescription.length < 25 || shortDescription.length > 64 || typeof prompt !== 'string' || !prompt.trim()) throw new Error(`Invalid skill UI metadata: ${name}`)
  // JSON string literals are also YAML double-quoted scalars; no parser dependency.
  return `interface:\n  display_name: ${JSON.stringify(displayName)}\n  short_description: ${JSON.stringify(shortDescription)}\n  default_prompt: ${JSON.stringify(`Use $${name} to ${prompt}.`)}\n`
}
module.exports = { entries, interfaceYaml }
