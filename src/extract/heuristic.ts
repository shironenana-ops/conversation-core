import type { CoreExtractor, CoreItem, ConversationCore, ItemType, NormalizedConversation, Scope, Section } from "../types.js";

const rules: Array<{ marker: string; section: Section; type: ItemType; summary: string; scope: Scope[] }> = [
  { marker: "[continuity]", section: "interaction_patterns", type: "interaction_pattern", summary: "Connect rapid topic transitions instead of resetting the conversation.", scope: ["global"] },
  { marker: "[direct-correction]", section: "interaction_patterns", type: "interaction_pattern", summary: "Prefer direct, concise correction over excessive hedging.", scope: ["technical"] },
  { marker: "[callback:", section: "callbacks", type: "callback", summary: "Use the explicitly marked fictional callback only when its scope applies.", scope: ["casual"] },
  { marker: "[serious]", section: "tone_transitions", type: "tone_transition", summary: "When an exchange becomes serious, reduce humor and acknowledge the serious content.", scope: ["global"] },
  { marker: "[boundary:formal]", section: "boundaries", type: "boundary", summary: "Do not use casual humor or callbacks in formal work output.", scope: ["work"] },
  { marker: "[repair:natural]", section: "repair_preferences", type: "repair_preference", summary: "Accept corrections in natural language and confirm the resulting change.", scope: ["global"] }
];

export class HeuristicExtractor implements CoreExtractor {
  async extract(input: NormalizedConversation): Promise<ConversationCore> {
    const at = input.messages[0]?.timestamp ?? new Date(0).toISOString();
    const core: ConversationCore = {
      schema_version: "0.1.0", core_id: `${input.conversation_id}-core`, participants: input.participants,
      interaction_patterns: [], callbacks: [], tone_transitions: [], boundaries: [], repair_preferences: [],
      metadata: { source_conversation_ids: [input.conversation_id], generated_at: at, generator: "conversation-core/heuristic-v0.1" }
    };
    for (const rule of rules) {
      const matches = input.messages.filter((message) => message.text.toLowerCase().includes(rule.marker));
      if (!matches.length) continue;
      const conflicting = matches.some((m) => m.text.toLowerCase().includes("[conflict]"));
      const item: CoreItem = {
        id: `${rule.type}-${String(core[rule.section].length + 1).padStart(3, "0")}`,
        type: rule.type, summary: rule.summary, scope: rule.scope,
        status: matches.length >= 2 && !conflicting ? "active" : "candidate",
        confidence: conflicting ? 0.4 : matches.length >= 2 ? 0.85 : 0.55,
        sensitivity: "low",
        provenance: [{ conversation_id: input.conversation_id, message_ids: matches.map((m) => m.id) }],
        created_at: at, updated_at: at
      };
      core[rule.section].push(item);
    }
    return core;
  }
}
