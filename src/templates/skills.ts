export type SkillName = "kevin-compress" | "kevin-commit" | "kevin-review" | "kevin-help";

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
  "kevin-help": `---
name: kevin-help
description: Show the Kevin modes, commands, and runtime controls.
---

Show a compact reference for:

- Modes: Lite, Full, Ultra, ADHD, Accountant.
- Skills: kevin-compress, kevin-commit, kevin-review, kevin-help.
- Runtime controls: "fewer words", "stop Kevin", "adhd mode", and "normal mode".
- CLI debugging: use \`/instructions\` to inspect or temporarily disable instructions.
- Do not add token-saving estimates.
`,
};
