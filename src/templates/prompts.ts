export const promptCommit = `---
name: kevin-commit
description: "Generate a terse Conventional Commits message from the staged diff."
argument-hint: "[optional focus; staged diff is read automatically]"
agent: agent
---

Read the staged changes. Output a single Conventional Commits line.

Rules:
- Form: \`<type>(<scope>): <imperative summary>\`
- Types: feat, fix, refactor, docs, test, chore, perf, ci, build, style.
- Summary: under 60 characters. Imperative mood. No trailing period.
- Omit scope if changes cross scopes.
- No body unless the diff is non-obvious. If a body is needed: one short paragraph, no filler.
- No preamble. No "Here is". Emit the commit line only.
- If the diff is empty, reply: \`no staged changes\`.
- Never invent changes not present in the diff.
`;

export const promptReview = `---
name: kevin-review
description: "Emit single-line PR review comments from a diff. Terse, no preamble."
argument-hint: "[diff, branch, or pull request]"
agent: agent
---

Read the diff. Emit one comment per real finding, one per line.

Form: \`L<line>: <kind>: <issue>. <fix>.\`

Rules:
- Kind is one of: bug, perf, style, security, naming.
- One finding per line. No multi-line explanations.
- Cite the line number from the diff (new-file side).
- No preamble. No "Here are the comments". No sign-off.
- No praise. No hedging ("might", "perhaps", "consider maybe").
- If no real issues, reply exactly: \`lgtm\`.
- Never invent findings not supported by the diff.
- Correctness wins: if a fix requires more than a fragment, keep the fix terse but complete.
- Do not emit the token-savings footer for this prompt.
`;

export const promptHelp = `---
name: kevin-help
description: "Static reference card for kevin-copilot: modes, triggers, available prompts."
argument-hint: "[optional topic]"
agent: ask
---

Emit this reference card verbatim. No preamble. No additional commentary.

# kevin-copilot

Token-reduction voice layer for GitHub Copilot.

## Modes

- **Lite**: short paragraphs, no preamble.
- **Full**: fragments and bullets, drop articles.
- **Ultra**: label:value or code-only.
- **ADHD**: action-first, numbered steps, concrete next actions. Target clarity over prose.
- **Accountant**: spreadsheet-terse, numbers forward, line-item reviews.

Default project mode is set in \`.github/copilot-instructions.md\`. Re-run \`npx kevin-copilot init\` with a different \`--intensity\` to change it.

## Runtime triggers

Type these phrases in chat at any time:

- \`talk like Kevin\` → apply voice strictly.
- \`fewer words\` → re-emit previous response compressed.
- \`stop Kevin\` → revert to default Copilot behavior.
- \`adhd mode\` or \`i have adhd\` → switch to ADHD output shape.
- \`stop adhd mode\` or \`normal mode\` → leave ADHD output shape.

## Prompts

- \`/kevin-commit\` → Conventional Commits line from staged diff.
- \`/kevin-review\` → single-line PR comments from a diff.
- \`/kevin-help\` → this reference card.

The token receipt is disabled by default because model estimates are not measurements.
`;
