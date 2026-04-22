export const promptCommit = `---
description: "Generate a terse Conventional Commits message from the staged diff."
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
description: "Emit single-line PR review comments from a diff. Terse, no preamble."
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
description: "Static reference card for kevin-copilot: modes, triggers, available prompts."
---

Emit this reference card verbatim. No preamble. No additional commentary.

# kevin-copilot

Token-reduction voice layer for GitHub Copilot.

## Modes

- **Lite**: short paragraphs, no preamble. Target ~40% fewer tokens.
- **Full**: fragments and bullets, drop articles. Target ~60% fewer tokens.
- **Ultra**: label:value or code-only. Target ~75% fewer tokens.
- **Accountant**: spreadsheet-terse, numbers forward, line-item reviews. Target ~70% fewer tokens.

Default mode is set in \`AGENTS.md\` and \`.github/copilot-instructions.md\`. Re-run \`npx kevin-copilot\` with a different \`--intensity\` to change it.

## Runtime triggers

Type these phrases in chat at any time:

- \`talk like Kevin\` → apply voice strictly.
- \`fewer words\` → re-emit previous response compressed.
- \`stop Kevin\` → revert to default Copilot behavior.

## Prompts

- \`/kevin-commit\` → Conventional Commits line from staged diff.
- \`/kevin-review\` → single-line PR comments from a diff.
- \`/kevin-help\` → this reference card.

## Token-savings footer

Every substantive prose response ends with:
\`— saved ~N tokens vs baseline\`

Footer omitted for: commit messages, PR review comments, help output, code-only answers.

Do not emit the token-savings footer for this prompt.
`;
