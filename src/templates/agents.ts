import { renderVoice, type Intensity, type VoiceOptions } from "./voice";

export function renderAgentsMd(intensity: Intensity, options: VoiceOptions = {}): string {
  return `# Agent Instructions

${renderVoice(intensity, options)}`;
}
