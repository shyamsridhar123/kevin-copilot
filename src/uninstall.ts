import * as path from "node:path";
import { createHash } from "node:crypto";
import { planFiles, type InstallScope, type Intensity } from "./templates";
import {
  resolveInside,
  readIfExists,
  writeFileMkdir,
  ensureTargetExists,
  removeFile,
  removeDirIfEmpty,
} from "./fs";
import { isMergeable, BEGIN_MARKER, END_MARKER } from "./conflict";

export interface UninstallParams {
  targetDir: string;
  dryRun: boolean;
  scope?: InstallScope;
  /** Optional log sink, defaults to console. */
  log?: (line: string) => void;
}

export interface UninstallResult {
  removed: string[];
  cleaned: string[];
  skipped: string[];
  planned: string[];
}

/** Normalize line endings for content comparison. */
function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n");
}

function hash(content: string): string {
  return createHash("sha256").update(normalize(content)).digest("hex");
}

/** Exact hashes emitted by 0.3.x, retained for safe upgrades and uninstall. */
const LEGACY_HASHES: Record<string, Set<string>> = {
  "AGENTS.md": new Set([
    "4c6252470196e39ccfb5b7f372dbb11759d9f1a921d33dc22a7230b6b5b7798e",
    "1be052879f33df1c69d823f964339db557ce74fe0d5ff97eae1776303c381c99",
    "e5522777f9a91d2e8e9a9301e5f9934005cfb476f911abad434dbfdca7145486",
    "87e685af41b38b0c1dff391b53271be48005acc0c85a8f8aa135fab375f0c935",
  ]),
  ".github/copilot-instructions.md": new Set([
    "78a7fb6574c60705e0db762364c6855d6d20d423b28cdb2ae59b3bcfaac2ae01",
    "42b4fc3285e8b68f0dae8bef15a98d03d2b84ef20a18a418dbe05b70fc94d488",
    "eac555178d2ea2a3515ff0812c500f11e788158fa8e97f1257aee5fc8ee7ae18",
    "ce10a381e3afb50901f0599d805ad7f829102a15dac803bf633b8cf38cf8694b",
  ]),
  ".github/agents/kevin-lite.agent.md": new Set(["8785cf6a93948f37ac521745692bfeeeec2fe2aca3cbcdb0ed355bf0c0c158ee"]),
  ".github/agents/kevin-full.agent.md": new Set(["b51684bfee6a6e9719ce0e2f3b75b539741caede3b8f51b5130d2242b6eaf31c"]),
  ".github/agents/kevin-ultra.agent.md": new Set(["360e6b5b14e9dd0fd3f90f71bb81edd8758f8592ac653784a6753ab77af00eb0"]),
  ".github/agents/kevin-accountant.agent.md": new Set(["e1275f1605409fc7a81c9ed4071b8ec9d2568b8c5db5e82eaeee6e50d71c875d"]),
  ".github/agents/kevin-adhd.agent.md": new Set(["6d15fc0bfb8692e0a38084b7102a356347416d8422fe8c74c1e4042568192dc1"]),
  ".github/prompts/kevin-commit.prompt.md": new Set(["b090989ab8b37a218f8e7b8e7676d9360d0488449b941be6aa9768bdfe7d6b9b"]),
  ".github/prompts/kevin-review.prompt.md": new Set(["d07fa69c97586e4c4fd8e7d5b257ea0de9543b2220212ba603e8d048cf2c4443"]),
  ".github/prompts/kevin-help.prompt.md": new Set(["fe04be7bfde2678d73dab661d8c771d15916cc0e821bf71ab143e75a88c62d8f"]),
};

/**
 * Build a map of unique file paths → set of all known kevin content variants
 * across all intensity levels.
 */
function buildKnownFiles(scope: InstallScope): Map<string, Set<string>> {
  const known = new Map<string, Set<string>>();
  const intensities: Intensity[] = ["lite", "full", "ultra", "adhd", "accountant"];
  for (const intensity of intensities) {
    for (const tokenReceipt of [false, true]) {
      for (const includeAgentsMd of [false, true]) {
        for (const file of planFiles(intensity, { scope, tokenReceipt, includeAgentsMd })) {
          let variants = known.get(file.path);
          if (!variants) {
            variants = new Set();
            known.set(file.path, variants);
          }

          export function managedPaths(scope: InstallScope): string[] {
            const paths = [...buildKnownFiles(scope).keys()];
            if (scope === "project") paths.push(...LEGACY_PATHS);
            return paths;
          }
          variants.add(normalize(file.content));
        }
      }
    }
  }
  return known;
}

/**
 * Remove the kevin sentinel block from file content.
 * Returns the cleaned content, or null if no valid block was found.
 */
function removeSentinelBlock(content: string): string | null {
  const begin = content.indexOf(BEGIN_MARKER);
  const end = content.indexOf(END_MARKER);
  if (begin === -1 || end === -1 || end <= begin) return null;

  // Check for multiple blocks — refuse to touch if ambiguous.
  const secondBegin = content.indexOf(BEGIN_MARKER, begin + BEGIN_MARKER.length);
  if (secondBegin !== -1 && secondBegin < end) return null;

  const before = content.slice(0, begin);
  const after = content.slice(end + END_MARKER.length);

  // Trim trailing blank lines between sections.
  const cleaned = (before.replace(/\n+$/, "") + after.replace(/^\n+/, "\n"));
  return cleaned.length === 0 || cleaned === "\n" ? "" : cleaned.endsWith("\n") ? cleaned : cleaned + "\n";
}

