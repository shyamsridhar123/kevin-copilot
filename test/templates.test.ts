import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { planFiles, type Intensity } from "../src/templates";

const INTENSITIES: Intensity[] = ["lite", "full", "ultra", "adhd", "accountant"];
const PROJECT_PATHS = [
  ".github/agents/kevin-accountant.agent.md",
  ".github/agents/kevin-adhd.agent.md",
  ".github/agents/kevin-enlighten.agent.md",
  ".github/agents/kevin-full.agent.md",
  ".github/agents/kevin-lite.agent.md",
  ".github/agents/kevin-ultra.agent.md",
  ".github/copilot-instructions.md",
  ".github/prompts/kevin-commit.prompt.md",
  ".github/prompts/kevin-help.prompt.md",
  ".github/prompts/kevin-review.prompt.md",
  ".github/skills/kevin-commit/SKILL.md",
  ".github/skills/kevin-compress/SKILL.md",
  ".github/skills/kevin-enlighten/SKILL.md",
  ".github/skills/kevin-help/SKILL.md",
  ".github/skills/kevin-merit/SKILL.md",
  ".github/skills/kevin-review/SKILL.md",
];

for (const intensity of INTENSITIES) {
  test(`planFiles(${intensity}): produces portable project bundle`, () => {
    assert.deepEqual(planFiles(intensity).map((file) => file.path).sort(), PROJECT_PATHS);
  });

  test(`planFiles(${intensity}): uses the selected canonical mode`, () => {
    const instructions = planFiles(intensity).find(
      (file) => file.path === ".github/copilot-instructions.md",
    );
    assert.ok(instructions);
    assert.match(instructions.content.toLowerCase(), new RegExp(`mode: kevin ${intensity}`));
    assert.match(instructions.content, /talk like Kevin/);
  });
}

test("project bundle avoids duplicate AGENTS.md by default", () => {
  assert.equal(planFiles("lite").some((file) => file.path === "AGENTS.md"), false);
  assert.equal(
    planFiles("lite", { includeAgentsMd: true }).some((file) => file.path === "AGENTS.md"),
    true,
  );
});

test("personal bundle uses ~/.copilot-relative paths and omits VS Code prompts", () => {
  const files = planFiles("lite", { scope: "personal" });
  assert.equal(files.length, 13);
  assert.ok(files.some((file) => file.path === "copilot-instructions.md"));
  assert.ok(files.some((file) => file.path === "skills/kevin-compress/SKILL.md"));
  assert.equal(files.some((file) => file.path.includes("prompts/")), false);
});

test("agents use portable tools and explicit manual invocation", () => {
  for (const file of planFiles("lite").filter((item) => item.path.endsWith(".agent.md"))) {
    assert.match(file.content, /name: kevin-/);
    assert.match(file.content, /tools: \["read", "edit", "search", "execute"\]/);
    assert.match(file.content, /user-invocable: true/);
    assert.match(file.content, /disable-model-invocation: true/);
    assert.doesNotMatch(file.content, /codebase|editFiles|terminalLastCommand/);
  }
});

test("Lite, Full, and Ultra expose compression handoffs", () => {
  const files = planFiles("lite");
  for (const name of ["lite", "full", "ultra"]) {
    const agent = files.find((file) => file.path.endsWith(`kevin-${name}.agent.md`));
    assert.ok(agent);
    assert.match(agent.content, /handoffs:/);
  }
});

test("skills and prompts declare names and descriptions", () => {
  for (const file of planFiles("lite")) {
    if (!file.path.endsWith("SKILL.md") && !file.path.endsWith(".prompt.md")) continue;
    assert.match(file.content, /^---\n/);
    assert.match(file.content, /\nname: kevin-/);
    assert.match(file.content, /\ndescription: /);
  }
});

test("token receipt is disabled by default and opt-in", () => {
  const footer = "— saved ~N tokens vs baseline";
  assert.equal(planFiles("lite").some((file) => file.content.includes(footer)), false);
  const enabled = planFiles("lite", { tokenReceipt: true });
  assert.ok(
    enabled.find((file) => file.path === ".github/copilot-instructions.md")!.content.includes(footer),
  );
  assert.ok(
    enabled.find((file) => file.path.endsWith("kevin-lite.agent.md"))!.content.includes(footer),
  );
});

