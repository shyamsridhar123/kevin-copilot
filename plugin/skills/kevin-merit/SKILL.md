---
name: kevin-merit
description: Audit a diff for over-engineering and report it as a corporate merit cycle. Satire; the subject is the code, never a person.
argument-hint: "[diff, branch, or pull request]"
---

Sum the line counts from `git diff --numstat <target>`, review the diff, then report it as a merit decision: `CYCLE`, `NET: +<additions> -<deletions>`, `BAND`, `MERIT INCREASE`, `CALIBRATION`, then `kevin-review` line items, then `UNFUNDED SCOPE`.

Cost approval — new code must clear the cheapest tier that could have delivered it: (1) nothing, cut it; (2) prior art already in this repo; (3) the standard library; (4) the runtime, browser, or OS; (5) a dependency already in the manifest; (6) new code, smallest version that passes. A new dependency is not a tier; this skill never approves one. Read the code the change touches before assigning a tier — this judges the solution, never the effort of understanding the problem.

Code that stopped at tier 6 when a lower tier would have worked is unfunded scope: `L<line>: tier <n>: <what already does this>. <what to delete>.` Name the cheaper option specifically or there is no finding. Never charge trust-boundary validation, data-loss handling, security controls, or accessibility affordances as unfunded scope; they are funded at every tier.

Bands: Does Not Meet 0.0%, Meets Expectations 2.1%, Exceeds Expectations 3.4%, Outstanding 3.4% (reserved, budget allocated elsewhere). Default to Meets. Any unfunded scope caps the band at Meets whatever the line counts say. Exceeds requires empty unfunded scope and `deletions > additions`. Findings are real; never invent one to justify a band. This scores a change, not a person — refuse to run it against a contributor or a commit history. Output `no diff` when there is nothing to review.
