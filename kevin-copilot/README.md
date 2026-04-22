# kevin-copilot

Terse-by-default Copilot voice kit. One `npx` call drops the instructions, chat modes, and a commit prompt into your repo.

**Kevin is a label, not a character.** No references to any TV show, person, or fictional company. Correctness always wins over style.

## Install

```
npx kevin-copilot init
```

Or with explicit intensity:

```
npx kevin-copilot init --intensity full
```

## What it writes

```
AGENTS.md
.github/
  copilot-instructions.md
  chatmodes/
    kevin-lite.chatmode.md
    kevin-full.chatmode.md
    kevin-ultra.chatmode.md
  prompts/
    kevin-commit.prompt.md
    kevin-review.prompt.md
    kevin-help.prompt.md
```

## Response footer

Every substantive prose reply ends with one line:

```
— saved ~N tokens vs baseline
```

Best estimate, no calculation required. Omitted for: commit messages, PR review comments, help output, and code-only answers.

## Intensities

| Level | Voice |
|-------|-------|
| `lite` (default) | Short paragraphs. No preamble or closing filler. Under ~120 words. |
| `full` | Fragments and bullets. Drop articles. Under ~60 words. |
| `ultra` | `label: value` or code-only. Under ~25 words. |

You can change modes at any time — just re-run `init` with a different `--intensity` and pass `--force` or `--merge`.

## Flags

| Flag | Effect |
|------|--------|
| `--target <dir>` | Where to write. Default: `.` |
| `--intensity lite\|full\|ultra` | Voice level. Default: `lite` |
| `--force` | Overwrite on conflict. |
| `--merge` | Append Kevin section between sentinel markers in existing `AGENTS.md` / `.github/copilot-instructions.md`. Idempotent. |
| `--dry-run` | Print planned writes, touch nothing. |

`--force` and `--merge` are mutually exclusive.

## Trigger phrases

Inside Copilot Chat you can steer runtime tone:

- `talk like Kevin` — engage the voice rules even if the current chat mode is default.
- `fewer words` — step down one level (lite → full → ultra).
- `stop Kevin` — drop back to default Copilot voice for this thread.

## Why

Default Copilot answers lean on preamble, hedging, and closing filler that you paid tokens for and didn't want. Kevin rewrites the house style without touching correctness. Response tokens drop, you read faster, context budget lasts longer.

Measured via a three-arm eval — `baseline`, `generic_terse` (terse but no Kevin rules, as a control), and each Kevin mode — across a 10-prompt internal suite. Kevin must clear both an absolute reduction threshold (lite ≥40%, full ≥60%, ultra ≥75%) and beat the `generic_terse` control by ≥5pp. See `evals/report.md` in the source repo.

## License

MIT.
