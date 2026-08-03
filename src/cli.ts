#!/usr/bin/env node
import { parse, HELP_TEXT } from "./args";
import { install } from "./install";
import { uninstall } from "./uninstall";

// Keep in sync with package.json.
const VERSION = "0.4.0";

async function main(argv: string[]): Promise<number> {
  let parsed;
  try {
    parsed = parse(argv);
  } catch (err) {
    process.stderr.write(`kevin-copilot: ${(err as Error).message}\n`);
    process.stderr.write(HELP_TEXT);
    return 2;
  }

  if (parsed.command === "help") {
    process.stdout.write(HELP_TEXT);
    return 0;
  }
  if (parsed.command === "version") {
    process.stdout.write(VERSION + "\n");
    return 0;
  }

  try {
    if (parsed.command === "uninstall") {
      await uninstall({
        targetDir: parsed.targetDir,
        dryRun: parsed.dryRun,
        scope: parsed.scope,
      });
      return 0;
    }

    if (parsed.command === "update") {
      await uninstall({
        targetDir: parsed.targetDir,
        dryRun: parsed.dryRun,
        scope: parsed.scope,
      });
    }

    await install({
      targetDir: parsed.targetDir,
      intensity: parsed.intensity,
      force: parsed.command === "update" && !parsed.merge,
      merge: parsed.merge,
      dryRun: parsed.dryRun,
      scope: parsed.scope,
      tokenReceipt: parsed.tokenReceipt,
      includeAgentsMd: parsed.includeAgentsMd,
    });
    return 0;
  } catch (err) {
    process.stderr.write(`kevin-copilot: ${(err as Error).message}\n`);
    return 1;
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`kevin-copilot: unexpected: ${(err as Error).stack ?? err}\n`);
    process.exit(1);
  },
);
