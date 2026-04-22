import { parseArgs } from "node:util";
import type { Intensity } from "./templates";

export interface InitOptions {
  command: "init" | "update";
  targetDir: string;
  intensity: Intensity;
  force: boolean;
  merge: boolean;
  dryRun: boolean;
}

export interface UninstallOptions {
  command: "uninstall";
  targetDir: string;
  dryRun: boolean;
}

export interface HelpOptions {
  command: "help";
}

export interface VersionOptions {
  command: "version";
}

export type ParsedArgs = InitOptions | UninstallOptions | HelpOptions | VersionOptions;

type InitCommand = "init" | "update";

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

  if (argv[0] === "uninstall") {
    const { values } = parseArgs({
      args: argv.slice(1),
      options: {
        target: { type: "string", default: "." },
        "dry-run": { type: "boolean", default: false },
      },
      strict: true,
      allowPositionals: false,
    });
    return {
      command: "uninstall",
      targetDir: values.target as string,
      dryRun: values["dry-run"] as boolean,
    };
  }

  if (argv[0] !== "init" && argv[0] !== "update") {
    throw new Error(`unknown command: ${argv[0]}`);
  }

  const cmd = argv[0] as InitCommand;

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
    command: cmd,
    targetDir: values.target as string,
    intensity,
    force: values.force as boolean,
    merge: values.merge as boolean,
    dryRun: values["dry-run"] as boolean,
  };
}

export const HELP_TEXT = `kevin-copilot — terseness kit for GitHub Copilot.
Shrinks responses across VS Code Chat, Copilot CLI, cloud agent, and code review.

Usage:
  kevin-copilot init [--target <dir>] [--intensity lite|full|ultra]
                     [--force | --merge] [--dry-run]
  kevin-copilot update [--target <dir>] [--intensity lite|full|ultra]
                       [--merge] [--dry-run]
  kevin-copilot uninstall [--target <dir>] [--dry-run]
  kevin-copilot --help
  kevin-copilot --version

Commands:
  init           Install Kevin files into your repo.
  update         Remove old files and re-install with latest templates.
  uninstall      Remove all Kevin files from your repo.

Flags (init / update):
  --target <dir>       Target directory. Default: current directory.
  --intensity <level>  lite (default) | full | ultra
  --force              Overwrite conflicting files without prompting (init only).
  --merge              Append Kevin sections to existing instructions/AGENTS.
  --dry-run            Print planned actions, do not touch disk.

Flags (uninstall):
  --target <dir>       Target directory. Default: current directory.
  --dry-run            Print planned removals, do not touch disk.

Writes (init / update):
  AGENTS.md
  .github/copilot-instructions.md
  .github/agents/kevin-{lite,full,ultra}.agent.md
  .github/prompts/kevin-commit.prompt.md
  .github/prompts/kevin-review.prompt.md
  .github/prompts/kevin-help.prompt.md
`;
