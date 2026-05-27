/**
 * Pi extension: workflow-based model switching
 *
 * Runtime context
 * ---------------
 * This file is a Pi (Pi Coding Agent) extension intended to run on a Raspberry Pi
 * acting as a persistent background agent. "Pi" here refers to
 * `@earendil-works/pi-coding-agent` — a long-running coding-agent host that
 * loads extensions like this one and dispatches lifecycle events. It is not a
 * Claude Code hook and is not invoked by Claude Code directly; it is loaded by
 * the Pi runtime.
 *
 * What it does
 * ------------
 * Adds a `/mode <name>` slash command that swaps the active model to whatever
 * the `workflows.default.<name>` mapping in `~/.pi/agent/models.json` resolves
 * to. The workflows block lives alongside `providers` in the same file:
 *
 *   {
 *     "workflows": {
 *       "default": {
 *         "plan":   "analyze",
 *         "code":   "code",
 *         "review": "review",
 *         "write":  "write"
 *       }
 *     },
 *     "providers": { ... }
 *   }
 *
 * Pi ignores unknown top-level keys in `models.json` (typebox `Type.Object`
 * defaults to `additionalProperties: true`), so the `workflows` block is safe
 * to colocate without breaking schema validation.
 *
 * Commands
 * --------
 *   /mode             — show the current workflow profile and available modes
 *   /mode <name>      — switch the active model to workflows.default.<name>
 *
 * Mode resolution uses the *current model's* provider so the same workflow
 * config works across providers as long as the alias names exist there. If a
 * mode points at a model that the provider does not expose, the command
 * surfaces an error via `ctx.ui.notify` instead of silently no-op'ing.
 *
 * Default behavior (no mode set) is unchanged — the active alias is whatever
 * Pi resolved at startup or whatever the user picked via `/model`. The
 * extension only acts when `/mode` is invoked explicitly.
 *
 * Requirements
 * ------------
 *   • Node.js 18+ (uses `node:fs`, `node:path`, `node:os`).
 *   • The Pi runtime (`@earendil-works/pi-coding-agent`).
 *   • A `workflows` block in `~/.pi/agent/models.json` (see above).
 *
 * How to run
 * ----------
 * Drop this file in `~/.pi/agent/extensions/` (auto-discovered) and Pi loads
 * it on next start. `/reload` picks up edits without restarting.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MODELS_JSON = join(homedir(), ".pi", "agent", "models.json");
const PROFILE = "default";

type WorkflowMap = Record<string, string>;

function stripJsonComments(input: string): string {
  return input
    .replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*/g, (m) => (m[0] === '"' ? m : ""))
    .replace(/"(?:\\.|[^"\\])*"|,(\s*[}\]])/g, (m, tail) => tail ?? (m[0] === '"' ? m : ""));
}

function loadWorkflows(): WorkflowMap {
  try {
    if (!existsSync(MODELS_JSON)) return {};
    const raw = readFileSync(MODELS_JSON, "utf8");
    const parsed = JSON.parse(stripJsonComments(raw));
    const workflows = parsed?.workflows?.[PROFILE];
    if (!workflows || typeof workflows !== "object") return {};
    const out: WorkflowMap = {};
    for (const [mode, target] of Object.entries(workflows)) {
      if (typeof target === "string") out[mode] = target;
    }
    return out;
  } catch {
    return {};
  }
}

function formatModes(workflows: WorkflowMap): string {
  const entries = Object.entries(workflows);
  if (entries.length === 0) return "(no workflows configured)";
  return entries.map(([mode, target]) => `${mode} → ${target}`).join(", ");
}

export default function (pi: ExtensionAPI): void {
  pi.registerCommand("mode", {
    description: "Switch the active model via workflow alias (e.g. /mode plan)",
    getArgumentCompletions: (prefix: string) => {
      const workflows = loadWorkflows();
      const items = Object.keys(workflows).map((mode) => ({ value: mode, label: mode }));
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const workflows = loadWorkflows();
      const name = (args ?? "").trim();
      const current = ctx.model;

      if (!name) {
        const active = current ? `${current.provider}/${current.id}` : "(none)";
        ctx.ui.notify(
          `Profile: ${PROFILE}  •  Active: ${active}  •  Modes: ${formatModes(workflows)}`,
          "info",
        );
        return;
      }

      const target = workflows[name];
      if (!target) {
        ctx.ui.notify(
          `Unknown mode "${name}". Available: ${formatModes(workflows)}`,
          "error",
        );
        return;
      }

      if (!current) {
        ctx.ui.notify("No active model — cannot resolve provider for mode switch.", "error");
        return;
      }

      const next = ctx.modelRegistry.find(current.provider, target);
      if (!next) {
        ctx.ui.notify(
          `Mode "${name}" maps to "${target}", but no model with that id exists on provider "${current.provider}".`,
          "error",
        );
        return;
      }

      const ok = await pi.setModel(next);
      if (!ok) {
        ctx.ui.notify(`No API key available for ${next.provider}/${next.id}.`, "error");
        return;
      }

      ctx.ui.notify(`Mode: ${name} → using ${next.id} (${next.name})`, "info");
    },
  });
}
