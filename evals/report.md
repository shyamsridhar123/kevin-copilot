# kevin-copilot eval report

Offline token counts across 10 hand-authored response fixtures.

> This synthetic benchmark does not run Copilot models or prove instruction compliance, semantic equivalence, latency, or production savings.
Tokenizer: `gpt-tokenizer` (cl100k_base / GPT-4 family). Representative common denominator across the Copilot backend mix.

## Per-prompt tokens

| id | baseline | generic_terse | lite | full | ultra | g.terse% | lite% | full% | ultra% |
|----|---------:|--------------:|-----:|-----:|------:|---------:|------:|------:|-------:|
| explain-async-await | 150 | 66 | 47 | 28 | 19 | 56.0 | 68.7 | 81.3 | 87.3 |
| debug-null-ref | 174 | 73 | 56 | 34 | 16 | 58.0 | 67.8 | 80.5 | 90.8 |
| refactor-if-chain | 176 | 73 | 64 | 39 | 24 | 58.5 | 63.6 | 77.8 | 86.4 |
| write-test-array-sum | 277 | 149 | 135 | 84 | 37 | 46.2 | 51.3 | 69.7 | 86.6 |
| summarize-pr | 159 | 36 | 28 | 21 | 12 | 77.4 | 82.4 | 86.8 | 92.5 |
| explain-closure | 145 | 78 | 66 | 34 | 11 | 46.2 | 54.5 | 76.6 | 92.4 |
| small-util-debounce | 183 | 69 | 66 | 61 | 48 | 62.3 | 63.9 | 66.7 | 73.8 |
| git-undo-commit | 198 | 83 | 57 | 31 | 15 | 58.1 | 71.2 | 84.3 | 92.4 |
| explain-promise-all | 207 | 86 | 66 | 29 | 16 | 58.5 | 68.1 | 86.0 | 92.3 |
| what-is-rest | 174 | 59 | 46 | 29 | 12 | 66.1 | 73.6 | 83.3 | 93.1 |

## Summary (percent reduction vs baseline)

| arm | mean | median | min | max | threshold | kevin gap (pp) | pass |
|-----|-----:|-------:|----:|----:|----------:|---------------:|:----:|
| generic_terse (control) | 58.7 | 58.3 | 46.2 | 77.4 | — | — | — |
| lite | 66.5 | 68.0 | 51.3 | 82.4 | 40 | 7.8 | PASS |
| full | 79.3 | 80.9 | 66.7 | 86.8 | 60 | 20.6 | PASS |
| ultra | 88.8 | 91.5 | 73.8 | 93.1 | 75 | 30.0 | PASS |

## Aggregate token totals

| arm | total tokens | vs baseline |
|-----|-------------:|------------:|
| baseline | 1843 | — |
| generic_terse | 772 | 58.1% reduction |
| lite | 631 | 65.8% reduction |
| full | 390 | 78.8% reduction |
| ultra | 210 | 88.6% reduction |

## Methodology

- 10 prompts span explain/debug/refactor/test-gen/summarize/code-gen/Q&A.
- **baseline**: representative default Copilot-style answer (preamble, hedging, closing filler).
- **generic_terse** (control arm): same answer written terse but without Kevin voice rules — the "just be brief" null hypothesis.
- **lite / full / ultra**: hand-authored to the voice rules in `.github/copilot-instructions.md`.
  - Responses are hand-authored fixtures intended to preserve substantive content; semantic equivalence is not automatically judged.
- Only response tokens counted. Prompt/system-instruction tokens not included.

## Failure policy

Script exits non-zero if **either** gate fails for any kevin mode:

1. **Absolute threshold**: mean reduction vs baseline ≥ threshold (lite ≥ 40%, full ≥ 60%, ultra ≥ 75%).
2. **Kevin gap**: mean reduction − generic_terse mean ≥ 5pp. Ensures kevin beats a naive "just be terse" baseline.
