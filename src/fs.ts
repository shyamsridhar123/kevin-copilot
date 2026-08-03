import * as path from "node:path";
import * as fs from "node:fs/promises";

/**
 * Resolve a repo-relative path against targetDir and guarantee it stays inside.
 * Throws on any attempted escape via "..", absolute paths, or symlinks.
 */
export function resolveInside(targetDir: string, relPath: string): string {
  const absTarget = path.resolve(targetDir);
  const joined = path.resolve(absTarget, relPath);
  const rel = path.relative(absTarget, joined);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`refusing to write outside target: ${relPath}`);
  }
  return joined;
}

export async function readIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeFileMkdir(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export async function ensureTargetExists(
  targetDir: string,
  options: { create?: boolean; allowMissing?: boolean } = {},
): Promise<void> {
  const stat = await fs.stat(targetDir).catch(() => null);
  if (!stat && options.create) {
    await fs.mkdir(targetDir, { recursive: true });
    return;
  }
  if (!stat && options.allowMissing) return;
  if (!stat) throw new Error(`target directory does not exist: ${targetDir}`);
  if (!stat.isDirectory()) throw new Error(`target is not a directory: ${targetDir}`);
}

export async function removeFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

export async function removeDirIfEmpty(dirPath: string): Promise<boolean> {
  try {
    await fs.rmdir(dirPath);
    return true;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTEMPTY") return false;
    throw err;
  }
}