/** Legacy paths from older versions that should also be cleaned up. */
const LEGACY_PATHS = [
  ".github/chatmodes/kevin-lite.chatmode.md",
  ".github/chatmodes/kevin-full.chatmode.md",
  ".github/chatmodes/kevin-ultra.chatmode.md",
];

const LEGACY_PATH_HASHES: Record<string, Set<string>> = {
  ".github/chatmodes/kevin-lite.chatmode.md": new Set([
    "8785cf6a93948f37ac521745692bfeeeec2fe2aca3cbcdb0ed355bf0c0c158ee",
    "2db7468af48657eda82efe7d758dc47ee3cbb4294b8351b1d630a6f14ee96be4",
  ]),
  ".github/chatmodes/kevin-full.chatmode.md": new Set([
    "b51684bfee6a6e9719ce0e2f3b75b539741caede3b8f51b5130d2242b6eaf31c",
    "3c6cfdbe47c54a3ac3bdd65a1fdbd798698971c1fba36583e9e8641f63ac2ab4",
  ]),
  ".github/chatmodes/kevin-ultra.chatmode.md": new Set([
    "360e6b5b14e9dd0fd3f90f71bb81edd8758f8592ac653784a6753ab77af00eb0",
    "cc17514fdece2058edc682f05a535132ff813919e16e9ea137a5e6869bb0c308",
  ]),
};

/** Directories that kevin creates and should clean up if empty. */
function cleanupDirs(scope: InstallScope): string[] {
  const prefix = scope === "project" ? ".github/" : "";
  const dirs = [
    "skills/kevin-compress",
    "skills/kevin-commit",
    "skills/kevin-review",
    "skills/kevin-help",
    "agents",
    "skills",
  ].map((dir) => `${prefix}${dir}`);
  if (scope === "project") dirs.push(".github/chatmodes", ".github/prompts", ".github");
  return dirs;
}

export async function uninstall(params: UninstallParams): Promise<UninstallResult> {
  const {
    targetDir,
    dryRun,
    scope = "project",
    log = (line: string) => process.stdout.write(line + "\n"),
  } = params;

  await ensureTargetExists(targetDir, { allowMissing: scope === "personal" });

  const known = buildKnownFiles(scope);
  const result: UninstallResult = {
    removed: [],
    cleaned: [],
    skipped: [],
    planned: [],
  };

  for (const [relPath, variants] of known) {
    const abs = resolveInside(targetDir, relPath);
    const existing = await readIfExists(targetDir, abs);

    if (existing === null) continue;

    const normalized = normalize(existing);

    // Exact match against any intensity variant → delete the file.
    if (variants.has(normalized) || LEGACY_HASHES[relPath]?.has(hash(normalized))) {
      if (dryRun) {
        log(`plan remove: ${relPath}`);
        result.planned.push(relPath);
      } else {
        await removeFile(targetDir, abs);
        log(`removed: ${relPath}`);
        result.removed.push(relPath);
      }
      continue;
    }

    // For mergeable files, try to remove the sentinel block.
    if (isMergeable(relPath)) {
      const cleaned = removeSentinelBlock(existing);
      if (cleaned !== null) {
        if (cleaned.length === 0) {
          // File is empty after removing kevin block → delete.
          if (dryRun) {
            log(`plan remove: ${relPath} (empty after cleaning)`);
            result.planned.push(relPath);
          } else {
            await removeFile(targetDir, abs);
            log(`removed: ${relPath} (empty after cleaning)`);
            result.removed.push(relPath);
          }
        } else {
          if (dryRun) {
            log(`plan clean: ${relPath} (remove kevin section)`);
            result.planned.push(relPath);
          } else {
            await writeFileMkdir(targetDir, abs, cleaned);
            log(`cleaned: ${relPath} (removed kevin section)`);
            result.cleaned.push(relPath);
          }
        }
        continue;
      }
    }

    // File exists but doesn't match kevin content and has no sentinel block.
    log(`skipped: ${relPath} (modified or not installed by kevin)`);
    result.skipped.push(relPath);
  }

  // Remove legacy files from older versions (e.g. .chatmode.md → .agent.md migration).
  for (const relPath of scope === "project" ? LEGACY_PATHS : []) {
    const abs = resolveInside(targetDir, relPath);
    const existing = await readIfExists(targetDir, abs);
    if (existing === null) continue;
    if (!LEGACY_PATH_HASHES[relPath].has(hash(existing))) {
      log(`skipped: ${relPath} (modified or not installed by kevin)`);
      result.skipped.push(relPath);
      continue;
    }
    if (dryRun) {
      log(`plan remove (legacy): ${relPath}`);
      result.planned.push(relPath);
    } else {
      await removeFile(targetDir, abs);
      log(`removed (legacy): ${relPath}`);
      result.removed.push(relPath);
    }
  }

  // Clean up empty directories.
  if (!dryRun) {
    for (const dir of cleanupDirs(scope)) {
      const abs = resolveInside(targetDir, dir);
      if (await removeDirIfEmpty(targetDir, abs)) {
        log(`removed empty directory: ${dir}`);
      }
    }
  }

  return result;
}
