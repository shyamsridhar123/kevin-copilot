import * as readline from "node:readline/promises";

export const BEGIN_MARKER = "<!-- kevin-copilot: begin -->";
export const END_MARKER = "<!-- kevin-copilot: end -->";

const MERGEABLE = new Set<string>([
  "AGENTS.md",
  ".github/copilot-instructions.md",
]);

export function isMergeable(relPath: string): boolean {
  return MERGEABLE.has(relPath);
}

/**
 * Wrap Kevin content in sentinel markers and splice into existing file content.
 * If markers already exist, the block between them is replaced (idempotent).
 * Otherwise the block is appended with a blank line separator.
 */
export function mergeContent(existing: string, kevinContent: string): string {
  const block = `${BEGIN_MARKER}\n${kevinContent.trimEnd()}\n${END_MARKER}\n`;
  const begin = existing.indexOf(BEGIN_MARKER);
  const end = existing.indexOf(END_MARKER);
  if (begin !== -1 && end !== -1 && end > begin) {
    const before = existing.slice(0, begin);
    const after = existing.slice(end + END_MARKER.length);
    const stitched = `${before}${block}${after.replace(/^\n+/, "")}`;
    return stitched.endsWith("\n") ? stitched : stitched + "\n";
  }
  const sep = existing.endsWith("\n") ? "\n" : "\n\n";
  return `${existing}${sep}${block}`;
}

export type ConflictChoice = "accept" | "skip" | "quit";

/**
 * Prompt user for conflict resolution. Non-interactive environments get "skip".
 */
export async function promptConflict(relPath: string): Promise<ConflictChoice> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    process.stderr.write(
      `kevin-copilot: conflict on ${relPath}, non-interactive shell; skipping. Use --force or --merge.\n`,
    );
    return "skip";
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`conflict: ${relPath} — [a]ccept / [s]kip / [q]uit? `))
      .trim()
      .toLowerCase();
    if (answer === "a" || answer === "accept") return "accept";
    if (answer === "q" || answer === "quit") return "quit";
    return "skip";
  } finally {
    rl.close();
  }
}
