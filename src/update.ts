import { install, type InstallParams, type InstallResult } from "./install";
import { uninstall, managedPaths } from "./uninstall";
import { readIfExists, removeFile, resolveInside, writeFileMkdir } from "./fs";

export type UpdateParams = Omit<InstallParams, "force">;

export async function update(params: UpdateParams): Promise<InstallResult> {
  if (params.dryRun) {
    await uninstall({
      targetDir: params.targetDir,
      dryRun: true,
      scope: params.scope,
      log: params.log,
    });
    return install({ ...params, force: !params.merge });
  }

  const scope = params.scope ?? "project";
  const snapshots = new Map<string, string | null>();
  for (const relPath of managedPaths(scope)) {
    const abs = resolveInside(params.targetDir, relPath);
    snapshots.set(relPath, await readIfExists(params.targetDir, abs));
  }

  try {
    await uninstall({
      targetDir: params.targetDir,
      dryRun: false,
      scope,
      log: params.log,
    });
    const result = await install({ ...params, force: !params.merge });
    if (result.aborted) throw new Error("update aborted by user");
    return result;
  } catch (err) {
    for (const [relPath, content] of snapshots) {
      const abs = resolveInside(params.targetDir, relPath);
      if (content === null) {
        await removeFile(params.targetDir, abs);
      } else {
        await writeFileMkdir(params.targetDir, abs, content);
      }
    }
    throw err;
  }
}
