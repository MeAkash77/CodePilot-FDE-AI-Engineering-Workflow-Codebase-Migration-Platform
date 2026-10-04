# Insurance KYC review: handover draft

Illustrative preparation, not an approved operating procedure. No customer deployment or acceptance is claimed.

## Built and checked locally

`kyc-review.js` turns synthetic extracted name and birth-date fields into a review summary. Missing, unreadable or mismatched fields are flagged. Every result needs a reviewer; no KYC approval is automated. Six local tests pass. Model extraction and identity verification are outside this fixture.

## Before a pilot

- IT confirms the approved model, permitted samples, access boundaries and review-screen integration.
- Compliance agrees the review checks and tests model output against approved examples.
- Operations records current review time, rework and the pilot comparison plan.
- Name the pilot team, support owner and person authorised to approve rollout.
- Rehearse stopping the AI step and returning to manual document review.
- Give reviewers the operating instructions and verify they can use them.

Next: customer testing. These approvals, integrations, measurements and operating checks remain pending.
