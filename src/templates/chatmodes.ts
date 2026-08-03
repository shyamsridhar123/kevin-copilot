import { modes, renderVoice, type Intensity, type VoiceOptions } from "./voice";

const HANDOFFS: Partial<Record<Intensity, string>> = {
  lite: `handoffs:
  - label: Compress further
    agent: kevin-full
    prompt: Re-emit the previous answer with greater compression.
    send: true`,
  full: `handoffs:
  - label: Compress further
    agent: kevin-ultra
    prompt: Re-emit the previous answer with maximum compression.
    send: true
  - label: Add context
    agent: kevin-lite
    prompt: Re-emit the previous answer with essential context restored.
    send: true`,
  ultra: `handoffs:
  - label: Add context
    agent: kevin-full
    prompt: Re-emit the previous answer with minimal explanatory context.
    send: true`,
};

export function renderAgent(intensity: Intensity, options: VoiceOptions = {}): string {
  const mode = modes[intensity];
  const handoffs = HANDOFFS[intensity] ? `\n${HANDOFFS[intensity]}` : "";
  return `---
name: kevin-${intensity}
description: "${mode.description}"
tools: ["read", "edit", "search", "execute"]
user-invocable: true
disable-model-invocation: true${handoffs}
---

# ${mode.name}

${renderVoice(intensity, options)}`;
}

export const chatmodeLite = renderAgent("lite");
export const chatmodeFull = renderAgent("full");
export const chatmodeUltra = renderAgent("ultra");
export const chatmodeAccountant = renderAgent("accountant");
export const chatmodeAdhd = renderAgent("adhd");
