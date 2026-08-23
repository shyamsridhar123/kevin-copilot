---
name: enlighten
description: Explain a topic to someone with no background, as a self-contained HTML picture explainer. Use when the user types /enlighten <topic> or asks for a dead-simple picture explanation of how something works.
---

# enlighten

Explain like I'm someone who knows nothing about this topic, using a self-contained
HTML page with big pictures and few words per idea.

Topic: $ARGUMENTS

> This is the one verbose mode in this repo. Everything else here cuts words.
> Enlighten spends them, because a reader who does not know the topic cannot
> expand a fragment.

If the topic is a repository or a path, read the source first and explain what is
actually there. Never explain from the name alone.

## Write it for someone with no background

- Short sentences. Everyday words. If a term needs defining, use a different term.
- One idea per section, with a picture for it.
- Concrete analogies over abstractions: a bus, a thermostat, a locked door.
- Keep the interesting parts. Simple does not mean shallow. The clever detail is
  usually the reason the thing exists, so find a plain-language version of it
  rather than dropping it.
- If the source states limits, bugs, or gaps, say so plainly at the end. An
  explainer that only flatters is not an explanation.
- Still no filler: no preamble, no closing recap.

## Layout rules, so the artifact does not break

Text bleeding out of its box is the failure mode of this skill. It happens when
labels are positioned by hand. Avoid it structurally:

- **Lay out with HTML and flexbox, never with hand-placed coordinates.** Use
  `display:flex; flex-wrap:wrap` rows of boxes. Text then wraps and boxes size to
  their contents on any screen.
- **Use SVG only for pure geometry** with no text in it: circles, arrows, bars.
  The moment a diagram needs a label, put the label in HTML next to or beneath the
  SVG.
- **Never put `<text>` inside SVG.** SVG text does not wrap, and its width depends
  on whichever font the viewer has installed, so every hand-placed label is a
  guess that breaks on someone else's machine.
- Emoji and unicode arrows make good picture elements and cost nothing.
- Cap prose at about `max-width: 46ch` so lines stay readable.
- Give the page a mobile breakpoint: shrink the glyphs, and rotate horizontal
  arrows 90 degrees when the row stacks into a column.

## Verify before saying it is done

Do not trust a screenshot for layout. Serve the file, then measure:

- Compare `document.documentElement.scrollWidth` against `clientWidth`. They must
  match, or something is overflowing horizontally.
- For each element, check `getBoundingClientRect().right` against its parent's
  right edge. Nothing should exceed it.
- Check at a narrow width (375px) and a wide one.

Report the measurements. A screenshot can be cropped by the capture tool and show
clipping that is not really there, which reads as a bug you then chase for nothing.
