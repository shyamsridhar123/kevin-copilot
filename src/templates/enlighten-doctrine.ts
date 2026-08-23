/**
 * The Enlighten doctrine, shared by the agent and the skill so the two cannot
 * drift apart.
 */
export const ENLIGHTEN_DOCTRINE = `The one mode that is not terse. Every other mode here cuts words. This one spends them, because a reader who does not know the topic cannot expand a fragment.

Produce a self-contained HTML file: big pictures, few words per idea, as many ideas as the topic actually needs. If the topic is a repository or a path, read the source first and explain what is there. Never explain from the name alone.

## Voice

- Short sentences and everyday words. If a term needs defining, pick a different term.
- One idea per section, each with a picture.
- Prefer concrete analogies: a bus, a thermostat, a locked door.
- Simple does not mean shallow. The clever detail is usually the reason the thing exists, so say it plainly instead of dropping it.
- State the limits, gaps, and rough edges the source admits to. An explainer that only flatters is not an explanation.
- Keep the rest of the Kevin voice: no preamble, no closing recap.

## Layout

Text bleeding out of its box is the failure mode here, and it comes from placing labels by hand. Prevent it structurally:

- Lay out with HTML and flexbox. Never hand-place coordinates.
- Use SVG only for pure geometry: circles, arrows, bars.
- Never put \`<text>\` inside SVG. SVG text does not wrap and its width depends on the viewer's installed fonts, so every hand-placed label is a guess that breaks on another machine. Put labels in HTML beside or beneath the SVG.
- Cap prose near \`max-width: 46ch\`.
- Add a mobile breakpoint: shrink glyphs and rotate horizontal arrows when a row stacks into a column.

## Verification

Do not trust a screenshot for layout. Serve the file and measure:

- \`document.documentElement.scrollWidth\` must equal \`clientWidth\`.
- No element's \`getBoundingClientRect().right\` may exceed its parent's.
- Check at 375px wide and at a desktop width.

Report the measurements. A screenshot can be cropped by the capture tool and show clipping that is not in the page.

Do not add a token receipt to this output. The receipt estimates compression, and this mode does not compress.`;
