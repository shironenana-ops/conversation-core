import { sections, type ConversationCore, type CoreItem, type Scope } from "../types.js";

export const targets = ["generic-markdown", "chatgpt-custom-instructions", "claude-project-instructions", "gemini-gem-instructions", "local-system-prompt"] as const;
export type Target = (typeof targets)[number];
const titles: Record<Target, string> = {
  "generic-markdown": "Portable Conversation Core", "chatgpt-custom-instructions": "ChatGPT Custom Instructions",
  "claude-project-instructions": "Claude Project Instructions", "gemini-gem-instructions": "Gemini Gem Instructions",
  "local-system-prompt": "Local System Prompt Context"
};
const label: Record<string, string> = {
  interaction_patterns: "Interaction patterns", callbacks: "Contextual callbacks", tone_transitions: "Tone transitions",
  boundaries: "Boundaries", repair_preferences: "Repair preferences"
};

function line(item: CoreItem) { return `- ${item.summary} (confidence: ${item.confidence.toFixed(2)}; scope: ${item.scope.join(", ")})`; }
export function exportMarkdown(core: ConversationCore, target: Target, scope: Scope = "global"): string {
  const out = [`# ${titles[target]}`, "", "> Experimental, human-reviewed context. Behavior is not guaranteed across AI systems.", ""];
  for (const section of sections) {
    const established = core[section].filter((i) => i.status === "active" && (i.scope.includes("global") || i.scope.includes(scope)));
    const tentative = core[section].filter((i) => i.status === "candidate" && (i.scope.includes("global") || i.scope.includes(scope)));
    if (established.length) out.push(`## ${label[section]}`, "", ...established.map(line), "");
    if (tentative.length) out.push(`## Tentative ${label[section].toLowerCase()}`, "", ...tentative.map(line), "");
  }
  const excluded = sections.flatMap((section) => core[section]).filter((i) => i.status === "active" && !i.scope.includes("global") && !i.scope.includes(scope));
  if (excluded.length) out.push("## Excluded from current scope", "", ...excluded.map((i) => `- ${i.id} (${i.scope.join(", ")})`), "");
  return `${out.join("\n").trim()}\n`;
}
