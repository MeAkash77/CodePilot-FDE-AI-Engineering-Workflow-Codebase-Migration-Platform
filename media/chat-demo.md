# FDEOps: insurance KYC and a healthcare client

An illustrative terminal conversation follows an insurer's know-your-customer (KYC) document-review project. Operations wants less manual work; Compliance retains approval; IT controls model access. Mid-build, the engineer switches to a healthcare client's intake meeting, then resumes the insurance work.

The conversation is authored and animated, not captured from a live customer engagement. Names, stakeholder decisions, saved-session responses and handover are illustrative.

## Conversation

**Workshop**

> @fde Insurer workshop: Ops wants faster ID checks. Compliance must approve every case.

Agreed: AI prepares the document review; Compliance makes the decision. First, measure the time reviewers spend.

**Scope**

> Their CTO approved the internal model. Start with synthetic IDs and the existing review screen.

First build: extract ID fields, flag missing or conflicting details, and prepare a review. No automatic customer approval.

**Build**

> Build the review step. Keep it inside their current system.

Added kyc-review.js: turns extracted fields into a reviewer summary. Missing or conflicting details get flagged. Tests are next.

**Switch customer**

> @fde Save this. Healthcare client call now: IT has not approved access to patient records.

KYC saved: review step built; tests next. Healthcare: use synthetic intake forms. Ask IT who owns access approval and when.

**Resume and test**

> @fde Back to insurance. Pick up the tests.

Resumed from the saved step. 6/6 local checks pass: complete, missing, unreadable and conflicting fields. Every case still needs a reviewer.

**Rollout decision**

> Can Ops start using it?

Not yet. Test their model and review screen with approved samples. Compliance signs off before a pilot with one team.

**Handover preparation**

> Prepare the handover for Ops and IT.

Draft ready: reviewer steps, support owner and manual fallback. Next: customer testing, then compare review time with the baseline.

## What the local evidence establishes

The included review function passes six tests using synthetic extracted fields. It flags missing, unreadable or mismatched information and always requires a reviewer. Unexpected model-output approval fields cannot change that status. It does not call an AI model, read identity documents, verify identity, establish regulatory compliance or connect to a customer system. Model quality, permissions, the review-screen integration and business results are untested.

The healthcare switch illustrates using a separate engagement record while insurance work is paused. This animation does not itself test cross-client isolation or session recovery. No patient records are used.

```bash
node --test media/workday-fixture/kyc-review.test.js
```

Render with Pillow and a monospace font:

```bash
python3 media/render-chat-demo.py --font /path/to/monospace.ttf
```

[Scene source](chat-demo.json) · [Still image](chat-demo.png) · [Handover draft](workday-fixture/handover-draft.md) · [CLI recording](../docs/USAGE.md)
