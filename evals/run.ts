import * as fs from "node:fs";
import * as path from "node:path";
import { encode } from "gpt-tokenizer";

interface PromptRow {
  id: string;
  question: string;
  baseline: string;
  generic_terse: string;
  lite: string;
  full: string;
  ultra: string;
}

type Mode = "lite" | "full" | "ultra";

interface Row {
  id: string;
  questionTokens: number;
  baseline: number;
  genericTerse: number;
  lite: number;
  full: number;
  ultra: number;
  genericTerseReduction: number;
  liteReduction: number;
  fullReduction: number;
  ultraReduction: number;
}

const THRESHOLDS: Record<Mode, number> = {
  lite: 40,
  full: 60,
  ultra: 75,
};

// v0.2.0: kevin must beat a naive "just be terse" baseline by this much (percentage points)
// to justify its existence as something more than generic brevity.
const KEVIN_GAP_PP = 5;

function count(s: string): number {
  return encode(s).length;
}

function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return ((b - a) / b) * 100;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function fmt(n: number): string {
  return n.toFixed(1);
}

function main(): void {
  const promptsPath = path.join(__dirname, "prompts.json");
  const raw = fs.readFileSync(promptsPath, "utf8");
  const prompts: PromptRow[] = JSON.parse(raw);

  const rows: Row[] = prompts.map((p) => {
    const baseline = count(p.baseline);
    const genericTerse = count(p.generic_terse);
    const lite = count(p.lite);
    const full = count(p.full);
    const ultra = count(p.ultra);
    return {
      id: p.id,
      questionTokens: count(p.question),
      baseline,
      genericTerse,
      lite,
      full,
      ultra,
      genericTerseReduction: pct(genericTerse, baseline),
      liteReduction: pct(lite, baseline),
      fullReduction: pct(full, baseline),
      ultraReduction: pct(ultra, baseline),
    };
  });

  const genericTerseRed = rows.map((r) => r.genericTerseReduction);
  const liteRed = rows.map((r) => r.liteReduction);
  const fullRed = rows.map((r) => r.fullReduction);
  const ultraRed = rows.map((r) => r.ultraReduction);

  const summary = {
    generic_terse: { mean: mean(genericTerseRed), median: median(genericTerseRed), min: Math.min(...genericTerseRed), max: Math.max(...genericTerseRed) },
    lite: { mean: mean(liteRed), median: median(liteRed), min: Math.min(...liteRed), max: Math.max(...liteRed) },
    full: { mean: mean(fullRed), median: median(fullRed), min: Math.min(...fullRed), max: Math.max(...fullRed) },
    ultra: { mean: mean(ultraRed), median: median(ultraRed), min: Math.min(...ultraRed), max: Math.max(...ultraRed) },
  };

  const totalBaseline = rows.reduce((a, r) => a + r.baseline, 0);
  const totalGenericTerse = rows.reduce((a, r) => a + r.genericTerse, 0);
  const totalLite = rows.reduce((a, r) => a + r.lite, 0);
  const totalFull = rows.reduce((a, r) => a + r.full, 0);
  const totalUltra = rows.reduce((a, r) => a + r.ultra, 0);

  const lines: string[] = [];
  lines.push("# kevin-copilot eval report");
  lines.push("");
  lines.push("Offline token counts across 10 hand-authored response fixtures.");
  lines.push("");
  lines.push("> This synthetic benchmark does not run Copilot models or prove instruction compliance, semantic equivalence, latency, or production savings.");
  lines.push("Tokenizer: `gpt-tokenizer` (cl100k_base / GPT-4 family). Representative common denominator across the Copilot backend mix.");
  lines.push("");
  lines.push("## Per-prompt tokens");
  lines.push("");
  lines.push("| id | baseline | generic_terse | lite | full | ultra | g.terse% | lite% | full% | ultra% |");
  lines.push("|----|---------:|--------------:|-----:|-----:|------:|---------:|------:|------:|-------:|");
  for (const r of rows) {
    lines.push(
      `| ${r.id} | ${r.baseline} | ${r.genericTerse} | ${r.lite} | ${r.full} | ${r.ultra} | ${fmt(r.genericTerseReduction)} | ${fmt(r.liteReduction)} | ${fmt(r.fullReduction)} | ${fmt(r.ultraReduction)} |`,
    );
  }
  lines.push("");
  lines.push("## Summary (percent reduction vs baseline)");
  lines.push("");
  lines.push("| arm | mean | median | min | max | threshold | kevin gap (pp) | pass |");
  lines.push("|-----|-----:|-------:|----:|----:|----------:|---------------:|:----:|");
  {
    const s = summary.generic_terse;
    lines.push(
      `| generic_terse (control) | ${fmt(s.mean)} | ${fmt(s.median)} | ${fmt(s.min)} | ${fmt(s.max)} | — | — | — |`,
    );
  }
  for (const mode of ["lite", "full", "ultra"] as Mode[]) {
    const s = summary[mode];
    const gap = s.mean - summary.generic_terse.mean;
    const absPass = s.mean >= THRESHOLDS[mode];
    const gapPass = gap >= KEVIN_GAP_PP;
    const pass = absPass && gapPass;
    lines.push(
      `| ${mode} | ${fmt(s.mean)} | ${fmt(s.median)} | ${fmt(s.min)} | ${fmt(s.max)} | ${THRESHOLDS[mode]} | ${fmt(gap)} | ${pass ? "PASS" : "FAIL"} |`,
    );
  }
  lines.push("");
  lines.push("## Aggregate token totals");
  lines.push("");
  lines.push("| arm | total tokens | vs baseline |");
  lines.push("|-----|-------------:|------------:|");
  lines.push(`| baseline | ${totalBaseline} | — |`);
  lines.push(`| generic_terse | ${totalGenericTerse} | ${fmt(pct(totalGenericTerse, totalBaseline))}% reduction |`);
  lines.push(`| lite | ${totalLite} | ${fmt(pct(totalLite, totalBaseline))}% reduction |`);
  lines.push(`| full | ${totalFull} | ${fmt(pct(totalFull, totalBaseline))}% reduction |`);
  lines.push(`| ultra | ${totalUltra} | ${fmt(pct(totalUltra, totalBaseline))}% reduction |`);
  lines.push("");
  lines.push("## Methodology");
  lines.push("");
  lines.push("- 10 prompts span explain/debug/refactor/test-gen/summarize/code-gen/Q&A.");
  lines.push("- **baseline**: representative default Copilot-style answer (preamble, hedging, closing filler).");
  lines.push("- **generic_terse** (control arm): same answer written terse but without Kevin voice rules — the \"just be brief\" null hypothesis.");
  lines.push("- **lite / full / ultra**: hand-authored to the voice rules in `.github/copilot-instructions.md`.");
  lines.push("  - Responses are hand-authored fixtures intended to preserve substantive content; semantic equivalence is not automatically judged.");
  lines.push("- Only response tokens counted. Prompt/system-instruction tokens not included.");
  lines.push("");
  lines.push("## Failure policy");
  lines.push("");
  lines.push("Script exits non-zero if **either** gate fails for any kevin mode:");
  lines.push("");
  lines.push(`1. **Absolute threshold**: mean reduction vs baseline \u2265 threshold (lite \u2265 40%, full \u2265 60%, ultra \u2265 75%).`);
  lines.push(`2. **Kevin gap**: mean reduction \u2212 generic_terse mean \u2265 ${KEVIN_GAP_PP}pp. Ensures kevin beats a naive "just be terse" baseline.`);

  const reportPath = path.join(__dirname, "report.md");
  fs.writeFileSync(reportPath, lines.join("\n") + "\n", "utf8");
  process.stdout.write(`wrote ${reportPath}\n`);

  // Exit code.
  const failures: string[] = [];
  for (const mode of ["lite", "full", "ultra"] as Mode[]) {
    if (summary[mode].mean < THRESHOLDS[mode]) {
      failures.push(`${mode}: ${fmt(summary[mode].mean)}% < ${THRESHOLDS[mode]}%`);
    }
    const gap = summary[mode].mean - summary.generic_terse.mean;
    if (gap < KEVIN_GAP_PP) {
      failures.push(`${mode}: kevin gap ${fmt(gap)}pp < ${KEVIN_GAP_PP}pp over generic_terse`);
    }
  }
  if (failures.length > 0) {
    process.stderr.write(`FAIL: ${failures.join("; ")}\n`);
    process.exit(1);
  }
  process.stdout.write("PASS: all modes meet reduction thresholds and beat generic_terse\n");
}

main();
