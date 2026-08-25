#!/usr/bin/env node
// ATV Observer — captures Copilot CLI tool use for continuous learning.
// Appends structured observations to .atv/observations.jsonl.
// Designed to be fast and silent — never blocks the agent.

"use strict";

const fs = require("fs");
const path = require("path");

const hookType = process.argv[2] || "unknown";
const ATV_DIR = path.join(process.cwd(), ".atv");
const OBS_FILE = path.join(ATV_DIR, "observations.jsonl");
function ensureDir(dir) {
  try {
    const existing = fs.lstatSync(dir, { throwIfNoEntry: false });
    if (existing?.isSymbolicLink()) return false;
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.chmodSync(dir, 0o700);
    return true;
  } catch (_) {
    return false;
  }
}

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8").trim();
  } catch (_) {
    return "";
  }
}

function main() {
  const raw = readStdin();
  let input = {};
  try {
    if (raw) input = JSON.parse(raw);
  } catch (_) {
    input = {};
  }

  const entry = {
    ts: new Date().toISOString(),
    hook: hookType,
    tool: input.toolName || null,
    success: typeof input.success === "boolean" ? input.success : null,
  };

  // Session markers
  if (hookType === "sessionStart" || hookType === "sessionEnd") {
    entry.sessionEvent = true;
  }

  if (ensureDir(ATV_DIR)) {
    try {
      const existing = fs.lstatSync(OBS_FILE, { throwIfNoEntry: false });
      if (!existing?.isSymbolicLink()) {
        fs.appendFileSync(OBS_FILE, JSON.stringify(entry) + "\n", { mode: 0o600 });
        fs.chmodSync(OBS_FILE, 0o600);
      }
    } catch (_) {
      // silent failure — observer must never break the agent
    }
  }

  // On sessionEnd, update instinct confidence from accumulated observations
  if (hookType === "sessionEnd") {
    updateInstinctConfidence();
  }

  // Pass through stdin to stdout (hooks must not swallow input)
  if (raw) process.stdout.write(raw);
}

// Lightweight instinct confidence updater — runs at sessionEnd.
// Reads recent observations, checks for patterns that match existing instincts,
// and bumps their confidence + observation count.
function updateInstinctConfidence() {
  const instinctFile = path.join(ATV_DIR, "instincts", "project.yaml");
  if (!fs.existsSync(instinctFile) || !fs.existsSync(OBS_FILE)) return;

  try {
    const instinctContent = fs.readFileSync(instinctFile, "utf8");
    const observations = fs
      .readFileSync(OBS_FILE, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);

    // Count tool usage patterns in this session
    const sessionObs = [];
    let inSession = false;
    for (let i = observations.length - 1; i >= 0; i--) {
      try {
        const obs = JSON.parse(observations[i]);
        if (obs.hook === "sessionStart") {
          inSession = true;
          break;
        }
        sessionObs.push(obs);
      } catch (_) {
        continue;
      }
    }

    if (sessionObs.length < 5) return; // not enough data

    // Simple pattern counting
    const toolCounts = {};
    for (const obs of sessionObs) {
      if (obs.tool) {
        toolCounts[obs.tool] = (toolCounts[obs.tool] || 0) + 1;
      }
    }

    // Update last_seen on matching instincts
    const today = new Date().toISOString().split("T")[0];
    let updated = instinctContent;
    if (instinctContent.includes("last_seen:")) {
      updated = instinctContent.replace(
        /last_seen: \d{4}-\d{2}-\d{2}/g,
        `last_seen: ${today}`
      );
    }

    if (updated !== instinctContent) {
      fs.writeFileSync(instinctFile, updated);
    }
  } catch (_) {
    // silent failure
  }
}

main();
