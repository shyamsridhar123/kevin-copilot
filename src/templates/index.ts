import { renderCopilotInstructions, type Intensity } from "./copilot-instructions";
import { renderAgentsMd } from "./agents";
import { chatmodeLite, chatmodeFull, chatmodeUltra, chatmodeAccountant } from "./chatmodes";
import { promptCommit, promptReview, promptHelp } from "./prompts";

export type { Intensity };

export interface PlannedFile {
  /** Repo-relative POSIX-style path. */
  path: string;
  content: string;
}

export function planFiles(intensity: Intensity): PlannedFile[] {
  return [
    {
      path: "AGENTS.md",
      content: renderAgentsMd(intensity),
    },
    {
      path: ".github/copilot-instructions.md",
      content: renderCopilotInstructions(intensity),
    },
    {
      path: ".github/agents/kevin-lite.agent.md",
      content: chatmodeLite,
    },
    {
      path: ".github/agents/kevin-full.agent.md",
      content: chatmodeFull,
    },
    {
      path: ".github/agents/kevin-ultra.agent.md",
      content: chatmodeUltra,
    },
    {
      path: ".github/agents/kevin-accountant.agent.md",
      content: chatmodeAccountant,
    },
    {
      path: ".github/prompts/kevin-commit.prompt.md",
      content: promptCommit,
    },
    {
      path: ".github/prompts/kevin-review.prompt.md",
      content: promptReview,
    },
    {
      path: ".github/prompts/kevin-help.prompt.md",
      content: promptHelp,
    },
  ];
}
