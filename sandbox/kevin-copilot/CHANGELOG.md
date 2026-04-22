# Changelog

## 0.2.0

- Added `kevin-review.prompt.md`: one-line PR review comments in `L<line>: <kind>: <issue>. <fix>.` form.
- Added `kevin-help.prompt.md`: static reference card for modes, triggers, and prompts.
- Response footer: Kevin now ends substantive prose replies with `— saved ~N tokens vs baseline`. Omitted for commit messages, PR review comments, help output, and code-only answers.
- Evals upgraded to three-arm rigor: `baseline` vs `generic_terse` (control — terse but without Kevin voice rules) vs `lite`/`full`/`ultra`. Pass now requires both absolute thresholds (lite ≥40%, full ≥60%, ultra ≥75%) and a ≥5pp gap over the `generic_terse` control.
- Install now writes 8 files.

## 0.1.0

Initial release.

- `kevin-copilot init` writes `AGENTS.md`, `.github/copilot-instructions.md`, three chat modes (lite/full/ultra), and `kevin-commit.prompt.md`.
- Intensity levels: lite, full, ultra.
- Flags: `--target`, `--intensity`, `--force`, `--merge`, `--dry-run`.
- Idempotent re-install; sentinel-marker merge for existing instructions/AGENTS files.
- Node 18+, zero runtime dependencies.
