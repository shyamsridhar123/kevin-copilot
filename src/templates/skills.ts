export type SkillName =
  | "kevin-compress"
  | "kevin-commit"
  | "kevin-review"
  | "kevin-merit"
  | "kevin-help";

export const skills: Record<SkillName, string> = {
  "kevin-compress": `---
name: kevin-compress
description: Compress an existing answer without losing required information or safety warnings.
argument-hint: "[text or answer to compress]"
---

Compress the supplied text or the previous response.

- Remove preambles, repetition, hedging, filler, and closing remarks.
- Preserve facts, commands, paths, constraints, and required safety warnings.
- Prefer code, fragments, bullets, or label:value output where appropriate.
- Do not claim a token saving unless measured data is supplied.
- Return only the compressed result.
`,
  "kevin-commit": `---
name: kevin-commit
description: Generate a terse Conventional Commits message from the staged diff.
argument-hint: "[optional focus]"
---

Read the staged diff. Output one Conventional Commits line.

- Use \`<type>(<scope>): <imperative summary>\`.
- Keep the summary under 60 characters with no trailing period.
- Omit scope when changes cross scopes.
- Never invent changes absent from the diff.
- If there are no staged changes, output \`no staged changes\`.
`,
  "kevin-review": `---
name: kevin-review
description: Review a diff and emit concise, evidence-backed findings.
argument-hint: "[diff, branch, or pull request]"
---

Review the requested diff. Report only actionable findings.

- Use \`L<line>: <kind>: <issue>. <fix>.\`.
- Kinds: bug, performance, security, reliability, or maintainability.
- Cite new-file line numbers.
- Do not include praise, a preamble, or unsupported findings.
- Output \`lgtm\` when there are no findings.
`,
  "kevin-merit": `---
name: kevin-merit
description: Audit a diff for over-engineering and report it as a corporate merit cycle. Satire; the subject is the code, never a person.
argument-hint: "[diff, branch, or pull request]"
---

Review the requested diff, then report it as a merit-increase decision. The findings are real; the ceremony around them is the joke. Never invent a finding to justify a band.

Get the line counts from \`git diff --numstat <target>\` and sum them. The band follows from those numbers, not from an impression of the diff.

## Cost approval

Every line added is a line the organization now funds forever. Each new block of code has to clear the cheapest tier that could have delivered it. Read the code the change touches before assigning a tier — this judges the solution, never the effort of understanding the problem.

1. **Nothing.** The requirement does not exist, or the diff is the only thing asking for it. Cut it.
2. **Prior art in this repo.** Something here already does this. Call it instead of writing a second one.
3. **The language.** The standard library does this.
4. **The platform.** The runtime, browser, or OS does this natively.
5. **An approved dependency.** Something already in the manifest does this.
6. **New code.** The smallest version that passes. Only after 1 through 5 fail.

A new dependency is not a tier. It is a request, and this skill never approves one.

Code that stopped at tier 6 when a lower tier would have worked is \`UNFUNDED SCOPE\`: shipped, unbudgeted, and now permanent. Report it as \`L<line>: tier <n>: <what already does this>. <what to delete>.\` and cite the specific stdlib call, existing function, or platform feature by name. If you cannot name the cheaper option, there is no finding.

Never charge a safety floor as unfunded scope. Trust-boundary validation, data-loss handling, security controls, and accessibility affordances are funded at every tier.

Output exactly:

\`\`\`text
CYCLE: <branch or diff label>
NET: +<additions> -<deletions>
BAND: <band>
MERIT INCREASE: <allotted percent>
CALIBRATION: <one sentence on why the band held>
LINE ITEMS:
L<line>: <kind>: <issue>. <fix>.
UNFUNDED SCOPE:
L<line>: tier <n>: <what already does this>. <what to delete>.
\`\`\`

| Band | Increase | When |
|---|---|---|
| Does Not Meet | 0.0% | Broken, unsafe, or ships nothing. |
| Meets Expectations | 2.1% | It works. This is most diffs. |
| Exceeds Expectations | 3.4% | Clean scope and deletions exceed additions. |
| Outstanding | 3.4% | Reserved. Budget was allocated elsewhere. |

- Default to Meets Expectations.
- Any unfunded scope caps the band at Meets Expectations, whatever the line counts say.
- Exceeds requires an empty \`UNFUNDED SCOPE\` section and \`deletions > additions\` in the reported \`NET\` line.
- Outstanding pays the Exceeds rate. State that in one line and do not explain it.
- Line items reuse the \`kevin-review\` format and kinds. Omit either section when it is empty.
- Keep calibration to one flat corporate sentence. Never reference people, employers, shows, or real companies.
- This scores a change, not a person. Refuse to run it against a contributor, an author, or a commit history.
- Output \`no diff\` when there is nothing to review.
`,
  "kevin-help": `---
name: kevin-help
description: Show the Kevin modes, commands, and runtime controls.
---

Show a compact reference for:

- Modes: Lite, Full, Ultra, ADHD, Accountant.
- Skills: kevin-compress, kevin-commit, kevin-review, kevin-merit, kevin-help.
- Runtime controls: "fewer words", "stop Kevin", "adhd mode", and "normal mode".
- CLI debugging: use \`/instructions\` to inspect or temporarily disable instructions.
- Do not add token-saving estimates.
`,
};
