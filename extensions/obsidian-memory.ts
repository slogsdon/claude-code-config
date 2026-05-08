/**
 * Pi extension: Obsidian-primary memory sync
 *
 * Runtime context
 * ---------------
 * This file is a Pi (Pi Coding Agent) extension intended to run on a Raspberry Pi
 * acting as a persistent background agent for the user's Obsidian vault. "Pi" here
 * refers to `@mariozechner/pi-coding-agent` — a long-running coding-agent host that
 * loads extensions like this one and dispatches lifecycle events. It is not a
 * Claude Code hook and is not invoked by Claude Code directly; it is loaded by the
 * Pi runtime on the Pi device.
 *
 * What it does
 * ------------
 * Treats the Obsidian vault note `Context/Memory/<project-name>/MEMORY.md` as the
 * source of truth for per-project memory and keeps two local mirrors in sync:
 *   • `<cwd>/MEMORY.md`                                 (in-tree convenience copy)
 *   • `~/.claude/projects/<cwd-key>/memory/MEMORY.md`   (Claude Code's local cache)
 *
 *   session_start    → vault note → both local mirrors (auto-creates the vault
 *                                    note from a template on first visit)
 *   tool_result      → in-tree MEMORY.md → vault note  (fires after writes from
 *                                                       `memory_learn` / `remember`)
 *   session_shutdown → in-tree MEMORY.md → vault note  (final flush)
 *
 * Each vault write is followed by an atomic `git add -A && git commit` inside the
 * vault repo so memory edits are versioned alongside the rest of the vault.
 *
 * Requirements
 * ------------
 *   • Node.js 18+ (uses `node:fs`, `node:os`, `node:path`, `node:child_process`).
 *   • The Pi runtime (`@mariozechner/pi-coding-agent`) installed on the device.
 *   • The Obsidian iCloud vault present at the hardcoded VAULT path below — i.e.
 *     `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal`. On the Pi
 *     this implies iCloud-Drive sync (or an equivalent mount) is configured. Adjust
 *     `VAULT` if your vault lives elsewhere.
 *   • `git` on PATH; the vault directory must already be a git repo for commits to
 *     succeed (failures are swallowed silently — see `commitVault`).
 *
 * How to run
 * ----------
 * Register this file as an extension with the Pi runtime per Pi's extension docs
 * (typically a `pi.config.ts` / extensions directory pointer). The runtime calls
 * the default export with its `ExtensionAPI` and this module wires up the three
 * lifecycle handlers above. There is no standalone CLI entry point.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { execSync } from "node:child_process";

const HOME = homedir();
const VAULT = join(HOME, "Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal");

const MEMORY_TOOLS = new Set(["memory_learn", "remember"]);

function vaultNotePath(cwd: string): string {
  return join(VAULT, "Context", "Memory", basename(cwd), "MEMORY.md");
}

function projectMemoryPath(cwd: string): string {
  return join(cwd, "MEMORY.md");
}

function claudeCachePath(cwd: string): string {
  const key = cwd.replace(/\//g, "-");
  return join(HOME, ".claude", "projects", key, "memory", "MEMORY.md");
}

function template(cwd: string): string {
  const name = basename(cwd);
  const key = cwd.replace(/\//g, "-");
  return [
    `# Memory — ${name}`,
    "",
    `> Synced to \`~/.claude/projects/${key}/memory/MEMORY.md\` at each session start.`,
    "> To add: `obsidian append` a new `##` section + update the Index. To update/delete: use Write tool directly on this file.",
    "",
    "## Index",
    "",
    "_No memories yet._",
  ].join("\n");
}

function commitVault(message: string): void {
  try {
    execSync(`git -C "${VAULT}" add -A && git -C "${VAULT}" commit -m "${message}"`, {
      shell: "/bin/bash",
      stdio: "ignore",
    });
  } catch {
    // ignore — nothing to commit or git unavailable
  }
}

function syncToLocal(cwd: string): void {
  try {
    const vaultFile = vaultNotePath(cwd);

    if (!existsSync(vaultFile)) {
      mkdirSync(dirname(vaultFile), { recursive: true });
      writeFileSync(vaultFile, template(cwd));
      commitVault(`feat: init memory note for ${basename(cwd)}`);
    }

    const content = readFileSync(vaultFile, "utf8");
    writeFileSync(projectMemoryPath(cwd), content);

    const cachePath = claudeCachePath(cwd);
    mkdirSync(dirname(cachePath), { recursive: true });
    writeFileSync(cachePath, content);
  } catch {
    // fail silently — never break a session start
  }
}

function syncToVault(cwd: string): void {
  try {
    const projectFile = projectMemoryPath(cwd);
    if (!existsSync(projectFile)) return;

    const content = readFileSync(projectFile, "utf8");
    const vaultFile = vaultNotePath(cwd);
    mkdirSync(dirname(vaultFile), { recursive: true });
    writeFileSync(vaultFile, content);
    commitVault(`docs: update memory for ${basename(cwd)}`);
  } catch {
    // fail silently
  }
}

export default function (pi: ExtensionAPI): void {
  let sessionCwd = process.cwd();

  pi.on("session_start", (_event, ctx) => {
    sessionCwd = ctx.cwd;
    syncToLocal(sessionCwd);
  });

  pi.on("tool_result", (event, ctx) => {
    if (MEMORY_TOOLS.has(event.toolName)) {
      sessionCwd = ctx.cwd;
      syncToVault(sessionCwd);
    }
  });

  pi.on("session_shutdown", (_event, ctx) => {
    syncToVault(ctx.cwd ?? sessionCwd);
  });
}
