<div align="center">

# kevin-copilot

<img src="./media/kevin.gif" alt="Kevin Malone — Why waste time say lot word when few word do trick" width="480" />

**Make GitHub Copilot talk like Kevin.**
*VS Code Chat, Copilot CLI, cloud agent, code review — every response, not just chat.*
*One command. Measured 40–75% fewer response tokens. Zero hit to correctness.*

[![npm](https://img.shields.io/npm/v/kevin-copilot?color=%23cc2a2a&label=npm)](https://www.npmjs.com/package/kevin-copilot)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A518-43853d)](https://nodejs.org)
[![copilot](https://img.shields.io/badge/github-copilot-8957e5)](https://github.com/features/copilot)

> **"Why waste time say lot word when few word do trick?"**
> — Kevin Malone, accounting department, Dunder Mifflin Scranton

</div>

---

```bash
npx kevin-copilot init
```

Done. Open Copilot anywhere — VS Code Chat, `copilot` CLI, cloud agent, PR review. Ask thing. Get answer. No filler. No "Great question!". No closing paragraph explaining what it just said.

---

## Problem

Default Copilot:

> Great question! To reverse a string in Python, you can use slicing. Here's how you would do it: `s[::-1]`. This works by specifying a step of -1, which iterates through the string from end to start. Let me know if you'd like more examples or have any other questions!

You wanted `s[::-1]`. You paid tokens for 56 other words.

**Kevin:**

> `s[::-1]` — slice step -1.

Same answer. 85% fewer tokens. Kevin save you token. Kevin hero.

---

## Measured savings (not vibes)

Three-arm eval. 10-prompt suite. Each Kevin mode must beat a generic "be terse" control by ≥5 percentage points **and** clear an absolute reduction threshold. Otherwise the eval fails and the CI gate fails and Kevin is sad.

| Mode | Target | Measured | vs. generic-terse |
|------|--------|----------|-------------------|
| `lite` | ≥40% | **66.5%** | +7.8 pp |
| `full` | ≥60% | **79.3%** | +20.6 pp |
| `ultra` | ≥75% | **88.8%** | +30.0 pp |

This is better than Kevin's chili. Reproduce with `npm run evals` in the source repo. Full report at `evals/report.md`.

---

## Install

```bash
# zero-install — run directly
npx kevin-copilot init

# or install globally
npm install -g kevin-copilot
kevin-copilot init

# or as a dev dependency
npm install --save-dev kevin-copilot
npx kevin-copilot init
```

```bash
# pick voice level
kevin-copilot init --intensity full

# see what it would do, touch nothing
kevin-copilot init --dry-run

# merge into existing AGENTS.md / copilot-instructions.md
kevin-copilot init --merge
```

Requires Node 18+. Writes 10 files. Idempotent. If you already have an `AGENTS.md` or `.github/copilot-instructions.md`, use `--merge` — it wraps Kevin inside sentinel markers so you can re-run it without making a mess. Kevin is careful with documents. He learned this after Keleven.

### Uninstall

```bash
kevin-copilot uninstall

# preview what would be removed
kevin-copilot uninstall --dry-run
```

Removes every file Kevin installed. If you used `--merge`, the sentinel block is stripped and your original content stays. Customized files are skipped. Empty directories are cleaned up. Kevin leaves no crumbs. Except chili crumbs.

### Update

```bash
# pull latest templates and re-install
kevin-copilot update

# update with a different intensity
kevin-copilot update --intensity ultra
```

Removes old files (including legacy chatmodes), then re-installs with the latest templates. One command. Kevin upgrades.

---

## Kevin Modes

| Mode | Voice | Cap |
|------|-------|-----|
| **Kevin Lite** | Short paragraphs. No preamble. No sign-off. | ~120 words |
| **Kevin Full** | Fragments. Bullets. Articles optional. | ~60 words |
| **Kevin Ultra** | `label: value` or code-only. No prose at all. | ~25 words |
| **Kevin ADHD** | Action first. Numbered steps. One clear next action. | Clarity-first |
| **Kevin Accountant** | Spreadsheet-terse. Numbers forward. Line-item reviews. | ~40 words |

Lite is Kevin in a meeting. Full is Kevin at his desk. Ultra is Kevin carrying a pot of chili. Accountant is Kevin doing the books — every answer reads like a ledger entry.
ADHD mode adapts the response shape for execution: action-first, state visible, and tangents suppressed.

---

## Where Kevin shows up

Kevin writes to two tiers of files — what GitHub Copilot itself reads.

### Tier 1 — always-on, every surface
`AGENTS.md` and `.github/copilot-instructions.md` are loaded automatically by Copilot wherever instructions are supported. No mode picker, no slash command, no opt-in. You install once, every response gets shorter.

| Surface | Honors `AGENTS.md` | Honors `copilot-instructions.md` |
|---|:---:|:---:|
| VS Code Copilot Chat | ✅ | ✅ |
| Copilot CLI (`copilot` / `gh copilot`) | ✅ | ✅ |
| Copilot coding agent (cloud) | ✅ | ✅ |
| Copilot code review | — | ✅ |
| Inline code completion (ghost text) | — | — |

Inline ghost-text completion ignores instruction files on every tool — that's a platform limit, not a Kevin limit. Everywhere else Copilot actually writes prose, Kevin shortens it.

### Tier 2 — VS Code Chat extras
These are VS Code–specific features layered on top. They won't surface in the CLI or cloud agent, but they're handy in the editor.

**Custom agents → dropdown picker.** Top of Copilot Chat panel, there's an agent dropdown. After `init`, you'll see:
- Kevin Lite
- Kevin Full
- Kevin Ultra
- Kevin ADHD
- Kevin Accountant

Pick one. That's it. Everything you ask in that thread inherits the voice.

**Slash prompts → type `/` in chat.**
- `/kevin-commit` — conventional-commit message from staged diff. No body unless needed.
- `/kevin-review` — single-line PR comments: `L42: bug: null deref on empty input. guard with if (!x) return.`
- `/kevin-help` — quick reference card.

### Runtime steering (say it in chat)
- `talk like Kevin` — engage voice even in default mode
- `fewer words` — step down one level (lite → full → ultra)
- `stop Kevin` — back to default Copilot voice
- `adhd mode` or `i have adhd` — switch to ADHD output shape
- `stop adhd mode` or `normal mode` — leave ADHD output shape

---

## The token receipt

Every substantive prose reply ends with one line:

```
— saved ~N tokens vs baseline
```

Best estimate. No math required. Omitted for commit messages, PR review comments, help output, and pure code answers (don't break syntax highlighting over a joke).

This is the only footer. Kevin does not add "Let me know if you have any questions!". Kevin assumes you will have questions. Kevin will answer them when they arrive. Kevin is not worried.

---

## What it writes

```
AGENTS.md
.github/
  copilot-instructions.md
  agents/
    kevin-lite.agent.md
    kevin-full.agent.md
    kevin-ultra.agent.md
    kevin-adhd.agent.md
    kevin-accountant.agent.md
  prompts/
    kevin-commit.prompt.md
    kevin-review.prompt.md
    kevin-help.prompt.md
```

Ten files. One purpose. Shorter Copilot.

---

## Flags

### `init` flags

| Flag | Effect |
|------|--------|
| `--target <dir>` | Where to write. Default: `.` |
| `--intensity lite\|full\|ultra\|adhd` | Voice level. Default: `lite` |
| `--force` | Overwrite on conflict |
| `--merge` | Append Kevin between sentinel markers. Idempotent. |
| `--dry-run` | Print planned writes, touch nothing |

`--force` and `--merge` are mutually exclusive. Like Kevin and diets.

Change modes anytime — re-run `init` with a different `--intensity` plus `--force` or `--merge`.

### `uninstall` flags

| Flag | Effect |
|------|--------|
| `--target <dir>` | Where to remove from. Default: `.` |
| `--dry-run` | Print planned removals, touch nothing |

---

## Prior art & inspiration

Kevin stands on the shoulders of shorter people:

- **[Caveman Claude](https://github.com/JuliusBrussee/caveman)** — Claude Code system prompt that speaks in caveman English. Caveman inspired Kevin. Caveman smart. Kevin different tribe, same fire.
- **[i-have-adhd](https://github.com/ayghri/i-have-adhd)** — action-first ADHD response shaping; inspired Kevin ADHD mode.
- **[AGENTS.md](https://agents.md)** — the cross-agent instructions standard. Kevin writes one.
- **[GitHub Copilot custom instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)** — the surface Kevin steers.

Kevin is Copilot-first. Caveman is Claude-first. You can use both. Both do trick. Few word.

---

## FAQ

**Does this hurt correctness?**
No. Correctness always wins over style. Kevin is not allowed to skip reasoning, drop warnings, or omit safety checks. Kevin is terse, not reckless. Kevin has made mistakes with money. He is not making them with your code.

**Does it work in the `copilot` CLI?**
Yes. `AGENTS.md` and `.github/copilot-instructions.md` are read by Copilot CLI, cloud agent, and VS Code Chat alike. Run `copilot` from a Kevin-initialized repo and you get terse answers. Chat modes and slash prompts are VS Code Chat extras on top — they don't appear in the CLI, but they don't need to; the instructions already shortened everything.

**Does it work in Cursor / Cline / Claude Code / Windsurf?**
`AGENTS.md` is honored by most modern agent surfaces. The `.github/copilot-instructions.md`, `.agent.md`, and `.prompt.md` files are GitHub Copilot–specific. Kevin's custom agents won't appear in other tools, but the instructions still flatten output noticeably.

**Can I uninstall Kevin?**
Yes. `npx kevin-copilot uninstall`. Removes all Kevin files. If you used `--merge`, only the Kevin sentinel block is removed — your original content stays. Run `--dry-run` first to see what it'll do. Kevin respects boundaries. Eventually.

**Can I change intensity later?**
Yes. `npx kevin-copilot init --intensity ultra --force` or `--merge`. Kevin adapts. He once switched from chili to cookies. He can switch modes.

**What if my repo already has `AGENTS.md`?**
Use `--merge`. Sentinel markers. Safe to re-run. Kevin will not overwrite your work. He is not that kind of Kevin.

**Why is it called Kevin?**
Because Kevin Malone, a fictional accountant, delivered the thesis of this entire project in one line on a television show and nobody has improved on it since: *"Why waste time say lot word when few word do trick."*

This repo is a fan project. The Office, Dunder Mifflin, and the character Kevin Malone are property of their respective owners (NBCUniversal). No endorsement, affiliation, or ownership is implied. Kevin Malone did not sign off on this. Kevin Malone is eating chili.

**Is this a joke?**
The README is a joke. The savings are not.

---

## Development

```bash
git clone https://github.com/shyamsridhar123/kevin-copilot
cd kevin-copilot
npm install
npm run build
npm test        # 49 tests
npm run evals   # three-arm reduction eval, exits non-zero on regression
```

### Verify the numbers yourself

```bash
npm run evals
```

Tokenizes 10 prompts × 5 arms (baseline, generic-terse, lite, full, ultra) using `gpt-tokenizer` (cl100k_base). Computes per-prompt and aggregate reduction percentages. Writes a full report to `evals/report.md`. Exits non-zero if any Kevin mode falls below its threshold or fails to beat the generic-terse control by ≥5 percentage points. No API calls, no credentials — runs entirely offline.

PRs welcome. Keep them short. Kevin would.

---

## License

MIT. See [LICENSE](./LICENSE).
