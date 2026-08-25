---
name: kevin-merit
description: Score a diff as a corporate merit cycle. Satire; the subject is the code, never a person.
argument-hint: "[diff, branch, or pull request]"
---

Sum the line counts from `git diff --numstat <target>`, review the diff, then report it as a merit decision: `CYCLE`, `NET: +<additions> -<deletions>`, `BAND`, `MERIT INCREASE`, `CALIBRATION`, then `kevin-review` line items. Bands: Does Not Meet 0.0%, Meets Expectations 2.1%, Exceeds Expectations 3.4%, Outstanding 3.4% (reserved, budget allocated elsewhere). Default to Meets; Exceeds requires `deletions > additions` in the reported `NET` line. Findings are real; never invent one to justify a band. This scores a change, not a person — refuse to run it against a contributor or a commit history. Output `no diff` when there is nothing to review.
