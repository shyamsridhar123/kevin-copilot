import { parseArgs } from "node:util";
import type { Intensity } from "./templates";

export interface InitOptions {
  command: "init";
  targetDir: string;
  intensity: Intensity;
  force: boolean;
  merge: boolean;
  dryRun: boolean;
}

export interface HelpOptions {
  command: "help";
}

export interface VersionOptions {
  command: "version";
}

export type ParsedArgs = InitOptions | HelpOptions | VersionOptions;

const VALID_INTENSITIES: readonly Intensity[] = ["lite", "full", "ultra"] as const;

function isIntensity(s: string): s is Intensity {
  return (VALID_INTENSITIES as readonly string[]).includes(s);
}

export function parse(argv: string[]): ParsedArgs {
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "--help" || argv[0] === "-h") {
    return { command: "help" };
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    return { command: "version" };
  }

  if (argv[0] !== "init") {
    throw new Error(`unknown command: ${argv[0]}`);
  }

  const { values } = parseArgs({
    args: argv.slice(1),
    options: {
      target: { type: "string", default: "." },
      intensity: { type: "string", default: "lite" },
      force: { type: "boolean", default: false },
      merge: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  const intensity = values.intensity as string;
  if (!isIntensity(intensity)) {
    throw new Error(
      `invalid --intensity: ${intensity}. expected one of: ${VALID_INTENSITIES.join(", ")}`,
    );
  }

  if (values.force && values.merge) {
    throw new Error("--force and --merge are mutually exclusive");
  }

  return {
    command: "init",
    targetDir: values.target as string,
    intensity,
    force: values.force as boolean,
    merge: values.merge as boolean,
    dryRun: values["dry-run"] as boolean,
  };
}

export const HELP_TEXT = `kevin-copilot — Copilot-native terseness kit.

Usage:
  kevin-copilot init [--target <dir>] [--intensity lite|full|ultra]
                     [--force | --merge] [--dry-run]
  kevin-copilot --help
  kevin-copilot --version

Flags:
  --target <dir>       Target directory. Default: current directory.
  --intensity <level>  lite (default) | full | ultra
  --force              Overwrite conflicting files without prompting.
  --merge              Append Kevin sections to existing instructions/AGENTS.
  --dry-run            Print planned writes, do not touch disk.

Writes:
  AGENTS.md
  .github/copilot-instructions.md
  .github/chatmodes/kevin-{lite,full,ultra}.chatmode.md
  .github/prompts/kevin-commit.prompt.md
`;
