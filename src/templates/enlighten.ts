import { ENLIGHTEN_DOCTRINE } from "./enlighten-doctrine";

/**
 * Enlighten is deliberately not an `Intensity`. The intensities are compression
 * levels and one of them becomes the repo-wide default voice; Enlighten is the
 * opposite instinct, so making it selectable that way would let a repo default
 * to verbose. It ships as a standalone agent and skill instead.
 */
export const agentEnlighten = `---
name: kevin-enlighten
description: "Explain a topic to someone with no background as a self-contained HTML picture explainer."
tools: ["read", "edit", "search", "execute"]
user-invocable: true
disable-model-invocation: true
---

# Kevin Enlighten

${ENLIGHTEN_DOCTRINE}
`;

export const skillEnlighten = `---
name: kevin-enlighten
description: Explain a topic to someone with no background as a self-contained HTML picture explainer.
argument-hint: "[topic, repository, or path to explain]"
---

${ENLIGHTEN_DOCTRINE}
`;
