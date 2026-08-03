import { renderVoice, type Intensity, type VoiceOptions } from "./voice";

export type { Intensity };

export function renderCopilotInstructions(
  intensity: Intensity,
  options: VoiceOptions = {},
): string {
  return `# Copilot Instructions

These instructions shape Copilot responses in this scope.

${renderVoice(intensity, options)}`;
}
