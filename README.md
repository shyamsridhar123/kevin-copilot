# kevin-copilot

Portable concise-response customizations for GitHub Copilot.

Kevin provides repository instructions, six manually selected agents, five cross-surface skills, VS Code prompt files, and an installable Copilot plugin.

![Kevin compressing a Copilot response](media/kevin.gif)

## Choose an installation model

### Project mode

Commit Kevin to one repository for predictable team-wide behavior:

```bash
npx kevin-copilot init
```

Project mode writes:

```text
.github/
  copilot-instructions.md
  agents/kevin-{lite,full,ultra,adhd,accountant,enlighten}.agent.md
  skills/kevin-{compress,commit,review,help,enlighten}/SKILL.md
  prompts/kevin-{commit,review,help}.prompt.md
```

Kevin does not write `AGENTS.md` by default. Loading both `AGENTS.md` and `.github/copilot-instructions.md` repeats the same voice rules and wastes instruction tokens. Use `--agents-md` only when compatibility with tools that do not read Copilot instructions is more important than that overhead.

### Personal mode

Install Kevin under `~/.copilot` so it follows your Copilot CLI sessions without modifying repositories:

```bash
npx kevin-copilot init --scope personal
```

`COPILOT_HOME` is honored. Personal mode installs instructions, agents, and skills. Use `--target` to override the destination.

### Plugin mode

Install the native plugin directly from this repository:

```bash
copilot plugin install shyamsridhar123/kevin-copilot:plugin
```

Or register the repository marketplace:

```bash
copilot plugin marketplace add shyamsridhar123/kevin-copilot
copilot plugin install kevin-copilot@kevin-copilot
```

Verify inside a session with `/agent` (agent picker) and `/skills` (skill list), or from the shell:

```bash
copilot plugin list
copilot plugins list --kind plugin --kind skill
```

Use agents non-interactively with `copilot --agent kevin-ultra`.

For Copilot cloud agent and the Copilot app, enable the marketplace plugin in `.github/copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "kevin-copilot": {
      "source": {
        "source": "github",
        "repo": "shyamsridhar123/kevin-copilot"
      }
    }
  },
  "enabledPlugins": {
    "kevin-copilot@kevin-copilot": true
  }
}
```

## Modes

| Mode | Output shape |
|---|---|
| Lite | Short paragraphs; code first |
| Full | Fragments, bullets, minimal prose |
| Ultra | `label:value` or code-only |
| ADHD | Next action first; bounded steps; visible state |
| Accountant | Metrics and ledger-style line items |

Select a project or personal default:

```bash
npx kevin-copilot init --intensity accountant
```

Voice agents use portable `read`, `edit`, `search`, and `execute` tool aliases. They set `disable-model-invocation: true`, so Copilot will not infer a voice agent from task context; select one explicitly. Lite, Full, and Ultra include VS Code handoffs for changing compression.

### Enlighten, the exception

Every mode above cuts words. `kevin-enlighten` spends them: it produces a self-contained HTML picture explainer for a reader with no background on the topic.

Terseness works when the reader can expand a fragment from context they already have. A beginner cannot, so a fragment costs them a search instead of saving them a read. Enlighten keeps the rest of the voice — no preamble, no closing recap — and drops only the length limit. Few words per idea, not few ideas.

It is deliberately not an `--intensity` value. The intensities are compression levels and one of them becomes a repo's default voice; making Enlighten selectable there would let a repository default to verbose. It ships as an agent and a skill you invoke explicitly, and it never emits a token receipt, because a receipt estimates compression and this mode does not compress.

## Skills

Agent Skills work in Copilot cloud agent, code review, Copilot CLI, the Copilot app, and supported IDE agent modes.

- `kevin-compress` — compress an answer without dropping required details
- `kevin-commit` — generate a Conventional Commits message
- `kevin-review` — emit concise, evidence-backed review findings
- `kevin-help` — show modes and controls
- `kevin-enlighten` — explain a topic as an HTML picture explainer (the one verbose skill)

Prompt files remain available in VS Code as `/kevin-commit`, `/kevin-review`, and `/kevin-help`. Other surfaces use the equivalent skills.

## CLI

```text
kevin-copilot init [--scope project|personal] [--target <dir>]
                    [--intensity lite|full|ultra|adhd|accountant]
                    [--force|--merge] [--token-receipt] [--agents-md] [--dry-run]
kevin-copilot update [same options, except --force]
kevin-copilot uninstall [--scope project|personal] [--target <dir>] [--dry-run]
```

- `--merge` preserves existing instruction content inside sentinel markers.
- `--token-receipt` opts into the model-estimated `saved ~N tokens` footer.
- `/instructions` in Copilot CLI shows loaded instructions and provides a temporary disable/debug mechanism.

## Path-specific verbosity

Teams can add `.github/instructions/*.instructions.md` files when code, tests, or documentation need different output shapes. For example:

```markdown
---
applyTo: "docs/**"
---

Use Kevin Lite output. Preserve explanations needed by documentation readers.
```

Keep the repository-wide voice in `.github/copilot-instructions.md`; path-specific files should contain only the delta.

## Surface support

| Asset | VS Code | Copilot CLI | GitHub.com/cloud |
|---|:---:|:---:|:---:|
| Copilot instructions | Yes | Yes | Yes |
| Custom agents | Yes | Yes | Yes |
| Agent Skills | Yes | Yes | Yes |
| Prompt files | Yes | No | No |
| Plugins | Preview | Yes | Yes |

The Copilot app consumes the same repository and plugin customizations. Kevin does not ship a VS Code extension or MCP server because it needs no custom UI or external tools.

## Verification status

What is verified by running this repository:

| Claim | How it is checked | Status |
|---|---|---|
| Project install writes 15 files under `.github/` | `kevin-copilot init --target <dir>`, `npm test` | Verified |
| Personal install writes 12 files under `~/.copilot` and omits prompt files | `kevin-copilot init --scope personal --target <dir>`, `npm test` | Verified |
| Uninstall removes generated files and empty directories, skips modified files | `kevin-copilot uninstall [--scope personal]`, `npm test` | Verified |
| Agents are manual-only (`disable-model-invocation: true`) and use portable tools | `npm test` | Verified |
| Token receipts are off unless `--token-receipt` is passed | `npm test` | Verified |
| Plugin manifest exposes six agents and five skills | `npm test` | Verified |
| Response tokens drop 50–90% on fixtures | `npm run evals` | Verified on synthetic fixtures only |
| Live Copilot models obey the voice rules | Not automated | Unverified |
| Latency, semantic equivalence, production token savings | Not automated | Unverified |

`npm run evals` is an offline synthetic fixture benchmark. It counts tokens in hand-authored answers; it does **not** prove model compliance, semantic equivalence, latency, or production token savings. The token receipt is off by default because a model estimate is not telemetry.

Real evaluation should run repeated prompts against supported Copilot models and record:

- instruction and response tokens
- end-to-end latency
- semantic correctness and required-information checks
- preserved safety warnings
- agent discovery and available tools

## Development

```bash
npm install
npm run build
npm test
npm run evals
```

Requires Node.js 18 or later.

## Uninstall

```bash
npx kevin-copilot uninstall
npx kevin-copilot uninstall --scope personal
```

Exact generated files are removed. Merged instruction blocks are cleaned while surrounding content is preserved. Modified files are skipped.

## License

MIT
