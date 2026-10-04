// One public task catalog. Methods remain authored once in skills/fde/references/.
// inputMode distinguishes supplied-context tasks from operations that use engagement records.
module.exports = [
  {
    "name": "brief",
    "method": "land",
    "group": "Start",
    "result": "A grounded brief with success criteria and open questions.",
    "description": "Clarify a new customer brief, desired outcome, constraints and evidence gaps. Use for kickoff or a first meeting; do not repeat discovery already supplied.",
    "inputMode": "context"
  },
  {
    "name": "audit",
    "method": "audit",
    "group": "Start",
    "result": "An audit of inherited claims and takeover risks.",
    "description": "Audit an inherited engagement or implementation against its evidence. Use when taking over work or joining mid-project; distinguish verified facts from inherited claims.",
    "inputMode": "context"
  },
  {
    "name": "who-decides",
    "method": "who-decides",
    "group": "Start",
    "result": "A stakeholder map with decision rights and unknowns.",
    "description": "Map stakeholders, decision rights, influence and blockers from supplied evidence. Use when ownership is unclear or the stakeholder landscape changes.",
    "inputMode": "context"
  },
  {
    "name": "earn-trust",
    "method": "earn-trust",
    "group": "Start",
    "result": "A plan for access, credibility and permitted AI use.",
    "description": "Plan how to earn customer trust and appropriate access. Use when credibility, permissions or AI policy constrain the engagement.",
    "inputMode": "context"
  },
  {
    "name": "discover",
    "method": "discover",
    "description": "Trace a customer workflow and identify the problem, baseline and evidence gaps. Use for discovery or an unclear customer brief, before choosing a solution.",
    "group": "Discover",
    "result": "A workflow diagnosis with baseline and evidence gaps.",
    "inputMode": "context"
  },
  {
    "name": "test-assumptions",
    "method": "test-assumptions",
    "group": "Discover",
    "result": "A ranked set of assumptions and ways to test them.",
    "description": "Challenge a proposed solution by identifying and testing consequential assumptions. Use when the brief feels too certain or discovery reveals contradictions.",
    "inputMode": "context"
  },
  {
    "name": "score-use-cases",
    "method": "score-use-cases",
    "group": "Discover",
    "result": "A ranked use-case shortlist with evidence and trade-offs.",
    "description": "Compare competing customer use cases by value, feasibility and evidence. Use when several problems compete for delivery capacity.",
    "inputMode": "context"
  },
  {
    "name": "poc",
    "method": "poc",
    "description": "Run a bounded customer proof of concept to test a consequential uncertainty. Use for a spike or pilot with a question and decision deadline, not a full rollout.",
    "group": "Discover",
    "result": "A bounded experiment with evidence and a decision.",
    "inputMode": "context"
  },
  {
    "name": "scope",
    "method": "hold-scope",
    "description": "Assess a new customer request against agreed scope, trade-offs and ownership. Use when an engagement expands or a custom feature needs a commitment decision.",
    "group": "Plan",
    "result": "A scope decision with trade-offs and ownership.",
    "inputMode": "context"
  },
  {
    "name": "options",
    "method": "three-options",
    "description": "Compare feasible approaches to a customer problem and recommend a path with costs, constraints and evidence. Use for an architecture or delivery decision, not implementation.",
    "group": "Plan",
    "result": "Compared approaches and an evidence-backed recommendation.",
    "inputMode": "context"
  },
  {
    "name": "plan",
    "method": "plan",
    "group": "Plan",
    "result": "A sequenced delivery plan with owners and acceptance checks.",
    "description": "Sequence an understood outcome into verifiable delivery slices with dependencies, ownership and acceptance checks. Use for delivery planning, estimation or migration strategy.",
    "inputMode": "context"
  },
  {
    "name": "business-case",
    "method": "business-case",
    "group": "Plan",
    "result": "An evidence-backed investment case with explicit assumptions.",
    "description": "Develop a business case for an initiative using costs, benefits, risks and evidence. Use when a sponsor needs budget or timeline justification.",
    "inputMode": "context"
  },
  {
    "name": "prioritize",
    "method": "pick-three",
    "group": "Plan",
    "result": "Three immediate priorities and explicit deferrals.",
    "description": "Choose up to three immediate priorities from competing initiatives. Use when everything is urgent and the customer needs a defensible order with explicit deferrals.",
    "inputMode": "context"
  },
  {
    "name": "red-team",
    "method": "red-team",
    "group": "Plan",
    "result": "A critique of weak claims, failure modes and corrective actions.",
    "description": "Stress-test a plan, brief or delivery claim against evidence and plausible failure modes. Use when the user asks for a red team or preparation for a consequential decision.",
    "inputMode": "context"
  },
  {
    "name": "build",
    "method": "build",
    "description": "Implement a scoped software change for a customer and verify its behavior. Use for delivery work with an understood outcome, not incident response.",
    "group": "Build and verify",
    "result": "An implemented change with verification evidence.",
    "inputMode": "context"
  },
  {
    "name": "integrate",
    "method": "integrate",
    "description": "Build or change a customer-system integration with explicit data mapping, permissions, retries and reconciliation. Use for connectors, imports, write-back and upstream APIs.",
    "group": "Build and verify",
    "result": "An integration with tested mapping and failure handling.",
    "inputMode": "context"
  },
  {
    "name": "debug",
    "method": "debug",
    "description": "Investigate a failure, regression or incorrect result in an integration or application, even before it can be reproduced. Use for diagnosis and repair; follow incident authority for live mitigation.",
    "group": "Build and verify",
    "result": "A diagnosed failure, repair and regression evidence.",
    "inputMode": "context"
  },
  {
    "name": "review",
    "method": "review",
    "description": "Review a proposed customer code change against its intended outcome and operational risks. Use for a diff or PR review; report evidence and actionable findings.",
    "group": "Build and verify",
    "result": "Actionable findings tied to the intended outcome.",
    "inputMode": "context"
  },
  {
    "name": "evaluate",
    "method": "eval-pack",
    "description": "Evaluate an AI workflow against representative cases and its permitted actions. Use for model, retrieval or agent evaluation; tests do not grant release authority.",
    "group": "Build and verify",
    "result": "Evaluation results, failure analysis and release evidence.",
    "inputMode": "context"
  },
  {
    "name": "qa",
    "method": "qa",
    "description": "Exercise the delivered customer journey using real runtime or browser evidence. Use for functional acceptance testing after implementation, including failure paths.",
    "group": "Build and verify",
    "result": "Customer-journey evidence and acceptance gaps.",
    "inputMode": "context"
  },
  {
    "name": "what-breaks",
    "method": "what-breaks",
    "group": "Build and verify",
    "result": "A blast-radius assessment and mitigation plan.",
    "description": "Assess the impact of a proposed change on dependencies and shared infrastructure. Use before touching unfamiliar or consequential systems.",
    "inputMode": "context"
  },
  {
    "name": "rollback",
    "method": "rollback",
    "group": "Build and verify",
    "result": "A rollback drill with recovery evidence and remaining gaps.",
    "description": "Prepare and rehearse a recovery path for an intended release. Use when rollback is assumed, untested or previously failed; follow the environment authority for any drill.",
    "inputMode": "context"
  },
  {
    "name": "ship",
    "method": "ship",
    "description": "Prepare or execute an authorized controlled release with verified checks, recovery and an operating owner. Use when a customer increment is ready for deployment.",
    "group": "Build and verify",
    "result": "A controlled release result with recovery and ownership.",
    "inputMode": "context"
  },
  {
    "name": "readout",
    "method": "readout",
    "description": "Prepare a sponsor update separating promised outcomes, measured results and customer acceptance. Use for progress readouts or defending a delivery claim.",
    "group": "Report",
    "result": "A sponsor update separating promises, results and acceptance.",
    "inputMode": "context"
  },
  {
    "name": "demo-prep",
    "method": "demo-prep",
    "group": "Report",
    "result": "A demo narrative, rehearsal plan and failure fallback.",
    "description": "Prepare a customer demo or executive walkthrough around an evidenced outcome. Use before show-and-tell to rehearse the journey and prepare a fallback.",
    "inputMode": "context"
  },
  {
    "name": "debrief",
    "method": "debrief",
    "group": "Report",
    "result": "A sourced meeting summary with decisions and next actions.",
    "description": "Turn meeting notes or a transcript into sourced decisions, changes and next actions. Use after a customer conversation; review consequential record updates before saving.",
    "inputMode": "context"
  },
  {
    "name": "board-memo",
    "method": "board-memo",
    "group": "Report",
    "result": "An executive memo separating evidence, risk and decisions.",
    "description": "Draft a board or executive summary of an engagement using outcomes, risks and investment decisions. Use when the sponsor needs to brief senior leadership.",
    "inputMode": "context"
  },
  {
    "name": "rescue",
    "method": "rescue",
    "group": "Operate",
    "result": "A recovery plan and evidence of authorized mitigation.",
    "description": "Triage an outage, loss of stakeholder trust or a failing engagement direction. Use for urgent recovery; distinguish diagnosis from authorized production mitigation.",
    "inputMode": "context"
  },
  {
    "name": "dashboard",
    "method": "dashboard",
    "group": "Operate",
    "result": "A portfolio view of engagement status and attention needed.",
    "description": "Review the portfolio across existing engagement records. Use for status across customers; requires accessible permitted records and does not create missing client histories.",
    "inputMode": "records"
  },
  {
    "name": "switch-clients",
    "method": "switch-clients",
    "group": "Operate",
    "result": "A refreshed client binding and cross-client triage.",
    "description": "Switch between existing customer engagements and triage competing needs. Use when context switching causes confusion; requires engagement records and preserves one client per write.",
    "inputMode": "records"
  },
  {
    "name": "runbook",
    "method": "runbook",
    "group": "Operate",
    "result": "An operating runbook with recovery steps and ownership.",
    "description": "Write an operating runbook from the delivered system and verified procedures. Use when the customer team or a successor needs to operate without the original engineer.",
    "inputMode": "context"
  },
  {
    "name": "handoff",
    "method": "close",
    "description": "Transfer operation of a customer deployment with ownership, evidence and a tested support path. Use for handoff or an engineer rotation, not merely code delivery.",
    "group": "Operate",
    "result": "An operating handoff with ownership and a support path.",
    "inputMode": "context"
  },
  {
    "name": "feedback",
    "method": "encode-pattern",
    "description": "Assess a field lesson for reuse or product feedback without exposing customer context. Use for recurring deployment lessons; distinguish a hypothesis from a validated pattern.",
    "group": "Operate",
    "result": "A reusable field lesson with evidence and privacy boundaries.",
    "inputMode": "context"
  },
  {
    "name": "connect",
    "method": "connect",
    "group": "Operate",
    "result": "Source setup guidance and an honest capability check.",
    "description": "Configure or diagnose access to a requested source using available host tools. Use for source MCP setup; source configuration needs no engagement record and credentials stay with the host.",
    "inputMode": "source"
  },
  {
    "name": "ingest",
    "method": "ingest",
    "group": "Operate",
    "result": "Sourced proposed updates, with confirmed record application when bound.",
    "description": "Fetch requested source material and prepare sourced engagement updates. Use to catch up from external notes or messages; applying updates requires a bound record and confirmation.",
    "inputMode": "record-write"
  }
]
