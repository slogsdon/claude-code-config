/**
 * Pi extension: Obsidian-primary memory sync
 *
 * session_start  → vault note → MEMORY.md (project root + Claude cache)
 * tool_result    → MEMORY.md  → vault note  (after memory_learn writes)
 * session_shutdown → MEMORY.md → vault note  (final flush)
 *
 * Vault note path: Context/Memory/<project-name>/MEMORY.md
 * Auto-creates the vault note on first visit.
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
