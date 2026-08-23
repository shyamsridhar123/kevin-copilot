import { renderCopilotInstructions } from "./copilot-instructions";
import { renderAgentsMd } from "./agents";
import { renderAgent } from "./chatmodes";
import { promptCommit, promptReview, promptHelp } from "./prompts";
import { skills } from "./skills";
import { agentEnlighten, skillEnlighten } from "./enlighten";
import type { Intensity, VoiceOptions } from "./voice";

export type { Intensity };
export type InstallScope = "project" | "personal";

export interface PlannedFile {
  /** Repo-relative POSIX-style path. */
  path: string;
  content: string;
}

export interface PlanOptions extends VoiceOptions {
  scope?: InstallScope;
  includeAgentsMd?: boolean;
}

const intensities: Intensity[] = ["lite", "full", "ultra", "adhd", "accountant"];

export function planFiles(intensity: Intensity, options: PlanOptions = {}): PlannedFile[] {
  const scope = options.scope ?? "project";
  const prefix = scope === "project" ? ".github/" : "";
  const files: PlannedFile[] = [
    {
      path: `${prefix}copilot-instructions.md`,
      content: renderCopilotInstructions(intensity, options),
    },
  ];

  for (const mode of intensities) {
    files.push({
      path: `${prefix}agents/kevin-${mode}.agent.md`,
      content: renderAgent(mode, options),
    });
  }

  // Not part of `intensities`: Enlighten is not a compression level and must
  // not be selectable as a repo's default voice.
  files.push({ path: `${prefix}agents/kevin-enlighten.agent.md`, content: agentEnlighten });

  for (const [name, content] of Object.entries(skills)) {
    files.push({ path: `${prefix}skills/${name}/SKILL.md`, content });
  }

  files.push({ path: `${prefix}skills/kevin-enlighten/SKILL.md`, content: skillEnlighten });

  if (scope === "project") {
    files.push(
      { path: ".github/prompts/kevin-commit.prompt.md", content: promptCommit },
      { path: ".github/prompts/kevin-review.prompt.md", content: promptReview },
      { path: ".github/prompts/kevin-help.prompt.md", content: promptHelp },
    );
  }

  if (options.includeAgentsMd) {
    files.unshift({ path: "AGENTS.md", content: renderAgentsMd(intensity, options) });
  }

  return files;
}
