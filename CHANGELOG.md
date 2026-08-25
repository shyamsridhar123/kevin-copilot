# Changelog

## Unreleased

### Added
- **`kevin-merit` skill** — runs the `kevin-review` pass, then reports the findings as a corporate merit cycle (band, allotted increase, one line of calibration). Outstanding is defined and never awarded. The band is derived from `git diff --numstat`, so Exceeds requires deletions to outnumber additions. It scores a change, never a person, and refuses to run against a contributor or a commit history.
- **Kevin Enlighten** — the one verbose mode, shipped as an agent and a skill. Produces a self-contained HTML picture explainer. Not an `--intensity`, and never emits a token receipt.
- **Cost-approval tiers in `kevin-merit`** — new code must clear the cheapest tier that could have delivered it (nothing → prior art → stdlib → runtime/browser/OS → an already-approved dependency → new code). A new dependency is not a tier and is never approved. Code that skipped a cheaper tier is reported as `UNFUNDED SCOPE` and must name the specific alternative. Any unfunded scope caps the band at Meets Expectations. Trust-boundary validation, data-loss handling, security controls, and accessibility affordances are funded at every tier and can never be charged.
- *Composing with other tools* section in the README, documenting the code rules and pointing at [ponytail](https://github.com/DietrichGebert/ponytail) as the fuller treatment of the same idea.

### Changed
- **Kevin's brevity now applies to code, not just prose.** A new `## Code` block in the always-on voice — so it reaches `copilot-instructions.md`, every agent, and every chat mode — requires the cheapest option that works: nothing, then what the repo already has, then the standard library, then the runtime or platform, then a dependency already in the manifest, then new code. Dependencies are never added unilaterally, and deleting code is a valid answer. Adopted from ponytail; `kevin-merit` audits against the same tiers, so write time and review time agree.
- The non-negotiable voice block now names what compression may never drop — trust-boundary validation, data-loss handling, security controls, accessibility affordances — instead of leaving "required safety warnings" to the model's judgement. Adopted from ponytail.
- `init` now writes 16 project files (was 15) and 13 personal files (was 12).

## 0.4.0

- Added project and personal installation scopes.
- Added cross-surface Agent Skills and a native Copilot plugin marketplace.
- Updated agents to portable tools, explicit invocation controls, and VS Code handoffs.
- Added Accountant as a selectable intensity.
- Made estimated token receipts opt-in and clarified synthetic evaluation limits.
- Stopped installing duplicate `AGENTS.md` instructions by default.

All notable changes to `kevin-copilot` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-04-22

### Added
- **Kevin Accountant** agent mode — spreadsheet-terse, numbers-forward, label:value pairs, line-item reviews. Writes to `.github/agents/kevin-accountant.agent.md`.
- `init` now writes 9 files (was 8).

## [0.3.0] - 2026-04-22

### Added
- `update` command — removes old files (including legacy chatmodes) and re-installs with latest templates. Supports `--intensity`, `--merge`, and `--dry-run`.

## [0.2.3] - 2026-04-22

### Fixed
- `uninstall` now removes legacy `.chatmode.md` files from older installations.
- Directory cleanup includes `.github/chatmodes/` for legacy installs.

## [0.2.2] - 2026-04-22

### Changed
- Migrated from `.chatmode.md` (deprecated) to `.agent.md` format for VS Code custom agents. Files now go to `.github/agents/` instead of `.github/chatmodes/`.
- Agent frontmatter now includes `tools` field required by VS Code.
- Updated README and help text to reflect new agent format.

## [0.2.1] - 2026-04-22

### Added
- `uninstall` command — removes all Kevin-installed files. Exact-match files are deleted; merged files have only the Kevin sentinel block stripped (preserving user content); customized files are skipped with a warning. Empty directories are cleaned up.
- `--target` and `--dry-run` flags for `uninstall`.

## [0.2.0] - 2026-04-22

### Added
- `kevin-review.prompt.md` — one-line PR review comments in `L<line>: <kind>: <issue>. <fix>.` form.
- `kevin-help.prompt.md` — static reference card for modes, triggers, and prompts.
- Response footer: Kevin ends substantive prose replies with `— saved ~N tokens vs baseline`. Omitted for commit messages, PR review comments, help output, and code-only answers.

### Changed
- Evals upgraded to three-arm rigor: `baseline` vs `generic_terse` (terse control without Kevin voice rules) vs `lite`/`full`/`ultra`. Pass requires both absolute thresholds (lite ≥40%, full ≥60%, ultra ≥75%) and a ≥5pp gap over the `generic_terse` control.
- `init` now writes 8 files (was 6).

## [0.1.0] - 2026-04-21

### Added
- Initial release.
- `kevin-copilot init` writes `AGENTS.md`, `.github/copilot-instructions.md`, three chat modes (lite/full/ultra), and `kevin-commit.prompt.md`.
- Intensity levels: `lite`, `full`, `ultra`.
- Flags: `--target`, `--intensity`, `--force`, `--merge`, `--dry-run`.
- Idempotent re-install; sentinel-marker merge for existing instructions/AGENTS files.
- Node 18+, zero runtime dependencies.
