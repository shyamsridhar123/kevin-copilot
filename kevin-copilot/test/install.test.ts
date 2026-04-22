import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import { resolveInside } from "../src/fs";
import { install } from "../src/install";
import { mergeContent, BEGIN_MARKER, END_MARKER } from "../src/conflict";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "kevin-copilot-"));
}

async function rmDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
}

test("resolveInside: rejects directory traversal", () => {
  assert.throws(() => resolveInside("/tmp/target", "../../etc/passwd"), /outside target/);
});

test("resolveInside: rejects absolute paths", () => {
  assert.throws(() => resolveInside("/tmp/target", "/etc/passwd"), /outside target/);
});

test("resolveInside: accepts valid relative path", () => {
  const r = resolveInside("/tmp/target", ".github/copilot-instructions.md");
  assert.ok(r.endsWith(path.join(".github", "copilot-instructions.md")));
});

test("install: writes 8 files into empty dir", async () => {
  const dir = await mkTmp();
  try {
    const r = await install({
      targetDir: dir,
      intensity: "lite",
      force: false,
      merge: false,
      dryRun: false,
      log: () => {},
    });
    assert.equal(r.written.length, 8);
    for (const rel of r.written) {
      const stat = await fs.stat(path.join(dir, rel));
      assert.ok(stat.isFile());
    }
  } finally {
    await rmDir(dir);
  }
});

test("install: idempotent second run reports all unchanged", async () => {
  const dir = await mkTmp();
  try {
    await install({ targetDir: dir, intensity: "lite", force: false, merge: false, dryRun: false, log: () => {} });
    const r = await install({ targetDir: dir, intensity: "lite", force: false, merge: false, dryRun: false, log: () => {} });
    assert.equal(r.unchanged.length, 8);
    assert.equal(r.written.length, 0);
    assert.equal(r.skipped.length, 0);
  } finally {
    await rmDir(dir);
  }
});

test("install: dry-run touches nothing", async () => {
  const dir = await mkTmp();
  try {
    const r = await install({ targetDir: dir, intensity: "lite", force: false, merge: false, dryRun: true, log: () => {} });
    assert.equal(r.planned.length, 8);
    const entries = await fs.readdir(dir);
    assert.equal(entries.length, 0);
  } finally {
    await rmDir(dir);
  }
});

test("install: conflict + skip leaves existing file alone", async () => {
  const dir = await mkTmp();
  try {
    const target = path.join(dir, "AGENTS.md");
    await fs.writeFile(target, "existing content\n", "utf8");
    const r = await install({
      targetDir: dir,
      intensity: "lite",
      force: false,
      merge: false,
      dryRun: false,
      log: () => {},
      resolveConflict: async () => "skip",
    });
    assert.ok(r.skipped.includes("AGENTS.md"));
    const after = await fs.readFile(target, "utf8");
    assert.equal(after, "existing content\n");
  } finally {
    await rmDir(dir);
  }
});

test("install: --force overwrites conflicting file", async () => {
  const dir = await mkTmp();
  try {
    const target = path.join(dir, "AGENTS.md");
    await fs.writeFile(target, "old content\n", "utf8");
    const r = await install({
      targetDir: dir,
      intensity: "lite",
      force: true,
      merge: false,
      dryRun: false,
      log: () => {},
    });
    assert.ok(r.written.includes("AGENTS.md"));
    const after = await fs.readFile(target, "utf8");
    assert.notEqual(after, "old content\n");
    assert.ok(after.length > 10);
  } finally {
    await rmDir(dir);
  }
});

test("install: --merge wraps Kevin section in sentinels and is idempotent", async () => {
  const dir = await mkTmp();
  try {
    const target = path.join(dir, "AGENTS.md");
    await fs.writeFile(target, "# Project AGENTS\n\nExisting team rules.\n", "utf8");

    const r1 = await install({
      targetDir: dir,
      intensity: "lite",
      force: false,
      merge: true,
      dryRun: false,
      log: () => {},
    });
    assert.ok(r1.merged.includes("AGENTS.md"));

    const after1 = await fs.readFile(target, "utf8");
    assert.ok(after1.includes(BEGIN_MARKER));
    assert.ok(after1.includes(END_MARKER));
    assert.ok(after1.startsWith("# Project AGENTS"));

    // Re-merge should not produce a second block.
    const r2 = await install({
      targetDir: dir,
      intensity: "lite",
      force: false,
      merge: true,
      dryRun: false,
      log: () => {},
    });
    assert.ok(r2.merged.includes("AGENTS.md") || r2.unchanged.includes("AGENTS.md"));

    const after2 = await fs.readFile(target, "utf8");
    const beginCount = (after2.match(new RegExp(BEGIN_MARKER, "g")) ?? []).length;
    const endCount = (after2.match(new RegExp(END_MARKER, "g")) ?? []).length;
    assert.equal(beginCount, 1);
    assert.equal(endCount, 1);
  } finally {
    await rmDir(dir);
  }
});

test("mergeContent: replaces existing sentinel block", () => {
  const existing = `head\n${BEGIN_MARKER}\nold kevin\n${END_MARKER}\ntail\n`;
  const merged = mergeContent(existing, "new kevin");
  assert.ok(merged.includes("new kevin"));
  assert.ok(!merged.includes("old kevin"));
  assert.ok(merged.includes("head"));
  assert.ok(merged.includes("tail"));
});
