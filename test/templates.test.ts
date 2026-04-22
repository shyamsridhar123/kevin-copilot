import { test } from "node:test";
import * as assert from "node:assert/strict";
import { planFiles, type Intensity } from "../src/templates";

const FORBIDDEN = [
  "dunder",
  "mifflin",
  "scranton",
  "malone",
  "chili",
  "pretzel",
  "kevin malone",
  "kev-in",
  "the office",
];

const INTENSITIES: Intensity[] = ["lite", "full", "ultra"];

for (const intensity of INTENSITIES) {
  test(`planFiles(${intensity}): produces 8 files at expected paths`, () => {
    const files = planFiles(intensity);
    const paths = files.map((f) => f.path).sort();
    assert.deepEqual(paths, [
      ".github/agents/kevin-full.agent.md",
      ".github/agents/kevin-lite.agent.md",
      ".github/agents/kevin-ultra.agent.md",
      ".github/copilot-instructions.md",
      ".github/prompts/kevin-commit.prompt.md",
      ".github/prompts/kevin-help.prompt.md",
      ".github/prompts/kevin-review.prompt.md",
      "AGENTS.md",
    ]);
  });

  test(`planFiles(${intensity}): no forbidden tokens present`, () => {
    const files = planFiles(intensity);
    for (const f of files) {
      const lower = f.content.toLowerCase();
      for (const bad of FORBIDDEN) {
        assert.equal(
          lower.includes(bad),
          false,
          `${f.path} contains forbidden token "${bad}"`,
        );
      }
    }
  });

  test(`planFiles(${intensity}): copilot-instructions carries trigger phrases`, () => {
    const files = planFiles(intensity);
    const main = files.find((f) => f.path === ".github/copilot-instructions.md");
    assert.ok(main);
    assert.match(main!.content, /talk like Kevin/);
    assert.match(main!.content, /fewer words/);
    assert.match(main!.content, /stop Kevin/);
  });

  test(`planFiles(${intensity}): AGENTS.md mirrors identity notice`, () => {
    const files = planFiles(intensity);
    const agents = files.find((f) => f.path === "AGENTS.md");
    assert.ok(agents);
    assert.match(agents!.content, /label, not a character/i);
  });
}

test("agents: each declares frontmatter with description", () => {
  const files = planFiles("lite");
  for (const f of files) {
    if (!f.path.includes(".agent.md")) continue;
    assert.match(f.content, /^---\n/);
    assert.match(f.content, /\ndescription: /);
  }
});

test("commit prompt: declares frontmatter and conventional-commits rule", () => {
  const files = planFiles("lite");
  const p = files.find((f) => f.path === ".github/prompts/kevin-commit.prompt.md");
  assert.ok(p);
  assert.match(p!.content, /^---\n/);
  assert.match(p!.content, /Conventional Commits/);
});

test("review prompt: declares frontmatter and single-line-comment rule", () => {
  const files = planFiles("lite");
  const p = files.find((f) => f.path === ".github/prompts/kevin-review.prompt.md");
  assert.ok(p);
  assert.match(p!.content, /^---\n/);
  assert.match(p!.content, /description: /);
  assert.match(p!.content, /L<line>/);
});

test("help prompt: declares frontmatter and lists modes", () => {
  const files = planFiles("lite");
  const p = files.find((f) => f.path === ".github/prompts/kevin-help.prompt.md");
  assert.ok(p);
  assert.match(p!.content, /^---\n/);
  assert.match(p!.content, /description: /);
  assert.match(p!.content, /lite/i);
  assert.match(p!.content, /full/i);
  assert.match(p!.content, /ultra/i);
});

for (const intensity of INTENSITIES) {
  test(`planFiles(${intensity}): response footer is declared in instructions, agents, and all agent modes`, () => {
    const files = planFiles(intensity);
    const footer = "— saved ~N tokens vs baseline";
    const main = files.find((f) => f.path === ".github/copilot-instructions.md");
    assert.ok(main);
    assert.ok(main!.content.includes(footer), "copilot-instructions missing footer");
    const agents = files.find((f) => f.path === "AGENTS.md");
    assert.ok(agents);
    assert.ok(agents!.content.includes(footer), "AGENTS.md missing footer");
    for (const f of files) {
      if (!f.path.includes(".agent.md")) continue;
      assert.ok(f.content.includes(footer), `${f.path} missing footer`);
    }
  });
}
