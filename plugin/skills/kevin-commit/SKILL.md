---
name: kevin-commit
description: Generate a terse Conventional Commits message from the staged diff.
argument-hint: "[optional focus]"
---

Read the staged diff. Output one Conventional Commits line with an imperative summary under 60 characters. Never invent changes. Output `no staged changes` when the diff is empty.
