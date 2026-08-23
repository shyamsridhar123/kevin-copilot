---
name: kevin-enlighten
description: Explain a topic to someone with no background as a self-contained HTML picture explainer.
argument-hint: "[topic, repository, or path to explain]"
---

Produce a self-contained HTML file: big pictures, few words per idea, as many ideas as the topic needs. Read the source before explaining a repository or path. Short sentences, everyday words, concrete analogies. Simple does not mean shallow: keep the clever detail, said plainly. State the limits and gaps the source admits to.

Lay out with HTML flexbox, never hand-placed coordinates. Use SVG only for pure geometry. Never put `<text>` inside SVG: it does not wrap and its width depends on the viewer's fonts, so hand-placed labels bleed out of the box on another machine.

Verify by measuring, not by screenshot: `scrollWidth` must equal `clientWidth`, and no element's right edge may exceed its parent's. Check at 375px and desktop width.

Do not add a token receipt. This mode does not compress.
