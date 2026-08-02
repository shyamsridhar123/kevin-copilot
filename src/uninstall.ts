import * as path from "node:path";
import { planFiles, type Intensity } from "./templates";
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

/**
 * Build a map of unique file paths → set of all known kevin content variants
 * across all intensity levels.
 */
function buildKnownFiles(): Map<string, Set<string>> {
  const known = new Map<string, Set<string>>();
  const intensities: Intensity[] = ["lite", "full", "ultra", "adhd"];
  for (const intensity of intensities) {
    for (const file of planFiles(intensity)) {
      let variants = known.get(file.path);
      if (!variants) {
        variants = new Set();
        known.set(file.path, variants);
      }
      variants.add(normalize(file.content));
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

/** Directories that kevin creates and should clean up if empty. */
const CLEANUP_DIRS = [
  ".github/agents",
  ".github/chatmodes",
  ".github/prompts",
  ".github",
];

export async function uninstall(params: UninstallParams): Promise<UninstallResult> {
  const {
    targetDir,
    dryRun,
    log = (line: string) => process.stdout.write(line + "\n"),
  } = params;

  await ensureTargetExists(targetDir);

  const known = buildKnownFiles();
  const result: UninstallResult = {
    removed: [],
    cleaned: [],
    skipped: [],
    planned: [],
  };

  for (const [relPath, variants] of known) {
    const abs = resolveInside(targetDir, relPath);
    const existing = await readIfExists(abs);

    if (existing === null) continue;

    const normalized = normalize(existing);

    // Exact match against any intensity variant → delete the file.
    if (variants.has(normalized)) {
      if (dryRun) {
        log(`plan remove: ${relPath}`);
        result.planned.push(relPath);
      } else {
        await removeFile(abs);
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
            await removeFile(abs);
            log(`removed: ${relPath} (empty after cleaning)`);
            result.removed.push(relPath);
          }
        } else {
          if (dryRun) {
            log(`plan clean: ${relPath} (remove kevin section)`);
            result.planned.push(relPath);
          } else {
            await writeFileMkdir(abs, cleaned);
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
  for (const relPath of LEGACY_PATHS) {
    const abs = resolveInside(targetDir, relPath);
    if (await readIfExists(abs) === null) continue;
    if (dryRun) {
      log(`plan remove (legacy): ${relPath}`);
      result.planned.push(relPath);
    } else {
      await removeFile(abs);
      log(`removed (legacy): ${relPath}`);
      result.removed.push(relPath);
    }
  }

  // Clean up empty directories.
  if (!dryRun) {
    for (const dir of CLEANUP_DIRS) {
      const abs = resolveInside(targetDir, dir);
      if (await removeDirIfEmpty(abs)) {
        log(`removed empty directory: ${dir}`);
      }
    }
  }

  return result;
}
