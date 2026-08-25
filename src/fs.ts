import * as path from "node:path";
import * as fs from "node:fs/promises";
import { constants } from "node:fs";
import { randomUUID } from "node:crypto";

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

async function safePath(targetDir: string, filePath: string): Promise<string> {
  const absTarget = path.resolve(targetDir);
  const targetStat = await fs.lstat(absTarget);
  if (targetStat.isSymbolicLink()) {
    throw new Error(`refusing to use symlink target: ${targetDir}`);
  }
  if (!targetStat.isDirectory()) {
    throw new Error(`target is not a directory: ${targetDir}`);
  }

  const rel = path.relative(absTarget, path.resolve(filePath));
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`refusing to access outside target: ${filePath}`);
  }

  const realTarget = await fs.realpath(absTarget);
  let current = realTarget;
  for (const part of rel.split(path.sep).slice(0, -1)) {
    current = path.join(current, part);
    const stat = await fs.lstat(current).catch((err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") return null;
      throw err;
    });
    if (stat?.isSymbolicLink()) {
      throw new Error(`refusing to follow symlink inside target: ${filePath}`);
    }
    if (stat && !stat.isDirectory()) {
      throw new Error(`path component is not a directory: ${filePath}`);
    }
  }
  return path.join(realTarget, rel);
}

async function rejectLeafSymlink(filePath: string): Promise<void> {
  const stat = await fs.lstat(filePath).catch((err: NodeJS.ErrnoException) => {
    if (err.code === "ENOENT") return null;
    throw err;
  });
  if (stat?.isSymbolicLink()) {
    throw new Error(`refusing to follow symlink: ${filePath}`);
  }
}

export async function readIfExists(targetDir: string, filePath: string): Promise<string | null> {
  try {
    const safe = await safePath(targetDir, filePath);
    await rejectLeafSymlink(safe);
    const handle = await fs.open(safe, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      return await handle.readFile("utf8");
    } finally {
      await handle.close();
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeFileMkdir(
  targetDir: string,
  filePath: string,
  content: string,
): Promise<void> {
  const safe = await safePath(targetDir, filePath);
  const parent = path.dirname(safe);
  await fs.mkdir(parent, { recursive: true });
  const verified = await safePath(targetDir, filePath);
  await rejectLeafSymlink(verified);

  const temp = path.join(path.dirname(verified), `.kevin-${randomUUID()}.tmp`);
  const handle = await fs.open(
    temp,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o644,
  );
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await fs.rename(temp, verified);
  } catch (err) {
    await fs.unlink(temp).catch(() => {});
    throw err;
  }
}

export async function ensureTargetExists(
  targetDir: string,
  options: { create?: boolean; allowMissing?: boolean } = {},
): Promise<void> {
  const stat = await fs.lstat(targetDir).catch(() => null);
  if (!stat && options.create) {
    await fs.mkdir(targetDir, { recursive: true });
    return;
  }
  if (!stat && options.allowMissing) return;
  if (!stat) throw new Error(`target directory does not exist: ${targetDir}`);
  if (stat.isSymbolicLink()) throw new Error(`refusing to use symlink target: ${targetDir}`);
  if (!stat.isDirectory()) throw new Error(`target is not a directory: ${targetDir}`);
}

export async function removeFile(targetDir: string, filePath: string): Promise<boolean> {
  const safe = await safePath(targetDir, filePath);
  try {
    await rejectLeafSymlink(safe);
    await fs.unlink(safe);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

export async function removeDirIfEmpty(targetDir: string, dirPath: string): Promise<boolean> {
  try {
    const safe = await safePath(targetDir, path.join(dirPath, ".kevin-dir-check"));
    const dir = path.dirname(safe);
    const stat = await fs.lstat(dir);
    if (stat.isSymbolicLink()) throw new Error(`refusing to follow symlink: ${dirPath}`);
    await fs.rmdir(dir);
    return true;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTEMPTY") return false;
    throw err;
  }
}