test("the cost ladder is always on, not just when merit is invoked", () => {
  // A skill only runs when asked. If the ladder lives solely in kevin-merit, the
  // agent still writes the 300-line class and merit only bills for it afterwards.
  for (const intensity of INTENSITIES) {
    const instructions = planFiles(intensity).find(
      (file) => file.path === ".github/copilot-instructions.md",
    );
    assert.ok(instructions);
    assert.match(instructions.content, /standard library/);
    assert.match(instructions.content, /Never add a dependency on your own/);
    assert.match(instructions.content, /Deleting code is a valid answer/);
  }
  // The plugin agents carry it too, or plugin users get the prose half only.
  for (const agent of ["lite", "full", "ultra", "adhd", "accountant"]) {
    const mirror = fs.readFileSync(
      path.join(__dirname, "..", "plugin", "agents", `kevin-${agent}.agent.md`),
      "utf8",
    );
    assert.match(mirror, /Deleting code is a valid answer/);
  }
});

test("enlighten is not a selectable intensity", () => {
  // It is not a compression level, so it must not become a repo's default voice.
  const instructions = planFiles("lite").find(
    (file) => file.path === ".github/copilot-instructions.md",
  );
  assert.ok(instructions);
  assert.doesNotMatch(instructions.content, /enlighten/i);
});

test("enlighten ships as both an agent and a skill, from one doctrine", () => {
  const files = planFiles("lite");
  const agent = files.find((f) => f.path === ".github/agents/kevin-enlighten.agent.md");
  const skill = files.find((f) => f.path === ".github/skills/kevin-enlighten/SKILL.md");
  assert.ok(agent);
  assert.ok(skill);
  for (const file of [agent, skill]) {
    // The layout rule that this mode exists to enforce.
    assert.match(file.content, /Never put `<text>` inside SVG/);
    assert.match(file.content, /flexbox/);
    // It does not compress, so a compression receipt would be a false number.
    assert.match(file.content, /Do not add a token receipt/);
  }
});

test("enlighten opts out of the token receipt even when it is enabled", () => {
  const files = planFiles("lite", { tokenReceipt: true });
  const agent = files.find((f) => f.path === ".github/agents/kevin-enlighten.agent.md");
  assert.ok(agent);
  assert.doesNotMatch(agent.content, /— saved ~N tokens vs baseline/);
});

test("merit scores a diff, never a person", () => {
  // The satire targets the ceremony; pointing it at a human is the failure mode.
  const files = planFiles("lite");
  const skill = files.find((f) => f.path === ".github/skills/kevin-merit/SKILL.md");
  const mirror = fs.readFileSync(
    path.join(__dirname, "..", "plugin", "skills", "kevin-merit", "SKILL.md"),
    "utf8",
  );
  assert.ok(skill);
  for (const body of [skill.content, mirror]) {
    assert.match(body, /scores a change, not a person/);
    assert.match(body, /refuse to run it against a contributor/i);
    // The band is derived from counted lines, not from an impression of the diff.
    assert.match(body, /git diff --numstat/);
    assert.match(body, /deletions > additions/);
  }
});

test("merit charges over-engineering through the cost-approval tiers", () => {
  const files = planFiles("lite");
  const skill = files.find((f) => f.path === ".github/skills/kevin-merit/SKILL.md");
  const mirror = fs.readFileSync(
    path.join(__dirname, "..", "plugin", "skills", "kevin-merit", "SKILL.md"),
    "utf8",
  );
  assert.ok(skill);
  for (const body of [skill.content, mirror]) {
    // Every tier below "write new code" must be reachable, or the ladder is decoration.
    for (const tier of [/standard library/i, /runtime, browser, or OS/i, /manifest/i]) {
      assert.match(body, tier);
    }
    // A new dependency is the one escape hatch the ladder must not offer.
    assert.match(body, /new dependency is not a tier/i);
    // The ladder has to move the band, otherwise it is advice the skill can ignore.
    assert.match(body, /caps the band at Meets/i);
    // The safety floor outranks the ladder; cheapness never deletes these.
    assert.match(body, /accessibility affordances/);
  }
});

test("plugin manifest points to discoverable agents and skills", () => {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "plugin", "plugin.json"), "utf8"));
  assert.equal(manifest.name, "kevin-copilot");
  assert.equal(manifest.agents, "agents/");
  assert.equal(manifest.skills, "skills/");
  assert.equal(
    fs.readdirSync(path.join(root, "plugin", "agents")).filter((name) => name.endsWith(".agent.md")).length,
    6,
  );
  assert.equal(fs.readdirSync(path.join(root, "plugin", "skills")).length, 6);
});

test("plugin mirrors carry the enlighten layout rule", () => {
  const root = path.resolve(__dirname, "..");
  for (const rel of [
    ["plugin", "agents", "kevin-enlighten.agent.md"],
    ["plugin", "skills", "kevin-enlighten", "SKILL.md"],
  ]) {
    const body = fs.readFileSync(path.join(root, ...rel), "utf8");
    assert.match(body, /Never put `<text>` inside SVG/);
    assert.match(body, /Do not add a token receipt/);
  }
});
