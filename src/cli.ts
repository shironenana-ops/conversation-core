#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { HeuristicExtractor } from "./extract/heuristic.js";
import { exportMarkdown, targets, type Target } from "./export/markdown.js";
import { findItem, setConfidence, setScope, setStatus } from "./review/index.js";
import type { ConversationCore, NormalizedConversation, Scope, Status } from "./types.js";
import { validateCore } from "./validate/index.js";

const [command, file, arg] = process.argv.slice(2);
const readJson = async <T>(path: string) => JSON.parse(await readFile(resolve(path), "utf8")) as T;
const usage = () => console.error("Usage: conversation-core <extract|inspect|activate|retract|archive|set-scope|set-confidence|export|validate> <file> [item-id]");

async function main() {
  if (!command || !file) { usage(); process.exitCode = 1; return; }
  if (command === "extract") {
    const input = await readJson<NormalizedConversation>(file);
    const outputFlag = process.argv.indexOf("--output");
    const output = outputFlag >= 0 ? process.argv[outputFlag + 1] : "conversation_core.json";
    await writeFile(resolve(output), `${JSON.stringify(await new HeuristicExtractor().extract(input), null, 2)}\n`);
    console.log(output); return;
  }
  const core = await readJson<ConversationCore>(file);
  if (command === "inspect") { console.log(JSON.stringify(arg ? findItem(core, arg) : core, null, 2)); return; }
  if (["activate", "retract", "archive"].includes(command)) {
    if (!arg) throw new Error("Missing item id");
    setStatus(core, arg, ({ activate: "active", retract: "retracted", archive: "archived" } as Record<string, Status>)[command]);
    await writeFile(resolve(file), `${JSON.stringify(core, null, 2)}\n`); return;
  }
  if (command === "set-scope" || command === "set-confidence") {
    const value = process.argv[5]; if (!arg || value === undefined) throw new Error("Missing item id or value");
    if (command === "set-scope") setScope(core, arg, value as Scope);
    else { const n = Number(value); if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error("Confidence must be between 0 and 1"); setConfidence(core, arg, n); }
    await writeFile(resolve(file), `${JSON.stringify(core, null, 2)}\n`); return;
  }
  if (command === "export") {
    const targetFlag = process.argv.indexOf("--target"); const target = process.argv[targetFlag + 1] as Target;
    if (!targets.includes(target)) throw new Error(`Unknown target: ${target}`);
    const scopeFlag = process.argv.indexOf("--scope"); const scope = scopeFlag >= 0 ? process.argv[scopeFlag + 1] as Scope : "global";
    process.stdout.write(exportMarkdown(core, target, scope)); return;
  }
  if (command === "validate") {
    const result = await validateCore(core); console.log(result.valid ? "valid" : result.errors.join("\n")); process.exitCode = result.valid ? 0 : 1; return;
  }
  usage(); process.exitCode = 1;
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
