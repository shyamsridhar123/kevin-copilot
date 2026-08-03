import { planFiles, type InstallScope, type Intensity } from "./templates";
import {
  resolveInside,
  readIfExists,
  writeFileMkdir,
  ensureTargetExists,
} from "./fs";
import {
  isMergeable,
  mergeContent,
  promptConflict,
} from "./conflict";

export interface InstallParams {
  targetDir: string;
  intensity: Intensity;
  force: boolean;
  merge: boolean;
  dryRun: boolean;
  scope?: InstallScope;
  tokenReceipt?: boolean;
  includeAgentsMd?: boolean;
  /** Optional override for conflict prompts, used by tests. */
  resolveConflict?: (relPath: string) => Promise<"accept" | "skip" | "quit">;
  /** Optional log sink, defaults to console. */
  log?: (line: string) => void;
}

export interface InstallResult {
  written: string[];
  merged: string[];
  skipped: string[];
  unchanged: string[];
  planned: string[];
}

export async function install(params: InstallParams): Promise<InstallResult> {
  const {
    targetDir,
    intensity,
    force,
    merge,
    dryRun,
    scope = "project",
    tokenReceipt = false,
    includeAgentsMd = false,
    resolveConflict = promptConflict,
    log = (line: string) => process.stdout.write(line + "\n"),
  } = params;

  await ensureTargetExists(targetDir);

  const files = planFiles(intensity, { scope, tokenReceipt, includeAgentsMd });
  const result: InstallResult = {
    written: [],
    merged: [],
    skipped: [],
    unchanged: [],
    planned: [],
  };

  for (const file of files) {
    const abs = resolveInside(targetDir, file.path);
    const existing = await readIfExists(abs);

    if (existing === null) {
      if (dryRun) {
        log(`plan write: ${file.path}`);
        result.planned.push(file.path);
      } else {
        await writeFileMkdir(abs, file.content);
        log(`wrote: ${file.path}`);
        result.written.push(file.path);
      }
      continue;
    }

    // Normalize CRLF for comparison to avoid false conflicts on Windows.
    if (existing.replace(/\r\n/g, "\n") === file.content.replace(/\r\n/g, "\n")) {
      result.unchanged.push(file.path);
      continue;
    }

    // Conflict.
    if (merge && isMergeable(file.path)) {
      const next = mergeContent(existing, file.content);
      if (dryRun) {
        log(`plan merge: ${file.path}`);
        result.planned.push(file.path);
      } else {
        await writeFileMkdir(abs, next);
        log(`merged: ${file.path}`);
        result.merged.push(file.path);
      }
      continue;
    }

    if (force) {
      if (dryRun) {
        log(`plan overwrite: ${file.path}`);
        result.planned.push(file.path);
      } else {
        await writeFileMkdir(abs, file.content);
        log(`overwrote: ${file.path}`);
        result.written.push(file.path);
      }
      continue;
    }

    const choice = await resolveConflict(file.path);
    if (choice === "quit") {
      log("aborted by user");
      return result;
    }
    if (choice === "skip") {
      log(`skipped: ${file.path}`);
      result.skipped.push(file.path);
      continue;
    }
    // accept
    if (dryRun) {
      log(`plan overwrite: ${file.path}`);
      result.planned.push(file.path);
    } else {
      await writeFileMkdir(abs, file.content);
      log(`overwrote: ${file.path}`);
      result.written.push(file.path);
    }
  }

  return result;
}
