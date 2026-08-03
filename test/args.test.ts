import { test } from "node:test";
import * as assert from "node:assert/strict";
import { parse } from "../src/args";

test("parse: init with defaults", () => {
  const r = parse(["init"]);
  assert.equal(r.command, "init");
  if (r.command !== "init") return;
  assert.equal(r.intensity, "lite");
  assert.equal(r.targetDir, ".");
  assert.equal(r.force, false);
  assert.equal(r.merge, false);
  assert.equal(r.dryRun, false);
});

test("parse: init with full flags", () => {
  const r = parse(["init", "--target", "/tmp/x", "--intensity", "full", "--force"]);
  assert.equal(r.command, "init");
  if (r.command !== "init") return;
  assert.equal(r.intensity, "full");
  assert.equal(r.targetDir, "/tmp/x");
  assert.equal(r.force, true);
});

test("parse: init with merge and dry-run", () => {
  const r = parse(["init", "--merge", "--dry-run", "--intensity", "ultra"]);
  assert.equal(r.command, "init");
  if (r.command !== "init") return;
  assert.equal(r.merge, true);
  assert.equal(r.dryRun, true);
  assert.equal(r.intensity, "ultra");
});

test("parse: rejects bogus intensity", () => {
  assert.throws(() => parse(["init", "--intensity", "extra-spicy"]), /invalid --intensity/);
});

test("parse: force and merge are mutually exclusive", () => {
  assert.throws(() => parse(["init", "--force", "--merge"]), /mutually exclusive/);
});

test("parse: help aliases", () => {
  assert.equal(parse([]).command, "help");
  assert.equal(parse(["help"]).command, "help");
  assert.equal(parse(["--help"]).command, "help");
  assert.equal(parse(["-h"]).command, "help");
});

test("parse: version aliases", () => {
  assert.equal(parse(["--version"]).command, "version");
  assert.equal(parse(["-v"]).command, "version");
});

test("parse: unknown command rejected", () => {
  assert.throws(() => parse(["launch"]), /unknown command/);
});

test("parse: uninstall with defaults", () => {
  const r = parse(["uninstall"]);
  assert.equal(r.command, "uninstall");
  if (r.command !== "uninstall") return;
  assert.equal(r.targetDir, ".");
  assert.equal(r.dryRun, false);
});

test("parse: uninstall with flags", () => {
  const r = parse(["uninstall", "--target", "/tmp/x", "--dry-run"]);
  assert.equal(r.command, "uninstall");
  if (r.command !== "uninstall") return;
  assert.equal(r.targetDir, "/tmp/x");
  assert.equal(r.dryRun, true);
});

test("parse: update with defaults", () => {
  const r = parse(["update"]);
  assert.equal(r.command, "update");
  if (r.command !== "update") return;
  assert.equal(r.intensity, "lite");
  assert.equal(r.targetDir, ".");
  assert.equal(r.dryRun, false);
});

test("parse: update with intensity", () => {
  const r = parse(["update", "--intensity", "ultra", "--merge"]);
  assert.equal(r.command, "update");
  if (r.command !== "update") return;
  assert.equal(r.intensity, "ultra");
  assert.equal(r.merge, true);
});

test("parse: accepts adhd intensity", () => {
  const r = parse(["init", "--intensity", "adhd"]);
  assert.equal(r.command, "init");
  if (r.command !== "init") return;
  assert.equal(r.intensity, "adhd");
});

test("parse: accepts accountant intensity", () => {
  const r = parse(["init", "--intensity", "accountant"]);
  assert.equal(r.command, "init");
  if (r.command !== "init") return;
  assert.equal(r.intensity, "accountant");
});

test("parse: personal scope defaults to Copilot home", () => {
  const r = parse(["init", "--scope", "personal"]);
  assert.equal(r.command, "init");
  if (r.command !== "init") return;
  assert.equal(r.scope, "personal");
  assert.match(r.targetDir, /\.copilot$/);
});

test("parse: token receipt and AGENTS compatibility are opt-in", () => {
  const defaults = parse(["init"]);
  assert.equal(defaults.command, "init");
  if (defaults.command !== "init") return;
  assert.equal(defaults.tokenReceipt, false);
  assert.equal(defaults.includeAgentsMd, false);

  const enabled = parse(["init", "--token-receipt", "--agents-md"]);
  assert.equal(enabled.command, "init");
  if (enabled.command !== "init") return;
  assert.equal(enabled.tokenReceipt, true);
  assert.equal(enabled.includeAgentsMd, true);
});

test("parse: update rejects --force", () => {
  assert.throws(() => parse(["update", "--force"]), /not needed with update/);
});
