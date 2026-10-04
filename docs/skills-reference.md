# FDEOps skills

**35 task skills + one coordinator, `fde` = 36 installable skills.**

Every task below can be installed and used directly. Ask `fde` to select the relevant skills when working across a customer project. The groups help you find a task; they are not required phases.

Install a task with `npx skills add suboss87/fdeops --skill <name>`, replacing `<name>` with its catalog name. See [installation](install.md#individual-skills-and-the-full-pack) for the full pack and host-specific invocation.

Customer records live at `~/fde-engagements/<customer>/.fde/`. A skill provides instructions, not customer credentials or infrastructure. Drafting from supplied notes does not need a customer record. Viewing records does; staging or saving requires the intended customer and applicable confirmation.

## Start

| Skill | Use it when | Result | Input needed |
|---|---|---|---|
| [brief](../skills/brief/SKILL.md) | Clarify a new customer brief, desired outcome, constraints and evidence gaps. Use for kickoff or a first meeting; do not repeat discovery already supplied. | A grounded brief with success criteria and open questions. | Supplied notes, code or evidence |
| [audit](../skills/audit/SKILL.md) | Audit an inherited engagement or implementation against its evidence. Use when taking over work or joining mid-project; distinguish verified facts from inherited claims. | An audit of inherited claims and takeover risks. | Supplied notes, code or evidence |
| [who-decides](../skills/who-decides/SKILL.md) | Map stakeholders, decision rights, influence and blockers from supplied evidence. Use when ownership is unclear or the stakeholder landscape changes. | A stakeholder map with decision rights and unknowns. | Supplied notes, code or evidence |
| [earn-trust](../skills/earn-trust/SKILL.md) | Plan how to earn customer trust and appropriate access. Use when credibility, permissions or AI policy constrain the engagement. | A plan for access, credibility and permitted AI use. | Supplied notes, code or evidence |

## Discover

| Skill | Use it when | Result | Input needed |
|---|---|---|---|
| [discover](../skills/discover/SKILL.md) | Trace a customer workflow and identify the problem, baseline and evidence gaps. Use for discovery or an unclear customer brief, before choosing a solution. | A workflow diagnosis with baseline and evidence gaps. | Supplied notes, code or evidence |
| [test-assumptions](../skills/test-assumptions/SKILL.md) | Challenge a proposed solution by identifying and testing consequential assumptions. Use when the brief feels too certain or discovery reveals contradictions. | A ranked set of assumptions and ways to test them. | Supplied notes, code or evidence |
| [score-use-cases](../skills/score-use-cases/SKILL.md) | Compare competing customer use cases by value, feasibility and evidence. Use when several problems compete for delivery capacity. | A ranked use-case shortlist with evidence and trade-offs. | Supplied notes, code or evidence |
| [poc](../skills/poc/SKILL.md) | Run a bounded customer proof of concept to test a consequential uncertainty. Use for a spike or pilot with a question and decision deadline, not a full rollout. | A bounded experiment with evidence and a decision. | Supplied notes, code or evidence |

## Plan

| Skill | Use it when | Result | Input needed |
|---|---|---|---|
| [scope](../skills/scope/SKILL.md) | Assess a new customer request against agreed scope, trade-offs and ownership. Use when an engagement expands or a custom feature needs a commitment decision. | A scope decision with trade-offs and ownership. | Supplied notes, code or evidence |
| [options](../skills/options/SKILL.md) | Compare feasible approaches to a customer problem and recommend a path with costs, constraints and evidence. Use for an architecture or delivery decision, not implementation. | Compared approaches and an evidence-backed recommendation. | Supplied notes, code or evidence |
| [plan](../skills/plan/SKILL.md) | Sequence an understood outcome into verifiable delivery slices with dependencies, ownership and acceptance checks. Use for delivery planning, estimation or migration strategy. | A sequenced delivery plan with owners and acceptance checks. | Supplied notes, code or evidence |
| [business-case](../skills/business-case/SKILL.md) | Develop a business case for an initiative using costs, benefits, risks and evidence. Use when a sponsor needs budget or timeline justification. | An evidence-backed investment case with explicit assumptions. | Supplied notes, code or evidence |
| [prioritize](../skills/prioritize/SKILL.md) | Choose up to three immediate priorities from competing initiatives. Use when everything is urgent and the customer needs a defensible order with explicit deferrals. | Three immediate priorities and explicit deferrals. | Supplied notes, code or evidence |
| [red-team](../skills/red-team/SKILL.md) | Stress-test a plan, brief or delivery claim against evidence and plausible failure modes. Use when the user asks for a red team or preparation for a consequential decision. | A critique of weak claims, failure modes and corrective actions. | Supplied notes, code or evidence |

## Build and verify

| Skill | Use it when | Result | Input needed |
|---|---|---|---|
| [build](../skills/build/SKILL.md) | Implement a scoped software change for a customer and verify its behavior. Use for delivery work with an understood outcome, not incident response. | An implemented change with verification evidence. | Supplied notes, code or evidence |
| [integrate](../skills/integrate/SKILL.md) | Build or change a customer-system integration with explicit data mapping, permissions, retries and reconciliation. Use for connectors, imports, write-back and upstream APIs. | An integration with tested mapping and failure handling. | Supplied notes, code or evidence |
| [debug](../skills/debug/SKILL.md) | Investigate a failure, regression or incorrect result in an integration or application, even before it can be reproduced. Use for diagnosis and repair; follow incident authority for live mitigation. | A diagnosed failure, repair and regression evidence. | Supplied notes, code or evidence |
| [review](../skills/review/SKILL.md) | Review a proposed customer code change against its intended outcome and operational risks. Use for a diff or PR review; report evidence and actionable findings. | Actionable findings tied to the intended outcome. | Supplied notes, code or evidence |
| [evaluate](../skills/evaluate/SKILL.md) | Evaluate an AI workflow against representative cases and its permitted actions. Use for model, retrieval or agent evaluation; tests do not grant release authority. | Evaluation results, failure analysis and release evidence. | Supplied notes, code or evidence |
| [qa](../skills/qa/SKILL.md) | Exercise the delivered customer journey using real runtime or browser evidence. Use for functional acceptance testing after implementation, including failure paths. | Customer-journey evidence and acceptance gaps. | Supplied notes, code or evidence |
| [what-breaks](../skills/what-breaks/SKILL.md) | Assess the impact of a proposed change on dependencies and shared infrastructure. Use before touching unfamiliar or consequential systems. | A blast-radius assessment and mitigation plan. | Supplied notes, code or evidence |
| [rollback](../skills/rollback/SKILL.md) | Prepare and rehearse a recovery path for an intended release. Use when rollback is assumed, untested or previously failed; follow the environment authority for any drill. | A rollback drill with recovery evidence and remaining gaps. | Supplied notes, code or evidence |
| [ship](../skills/ship/SKILL.md) | Prepare or execute an authorized controlled release with verified checks, recovery and an operating owner. Use when a customer increment is ready for deployment. | A controlled release result with recovery and ownership. | Supplied notes, code or evidence |

## Report

| Skill | Use it when | Result | Input needed |
|---|---|---|---|
| [readout](../skills/readout/SKILL.md) | Prepare a sponsor update separating promised outcomes, measured results and customer acceptance. Use for progress readouts or defending a delivery claim. | A sponsor update separating promises, results and acceptance. | Supplied notes, code or evidence |
| [demo-prep](../skills/demo-prep/SKILL.md) | Prepare a customer demo or executive walkthrough around an evidenced outcome. Use before show-and-tell to rehearse the journey and prepare a fallback. | A demo narrative, rehearsal plan and failure fallback. | Supplied notes, code or evidence |
| [debrief](../skills/debrief/SKILL.md) | Turn meeting notes or a transcript into sourced decisions, changes and next actions. Use after a customer conversation; review consequential record updates before saving. | A sourced meeting summary with decisions and next actions. | Supplied notes, code or evidence |
| [board-memo](../skills/board-memo/SKILL.md) | Draft a board or executive summary of an engagement using outcomes, risks and investment decisions. Use when the sponsor needs to brief senior leadership. | An executive memo separating evidence, risk and decisions. | Supplied notes, code or evidence |

## Operate

| Skill | Use it when | Result | Input needed |
|---|---|---|---|
| [rescue](../skills/rescue/SKILL.md) | Triage an outage, loss of stakeholder trust or a failing engagement direction. Use for urgent recovery; distinguish diagnosis from authorized production mitigation. | A recovery plan and evidence of authorized mitigation. | Supplied notes, code or evidence |
| [dashboard](../skills/dashboard/SKILL.md) | Review the portfolio across existing engagement records. Use for status across customers; requires accessible permitted records and does not create missing client histories. | A portfolio view of engagement status and attention needed. | Existing customer records + CLI |
| [switch-clients](../skills/switch-clients/SKILL.md) | Switch between existing customer engagements and triage competing needs. Use when context switching causes confusion; requires engagement records and preserves one client per write. | A refreshed client binding and cross-client triage. | Existing customer records + CLI |
| [runbook](../skills/runbook/SKILL.md) | Write an operating runbook from the delivered system and verified procedures. Use when the customer team or a successor needs to operate without the original engineer. | An operating runbook with recovery steps and ownership. | Supplied notes, code or evidence |
| [handoff](../skills/handoff/SKILL.md) | Transfer operation of a customer deployment with ownership, evidence and a tested support path. Use for handoff or an engineer rotation, not merely code delivery. | An operating handoff with ownership and a support path. | Supplied notes, code or evidence |
| [feedback](../skills/feedback/SKILL.md) | Assess a field lesson for reuse or product feedback without exposing customer context. Use for recurring deployment lessons; distinguish a hypothesis from a validated pattern. | A reusable field lesson with evidence and privacy boundaries. | Supplied notes, code or evidence |
| [connect](../skills/connect/SKILL.md) | Configure or diagnose access to a requested source using available host tools. Use for source MCP setup; source configuration needs no engagement record and credentials stay with the host. | Source setup guidance and an honest capability check. | Host source tools or setup documentation |
| [ingest](../skills/ingest/SKILL.md) | Fetch requested source material and prepare sourced engagement updates. Use to catch up from external notes or messages; applying updates requires a bound record and confirmation. | Sourced proposed updates, with confirmed record application when bound. | Notes or source tools; selected record for staging/saving |

## Domain guidance

The skills can apply supporting guidance for AI systems, financial services, healthcare, government work and customer-facing artifacts when relevant. These references are included instructions, not additional installable skills or a substitute for the responsible specialists.

[Starting examples](skills.md) · [Customer records](schema.md) · [Verification and limits](verification.md)
