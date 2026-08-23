import { parseArgs } from "node:util";
import * as path from "node:path";
import * as os from "node:os";
import { planFiles, type InstallScope, type Intensity } from "./templates";

export interface InitOptions {
  command: "init" | "update";
  targetDir: string;
  intensity: Intensity;
  force: boolean;
  merge: boolean;
  dryRun: boolean;
  scope: InstallScope;
  tokenReceipt: boolean;
  includeAgentsMd: boolean;
}

export interface UninstallOptions {
  command: "uninstall";
  targetDir: string;
  dryRun: boolean;
  scope: InstallScope;
}

export interface HelpOptions {
  command: "help";
}

export interface VersionOptions {
  command: "version";
}

export type ParsedArgs = InitOptions | UninstallOptions | HelpOptions | VersionOptions;

type InitCommand = "init" | "update";

const VALID_INTENSITIES: readonly Intensity[] = ["lite", "full", "ultra", "adhd", "accountant"] as const;
const VALID_SCOPES: readonly InstallScope[] = ["project", "personal"] as const;

function isIntensity(s: string): s is Intensity {
  return (VALID_INTENSITIES as readonly string[]).includes(s);
}

function parseScope(value: string): InstallScope {
  if (!(VALID_SCOPES as readonly string[]).includes(value)) {
    throw new Error(`invalid --scope: ${value}. expected one of: ${VALID_SCOPES.join(", ")}`);
  }
  return value as InstallScope;
}

function defaultTarget(scope: InstallScope): string {
  return scope === "personal"
    ? process.env.COPILOT_HOME ?? path.join(os.homedir(), ".copilot")
    : ".";
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
        target: { type: "string" },
        scope: { type: "string", default: "project" },
        "dry-run": { type: "boolean", default: false },
      },
      strict: true,
      allowPositionals: false,
    });
    const scope = parseScope(values.scope as string);
    return {
      command: "uninstall",
      targetDir: values.target as string | undefined ?? defaultTarget(scope),
      dryRun: values["dry-run"] as boolean,
      scope,
    };
  }

  if (argv[0] !== "init" && argv[0] !== "update") {
    throw new Error(`unknown command: ${argv[0]}`);
  }

  const cmd = argv[0] as InitCommand;

  const { values } = parseArgs({
    args: argv.slice(1),
    options: {
      target: { type: "string" },
      scope: { type: "string", default: "project" },
      intensity: { type: "string", default: "lite" },
      force: { type: "boolean", default: false },
      merge: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      "token-receipt": { type: "boolean", default: false },
      "agents-md": { type: "boolean", default: false },
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
  const scope = parseScope(values.scope as string);

  if (values.force && values.merge) {
    throw new Error("--force and --merge are mutually exclusive");
  }

  if (cmd === "update" && values.force) {
    throw new Error("--force is not needed with update (force is implicit when --merge is not set)");
  }

  return {
    command: cmd,
    targetDir: values.target as string | undefined ?? defaultTarget(scope),
    intensity,
    force: values.force as boolean,
    merge: values.merge as boolean,
    dryRun: values["dry-run"] as boolean,
    scope,
    tokenReceipt: values["token-receipt"] as boolean,
    includeAgentsMd: values["agents-md"] as boolean,
  };
}

/**
 * The file list in --help, derived from the templates rather than copied. A
 * hardcoded list goes stale every time a template is added and no test notices.
 */
function writtenPaths(): string {
  return planFiles("lite")
    .map((file) => `  ${file.path}`)
    .join("\n");
}

export const HELP_TEXT = `kevin-copilot — terseness kit for GitHub Copilot.
Shrinks responses across VS Code Chat, Copilot CLI, cloud agent, and code review.

Usage:
  kevin-copilot init [--scope project|personal] [--target <dir>]
                     [--intensity lite|full|ultra|adhd|accountant]
                     [--force | --merge] [--token-receipt] [--agents-md] [--dry-run]
  kevin-copilot update [same options, except --force]
  kevin-copilot uninstall [--scope project|personal] [--target <dir>] [--dry-run]
  kevin-copilot --help
  kevin-copilot --version

Commands:
  init           Install Kevin files into your repo.
  update         Remove old files and re-install with latest templates.
  uninstall      Remove all Kevin files from your repo.

Flags (init / update):
  --scope <scope>      project (default) | personal (~/.copilot)
  --target <dir>       Override the scope's target directory.
  --intensity <level>  lite (default) | full | ultra | adhd | accountant
  --force              Overwrite conflicting files without prompting (init only).
  --merge              Append Kevin to an existing instruction file.
  --token-receipt      Add model-estimated token receipts (off by default).
  --agents-md          Also write AGENTS.md (may duplicate loaded instructions).
  --dry-run            Print planned actions, do not touch disk.

Flags (uninstall):
  --scope <scope>      project (default) | personal (~/.copilot)
  --target <dir>       Override the scope's target directory.
  --dry-run            Print planned removals, do not touch disk.

Writes (init / update):
${writtenPaths()}
`;
